/* PTE Quote Studio — calculation engine and proposal document renderer. */

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nl2br = (v) => esc(v).replace(/\n/g, "<br>");
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const fmtN = (v, d = 0) => num(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (v, cur, d = 0) => {
  const sym = { USD: "US$", EUR: "€", GBP: "£", CAD: "C$", MXN: "MX$" }[cur] || cur + " ";
  const n = num(v); return (n < 0 ? "−" : "") + sym + " " + fmtN(Math.abs(n), d);
};
const addDays = (iso, d) => { const t = new Date(iso + "T12:00:00"); t.setDate(t.getDate() + num(d)); return t; };
const fmtDate = (d, lang) => d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { year: "numeric", month: "long", day: "numeric" });

function calc(s) {
  const m = MODELS.find((x) => x.id === s.product.model) || MODELS.find((x) => x.id === "PTE-20");
  const qty = Math.max(1, Math.round(num(s.product.qty)));
  // associate commission: a % of the equipment value (price per MW × MW). "included" keeps the
  // client price and pays the associate out of it; "ontop" raises the client price per MW by that %.
  const ch = s.channel || {};
  const commPct = ch.via ? num(ch.commPct) : 0;
  const commOnTop = !!ch.via && ch.commMode === "ontop";
  const ppmBase = num(s.product.pricePerMw);
  const ppm = commOnTop ? ppmBase * (1 + commPct / 100) : ppmBase;
  const unit = ppm * m.mw;
  const equip = unit * qty;
  const comm = ppmBase * m.mw * qty * commPct / 100;
  const L = LBL[s.lang];
  const opts = s.options.filter((o) => o.on).map((o) => ({ label: L.opt[o.key][0], desc: L.opt[o.key][1], qty: num(o.qty), price: num(o.price), amt: num(o.qty) * num(o.price) }));
  s.customItems.filter((c) => c.desc).forEach((c) => opts.push({ label: c.desc, desc: c.note || "", qty: num(c.qty), price: num(c.price), amt: num(c.qty) * num(c.price) }));
  const optSum = opts.reduce((a, o) => a + o.amt, 0);
  const inc = INCOTERMS[s.logistics.incoterm] || INCOTERMS.FOB;
  const logi = [];
  let pre = 0;
  inc.costs.forEach((k) => { if (k !== "insurance" && k !== "duties" && k !== "importClr") pre += num(s.logistics.costs[k]); });
  inc.costs.forEach((k) => {
    let a = num(s.logistics.costs[k]);
    if (k === "insurance" && s.logistics.autoIns) a = Math.round((num(s.logistics.insRate) / 100) * 1.1 * (equip + optSum + pre));
    if (a > 0) logi.push({ key: k, label: L.cost[k], amt: a });
  });
  const logSum = logi.reduce((a, o) => a + o.amt, 0);
  const sub = equip + optSum + logSum;
  const disc = sub * num(s.pricing.discountPct) / 100;
  const tax = (sub - disc) * num(s.pricing.taxPct) / 100;
  const total = sub - disc + tax;
  const mwTot = m.mw * qty;
  const pays = s.payment.m.map((p, i) => ({ ...p, key: "m" + (i + 1), amt: total * num(p.pct) / 100 }));
  const paySum = s.payment.m.reduce((a, p) => a + num(p.pct), 0);
  // indicative site performance
  const T = num(s.site.ambient), h = num(s.site.altitude);
  const fT = T > 15 ? Math.max(0.5, 1 - 0.0075 * (T - 15)) : 1;
  const fA = Math.pow(Math.max(0.3, 1 - 2.25577e-5 * h), 5.25588);
  const siteMw = m.mw * fT * fA;
  const mmbtu = [m.mw * 1000 * m.hr[0] / 1e6, m.mw * 1000 * m.hr[1] / 1e6];
  const nm3 = mmbtu.map((x) => x * 1055.06 / 35.3);
  const litres = mmbtu.map((x) => x * 1055.06 / 35.8);
  const commPays = pays.map((p) => comm * num(p.pct) / 100);
  return { m, qty, ppm, ppmBase, commPct, commOnTop, comm, commPays, pteNet: total - comm, unit, equip, opts, optSum, inc, logi, logSum, sub, disc, tax, total, mwTot, pays, paySum, fT, fA, siteMw, mmbtu, nm3, litres, kva: m.mw * 1000 / 0.8 };
}

/* ---------- SVG drawings ---------- */

function svgArrangement(lang) {
  const es = lang === "es";
  const lab = es
    ? ["Filtros y silenciador de admisión", "Turbina a gas aeroderivada", "Difusor de escape · salida baja en cubierta", "Módulo de gas combustible", "Consola de aceite lubricante", "Detección y extinción de incendios", "Ventiladores del recinto", "Caja reductora y acoplamiento", "Generador sincrónico", "Interruptor de generador · TC/TT", "PLC, protecciones y HMI", "CCM, SSAA y UPS", "Salida de cables MT"]
    : ["Air-inlet filters & silencer", "Aeroderivative gas turbine", "Exhaust diffuser · low-profile roof outlet", "Fuel gas module", "Lube-oil console", "Fire detection & suppression", "Enclosure ventilation fans", "Reduction gearbox & coupling", "Synchronous generator", "Generator breaker · CT/PT", "PLC, protection & HMI", "MCC, auxiliaries & UPS", "MV cable outlet"];
  const c = (n, x, y) => `<g class="co"><circle cx="${x}" cy="${y}" r="9"/><text x="${x}" y="${y + 3.5}">${n}</text></g>`;
  const M1 = es ? "MÓDULO 01 · TURBINA" : "MODULE 01 · TURBINE";
  const M2 = es ? "MÓDULO 02 · GENERADOR" : "MODULE 02 · GENERATOR";
  const plan = es ? "PLANTA" : "PLAN";
  const elev = es ? "ALZADO LATERAL" : "SIDE ELEVATION";
  return `<svg viewBox="0 0 1000 470" class="svg-ga" xmlns="http://www.w3.org/2000/svg">
  <text class="t-cap" x="30" y="22">${plan}</text>
  <!-- plan -->
  <rect class="cont" x="30" y="34" width="462" height="186"/><rect class="cont" x="498" y="34" width="462" height="186"/>
  <text class="t-mod" x="42" y="54">${M1}</text><text class="t-mod" x="510" y="54">${M2}</text>
  <rect class="eq" x="42" y="72" width="58" height="136" rx="3"/>
  <path class="eq tur" d="M112 104 L172 92 L172 184 L112 172 Z"/>
  <rect class="eq tur" x="172" y="104" width="150" height="68" rx="30"/>
  <path class="eq tur" d="M322 110 L398 98 L398 178 L322 166 Z"/>
  <rect class="eq" x="404" y="104" width="76" height="68" rx="4"/>
  <rect class="eq alt" x="180" y="182" width="70" height="28" rx="2"/><rect class="eq alt" x="260" y="182" width="60" height="28" rx="2"/>
  <rect class="eq alt" x="250" y="42" width="60" height="22" rx="2"/><rect class="eq alt" x="360" y="42" width="90" height="22" rx="2"/>
  <line class="shaft" x1="480" y1="138" x2="560" y2="138"/>
  <rect class="eq" x="508" y="112" width="52" height="52" rx="4"/>
  <rect class="eq gen" x="574" y="92" width="190" height="92" rx="8"/>
  <rect class="eq alt" x="780" y="72" width="64" height="80" rx="2"/><rect class="eq alt" x="856" y="72" width="92" height="56" rx="2"/>
  <rect class="eq alt" x="856" y="140" width="92" height="44" rx="2"/><rect class="eq alt" x="780" y="190" width="64" height="22" rx="2"/>
  ${c(1, 71, 140)}${c(2, 246, 138)}${c(3, 360, 138)}${c(4, 215, 196)}${c(5, 290, 196)}${c(6, 280, 53)}${c(7, 405, 53)}${c(8, 534, 138)}${c(9, 669, 138)}${c(10, 812, 112)}${c(11, 902, 100)}${c(12, 902, 162)}${c(13, 812, 201)}
  <line class="dim" x1="30" y1="232" x2="492" y2="232"/><line class="dim" x1="498" y1="232" x2="960" y2="232"/>
  <text class="t-dim" x="261" y="245">20 ft ISO · 6.06 m</text><text class="t-dim" x="729" y="245">20 ft ISO · 6.06 m</text>
  <!-- elevation -->
  <text class="t-cap" x="30" y="276">${elev}</text>
  <rect class="wood" x="30" y="286" width="462" height="150"/><rect class="wood" x="498" y="286" width="462" height="150"/>
  <g class="slats">${Array.from({ length: 45 }, (_, i) => `<line x1="${40 + i * 10}" y1="290" x2="${40 + i * 10}" y2="432"/>`).join("")}${Array.from({ length: 45 }, (_, i) => `<line x1="${508 + i * 10}" y1="290" x2="${508 + i * 10}" y2="432"/>`).join("")}</g><rect class="frame" x="30" y="286" width="462" height="150"/><rect class="frame" x="498" y="286" width="462" height="150"/>
  <text class="t-brand" x="261" y="372">PTE POWER</text><text class="t-brand" x="729" y="372">PTE POWER</text>
  <line class="dim" x1="975" y1="286" x2="975" y2="436"/><text class="t-dim" x="984" y="364" transform="rotate(90 984 364)">2.59 m</text>
  <line class="gnd" x1="20" y1="440" x2="980" y2="440"/>
  <text class="t-dim" x="495" y="460">${es ? "Separación mínima entre módulos · sin chimenea exterior" : "Minimal gap between modules · no external stack"}</text>
  </svg>
  <ol class="legend">${lab.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>`;
}

