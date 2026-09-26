#!/usr/bin/env python3
"""Truck logistics, weighbridges, tipping bays and storage areas.

Equations:
  trucks/day        = ceil(TPD / payload)
  peak trucks/h     = trucks/day * peak_hour_share
  weighbridges      = ceil(peak/h / weighings_per_h) for IN and for OUT (+1 redundancy total)
  tipping bays      = ceil(peak/h * unload_min / 60 * margin)
  storage mass      = TPD_receipt * days
  storage volume    = mass*1000 / (rho * fill)
  plan area (bunker)= volume / usable height
  pile area         = volume / (pile height * shape factor) * (1 + aisle allowance)
"""
import argparse
import json
import math
import sys


def trucks(tpd, payload_t, peak_share=0.15, unload_min=8.0, weighings_per_h=25.0, bay_margin=1.3):
    per_day = math.ceil(tpd / payload_t)
    peak_h = per_day * peak_share
    wb = math.ceil(peak_h / weighings_per_h)
    bays = math.ceil(peak_h * unload_min / 60.0 * bay_margin)
    return {"trucks_per_day": per_day, "peak_trucks_per_h": peak_h,
            "weighbridges_in": wb, "weighbridges_out": wb,
            "weighbridges_total_with_redundancy": 2 * wb + 1, "tipping_bays": max(bays, 2)}


def storage(mass_t, density_kgm3, height_m, fill=1.0, shape=1.0, aisle=0.0):
    vol = mass_t * 1000.0 / (density_kgm3 * fill)
    area = vol / (height_m * shape) * (1.0 + aisle)
    return {"mass_t": mass_t, "volume_m3": vol, "area_m2": area}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tpd", type=float, required=True, help="t/d received")
    ap.add_argument("--payload", type=float, default=10.0, help="t per truck")
    ap.add_argument("--peak-share", type=float, default=0.15, help="share of daily trucks in peak hour")
    ap.add_argument("--unload-min", type=float, default=8.0)
    ap.add_argument("--days", type=float, default=2.0, help="storage days")
    ap.add_argument("--density", type=float, default=400.0, help="kg/m3 stored")
    ap.add_argument("--height", type=float, default=12.0, help="usable storage height m")
    ap.add_argument("--fill", type=float, default=0.9)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    res = trucks(a.tpd, a.payload, a.peak_share, a.unload_min)
    res.update({f"storage_{k}": v for k, v in storage(a.tpd * a.days, a.density, a.height, a.fill).items()})
    if a.json:
        print(json.dumps(res, indent=2))
    else:
        for k, v in res.items():
            print(f"{k:<36} {v:,.1f}" if isinstance(v, float) else f"{k:<36} {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
