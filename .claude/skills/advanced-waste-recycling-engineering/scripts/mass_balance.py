#!/usr/bin/env python3
"""Stage-wise mass balance using transfer coefficients (TC), with closure checks.

Model (JSON):
{
  "basis": "kg/h",
  "feeds":  {"S01": {"flow": 10000, "composition": {"organics": 0.5, "paper": 0.2, ...}}},
  "units": [
    {"tag": "TR-301", "inputs": ["S01"],
     "outputs": {"S02": {"organics": 0.85, "paper": 0.10},   # TC per component
                 "S03": "rest"}}                              # remainder of every component
  ],
  "classify": {"S02": "product", "S03": "reject", ...}         # terminal streams only
}

Equations:
  m(out,i) = TC(unit,i,out) * sum(m(in,i))           for every component i
  sum_out TC(unit,i,out) = 1                         (validated, tol 1e-6)
  Closure = sum(terminal streams) / sum(feeds) * 100 %
  Categories: product | byproduct | reject | loss  ->  INPUT = P + B + R + L
Losses (water evaporation, CO2, biogas) must be modelled as explicit loss streams.
Components not listed for an output get TC = 0 (unless the output is "rest").
"""
import argparse
import json
import sys

CATEGORIES = ("product", "byproduct", "reject", "loss")
TOL = 1e-6


class BalanceError(Exception):
    pass


def run_balance(model):
    streams = {}
    for name, feed in model["feeds"].items():
        comp = feed["composition"]
        s = sum(comp.values())
        if abs(s - 1.0) > 1e-4:
            raise BalanceError(f"Feed {name}: composition sums to {s:.6f}, not 1.0")
        streams[name] = {k: feed["flow"] * v for k, v in comp.items()}

    consumed = set()
    unit_reports = []
    for unit in model["units"]:
        tag = unit["tag"]
        inflow = {}
        for sname in unit["inputs"]:
            if sname not in streams:
                raise BalanceError(f"{tag}: input stream {sname} not defined yet (order units upstream first)")
            if sname in consumed:
                raise BalanceError(f"{tag}: stream {sname} already consumed by another unit")
            consumed.add(sname)
            for k, v in streams[sname].items():
                inflow[k] = inflow.get(k, 0.0) + v

        outputs = unit["outputs"]
        rest_names = [o for o, tc in outputs.items() if tc == "rest"]
        if len(rest_names) > 1:
            raise BalanceError(f"{tag}: only one output may be 'rest'")
        out = {o: {} for o in outputs}
        for comp, m_in in inflow.items():
            assigned = 0.0
            for oname, tc in outputs.items():
                if tc == "rest":
                    continue
                f = float(tc.get(comp, 0.0))
                if f < -TOL or f > 1 + TOL:
                    raise BalanceError(f"{tag}: TC {comp}->{oname} = {f} outside [0,1]")
                out[oname][comp] = m_in * f
                assigned += f
            if rest_names:
                if assigned > 1 + TOL:
                    raise BalanceError(f"{tag}: TCs for {comp} sum to {assigned:.4f} > 1")
                out[rest_names[0]][comp] = m_in * max(0.0, 1.0 - assigned)
            elif abs(assigned - 1.0) > TOL:
                raise BalanceError(f"{tag}: TCs for component '{comp}' sum to {assigned:.6f} (must be 1)")
        for oname, comp in out.items():
            if oname in streams:
                raise BalanceError(f"{tag}: output stream {oname} defined twice")
            streams[oname] = comp
        m_in_tot = sum(inflow.values())
        m_out_tot = sum(sum(c.values()) for c in out.values())
        unit_reports.append({"tag": tag, "in": m_in_tot, "out": m_out_tot,
                             "closure_pct": 100.0 * m_out_tot / m_in_tot if m_in_tot else 100.0})

    terminal = [s for s in streams if s not in consumed]
    classify = model.get("classify", {})
    missing = [s for s in terminal if s not in classify]
    if missing:
        raise BalanceError(f"Terminal streams not classified: {missing}")
    for s, cat in classify.items():
        if cat not in CATEGORIES:
            raise BalanceError(f"Stream {s}: category '{cat}' not in {CATEGORIES}")
        if s not in terminal:
            raise BalanceError(f"Stream {s} is classified but is not terminal")

    feed_total = sum(sum(streams[f].values()) for f in model["feeds"])
    by_cat = {c: 0.0 for c in CATEGORIES}
    for s in terminal:
        by_cat[classify[s]] += sum(streams[s].values())
    out_total = sum(by_cat.values())
    comps = sorted({k for s in streams.values() for k in s})
    comp_closure = {}
    for c in comps:
        fin = sum(streams[f].get(c, 0.0) for f in model["feeds"])
        fout = sum(streams[s].get(c, 0.0) for s in terminal)
        comp_closure[c] = 100.0 * fout / fin if fin else 100.0

    return {
        "basis": model.get("basis", "kg/h"),
        "feeds": list(model["feeds"]),
        "streams": streams,
        "terminal": terminal,
        "classify": classify,
        "units": unit_reports,
        "feed_total": feed_total,
        "by_category": by_cat,
        "output_total": out_total,
        "closure_pct": 100.0 * out_total / feed_total if feed_total else 0.0,
        "component_closure_pct": comp_closure,
    }


