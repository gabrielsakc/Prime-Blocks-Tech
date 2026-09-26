#!/usr/bin/env python3
"""Ensambla informe-planta-mbt-2700tpd.html a partir de src/*.html y del CSV de equipos."""
import csv
import html
import pathlib

HERE = pathlib.Path(__file__).parent
AREAS = {"100": "Área 100 · Recepción", "200": "Área 200 · Pretratamiento", "300": "Área 300 · Clasificación",
         "600": "Área 600 · Productos y prensado", "400": "Área 400 · Digestión, compostaje y biogás",
         "500": "Área 500 · RDF/SRF", "700": "Área 700 · Electricidad y servicios",
         "800": "Área 800 · Olores", "900": "Área 900 · Agua", "—": "Maquinaria móvil"}


def equipment_table():
    rows = list(csv.DictReader(open(HERE / "listado-maestro-equipos.csv", encoding="utf-8"), delimiter=";"))
    out = ['<div class="tbl"><table><thead><tr><th>Tag</th><th>Equipo</th><th>Función</th>'
           '<th class="r">Serv.</th><th class="r">Res.</th><th>Capacidad de diseño</th><th class="r">kW/ud</th>'
           '<th>Crit.</th><th>Fabricantes candidatos</th></tr></thead><tbody>']
    for area, title in AREAS.items():
        group = [r for r in rows if r["area"] == area]
        if not group:
            continue
        out.append(f'<tr class="grp"><td colspan="9">{title}</td></tr>')
        for r in group:
            e = {k: html.escape(v) for k, v in r.items()}
            out.append(f'<tr><td class="mono">{e["tag"]}</td><td>{e["descripcion"]}</td><td>{e["funcion"]}</td>'
                       f'<td class="r">{e["cant_servicio"]}</td><td class="r">{e["cant_reserva"]}</td>'
                       f'<td>{e["capacidad_diseno"]}</td><td class="r">{e["kw_unidad"]}</td><td>{e["criticidad"]}</td>'
                       f'<td>{e["fabricantes_candidatos"]}</td></tr>')
    assert sum(1 for r in rows if r["area"] in AREAS) == len(rows), "área sin grupo"
    out.append("</tbody></table></div>")
    return "\n".join(out), len(rows)


def main():
    parts = sorted((HERE / "src").glob("*.html"))
    doc = "\n".join(p.read_text(encoding="utf-8") for p in parts)
    table, n = equipment_table()
    doc = doc.replace("{{EQUIPOS}}", table)
    (HERE / "informe-planta-mbt-2700tpd.html").write_text(doc, encoding="utf-8")
    print(f"OK: {len(parts)} partes, {n} equipos, {len(doc)/1024:.0f} KB")


if __name__ == "__main__":
    main()
