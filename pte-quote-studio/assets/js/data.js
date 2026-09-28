/* PTE Quote Studio — product data and document copy (EN / ES).
   Sources: PTE_20MW_Data_Sheet, PTE POWER Vaca Muerta deck (Sep 2026), ptepower.com.
   Values marked "indicative" are confirmed in the project datasheet after FAT. */

const SELLER_DEFAULT = {
  company: "Portable Turbine Energy LLC",
  brand: "PTE POWER",
  web: "ptepower.com",
  email: "info@ptepower.com",
  phone: "+1 646 350 3999",
  address: ""
};

/* hr = indicative heat-rate band, Btu/kWh (LHV). Smaller machines run less efficiently. */
const MODELS = [
  { id: "PTE-1",   mw: 1,   hr: [13000, 15500], rpm50: 1500, rpm60: 1800, volt: "4.16 kV" },
  { id: "PTE-3.8", mw: 3.8, hr: [11500, 13200], rpm50: 1500, rpm60: 1800, volt: "4.16 kV" },
  { id: "PTE-5",   mw: 5,   hr: [11000, 12800], rpm50: 1500, rpm60: 1800, volt: "13.8 kV" },
  { id: "PTE-10",  mw: 10,  hr: [10000, 12000], rpm50: 1500, rpm60: 1800, volt: "13.8 kV" },
  { id: "PTE-15",  mw: 15,  hr: [9500, 11800],  rpm50: 1500, rpm60: 1800, volt: "13.8 kV" },
  { id: "PTE-20",  mw: 20,  hr: [9000, 11500],  rpm50: 1500, rpm60: 1800, volt: "13.8 kV" },
  { id: "PTE-24",  mw: 24,  hr: [8800, 11200],  rpm50: 1500, rpm60: 1800, volt: "13.8 kV" }
];

