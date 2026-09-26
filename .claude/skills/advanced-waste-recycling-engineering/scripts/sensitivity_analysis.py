#!/usr/bin/env python3
"""Project economics: cash flow, NPV, IRR, simple payback, tornado sensitivity.

Model (JSON, see --example):
  capex, life_years, discount_rate, ramp (list of utilization factors for first years),
  revenues: {name: annual value at 100 % utilization}
  opex_fixed: annual ; opex_variable: annual at 100 % utilization
  sensitivities: {variable: [low_multiplier, high_multiplier]}
    variable in: capex | revenue:<name> | opex_fixed | opex_variable | utilization
Equations:
  CF_t = U_t * (sum revenues - opex_variable) - opex_fixed      (t = 1..N, pre-tax, no debt)
  NPV  = -CAPEX + sum CF_t / (1+r)^t
  IRR  : NPV(IRR) = 0 solved by bisection on [-0.99, 1.0]
  Payback = first t where cumulative CF >= CAPEX (linear interpolation)
Pre-tax, unlevered unless the user supplies tax/debt structure.
"""
import argparse
import copy
import json
import sys

EXAMPLE = {
    "capex": 10_000_000, "life_years": 15, "discount_rate": 0.10, "ramp": [0.7, 0.9],
    "utilization": 1.0,
    "revenues": {"gate_fee": 2_500_000, "materials": 1_500_000},
    "opex_fixed": 1_000_000, "opex_variable": 1_200_000,
    "sensitivities": {"capex": [0.8, 1.2], "revenue:gate_fee": [0.8, 1.2],
                      "revenue:materials": [0.7, 1.3], "opex_variable": [0.8, 1.2],
                      "utilization": [0.85, 1.0]},
}


def cash_flows(m):
    rev = sum(m["revenues"].values())
    base_u = m.get("utilization", 1.0)
    ramp = m.get("ramp", [])
    cfs = []
    for t in range(1, m["life_years"] + 1):
        u = base_u * (ramp[t - 1] if t - 1 < len(ramp) else 1.0)
        cfs.append(u * (rev - m["opex_variable"]) - m["opex_fixed"])
    return cfs


def npv(rate, capex, cfs):
    return -capex + sum(cf / (1 + rate) ** (t + 1) for t, cf in enumerate(cfs))


def irr(capex, cfs, lo=-0.99, hi=1.0, tol=1e-7):
    f_lo, f_hi = npv(lo, capex, cfs), npv(hi, capex, cfs)
    if f_lo * f_hi > 0:
        return None
    for _ in range(300):
        mid = (lo + hi) / 2
        f_mid = npv(mid, capex, cfs)
        if abs(f_mid) < tol:
            break
        if f_lo * f_mid < 0:
            hi, f_hi = mid, f_mid
        else:
            lo, f_lo = mid, f_mid
    return (lo + hi) / 2


def payback(capex, cfs):
    cum = 0.0
    for t, cf in enumerate(cfs):
        if cf > 0 and cum + cf >= capex:
            return t + (capex - cum) / cf
        cum += cf
    return None


def evaluate(m):
    cfs = cash_flows(m)
    return {"cash_flows": cfs, "npv": npv(m["discount_rate"], m["capex"], cfs),
            "irr": irr(m["capex"], cfs), "payback_years": payback(m["capex"], cfs)}


def apply(m, var, mult):
    m2 = copy.deepcopy(m)
    if var == "capex":
        m2["capex"] *= mult
    elif var.startswith("revenue:"):
        m2["revenues"][var.split(":", 1)[1]] *= mult
    elif var in ("opex_fixed", "opex_variable"):
        m2[var] *= mult
    elif var == "utilization":
        m2["utilization"] = m2.get("utilization", 1.0) * mult
    else:
        raise ValueError(f"unknown sensitivity variable {var}")
    return m2


def tornado(m):
    rows = []
    for var, (lo, hi) in m.get("sensitivities", {}).items():
        n_lo = evaluate(apply(m, var, lo))["npv"]
        n_hi = evaluate(apply(m, var, hi))["npv"]
        rows.append({"variable": var, "low_mult": lo, "high_mult": hi, "npv_low": n_lo,
                     "npv_high": n_hi, "swing": abs(n_hi - n_lo)})
    return sorted(rows, key=lambda r: -r["swing"])


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("model", nargs="?")
    ap.add_argument("--example", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    if a.example:
        m = EXAMPLE
    elif a.model:
        m = json.load(open(a.model))
    else:
        ap.error("give model file or --example")
    base = evaluate(m)
    tor = tornado(m)
    if a.json:
        print(json.dumps({"base": base, "tornado": tor}, indent=2)); return 0
    print(f"NPV @ {m['discount_rate']:.1%}: {base['npv']:,.0f}")
    print("IRR: " + (f"{base['irr']:.2%}" if base["irr"] is not None else "not defined (no sign change)"))
    print("Simple payback: " + (f"{base['payback_years']:.2f} years" if base["payback_years"] else "> project life"))
    print("\nTORNADO (NPV)")
    for r in tor:
        print(f"  {r['variable']:<22} x{r['low_mult']:<5} {r['npv_low']:>15,.0f}   x{r['high_mult']:<5} "
              f"{r['npv_high']:>15,.0f}   swing {r['swing']:>14,.0f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
