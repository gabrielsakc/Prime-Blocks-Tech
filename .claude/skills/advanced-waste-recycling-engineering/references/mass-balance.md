# Metodología del balance de masa

## 1. Principio

`INPUT = PRODUCTS + BYPRODUCTS + REJECTS + LOSSES` (ENTRADA = PRODUCTOS + SUBPRODUCTOS + RECHAZOS + PÉRDIDAS) para cada etapa y para la planta.
Las pérdidas incluyen la evaporación de humedad, CO2/CH4 (biológico), polvo y finos al agua residual.
Cierre = Σsalidas / Σentradas × 100 %. Objetivo 100.0 ± 0.5 %. Reportarlo siempre.

## 2. Método: coeficientes de transferencia (TC)

Para cada operación unitaria *u* y fracción de material *i*, se define el coeficiente de transferencia
`TC(u,i,→k)` = proporción de la fracción *i* que entra en *u* y se dirige a la salida *k*.
Σk TC(u,i,→k) = 1 para cada *i* (el script lo valida).

Ejemplo para un separador magnético overband, fracción férrica: 0.90 → producto Fe, 0.10 → pasa de largo.
Para la pureza del producto Fe: pureza = m(Fe en el producto)/m(producto).

Recuperación (rendimiento) de la fracción *i* al producto *k*: `R = m(i→k)/m(i in feed)`.
Pureza del producto *k*: `P = m(target in k)/m(k)`.
Rechazos = lo que se envía a vertedero/eliminación. Reportar recuperación y pureza por separado; una
recuperación alta con pureza baja no es un producto vendible.

## 3. Rangos típicos de TC `[LIT]` (equipos en buen estado, espesor de capa correcto)

| Unidad | Objetivo | Recuperación al objetivo | Pureza del producto |
|---|---|---|---|
| Abrebolsas | apertura de bolsas | 90–98 % de bolsas abiertas | – |
| Trómel (corte 60–80 mm) | finos/orgánicos al hundido | 75–90 % | orgánicos 60–80 % en el hundido |
| Separador balístico | separación 2D/3D | 80–90 % | 80–90 % |
| Separador magnético overband | Fe | 85–95 % | 90–98 % |
| Corrientes de Foucault (NF, > 10 mm) | Al/NF | 80–95 % | 85–95 % |
| Clasificador óptico NIR (por pasada) | resina objetivo | 80–95 % | 85–95 % (1 pasada), 95–98 % (2 pasadas) |
| Separador neumático / cuchilla de aire | ligeros (film/papel) | 80–95 % | 70–90 % |
| Hundido-flotado hidráulico (PO) | PO flotante | 95–99 % | 97–99 % |

Todos `[LIT]`: varían con el espesor de capa, la PSD, la humedad y la velocidad de banda. Confirmar con las garantías
del OEM `[OEM]` y ensayos piloto `[TEST]`.

## 4. Seguimiento de la humedad

Seguir el agua como un componente propio. Cuando una corriente se seca o se composta, la humedad sale como
vapor (una pérdida, no un producto). La degradación biológica convierte los VS en CO2 + H2O (+ CH4 en AD):
- Compostaje: se pierde el 40–60 % de la masa húmeda inicial `[LIT]` (agua + CO2).
- AD: masa de biogás ≈ 1.15–1.25 kg/Nm³ (a ~55–65 % CH4) `[LIT]`; digestato = alimentación −
  masa de biogás (− filtrado de deshidratación si se separa).

## 5. Tablas a entregar

1. Balance a nivel de planta (t/d y t/h de diseño) por categoría de salida.
2. Balance por etapa (cada unidad: entradas, salidas, TC utilizado, procedencia).
3. Tabla de corrientes (S01, S02 …: caudal kg/h, composición %, humedad %, T si procede).
Usar `scripts/mass_balance.py` (valida Σ TC = 1 y el cierre) y
`templates/mass-balance.csv`.
