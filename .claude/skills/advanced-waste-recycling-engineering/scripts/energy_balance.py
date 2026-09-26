#!/usr/bin/env python3
"""Electrical load list -> connected, operating and peak load, kWh/t, transformer sizing.

CSV columns (header required; see templates/electrical-load-list.csv):
  tag, description, kw, qty, standby_qty, load_factor, diversity_factor, voltage, hours_per_day, starting
  kw            installed kW per unit
  qty           units in duty ; standby_qty units installed as standby (not in operating load)
Equations:
  Connected (duty)    = sum(kw*qty)            ; Installed = sum(kw*(qty+standby))
  Operating           = sum(kw*qty*LF*DF)
  Energy (kWh/d)      = sum(kw*qty*LF*DF*hours)
  Peak demand         = Operating * peak_factor + 0.3 * (start_mult - 1) * largest DOL/Y-D motor kW
                        (VFD / soft-starter motors add no starting term; 0.3 ~ kW share of start kVA)
  kWh/t               = kWh/d / TPD
  FLA (3ph)           = kW*1000 / (sqrt(3) * V * eta * PF)
  Transformer kVA     = Peak kW / PF / loading -> next standard size
"""
import argparse
import csv
import json
import math
import sys

STD_KVA = [500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000]


def fla(kw, voltage, eta=0.94, pf=0.85):
    return kw * 1000.0 / (math.sqrt(3) * voltage * eta * pf)


def load_rows(path):
    with open(path, newline="") as fh:
        rows = []
        for r in csv.DictReader(fh):
            if not r.get("tag") or r["tag"].startswith("#"):
                continue
            rows.append({
                "tag": r["tag"], "description": r.get("description", ""),
                "kw": float(r["kw"]), "qty": int(float(r.get("qty") or 1)),
                "standby_qty": int(float(r.get("standby_qty") or 0)),
                "load_factor": float(r.get("load_factor") or 0.75),
                "diversity_factor": float(r.get("diversity_factor") or 1.0),
                "voltage": float(r.get("voltage") or 400),
                "hours_per_day": float(r.get("hours_per_day") or 16),
                "starting": (r.get("starting") or "VFD").upper(),
            })
        return rows


def analyze(rows, tpd=None, pf=0.85, peak_factor=1.15, trafo_loading=0.8, start_mult=6.0):
    connected = sum(r["kw"] * r["qty"] for r in rows)
    installed = sum(r["kw"] * (r["qty"] + r["standby_qty"]) for r in rows)
    operating = sum(r["kw"] * r["qty"] * r["load_factor"] * r["diversity_factor"] for r in rows)
    energy = sum(r["kw"] * r["qty"] * r["load_factor"] * r["diversity_factor"] * r["hours_per_day"] for r in rows)
    dol = [r["kw"] for r in rows if r["starting"] in ("DOL", "Y-D", "YD", "STAR-DELTA")]
    start_add = (max(dol) * (start_mult - 1) * 0.3) if dol else 0.0
    peak = operating * peak_factor + start_add
    kva_req = peak / pf / trafo_loading
    def pick(kva):
        return next((s for s in STD_KVA if s >= kva), None)

    full, half = pick(kva_req), pick(kva_req / 2)
    res = {
        "connected_kW": connected, "installed_incl_standby_kW": installed,
        "operating_kW": operating, "peak_kW": peak, "energy_kWh_per_day": energy,
        "required_kVA": kva_req,
        "transformers_N+1": f"2 x {full} kVA (either one carries the full load)" if full
                            else "> 5000 kVA: split into several substations (MV distribution study)",
        "transformers_2x50": f"2 x {half} kVA (no redundancy; load shedding on single trafo)" if half
                             else "> 2 x 5000 kVA: MV distribution study required",
    }
    if tpd:
        res["specific_kWh_per_t"] = energy / tpd
    return res


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("loadlist", help="CSV load list")
    ap.add_argument("--tpd", type=float, help="t/d processed, for kWh/t")
    ap.add_argument("--pf", type=float, default=0.85)
    ap.add_argument("--peak-factor", type=float, default=1.15)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    rows = load_rows(a.loadlist)
    res = analyze(rows, a.tpd, a.pf, a.peak_factor)
    if a.json:
        print(json.dumps(res, indent=2)); return 0
    print(f"{'Tag':<12}{'kW':>8}{'Qty':>5}{'Stby':>5}{'LF':>6}{'DF':>6}{'Op kW':>10}{'FLA A':>9}  Start")
    for r in rows:
        op = r["kw"] * r["qty"] * r["load_factor"] * r["diversity_factor"]
        print(f"{r['tag']:<12}{r['kw']:>8.1f}{r['qty']:>5}{r['standby_qty']:>5}{r['load_factor']:>6.2f}"
              f"{r['diversity_factor']:>6.2f}{op:>10.1f}{fla(r['kw'], r['voltage']):>9.1f}  {r['starting']}")
    print()
    for k, v in res.items():
        print(f"{k:<28} {v:,.1f}" if isinstance(v, float) else f"{k:<28} {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
