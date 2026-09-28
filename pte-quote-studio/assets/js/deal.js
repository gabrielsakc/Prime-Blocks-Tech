/* PTE Quote Studio — internal deal details ("Details"): parties, client price, our sale price,
   associate commission, intermediary fee, net to PTE and cash flow. No internal cost or profit
   margins by design. INTERNAL ONLY — never part of the proposal. */

function calcDeal(s) {
  const c = calc(s);
  const I = s.internal || {};
  const L = LBL[s.lang];
  const saleEquip = c.ppmBase * c.m.mw * c.qty;                // equipment at our sale price (PTE price per MW)
  const uplift = c.equip - saleEquip;                             // on-top associate commission built into the client price
  const optLines = [];
  s.options.filter((o) => o.on).forEach((o) => optLines.push({ label: L.opt[o.key][0], qty: num(o.qty), unit: num(o.price), price: num(o.qty) * num(o.price) }));
  s.customItems.filter((x) => x.desc).forEach((x) => optLines.push({ label: x.desc, qty: num(x.qty), unit: num(x.price), price: num(x.qty) * num(x.price) }));
  const intro = I.introOn ? saleEquip * num(I.introPct) / 100 : 0;
  const ourSale = c.total - c.tax - uplift;                       // what PTE sells for, before commission and fees
  const netPTE = c.total - c.tax - c.comm - intro;                // what PTE keeps after associate and intermediary
  const cash = c.pays.map((p) => {
    const f = num(p.pct) / 100;
    return { ...p, client: p.amt, comm: c.comm * f, intro: intro * f, tax: c.tax * f, net: netPTE * f };
  });
  let cum = 0; cash.forEach((x) => (x.cum = cum += x.net));
  return { c, I, saleEquip, uplift, optLines, intro, ourSale, netPTE, cash };
}

function dealFlags(s, d) {
  const es = s.lang === "es", c = d.c, out = [];
  const R = (en, sp) => (es ? sp : en);
  if (s.channel.via && !c.commPct) out.push(["hi", R("Deal comes through an associate but the commission % is 0.", "El negocio viene por un asociado pero la comisión es 0 %.")]);
  if (Math.abs(c.paySum - 100) > 0.01) out.push(["hi", R(`Payment milestones add up to ${fmtN(c.paySum, 1)} %, not 100 %.`, `Los hitos de pago suman ${fmtN(c.paySum, 1)} %, no 100 %.`)]);
  if (num(s.payment.m[0].pct) < 50) out.push(["hi", R(`Down payment ${fmtN(s.payment.m[0].pct, 1)} % is below the 50 % PTE policy.`, `Anticipo del ${fmtN(s.payment.m[0].pct, 1)} %, por debajo de la política PTE del 50 %.`)]);
  if (s.channel.via && s.channel.buyer !== "end") out.push(["md", R("The associate is the contracting party: credit risk sits with the associate, not the end customer.", "El asociado es la parte contratante: el riesgo de crédito recae en el asociado, no en el cliente final.")]);
  if (["DAP", "DPU", "DDP"].includes(s.logistics.incoterm)) out.push(["md", R(`${s.logistics.incoterm}: PTE carries transport risk to destination; confirm the logistics quotes are firm.`, `${s.logistics.incoterm}: PTE asume el riesgo de transporte hasta destino; confirme que las cotizaciones logísticas son firmes.`)]);
  if (c.fT * c.fA < 0.9) out.push(["md", R(`Site derate: ≈ ${fmtN(c.fT * c.fA * 100)} % of ISO output at site conditions — check the client's load.`, `Derrateo en sitio: ≈ ${fmtN(c.fT * c.fA * 100)} % de la potencia ISO — verificar la carga del cliente.`)]);
  if (num(s.pricing.discountPct) > 0) out.push(["lo", R(`Commercial discount of ${fmtN(s.pricing.discountPct, 1)} % applied.`, `Descuento comercial de ${fmtN(s.pricing.discountPct, 1)} % aplicado.`)]);
  if (!s.client.company) out.push(["md", R("End customer company is empty.", "Falta la empresa del cliente final.")]);
  if (!s.channel.via && !d.I.introOn) out.push(["lo", R("Direct deal: no associate commission or intermediary fee.", "Venta directa: sin comisión de asociado ni honorario de intermediario.")]);
  if (!out.length) out.push(["ok", R("No flags: data complete.", "Sin alertas: datos completos.")]);
  return out;
}