const MODEL_COPY = {
  en: {
    "PTE-1": {
      name: "PTE-1 · 1 MW Compact Power System",
      tag: "Entry-level prime power for remote and critical sites",
      desc: "The PTE-1 packages a 1 MW aeroderivative gas turbine generator into two joined 20 ft ISO containers. It is the natural first step for operators who want turbine reliability and fuel flexibility without committing to a large block: remote camps, telecom and pumping stations, well-pad artificial lift, small industrial plants, hospitals and pilot projects that will later grow in 1 MW steps.",
      apps: ["Remote camps & mining exploration", "Artificial lift & well-pad loads", "Hospitals, campuses & critical facilities", "Pilot projects before scaling"],
      why: "Lowest capital entry to the PTE platform, same controls and service model as the larger units."
    },
    "PTE-3.8": {
      name: "PTE-3.8 · 3.8 MW Distributed Power System",
      tag: "Compact block for distributed and commercial loads",
      desc: "The PTE-3.8 delivers 3.8 MW of continuous prime power from an aeroderivative gas turbine and a synchronous generator in two joined 20 ft ISO containers. It fills the gap between site-level and facility-level power: well-pad clusters, hospitals and campuses, cold storage and food processing, water treatment and commercial complexes that need more than a genset fleet but less than a utility block.",
      apps: ["Hospitals, campuses & commercial complexes", "Well-pad clusters & gas gathering", "Cold storage, food & water treatment", "Distributed generation & peak shaving"],
      why: "Replaces a fleet of two to four diesel gensets with one turbine package and a single maintenance plan."
    },
    "PTE-5": {
      name: "PTE-5 · 5 MW Industrial Power System",
      tag: "Mid-size prime and bridge power",
      desc: "The PTE-5 delivers 5 MW of continuous prime power from an aeroderivative gas turbine and a synchronous generator in two joined 20 ft ISO modules. It is sized for drilling rigs, agro-industrial and food plants, mid-size mines, water and pumping infrastructure and bridge power while a grid connection is built.",
      apps: ["Drilling rigs & production batteries", "Agro-industry, food & process plants", "Mining camps & processing", "Bridge power until the grid arrives"],
      why: "Replaces three to five diesel gensets with a single turbine package burning gas instead of trucked diesel."
    },
    "PTE-10": {
      name: "PTE-10 · 10 MW Utility-Grade Power System",
      tag: "Facility-scale generation in two containers",
      desc: "The PTE-10 brings 10 MW of utility-grade generation to the site in two joined 20 ft ISO containers. It fits central processing facilities, compression, data-center power blocks, industrial parks and municipal peaking, operating islanded, as a microgrid or in parallel with the utility.",
      apps: ["Oil & gas facilities and compression", "Data-center and AI power blocks", "Industrial parks & manufacturing", "Municipal and utility peaking"],
      why: "High power density: 10 MW on a footprint smaller than a tennis court, redeployable when the load moves."
    },
    "PTE-15": {
      name: "PTE-15 · 15 MW High-Output Power System",
      tag: "Heavy industrial and grid-support power",
      desc: "The PTE-15 is a 15 MW aeroderivative gas turbine generator in two joined 20 ft ISO modules, built for heavy continuous loads: mines and concentrators, cement and steel operations, large compression stations, grid support and fast-start reserve capacity.",
      apps: ["Mines, concentrators & smelters", "Large compression & pumping stations", "Grid support & fast-start reserve", "Heavy industry: cement, steel, glass"],
      why: "Utility-scale output with the mobility and lead time of a containerized product."
    },
    "PTE-20": {
      name: "PTE-20 · 20 MW Flagship Power System",
      tag: "Two containers. One power plant.",
      desc: "The PTE-20 is PTE POWER's flagship: 20 MW of continuous prime power from an aeroderivative gas turbine and a synchronous generator packaged as two joined 20 ft ISO modules. It powers electric frac fleets, drilling programs, data centers and industrial complexes, and scales in 20 MW blocks up to 100 MW and beyond.",
      apps: ["Electric frac fleets & drilling programs", "Data centers & AI campuses", "Industrial complexes & utilities", "Associated-gas monetization"],
      why: "Five PTE-20 systems cover 100 MW where gas engines need twenty units or more."
    },
    "PTE-24": {
      name: "PTE-24 · 24 MW Maximum-Output Power System",
      tag: "The highest output in two containers",
      desc: "The PTE-24 is the most powerful system in the PTE range: 24 MW of continuous prime power from an aeroderivative gas turbine and a synchronous generator in two joined 20 ft ISO modules. It is built for the largest loads per footprint: data-center and AI campuses, large electric frac spreads, industrial complexes and utility peaking, scaling to 120 MW with five systems.",
      apps: ["Data-center & AI campuses", "Large electric frac spreads", "Industrial complexes & smelters", "Utility peaking & grid support"],
      why: "The most megawatts per container in the range: 120 MW from five systems, ten containers."
    }
  },
  es: {
    "PTE-1": {
      name: "PTE-1 · Sistema compacto de 1 MW",
      tag: "Potencia prime de entrada para sitios remotos y críticos",
      desc: "El PTE-1 integra un turbogenerador aeroderivado de 1 MW en dos contenedores ISO de 20 pies unidos. Es el primer paso natural para quien busca la confiabilidad de una turbina y la flexibilidad de combustible sin comprometer un bloque grande: campamentos remotos, estaciones de telecomunicaciones y bombeo, levantamiento artificial en locaciones, pequeñas plantas industriales, hospitales y proyectos piloto que luego crecen de a 1 MW.",
      apps: ["Campamentos remotos y exploración minera", "Levantamiento artificial y cargas de locación", "Hospitales, campus e instalaciones críticas", "Proyectos piloto antes de escalar"],
      why: "La menor inversión de entrada a la plataforma PTE, con el mismo control y modelo de servicio que las unidades mayores."
    },
    "PTE-3.8": {
      name: "PTE-3.8 · Sistema de generación distribuida de 3,8 MW",
      tag: "Bloque compacto para cargas distribuidas y comerciales",
      desc: "El PTE-3.8 entrega 3,8 MW de potencia prime continua a partir de una turbina a gas aeroderivada y un generador sincrónico en dos contenedores ISO de 20 pies unidos. Cubre el espacio entre la potencia de sitio y la de planta: grupos de locaciones, hospitales y campus, frigoríficos y alimentos, tratamiento de agua y complejos comerciales que necesitan más que una flota de grupos electrógenos pero menos que un bloque utility.",
      apps: ["Hospitales, campus y complejos comerciales", "Grupos de locaciones y captación de gas", "Frío, alimentos y tratamiento de agua", "Generación distribuida y recorte de picos"],
      why: "Reemplaza una flota de dos a cuatro grupos diésel con un solo paquete de turbina y un único plan de mantenimiento."
    },
    "PTE-5": {
      name: "PTE-5 · Sistema industrial de 5 MW",
      tag: "Potencia prime y puente de escala media",
      desc: "El PTE-5 entrega 5 MW de potencia prime continua a partir de una turbina a gas aeroderivada y un generador sincrónico en dos módulos ISO de 20 pies unidos. Está dimensionado para equipos de perforación, plantas agroindustriales y alimenticias, minería mediana, infraestructura de agua y bombeo, y energía puente mientras se construye la conexión a la red.",
      apps: ["Equipos de perforación y baterías de producción", "Agroindustria, alimentos y procesos", "Campamentos y plantas mineras", "Energía puente hasta que llegue la red"],
      why: "Reemplaza de tres a cinco grupos diésel con un único paquete de turbina que quema gas en lugar de diésel transportado."
    },
    "PTE-10": {
      name: "PTE-10 · Sistema de 10 MW grado utility",
      tag: "Generación a escala de planta en dos contenedores",
      desc: "El PTE-10 lleva al sitio 10 MW de generación grado utility en dos contenedores ISO de 20 pies unidos. Se adapta a plantas de tratamiento, compresión, bloques de potencia para data centers, parques industriales y generación de punta municipal, operando en isla, como microrred o en paralelo con la red.",
      apps: ["Instalaciones de petróleo y gas y compresión", "Bloques de potencia para data centers e IA", "Parques industriales y manufactura", "Generación de punta municipal y utility"],
      why: "Alta densidad de potencia: 10 MW en una superficie menor que una cancha de tenis, reubicable cuando se mueve la carga."
    },
    "PTE-15": {
      name: "PTE-15 · Sistema de alta potencia de 15 MW",
      tag: "Potencia para industria pesada y soporte de red",
      desc: "El PTE-15 es un turbogenerador aeroderivado de 15 MW en dos módulos ISO de 20 pies unidos, diseñado para cargas continuas pesadas: minas y concentradoras, cementeras y acerías, grandes estaciones de compresión, soporte de red y reserva de arranque rápido.",
      apps: ["Minas, concentradoras y fundiciones", "Grandes estaciones de compresión y bombeo", "Soporte de red y reserva de arranque rápido", "Industria pesada: cemento, acero, vidrio"],
      why: "Potencia a escala utility con la movilidad y el plazo de entrega de un producto contenerizado."
    },
    "PTE-20": {
      name: "PTE-20 · Sistema insignia de 20 MW",
      tag: "Dos contenedores. Una central eléctrica.",
      desc: "El PTE-20 es el sistema insignia de PTE POWER: 20 MW de potencia prime continua a partir de una turbina a gas aeroderivada y un generador sincrónico en dos módulos ISO de 20 pies unidos. Alimenta flotas de fractura eléctrica, programas de perforación, data centers y complejos industriales, y escala en bloques de 20 MW hasta 100 MW o más.",
      apps: ["Flotas de fractura eléctrica y perforación", "Data centers y campus de IA", "Complejos industriales y utilities", "Monetización de gas asociado"],
      why: "Cinco sistemas PTE-20 cubren 100 MW donde los motores a gas necesitan veinte unidades o más."
    },
    "PTE-24": {
      name: "PTE-24 · Sistema de máxima potencia de 24 MW",
      tag: "La mayor potencia en dos contenedores",
      desc: "El PTE-24 es el sistema más potente de la gama PTE: 24 MW de potencia prime continua a partir de una turbina a gas aeroderivada y un generador sincrónico en dos módulos ISO de 20 pies unidos. Está pensado para las mayores cargas por superficie: campus de data centers e IA, grandes sets de fractura eléctrica, complejos industriales y generación de punta, y escala a 120 MW con cinco sistemas.",
      apps: ["Campus de data centers e IA", "Grandes sets de fractura eléctrica", "Complejos industriales y fundiciones", "Generación de punta y soporte de red"],
      why: "La mayor potencia por contenedor de la gama: 120 MW con cinco sistemas, diez contenedores."
    }
  }
};

