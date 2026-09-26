"""Hand-verified test cases for the calculation scripts.
Run: python3 -m unittest discover -s .claude/skills/advanced-waste-recycling-engineering/tests -v
Expected values are computed by hand in the comments (independent of the code).
"""
import copy
import csv
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))

import capex_model  # noqa: E402
import energy_balance  # noqa: E402
import equipment_capacity as eq  # noqa: E402
import logistics_storage  # noqa: E402
import mass_balance as mb  # noqa: E402
import opex_model  # noqa: E402
import sensitivity_analysis as sa  # noqa: E402


class TestMassBalance(unittest.TestCase):
    def test_example_closes(self):
        r = mb.run_balance(mb.EXAMPLE)
        self.assertAlmostEqual(r["closure_pct"], 100.0, places=6)
        for c in r["component_closure_pct"].values():
            self.assertAlmostEqual(c, 100.0, places=6)

    def test_recovery_and_purity(self):
        r = mb.run_balance(mb.EXAMPLE)
        # ferrous 300 kg/h; 70 % to oversize = 210; magnet 90 % = 189 -> recovery 0.63
        self.assertAlmostEqual(r["streams"]["S04"]["ferrous"], 189.0, places=6)
        self.assertAlmostEqual(mb.recovery(r, "S04", "ferrous"), 0.63, places=6)
        self.assertGreater(mb.purity(r, "S04", ["ferrous"]), 0.9)

    def test_tc_not_summing_to_one_is_rejected(self):
        bad = copy.deepcopy(mb.EXAMPLE)
        bad["units"][0]["outputs"]["S03"] = {"organics": 0.10}  # no 'rest' -> other comps unassigned
        with self.assertRaises(mb.BalanceError):
            mb.run_balance(bad)

    def test_unclassified_terminal_rejected(self):
        bad = copy.deepcopy(mb.EXAMPLE)
        del bad["classify"]["S09"]
        with self.assertRaises(mb.BalanceError):
            mb.run_balance(bad)

    def test_feed_composition_must_sum_to_one(self):
        bad = copy.deepcopy(mb.EXAMPLE)
        bad["feeds"]["S01"]["composition"]["organics"] = 0.6
        with self.assertRaises(mb.BalanceError):
            mb.run_balance(bad)

    def test_loss_category(self):
        m = {"feeds": {"F": {"flow": 1000, "composition": {"water": 0.6, "dm": 0.4}}},
             "units": [{"tag": "DR-1", "inputs": ["F"],
                        "outputs": {"VAP": {"water": 0.5}, "P": "rest"}}],
             "classify": {"VAP": "loss", "P": "product"}}
        r = mb.run_balance(m)
        self.assertAlmostEqual(r["by_category"]["loss"], 300.0)
        self.assertAlmostEqual(r["by_category"]["product"], 700.0)


class TestEquipment(unittest.TestCase):
    def test_design_capacity(self):
        r = eq.design_capacity(2700, 20, 1.15, 0.90)  # 135 t/h avg; 135*1.15/0.9 = 172.5
        self.assertAlmostEqual(r["q_avg_tph"], 135.0)
        self.assertAlmostEqual(r["q_design_tph"], 172.5)

    def test_flat_belt(self):
        # b = 0.9*1.2-0.05 = 1.03; A = 1.0609*tan20/4 = 0.096534; Q = 3600*A*1*400/1000 = 139.01 t/h
        r = eq.belt_capacity(1.2, 1.0, 400)
        self.assertAlmostEqual(r["area_m2"], 0.096534, places=5)
        self.assertAlmostEqual(r["q_mass_tph"], 139.01, places=1)

    def test_belt_speed_inverse(self):
        v = eq.belt_speed_for(139.01, 1.2, 400)
        self.assertAlmostEqual(v, 1.0, places=3)

    def test_belt_power_positive_and_lift(self):
        p0 = eq.belt_power(100, 1.0, 30, 0)["shaft_kW"]
        p1 = eq.belt_power(100, 1.0, 30, 5)["shaft_kW"]
        # lift term = g*m'_L*H*v/eta/1000 = 9.81*27.78*5*1/0.9/1000 = 1.514 kW
        self.assertAlmostEqual(p1 - p0, 1.514, places=2)

    def test_screw(self):
        # 60*(pi/4)*0.25*0.5*30*0.3*500/1000 = 26.51 t/h
        self.assertAlmostEqual(eq.screw_capacity(0.5, 0.5, 30, 0.3, 500), 26.507, places=2)

    def test_trommel(self):
        r = eq.trommel(120, 4.0, 0.6)
        self.assertAlmostEqual(r["critical_rpm"], 21.15, places=2)
        self.assertAlmostEqual(r["screen_area_m2"], 200.0)
        # L = 200/(pi*4) = 15.92 m; max per unit 20 m -> 1 unit
        self.assertEqual(r["units_required"], 1)

    def test_crane(self):
        # 3600/90=40 cycles/h * 12 m3 * 400 kg/m3 * 0.8 /1000 * 0.75 = 115.2 t/h
        r = eq.crane(200, 12, 400, 90, 0.8, 0.75)
        self.assertAlmostEqual(r["q_per_crane_tph"], 115.2)
        self.assertEqual(r["n_duty"], 2)
        self.assertEqual(r["n_installed"], 3)

    def test_storage_and_motor(self):
        self.assertAlmostEqual(eq.storage_volume(100, 400, 1.0), 250.0)
        self.assertAlmostEqual(eq.motor_power(100, 4, 0.8), 500.0)


