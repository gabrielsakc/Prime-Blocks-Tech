# Caracterización de residuos

No se diseña ninguna planta antes de que exista una MATRIZ DE CARACTERIZACIÓN DE RESIDUOS. Si faltan datos,
listarlos como lagunas de datos, completarlos con rangos `[LIT]` o `[ASSUMPTION]`, y especificar el
ensayo (`[TEST]`) que sustituirá a cada supuesto.

## 1. Matriz de caracterización (campos mínimos)

| Parámetro | Unidad | Por qué es importante |
|---|---|---|
| Capacidad de tratamiento | t/d, t/h, t/año (indicar días y horas de operación) | capacidad, logística |
| Factor de punta estacional / diario | – | capacidad de diseño |
| Densidad aparente (suelta, en camión, en foso) | kg/m³ | foso, volumen de transportadores, camiones |
| Humedad | % p/p base húmeda | balance, LHV, secado, lixiviados |
| Distribución granulométrica (PSD) | mm (d10/d50/d90, % < 80 mm etc.) | puntos de corte de cribado |
| Composición por fracción | % base húmeda | recuperación, productos |
| Contaminantes | % (vidrio, inertes, peligrosos, baterías, objetos punzantes) | desgaste, seguridad, calidad del producto |
| Variabilidad (CV, mín./máx.) | % | robustez, pulmones |
| LHV / HHV | MJ/kg (tal como se recibe y en seco) | RDF/SRF, WtE, secado |
| Cenizas, volátiles, carbono fijo | % base seca | rutas térmicas |
| Cl, S, N, metales pesados (Hg, Cd, Pb) | % o mg/kg seco | clase de SRF, emisiones, corrosión |
| TS, VS, VS/TS, C/N | % | compostaje, AD |
| Análisis elemental C/H/O/N/S | % seco | cálculos de combustión/biogás |
| Identificación de polímeros (plásticos) | % por resina | recetas NIR, valor del producto |

## 2. Rangos típicos `[LIT]` (usar solo cuando no haya datos; confirmar mediante caracterización)

RSU mezclado, ciudades en desarrollo / de ingresos medios (base húmeda):
- Orgánicos (alimentos + poda): 40–60 %; humedad de los orgánicos 65–80 %.
- Papel y cartón: 8–20 %; plásticos: 8–15 % (film ≈ 50–65 % de los plásticos en masa).
- Vidrio 2–6 %, metales 1–4 %, textiles 2–5 %, madera 1–4 %, inertes/finos 5–15 %.
- Densidad aparente suelta en camión (compactador): 350–550 kg/m³; playa de descarga/foso:
  250–450 kg/m³ (depende de la humedad y la compactación).
- LHV del RSU mezclado tal como se recibe: 5–10 MJ/kg; RDF/SRF de la fracción seca: 12–22 MJ/kg.
- Residuos alimentarios: TS 15–30 %, VS/TS 85–95 %, C/N 12–20.
- Restos de poda: TS 40–60 %, VS/TS 60–85 %, C/N 30–60.

Son rangos amplios. Nunca usarlos para garantías.

## 3. Protocolo de muestreo y caracterización (resumen)

- Caracterización de composición: ≥ 7 días consecutivos incl. fin de semana, repetida en estación húmeda y seca;
  unidades de muestra de 100–250 kg por conificación y cuarteo de camiones seleccionados al azar;
  ≥ 10 muestras/día por categoría de origen. Clasificar en ≥ 15 categorías.
- Métodos de referencia a verificar para la jurisdicción: ASTM D5231 (composición de RSU),
  EN 15442/15443 (muestreo/preparación de SRF), EN ISO 21640 (clasificación de SRF),
  ASTM E711/ISO 18125 (poder calorífico), ISO 18134 (humedad). `Applicability must be confirmed for project jurisdiction.`
  (La aplicabilidad debe confirmarse para la jurisdicción del proyecto.)
- Reportar media, desviación típica, P10/P90 para cada fracción.

## 4. Regla de variabilidad de la alimentación

- Coeficiente de variación CV = σ/μ. Si el CV de una fracción clave > 20 %, diseñar los equipos
  de separación para la composición P90 y comprobar las líneas aguas abajo al P90 de su propia fracción
  (p. ej. línea de orgánicos dimensionada al % superior de orgánicos, línea seca al % superior de secos).
- Usar los rangos de extremo a extremo: cuando el usuario indique 40–50 % de orgánicos, dimensionar la línea orgánica al
  50 % y la línea seca al (100 − 40 − otros) %, no ambas a la media.
- El almacenamiento pulmón (foso/playa de descarga) absorbe la variabilidad diaria; véase `plant-layout.md`.

## 5. Conversiones útiles

- Base seca ↔ base húmeda: `x_dry = x_wet / (1 − M)`; masa seca = masa húmeda × (1 − M).
- LHV_ar = LHV_dry × (1 − M) − 2.443 × M  (MJ/kg; 2.443 MJ/kg calor latente a 25 °C).
- HHV → LHV (seco): LHV = HHV − 2.443 × 9 × H (H fracción másica en seco) `[LIT]`.
- 1 tonelada corta = 0.907185 t; 1 lb = 0.453592 kg; 1 yd³ = 0.764555 m³.
