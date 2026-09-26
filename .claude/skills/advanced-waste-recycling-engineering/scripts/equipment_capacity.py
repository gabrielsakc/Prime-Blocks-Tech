#!/usr/bin/env python3
"""Conceptual equipment sizing (SI units). Equations documented in
references/equipment-sizing.md. Results are CONCEPTUAL — confirm with OEM [OEM]/tests [TEST].

Subcommands:
  design    design capacity from t/d, hours, peak factor, availability
  belt      belt conveyor capacity (flat/troughed/burden) and drive power
  screw     screw conveyor capacity
  hopper    hopper / bunker / silo volume
  crane     bunker grab crane throughput and number of cranes
  trommel   trommel critical speed and required screen area
  motor     motor power from specific energy (shredders, crushers, mills)
"""
import argparse
import json
import math
import sys

G = 9.81


def design_capacity(tpd, hours_per_day, peak_factor=1.15, availability=0.90):
    """Q_avg = TPD/H ; Q_des = Q_avg * F_peak / A_mech   [t/h]"""
    if hours_per_day <= 0 or not (0 < availability <= 1):
        raise ValueError("hours_per_day > 0 and 0 < availability <= 1 required")
    q_avg = tpd / hours_per_day
    return {"q_avg_tph": q_avg, "q_design_tph": q_avg * peak_factor / availability,
            "peak_factor": peak_factor, "availability": availability}


def belt_capacity(width_m, speed_mps, density_kgm3, mode="flat", surcharge_deg=20.0,
                  k_area=None, burden_m=None, k_incl=1.0):
    """Flat: b = 0.9B-0.05, A = b^2 tan(beta)/4 ; troughed: A = k_A b^2 ;
    burden (sorting belt): A = b * h ; Q_v = 3600 A v k_incl [m3/h] ; Q_m = Q_v rho/1000 [t/h]"""
    b = 0.9 * width_m - 0.05
    if b <= 0:
        raise ValueError("belt too narrow")
    if mode == "flat":
        area = b * b * math.tan(math.radians(surcharge_deg)) / 4.0
    elif mode == "troughed":
        area = (k_area if k_area is not None else 0.13) * b * b
    elif mode == "burden":
        if burden_m is None:
            raise ValueError("burden mode needs burden_m")
        area = b * burden_m
    else:
        raise ValueError("mode must be flat|troughed|burden")
    qv = 3600.0 * area * speed_mps * k_incl
    return {"usable_width_m": b, "area_m2": area, "q_vol_m3h": qv, "q_mass_tph": qv * density_kgm3 / 1000.0}


def belt_speed_for(q_tph, width_m, density_kgm3, **kw):
    """Speed needed to convey q_tph (inverse of belt_capacity, linear in v)."""
    per_unit = belt_capacity(width_m, 1.0, density_kgm3, **kw)["q_mass_tph"]
    return q_tph / per_unit


def belt_power(q_tph, speed_mps, length_m, lift_m, C=2.0, f=0.025, m_idlers=15.0,
               m_belt=15.0, eta=0.90, margin=1.2):
    """DIN 22101 simplified: m'_L = Q*1000/(3600 v); F = C f L g (m'_R + 2 m'_G + m'_L) + g m'_L H;
    P = F v /(eta 1000); motor = P * margin"""
    m_load = q_tph * 1000.0 / (3600.0 * speed_mps)
    F = C * f * length_m * G * (m_idlers + 2 * m_belt + m_load) + G * m_load * lift_m
    p = F * speed_mps / (eta * 1000.0)
    return {"m_load_kg_per_m": m_load, "F_U_N": F, "shaft_kW": p, "motor_kW": p * margin}


def screw_capacity(D, pitch, rpm, fill, density_kgm3, shaft_d=0.0):
    """Q = 60 (pi/4)(D^2 - d^2) S n phi rho /1000   [t/h]"""
    return 60.0 * math.pi / 4.0 * (D * D - shaft_d * shaft_d) * pitch * rpm * fill * density_kgm3 / 1000.0


def storage_volume(mass_t, density_kgm3, fill=0.85):
    """V = m / (rho * f_fill)   [m3]"""
    return mass_t * 1000.0 / (density_kgm3 * fill)


def crane(q_design_tph, grab_m3, density_kgm3, cycle_s=90.0, grab_fill=0.8, duty=0.75):
    """cycles/h = 3600/t_cycle ; Q_crane = cycles/h * V_grab * rho * fill /1000 * duty ;
    n_duty = ceil(Q_des / Q_crane), install n_duty + 1 (standby)"""
    q_one = 3600.0 / cycle_s * grab_m3 * density_kgm3 * grab_fill / 1000.0 * duty
    n = math.ceil(q_design_tph / q_one)
    return {"q_per_crane_tph": q_one, "n_duty": n, "n_installed": n + 1}


