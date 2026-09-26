# Seguridad: revisión de riesgos, polvo, incendio, explosión

## 1. Revisión preliminar de riesgos (obligatoria en todo proyecto)
Tabla por área con las categorías: Mecánico · Eléctrico · Térmico · Químico · Incendio ·
Explosión · Polvo · Presión · Ambiental · Personal (tráfico, ergonomía, biológico).
Columnas: Peligro · Causa · Consecuencia · Salvaguardas (diseño) · Riesgo residual (L×S, 5×5) ·
Acción. Plantilla: `templates/risk-register.csv`.

## 2. Peligros en plantas de residuos (típicos, comprobar cada uno)
- **Incendio**: fosos y naves de descarga (autocalentamiento, baterías de Li-ion, cenizas calientes), almacenamiento
  de balas, almacenamiento de RDF, trituradoras (chispas), acumulación de polvo. Las baterías de Li-ion son la
  principal fuente de ignición en los MRF modernos `[LIT]`.
- **Explosión**: bombonas de gas/aerosoles en trituradoras; polvo combustible (papel, plásticos,
  madera, caucho); biogás (CH4, inflamable 5–15 % vol en aire); H2S (tóxico, IDLH 100 ppm).
- **Mecánico**: trituradoras, transportadores (puntos de atrapamiento), empacadoras, maquinaria móvil — LOTO,
  resguardos (ISO 14120), cables de tracción, verificación de energía cero.
- **Biológico**: bioaerosoles, agujas/objetos punzantes en cabinas de triaje — EPI, ventilación de cabinas.
- **Tráfico**: separación camiones/peatones, circulación en sentido único, ayudas para la marcha atrás.
- **Espacios confinados**: digestores, tanques, fosos, arquetas.

## 3. Concepto de protección contra incendios (plantas grandes de RSU)
Detección por cámaras IR/térmicas sobre el foso y el almacenamiento con cañones de agua automáticos
(monitores telecontrolados); detección y extinción de chispas en conductos neumáticos/de polvo
y en la descarga de trituradoras; rociadores/diluvio en naves (densidad de diseño según el riesgo — verificar
NFPA 13 / código local / hojas de datos de FM Global, p. ej. DS 8-9 almacenamiento, verificar); muros cortafuegos
que separen foso, proceso y almacenamiento; anillo de hidrantes; depósito de agua contra incendios dimensionado para la
duración (habitualmente 2–4 h al caudal de diseño — verificar el código); retención del agua de extinción (la escorrentía
contiene contaminantes). Límites de tamaño de pila y distancias de separación para almacenamiento exterior
(NFPA 1 / código local contra incendios / aseguradora). Vial de acceso para bomberos alrededor de los edificios (≥ 6 m típico,
verificar).

## 4. Polvo combustible
Requerido cuando se manipulan sólidos combustibles: análisis de riesgos de polvo (DHA) según
NFPA 660 (consolida las antiguas NFPA 652/654/664 — verificar la edición vigente) en EE. UU., o
ATEX 2014/34/EU + 1999/92/EC y zonificación según EN 60079-10-2 en la UE. Ensayar el polvo (Kst, Pmax, MIE,
MIT, LOC) `[TEST]`. Medidas: captación en origen, orden y limpieza, venteo de explosiones
(EN 14491 / NFPA 68), aislamiento (NFPA 69), detección de chispas, equipotencialidad/puesta a tierra, equipos
con certificación ATEX en las zonas.

## 5. Área de biogás
Clasificación de áreas peligrosas (IEC 60079-10-1 / NFPA 497 — verificar), detección de gases
(alarmas de CH4 al 10/20 % del LEL, H2S 10/20 ppm), antorcha dimensionada para el 100 % del biogás, PVRV en
digestores, apagallamas, ventilación de los equipos de gas en recintos cerrados, distancias de separación
(NFPA 59A no aplicable; comprobar los códigos locales de biogás).

## 6. Métodos
- HAZID en L1–L2 (palabras guía estructuradas por área).
- HAZOP (IEC 61882) cuando existan P&ID: biogás, sistemas de agua/productos químicos, unidades térmicas.
- FMEA para equipos mecánicos críticos (trituradoras, grúas, ventiladores).
- LOPA/SIL (IEC 61511) para las SIF de sistemas de biogás/térmicos.
- Comprobación de aplicabilidad de OSHA PSM (29 CFR 1910.119) si el inventario de gas inflamable > 10,000 lb.
`Applicability must be confirmed for project jurisdiction.` (La aplicabilidad debe confirmarse para la jurisdicción del proyecto.)