/* Incoterms 2020. cost keys the SELLER pays and therefore prices into the quote. */
const INCOTERMS = {
  EXW: { costs: [],                                                        risk: "seller" },
  FCA: { costs: ["packing", "inland"],                                     risk: "carrier" },
  FAS: { costs: ["packing", "inland", "exportClr"],                        risk: "alongside" },
  FOB: { costs: ["packing", "inland", "exportClr", "portOrigin"],          risk: "onboard" },
  CFR: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight"], risk: "onboard" },
  CIF: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance"], risk: "onboard" },
  CPT: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight"], risk: "carrier" },
  CIP: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance"], risk: "carrier" },
  DAP: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance", "portDest", "onward"], risk: "destination" },
  DPU: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance", "portDest", "onward", "unloading"], risk: "destination" },
  DDP: { costs: ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance", "portDest", "onward", "unloading", "importClr", "duties"], risk: "destination" }
};
const COST_KEYS = ["packing", "inland", "exportClr", "portOrigin", "freight", "insurance", "portDest", "onward", "unloading", "importClr", "duties"];

const DEFAULT_OPTIONS = [
  { key: "gas",   on: false, qty: 1, price: 0 },
  { key: "xfmr",  on: false, qty: 1, price: 0 },
  { key: "comm",  on: true,  qty: 1, price: 0 },
  { key: "train", on: true,  qty: 1, price: 0 },
  { key: "spares",on: false, qty: 1, price: 0 },
  { key: "ltsa",  on: false, qty: 1, price: 0 },
  { key: "remote",on: false, qty: 1, price: 0 },
  { key: "blackstart", on: false, qty: 1, price: 0 },
  { key: "cladding", on: false, qty: 1, price: 0 }
];

const T = {
  en: {
    docTitle: "Technical & Commercial Proposal",
    confidential: "Confidential",
    page: "Page",
    of: "of",
    preparedFor: "Prepared for",
    site: "Installation site",
    quoteNo: "Proposal no.",
    date: "Date",
    validUntil: "Valid until",
    revision: "Revision",
    project: "Project",
    coverKicker: "Containerized aeroderivative gas turbine power",
    coverLead: "Two joined 20 ft ISO containers — turbine module and generator module — delivering continuous prime power on gas, field gas or associated gas, with diesel backup.",
    units: "unit", unitsPl: "units",
    // letter
    dear: "Dear",
    letterP1: (c) => `Thank you for the opportunity to present this proposal. PTE POWER is pleased to offer ${c.qtyTxt} ${c.model} containerized gas turbine power system${c.qty > 1 ? "s" : ""}, for a total installed capacity of ${c.totalMw} MW at ${c.siteTxt}.`,
    letterP2: "Each system is a complete power plant in two joined 20 ft ISO containers: Module 01 houses the aeroderivative gas turbine with its fuel, lubrication, air-intake and ventilation systems; Module 02 houses the synchronous generator, switchgear, protection and controls. The units ship as standard containers, set on a prepared pad and connect to fuel and to your medium-voltage network.",
    letterP3: "This document sets out the scope of supply, the technical description, the indicative site performance, the commercial offer, the payment schedule, the delivery program and the conditions of sale. We remain at your disposal for a technical clarification meeting and a site visit.",
    regards: "Sincerely,",
    keyFigures: "Proposal at a glance",
    kCapacity: "Installed capacity",
    kSystems: "Systems",
    kPrice: "Total contract price",
    kLead: "Delivery",
    kIncoterm: "Incoterm",
    kValidity: "Validity",
    months: "months", days: "days", weeks: "weeks",
    // system page
    sysEyebrow: "The system",
    sysH: "Two containers. One power plant.",
    sysLead: "Every PTE system, from 1 MW to 24 MW, uses the same architecture: two 20 ft ISO containers joined end to end with minimal separation, no external stack and a clean roofline.",
    mod1: "Module 01 · Turbine",
    mod1d: "Aeroderivative gas turbine on a common skid with fuel system, lube-oil console, filtered air intake, enclosure ventilation, fire detection and suppression.",
    mod2: "Module 02 · Generator",
    mod2d: "Synchronous generator driven through a flexible coupling and reduction gearbox, with generator breaker, protection relay, control panel, HMI and MCC.",
    schemTitle: "General arrangement · plan and elevation (schematic, not to scale)",
    photoTurbine: "Module 01 — turbine enclosure",
    photoGen: "Module 02 — generator enclosure",
    photoControl: "Integrated control & HMI",
    // spec page
    specEyebrow: "Technical description",
    specH: "Technical specifications",
    indicative: "indicative",
    sitePerf: "Indicative site performance",
    sitePerfNote: "Screening estimate: output ~0.75 %/°C above 15 °C and proportional to air density with altitude. Guaranteed site ratings are issued in the project datasheet after FAT and review of your gas analysis.",
    isoRating: "ISO rating (15 °C, sea level)",
    siteAmb: "Site design ambient",
    siteAlt: "Site altitude",
    siteOut: "Estimated site output per system",
    siteTotal: "Estimated site output, all systems",
    fuelCons: "Fuel at full load per system (indicative)",
    // scope
    scopeEyebrow: "Scope of supply",
    scopeH: "What is included",
    included: "Included in the base price",
    optional: "Options quoted",
    excluded: "Excluded — by the buyer unless agreed",
    sld: "Simplified single-line & fuel diagram",
    // commercial
    comEyebrow: "Commercial offer",
    comH: "Price summary",
    item: "Item", qty: "Qty", unitPrice: "Unit price", amount: "Amount",
    equipLine: (m, mw, ppm) => `${m} power system — ${mw} MW × ${ppm} per MW`,
    subtotalEquip: "Equipment subtotal",
    optionsSub: "Options subtotal",
    logistics: "Logistics under",
    logisticsSub: "Logistics subtotal",
    discount: "Commercial discount",
    taxes: "Taxes",
    total: "Total contract price",
    perMw: "Effective price per MW",
    priceNote: (cur) => `All prices in ${cur}. Taxes, duties and fees in the buyer's country are excluded unless the Incoterm is DDP or they are itemized above.`,
    incoTitle: "Delivery term",
    namedPlace: "Named place",
    pol: "Port / place of loading",
    pod: "Port / place of destination",
    transport: "Transport mode",
    riskPasses: "Risk passes to the buyer",
    sellerPays: "Seller pays",
    buyerPays: "Buyer pays",
    // payment
    payEyebrow: "Conditions of sale",
    payH: "Payment schedule",
    milestone: "Milestone", trigger: "Trigger", pct: "%",
    payWarn: "Milestones do not add up to 100 %",
    payMethod: "Payment method",
    // schedule
    schEyebrow: "Delivery program",
    schH: "From contract to first power",
    weekLbl: "Month",
    siteH: "Site readiness — recommendations",
    tipsH: "PTE engineering tips",
    // terms
    termsEyebrow: "Terms & conditions",
    termsH: "General conditions of sale",
    accept: "Acceptance",
    acceptTxt: "Signed by the authorized representatives of both parties, this proposal becomes a binding order subject to the conditions above and the final contract.",
    forSeller: "For the seller", forBuyer: "For the buyer",
    sName: "Name", sTitle: "Title", sSign: "Signature", sDate: "Date",
    family: "The PTE product family",
    familyLead: "Same architecture, same controls, same service model — seven power ratings, all in two 20 ft containers.",
    fModel: "Model", fOutput: "ISO output", fGen: "Generator", fCont: "Containers", fFuel: "Fuel (indicative)", fPrice: "Indicative price",
    selected: "Quoted",
    applications: "Typical applications",
    whyThis: "Why this model"
  },
  es: {
    docTitle: "Propuesta Técnica y Comercial",
    confidential: "Confidencial",
    page: "Página",
    of: "de",
    preparedFor: "Preparada para",
    site: "Sitio de instalación",
    quoteNo: "Propuesta n.º",
    date: "Fecha",
    validUntil: "Válida hasta",
    revision: "Revisión",
    project: "Proyecto",
    coverKicker: "Generación contenerizada con turbina a gas aeroderivada",
    coverLead: "Dos contenedores ISO de 20 pies unidos — módulo de turbina y módulo de generador — que entregan potencia prime continua con gas natural, gas de campo o gas asociado, con respaldo diésel.",
    units: "unidad", unitsPl: "unidades",
    dear: "Estimado/a",
    letterP1: (c) => `Agradecemos la oportunidad de presentar esta propuesta. PTE POWER tiene el agrado de ofrecer ${c.qtyTxt} sistema${c.qty > 1 ? "s" : ""} de generación ${c.model} con turbina a gas contenerizada, para una capacidad instalada total de ${c.totalMw} MW en ${c.siteTxt}.`,
    letterP2: "Cada sistema es una central eléctrica completa en dos contenedores ISO de 20 pies unidos: el Módulo 01 aloja la turbina a gas aeroderivada con sus sistemas de combustible, lubricación, admisión de aire y ventilación; el Módulo 02 aloja el generador sincrónico, las celdas de maniobra, las protecciones y el control. Las unidades viajan como contenedores estándar, se apoyan sobre una plataforma preparada y se conectan al combustible y a su red de media tensión.",
    letterP3: "Este documento detalla el alcance de suministro, la descripción técnica, el rendimiento indicativo en sitio, la oferta comercial, el cronograma de pagos, el programa de entrega y las condiciones de venta. Quedamos a su disposición para una reunión de aclaración técnica y una visita al sitio.",
    regards: "Atentamente,",
    keyFigures: "La propuesta en cifras",
    kCapacity: "Capacidad instalada",
    kSystems: "Sistemas",
    kPrice: "Precio total del contrato",
    kLead: "Entrega",
    kIncoterm: "Incoterm",
    kValidity: "Validez",
    months: "meses", days: "días", weeks: "semanas",
    sysEyebrow: "El sistema",
    sysH: "Dos contenedores. Una central eléctrica.",
    sysLead: "Todos los sistemas PTE, de 1 MW a 24 MW, comparten la misma arquitectura: dos contenedores ISO de 20 pies unidos por sus extremos con separación mínima, sin chimenea exterior y con cubierta limpia.",
    mod1: "Módulo 01 · Turbina",
    mod1d: "Turbina a gas aeroderivada sobre bastidor común con sistema de combustible, consola de aceite lubricante, admisión de aire filtrado, ventilación del recinto, detección y extinción de incendios.",
    mod2: "Módulo 02 · Generador",
    mod2d: "Generador sincrónico accionado mediante acoplamiento flexible y caja reductora, con interruptor de generador, relé de protección, tablero de control, HMI y CCM.",
    schemTitle: "Disposición general · planta y alzado (esquemático, sin escala)",
    photoTurbine: "Módulo 01 — recinto de turbina",
    photoGen: "Módulo 02 — recinto de generador",
    photoControl: "Control integrado y HMI",
    specEyebrow: "Descripción técnica",
    specH: "Especificaciones técnicas",
    indicative: "indicativo",
    sitePerf: "Rendimiento indicativo en sitio",
    sitePerfNote: "Estimación preliminar: la potencia baja ~0,75 %/°C por encima de 15 °C y es proporcional a la densidad del aire con la altitud. Las potencias garantizadas en sitio se emiten en la hoja de datos del proyecto tras el FAT y el análisis de su gas.",
    isoRating: "Potencia ISO (15 °C, nivel del mar)",
    siteAmb: "Temperatura ambiente de diseño",
    siteAlt: "Altitud del sitio",
    siteOut: "Potencia estimada en sitio por sistema",
    siteTotal: "Potencia estimada en sitio, total",
    fuelCons: "Combustible a plena carga por sistema (indicativo)",
    scopeEyebrow: "Alcance de suministro",
    scopeH: "Qué incluye",
    included: "Incluido en el precio base",
    optional: "Opcionales cotizados",
    excluded: "Excluido — a cargo del comprador salvo acuerdo",
    sld: "Diagrama unifilar y de combustible simplificado",
    comEyebrow: "Oferta comercial",
    comH: "Resumen de precios",
    item: "Concepto", qty: "Cant.", unitPrice: "Precio unitario", amount: "Importe",
    equipLine: (m, mw, ppm) => `Sistema de generación ${m} — ${mw} MW × ${ppm} por MW`,
    subtotalEquip: "Subtotal equipos",
    optionsSub: "Subtotal opcionales",
    logistics: "Logística bajo",
    logisticsSub: "Subtotal logística",
    discount: "Descuento comercial",
    taxes: "Impuestos",
    total: "Precio total del contrato",
    perMw: "Precio efectivo por MW",
    priceNote: (cur) => `Todos los precios en ${cur}. Impuestos, aranceles y tasas del país del comprador excluidos salvo Incoterm DDP o que figuren detallados arriba.`,
    incoTitle: "Condición de entrega",
    namedPlace: "Lugar convenido",
    pol: "Puerto / lugar de carga",
    pod: "Puerto / lugar de destino",
    transport: "Modo de transporte",
    riskPasses: "El riesgo pasa al comprador",
    sellerPays: "Paga el vendedor",
    buyerPays: "Paga el comprador",
    payEyebrow: "Condiciones de venta",
    payH: "Cronograma de pagos",
    milestone: "Hito", trigger: "Condición", pct: "%",
    payWarn: "Los hitos no suman 100 %",
    payMethod: "Forma de pago",
    schEyebrow: "Programa de entrega",
    schH: "Del contrato a la primera energía",
    weekLbl: "Mes",
    siteH: "Preparación del sitio — recomendaciones",
    tipsH: "Consejos de ingeniería PTE",
    termsEyebrow: "Términos y condiciones",
    termsH: "Condiciones generales de venta",
    accept: "Aceptación",
    acceptTxt: "Firmada por los representantes autorizados de ambas partes, esta propuesta se convierte en un pedido vinculante sujeto a las condiciones anteriores y al contrato definitivo.",
    forSeller: "Por el vendedor", forBuyer: "Por el comprador",
    sName: "Nombre", sTitle: "Cargo", sSign: "Firma", sDate: "Fecha",
    family: "La familia de productos PTE",
    familyLead: "Misma arquitectura, mismo control, mismo modelo de servicio — siete potencias, todas en dos contenedores de 20 pies.",
    fModel: "Modelo", fOutput: "Potencia ISO", fGen: "Generador", fCont: "Contenedores", fFuel: "Combustible (indic.)", fPrice: "Precio indicativo",
    selected: "Cotizado",
    applications: "Aplicaciones típicas",
    whyThis: "Por qué este modelo"
  }
};

/* Labels shared by the document for option keys, cost keys, incoterm risk, fuels etc. */
const LBL = {
  en: {
    opt: {
      gas: ["Fuel gas conditioning skid", "Separation, filtration/coalescing, heating, regulation and metering — scoped from the gas analysis"],
      xfmr: ["Step-up transformer", "Generator voltage to site MV, Dyn11, ONAN/ONAF, with neutral grounding"],
      comm: ["Installation supervision & commissioning", "PTE field engineers for setting, tie-in supervision, commissioning and performance run"],
      train: ["Operator & maintenance training", "Classroom and hands-on training for the buyer's operators and technicians"],
      spares: ["Commissioning & 2-year spare parts kit", "Filters, seals, sensors, igniters and consumables for commissioning and two years of operation"],
      ltsa: ["Long-term service agreement (per year)", "Scheduled maintenance, parts, borescope inspections and remote support at a fixed rate"],
      remote: ["Remote monitoring & predictive analytics (per year)", "24/7 data link to the PTE operations center, trending and predictive maintenance"],
      blackstart: ["Black-start & diesel backup kit", "Black-start battery/diesel starter and dual-fuel diesel supply for start-up and gas interruptions"],
      cladding: ["Architectural wood-slat cladding", "Timber-slat façade on both containers for urban, hospital and campus sites"]
    },
    cost: {
      packing: "Export packing & preservation", inland: "Inland freight to port / carrier", exportClr: "Export clearance",
      portOrigin: "Origin terminal handling & loading", freight: "Main carriage (ocean / road / rail)", insurance: "Cargo insurance (110 % CIF)",
      portDest: "Destination terminal handling", onward: "Onward transport to site", unloading: "Unloading at site",
      importClr: "Import clearance", duties: "Import duties & taxes"
    },
    costShort: { packing: "Export packing", inland: "Inland freight", exportClr: "Export clearance", portOrigin: "Origin terminal", freight: "Main carriage", insurance: "Insurance", portDest: "Dest. terminal", onward: "Transport to site", unloading: "Unloading", importClr: "Import clearance", duties: "Duties & taxes" },
    risk: {
      seller: "When goods are made available at the seller's premises",
      carrier: "On handover to the first carrier at the named place",
      alongside: "When placed alongside the vessel at the port of loading",
      onboard: "When loaded on board the vessel at the port of loading",
      destination: "On arrival at the named destination"
    },
    fuel: { gas: "Pipeline natural gas", field: "Conditioned field / wellhead gas", assoc: "Associated / flare gas", diesel: "Diesel (liquid fuel)", dual: "Dual fuel: gas + diesel backup", lpg: "LPG / propane-air", bio: "Biogas / landfill gas (conditioned)" },
    mode: { island: "Island (off-grid) prime power", parallel: "Grid-parallel", micro: "Microgrid with load sharing", standby: "Standby / emergency", bridge: "Bridge power" },
    transportMode: { sea: "Sea freight (2 × 20 ft per system)", road: "Road", rail: "Rail", multi: "Multimodal" },
    trig: {
      m1: "At contract signing",
      m2: "Inspection 1",
      m3: "Inspection 2",
      m4: "Final — before delivery"
    },
    trigDesc: {
      m1: "Down payment against signed contract and advance-payment invoice",
      m2: "Mid-manufacturing inspection: turbine core and generator on skid, witnessed by the buyer",
      m3: "Factory acceptance test (FAT) passed, witnessed by the buyer",
      m4: "Balance — contract price paid in full before release for shipment / delivery, no exceptions"
    }
  },
  es: {
    opt: {
      gas: ["Skid de acondicionamiento de gas", "Separación, filtrado/coalescencia, calentamiento, regulación y medición — según el análisis de gas"],
      xfmr: ["Transformador elevador", "De la tensión de generación a la MT del sitio, Dyn11, ONAN/ONAF, con puesta a tierra del neutro"],
      comm: ["Supervisión de montaje y puesta en marcha", "Ingenieros de campo PTE para el posicionamiento, supervisión de conexiones, puesta en marcha y prueba de desempeño"],
      train: ["Capacitación de operación y mantenimiento", "Formación teórica y práctica para operadores y técnicos del comprador"],
      spares: ["Kit de repuestos de arranque y 2 años", "Filtros, sellos, sensores, ignitores y consumibles para la puesta en marcha y dos años de operación"],
      ltsa: ["Contrato de servicio a largo plazo (por año)", "Mantenimiento programado, repuestos, boroscopías y soporte remoto a tarifa fija"],
      remote: ["Monitoreo remoto y analítica predictiva (por año)", "Enlace de datos 24/7 al centro de operaciones PTE, tendencias y mantenimiento predictivo"],
      blackstart: ["Kit de arranque en negro y respaldo diésel", "Arranque autónomo con baterías/diésel y suministro diésel dual para arranques e interrupciones de gas"],
      cladding: ["Revestimiento arquitectónico de listones de madera", "Fachada de listones de madera en ambos contenedores para sitios urbanos, hospitales y campus"]
    },
    cost: {
      packing: "Embalaje de exportación y preservación", inland: "Flete interno a puerto / transportista", exportClr: "Despacho de exportación",
      portOrigin: "Manipulación y carga en terminal de origen", freight: "Transporte principal (marítimo / carretera / ferrocarril)", insurance: "Seguro de carga (110 % CIF)",
      portDest: "Manipulación en terminal de destino", onward: "Transporte hasta el sitio", unloading: "Descarga en el sitio",
      importClr: "Despacho de importación", duties: "Aranceles e impuestos de importación"
    },
    costShort: { packing: "Embalaje", inland: "Flete interno", exportClr: "Desp. export.", portOrigin: "Terminal origen", freight: "Transporte principal", insurance: "Seguro", portDest: "Terminal destino", onward: "Transp. a sitio", unloading: "Descarga", importClr: "Desp. import.", duties: "Aranceles" },
    risk: {
      seller: "Cuando la mercadería se pone a disposición en las instalaciones del vendedor",
      carrier: "Al entregarse al primer transportista en el lugar convenido",
      alongside: "Al colocarse al costado del buque en el puerto de carga",
      onboard: "Al cargarse a bordo del buque en el puerto de carga",
      destination: "A la llegada al destino convenido"
    },
    fuel: { gas: "Gas natural de gasoducto", field: "Gas de campo / boca de pozo acondicionado", assoc: "Gas asociado / de antorcha", diesel: "Diésel (combustible líquido)", dual: "Dual: gas + respaldo diésel", lpg: "GLP / propano-aire", bio: "Biogás / gas de relleno (acondicionado)" },
    mode: { island: "Potencia prime en isla (sin red)", parallel: "En paralelo con la red", micro: "Microrred con reparto de carga", standby: "Respaldo / emergencia", bridge: "Energía puente" },
    transportMode: { sea: "Marítimo (2 × 20 pies por sistema)", road: "Carretera", rail: "Ferrocarril", multi: "Multimodal" },
    trig: {
      m1: "A la firma del contrato",
      m2: "Inspección 1",
      m3: "Inspección 2",
      m4: "Final — antes de la entrega"
    },
    trigDesc: {
      m1: "Anticipo contra contrato firmado y factura de anticipo",
      m2: "Inspección a mitad de fabricación: núcleo de turbina y generador montados en bastidor, presenciada por el comprador",
      m3: "Ensayo de aceptación en fábrica (FAT) aprobado, presenciado por el comprador",
      m4: "Saldo — precio del contrato pagado en su totalidad antes de la liberación para embarque / entrega, sin excepciones"
    }
  }
};

const PARTY_LBL = {
  en: { contact: "Contact", title: "Title", email: "Email", phone: "Phone", address: "Address", country: "City / country", taxId: "Tax ID", web: "Website", agreement: "Agreement ref.", territory: "Territory", industry: "Industry", site: "Site", endUse: "End use" },
  es: { contact: "Contacto", title: "Cargo", email: "Email", phone: "Teléfono", address: "Dirección", country: "Ciudad / país", taxId: "ID fiscal", web: "Web", agreement: "Ref. acuerdo", territory: "Territorio", industry: "Sector", site: "Sitio", endUse: "Uso final" }
};

/* Known associates. When the associate company matches, the proposal gets the right role and
   location automatically (role and country are forced; other fields only fill blanks). */
const KNOWN_ASSOCIATES = [
  { match: /herzoil/i, force: { role: "distributor", city: "Miami, FL", country: "USA" },
    fill: { company: "Herzoil Corp.", address: "2100 Coral Way, Suite 404\nMiami, FL 33145, USA", email: "administracion@herzoil.com",
            logo: "assets/img/assoc/herzoil.png", territory: "Latin America", agreement: "Exclusive distribution agreement — Latin America" } }
];
function applyKnownAssociate(ch) {
  if (!ch) return false;
  if (ch.role === "reseller") ch.role = "distributor";
  const k = KNOWN_ASSOCIATES.find((a) => a.match.test(ch.company || ""));
  if (!k) return false;
  let changed = false;
  for (const [f, v] of Object.entries(k.force)) if (ch[f] !== v) { ch[f] = v; changed = true; }
  for (const [f, v] of Object.entries(k.fill)) if (!ch[f]) { ch[f] = v; changed = true; }
  return changed;
}
