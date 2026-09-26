# Automatización, control, P&ID, IA y gemelo digital

## 1. Arquitectura
Sensores/actuadores de campo → E/S remotas (IP65/67 junto a los equipos) → PLC redundante por área
(Siemens S7-1500/1500H, Rockwell ControlLogix/GuardLogix, Schneider Modicon M580,
Beckhoff TwinCAT — seleccionar según el soporte local) → PLC de seguridad (con clasificación SIL/PL: paradas de emergencia, cables de
tracción, enclavamientos de resguardos) → SCADA (servidores redundantes) → Historian → MES/analítica
(báscula puente, producción, calidad, mantenimiento CMMS) → ERP. Red OT segmentada
(zonas y conductos según IEC 62443), topología en anillo (MRP/DLR), firewall/DMZ hacia IT.

## 2. Filosofía de control (redactar por área)
- Secuencia de arranque: aguas abajo → aguas arriba (primero el último transportador); secuencia de parada:
  aguas arriba → aguas abajo con temporizadores de vaciado.
- Enclavamientos: un transportador dispara si se detiene el de aguas abajo (cascada); detectores de velocidad cero;
  sensores de desalineación de banda, cable de tracción y atasco de tolva (nivel/radar).
- Permisivos: colector de polvo en marcha antes que la trituradora; ventiladores de olores antes de abrir las puertas de la nave;
  sistema contra incendios operativo.
- Control de carga: amperaje de trituradora/trómel → velocidad del transportador de alimentación mediante VFD (PID); grúa de foso
  en modo automático con escaneo 3D de nivel (radar/láser) y estrategia de mezcla.
- Alarmas según ISA-18.2 (racionalizadas, priorizadas); paradas de emergencia según ISO 13850.
- Control de motores: VFD para todos los transportadores y ventiladores de proceso; arrancadores suaves para accionamientos grandes de velocidad
  fija; relés de protección de motor con protección térmica/de falta a tierra.

## 3. Instrumentación (etiquetas ISA-5.1)
WT peso (básculas de banda en cada línea de producto/rechazo — permite el balance de masa en tiempo real),
LT nivel, PT presión, TT temperatura, FT caudal, AT analizador (CH4, H2S, O2, NH3),
ST velocidad, VT vibración, ZS posición, IR/TE cámaras térmicas (incendio). Biogás: FT, AT (CH4,
H2S, O2), PT, apagallamas, PSV/PVRV, BMS de antorcha.

## 4. IA — solo donde el valor sea medible
| Aplicación | Métrica de valor | Madurez |
|---|---|---|
| Visión artificial con IA para clasificadores/robots | pureza +, mano de obra − (h/t) | Comercial |
| Analítica de composición de residuos sobre bandas | balance de masa en tiempo real, calidad contractual | Comercial (incipiente) |
| Mantenimiento predictivo (vibración, temperatura, corriente) | paradas no planificadas − | Comercial |
| Detección temprana de incendios (térmica + IA) | incidentes − | Comercial |
| Automatización/programación de grúas | alimentación homogénea, operador − | Comercial |
| Optimización energética (ventiladores, compresores) | kWh/t − | Comercial |
Justificar cada una con una línea base y un objetivo de KPI; no incluir la IA como argumento comercial.

## 5. Gemelo digital (plantas complejas)
Capas: modelo de activos (etiquetas, jerarquía) + modelo de proceso (balance de masa con básculas de banda) +
condición de equipos (vibración, T de rodamientos, corriente de motor) + calidad (analítica de sensores) +
energía. Usos: análisis de cuellos de botella, escenarios hipotéticos de composición de alimentación, planificación del mantenimiento,
formación de operadores. Empezar por un modelo de datos y un historian; evitar construir una maqueta 3D de exhibición
sin uso operativo.

## 6. Nivel de automatización frente a dotación de personal
Las plantas de RSU "totalmente automatizadas" siguen necesitando personal: operadores de grúa/cargadora (pueden ser remotos),
triadores de control de calidad (pueden reducirse con robots), cuadrillas de mantenimiento, sala de control, maquinaria
móvil, laboratorio. Presentar explícitamente la dotación de personal por turno.