def trommel(q_design_tph, diameter_m, spec_load_tph_m2=0.6, speed_fraction=0.35, l_over_d_max=5.0):
    """n_c = 42.3/sqrt(D) rpm ; n = frac * n_c ; A = Q/q_spec ; L = A/(pi D) ; units = ceil(L/(L/D_max * D))"""
    nc = 42.3 / math.sqrt(diameter_m)
    area = q_design_tph / spec_load_tph_m2
    length = area / (math.pi * diameter_m)
    lmax = l_over_d_max * diameter_m
    units = max(1, math.ceil(length / lmax))
    return {"critical_rpm": nc, "operating_rpm": nc * speed_fraction, "screen_area_m2": area,
            "total_screen_length_m": length, "units_required": units,
            "screen_length_per_unit_m": length / units}


def motor_power(q_design_tph, sec_kwh_t, load_factor=0.8):
    """P_motor = SEC * Q_des / LF   [kW]"""
    return sec_kwh_t * q_design_tph / load_factor


def _out(res, as_json):
    if as_json:
        print(json.dumps(res, indent=2))
    else:
        for k, v in res.items():
            print(f"{k:<28} {v:.3f}" if isinstance(v, float) else f"{k:<28} {v}")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("design"); p.add_argument("--tpd", type=float, required=True)
    p.add_argument("--hours", type=float, required=True); p.add_argument("--peak", type=float, default=1.15)
    p.add_argument("--availability", type=float, default=0.90)

    p = sub.add_parser("belt"); p.add_argument("--width", type=float, required=True)
    p.add_argument("--speed", type=float, required=True); p.add_argument("--density", type=float, required=True)
    p.add_argument("--mode", default="flat", choices=["flat", "troughed", "burden"])
    p.add_argument("--surcharge", type=float, default=20.0); p.add_argument("--k-area", type=float)
    p.add_argument("--burden", type=float); p.add_argument("--k-incl", type=float, default=1.0)
    p.add_argument("--length", type=float, help="for power calc"); p.add_argument("--lift", type=float, default=0.0)

    p = sub.add_parser("screw"); p.add_argument("--D", type=float, required=True)
    p.add_argument("--pitch", type=float, required=True); p.add_argument("--rpm", type=float, required=True)
    p.add_argument("--fill", type=float, default=0.30); p.add_argument("--density", type=float, required=True)
    p.add_argument("--shaft", type=float, default=0.0)

    p = sub.add_parser("hopper"); p.add_argument("--mass-t", type=float, required=True)
    p.add_argument("--density", type=float, required=True); p.add_argument("--fill", type=float, default=0.85)
    p.add_argument("--height", type=float, help="usable storage height m -> plan area")

    p = sub.add_parser("crane"); p.add_argument("--q", type=float, required=True)
    p.add_argument("--grab", type=float, required=True); p.add_argument("--density", type=float, required=True)
    p.add_argument("--cycle", type=float, default=90.0); p.add_argument("--duty", type=float, default=0.75)

    p = sub.add_parser("trommel"); p.add_argument("--q", type=float, required=True)
    p.add_argument("--D", type=float, required=True); p.add_argument("--spec-load", type=float, default=0.6)

    p = sub.add_parser("motor"); p.add_argument("--q", type=float, required=True)
    p.add_argument("--sec", type=float, required=True); p.add_argument("--lf", type=float, default=0.8)

    a = ap.parse_args(argv)
    if a.cmd == "design":
        res = design_capacity(a.tpd, a.hours, a.peak, a.availability)
    elif a.cmd == "belt":
        res = belt_capacity(a.width, a.speed, a.density, a.mode, a.surcharge, a.k_area, a.burden, a.k_incl)
        if a.length:
            res.update(belt_power(res["q_mass_tph"], a.speed, a.length, a.lift))
    elif a.cmd == "screw":
        res = {"q_tph": screw_capacity(a.D, a.pitch, a.rpm, a.fill, a.density, a.shaft)}
    elif a.cmd == "hopper":
        v = storage_volume(a.mass_t, a.density, a.fill)
        res = {"volume_m3": v}
        if a.height:
            res["plan_area_m2"] = v / a.height
    elif a.cmd == "crane":
        res = crane(a.q, a.grab, a.density, a.cycle, duty=a.duty)
    elif a.cmd == "trommel":
        res = trommel(a.q, a.D, a.spec_load)
    elif a.cmd == "motor":
        res = {"motor_kW": motor_power(a.q, a.sec, a.lf)}
    _out(res, a.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
