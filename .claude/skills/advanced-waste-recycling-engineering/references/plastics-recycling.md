# Reciclaje de plásticos

## 1. Datos de resinas `[LIT]` (típicos; confirmar grados)

| Resina | Densidad g/cm³ | ¿Flota en agua? | Ruta de reciclaje típica | Contaminantes / problemas clave |
|---|---|---|---|---|
| PET | 1.33–1.40 | no | botella a escama: lavado en caliente (NaOH ~1–2 %, 80–90 °C), hundido-flotado, clasificación de escamas, SSP para grado alimentario | PVC (≥ 50 ppm provoca puntos negros), etiquetas, adhesivo, tapones (PO) |
| HDPE | 0.94–0.97 | sí | lavado, flotación, extrusión, granulado | mezcla con tapones de PP, olor, color |
| LDPE/LLDPE | 0.91–0.94 | sí | film: trituración, lavado por fricción, escurrido/secado térmico, aglomeración o extrusión directa con desgasificación | humedad, etiquetas de papel, tintas de impresión |
| PP | 0.90–0.91 | sí | lavado, flotación, extrusión | contaminación cruzada con PE (separable por NIR antes de la molienda) |
| PS | 1.04–1.06 | no | lavado, extrusión | frágil; se mezcla con el PET en el hundido |
| EPS/XPS | 0.015–0.04 (espuma) | sí | densificar (compactador o térmico), extruir a GPPS | densidad aparente muy baja → logística; HBCD en aislamiento antiguo de XPS/EPS |
| PVC | 1.30–1.45 | no | corriente separada; liberación de HCl por encima de ~200 °C | debe eliminarse del PET y de las rutas térmicas |
| ABS | 1.03–1.07 | no | plásticos de RAEE: densidad + electrostática | BFR en RAEE — comprobar la normativa POPs |
| PC | 1.20–1.22 | no | RAEE/automoción | restricciones relacionadas con el BPA |
| PA | 1.13–1.15 | no | fibras/moquetas, automoción | higroscópico → secar antes de extruir |
| PLA | 1.24–1.25 | no | volúmenes pequeños; contaminante en el PET | detectable por NIR |
| Multicapa | – | – | valorización energética, compatibilización, basado en disolventes (Pilot/Demo) | capas no separables mecánicamente |

## 2. Línea de reciclaje mecánico (seleccionar etapas)

Rompedor de balas → preclasificación (NIR/manual) → trómel de prelavado/seco → trituración / granulación
en húmedo (escamas de 10–20 mm) → lavadora por fricción → hundido-flotado (tanque o hidrociclón) →
lavado en caliente (PET o PO sucio) → aclarado → secador mecánico (centrífugo) → secador térmico
→ clasificación de escamas (color/NIR/metal) → silos → extrusión con filtración del fundido
(cambiador de mallas o filtro láser) y desgasificación a vacío → granulación (hilo, bajo agua,
anillo de agua) → silo de homogeneización → ensacado (big bags).

Parámetros clave `[LIT]`:
- Consumo de agua (líneas de lavado, bien recirculadas): 1–5 m³/t; líneas abiertas hasta 10 m³/t.
- Electricidad de la línea de lavado: 250–450 kWh/t de entrada; extrusión + granulación 250–450 kWh/t.
- Líneas de film: rendimiento 70–85 % (de entrada a granza) según suciedad/humedad; PET de botella
  de bala a escama 70–85 %.
- Humedad de la escama tras el secador mecánico 1–3 %; la extrusión necesita < 1 % (PO con desgasificación)
  y < 50 ppm para PET (cristalizar + secar).

## 3. Especificaciones de producto (ejemplos típicos a acordar con el comprador)

Escama de PET: PVC < 50 ppm, PO < 20 ppm, metal < 20 ppm, adhesivo < 10 ppm, humedad < 1 %,
IV según el comprador. Granza de PO: MFI (ISO 1133), densidad, cenizas < 1–2 %, humedad < 0.1 %,
malla de filtración, color, olor, geles.

## 4. Reciclaje químico (evaluar con espíritu crítico)

| Ruta | Alimentación | Estado (verificar por proveedor) |
|---|---|---|
| Glicólisis / metanólisis / enzimática (despolimerización de PET) | PET | Demo → primera planta comercial |
| Purificación con disolventes (disolución) | PO, PS, multicapa | Pilot → Demo |
| Pirólisis a aceite | plásticos mixtos ricos en PO (bajo PVC, bajo PET) | Demo → comercial incipiente; rendimiento/calidad variables |
| Gasificación | mixtos | Demo |

No recomendar el reciclaje químico como caso base de una planta comercial sin referencias del proveedor
a escala, especificaciones de alimentación, compradores para los productos e ingeniería completa de seguridad/emisiones.
Indicar explícitamente el TRL.

## 5. Aspectos específicos de seguridad
Polvo combustible de la molienda (los polvos de PE, PP y PS son combustibles — verificar Kst/MIE mediante ensayo),
calentadores de aceite térmico o eléctricos en la extrusión, manipulación de sosa caliente, cargas de fuego en el almacenamiento
de balas (véase `safety.md`).

OEM candidatos (verificar): Herbold Meckesheim, Sorema, Lindner, Amut, Krones, Starlinger,
EREMA, NGR, Gneuss, Coperion, Vecoplan, Zerma, Tomra.
