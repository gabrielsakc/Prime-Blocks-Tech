# Diseño de proceso: bases, cribado, BFD/PFD, KPIs, due diligence

## 1. Bases de diseño (redactar antes de diseñar)
Alimentación (rango y punto de diseño), días de operación/año, turnos, horas, objetivo de disponibilidad,
productos y especificaciones, datos del emplazamiento (clima, altitud, sismicidad, suelo), servicios auxiliares disponibles,
tensión de red, fuente de agua, vía de vertido, jurisdicción aplicable, nivel de ingeniería
(L0–L4), clase de estimación.

## 2. Matriz de cribado tecnológico
Puntuación 1–5 por criterio; pesos acordados con el usuario (pesos por defecto entre paréntesis).
TRL (15) · adecuación a la capacidad (10) · recuperación (10) · pureza (10) · electricidad (5) · calor (3) ·
agua (3) · complejidad (5) · mantenimiento (7) · disponibilidad (7) · CAPEX (8) · OPEX (7) ·
huella (3) · riesgo (5) · escalabilidad (2). Añadir una fila separada: "comercialmente viable
(¿salida de mercado verificada?)". Nunca seleccionar por novedad.

## 3. BFD → PFD
- BFD: bloques por área (100 recepción, 200 pretratamiento, 300 línea seca, 400 orgánicos,
  500 RDF, 600 productos/almacenamiento, 700 servicios auxiliares, 800 tratamiento de olores/aire, 900 agua).
- Tags de equipos del PFD (número de área como centenas): H tolva · BK foso · CR grúa ·
  CV transportador · BO abrebolsas · SH trituradora · CRU machacadora · TR trómel · SC criba ·
  BS separador balístico · WS separador neumático · MS separador magnético · EC corrientes de Foucault ·
  OS clasificador óptico · RB clasificador robótico · QC cabina de control de calidad · BL empacadora ·
  WR envolvedora · CO compactador · DG digestor · CT túnel de compostaje · TU volteadora ·
  DR secador · CE centrífuga · EX extrusora · PL granuladora · SI silo · BF biofiltro ·
  SCR lavador · DC colector de polvo · FN ventilador · CP compresor · P bomba · TK tanque ·
  GE motor de gas/CHP · FL antorcha.
  Ejemplo: `SH-201` pretriturador en el área 200; letras de tren para líneas en paralelo
  (`TR-301A/B`).
- Corrientes `S01…Snn` con una tabla de corrientes: caudal (kg/h), composición, humedad, T.

## 4. KPIs
Producción t/h · Disponibilidad % · Utilización % · OEE % · Recuperación % por producto ·
Pureza % por producto · Rechazo % (desvío de vertedero = 1 − vertedero/entrada) · kWh/t ·
agua L/t · mano de obra h/t · mantenimiento $/t · tiempo de parada por causa (Pareto).

## 5. Lista de comprobación de due diligence tecnológica (Modo 10)
1. Afirmaciones frente a evidencias: plantas de referencia con alimentación y escala similares; horas de operación
   alcanzadas; visitar y entrevistar a los operadores.
2. Balance de masa y energía auditado por un tercero; cierre.
3. Contratos de venta de producto / especificaciones cumplidas según laboratorio independiente.
4. Garantías de rendimiento (producción, recuperación, pureza, disponibilidad, energía) y
   penalizaciones (liquidated damages).
5. Emisiones y permisos obtenidos en las plantas de referencia.
6. Libertad de operación en materia de PI; estado de las patentes (buscar, no suponer).
7. Solvencia financiera del proveedor, red de servicio, plazos de entrega de repuestos.
8. Riesgo de escalado (un factor piloto → comercial > 10× es una señal de alerta).
9. Señales de alerta: ninguna referencia en operación, afirmaciones de "cero emisiones/cero residuos", TRL
   no verificable, balance que no cierra, ingresos por productos que dominan el análisis económico.

## 6. Método de resolución de problemas (Modo 9)
Definir el síntoma y la desviación del KPI → datos (tendencias, alarmas, balances, muestras) → árbol de
hipótesis (cambio de alimentación, desgaste de equipos, ajustes, control, operador) → probar primero lo más barato →
corregir → verificar el KPI → actualizar PM/SOP.