function svgSLD(s, c) {
  const es = s.lang === "es";
  const hasGas = s.options.find((o) => o.key === "gas" && o.on);
  const hasX = s.options.find((o) => o.key === "xfmr" && o.on);
  const diesel = ["diesel", "dual"].includes(s.product.fuel) || s.options.find((o) => o.key === "blackstart" && o.on);
  const v = esc(s.product.voltage), f = esc(s.product.freq);
  const box = (x, y, w, h, t1, t2, cls = "") => `<g class="blk ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><text x="${x + w / 2}" y="${y + h / 2 - (t2 ? 3 : -4)}" class="b1">${t1}</text>${t2 ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" class="b2">${t2}</text>` : ""}</g>`;
  const byOthers = es ? "por el comprador" : "by buyer";
  const option = es ? "opcional" : "option";
  const incl = es ? "incluido" : "included";
  return `<svg viewBox="0 0 1000 300" class="svg-sld" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="arw"/></marker></defs>
  <rect class="zone" x="296" y="30" width="408" height="200" rx="8"/>
  <text class="t-zone" x="306" y="48">${es ? "SISTEMA PTE · ALCANCE PTE POWER" : "PTE SYSTEM · PTE POWER SCOPE"} (${c.qty} ×)</text>
  ${box(20, 96, 110, 48, es ? "Gas combustible" : "Fuel gas supply", byOthers, "ext")}
  ${box(160, 96, 110, 48, es ? "Skid de gas" : "Gas skid", hasGas ? option + " ✓" : byOthers, hasGas ? "opt" : "ext")}
  ${box(316, 96, 118, 48, es ? "Turbina a gas" : "Gas turbine", es ? "Módulo 01" : "Module 01")}
  ${box(452, 104, 54, 32, es ? "Reductor" : "Gearbox", "")}
  <g class="gen"><circle cx="560" cy="120" r="30"/><text x="560" y="126" class="b1">G</text></g>
  <text class="b2" x="560" y="170">${es ? "Módulo 02" : "Module 02"} · ${v} · ${f} Hz</text>
  <g class="brk"><rect x="626" y="108" width="24" height="24"/><text x="638" y="100" class="b2">52G</text></g>
  <text class="b2" x="638" y="150">87G · 32 · 40</text>
  <line class="ln" x1="130" y1="120" x2="160" y2="120" marker-end="url(#ar)"/>
  <line class="ln" x1="270" y1="120" x2="316" y2="120" marker-end="url(#ar)"/>
  <line class="ln sh" x1="434" y1="120" x2="452" y2="120"/><line class="ln sh" x1="506" y1="120" x2="530" y2="120"/>
  <line class="el" x1="590" y1="120" x2="626" y2="120"/><line class="el" x1="650" y1="120" x2="740" y2="120"/>
  <g class="xf ${hasX ? "opt" : "ext"}"><circle cx="760" cy="120" r="20"/><circle cx="786" cy="120" r="20"/></g>
  <text class="b2" x="773" y="160">${es ? "Transformador elevador" : "Step-up transformer"}</text>
  <text class="b2" x="773" y="173">${hasX ? option + " ✓" : byOthers}</text>
  <line class="el" x1="806" y1="120" x2="850" y2="120"/>
  <line class="bus" x1="850" y1="70" x2="850" y2="200"/>
  <text class="b1 l" x="862" y="80">${es ? "Barra MT del sitio" : "Site MV bus"}</text>
  <text class="b2 l" x="862" y="96">${byOthers}</text>
  <line class="el" x1="850" y1="160" x2="930" y2="160" marker-end="url(#ar)"/><text class="b2 l" x="862" y="180">${es ? "Cargas / red" : "Loads / grid"}</text>
  ${diesel ? `${box(316, 196, 118, 40, es ? "Diésel" : "Diesel", es ? "respaldo / arranque" : "backup / start", hasGas ? "" : "ext")}<line class="ln dash" x1="375" y1="196" x2="375" y2="144" marker-end="url(#ar)"/>` : ""}
  <line class="el thin" x1="610" y1="120" x2="610" y2="206"/><rect class="eqs" x="586" y="206" width="48" height="22"/><text class="b2" x="610" y="221">${es ? "SSAA" : "AUX"}</text>
  <g class="lg"><rect class="k1" x="20" y="262" width="14" height="10"/><text x="40" y="271">${incl}</text>
  <rect class="k2" x="120" y="262" width="14" height="10"/><text x="140" y="271">${option}</text>
  <rect class="k3" x="220" y="262" width="14" height="10"/><text x="240" y="271">${byOthers}</text></g>
  </svg>`;
}

function svgGantt(s, c) {
  const es = s.lang === "es";
  const lead = Math.max(2, num(s.delivery.leadMonths));
  const transit = num(s.logistics.transitWeeks) / 4.345;
  const inst = num(s.delivery.installWeeks) / 4.345;
  const end = lead + transit + inst;
  const span = Math.ceil(end + 0.5);
  const X0 = 250, W = 720, px = W / span;
  const x = (mo) => X0 + mo * px;
  const rows = [
    [es ? "Ingeniería y planos para aprobación" : "Engineering & approval drawings", 0, Math.min(1.5, lead * 0.3), "a"],
    [es ? "Compras de largo plazo" : "Long-lead procurement", 0.3, lead * 0.55, "a"],
    [es ? "Fabricación y montaje" : "Manufacturing & assembly", Math.min(1, lead * 0.2), lead - 0.4, "b"],
    [es ? "FAT y preparación de embarque" : "FAT & shipment preparation", lead - 0.6, lead, "b"],
    [es ? "Preparación del sitio (comprador)" : "Site preparation (buyer)", lead * 0.45, lead + transit, "c"],
    [es ? "Transporte" : "Transport", lead, lead + transit, "d"],
    [es ? "Montaje y puesta en marcha" : "Setting & commissioning", lead + transit, end, "e"]
  ];
  const ms = [
    [0, es ? "Firma" : "Contract", c.pays[0]],
    [lead * 0.5, es ? "Insp. 1" : "Insp. 1", c.pays[1]],
    [lead - 0.3, "FAT · Insp. 2", c.pays[2]],
    [lead, es ? "Liberación" : "Release", c.pays[3]]
  ];
  const H = 40 + rows.length * 34 + 96;
  let g = `<svg viewBox="0 0 1000 ${H}" class="svg-gantt" xmlns="http://www.w3.org/2000/svg">`;
  for (let i = 0; i <= span; i++) g += `<line class="grid" x1="${x(i)}" y1="24" x2="${x(i)}" y2="${40 + rows.length * 34}"/><text class="t-ax" x="${x(i)}" y="18">${i}</text>`;
  g += `<text class="t-ax l" x="${X0 - 16}" y="18">${es ? "Mes" : "Month"}</text>`;
  rows.forEach((r, i) => {
    const y = 36 + i * 34;
    g += `<text class="t-row" x="${X0 - 12}" y="${y + 13}">${esc(r[0])}</text><rect class="bar ${r[3]}" x="${x(r[1])}" y="${y}" width="${Math.max(4, x(r[2]) - x(r[1]))}" height="20" rx="3"/>`;
  });
  const yM = 40 + rows.length * 34 + 18;
  g += `<line class="axis" x1="${X0}" y1="${yM}" x2="${x(span)}" y2="${yM}"/>`;
  ms.forEach((m, i) => {
    const xx = x(m[0]);
    g += `<line class="mline" x1="${xx}" y1="30" x2="${xx}" y2="${yM}"/><path class="dia" d="M${xx} ${yM - 8} L${xx + 8} ${yM} L${xx} ${yM + 8} L${xx - 8} ${yM} Z"/>`;
    const dy = i % 2 ? 32 : 0;
    g += `<text class="t-ms" x="${xx}" y="${yM + 26 + dy}">${esc(m[1])}</text><text class="t-ms2" x="${xx}" y="${yM + 42 + dy}">${fmtN(m[2].pct)} %</text>`;
  });
  const xf = x(end);
  g += `<path class="dia fp" d="M${xf} ${yM - 9} L${xf + 9} ${yM} L${xf} ${yM + 9} L${xf - 9} ${yM} Z"/><text class="t-ms" x="${xf}" y="${yM + 26}">${es ? "Primera energía" : "First power"}</text>`;
  g += `<text class="t-row" x="${X0 - 12}" y="${yM + 4}">${es ? "Hitos de pago" : "Payment milestones"}</text></svg>`;
  return g;
}

/* ---------- Document ---------- */

/* Top-left logo block used on every page: PTE POWER, plus the associate's logo when one is uploaded. */
function logoBlock(s, cls = "") {
  const aso = s.channel && s.channel.via && s.channel.logo;
  return `<div class="logos ${cls}"><img class="lg-pte" src="assets/img/pte-power-logo.png" alt="PTE POWER">${aso ? `<span class="lg-sep"></span><img class="lg-aso" src="${esc(s.channel.logo)}" alt="${esc(s.channel.company || "Associate")}">` : ""}</div>`;
}

function renderDoc(s) {
  const t = T[s.lang], L = LBL[s.lang], es = s.lang === "es";
  const c = calc(s);
  const mc = MODEL_COPY[s.lang][c.m.id];
  const cur = s.currency;
  const $ = (v, d) => money(v, cur, d);
  const qDate = s.quote.date || new Date().toISOString().slice(0, 10);
  const dateTxt = fmtDate(new Date(qDate + "T12:00:00"), s.lang);
  const validTxt = fmtDate(addDays(qDate, s.quote.validity), s.lang);
  const siteTxt = [s.site.name, s.site.city, s.site.country].filter(Boolean).join(", ") || (es ? "el sitio del cliente" : "the client's site");
  const ch = s.channel || {};
  const via = !!ch.via;
  const endCo = s.client.company || (es ? "Cliente final" : "End customer");
  const asoCo = ch.company || (es ? "Asociado" : "Associate");
  // contracting party (buyer) and addressee: the associate or the end customer
  const buyerIsAso = via && ch.buyer !== "end";
  const toAso = via && ch.addressTo !== "end";
  const P_ASO = { company: asoCo, contact: ch.contact, title: ch.title, address: ch.address, email: ch.email };
  const P_END = { company: endCo, contact: s.client.contact, title: s.client.title, address: s.client.address, email: s.client.email };
  const addr = toAso ? P_ASO : P_END;
  const buyer = buyerIsAso ? P_ASO : P_END;
  const client = addr.company;
  const rpm = s.product.freq === "50" ? c.m.rpm50 : c.m.rpm60;
  const pages = [];
  const head = () => `<div class="pg-head">${logoBlock(s)}<div class="ph-r"><span>${esc(t.docTitle)}</span><b>${esc(s.quote.no)} · Rev. ${esc(s.quote.rev)}</b></div></div>`;
  const P = (cls, body, noHead) => pages.push(`<section class="pg ${cls}">${noHead ? "" : head()}<div class="pg-body">${body}</div><div class="pg-foot"><span>${esc(s.seller.company)} · ${esc(s.seller.web)}</span><span>${esc(t.confidential)} · ${esc(client)}</span><span class="pno"></span></div></section>`);
  const eyebrow = (e, h, lead) => `<div class="eyebrow">${esc(e)}</div><h2>${h}</h2>${lead ? `<p class="lead">${lead}</p>` : ""}`;

  /* 1 · Cover */
  pages.push(`<section class="pg cover">
    <div class="cv-img" style="background-image:url(assets/img/vm-hero.jpg)"><div class="cv-logo">${logoBlock(s, "cv")}</div><div class="cv-tag">${esc(t.coverKicker)}</div></div>
    <div class="cv-body">
      <div class="eyebrow">${esc(t.docTitle)}</div>
      <h1>${esc(c.m.id)} <span>· ${c.m.mw} MW</span></h1>
      <p class="cv-sub">${c.qty > 1 ? `${c.qty} × ${esc(c.m.id)} = <b>${fmtN(c.mwTot)} MW</b> · ` : ""}${esc(mc.tag)}</p>
      <p class="cv-lead">${esc(t.coverLead)}</p>
      <div class="cv-stats"><div><b>${c.m.mw}<small>MW</small></b><span>${es ? "potencia ISO por sistema" : "ISO output per system"}</span></div><div><b>2 × 20<small>ft</small></b><span>${es ? "contenedores ISO unidos" : "joined ISO containers"}</span></div><div><b>&lt;10<small>min</small></b><span>${es ? "arranque a plena carga" : "cold start to full load"}</span></div><div><b>${esc(s.product.freq)}<small>Hz</small></b><span>${esc(s.product.voltage)} · ${es ? "trifásico" : "3-phase"}</span></div></div>
      <div class="cv-meta">
        <div><span>${esc(t.preparedFor)}</span><b>${esc(client)}</b>${addr.contact ? `<i>${esc(addr.contact)}${addr.title ? " · " + esc(addr.title) : ""}</i>` : ""}${via ? `<i class="ec">${toAso ? (es ? "Cliente final: " : "End customer: ") + esc(endCo) : (es ? "Vía: " : "Via: ") + esc(asoCo)}</i>` : ""}</div>
        <div><span>${esc(t.site)}</span><b>${esc(siteTxt)}</b>${s.quote.project ? `<i>${esc(t.project)}: ${esc(s.quote.project)}</i>` : ""}</div>
        <div><span>${esc(t.quoteNo)}</span><b>${esc(s.quote.no)}</b><i>Rev. ${esc(s.quote.rev)}</i></div>
        <div><span>${esc(t.date)}</span><b>${esc(dateTxt)}</b><i>${esc(t.validUntil)} ${esc(validTxt)}</i></div>
      </div>
    </div>
    <div class="cv-foot"><span>${esc(s.seller.brand)} · ${esc(s.seller.company)}</span><span>${esc(s.seller.web)} · ${esc(s.seller.email)} · ${esc(s.seller.phone)}</span></div>
  </section>`);

  /* 2 · Letter + at a glance */
  const qtyTxt = es ? (c.qty === 1 ? "un (1)" : `${c.qty}`) : (c.qty === 1 ? "one (1)" : `${c.qty}`);
  const lc = { qty: c.qty, qtyTxt, model: c.m.id, totalMw: fmtN(c.mwTot, c.mwTot % 1 ? 1 : 0), siteTxt };
  P("letter", `
    <div class="ltr-top"><div><b>${esc(client)}</b>${addr.contact ? `<br>${esc(addr.contact)}${addr.title ? ", " + esc(addr.title) : ""}` : ""}${addr.address ? `<br>${nl2br(addr.address)}` : ""}${addr.email ? `<br>${esc(addr.email)}` : ""}</div>
    <div class="r">${esc(dateTxt)}<br>${esc(t.quoteNo)} ${esc(s.quote.no)}${s.quote.project ? `<br>${esc(t.project)}: ${esc(s.quote.project)}` : ""}</div></div>
    <h2 class="ltr-h">${esc(mc.name)}${c.qty > 1 ? ` · ${c.qty} ${esc(t.unitsPl)}` : ""}</h2>
    <p>${esc(t.dear)} ${esc(addr.contact || client)},</p>
    <p>${esc(t.letterP1(lc))}${via ? " " + esc(toAso
      ? (es ? `La propuesta se emite a ${asoCo}, en su carácter de ${roleTxt(ch.role, es).toLowerCase()} de PTE POWER, para el cliente final ${endCo.replace(/\.$/, "")}.` : `The proposal is issued to ${asoCo}, acting as PTE POWER ${roleTxt(ch.role, es).toLowerCase()}, for the end customer ${endCo.replace(/\.$/, "")}.`)
      : (es ? `La operación se canaliza a través de ${asoCo}, ${roleTxt(ch.role, es).toLowerCase()} de PTE POWER.` : `The transaction is channelled through ${asoCo}, PTE POWER ${roleTxt(ch.role, es).toLowerCase()}.`)) : ""}</p><p>${esc(t.letterP2)}</p><p>${esc(t.letterP3)}</p>
    <p class="sig">${esc(t.regards)}<br><br><b>${esc(s.quote.preparedBy || s.seller.company)}</b>${s.quote.preparedTitle ? `<br>${esc(s.quote.preparedTitle)}` : ""}<br>${esc(s.seller.company)}${s.quote.preparedEmail ? `<br>${esc(s.quote.preparedEmail)}` : ""}${s.quote.preparedPhone ? ` · ${esc(s.quote.preparedPhone)}` : ""}</p>
    <div class="glance"><div class="gl-h">${esc(t.keyFigures)}</div><div class="gl-grid">
      <div><span>${esc(t.kCapacity)}</span><b>${fmtN(c.mwTot, c.mwTot % 1 ? 1 : 0)} MW</b></div>
      <div><span>${esc(t.kSystems)}</span><b>${c.qty} × ${esc(c.m.id)}</b></div>
      <div class="wide"><span>${esc(t.kPrice)}</span><b>${$(c.total)}</b></div>
      <div><span>${esc(t.kLead)}</span><b>${fmtN(s.delivery.leadMonths)} ${esc(t.months)}</b></div>
      <div><span>${esc(t.kIncoterm)}</span><b>${esc(s.logistics.incoterm)}${s.logistics.namedPlace ? ` <small>${esc(s.logistics.namedPlace)}</small>` : ""}</b></div>
      <div><span>${esc(t.kValidity)}</span><b>${fmtN(s.quote.validity)} ${esc(t.days)}</b></div>
    </div></div>`);

  /* 2b · Commercial parties (only when the client comes through an associate) */
  if (via) {
    const L2 = (k) => (es ? PARTY_LBL.es[k] : PARTY_LBL.en[k]);
    const row = (k, v, multi) => (v ? `<dt>${esc(L2(k))}</dt><dd>${multi ? nl2br(v) : esc(v)}</dd>` : "");
    const shipTo = ch.shipTo === "associate" ? asoCo : ch.shipTo === "end" ? endCo : (es ? "Sitio de instalación" : "Installation site") + (siteTxt ? " — " + siteTxt : "");
    const roles = [
      [es ? "Propuesta dirigida a" : "Proposal addressed to", toAso ? asoCo : endCo],
      [es ? "Parte contratante / comprador" : "Contracting party / buyer", buyer.company],
      [es ? "Facturar a" : "Invoice to", buyer.company],
      [es ? "Entregar a" : "Deliver to", shipTo],
      [es ? "Cliente final / usuario" : "End customer / user", endCo],
      [es ? "Beneficiario de garantía y soporte" : "Warranty & support beneficiary", endCo]
    ];
    P("partiespg", `${eyebrow(es ? "Partes comerciales" : "Commercial parties", es ? "Canal comercial y cliente final" : "Channel partner & end customer", es ? "Esta operación llega a PTE POWER a través de un asociado. Se identifican a continuación todas las partes y su función en la propuesta." : "This transaction reaches PTE POWER through an associate. All parties and their role in the proposal are identified below.")}
      <div class="flow">
        <div class="fl-n"><span>${es ? "Fabricante / vendedor" : "Manufacturer / seller"}</span><b>${esc(s.seller.company)}</b><i>${esc(s.seller.brand)}</i></div>
        <div class="fl-a"></div>
        <div class="fl-n aso"><span>${esc(roleTxt(ch.role, es))}</span><b>${esc(asoCo)}</b><i>${esc([ch.city, ch.country].filter(Boolean).join(", "))}</i></div>
        <div class="fl-a"></div>
        <div class="fl-n end"><span>${es ? "Cliente final" : "End customer"}</span><b>${esc(endCo)}</b><i>${esc(siteTxt)}</i></div>
      </div>
      <div class="parties">
        <div class="party aso"><div class="bx-h">${es ? "Asociado" : "Associate"} · ${esc(roleTxt(ch.role, es))}</div><b class="pn">${esc(asoCo)}</b>
          <dl class="kv">${row("contact", ch.contact)}${row("title", ch.title)}${row("email", ch.email)}${row("phone", ch.phone)}${row("address", ch.address, true)}${row("country", [ch.city, ch.country].filter(Boolean).join(", "))}${row("taxId", ch.taxId)}${row("web", ch.web)}${row("agreement", ch.agreement)}${row("territory", ch.territory)}</dl></div>
        <div class="party end"><div class="bx-h">${es ? "Cliente final" : "End customer"}</div><b class="pn">${esc(endCo)}</b>
          <dl class="kv">${row("contact", s.client.contact)}${row("title", s.client.title)}${row("email", s.client.email)}${row("phone", s.client.phone)}${row("address", s.client.address, true)}${row("country", s.client.country)}${row("taxId", s.client.taxId)}${row("web", s.client.web)}${row("industry", s.client.industry)}${row("site", siteTxt)}${row("endUse", s.client.endUse || s.site.application)}</dl></div>
      </div>
      <table class="tbl roles"><thead><tr><th>${es ? "Función" : "Role"}</th><th>${es ? "Parte" : "Party"}</th></tr></thead><tbody>${roles.map((r) => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td></tr>`).join("")}</tbody></table>
      <p class="note">${es ? "Declaración de uso final: el asociado confirma que el equipo se destina al cliente final y al uso indicados, y notificará a PTE POWER cualquier cambio de destinatario, sitio o uso antes de la entrega, a efectos de garantía, soporte técnico y control de exportaciones." : "End-use statement: the associate confirms that the equipment is destined for the end customer and use stated above, and will notify PTE POWER of any change of recipient, site or use before delivery, for warranty, technical support and export-control purposes."}</p>`);
  }

  /* 3 · Product family */
  const fam = MODELS.map((m) => {
    const mcx = MODEL_COPY[s.lang][m.id];
    const on = m.id === c.m.id;
    return `<tr class="${on ? "sel" : ""}"><td><b>${m.id}</b>${on ? `<em>${esc(t.selected)}</em>` : ""}<small>${esc(mcx.tag)}</small></td><td class="n">${fmtN(m.mw, m.mw % 1 ? 1 : 0)} MW</td><td class="n">${fmtN(m.mw * 1250)} kVA</td><td class="n">${fmtN(m.mw * m.hr[0] / 1000, 0)}–${fmtN(m.mw * m.hr[1] / 1000, 0)}</td><td class="apps">${esc(mcx.apps.slice(0, 2).join(" · "))}</td><td class="n">${$(m.mw * c.ppm)}</td></tr>`;
  }).join("");
  P("family", `${eyebrow(t.family, esc(t.familyLead))}
    <div class="fam-img" style="background-image:url(assets/img/unit-exterior.jpg)"></div>
    <table class="tbl fam"><thead><tr><th>${esc(t.fModel)}</th><th class="n">${esc(t.fOutput)}</th><th class="n">${esc(t.fGen)}</th><th class="n">MMBtu/h</th><th>${esc(t.applications)}</th><th class="n">${esc(t.fPrice)}</th></tr></thead><tbody>${fam}</tbody></table>
    <p class="note">${es ? `Precios indicativos por sistema a ${$(c.ppm)} por MW, EXW, sin opcionales ni logística. Consumo de combustible a plena carga ISO, indicativo; se confirma en el FAT.` : `Indicative prices per system at ${$(c.ppm)} per MW, EXW, excluding options and logistics. Fuel at ISO full load, indicative; confirmed at FAT.`}</p>`);

  /* 4 · The system (two containers) */
  P("system", `${eyebrow(t.sysEyebrow, esc(t.sysH), esc(t.sysLead))}
    <div class="ga">${svgArrangement(s.lang)}</div>
    <div class="cap">${esc(t.schemTitle)}</div>
    <div class="mods">
      <figure><div class="ph" style="background-image:url(assets/img/cont-turbine.jpg?v=3)"></div><figcaption><b>${esc(t.mod1)}</b>${esc(t.mod1d)}</figcaption></figure>
      <figure><div class="ph" style="background-image:url(assets/img/cont-generator.jpg?v=3)"></div><figcaption><b>${esc(t.mod2)}</b>${esc(t.mod2d)}</figcaption></figure>
    </div>`);

  /* 5 · Selected model description + site performance */
  const fuelLbl = L.fuel[s.product.fuel];
  P("model", `${eyebrow(t.specEyebrow, esc(mc.name), esc(mc.desc))}
    <div class="two">
      <div class="ph tall" style="background-image:url(assets/img/unit-reveal.jpg)"></div>
      <div>
        <div class="box"><div class="bx-h">${esc(t.applications)}</div><ul class="ticks">${mc.apps.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
        <div class="box acc"><div class="bx-h">${esc(t.whyThis)}</div><p>${esc(mc.why)}</p></div>
        <div class="box"><div class="bx-h">${es ? "Configuración cotizada" : "Quoted configuration"}</div>
          <dl class="kv"><dt>${es ? "Tensión / frecuencia" : "Voltage / frequency"}</dt><dd>${esc(s.product.voltage)} · ${esc(s.product.freq)} Hz</dd>
          <dt>${es ? "Combustible" : "Fuel"}</dt><dd>${esc(fuelLbl)}</dd>
          <dt>${es ? "Modo de operación" : "Operating mode"}</dt><dd>${esc(L.mode[s.product.mode])}</dd>
          <dt>${es ? "Aplicación" : "Application"}</dt><dd>${esc(s.site.application || "—")}</dd></dl></div>
      </div>
    </div>
    <div class="perf"><div class="bx-h">${esc(t.sitePerf)}</div>
      <div class="perf-grid">
        <div><span>${esc(t.isoRating)}</span><b>${fmtN(c.m.mw, 1)} MW</b></div>
        <div><span>${esc(t.siteAmb)}</span><b>${fmtN(s.site.ambient)} °C</b><i>× ${fmtN(c.fT, 3)}</i></div>
        <div><span>${esc(t.siteAlt)}</span><b>${fmtN(s.site.altitude)} m</b><i>× ${fmtN(c.fA, 3)}</i></div>
        <div class="hl"><span>${esc(t.siteOut)}</span><b>≈ ${fmtN(c.siteMw, 2)} MW</b></div>
        <div class="hl"><span>${esc(t.siteTotal)}</span><b>≈ ${fmtN(c.siteMw * c.qty, 1)} MW</b></div>
      </div>
      <p class="note">${esc(t.sitePerfNote)}</p></div>`);

  /* 6 · Spec table */
  const R = (a, b) => (es ? b : a);
  const dualOrDiesel = ["diesel", "dual"].includes(s.product.fuel);
  const spec = [
    [R("Model", "Modelo"), esc(mc.name)],
    [R("Rated output (ISO, continuous prime)", "Potencia nominal (ISO, prime continua)"), `<b>${c.m.mw} MW</b> (${fmtN(c.m.mw * 1000)} kWe) · 24/7`],
    [R("Generator rating", "Potencia del generador"), `${fmtN(c.kva)} kVA ${R("at PF 0.8 lagging", "a FP 0,8 inductivo")}`],
    [R("Configuration", "Configuración"), R("2 × 20 ft ISO containers joined end to end — Module 01 turbine · Module 02 generator", "2 contenedores ISO de 20 pies unidos por sus extremos — Módulo 01 turbina · Módulo 02 generador")],
    [R("Prime mover", "Motor primario"), R("Aeroderivative gas turbine · gas generator with free power turbine · reduction gearbox to generator speed", "Turbina a gas aeroderivada · generador de gas con turbina libre de potencia · caja reductora a velocidad del generador")],
    [R("Generator", "Generador"), R(`3-phase synchronous, brushless excitation, 4-pole, ${fmtN(rpm)} rpm, Class H insulation / Class F rise`, `Sincrónico trifásico, excitación sin escobillas, 4 polos, ${fmtN(rpm)} rpm, aislamiento clase H / calentamiento clase F`)],
    [R("Output voltage / frequency", "Tensión / frecuencia de salida"), `${esc(s.product.voltage)} · ${esc(s.product.freq)} Hz · 3 ph`],
    [R("Fuel (quoted)", "Combustible (cotizado)"), `${esc(fuelLbl)} · ${R("natural gas, conditioned field/associated gas, LPG and diesel per fuel specification", "gas natural, gas de campo/asociado acondicionado, GLP y diésel según especificación de combustible")}`],
    [R("Heat rate (LHV, ISO)", "Heat rate (PCI, ISO)"), `${fmtN(c.m.hr[0])}–${fmtN(c.m.hr[1])} Btu/kWh · <i>${esc(t.indicative)}</i>`],
    [R("Fuel at full load", "Combustible a plena carga"), `${fmtN(c.mmbtu[0], 1)}–${fmtN(c.mmbtu[1], 1)} MMBtu/h ≈ ${fmtN(c.nm3[0])}–${fmtN(c.nm3[1])} Nm³/h ${R("natural gas", "gas natural")}${dualOrDiesel ? ` · ${fmtN(c.litres[0])}–${fmtN(c.litres[1])} L/h ${R("diesel", "diésel")}` : ""} · <i>${esc(t.indicative)}</i>`],
    [R("Start time", "Tiempo de arranque"), R("Cold start to full load in under 10 minutes", "Arranque en frío a plena carga en menos de 10 minutos")],
    [R("Operating modes", "Modos de operación"), R("Island · grid-parallel · microgrid · isochronous and droop · load sharing between units", "Isla · paralelo con red · microrred · isócrono y estatismo · reparto de carga entre unidades")],
    [R("Control system", "Sistema de control"), R("PLC control, protection and SCADA on the Schneider Electric EcoStruxure platform · local HMI · remote monitoring", "Control PLC, protecciones y SCADA sobre plataforma Schneider Electric EcoStruxure · HMI local · monitoreo remoto")],
    [R("Communications", "Comunicaciones"), R("Modbus TCP · OPC UA · IEC 61850 on request", "Modbus TCP · OPC UA · IEC 61850 a pedido")],
    [R("Generator protection", "Protección del generador"), "ANSI 25 · 27/59 · 32 · 40 · 46 · 50/51V · 81O/U · 87G"],
    [R("Enclosure", "Recinto"), R("Acoustically insulated 20 ft ISO steel containers · forced ventilation · fire & gas detection with suppression", "Contenedores ISO de 20 pies de acero con aislamiento acústico · ventilación forzada · detección de fuego y gas con extinción")],
    [R("Design ambient", "Ambiente de diseño"), R("−40 °C to +60 °C (cold- and hot-weather packages as required)", "−40 °C a +60 °C (paquetes de frío y calor según se requiera)")],
    [R("Container dimensions", "Dimensiones de contenedor"), R("6.06 × 2.44 × 2.59 m each (ISO 668 20 ft, external) — final per GA drawing", "6,06 × 2,44 × 2,59 m cada uno (ISO 668 20 pies, exterior) — definitivo según plano de disposición")],
    [R("Transport", "Transporte"), R("Road, sea and rail with standard ISO handling and twist-locks", "Carretera, mar y ferrocarril con manipulación ISO estándar y twist-locks")],
    [R("Emissions & noise", "Emisiones y ruido"), R("Per project datasheet after FAT; guaranteed values stated in the contract", "Según hoja de datos del proyecto tras el FAT; valores garantizados en el contrato")],
    [R("Applicable standards", "Normas aplicables"), "ISO 3977 · ISO 8528 · IEC 60034 · IEC 60076 · NFPA 37 · NFPA 70 / IEC 60364"]
  ];
  P("spec", `${eyebrow(t.specEyebrow, esc(t.specH))}
    <table class="tbl spec"><tbody>${spec.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</tbody></table>
    <p class="note">${es ? "Los valores indicativos se sustituyen por valores garantizados en la hoja de datos del proyecto, emitida tras el ensayo de aceptación en fábrica y el análisis del combustible del sitio. La configuración final se define con el ingeniero responsable del comprador y la normativa aplicable." : "Indicative values are replaced by guaranteed values in the project datasheet, issued after the factory acceptance test and analysis of the site fuel. Final configuration is agreed with the buyer's engineer of record and the applicable codes."}</p>`);

  /* 7 · Scope of supply + SLD */
  const inc = es
    ? ["Módulo 01: turbina a gas aeroderivada sobre bastidor, sistema de combustible, consola de aceite, admisión filtrada y ventilación", "Módulo 02: generador sincrónico, reductor y acoplamiento, interruptor de generador y relé de protección", "Control PLC, HMI local y enlace de monitoreo remoto", "Detección de fuego y gas y sistema de extinción en ambos módulos", "Cableado de potencia y control entre módulos", "Ensayo de aceptación en fábrica (FAT) presenciable por el comprador", "Documentación: disposición general, unifilar, P&ID, manuales de O&M y certificados", `Garantía estándar de ${fmtN(s.delivery.warrantyMonths)} meses`]
    : ["Module 01: aeroderivative gas turbine on skid, fuel system, lube-oil console, filtered intake and ventilation", "Module 02: synchronous generator, gearbox and coupling, generator breaker and protection relay", "PLC control, local HMI and remote-monitoring link", "Fire & gas detection and suppression in both modules", "Inter-module power and control cabling", "Factory acceptance test (FAT), open to witness by the buyer", "Documentation: general arrangement, single-line, P&ID, O&M manuals and certificates", `Standard warranty of ${fmtN(s.delivery.warrantyMonths)} months`];
  const exc = es
    ? ["Obras civiles, plataforma o fundación y puesta a tierra del sitio", "Línea de gas hasta la entrada del skid y análisis de gas", "Interconexión de MT más allá de los bornes del generador (o del transformador si se cotiza)", "Permisos, licencias y estudios ambientales", "Grúas, izaje y mano de obra local salvo indicación", "Combustible y aceite para la puesta en marcha", "Impuestos locales salvo Incoterm DDP"]
    : ["Civil works, pad or foundation and site grounding grid", "Gas line up to the skid inlet and the gas analysis", "MV interconnection beyond generator terminals (or transformer, if quoted)", "Permits, licences and environmental studies", "Cranes, rigging and local labour unless stated", "Fuel and lube oil for commissioning", "Local taxes unless the Incoterm is DDP"];
  P("scope", `${eyebrow(t.scopeEyebrow, esc(t.scopeH))}
    <div class="three">
      <div class="box"><div class="bx-h">${esc(t.included)}</div><ul class="ticks">${inc.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="box acc"><div class="bx-h">${esc(t.optional)}</div>${c.opts.length ? `<ul class="plus">${c.opts.map((o) => `<li><b>${esc(o.label)}</b>${o.desc && c.opts.length <= 5 ? `<br><span>${esc(o.desc)}</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted">—</p>`}</div>
      <div class="box"><div class="bx-h">${esc(t.excluded)}</div><ul class="cross">${exc.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    </div>
    ${c.opts.length <= 4 ? `<div class="scope-img"><div class="ph" style="background-image:url(assets/img/unit-interior.jpg)"></div><div class="ph" style="background-image:url(assets/img/fab-welding.jpg)"></div></div>` : ""}`);

  /* 7b · Electrical integration & controls */
  const ctl = es
    ? [["Monitoreo en tiempo real", "Potencia, velocidad, temperaturas, vibración y caudal de combustible en el sitio y en el centro de operaciones remoto de PTE."], ["Mantenimiento predictivo", "El análisis de tendencias detecta el desgaste antes de que provoque un disparo; las intervenciones se planifican."], ["Gestión de flota", "Una sola vista de todos los sistemas para despacho, redundancia y programación del mantenimiento."], ["Integración", "Datos hacia su SCADA o historiador mediante protocolos industriales estándar."]]
    : [["Real-time monitoring", "Output, speed, temperatures, vibration and fuel flow on site and in PTE's remote operations center."], ["Predictive maintenance", "Trend analysis flags wear before it becomes a trip, so interventions are planned rather than reactive."], ["Fleet management", "One view across all systems for dispatch, redundancy and maintenance scheduling."], ["Integration", "Data to your SCADA or historian through standard industrial protocols."]];
  P("elec", `${eyebrow(es ? "Integración eléctrica y control" : "Electrical integration & controls", esc(t.sld))}
    <div class="sld">${svgSLD(s, c)}</div>
    <div class="two ctl">
      <div class="ph" style="background-image:url(assets/img/unit-control.jpg)"></div>
      <div><div class="bx-h">${es ? "Operación digital" : "Digital operations"}</div>${ctl.map((x) => `<div class="ctl-i"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join("")}</div>
    </div>`);

  /* 8 · Commercial offer */
  const rows = [];
  rows.push(`<tr><td><b>${esc(t.equipLine(c.m.id, c.m.mw, $(c.ppm)))}</b><br><span>${esc(mc.name)} · ${esc(s.product.voltage)} · ${esc(s.product.freq)} Hz</span></td><td class="n">${c.qty}</td><td class="n">${$(c.unit)}</td><td class="n">${$(c.equip)}</td></tr>`);
  rows.push(`<tr class="st"><td colspan="3">${esc(t.subtotalEquip)}</td><td class="n">${$(c.equip)}</td></tr>`);
  if (c.opts.length) {
    c.opts.forEach((o) => rows.push(`<tr><td>${esc(o.label)}</td><td class="n">${fmtN(o.qty)}</td><td class="n">${o.price ? $(o.price) : (es ? "incluido" : "included")}</td><td class="n">${o.amt ? $(o.amt) : "—"}</td></tr>`));
    rows.push(`<tr class="st"><td colspan="3">${esc(t.optionsSub)}</td><td class="n">${$(c.optSum)}</td></tr>`);
  }
  if (c.logi.length) {
    c.logi.forEach((o) => rows.push(`<tr><td>${esc(o.label)}</td><td class="n">1</td><td class="n">${$(o.amt)}</td><td class="n">${$(o.amt)}</td></tr>`));
    rows.push(`<tr class="st"><td colspan="3">${esc(t.logisticsSub)} · ${esc(s.logistics.incoterm)}</td><td class="n">${$(c.logSum)}</td></tr>`);
  }
  if (c.disc) rows.push(`<tr class="neg"><td colspan="3">${esc(t.discount)} (${fmtN(s.pricing.discountPct, 1)} %)</td><td class="n">−${$(c.disc)}</td></tr>`);
  if (c.tax) rows.push(`<tr><td colspan="3">${esc(s.pricing.taxLabel || t.taxes)} (${fmtN(s.pricing.taxPct, 1)} %)</td><td class="n">${$(c.tax)}</td></tr>`);
  const riskTxt = L.risk[c.inc.risk];
  const longPrice = c.opts.length + c.logi.length + (c.disc ? 1 : 0) + (c.tax ? 1 : 0) > 10;
  const incoHtml = `    <div class="inco">
      <div class="inco-l"><div class="inco-code">${esc(s.logistics.incoterm)}</div><div class="inco-y">Incoterms® 2020</div></div>
      <dl class="kv">
        <dt>${esc(t.namedPlace)}</dt><dd>${esc(s.logistics.namedPlace || "—")}</dd>
        <dt>${esc(t.pol)}</dt><dd>${esc(s.logistics.pol || "—")}</dd>
        <dt>${esc(t.pod)}</dt><dd>${esc(s.logistics.pod || "—")}</dd>
        <dt>${esc(t.transport)}</dt><dd>${esc(L.transportMode[s.logistics.transport])}${s.logistics.transitWeeks ? ` · ${fmtN(s.logistics.transitWeeks)} ${esc(t.weeks)}` : ""}</dd>
        <dt>${esc(t.riskPasses)}</dt><dd>${esc(riskTxt)}</dd>
      </dl>
    </div>
    <table class="tbl resp"><thead><tr><th>${es ? "Costo" : "Cost"}</th>${COST_KEYS.map((k) => `<th title="${esc(L.cost[k])}">${esc(L.costShort[k])}</th>`).join("")}</tr></thead>
    <tbody><tr><td>${es ? "Responsable" : "Paid by"}</td>${COST_KEYS.map((k) => c.inc.costs.includes(k) ? `<td class="sp">${es ? "Vendedor" : "Seller"}</td>` : `<td class="bp">${es ? "Comprador" : "Buyer"}</td>`).join("")}</tr></tbody></table>`;
  P("price", `${eyebrow(t.comEyebrow, esc(t.comH))}
    <table class="tbl price"><thead><tr><th>${esc(t.item)}</th><th class="n">${esc(t.qty)}</th><th class="n">${esc(t.unitPrice)}</th><th class="n">${esc(t.amount)}</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
    <tfoot><tr><td colspan="3">${esc(t.total)} · ${esc(s.logistics.incoterm)}${s.logistics.namedPlace ? " " + esc(s.logistics.namedPlace) : ""}</td><td class="n">${$(c.total)}</td></tr>
    <tr class="pm"><td colspan="3">${esc(t.perMw)}</td><td class="n">${$(c.total / c.mwTot)}</td></tr></tfoot></table>
    <p class="note">${esc(t.priceNote(cur))}</p>
    ${longPrice ? "" : incoHtml}`);

  /* 9 · Payment + schedule */
  P("pay", `${eyebrow(t.payEyebrow, esc(t.payH))}
    <table class="tbl pay"><thead><tr><th>#</th><th>${esc(t.milestone)}</th><th>${esc(t.trigger)}</th><th class="n">%</th><th class="n">${esc(t.amount)}</th></tr></thead>
    <tbody>${c.pays.map((p, i) => `<tr><td class="idx">${i + 1}</td><td><b>${esc(p.label || L.trig[p.key])}</b></td><td>${esc(p.desc || L.trigDesc[p.key])}</td><td class="n">${fmtN(p.pct, 1)} %</td><td class="n">${$(p.amt)}</td></tr>`).join("")}</tbody>
    <tfoot><tr><td></td><td colspan="2">${esc(t.total)}</td><td class="n ${Math.abs(c.paySum - 100) > 0.01 ? "warn" : ""}">${fmtN(c.paySum, 1)} %</td><td class="n">${$(c.total)}</td></tr></tfoot></table>
    ${Math.abs(c.paySum - 100) > 0.01 ? `<p class="warnbox">⚠ ${esc(t.payWarn)}</p>` : ""}
    <div class="paybar">${c.pays.map((p, i) => `<div class="pb${i}" style="flex:${Math.max(0.001, num(p.pct))}"><b>${fmtN(p.pct)} %</b><span>${esc(p.label || L.trig[p.key])}</span></div>`).join("")}</div>
    <dl class="kv wide"><dt>${esc(t.payMethod)}</dt><dd>${esc(payMethod(s))}</dd></dl>
    <div class="bx-h mt">${esc(t.schEyebrow)} · ${esc(t.schH)}</div>
    <div class="gantt">${svgGantt(s, c)}</div>`);

  /* 10 · Site readiness & tips */
  const tips = buildTips(s, c);
  const ready = es
    ? [["Plataforma", `Superficie nivelada de ripio compactado o losa de hormigón para ${c.qty * 2} contenedor${c.qty * 2 > 1 ? "es" : ""} de 20 pies, con drenaje y 3 m libres alrededor para mantenimiento.`], ["Acceso e izaje", "Camino apto para camión con contenedor de 20 pies y área firme para una grúa móvil; cada módulo se iza con separador desde las esquineras ISO."], ["Combustible", "Análisis cromatográfico del gas (PCI, H₂S, líquidos, presión y caudal disponibles) antes de congelar el alcance del skid de gas."], ["Eléctrico", "Estudio de interconexión y coordinación de protecciones; nivel de MT, potencia de cortocircuito y esquema de puesta a tierra del sitio."], ["Permisos", "Permiso de emisiones atmosféricas y de ruido según la jurisdicción; distancias de seguridad a otros equipos según NFPA 37 o norma local."], ["Operación", "Personal a capacitar, conectividad para monitoreo remoto (4G/LTE, satelital o fibra) y almacén para repuestos."]]
    : [["Pad", `Level compacted-gravel pad or concrete slab for ${c.qty * 2} × 20 ft container${c.qty * 2 > 1 ? "s" : ""}, with drainage and 3 m clear around for maintenance.`], ["Access & lifting", "Road access for a 20 ft container truck and firm standing for a mobile crane; each module lifts from its ISO corner castings with a spreader."], ["Fuel", "Gas chromatography (LHV, H₂S, liquids, available pressure and flow) before the gas-skid scope is frozen."], ["Electrical", "Interconnection and protection-coordination study; MV level, short-circuit level and site grounding scheme."], ["Permits", "Air-emissions and noise permits per jurisdiction; safety distances to other equipment per NFPA 37 or local code."], ["Operations", "Staff to be trained, connectivity for remote monitoring (4G/LTE, satellite or fibre) and a store for spares."]];
  P("site", `${eyebrow(es ? "Sitio y operación" : "Site & operations", esc(t.siteH))}
    <div class="ph wide" style="background-image:url(assets/img/deploy-crane.jpg)"></div>
    <div class="ready">${ready.map((r, i) => `<div><span class="rn">${String(i + 1).padStart(2, "0")}</span><b>${esc(r[0])}</b><p>${esc(r[1])}</p></div>`).join("")}</div>
    <div class="deploy"><div class="ph" style="background-image:url(assets/img/vm-aerial.jpg)"></div><div><div class="bx-h">${es ? "De la entrega a la primera energía" : "From delivery to first power"}</div><ol class="steps">${(es ? [["Entrega", "Dos contenedores por sistema llegan en camión estándar."], ["Posicionamiento", "Grúa móvil; módulos unidos con separación mínima."], ["Conexión", "Gas, cable de MT y enlace de control entre módulos."], ["Puesta en marcha", "Pruebas funcionales, sincronismo y prueba de desempeño."], ["Operación", "Monitoreo remoto 24/7 y mantenimiento planificado."]] : [["Deliver", "Two containers per system arrive on standard trucks."], ["Set", "Mobile crane; modules joined with minimal gap."], ["Connect", "Gas, MV cable and the inter-module control link."], ["Commission", "Functional tests, synchronizing and performance run."], ["Operate", "24/7 remote monitoring and planned maintenance."]]).map((x) => `<li><b>${x[0]}</b><span>${x[1]}</span></li>`).join("")}</ol></div></div>
    <div class="tips"><div class="bx-h">${esc(t.tipsH)}</div><ul>${tips.map((x) => `<li>${x}</li>`).join("")}</ul></div>`);

  /* 10b · Technical support, spare parts and major repairs */
  if (s.afterSales !== false) P("support", supportPage(s, c));

  /* 11 · Terms + acceptance */
  const terms = buildTerms(s, c, validTxt);
  P(via ? "terms tight" : "terms", `${eyebrow(t.termsEyebrow, esc(t.termsH))}
    <ol class="terms">${terms.map((x) => `<li><b>${esc(x[0])}.</b> ${x[1]}</li>`).join("")}</ol>
    ${s.notes ? `<div class="box acc notes"><div class="bx-h">${es ? "Condiciones particulares" : "Special conditions"}</div><p>${nl2br(s.notes)}</p></div>` : ""}
    <div class="accept"><div class="bx-h">${esc(t.accept)}</div><p>${esc(t.acceptTxt)}</p>
      <div class="sigs ${via ? "s3" : ""}">${[[t.forSeller, s.seller.company, s.quote.preparedBy, s.quote.preparedTitle], [t.forBuyer, buyer.company, buyer.contact, buyer.title], ...(via ? [buyerIsAso ? [es ? "Conformidad del cliente final" : "End customer acknowledgement", endCo, s.client.contact, s.client.title] : [es ? "Por el asociado" : "For the associate", asoCo, ch.contact, ch.title]] : [])].map((p) => `<div><div class="sg-h">${esc(p[0])}</div><b>${esc(p[1])}</b>
        <div class="sl"><span>${esc(t.sName)}</span>${esc(p[2] || "")}</div><div class="sl"><span>${esc(t.sTitle)}</span>${esc(p[3] || "")}</div><div class="sl tall"><span>${esc(t.sSign)}</span></div><div class="sl"><span>${esc(t.sDate)}</span></div></div>`).join("")}</div></div>`);

  const n = pages.length;
  return pages.map((p, i) => p.replace('<span class="pno"></span>', `<span class="pno">${esc(t.page)} ${i + 1} ${esc(t.of)} ${n}</span>`)).join("");
}

function buildTips(s, c) {
  const es = s.lang === "es";
  const out = [];
  const T0 = num(s.site.ambient), h = num(s.site.altitude);
  if (T0 > 30) out.push(es ? `<b>Calor:</b> a ${fmtN(T0)} °C la turbina entrega ≈ ${fmtN(c.fT * 100)} % de su potencia ISO. Un enfriamiento de aire de admisión (evaporativo o chiller) recupera buena parte de esa pérdida en las horas pico.` : `<b>Heat:</b> at ${fmtN(T0)} °C the turbine delivers ≈ ${fmtN(c.fT * 100)} % of ISO output. Inlet-air cooling (evaporative or chiller) recovers much of that loss at peak hours.`);
  if (h > 800) out.push(es ? `<b>Altitud:</b> a ${fmtN(h)} m la densidad del aire deja ≈ ${fmtN(c.fA * 100)} % de la potencia ISO. Dimensione la capacidad instalada sobre la potencia en sitio, no sobre la placa.` : `<b>Altitude:</b> at ${fmtN(h)} m air density leaves ≈ ${fmtN(c.fA * 100)} % of ISO output. Size installed capacity on site output, not on the nameplate.`);
  if (["field", "assoc", "bio"].includes(s.product.fuel)) out.push(es ? "<b>Gas de campo:</b> no congele el alcance del skid de gas sin una cromatografía reciente; H₂S, líquidos y poder calorífico variable son la causa principal de disparos." : "<b>Field gas:</b> do not freeze the gas-skid scope without a recent chromatography; H₂S, liquids and swinging heating value are the main cause of trips.");
  if (c.qty === 1 && ["island", "micro"].includes(s.product.mode)) out.push(es ? "<b>Redundancia:</b> con un solo sistema en isla, una parada de mantenimiento deja la carga sin energía. Considere N+1 o un respaldo diésel para cargas críticas." : "<b>Redundancy:</b> with a single system in island mode, a maintenance stop leaves the load unpowered. Consider N+1 or diesel backup for critical loads.");
  if (s.product.mode === "parallel") out.push(es ? "<b>Paralelo con red:</b> inicie temprano el estudio de interconexión con la distribuidora; suele ser el camino crítico, no la fabricación." : "<b>Grid-parallel:</b> start the utility interconnection study early; it is often the critical path, not manufacturing.");
  if (["EXW", "FCA", "FAS", "FOB"].includes(s.logistics.incoterm)) out.push(es ? `<b>${esc(s.logistics.incoterm)}:</b> el flete principal y el seguro corren por su cuenta. Contrate el seguro de carga desde la entrega; dos contenedores de este valor no deben viajar sin cobertura.` : `<b>${esc(s.logistics.incoterm)}:</b> main carriage and insurance are on the buyer. Place cargo insurance from handover; two containers of this value should never travel uninsured.`);
  if (["CIF", "CIP"].includes(s.logistics.incoterm)) out.push(es ? "<b>Seguro:</b> CIF exige solo cobertura mínima (ICC C); CIP exige ICC A. Para equipos de este valor se recomienda ICC A en ambos casos." : "<b>Insurance:</b> CIF requires only minimum cover (ICC C); CIP requires ICC A. For equipment of this value, ICC A is recommended in both cases.");
  if (s.logistics.incoterm === "DDP") out.push(es ? "<b>DDP:</b> el vendedor asume aranceles e IVA de importación; verifique si el comprador puede recuperar ese IVA, porque DAP suele resultar más eficiente." : "<b>DDP:</b> the seller carries import duties and VAT; check whether the buyer can recover that VAT, as DAP is often more efficient.");
  if (!s.options.find((o) => o.key === "ltsa" && o.on)) out.push(es ? "<b>Servicio:</b> un contrato de servicio a largo plazo fija el costo de mantenimiento por MWh y protege la disponibilidad desde el primer día." : "<b>Service:</b> a long-term service agreement fixes maintenance cost per MWh and protects availability from day one.");
  out.push(es ? "<b>Inspecciones:</b> los hitos de pago 2 y 3 están atados a inspecciones presenciales; agende a su inspector con 10 días hábiles de anticipación." : "<b>Inspections:</b> payment milestones 2 and 3 are tied to witnessed inspections; book your inspector 10 business days ahead.");
  return out.slice(0, 7);
}

function buildTerms(s, c, validTxt) {
  const es = s.lang === "es";
  const L = LBL[s.lang];
  const cur = s.currency;
  const out = buildTermsBase(s, c, validTxt, es, L, cur);
  const ch = s.channel || {};
  if (ch.via) {
    const aso = esc(ch.company || (es ? "el asociado" : "the associate")), end = esc(s.client.company || (es ? "el cliente final" : "the end customer")).replace(/\.$/, "");
    const role = esc(roleTxt(ch.role, es).toLowerCase());
    out.splice(out.length - 1, 0, es
      ? ["Canal comercial", `Esta propuesta se tramita a través de ${aso}, ${role} de PTE POWER${ch.agreement ? ` (acuerdo ${esc(ch.agreement)})` : ""}, para el cliente final ${end}. La garantía y el soporte técnico se prestan al cliente final.${c.commOnTop ? "" : " Ninguna comisión o remuneración del asociado se suma al precio indicado salvo que figure detallada."}`]
      : ["Commercial channel", `This proposal is handled through ${aso}, PTE POWER ${role}${ch.agreement ? ` (agreement ${esc(ch.agreement)})` : ""}, for the end customer ${end}. Warranty and technical support are provided to the end customer.${c.commOnTop ? "" : " No associate commission or fee is added to the stated price unless itemized."}`]);
  }
  return out;
}

function roleTxt(r, es) {
  const m = es
    ? { distributor: "Distribuidor", rep: "Representante comercial", agent: "Agente", epc: "Integrador EPC", reseller: "Distribuidor", partner: "Socio comercial" }
    : { distributor: "Distributor", rep: "Sales representative", agent: "Agent", epc: "EPC integrator", reseller: "Distributor", partner: "Business partner" };
  return m[r] || m.partner;
}

function buildTermsBase(s, c, validTxt, es, L, cur) {
  return es ? [
    ["Validez", `Esta propuesta es válida hasta el ${esc(validTxt)} (${fmtN(s.quote.validity)} días). Vencido ese plazo, precios y plazos quedan sujetos a confirmación.`],
    ["Precios", `En ${esc(cur)}, fijos durante la validez, bajo condición ${esc(s.logistics.incoterm)} (Incoterms® 2020). Los costos no asignados al vendedor por el Incoterm corren por cuenta del comprador.`],
    ["Pagos", `Según el cronograma de la página anterior, por ${esc(payMethod(s))}. Cada hito se factura al cumplirse; los pagos vencen a 10 días de la factura. <b>El precio total del contrato debe estar íntegramente pagado antes de la entrega, sin excepción:</b> ningún equipo se libera para embarque, se entrega ni se pone a disposición mientras exista saldo pendiente.`],
    ["Plazo de entrega", `${fmtN(s.delivery.leadMonths)} meses desde la recepción del anticipo y de los planos aprobados. Las demoras del comprador en aprobaciones, pagos o preparación del sitio extienden el plazo en igual medida.`],
    ["Inspecciones", "El comprador puede presenciar la Inspección 1 (mitad de fabricación) y la Inspección 2 (FAT). Si no asiste en la fecha notificada, se entenderá realizada con el informe del vendedor."],
    ["Riesgo y propiedad", `El riesgo se transfiere según ${esc(s.logistics.incoterm)}: ${esc(L.risk[c.inc.risk].toLowerCase())}. La propiedad se transfiere con el pago total del precio.`],
    ["Garantía", `${fmtN(s.delivery.warrantyMonths)} meses desde la puesta en marcha o ${fmtN(num(s.delivery.warrantyMonths) + 6)} meses desde la entrega, lo que ocurra primero, contra defectos de materiales y fabricación, sujeta a operación y mantenimiento según el manual de PTE.`],
    ["Responsabilidad", "La responsabilidad total del vendedor se limita al precio del contrato. Se excluyen daños indirectos, lucro cesante y pérdida de producción."],
    ["Fuerza mayor", "Ninguna parte responde por incumplimientos causados por hechos fuera de su control razonable, notificados por escrito dentro de 10 días."],
    ["Cumplimiento", "El suministro está sujeto a las normas de control de exportaciones de EE. UU. y a la obtención de las licencias que correspondan."],
    ["Ley y controversias", `${esc(s.terms.law)}. ${esc(s.terms.dispute)}.`]
  ] : [
    ["Validity", `This proposal is valid until ${esc(validTxt)} (${fmtN(s.quote.validity)} days). After that date, prices and lead times are subject to confirmation.`],
    ["Prices", `In ${esc(cur)}, fixed for the validity period, on ${esc(s.logistics.incoterm)} terms (Incoterms® 2020). Costs not allocated to the seller by the Incoterm are for the buyer's account.`],
    ["Payment", `Per the schedule on the previous page, by ${esc(payMethod(s))}. Each milestone is invoiced when reached; payments fall due 10 days from invoice. <b>The full contract price must be paid before delivery, without exception:</b> no equipment is released for shipment, delivered or handed over while any balance remains outstanding.`],
    ["Delivery", `${fmtN(s.delivery.leadMonths)} months from receipt of the down payment and approved drawings. Buyer delays in approvals, payments or site readiness extend the schedule accordingly.`],
    ["Inspections", "The buyer may witness Inspection 1 (mid-manufacturing) and Inspection 2 (FAT). If the buyer does not attend on the notified date, the inspection is deemed performed on the seller's report."],
    ["Risk & title", `Risk passes per ${esc(s.logistics.incoterm)}: ${esc(L.risk[c.inc.risk].toLowerCase())}. Title passes on payment of the full price.`],
    ["Warranty", `${fmtN(s.delivery.warrantyMonths)} months from commissioning or ${fmtN(num(s.delivery.warrantyMonths) + 6)} months from delivery, whichever comes first, against defects in materials and workmanship, subject to operation and maintenance per the PTE manual.`],
    ["Liability", "The seller's total liability is limited to the contract price. Indirect and consequential damages, loss of profit and loss of production are excluded."],
    ["Force majeure", "Neither party is liable for failures caused by events beyond its reasonable control, notified in writing within 10 days."],
    ["Compliance", "Supply is subject to U.S. export-control regulations and any licences they require."],
    ["Law & disputes", `${esc(s.terms.law)}. ${esc(s.terms.dispute)}.`]
  ];
}

/* the default payment method is stored in English; show it in Spanish on Spanish documents */
function payMethod(s) {
  const m = s.payment.method || "";
  return s.lang === "es" && m === "wire transfer (SWIFT) or irrevocable letter of credit" ? "transferencia bancaria (SWIFT) o carta de crédito irrevocable" : m;
}

/* ---------- Technical support, spare parts and major repairs (one page) ---------- */
function supportPage(s, c) {
  const es = s.lang === "es", R = (en, sp) => (es ? sp : en);
  const on = (k) => s.options.some((o) => o.key === k && o.on);
  const quoted = (k) => (on(k) ? `<em class="q">${R("quoted", "cotizado")}</em>` : "");
  const pillars = [
    ["01", R("24/7 remote monitoring", "Monitoreo remoto 24/7"),
      R("Every system reports output, temperatures, vibration, fuel flow and alarms to the PTE operations center. Trends are reviewed continuously so wear is caught before it becomes a trip.",
        "Cada sistema reporta potencia, temperaturas, vibración, caudal de combustible y alarmas al centro de operaciones PTE. Las tendencias se revisan de forma continua para detectar el desgaste antes de que provoque un disparo."), quoted("remote")],
    ["02", R("Technical hotline", "Línea técnica"),
      R("Direct line to PTE engineers in English and Spanish for operators on site: troubleshooting, restart guidance and remote diagnosis through the control system.",
        "Línea directa con ingenieros PTE en inglés y español para los operadores del sitio: diagnóstico de fallas, guía de rearranque y diagnóstico remoto a través del sistema de control."), ""],
    ["03", R("Field service", "Servicio de campo"),
      R("Field engineers for commissioning, scheduled inspections and corrective work, dispatched from PTE or its regional partners.",
        "Ingenieros de campo para la puesta en marcha, las inspecciones programadas y los trabajos correctivos, enviados desde PTE o sus socios regionales."), quoted("comm")],
    ["04", R("Training", "Capacitación"),
      R("Operator and maintenance courses at handover, with refresher sessions when staff change.",
        "Cursos para operadores y mantenimiento en la entrega, con sesiones de actualización cuando cambia el personal."), quoted("train")]
  ];
  const spares = [
    [R("Consumables", "Consumibles"), R("Inlet air filters, fuel and lube-oil filters, lube oil, seals and gaskets.", "Filtros de aire de admisión, filtros de combustible y aceite, aceite lubricante, sellos y juntas."), R("Stock on site", "Stock en sitio")],
    [R("Commissioning spares", "Repuestos de puesta en marcha"), R("Igniters, sensors, thermocouples, fuses and relays needed to start up and run the first months.", "Ignitores, sensores, termocuplas, fusibles y relés necesarios para arrancar y operar los primeros meses."), R("Delivered with the unit", "Se entregan con la unidad")],
    [R("Operating spares (2 years)", "Repuestos de operación (2 años)"), R("Recommended kit sized to the running hours: filters, valves, instrumentation, control cards.", "Kit recomendado según las horas de marcha: filtros, válvulas, instrumentación, tarjetas de control."), quoted("spares") || R("Optional", "Opcional")],
    [R("Capital spares", "Repuestos mayores"), R("Hot-section parts, bearings, generator exciter and breaker parts, held by PTE in its parts pool.", "Partes de sección caliente, rodamientos, excitatriz del generador y partes del interruptor, en el pool de repuestos de PTE."), R("PTE parts pool", "Pool de repuestos PTE")]
  ];
  const major = [
    [R("Daily / weekly", "Diario / semanal"), R("Operator walk-down, leak and filter checks, alarm review", "Recorrido del operador, fugas, filtros y revisión de alarmas"), R("Operator", "Operador")],
    [R("~4,000 h", "~4.000 h"), R("Borescope inspection of compressor, combustor and turbine", "Inspección boroscópica de compresor, cámara de combustión y turbina"), "PTE"],
    [R("~25,000 h", "~25.000 h"), R("Hot-section inspection and repair", "Inspección y reparación de la sección caliente"), "PTE"],
    [R("~50,000 h", "~50.000 h"), R("Major overhaul — gas generator exchanged for a zero-time unit", "Reparación mayor — cambio del generador de gas por una unidad a cero horas"), "PTE"],
    [R("Every 5 years", "Cada 5 años"), R("Generator major inspection: windings, bearings, exciter", "Inspección mayor del generador: bobinados, rodamientos, excitatriz"), "PTE"]
  ];
  return `<div class="eyebrow">${R("After-sales", "Posventa")}</div><h2>${R("Technical support, spare parts &amp; major repairs", "Soporte técnico, repuestos y reparaciones mayores")}</h2>
    <p class="lead">${R("A PTE system is supported for its whole life by the same team that builds it: remote monitoring from day one, spare parts from a dedicated pool and major repairs done by exchange, so the site keeps running while the engine is overhauled.",
      "Un sistema PTE recibe soporte durante toda su vida del mismo equipo que lo fabrica: monitoreo remoto desde el primer día, repuestos desde un pool dedicado y reparaciones mayores por intercambio, para que el sitio siga operando mientras se repara el motor.")}</p>
    <div class="sup-grid">${pillars.map((p) => `<div class="sup"><span class="sn">${p[0]}</span><b>${p[1]} ${p[3]}</b><p>${p[2]}</p></div>`).join("")}</div>
    <div class="bx-h mt">${R("Spare parts", "Repuestos e insumos")}</div>
    <table class="tbl sp"><thead><tr><th>${R("Category", "Categoría")}</th><th>${R("What it covers", "Qué incluye")}</th><th>${R("Supply", "Suministro")}</th></tr></thead>
      <tbody>${spares.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
    <div class="bx-h mt">${R("Maintenance plan &amp; major repairs", "Plan de mantenimiento y reparaciones mayores")}</div>
    <div class="sup-two">
      <table class="tbl mj"><thead><tr><th>${R("Interval", "Intervalo")}</th><th>${R("Work", "Trabajo")}</th><th>${R("By", "Por")}</th></tr></thead>
        <tbody>${major.map((r) => `<tr><td class="iv">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
      <div class="box acc exch"><div class="bx-h">${R("Engine exchange", "Intercambio de motor")}</div>
        <p>${R("For hot-section and major repairs the gas generator is swapped for a serviced unit from the PTE pool and the removed one is repaired in the workshop. Downtime is measured in days, not months.",
          "En reparaciones de sección caliente y mayores, el generador de gas se reemplaza por una unidad reacondicionada del pool PTE y la retirada se repara en taller. La parada se mide en días, no en meses.")}</p>
        <div class="bx-h mt">${R("Long-term service agreement", "Contrato de servicio a largo plazo")} ${quoted("ltsa")}</div>
        <p>${R("Scheduled maintenance, parts, inspections and remote support at a fixed rate per year or per MWh, so maintenance cost is known from the start.",
          "Mantenimiento programado, repuestos, inspecciones y soporte remoto a una tarifa fija por año o por MWh, para conocer el costo de mantenimiento desde el inicio.")}</p></div>
    </div>
    <p class="note">${R("Intervals are typical for aeroderivative gas turbines and depend on running hours, starts, fuel quality and site conditions; the definitive plan is set in the O&amp;M manual delivered with the system. Response times and coverage are defined in the service agreement.",
      "Los intervalos son típicos de turbinas a gas aeroderivadas y dependen de las horas de marcha, los arranques, la calidad del combustible y las condiciones del sitio; el plan definitivo se fija en el manual de O&amp;M que se entrega con el sistema. Los tiempos de respuesta y la cobertura se definen en el contrato de servicio.")}</p>`;
}
