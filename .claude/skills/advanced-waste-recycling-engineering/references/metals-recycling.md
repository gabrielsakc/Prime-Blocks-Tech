# Reciclaje de metales (férricos / no férricos)

## 1. Materiales `[LIT]`

| Metal | Densidad g/cm³ | Magnético | Conductividad (índice ECS σ/ρ) | Notas |
|---|---|---|---|---|
| Acero al carbono | 7.85 | sí | – | recuperar con imanes |
| Inoxidable 304/316 | 7.9–8.0 | débilmente / no (austenítico) | baja | clasificación por inducción/XRF |
| Aluminio | 2.70 | no | alta (el mejor para ECS) | latas, perfiles, fundición |
| Cobre | 8.96 | no | σ alta, ρ alta | cables, recuperable por ECS si > ~10 mm |
| Latón | 8.4–8.7 | no | media | XRF/XRT |
| Zinc | 7.14 | no | media | inyección a presión |
| Aleaciones de Ni | ~ 8.2–8.9 | algo | baja | XRF/LIBS |

## 2. Procesos

Fragmentadora (molino de martillos, 1,000–6,000+ kW para fragmentadoras de automóviles) → Z-box / separación neumática (retirada del "fluff"
ASR) → tambores magnéticos (Fe) → triaje → ECS (Zorba = NF mixto) → clasificación por sensor:
- Clasificador por inducción: recupera cables e inoxidable.
- XRT: separa metales ligeros (Al, Mg) de los pesados (Cu, Zn, latón) — "Zorba to Twitch/Zebra".
- XRF / LIBS: clasificación a nivel de aleación (p. ej., Al de forja frente a Al de fundición, series de aleación específicas).
El briquetado de virutas/torneaduras (briquetadora hidráulica) mejora el rendimiento de fusión y la logística.

## 3. Productos (grados ISRI/ReMA / EN 13920 / EU-3 — verificar versiones de las especificaciones)
Fragmentado de Fe (p. ej., ReMA 210/211), Zorba, Twitch, Zurik, UBC (Taldack), grados de cobre.

## 4. Datos de diseño
Dimensionamiento de imanes: espesor de capa, altura de suspensión (típicamente 150–500 mm), velocidad de banda; obtener
las curvas de intensidad de campo frente a distancia `[OEM]`. ECS: alimentación en monocapa, posición del divisor,
velocidad del rotor 2,000–4,000 rpm `[LIT]`; los férricos deben retirarse aguas arriba (calientan la carcasa del rotor).

## 5. Riesgos
Explosiones en fragmentadoras (bombonas de gas, aerosoles) → campanas de alivio de explosión, inspección
de entrada; incendio en pilas de ASR; baterías de Li-ion en la chatarra; ruido > 100 dB(A) en las fragmentadoras.

OEM candidatos (verificar): Metso (Lindemann), sistemas integrados tipo Schnitzer, Steinert,
Eriez, TOMRA, Sesotec, Redwave, Hustler/Newell (fragmentadoras), Riverside/Harris (empacadoras).
