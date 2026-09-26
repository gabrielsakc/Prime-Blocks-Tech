# Separación y clasificación mecánica

La separación actúa sobre una propiedad física. Indicar siempre la propiedad aprovechada y comprobar que la
alimentación realmente difiere en ella.

| Propiedad | Equipo | Notas / uso típico |
|---|---|---|
| Tamaño | trómel, criba de discos/estrellas, criba de dedos, criba vibrante, criba flip-flop (flip-flow) | trómel robusto para RSU húmedo; flip-flop para finos pegajosos; cribas de estrellas para OCC/papel |
| Forma / 2D-3D | separador balístico | film/papel (2D) frente a botellas/latas (3D) frente a finos |
| Densidad / aerodinámica | separador neumático (windshifter), clasificador zig-zag, cuchilla de aire, mesa neumática, despedregador | ligeros (film, papel) frente a pesados (inertes, madera) |
| Densidad (líquido) | tanque de hundido-flotado, hidrociclón, jig | PO (< 1 g/cm³) frente a PET/PVC; limpieza de áridos |
| Ferromagnetismo | separador magnético overband, tambor magnético, polea magnética de cabeza | recuperación de Fe; situar tras la apertura de bolsas y antes de la trituración cuando sea posible |
| Conductividad | separador por corrientes de Foucault (ECS), polo excéntrico > concéntrico para piezas pequeñas | Al, Cu, latón; alimentación en monocapa; partícula mín. ~5–10 mm |
| Inducción (todos los metales) | clasificador por sensor inductivo | inoxidable, cables, metales residuales |
| Espectral (NIR/VIS/HSI) | clasificador óptico con chorros de aire | tipos de resina, papel, envases de cartón para bebidas, color |
| Densidad atómica | clasificador XRT | metales pesados frente a ligeros, detección de PVC, piedras en orgánicos |
| Elemental | XRF, LIBS | clasificación de aleaciones (grados de Al), Cu/latón |
| Electrostática | separador electrostático de corona/tribo | plástico/metal de RAEE finos, PVC/PET |
| IA / visión | clasificador robótico, óptico asistido por IA | QC de corrientes de producto, corrientes muy heterogéneas |

## Reglas de diseño

1. **Espesor de capa**: los clasificadores por sensor necesitan una monocapa. Carga de banda
   `q (kg/(m·s)) ≈ capacity / (belt width × speed)` (capacidad / (ancho de banda × velocidad)); los OEM suelen indicar t/h por metro de
   ancho para un material dado — usar valores `[OEM]`. NIR típico sobre envases de RSU
   `[LIT]`: 2–6 t/h por metro de ancho (envases ligeros), mayor para papel/OCC.
2. **Secuencia**: grueso antes que fino; retirar primero los voluminosos y peligrosos (preclasificación);
   apertura de bolsas → cribado → balístico/neumático → imanes → ECS → NIR → QC. Situar los imanes
   pronto para proteger trituradoras y NIR.
3. **La eficiencia de cribado** disminuye con la humedad y la adherencia de los finos; trómeles con
   L/D 3–5, 8–14 rpm (30–40 % de la velocidad crítica) típicos para RSU `[LIT]`.
4. **Los orgánicos húmedos** colmatan las cribas de discos; preferir trómel con cepillos de limpieza.
5. **Recirculación**: los clasificadores de segunda pasada (scavenger) aumentan la recuperación; las pasadas de afino
   aumentan la pureza. Mostrar las corrientes de recirculación en el balance.
6. **Sistema de aire**: los clasificadores NIR necesitan aire comprimido (gran consumo; dimensionar los compresores
   a partir de los Nm³/min `[OEM]` en servicio). Los separadores neumáticos necesitan ventiladores + filtro de polvo.
7. **QC**: cabinas de QC manual/robótico en triaje positivo o negativo; cabinas calefactadas/ventiladas;
   altura ergonómica de banda ~ 0.9 m; velocidad de banda para triaje manual 0.2–0.5 m/s `[LIT]`.

## Familias de OEM candidatas (verificar modelos y datos antes de usar)

Ópticos/sensores: TOMRA, Pellenc ST, Steinert, Redwave (BT-Wolfgang Binder), MSS (CP Group),
Machinex. Cribas/balísticos/sistemas MRF: Stadler, CP Group, Machinex, Bollegraaf, Sutco,
Komptech, Doppstadt, BHS/Nihot, Van Dyk. Imanes/ECS: Eriez, Steinert, Goudsmit, IMRO,
Master Magnets. Robótica/IA: AMP Robotics, ZenRobotics (Terex), Greyparrot (analítica),
Machinex SamurAI, Bollegraaf/Greyparrot. Estado: `Candidate equipment — manufacturer verification required` (equipo candidato — requiere verificación del fabricante)
hasta que se examinen las hojas de datos.
