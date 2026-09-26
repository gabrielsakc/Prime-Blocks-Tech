# CAPEX, OPEX y análisis económico

## 1. Clases de estimación (estilo AACE 18R-97; presentar siempre)
| Clase | Nivel | Precisión (típ.) |
|---|---|---|
| 5 | L0–L1 cribado conceptual | −30/−50 % a +30/+100 % |
| 4 | L1–L2 factibilidad | −15/−30 % a +20/+50 % |
| 3 | L3 FEED / presupuesto | −10/−20 % a +10/+30 % |
Nunca presentar una estimación conceptual como precio contractual.

## 2. CAPEX factorizado (`scripts/capex_model.py`)
Base = coste de equipos adquiridos (PEC, puesto en obra). Costes directos e indirectos como factores del
PEC `[ASSUMPTION — calibrate per region]`:

| Partida | Bajo | Base | Alto |
|---|---|---|---|
| Instalación (montaje mecánico) | 0.15 | 0.25 | 0.35 |
| Electricidad | 0.10 | 0.15 | 0.20 |
| Instrumentación y control | 0.05 | 0.08 | 0.12 |
| Tuberías (proceso, aire, agua) | 0.03 | 0.06 | 0.10 |
| HVAC y tratamiento de olores | 0.05 | 0.10 | 0.15 |
| Protección contra incendios | 0.03 | 0.05 | 0.08 |
| Obra civil y cimentaciones | 0.15 | 0.25 | 0.40 |
| Edificios (si no se calculan por superficie) | 0.20 | 0.35 | 0.50 |
| Ingeniería y dirección de proyecto (sobre directos) | 0.08 | 0.12 | 0.15 |
| Puesta en servicio y arranque (sobre PEC) | 0.02 | 0.03 | 0.05 |
| Contingencia (sobre el total) | 0.15 | 0.25 | 0.35 |

En plantas grandes, los edificios se calculan mejor como superficie × coste unitario (m² × $/m²). Cuando
se aporten edificios calculados por superficie, fijar el factor de edificios en 0. El terreno se excluye salvo que
se solicite. Capital de trabajo típico de 1–3 meses de OPEX cuando se solicite.

Escala: `C2 = C1 · (S2/S1)^n`, n ≈ 0.6–0.7 para plantas de proceso `[LIT]`. Actualizar con un
índice de costes (CEPCI) y aplicar un factor de localización — ambos etiquetados `[ASSUMPTION]`.

## 3. OPEX (`scripts/opex_model.py`)
Electricidad (kWh/t × tarifa) · combustible (gasóleo para maquinaria móvil, L/t) · mano de obra (FTE ×
coste cargado; FTE = puestos × factor de cobertura de turnos ~ 4.2–4.8 para 24/7) · agua ·
consumibles (alambre de embalar, film de envoltura, cribas, productos químicos, material de biofiltro) · piezas de desgaste
(cuchillas de trituradora, revestimientos: $/t `[OEM]`) · mantenimiento (2–4 % del CAPEX mecánico/año típico
`[LIT]`) · disposición de rechazos (tasa de vertedero × t) · vigilancia ambiental ·
seguros (0.5–1.0 % del CAPEX/año) · instalaciones y administración. Reportar $/t procesada y $/t de
producto (definir "producto" explícitamente).

## 4. Ingresos
Venta de materiales (separar el PRECIO DE MERCADO [VERIFIED, fecha, fuente] del PRECIO DE VENTA
SUPUESTO tras descuentos por calidad y logística) · tasas de entrada/vertido · energía (electricidad,
biometano, calor) · RDF/SRF (a menudo un coste — precio negativo — o cero) · compost
(a menudo de valor bajo/nulo; a veces un coste) · créditos de carbono (solo con metodología).

## 5. Análisis económico (`scripts/sensitivity_analysis.py`)
EBITDA = Ingresos − OPEX. NPV = Σ CF_t/(1+r)^t − CAPEX. La IRR resuelve NPV = 0 (bisección).
Periodo de recuperación simple = CAPEX / CF anual. Incluir impuestos/amortización solo si el usuario aporta el
régimen. Sensibilidad ±20–30 % sobre: tasa de entrada, precios de venta, recuperación, precio de la electricidad,
mano de obra, utilización, CAPEX. Clasificación en diagrama tornado según la variación del NPV.