def recovery(result, stream, component):
    """Recovery of `component` from all feeds into `stream` (fraction 0..1)."""
    streams = result["streams"]
    fin = sum(streams[f].get(component, 0.0) for f in result["feeds"])
    return streams[stream].get(component, 0.0) / fin if fin else 0.0


def purity(result, stream, targets):
    s = result["streams"][stream]
    tot = sum(s.values())
    return sum(s.get(t, 0.0) for t in targets) / tot if tot else 0.0


def print_report(r):
    b = r["basis"]
    print(f"STREAM TABLE ({b})")
    comps = sorted({k for s in r["streams"].values() for k in s})
    print(f"{'Stream':<8}{'Total':>12}  " + "".join(f"{c[:10]:>11}" for c in comps) + "  Category")
    for name, s in r["streams"].items():
        tot = sum(s.values())
        cat = r["classify"].get(name, "internal")
        print(f"{name:<8}{tot:>12.1f}  " + "".join(f"{s.get(c, 0.0):>11.1f}" for c in comps) + f"  {cat}")
    print("\nUNIT CLOSURE")
    for u in r["units"]:
        print(f"  {u['tag']:<10} in {u['in']:>12.1f}  out {u['out']:>12.1f}  closure {u['closure_pct']:.3f} %")
    print("\nPLANT BALANCE: INPUT = PRODUCTS + BYPRODUCTS + REJECTS + LOSSES")
    print(f"  INPUT      {r['feed_total']:>12.1f} {b}")
    for c, v in r["by_category"].items():
        pct = 100 * v / r["feed_total"] if r["feed_total"] else 0
        print(f"  {c.upper():<10} {v:>12.1f} {b}  ({pct:5.2f} %)")
    status = "OK" if abs(r["closure_pct"] - 100) <= 0.5 else "ERROR — FIX BEFORE CONTINUING"
    print(f"\nMASS BALANCE CLOSURE: {r['closure_pct']:.3f} %  [{status}]")


EXAMPLE = {
    "basis": "kg/h",
    "feeds": {"S01": {"flow": 10000, "composition": {
        "organics": 0.50, "paper": 0.15, "plastics": 0.12, "ferrous": 0.03,
        "aluminium": 0.01, "inerts": 0.09, "other": 0.10}}},
    "units": [
        {"tag": "TR-301", "inputs": ["S01"], "outputs": {
            "S02": {"organics": 0.85, "paper": 0.10, "plastics": 0.05, "ferrous": 0.30,
                    "aluminium": 0.20, "inerts": 0.80, "other": 0.30},
            "S03": "rest"}},
        {"tag": "MS-302", "inputs": ["S03"], "outputs": {
            "S04": {"ferrous": 0.90, "other": 0.01}, "S05": "rest"}},
        {"tag": "EC-303", "inputs": ["S05"], "outputs": {
            "S06": {"aluminium": 0.85}, "S07": "rest"}},
        {"tag": "OS-304", "inputs": ["S07"], "outputs": {
            "S08": {"plastics": 0.80, "paper": 0.03, "other": 0.02}, "S09": "rest"}},
    ],
    "classify": {"S02": "byproduct", "S04": "product", "S06": "product",
                 "S08": "product", "S09": "reject"},
}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("model", nargs="?", help="JSON model file")
    ap.add_argument("--example", action="store_true", help="run built-in MRF example")
    ap.add_argument("--json", action="store_true", help="print JSON result")
    a = ap.parse_args(argv)
    if a.example:
        model = EXAMPLE
    elif a.model:
        with open(a.model) as fh:
            model = json.load(fh)
    else:
        ap.error("give a model file or --example")
    try:
        r = run_balance(model)
    except BalanceError as e:
        print(f"MASS BALANCE ERROR: {e}", file=sys.stderr)
        return 2
    if a.json:
        print(json.dumps(r, indent=2))
    else:
        print_report(r)
    return 0 if abs(r["closure_pct"] - 100) <= 0.5 else 1


if __name__ == "__main__":
    sys.exit(main())
