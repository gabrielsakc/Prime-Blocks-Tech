#!/usr/bin/env python3
"""Annual OPEX model -> $/y, $/t processed, $/t product.

Inputs (JSON, all [USER] or [ASSUMPTION]; see --example):
  tpd, days_per_year, product_tpy
  electricity: kwh_per_t, price_per_kwh
  fuel: l_per_t, price_per_l
  labor: fte, cost_per_fte
  water: m3_per_t, price_per_m3
  consumables_per_t, wear_parts_per_t
  maintenance_pct_of_capex, capex_mech
  disposal: residue_tpy, price_per_t
  monitoring_per_y, insurance_pct_of_capex, capex_total, facility_admin_per_y
Equations: item $/y = specific use * t/y * price ; t/y = tpd * days
"""
import argparse
import json
import sys

EXAMPLE = {
    "tpd": 100, "days_per_year": 310, "product_tpy": 20000,
    "electricity": {"kwh_per_t": 40, "price_per_kwh": 0.10},
    "fuel": {"l_per_t": 1.5, "price_per_l": 1.0},
    "labor": {"fte": 25, "cost_per_fte": 40000},
    "water": {"m3_per_t": 0.1, "price_per_m3": 1.5},
    "consumables_per_t": 2.0, "wear_parts_per_t": 3.0,
    "maintenance_pct_of_capex": 0.03, "capex_mech": 5_000_000,
    "disposal": {"residue_tpy": 8000, "price_per_t": 25},
    "monitoring_per_y": 30000, "insurance_pct_of_capex": 0.007, "capex_total": 12_000_000,
    "facility_admin_per_y": 150000,
}


def opex(p):
    tpy = p["tpd"] * p["days_per_year"]
    items = {
        "electricity": p["electricity"]["kwh_per_t"] * tpy * p["electricity"]["price_per_kwh"],
        "fuel": p.get("fuel", {}).get("l_per_t", 0) * tpy * p.get("fuel", {}).get("price_per_l", 0),
        "labor": p["labor"]["fte"] * p["labor"]["cost_per_fte"],
        "water": p.get("water", {}).get("m3_per_t", 0) * tpy * p.get("water", {}).get("price_per_m3", 0),
        "consumables": p.get("consumables_per_t", 0) * tpy,
        "wear_parts": p.get("wear_parts_per_t", 0) * tpy,
        "maintenance": p.get("maintenance_pct_of_capex", 0) * p.get("capex_mech", 0),
        "residue_disposal": p.get("disposal", {}).get("residue_tpy", 0) * p.get("disposal", {}).get("price_per_t", 0),
        "environmental_monitoring": p.get("monitoring_per_y", 0),
        "insurance": p.get("insurance_pct_of_capex", 0) * p.get("capex_total", 0),
        "facility_admin": p.get("facility_admin_per_y", 0),
    }
    total = sum(items.values())
    return {"t_per_year": tpy, "items_per_year": items, "total_per_year": total,
            "per_t_processed": total / tpy,
            "per_t_product": total / p["product_tpy"] if p.get("product_tpy") else None}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("params", nargs="?", help="JSON parameters file")
    ap.add_argument("--example", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    if a.example:
        p = EXAMPLE
    elif a.params:
        p = json.load(open(a.params))
    else:
        ap.error("give params file or --example")
    r = opex(p)
    if a.json:
        print(json.dumps(r, indent=2)); return 0
    print(f"Throughput: {r['t_per_year']:,.0f} t/y")
    for k, v in r["items_per_year"].items():
        print(f"  {k:<26}{v:>16,.0f} /y {v / r['t_per_year']:>10.2f} /t")
    print(f"  {'TOTAL':<26}{r['total_per_year']:>16,.0f} /y {r['per_t_processed']:>10.2f} /t processed")
    if r["per_t_product"]:
        print(f"  {'':<26}{'':>16}    {r['per_t_product']:>10.2f} /t product")
    return 0


if __name__ == "__main__":
    sys.exit(main())
