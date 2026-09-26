# SKILL VALIDATION REPORT · advanced-waste-recycling-engineering · v1.0

Fecha: 2026-09-26 · Claude Code 2.1.x · convención de skills de proyecto
`.claude/skills/<nombre>/SKILL.md` con frontmatter YAML (`name`, `description`).

## 1. Estructura creada

```
advanced-waste-recycling-engineering/
├── SKILL.md                      controlador compacto (reglas, modos, workflow, mapa de módulos)
├── VALIDATION_REPORT.md          este informe
├── references/ (23 módulos, en español)
│   waste-characterization · mass-balance · mechanical-separation · msw-mrf-mbt
│   plastics-recycling · tire-recycling · metals-recycling · ewaste-recycling
│   organics · construction-demolition · paper-glass-textiles · thermal-processes
│   equipment-sizing · process-design · electrical-engineering · automation-controls
│   safety · environmental · capex-opex · plant-layout · maintenance · standards
│   engineering-report-template
├── scripts/ (7, Python 3 solo biblioteca estándar)
│   mass_balance.py · equipment_capacity.py · energy_balance.py · logistics_storage.py
│   capex_model.py · opex_model.py · sensitivity_analysis.py
├── templates/ (6 CSV)
│   equipment-list · mass-balance · electrical-load-list · capex-template
│   opex-template · risk-register
└── tests/test_scripts.py (23 casos verificados a mano)
```

Mejoras sobre la arquitectura propuesta: módulo `msw-mrf-mbt.md` (plantas de RSU mezclado,
el caso más frecuente) y script `logistics_storage.py` (camiones, básculas, muelles, fosos y
superficies de almacenamiento), que la propuesta original no cubría.

## 2. Scripts

| Script | Calcula | Validaciones internas |
|---|---|---|
| mass_balance.py | Balance por coeficientes de transferencia, tabla de corrientes, cierre por equipo, por componente y de planta, recuperación y pureza | Composición = 1; Σ TC = 1 por componente; corrientes definidas antes de usarse; corrientes terminales clasificadas; código de salida ≠ 0 si el cierre falla |
| equipment_capacity.py | Capacidad de diseño, banda plana/artesa/monocapa y potencia (DIN 22101 simplificada), tornillo, tolva/foso, grúa de pulpo, trómel, potencia por energía específica | Rangos de entrada |
| energy_balance.py | Carga conectada, instalada con reservas, operación, punta, kWh/d, kWh/t, FLA, transformadores N+1 y 2×50 % | — |
| logistics_storage.py | Camiones/día, punta, básculas, muelles, masa, volumen y superficie de almacenamiento | — |
| capex_model.py | CAPEX factorizado bajo/base/alto, edificios por superficie | Factores configurables en JSON |
| opex_model.py | OPEX por partidas, USD/t procesada y USD/t producto | — |
| sensitivity_analysis.py | Flujos de caja, VAN, TIR (bisección), payback, tornado | TIR indefinida si no hay cambio de signo |

## 3. Tests ejecutados

`python3 -m unittest discover -s .claude/skills/advanced-waste-recycling-engineering/tests -v`
→ **23 tests, 23 OK**. Casos con valor esperado calculado a mano, por ejemplo:
banda plana 1,2 m a 1 m/s con 400 kg/m³ = 139,0 t/h; tornillo Ø 0,5 m = 26,5 t/h;
velocidad crítica de trómel Ø 4 m = 21,15 rpm; grúa 12 m³ = 115,2 t/h; VAN(10 %) de
−100/+60/+60 = 4,132; TIR = 13,07 %; payback = 1,667 años; CAPEX base de PEC 100 = 324,35;
recuperación de Fe del ejemplo = 63 %. Además se ejecutaron todas las CLI con `--help` y
con sus ejemplos, y el caso real de 2.600 t/d (cierre 100,000 %).

## 4. Errores encontrados y correcciones

1. `mass_balance.recovery()` dependía de una clave inexistente → reescrita; el resultado
   ahora incluye la lista de alimentaciones.
2. `energy_balance.py` solo proponía 2 × 50 % de transformación (sin redundancia) → ahora
   informa N+1 y 2 × 50 %, y avisa cuando se superan 5 MVA por transformador.
3. Docstring de punta de demanda ambiguo → ecuación explícita.
4. `plant-layout.md` contenía un ratio de superficie ha/(t/año) no verificado → sustituido
   por el método de cálculo por áreas y la obligación de citar referencias.
5. Referencias cruzadas: comprobadas todas las rutas `references/`, `scripts/`, `templates/`
   y los nombres de módulo citados; 0 rotas. Eliminados `__pycache__` (y `.gitignore`).
6. Idioma: SKILL.md y las 23 referencias traducidas al español a petición del usuario,
   conservando valores, etiquetas de procedencia y frases normalizadas.

## 5. Capacidades

10 modos de trabajo (análisis rápido → due diligence), workflow maestro de 23 pasos,
dominios RSU/MRF/MBT, plásticos, neumáticos, RCD, metales, RAEE, orgánicos, papel, vidrio,
textiles, biomasa y procesos térmicos; reglas antialucinación y etiquetas de procedencia;
cálculos auditables con ecuaciones documentadas; plantillas de entregables; revisión de
diseño interna obligatoria.

## 6. Limitaciones actuales

- El balance de masa no resuelve recirculaciones (bucles); se modelan como corrientes netas.
- Los rangos típicos `[LIT]` proceden de conocimiento general, no de fuentes citadas una a una.
- Sin base de datos de costes por equipo ni índices CEPCI/factores de localización.
- Sin generador automático de planos (los planos se dibujan en SVG a mano) ni de P&ID.
- El modelo económico es antes de impuestos y sin deuda.
- Balance de agua y energía térmica sin script propio.

## 7. Recomendaciones para V2

1. Solver de balance con recirculaciones (iteración de punto fijo) y humedad por componente.
2. Script de balance hídrico y térmico (secado, digestores, CHP).
3. Biblioteca de coeficientes de transferencia con fuente citada por valor.
4. Módulo de costes con índices de escalado y factores de localización por país.
5. Generador de plano de implantación (SVG/DXF) a partir de la tabla de áreas.
6. Módulo de normativa por país (España, México, Chile, Colombia, Argentina, EE. UU.).
7. Modelo económico con impuestos, amortización, deuda y Monte Carlo.
