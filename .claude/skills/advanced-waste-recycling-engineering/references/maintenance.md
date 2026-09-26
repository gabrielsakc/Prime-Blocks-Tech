# Ingeniería de mantenimiento

## 1. Criticidad
- **A** — el fallo detiene la planta/línea o provoca un evento de seguridad/ambiental (grúa del foso,
  pretriturador, trómel primario, transportadores principales de alimentación, ventiladores de olores, antorcha de biogás, transformadores).
  Estrategia: redundancia (N+1 o líneas en paralelo), monitorización predictiva, repuestos críticos en
  planta.
- **B** — el fallo reduce la recuperación/calidad (clasificadores NIR, ECS, empacadoras, separadores neumáticos).
  Estrategia: preventivo + comprobaciones de condición, repuestos en cuestión de días.
- **C** — menor (transportadores cortos, iluminación). Operación hasta el fallo aceptable con stock de repuestos.

## 2. Preventivo/predictivo
Trituradoras: rotación de cuchillas/martillos y recargue duro según horas de operación `[OEM]`; análisis del aceite
hidráulico; vibración del reductor. Trómeles: ruedas/rodillos, desgaste de las chapas de cribado, cepillos.
Transportadores: empalmes de banda, rodillos, rascadores, centrado. Clasificadores: limpieza de boquillas/válvulas,
calibración, limpieza diaria de cámaras/lentes. Ventiladores/soplantes: vibración (ISO 10816/20816),
T de rodamientos. Grúas: cables, pulpos (hidráulica), frenos según la reglamentación.
Sensores PdM: vibración, temperatura de rodamientos, firma de corriente del motor, partículas en el aceite,
termografía de MCC/cuadros eléctricos.

## 3. Repuestos críticos (ejemplos)
Ejes/juegos de cuchillas de trituradora, reductor de repuesto (para trituradoras grandes), accionamiento del trómel,
bandas de transportadores críticos, carcasa del rotor del ECS, bloques de válvulas NIR, bomba hidráulica de la empacadora,
pulpo de la grúa, rodete de ventilador, repuestos de VFD, CPU/tarjetas de E/S del PLC.

## 4. Organización
Ventana planificada de mantenimiento: 1 turno/semana por línea o 1 día/2 semanas; CMMS con órdenes
de trabajo; KPIs: MTBF, MTTR, cumplimiento del PM, coste de mantenimiento $/t, valor del stock de repuestos.
En las plantas de RSU los costes de desgaste están dominados por trituradoras y cribas — presupuestar por t `[OEM]`.