class TestEnergy(unittest.TestCase):
    def test_load_list(self):
        fd, path = tempfile.mkstemp(suffix=".csv")
        os.close(fd)
        with open(path, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["tag", "description", "kw", "qty", "standby_qty", "load_factor",
                        "diversity_factor", "voltage", "hours_per_day", "starting"])
            w.writerow(["A", "a", 100, 1, 0, 0.8, 1.0, 400, 10, "VFD"])
            w.writerow(["B", "b", 50, 2, 1, 0.5, 0.8, 400, 20, "DOL"])
        rows = energy_balance.load_rows(path)
        os.remove(path)
        r = energy_balance.analyze(rows, tpd=100)
        self.assertAlmostEqual(r["connected_kW"], 200.0)
        self.assertAlmostEqual(r["installed_incl_standby_kW"], 250.0)
        self.assertAlmostEqual(r["operating_kW"], 120.0)          # 80 + 2*50*0.5*0.8
        self.assertAlmostEqual(r["energy_kWh_per_day"], 1600.0)   # 800 + 800
        self.assertAlmostEqual(r["peak_kW"], 213.0)               # 120*1.15 + 0.3*5*50
        self.assertAlmostEqual(r["specific_kWh_per_t"], 16.0)

    def test_fla(self):
        # 100 kW, 400 V, eta .94, pf .85 -> 100000/(1.7321*400*0.94*0.85) = 180.6 A
        self.assertAlmostEqual(energy_balance.fla(100, 400), 180.6, places=1)


class TestLogistics(unittest.TestCase):
    def test_trucks(self):
        r = logistics_storage.trucks(2600, 10, 0.15, 8)
        self.assertEqual(r["trucks_per_day"], 260)
        self.assertAlmostEqual(r["peak_trucks_per_h"], 39.0)
        self.assertEqual(r["weighbridges_in"], 2)
        self.assertEqual(r["tipping_bays"], 7)   # ceil(39*8/60*1.3 = 6.76)

    def test_storage(self):
        r = logistics_storage.storage(5400, 400, 15, 0.9)
        self.assertAlmostEqual(r["volume_m3"], 15000.0)
        self.assertAlmostEqual(r["area_m2"], 1000.0)


class TestEconomics(unittest.TestCase):
    def test_capex_base(self):
        r = capex_model.estimate(100)["base"]
        # direct = 100*(1+1.29) = 229; eng 27.48; comm 3; sub 259.48; cont 64.87; total 324.35
        self.assertAlmostEqual(r["TOTAL"], 324.35, places=2)

    def test_capex_buildings_by_area_replaces_factor(self):
        r = capex_model.estimate(100, building_cost=(10, 20, 30))["base"]
        self.assertAlmostEqual(r["buildings"], 20.0)

    def test_opex_example(self):
        r = opex_model.opex(opex_model.EXAMPLE)
        self.assertEqual(r["t_per_year"], 31000)
        self.assertAlmostEqual(r["items_per_year"]["electricity"], 124000.0)
        self.assertAlmostEqual(r["per_t_processed"], r["total_per_year"] / 31000)

    def test_npv_irr_payback(self):
        cfs = [60.0, 60.0]
        self.assertAlmostEqual(sa.npv(0.10, 100, cfs), 4.1322, places=3)
        self.assertAlmostEqual(sa.irr(100, cfs), 0.13066, places=4)
        self.assertAlmostEqual(sa.payback(100, cfs), 1.6667, places=3)

    def test_tornado_sorted(self):
        rows = sa.tornado(sa.EXAMPLE)
        swings = [r["swing"] for r in rows]
        self.assertEqual(swings, sorted(swings, reverse=True))


if __name__ == "__main__":
    unittest.main()
