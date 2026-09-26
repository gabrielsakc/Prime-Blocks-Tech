# Planta MBT de RSU · 2.500–2.700 t/d

Estudio de ingeniería conceptual (L1–L2, CAPEX Clase 5) elaborado con el skill
`.claude/skills/advanced-waste-recycling-engineering`.

| Archivo | Contenido |
|---|---|
| `informe-planta-mbt-2700tpd.html` | Informe completo con 5 planos (generado) |
| `listado-maestro-equipos.csv` | Listado maestro de maquinaria (64 partidas, separador `;`) |
| `calc/mass_balance_nominal.json` / `.txt` | Modelo y resultado del balance de masa (cierre 100,000 %) |
| `calc/electrical_load_list.csv` / `_result.txt` | Lista de cargas eléctricas y resultado |
| `calc/capex_factors.json`, `capex_result.txt` | Factores y resultado de CAPEX |
| `calc/opex_params.json`, `opex_result.txt` | Parámetros y resultado de OPEX |
| `src/` | Fuentes del informe; `python3 build.py` regenera el HTML |

Recalcular:

```bash
S=.claude/skills/advanced-waste-recycling-engineering/scripts
python3 $S/mass_balance.py docs/planta-rsu-2700tpd/calc/mass_balance_nominal.json
python3 $S/energy_balance.py docs/planta-rsu-2700tpd/calc/electrical_load_list.csv --tpd 2600
python3 $S/capex_model.py --equipment 194e6 --pec-range 0.85 1 1.25 --buildings 47e6 62e6 78e6 --factors docs/planta-rsu-2700tpd/calc/capex_factors.json
python3 $S/opex_model.py docs/planta-rsu-2700tpd/calc/opex_params.json
python3 docs/planta-rsu-2700tpd/build.py
```
