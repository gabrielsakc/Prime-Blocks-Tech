# Implantación de planta, superficie de terreno y logística

## 1. Áreas a asignar
Caseta de control y básculas puente (entrada/salida) · cola de camiones (dentro de la parcela, nunca en la vía pública) ·
nave de descarga / foso (recepción + pulmón) · naves de pretratamiento y procesamiento · tratamiento
orgánico (AD / túneles / maduración) · producción y almacenamiento de RDF/SRF · almacenamiento de balas de producto
(cubierto) · carga de rechazos/residuos · taller de mantenimiento y almacén · salas eléctricas,
transformadores, MCC · sala de control y oficinas · laboratorio · servicios auxiliares (compresores, agua,
depósito y bombas de agua contra incendios) · tratamiento de olores (lavadores, biofiltros) · tratamiento de aguas residuales/lixiviados
· balsas de pluviales · aparcamiento · viales internos (circuito de sentido único) · acceso para bomberos ·
franja verde / retranqueos · reserva de ampliación.

## 2. Principios de flujo
Flujo de material unidireccional; separar el flujo de camiones (vehículos pesados) del flujo de personal/visitantes;
camiones de entrada y de salida por básculas puente separadas; sin cruces entre
camiones de producto limpio y camiones de residuos cuando sea posible; acceso de mantenimiento para grúa/carretilla elevadora
a todos los equipos principales; sectorización contra incendios entre foso, proceso y almacenamiento (muros cortafuegos,
distancias según código/aseguradora).

## 3. Método de estimación de la superficie de terreno
1. Calcular cada área a partir del dimensionamiento del proceso (volumen/altura del foso, número de túneles, diámetros
   de digestores, días de almacenamiento × densidad × altura de pila, longitudes de viales × ancho).
2. Sumar edificios + áreas de proceso abiertas → **huella de proceso**.
3. Añadir viales y maniobras (típicamente 20–30 % de la huella), franjas de protección/ajardinamiento y
   retranqueos (10–20 %), reserva de ampliación (10–20 %) `[ASSUMPTION — confirm with local
   zoning]`.
4. Contrastar con plantas de referencia reales del mismo tipo de tratamiento biológico (buscar y
   citar). Las superficies publicadas varían mucho: el compostaje en hileras abiertas ocupa varias
   veces más que túneles cerrados o AD. Sin referencia verificada, no dar un ratio ha/(t/año)
   como dato: calcularlo por áreas y marcarlo `NOT VERIFIED — engineering assumption`.
   (Ejemplo calculado con este método: MBT de 2.600 t/d con AD seca, túneles y maduración
   cerrada ≈ 2,2 ha por 100.000 t/año incluyendo viales y franja perimetral `[CALC]`.)

## 4. Logística (`scripts/logistics_storage.py`)
- Camiones/día de entrada = TPD / carga útil (camiones compactadores de RSU 8–14 t; semirremolques de transferencia 18–25 t).
- Camiones en hora punta = camiones/día × proporción de hora punta (p. ej. 15–20 % en 1 h para la recogida urbana).
- Capacidad de la báscula puente ≈ 20–30 pesadas/h cada una `[LIT]` → número = camiones punta/h ÷ 25,
  ×2 para entrada/salida, + 1 de redundancia.
- Muelles de descarga = camiones punta/h × tiempo de descarga (6–10 min) / 60 × margen.
- Camiones de salida: productos (balas ~ 20–24 t por semirremolque, limitado por volumen para balas ligeras),
  RDF (semirremolques de piso móvil de 90 m³, 25–35 t), rechazo (volquetes 25–30 t).
- Almacenamiento: material bruto (foso 2–3 días), productos (5–15 días), RDF (3–7 días a granel, más si está
  embalado/envuelto), maduración de compost (semanas).
