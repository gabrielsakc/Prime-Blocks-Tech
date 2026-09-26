# Residuos orgánicos: compostaje, digestión anaerobia, secado

## 1. Parámetros clave
TS (sólidos totales, % en húmedo), VS (sólidos volátiles, % de TS), humedad = 100 − TS, C/N,
densidad aparente, contaminantes (plástico, vidrio, piedras), pH, NH4-N, grasas (FOG).

Típicos `[LIT]`: residuos alimentarios TS 15–30 %, VS/TS 85–95 %; finos orgánicos de RSU mezclado (< 80 mm)
TS 35–55 %, VS/TS 50–70 % (contiene inertes); restos de poda TS 40–60 %; estiércol (vacuno)
TS 8–15 %.

## 2. Digestión anaerobia (AD)

Rendimiento de biogás `[LIT]` (por t de VS alimentado, mesófilo/termófilo):
- Residuos alimentarios: 400–600 Nm³ biogás/t VS (CH4 55–65 %).
- FORSU (OFMSW) de separación mecánica: 300–450 Nm³/t VS.
- Restos de poda: 150–300 Nm³/t VS (limitado por la lignina); estiércol 200–350.
Se requiere el ensayo de potencial bioquímico de metano (BMP) `[TEST]`.

Ecuaciones:
- Carga de VS = m_wet × TS × VS/TS.
- Biogás (Nm³/d) = carga de VS (t/d) × Y (Nm³/t VS).
- Energía del CH4: 1 Nm³ CH4 = 35.8 MJ (LHV) = 9.97 kWh.
- CHP: η_el 38–42 %, η_th 40–45 % `[LIT]`. Alternativa de upgrading a biometano
  (membranas, lavado con agua, PSA, aminas) — fugas de metano y consumo eléctrico 0.2–0.3
  kWh/Nm³ de biogás bruto `[LIT]`.
- Volumen del digestor: V = carga de VS / OLR; OLR 2–5 kg VS/(m³·d) sistemas húmedos, 6–10 secos
  de flujo pistón; HRT 15–30 d mesófilo, 12–20 termófilo `[LIT]`.
- Masa: digestato = alimentación − masa de biogás (ρ_biogas ≈ 1.15–1.25 kg/Nm³ a 55–65 % CH4).

Los digestores secos (alto contenido en sólidos, 20–40 % TS) de flujo pistón o por lotes tipo garaje son robustos para
la FORSU separada mecánicamente con contaminantes; el CSTR húmedo necesita un pretratamiento extenso
(pulper, eliminación de arenas/flotantes). Autoconsumo del 8–15 % de la electricidad producida `[LIT]`.

Digestato: deshidratación (prensa de tornillo/decantador) → sólido (25–35 % TS) a compostaje/maduración;
líquido → recirculación, recuperación de nutrientes (stripping de N, estruvita) o EDAR (WWTP).
Control de H2S (desulfuración biológica, FeCl3, carbón activo). Antorcha obligatoria.

## 3. Compostaje

Sistemas: hilera abierta (menor CAPEX, mayor superficie, riesgo de olores), pila estática aireada (ASP)
con cubiertas, túnel / cerrado (el más rápido, control de olores, mayor CAPEX), tambores en reactor.
Diseño: fase intensiva 2–4 semanas (túnel) / 4–8 semanas (hilera) + maduración 4–8 semanas.
Temperaturas ≥ 55 °C durante ≥ 3 días (higienización tipo PFRP; verificar el criterio normativo).
Pérdida de masa 40–60 %, reducción de volumen 50–70 % `[LIT]`. Aireación 5–20 Nm³/(t·h) durante
la fase intensiva `[LIT]`. Humedad 45–60 %, C/N inicial 25–35 (añadir agente estructurante:
astilla de madera, restos de poda).

Superficie `[LIT]` (incl. pasillos): hilera ~ 1.5–3.0 m²/(t/año) … expresar mediante la geometría de la pila:
volumen = masa/ρ; sección trapezoidal de hilera (p. ej., 3 m de altura × 6 m de base) + pasillos. Usar
la función auxiliar de pilas de `scripts/logistics_storage.py`.

Afino: trómel 10–20 mm, despedregador/balístico, separador neumático (eliminación de film) — la calidad del producto
depende de los contaminantes físicos (vidrio, plástico > 2 mm) — comprobar las normas (p. ej.
EU FPR, US Composting Council STA, normas locales).

## 4. Secado / biosecado
El biosecado aprovecha el autocalentamiento orgánico en túneles para reducir la humedad (de ~40 % a 15–20 %)
produciendo una fracción más seca para SRF. Secado térmico: calor específico ~ 0.8–1.0 kWh_th por
kg de agua evaporada (secadores de banda/tambor) `[LIT]`.

## 5. Emisiones
NH3, COV, olor (OU/m³), bioaerosoles. Naves cerradas con 2–4 renovaciones de aire/h, carga del biofiltro
80–150 m³/(m²·h) `[LIT]`; lavador ácido aguas arriba para el NH3.

OEM candidatos (verificar): Thöni, Kompogas (Hitachi Zosen Inova), Eggersmann, BTS Biogas,
Strabag Umwelttechnik, Bekon, Komptech (volteadoras, cribas), Backhus, Weltec, integradores
Veolia/Suez.
