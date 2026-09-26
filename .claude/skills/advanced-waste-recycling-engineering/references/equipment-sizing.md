# Dimensionamiento de equipos (conceptual, L1–L2)

Todas las ecuaciones están implementadas en `scripts/equipment_capacity.py` (ejecutar con `--help`).
Los resultados son conceptuales; el dimensionamiento final requiere confirmación del OEM `[OEM]` y, para
los equipos de separación, ensayos con material `[TEST]`.

## 1. Capacidad de diseño

```
Operating hours/day  H = shifts × hours/shift − planned breaks
Average hourly feed  Q_avg = TPD / H                           [t/h]
Design capacity      Q_des = Q_avg × F_peak / A_mech            [t/h]
  F_peak  : daily/seasonal peak factor (typ. 1.10–1.25 MSW)
  A_mech  : mechanical availability of the line (typ. 0.85–0.92)
Utilization U = actual operating time / calendar time
OEE = Availability × Performance × Quality
```
Donde:
- H: horas de operación/día = turnos × horas/turno − pausas planificadas.
- Q_avg: alimentación horaria media; Q_des: capacidad de diseño.
- F_peak: factor de punta diario/estacional (típ. 1.10–1.25 para RSU/MSW).
- A_mech: disponibilidad mecánica de la línea (típ. 0.85–0.92).
- U: utilización = tiempo real de operación / tiempo calendario; OEE = Disponibilidad × Rendimiento × Calidad.

En muchas ciudades la recepción es 7 días/semana mientras que el procesamiento puede ser de 6 d o 7 d — el foso
absorbe la diferencia (véase `plant-layout.md`).

## 2. Transportadores de banda

Capacidad volumétrica: `Q_v = 3600 · A · v · k_incl`  [m³/h]; másica `Q_m = Q_v · ρ / 1000` [t/h]
- Banda plana, ángulo de sobrecarga β: ancho útil b = 0.9·B − 0.05 (m); A = b² · tan β / 4.
- Artesa de 3 rodillos: A ≈ k_A · b², k_A ≈ 0.10–0.17 según la artesa (20–45°) y la sobrecarga.
- Bandas de triaje: A = b · h_burden (monocapa; h ≈ 1–2 × d50).
- k_incl: 1.0 horizontal; 0.95 a 10°; 0.85 a 18°; 0.76 a 20° `[LIT]` (inclinación máx. para
  RSU ~ 18–22° con tacos/chevrones; usar 30–45° solo con bandas con tacos/bordes de contención).
- Velocidades `[LIT]`: alimentación de RSU 0.3–1.0 m/s; triaje 0.2–0.5 m/s; banda de aceleración NIR 2.5–3.5 m/s.

Potencia de accionamiento (DIN 22101 simplificada):
```
m'_L = Q_m·1000 / (3600·v)                         material load [kg/m]
F_U  = C·f·L·g·(m'_R + 2·m'_G + m'_L) + g·m'_L·H    [N]
P    = F_U·v / (η·1000)                             [kW]; motor = P × 1.15–1.25 margin
C: 1.5–3 (short conveyors high), f: 0.02–0.03, m'_R idlers 8–25 kg/m, m'_G belt 8–25 kg/m
```
Donde: m'_L carga de material [kg/m]; motor = P × margen de 1.15–1.25; C: 1.5–3 (alto en transportadores
cortos); f: 0.02–0.03; m'_R rodillos 8–25 kg/m; m'_G banda 8–25 kg/m.

## 3. Transportadores de tornillo
`Q_m = 60 · (π/4) · (D² − d²) · S · n · φ · ρ / 1000`  [t/h] (D, d eje, S paso en m;
n rpm; φ llenado 0.15–0.45 según la clase de material). Potencia (simplificada, tipo CEMA):
`P = Q_m·(L·λ + H)·g / 3600 / η` con λ = factor de material 1.2–4 `[LIT]`.

## 4. Tolvas, fosos, silos
`V_required = m_stored / (ρ_bulk · f_fill)`; foso de recepción de RSU: diseñar para
1.5–3 días de entradas `[ASSUMPTION — define]`. Altura de residuo en el foso típicamente 10–25 m
con grúas de pulpo; altura de pila en playa de descarga 3–5 m con palas cargadoras.
Capacidad de la grúa de pulpo: `cycles/h = 3600 / t_cycle`; `Q = cycles/h × V_grab × ρ × f_fill`.

## 5. Trómeles
Velocidad crítica `n_c = 42.3 / √D` rpm (D m); operar al 30–45 % de n_c.
Capacidad por carga específica de superficie `[LIT]` para RSU: 0.3–1.0 t/(h·m² de superficie de cribado)
según el tamaño de corte y la humedad → `A_screen = Q_des / q_spec`; `A = π·D·L_screen`;
L/D 3–5. Motor típicamente 30–90 kW para D 3–4 m.

## 6. Reducción de tamaño
`P_motor = SEC · Q_des / LF` (SEC energía específica kWh/t, LF factor de carga del motor 0.7–0.85).
SEC `[LIT]`: abrebolsas de RSU 1–3 kWh/t; pretriturador lento 3–8; triturador secundario de RDF
(< 30–50 mm) 15–35; trituradora de mandíbulas 0.5–2; granulador de plástico 30–80; neumático a 20 mm 50–80.
El índice de trabajo de Bond se aplica a minerales frágiles (C&D): `W = 10·Wi·(1/√P80 − 1/√F80)` (µm).

## 7. Clasificadores por sensor y ECS
Ancho requerido `W = Q_stream / q_OEM` (t/h por m), redondear al ancho normalizado superior
(1.0/1.4/2.0/2.8 m típicos). Aire comprimido `V_air = N_valves·duty·v_valve` → obtener del OEM.

## 8. Empacadoras
Producción = balas/h × masa de bala; masa de bala = V_bale × ρ_bale (OCC 450–600, PET 250–400,
films 400–600, latas de Al 250–350 kg/m³ `[LIT]`).

## 9. Lavado / deshidratación (plásticos)
Tiempo de residencia en tanque de hundido-flotado 30–120 s; carga superficial según el OEM. Secador centrífugo: hasta 1–3 %
de humedad. Carga térmica del secador térmico `Q = ṁ_w·(h_fg + cp·ΔT)`; h_fg ≈ 2.26–2.44 MJ/kg.

## 10. Captación de polvo
`Q_air = Σ(hood face area × capture velocity)` (Σ área frontal de campana × velocidad de captación); área de filtro = Q_air / relación aire-tela
(pulse-jet 1.0–1.5 m³/(m²·min) para polvo fibroso de residuos `[LIT]`).

## 11. Campos de la hoja de datos de equipo (para cada elemento)
ID de equipo · Tipo · Función · Capacidad nominal · Capacidad de diseño · Potencia del motor · Cant. ·
Redundancia (N, N+1, reserva compartida) · Materiales de construcción (revestimientos antidesgaste: Hardox
400/500 o equivalente — verificar) · Filosofía de control (local/remoto, VFD, enclavamientos).