function renderDeal(s) {
  const es = s.lang === "es", R = (en, sp) => (es ? sp : en);
  const d = calcDeal(s), c = d.c, cur = s.currency, $ = (v) => money(v, cur), L = LBL[s.lang];
  const ch = s.channel, I = d.I, cl = s.client;
  const pct = (v) => `${fmtN(v, 1)} %`;
  const statusTxt = { draft: R("Draft", "Borrador"), sent: R("Sent", "Enviada"), nego: R("Negotiation", "Negociación"), won: R("Won", "Ganada"), lost: R("Lost", "Perdida") }[I.status || (s.quote.issued ? "sent" : "draft")];
  const siteTxt = [s.site.name, s.site.city, s.site.country].filter(Boolean).join(", ") || "—";
  const kv = (rows) => `<dl class="dkv">${rows.filter((r) => r[1] !== undefined && r[1] !== "" && r[1] !== null).map((r) => `<dt>${esc(r[0])}</dt><dd>${r[2] ? r[1] : esc(r[1])}</dd>`).join("")}</dl>`;
  const head = `<div class="pg-head">${logoBlock(s)}<div class="ph-r"><span class="conf">${R("Internal · confidential — not for the client", "Interno · confidencial — no enviar al cliente")}</span><b>${esc(s.quote.no)} · Rev. ${esc(s.quote.rev)} · ${R("Deal details", "Detalles de la operación")}</b></div></div>`;
  const foot = (n) => `<div class="pg-foot"><span>${esc(s.seller.company)}</span><span>${R("Internal use only", "Solo uso interno")} · ${esc(new Date().toLocaleDateString(es ? "es-ES" : "en-US"))}</span><span class="pno">${R("Page", "Página")} ${n} ${R("of", "de")} 2</span></div>`;

  // waterfall of the client price
  const parts = [
    ["mar", R("Net to PTE", "Neto para PTE"), Math.max(0, d.netPTE)],
    ["comm", R("Associate", "Asociado"), c.comm],
    ["intro", R("Intermediary", "Intermediario"), d.intro],
    ["tax", R("Taxes", "Impuestos"), c.tax]
  ].filter((p) => p[2] > 0);
  const tot = parts.reduce((a, p) => a + p[2], 0) || 1;
  const share = (v) => `${fmtN(v / (c.total || 1) * 100, 1)} %`;
  const bar = `<div class="wf">${parts.map((p) => `<div class="wf-${p[0]}" style="flex:${p[2] / tot}" title="${esc(p[1])} ${share(p[2])}">${p[2] / tot >= 0.06 ? `<b>${share(p[2])}</b><span>${esc(p[1])}</span>` : ""}</div>`).join("")}</div>
    <div class="wf-key">${parts.map((p) => `<span><i class="wf-${p[0]}"></i>${esc(p[1])} <b>${$(p[2])}</b> · ${share(p[2])}</span>`).join("")}</div>`;

  const party = (title, cls, name, rows) => `<div class="dparty ${cls}"><div class="bx-h">${esc(title)}</div><b class="pn">${esc(name || "—")}</b>${kv(rows)}</div>`;
  const endCard = party(R("End customer", "Cliente final"), "end", cl.company, [
    [R("Contact", "Contacto"), [cl.contact, cl.title].filter(Boolean).join(" · ")], ["Email", cl.email], [R("Phone", "Teléfono"), cl.phone],
    [R("Address", "Dirección"), cl.address ? nl2br(cl.address) : "", true], [R("Country", "País"), cl.country], [R("Tax ID", "ID fiscal"), cl.taxId],
    [R("Industry", "Sector"), cl.industry], [R("End use", "Uso final"), cl.endUse || s.site.application]]);
  const asoCard = ch.via ? party(R("Associate", "Asociado") + " · " + roleTxt(ch.role, es), "aso", ch.company, [
    [R("Contact", "Contacto"), [ch.contact, ch.title].filter(Boolean).join(" · ")], ["Email", ch.email], [R("Phone", "Teléfono"), ch.phone],
    [R("Location", "Ubicación"), [ch.city, ch.country].filter(Boolean).join(", ")], [R("Tax ID", "ID fiscal"), ch.taxId], [R("Agreement", "Acuerdo"), ch.agreement], [R("Territory", "Territorio"), ch.territory],
    [R("Commission", "Comisión"), `<b>${pct(c.commPct)}</b> · ${$(c.comm)} · ${c.commOnTop ? R("on top of price", "sumada al precio") : R("included in price", "incluida en el precio")}`, true]])
    : `<div class="dparty none"><div class="bx-h">${R("Associate", "Asociado")}</div><p>${R("Direct deal — no associate.", "Venta directa — sin asociado.")}</p></div>`;
  const introCard = I.introOn ? party(R("Intermediary / introducer", "Intermediario / presentador"), "intro", I.introCompany || I.introName, [
    [R("Contact", "Contacto"), I.introName], ["Email", I.introEmail], [R("Phone", "Teléfono"), I.introPhone],
    [R("Fee", "Honorario"), `<b>${pct(num(I.introPct))}</b> · ${$(d.intro)}`, true], [R("Notes", "Notas"), I.introNotes]])
    : `<div class="dparty none"><div class="bx-h">${R("Intermediary", "Intermediario")}</div><p>${R("None declared.", "No declarado.")}</p></div>`;

  const who = ch.via ? `<div class="who">${[
    [R("Addressed to", "Dirigida a"), ch.addressTo === "end" ? cl.company : ch.company],
    [R("Contracting / invoice", "Contrata / factura"), ch.buyer === "end" ? cl.company : ch.company],
    [R("Deliver to", "Entrega en"), ch.shipTo === "associate" ? ch.company : ch.shipTo === "end" ? cl.company : siteTxt]
  ].map((x) => `<span><i>${esc(x[0])}</i>${esc(x[1] || "—")}</span>`).join("")}</div>` : "";

  const p1 = `<section class="pg deal">${head}<div class="pg-body">
    <div class="d-top"><div><div class="eyebrow">${R("Deal details", "Detalles de la operación")}</div><h2>${esc(s.quote.no)} · ${esc(cl.company || R("End customer", "Cliente final"))}</h2>
      <p class="d-sub">${c.qty} × ${esc(c.m.id)} · ${fmtN(c.mwTot, c.mwTot % 1 ? 1 : 0)} MW · ${esc(siteTxt)}${s.quote.project ? " · " + esc(s.quote.project) : ""}</p></div>
      <div class="d-status"><span class="st st-${I.status || (s.quote.issued ? "sent" : "draft")}">${esc(statusTxt)}</span>${I.probability ? `<small>${R("Probability", "Probabilidad")} ${fmtN(I.probability)} %</small>` : ""}<small>${esc(fmtDate(new Date((s.quote.date || "2026-01-01") + "T12:00:00"), s.lang))}</small><small>${esc(s.quote.preparedBy || "")}</small></div></div>
    <div class="kpis">
      <div><span>${R("Client price", "Precio al cliente")}</span><b>${$(c.total)}</b><small>${$(c.total / c.mwTot)} / MW</small></div>
      <div><span>${R("Our sale price", "Nuestro precio de venta")}</span><b>${$(d.ourSale)}</b><small>${$(c.ppmBase)} / MW ${R("equipment", "equipo")}${d.ourSale !== d.saleEquip ? " + " + R("options & logistics", "opcionales y logística") : ""}</small></div>
      <div><span>${R("Associate commission", "Comisión asociado")}</span><b>${$(c.comm)}</b><small>${ch.via ? pct(c.commPct) + " · " + (c.commOnTop ? R("on top", "sumada") : R("included", "incluida")) + " · " + esc(ch.company || "") : R("direct deal", "venta directa")}</small></div>
      <div><span>${R("Intermediary fee", "Honorario intermediario")}</span><b>${$(d.intro)}</b><small>${I.introOn ? pct(num(I.introPct)) + " · " + esc(I.introCompany || I.introName || "") : R("none", "ninguno")}</small></div>
      <div><span>${R("Taxes", "Impuestos")}</span><b>${$(c.tax)}</b><small>${c.tax ? esc(s.pricing.taxLabel || R("tax", "impuesto")) + " " + pct(num(s.pricing.taxPct)) : R("none in this quote", "ninguno en esta cotización")}</small></div>
      <div class="hl"><span>${R("Net to PTE", "Neto para PTE")}</span><b>${$(d.netPTE)}</b><small>${$(d.netPTE / c.mwTot)} / MW · ${R("after commission & fees", "tras comisión y honorarios")}</small></div>
    </div>
    <div class="bx-h mt">${R("Where the client's money goes", "Adónde va el dinero del cliente")}</div>${bar}
    <div class="bx-h mt">${R("Parties", "Partes")}</div>
    <div class="dparties">${endCard}${asoCard}${introCard}</div>${who}
    <div class="bx-h mt">${R("Deal scope", "Alcance del negocio")}</div>
    <div class="dscope">
      ${kv([[R("System", "Sistema"), `${c.qty} × ${MODEL_COPY[s.lang][c.m.id].name}`], [R("Electrical", "Eléctrico"), `${s.product.voltage} · ${s.product.freq} Hz · ${L.mode[s.product.mode]}`], [R("Fuel", "Combustible"), L.fuel[s.product.fuel]],
        [R("Site", "Sitio"), `${siteTxt}${s.site.coords ? " · " + s.site.coords : ""}`], [R("Site conditions", "Condiciones"), `${fmtN(s.site.ambient)} °C · ${fmtN(s.site.altitude)} m · ≈ ${fmtN(c.siteMw * c.qty, 1)} MW ${R("at site", "en sitio")}`]])}
      ${kv([["Incoterm", `${s.logistics.incoterm}${s.logistics.namedPlace ? " · " + s.logistics.namedPlace : ""}`], [R("Route", "Ruta"), [s.logistics.pol, s.logistics.pod].filter(Boolean).join(" → ")], [R("Lead time", "Plazo"), `${fmtN(s.delivery.leadMonths)} ${R("months", "meses")} + ${fmtN(s.logistics.transitWeeks)} ${R("wk transit", "sem tránsito")} + ${fmtN(s.delivery.installWeeks)} ${R("wk setting", "sem montaje")}`],
        [R("Warranty / validity", "Garantía / validez"), `${fmtN(s.delivery.warrantyMonths)} ${R("months", "meses")} · ${fmtN(s.quote.validity)} ${R("days", "días")}`], [R("Payment", "Pago"), `${s.payment.m.map((p) => fmtN(p.pct)).join(" / ")} · ${payMethod(s)}`]])}
    </div>
  </div>${foot(1)}</section>`;

  // price build-up: how the client price is formed
  const row = (label, qty, unit, amt, cls = "") => `<tr class="${cls}"><td>${label}</td><td class="n">${qty}</td><td class="n">${unit}</td><td class="n">${amt}</td></tr>`;
  const pb = [];
  pb.push(row(`<b>${esc(MODEL_COPY[s.lang][c.m.id].name)}</b> <span>${R("our sale price", "nuestro precio de venta")} ${$(c.ppmBase)} / MW × ${fmtN(c.m.mw, c.m.mw % 1 ? 1 : 0)} MW</span>`, c.qty, $(c.ppmBase * c.m.mw), $(d.saleEquip)));
  if (d.uplift) pb.push(row(`${R("Associate commission added on top", "Comisión del asociado sumada al precio")} <span>${pct(c.commPct)} · ${$(c.ppm)} / MW ${R("to the client", "al cliente")}</span>`, c.qty, $(d.uplift / c.qty), $(d.uplift), "acc"));
  d.optLines.forEach((o) => pb.push(row(esc(o.label), fmtN(o.qty), o.unit ? $(o.unit) : R("included", "incluido"), o.price ? $(o.price) : "—")));
  if (c.logSum) pb.push(row(`${R("Logistics", "Logística")} ${esc(s.logistics.incoterm)} <span>${c.logi.map((o) => esc(o.label.split(/[(&]/)[0].trim())).join(" · ")}</span>`, "", "", $(c.logSum)));
  if (c.disc) pb.push(row(`${R("Commercial discount", "Descuento comercial")} (${pct(num(s.pricing.discountPct))})`, "", "", "−" + $(c.disc), "neg"));
  if (c.tax) pb.push(row(`${esc(s.pricing.taxLabel || R("Taxes", "Impuestos"))} (${pct(num(s.pricing.taxPct))})`, "", "", $(c.tax)));
  // distribution: where the client price goes
  const dist = [
    [R("Associate commission", "Comisión del asociado"), ch.via ? `${pct(c.commPct)} ${R("of equipment", "del equipo")} · ${esc(ch.company || "")}` : R("direct deal", "venta directa"), c.comm],
    [R("Intermediary fee", "Honorario del intermediario"), I.introOn ? `${pct(num(I.introPct))} ${R("of equipment", "del equipo")} · ${esc(I.introCompany || I.introName || "")}` : R("none", "ninguno"), d.intro],
    [R("Taxes", "Impuestos"), c.tax ? esc(s.pricing.taxLabel || "") : R("none", "ninguno"), c.tax],
    [R("Net to PTE", "Neto para PTE"), `${$(d.netPTE / c.mwTot)} / MW`, d.netPTE]
  ];

  const flags = dealFlags(s, d);
  const p2 = `<section class="pg deal">${head}<div class="pg-body">
    <div class="bx-h">${R("How the client price is built", "Cómo se forma el precio al cliente")}</div>
    <table class="tbl pl"><thead><tr><th>${R("Line", "Concepto")}</th><th class="n">${R("Qty", "Cant.")}</th><th class="n">${R("Unit", "Unitario")}</th><th class="n">${R("Amount", "Importe")}</th></tr></thead>
    <tbody>${pb.join("")}</tbody>
    <tfoot><tr><td colspan="3">${R("Client price", "Precio al cliente")} · ${esc(s.logistics.incoterm)}${s.logistics.namedPlace ? " " + esc(s.logistics.namedPlace) : ""}</td><td class="n">${$(c.total)}</td></tr></tfoot></table>
    <div class="bx-h mt">${R("Where the client price goes", "Distribución del precio al cliente")}</div>
    <table class="tbl dist"><tbody>${dist.map((x, i) => `<tr class="${i === 3 ? "net" : ""}"><td>${esc(x[0])}</td><td>${x[1]}</td><td class="n">${fmtN(x[2] / (c.total || 1) * 100, 1)} %</td><td class="n">${$(x[2])}</td></tr>`).join("")}</tbody></table>
    <div class="bx-h mt">${R("Cash flow by payment milestone", "Flujo de caja por hito de pago")}</div>
    <table class="tbl cf"><thead><tr><th>#</th><th>${R("Milestone", "Hito")}</th><th class="n">%</th><th class="n">${R("Client pays", "Paga el cliente")}</th><th class="n">${R("Associate", "Asociado")}</th><th class="n">${R("Intermediary", "Intermediario")}</th><th class="n">${R("PTE net", "Neto PTE")}</th><th class="n">${R("Cumulative", "Acumulado")}</th></tr></thead>
    <tbody>${d.cash.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.label || L.trig["m" + (i + 1)])}</td><td class="n">${fmtN(x.pct, 1)}</td><td class="n">${$(x.client)}</td><td class="n">${x.comm ? "−" + $(x.comm) : "—"}</td><td class="n">${x.intro ? "−" + $(x.intro) : "—"}</td><td class="n"><b>${$(x.net)}</b></td><td class="n">${$(x.cum)}</td></tr>`).join("")}</tbody></table>
    <p class="note">${R("Commission, fees and taxes are shown pro rata to each client payment. PTE net excludes taxes.", "La comisión, los honorarios y los impuestos se muestran a prorrata de cada cobro. El neto PTE excluye impuestos.")}</p>
    <div class="dcols">
      <div><div class="bx-h mt">${R("Flags & risks", "Alertas y riesgos")}</div><ul class="flags">${flags.map((f) => `<li class="f-${f[0]}">${esc(f[1])}</li>`).join("")}</ul></div>
      <div><div class="bx-h mt">${R("Internal notes", "Notas internas")}</div><div class="dnotes">${I.notes ? nl2br(I.notes) : `<span class="muted">—</span>`}</div>
        ${s.notes ? `<div class="bx-h mt">${R("Special conditions offered", "Condiciones particulares ofrecidas")}</div><div class="dnotes">${nl2br(s.notes)}</div>` : ""}</div>
    </div>
    <div class="dsign">${[R("Prepared by", "Preparado por"), R("Reviewed by", "Revisado por"), R("Approved by", "Aprobado por")].map((t, i) => `<div><span>${esc(t)}</span><b>${i === 0 ? esc(s.quote.preparedBy || "") : ""}</b></div>`).join("")}</div>
  </div>${foot(2)}</section>`;
  return p1 + p2;
}
