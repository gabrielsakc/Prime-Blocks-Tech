# Procesos térmicos: uso de RDF/SRF, biomasa, pirólisis, gasificación, WtE

## 1. Cuándo proceden
Usar solo cuando la corriente residual tenga valor energético y una salida verificada, o cuando el
usuario lo solicite. Evaluar siempre el control de emisiones, los permisos, los residuos (cenizas, residuos de APC) y
la venta/salida antes de recomendar.

## 2. Estado (verificar por proveedor) — distinguir Lab / Pilot / Demo / Commercial
| Tecnología | Alimentación | Estado |
|---|---|---|
| Incineración WtE de parrilla móvil + recuperación de energía | RSU mezclado / RDF | Commercial (TRL 9) |
| Combustión en lecho fluidizado | SRF, biomasa | Commercial |
| Coprocesamiento en hornos de cemento | SRF/RDF, TDF | Commercial |
| Pellet/briqueta de biomasa | madera, cascarillas, paja | Commercial |
| Gasificación (RSU/RDF) para syngas a motores/caldera | RDF | Commercial con pocas referencias; muchos fracasos históricos — due diligence crítica |
| Gasificación por plasma | RSU | Demo; fracasos comerciales documentados |
| Pirólisis de plásticos a aceite | plásticos ricos en PO | Demo → comercial incipiente |
| Pirólisis de neumáticos | chips de ELT | Commercial en unidades pequeñas; mercado de rCB en desarrollo |
| Carbonización / licuefacción hidrotermal | biomasa húmeda, lodos | Pilot → Demo |

## 3. Cálculos clave
- Potencia térmica de entrada (MW_th) = ṁ (kg/s) × LHV (MJ/kg).
- Rendimiento eléctrico neto de WtE 18–27 % (parrilla, RSU) `[LIT]`.
- Gases de combustión: ~ 5–6 Nm³/kg de RSU (seco, 11 % O2) `[LIT]` — verificar por estequiometría.
- Escorias 18–25 % de la entrada de RSU; residuos de APC 2–5 % `[LIT]`.
- Calor de secado ≈ 0.8–1.0 kWh_th/kg de H2O evaporada.
- Pellets (biomasa): humedad 8–12 % antes de la prensa; peletizadora 30–60 kWh/t, línea completa
  con secado/molienda 100–200 kWh/t `[LIT]`.

## 4. Límites de emisión
Referencia (verificar): EU IED 2010/75/EU Anexo VI (incineración/coincineración de residuos);
US EPA 40 CFR Part 60 subparts (Eb/AAAA/CCCC) y Part 63 según corresponda.
`Applicability must be confirmed for project jurisdiction.` (La aplicabilidad debe confirmarse para la jurisdicción del proyecto.)

## 5. Seguridad
Syngas (CO, H2): tóxico e inflamable, zonificación ATEX; entrada de oxígeno en reactores de pirólisis;
superficies calientes; explosiones de polvo en peletizadoras y secadores (detección de chispas obligatoria).
