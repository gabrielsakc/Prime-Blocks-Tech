#!/usr/bin/env python3
"""Factored CAPEX estimate (Low / Base / High) from Purchased Equipment Cost (PEC).

Direct  = PEC * (1 + sum(direct factors)) + buildings_by_area
Indirect: Engineering & PM = f_eng * Direct ; Commissioning = f_comm * PEC
Subtotal = Direct + Indirect ; Contingency = f_cont * Subtotal ; TOTAL = Subtotal + Contingency
Factors are [ASSUMPTION] defaults from references/capex-opex.md; override with --factors JSON.
Estimate class must be stated by the engineer (Class 5/4/3). Not a contract price.
"""
import argparse
import json
import sys

DEFAULT_FACTORS = {
    #                    low   base  high
    "installation":     (0.15, 0.25, 0.35),
    "electrical":       (0.10, 0.15, 0.20),
    "instrumentation":  (0.05, 0.08, 0.12),
    "piping":           (0.03, 0.06, 0.10),
    "hvac_odor":        (0.05, 0.10, 0.15),
    "fire_protection":  (0.03, 0.05, 0.08),
    "civil":            (0.15, 0.25, 0.40),
    "buildings":        (0.20, 0.35, 0.50),
    "engineering":      (0.08, 0.12, 0.15),   # on direct
    "commissioning":    (0.02, 0.03, 0.05),   # on PEC
    "contingency":      (0.15, 0.25, 0.35),   # on subtotal
}
DIRECT = ["installation", "electrical", "instrumentation", "piping", "hvac_odor",
          "fire_protection", "civil", "buildings"]
CASES = ("low", "base", "high")


def estimate(pec, factors=None, building_cost=(0.0, 0.0, 0.0), pec_range=(1.0, 1.0, 1.0)):
    f = dict(DEFAULT_FACTORS)
    if factors:
        f.update({k: tuple(v) for k, v in factors.items()})
    if any(b > 0 for b in building_cost):
        f["buildings"] = (0.0, 0.0, 0.0)
    out = {}
    for i, case in enumerate(CASES):
        p = pec * pec_range[i]
        lines = {"purchased_equipment": p}
        for k in DIRECT:
            lines[k] = p * f[k][i]
        if building_cost[i] > 0:
            lines["buildings"] = building_cost[i]
        direct = sum(lines.values())
        lines["engineering"] = direct * f["engineering"][i]
        lines["commissioning"] = p * f["commissioning"][i]
        subtotal = direct + lines["engineering"] + lines["commissioning"]
        lines["contingency"] = subtotal * f["contingency"][i]
        lines["TOTAL"] = subtotal + lines["contingency"]
        out[case] = lines
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--equipment", type=float, required=True, help="PEC base, currency units")
    ap.add_argument("--pec-range", type=float, nargs=3, default=(1.0, 1.0, 1.0), metavar=("LOW", "BASE", "HIGH"),
                    help="multipliers on PEC per case, e.g. 0.85 1 1.2")
    ap.add_argument("--buildings", type=float, nargs=3, default=(0.0, 0.0, 0.0), metavar=("LOW", "BASE", "HIGH"),
                    help="area-based building cost per case (replaces building factor)")
    ap.add_argument("--factors", help="JSON file overriding factors {name: [low, base, high]}")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    factors = json.load(open(a.factors)) if a.factors else None
    res = estimate(a.equipment, factors, tuple(a.buildings), tuple(a.pec_range))
    if a.json:
        print(json.dumps(res, indent=2)); return 0
    keys = list(res["base"].keys())
    print(f"{'Item':<22}" + "".join(f"{c.upper():>18}" for c in CASES))
    for k in keys:
        print(f"{k:<22}" + "".join(f"{res[c].get(k, 0.0):>18,.0f}" for c in CASES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
