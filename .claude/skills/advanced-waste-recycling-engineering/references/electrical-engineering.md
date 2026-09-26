# Ingeniería eléctrica (conceptual)

## 1. Lista de cargas eléctricas
Campos: Tag · Descripción · kW del motor · HP (= kW/0.7457) · Tensión · FLA · Método de
arranque (DOL, Y-Δ, arrancador suave, VFD) · Servicio (continuo/intermitente/reserva) ·
Factor de carga (LF) · Factor de utilización/diversidad (DF) · kW en operación = kW × LF × DF.
Plantilla: `templates/electrical-load-list.csv`. Cálculo: `scripts/energy_balance.py`.

## 2. Ecuaciones
- FLA (trifásica) ≈ P_kW·1000 / (√3 · V · η · PF); valores por defecto η 0.94, PF 0.85 `[ASSUMPTION]`.
- Carga conectada = Σ kW instalados (excluyendo unidades de reserva → listar por separado).
- Carga en operación (media) = Σ kW·LF·DF.
- Demanda punta ≈ carga en operación × 1.1–1.25 más la contribución de arranque del motor más grande.
- Energía (kWh/d) = kW en operación × horas de operación; kWh/t específico = kWh/d ÷ t/d.
- kVA del transformador = kW punta / PF / carga (0.8) → siguiente tamaño normalizado
  (1000/1250/1600/2000/2500/3150 kVA); N+1 o 2×(≥ 60–70 %) para disponibilidad.

## 3. Consumo específico típico `[LIT]` (planta completa, para comprobaciones de coherencia)
MRF limpio 15–35 kWh/t; MRF de residuos mezclados / parte mecánica de MBT 20–45 kWh/t; compostaje en túnel
20–50 kWh/t (ventiladores); AD seca 30–60 kWh/t (autoconsumo); lavado+granulado de plásticos
500–900 kWh/t; granulado de neumáticos (crumb) 150–300 kWh/t.

## 4. Concepto de distribución
Subestación MT/AT de la compañía → celdas de MT → transformadores secos o en aceite por área →
cuadros de BT → MCCs (MCC inteligente con Profinet/EtherNet-IP) → VFDs para transportadores,
ventiladores, bombas, bandas de aceleración de los clasificadores. Compensación del factor de potencia (con reactancias de desintonía
debido a los armónicos de los VFD; comprobaciones según IEEE 519 / IEC 61000). UPS para PLC/SCADA/sistemas contra incendios
(30–60 min). Grupo electrógeno diésel de emergencia para bombas contra incendios (si son eléctricas), alumbrado de emergencia,
ventiladores de olores (parada segura), sistema contra incendios del foso. Puesta a tierra y protección contra el rayo.
Clasificación de áreas peligrosas donde haya biogás/polvo (NEC 500/505/506 o IEC 60079 — verificar).
Códigos a verificar: NEC (NFPA 70), NFPA 70E, IEC 60364, IEC 61439.
`Applicability must be confirmed for project jurisdiction.` (La aplicabilidad debe confirmarse para la jurisdicción del proyecto.)
