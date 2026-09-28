/* PTE Quote Studio — form, state, library and PDF export. */

const LS_DRAFT = "pteqs.draft.v1", LS_LIB = "pteqs.library.v1";
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* Sequential proposal numbers: "PTE 260108", "PTE 260109"… The counter holds the NEXT number
   and only advances when a proposal is issued (its PDF is downloaded), so drafts never burn numbers. */
const LS_SEQ = "pteqs.seq.v1", SEQ_START = 260108;
const nextSeq = () => { const n = parseInt(lsGet(LS_SEQ, SEQ_START), 10); return isFinite(n) ? n : SEQ_START; };
const fmtNo = (n) => `PTE ${n}`;
function newQuoteNo() { return fmtNo(nextSeq()); }
function issueNumber() {
  // advance the counter past this proposal's number the first time it is issued
  if (S.quote.issued) return;
  const m = /(\d+)\s*$/.exec(S.quote.no || "");
  const n = m ? parseInt(m[1], 10) : NaN;
  if (isFinite(n) && n >= nextSeq()) lsSet(LS_SEQ, n + 1);
  S.quote.issued = true;
}

function defaults() {
  return {
    lang: "en", paper: "letter", currency: "USD",
    quote: { no: newQuoteNo(), issued: false, date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10), rev: "A", validity: 30, project: "", preparedBy: "", preparedTitle: "", preparedEmail: "info@ptepower.com", preparedPhone: "+1 786 793 9141" },
    seller: { ...SELLER_DEFAULT },
    client: { company: "", contact: "", title: "", email: "", phone: "", address: "", country: "", taxId: "", industry: "", web: "", endUse: "" },
    channel: { via: false, commPct: 0, commMode: "included", role: "distributor", agreement: "", company: "", contact: "", title: "", email: "", phone: "", address: "", city: "", country: "", taxId: "", web: "", territory: "", logo: "", addressTo: "associate", buyer: "associate", shipTo: "site" },
    site: { name: "", city: "", country: "", coords: "", altitude: 0, ambient: 35, application: "" },
    product: { model: "PTE-20", qty: 1, pricePerMw: 775000, voltage: "13.8 kV", freq: "60", fuel: "dual", mode: "island" },
    options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
    customItems: [],
    logistics: { incoterm: "FOB", namedPlace: "", pol: "", pod: "", transport: "sea", transitWeeks: 6, autoIns: true, insRate: 0.35, costs: Object.fromEntries(COST_KEYS.map((k) => [k, 0])) },
    pricing: { discountPct: 0, taxPct: 0, taxLabel: "" },
    payment: { m: [{ pct: 50, label: "", desc: "" }, { pct: 20, label: "", desc: "" }, { pct: 20, label: "", desc: "" }, { pct: 10, label: "", desc: "" }], method: "wire transfer (SWIFT) or irrevocable letter of credit" },
    delivery: { leadMonths: 6, installWeeks: 3, warrantyMonths: 12 },
    terms: { law: "Governed by the laws of the State of New York, USA", dispute: "Disputes settled by ICC arbitration, seat New York, in English" },
    notes: "",
    afterSales: true,                 // include the "After-sales / post-sale support" page
    // internal only — feeds the "Details" sheet, never the proposal (no internal costs or margins by design)
    internal: { status: "", probability: 0, notes: "",
      introOn: false, introCompany: "", introName: "", introEmail: "", introPhone: "", introPct: 0, introNotes: "" }
  };
}

function merge(base, over) {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === "object") {
    const o = { ...base };
    for (const k in over || {}) o[k] = k in base ? merge(base[k], over[k]) : over[k];
    return o;
  }
  return over === undefined ? base : over;
}

let S = defaults();                 // every session starts with a blank proposal
const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const set = (o, p, v) => { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach((k) => (a = a[k])); a[ks[ks.length - 1]] = v; };

/* ---------- form builder ---------- */
const F = {
  txt: (label, k, ph = "", cls = "") => `<label class="f ${cls}"><span>${label}</span><input data-k="${k}" value="${esc(get(S, k))}" placeholder="${esc(ph)}"></label>`,
  num: (label, k, step = "any", cls = "", suf = "") => `<label class="f ${cls}"><span>${label}</span><div class="in-suf"><input type="number" step="${step}" data-k="${k}" data-num value="${esc(get(S, k))}">${suf ? `<i>${suf}</i>` : ""}</div></label>`,
  date: (label, k, cls = "") => `<label class="f ${cls}"><span>${label}</span><input type="date" data-k="${k}" value="${esc(get(S, k))}"></label>`,
  area: (label, k, ph = "", cls = "") => `<label class="f ${cls}"><span>${label}</span><textarea data-k="${k}" rows="3" placeholder="${esc(ph)}">${esc(get(S, k))}</textarea></label>`,
  sel: (label, k, opts, cls = "", rr = false) => `<label class="f ${cls}"><span>${label}</span><select data-k="${k}" ${rr ? "data-rr" : ""}>${opts.map(([v, t]) => `<option value="${esc(v)}" ${String(get(S, k)) === String(v) ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`,
  tip: (html) => `<div class="tip">${html}</div>`
};
const sec = (id, n, title, body, open) => `<details class="sec" id="s-${id}" ${open ? "open" : ""}><summary><i>${n}</i>${title}</summary><div class="sec-b">${body}</div></details>`;

/* internal commission read-out (form only; the PDF never shows it) */
function commHtml(c) {
  const cur = S.currency;
  if (!c.commPct) return `<p class="warnline">Enter the associate's % for this quote.</p>`;
  const lbl = ["Signing", "Insp. 1", "Insp. 2", "Final"];
  return `<div class="cm-grid">
    <div><span>Commission</span><b>${money(c.comm, cur)}</b><small>${fmtN(c.commPct, 2)} % × ${money(c.ppmBase * c.m.mw * c.qty, cur)}</small></div>
    <div><span>Per MW</span><b>${money(c.ppmBase * c.commPct / 100, cur)}</b><small>${c.commOnTop ? "client price raised to " + money(c.ppm, cur) + "/MW" : "client price stays " + money(c.ppm, cur) + "/MW"}</small></div>
    <div><span>PTE net</span><b>${money(c.pteNet, cur)}</b><small>total − commission</small></div>
  </div>
  <div class="cm-pay">Pro-rata payout as the client pays: ${c.commPays.map((a, i) => `<b>${lbl[i]}</b> ${money(a, cur)}`).join(" · ")}</div>`;
}

function dealMini() {
  const d = calcDeal(S), cur = S.currency;
  return `<div><span>Our sale price</span><b>${money(d.ourSale, cur)}</b><small>${money(d.c.ppmBase, cur)} / MW equipment</small></div>
    <div><span>Net to PTE</span><b>${money(d.netPTE, cur)}</b><small>after commission & fees, excl. taxes</small></div>`;
}

function buildForm() {
  const openSet = new Set([...document.querySelectorAll("details.sec[open]")].map((d) => d.id));
  const first = openSet.size === 0;
  const isOpen = (id) => (first ? ["s-proposal", "s-system"].includes("s-" + id) : openSet.has("s-" + id));
  const c = calc(S);
  const L = LBL.en;
  const inc = INCOTERMS[S.logistics.incoterm];
  const incHelp = {
    EXW: "Buyer collects at PTE's factory. Seller prices nothing beyond the equipment.",
    FCA: "Seller clears export and hands over to the buyer's carrier at the named place.",
    FAS: "Seller delivers alongside the vessel at the port of loading, export-cleared.",
    FOB: "Seller loads on board at the port of loading. Buyer pays ocean freight and insurance.",
    CFR: "Seller pays ocean freight to the destination port; risk passes when loaded on board.",
    CIF: "As CFR plus seller's cargo insurance (minimum ICC C) to the destination port.",
    CPT: "Seller pays carriage to the named destination; risk passes at the first carrier.",
    CIP: "As CPT plus seller's insurance (ICC A) to the named destination.",
    DAP: "Seller delivers to the named place (site) ready for unloading; buyer clears import.",
    DPU: "As DAP plus unloading at the named place by the seller.",
    DDP: "Seller delivers to site cleared for import, paying duties and taxes."
  };

  const models = MODELS.map((m) => `<button type="button" class="mdl ${S.product.model === m.id ? "on" : ""}" data-model="${m.id}"><b>${m.mw}<small>MW</small></b><span>${m.id}</span></button>`).join("");
  const opts = S.options.map((o, i) => `<div class="opt ${o.on ? "on" : ""}">
      <label class="chk"><input type="checkbox" data-k="options.${i}.on" data-bool data-rr ${o.on ? "checked" : ""}><span><b>${esc(L.opt[o.key][0])}</b><small>${esc(L.opt[o.key][1])}</small></span></label>
      <div class="opt-in"><input type="number" min="0" step="1" data-k="options.${i}.qty" data-num value="${esc(o.qty)}" title="Qty"><div class="in-suf"><input type="number" min="0" step="1000" data-k="options.${i}.price" data-num value="${esc(o.price)}" title="Unit price to the client"><i>${S.currency}</i></div></div></div>`).join("");
  const custom = S.customItems.map((it, i) => `<div class="cust">
      <input data-k="customItems.${i}.desc" value="${esc(it.desc)}" placeholder="Description">
      <input type="number" data-k="customItems.${i}.qty" data-num value="${esc(it.qty)}" title="Qty">
      <input type="number" data-k="customItems.${i}.price" data-num value="${esc(it.price)}" title="Unit price to the client" placeholder="price">      <button type="button" class="x" data-delitem="${i}" title="Remove">×</button>
      <input class="span" data-k="customItems.${i}.note" value="${esc(it.note || "")}" placeholder="Short description shown under the item (optional)"></div>`).join("");
  const costs = COST_KEYS.map((k) => {
    const on = inc.costs.includes(k);
    if (k === "insurance" && on && S.logistics.autoIns) {
      const ins = c.logi.find((x) => x.key === "insurance");
      return `<div class="cost on auto"><span>${esc(L.cost[k])}</span><em>${money(ins ? ins.amt : 0, S.currency)} · auto</em></div>`;
    }
    return `<label class="cost ${on ? "on" : "off"}"><span>${esc(L.cost[k])}</span>${on ? `<div class="in-suf"><input type="number" min="0" step="100" data-k="logistics.costs.${k}" data-num value="${esc(S.logistics.costs[k])}"><i>${S.currency}</i></div>` : `<em>Buyer</em>`}</label>`;
  }).join("");
  const paySum = S.payment.m.reduce((a, p) => a + num(p.pct), 0);
  const pays = S.payment.m.map((p, i) => `<div class="pay-row">
      <div class="pay-n">${i + 1}</div>
      <input data-k="payment.m.${i}.label" value="${esc(p.label)}" placeholder="${esc(L.trig["m" + (i + 1)])}">
      <div class="in-suf pct"><input type="number" min="0" max="100" step="0.5" data-k="payment.m.${i}.pct" data-num value="${esc(p.pct)}"><i>%</i></div>
      <output>${money(c.pays[i].amt, S.currency)}</output>
      <input class="span" data-k="payment.m.${i}.desc" value="${esc(p.desc)}" placeholder="${esc(L.trigDesc["m" + (i + 1)])}"></div>`).join("");

  const html = [
    sec("proposal", 1, "Proposal", `<div class="g2">
      ${F.txt("Proposal no.", "quote.no")}${F.txt("Revision", "quote.rev", "A", "sm")}
      <div class="seq span"><span>${S.quote.issued ? `<b>${esc(S.quote.no)}</b> already issued — re-downloading keeps its number; raise the revision if it changed.` : `Draft. The number is assigned when you <b>Download PDF</b>.`} Next free number: <b>${fmtNo(nextSeq())}</b></span>
        <label>Set next <input type="number" id="seqNext" value="${nextSeq()}" min="1" step="1"></label></div>
      ${F.date("Date", "quote.date")}${F.num("Validity", "quote.validity", "1", "sm", "days")}
      <label class="f"><span>Delivery time</span><div class="in-suf"><input type="number" min="1" step="1" data-k="delivery.leadMonths" data-num value="${esc(S.delivery.leadMonths)}"><i>months</i></div></label>
      ${F.sel("Document language", "lang", [["en", "English"], ["es", "Español"]], "", true)}
      ${F.sel("Paper", "paper", [["letter", "US Letter"], ["a4", "A4"]], "", true)}
      ${F.sel("Currency", "currency", [["USD", "USD · US$"], ["EUR", "EUR · €"], ["GBP", "GBP · £"], ["CAD", "CAD · C$"], ["MXN", "MXN"]], "", true)}
      ${F.txt("Project name", "quote.project", "e.g. Loma Campana e-frac power")}</div>`, isOpen("proposal")),
    sec("system", 2, "PTE system & price per MW", `<div class="sub-h">Choose the unit · MW per system</div><div class="mdls">${models}</div>
      <div class="g2">
      ${F.num("Number of systems", "product.qty", "1", "", "units")}
      ${F.num("Price per MW (our sale price)", "product.pricePerMw", "1000", "ppm", S.currency)}</div>
      <div class="calc"><div><span>Unit price</span><b>${money(c.unit, S.currency)}</b><small>${money(c.ppm, S.currency)} × ${c.m.mw} MW</small></div><div><span>Equipment</span><b>${money(c.equip, S.currency)}</b><small>${c.qty} × ${c.m.id} · ${fmtN(c.mwTot)} MW</small></div></div>
      <div class="g2">
      ${F.sel("Output voltage", "product.voltage", ["0.48 kV", "4.16 kV", "6.6 kV", "11 kV", "13.2 kV", "13.8 kV", "15 kV"].map((v) => [v, v]))}
      ${F.sel("Frequency", "product.freq", [["60", "60 Hz"], ["50", "50 Hz"]])}
      ${F.sel("Fuel", "product.fuel", Object.entries(L.fuel), "span", true)}
      ${F.sel("Operating mode", "product.mode", Object.entries(L.mode), "span", true)}</div>
      ${c.m.mw >= 2 && S.product.voltage === "0.48 kV" ? F.tip("⚠ 480 V is impractical above ~2 MW (very high currents). Use 4.16 kV or higher.") : ""}
      ${F.tip("Every model ships as <b>two joined 20 ft ISO containers</b> — Module 01 turbine, Module 02 generator. Price = price per MW × model MW × number of systems.")}`, isOpen("system")),
    sec("channel", 3, "Associate / channel partner", `
      <label class="chk via"><input type="checkbox" data-k="channel.via" data-bool data-rr ${S.channel.via ? "checked" : ""}><span><b>The client comes through an associate</b><small>Distributor, representative, agent or integrator. Adds a “Commercial parties” page, a channel clause and a third signature.</small></span></label>
      ${S.channel.via ? `<div class="comm">
        <div class="sub-h">Associate commission <em>internal · never printed</em></div>
        <div class="g2">
        ${F.num("Commission for this quote", "channel.commPct", "0.5", "", "% of equipment")}
        ${F.sel("How it is priced", "channel.commMode", [["included", "Included in price per MW"], ["ontop", "Added on top of price per MW"]], "", true)}
        </div>
        <div class="comm-out" id="commOut">${commHtml(c)}</div>
        <div class="ppm-link">Price per MW: <b>${money(S.product.pricePerMw, S.currency)}</b> <button type="button" class="btn small" id="bGoPpm">Change price per MW</button></div>
      </div>
      <div class="g2 mt8">
      ${F.sel("Associate role", "channel.role", [["distributor", "Distributor"], ["rep", "Sales representative"], ["agent", "Agent"], ["epc", "EPC integrator"], ["partner", "Business partner"]], "", true)}
      ${F.txt("Agreement ref.", "channel.agreement", "e.g. Distribution agreement 2026-03")}
      ${F.txt("Associate company", "channel.company", "Associate legal name", "span")}
      ${F.txt("Contact name", "channel.contact")}${F.txt("Title", "channel.title")}
      ${F.txt("Email", "channel.email")}${F.txt("Phone", "channel.phone")}
      ${F.area("Address", "channel.address", "Street, number, postal code", "span")}
      ${F.txt("City", "channel.city")}${F.txt("Country", "channel.country")}
      ${F.txt("Tax ID", "channel.taxId")}${F.txt("Website", "channel.web")}
      ${F.txt("Territory", "channel.territory", "e.g. Argentina, Chile", "span")}
      </div>
      <div class="sub-h">Associate logo <em class="opt-tag">optional · shown next to PTE POWER on every page</em></div>
      <div class="logo-up">
        <div class="lu-prev">${S.channel.logo ? `<img src="${esc(S.channel.logo)}" alt="">` : `<span>No logo</span>`}</div>
        <div class="lu-act"><label class="btn small">${S.channel.logo ? "Replace logo" : "Upload logo"}<input type="file" id="fLogo" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden></label>
        ${S.channel.logo ? `<button type="button" class="btn small ghost" id="bLogoDel">Remove</button>` : ""}
        <small>PNG with transparent background works best. JPG with white background is also fine.</small></div>
      </div>
      <div class="sub-h">Who is who in this deal</div>
      <div class="g2">
      ${F.sel("Proposal addressed to", "channel.addressTo", [["associate", "Associate"], ["end", "End customer"]], "", true)}
      ${F.sel("Contracting party / invoice to", "channel.buyer", [["associate", "Associate"], ["end", "End customer"]], "", true)}
      ${F.sel("Deliver to", "channel.shipTo", [["site", "Installation site"], ["associate", "Associate"], ["end", "End customer's address"]], "span", true)}
      </div>
      ${F.tip("Typical distributor deal: addressed to and invoiced to the associate, delivered to the end customer's site. The end customer's details go in the next section.")}` : ""}`, isOpen("channel")),
    sec("client", 4, S.channel.via ? "End customer" : "Client", `<div class="g2">
      ${F.txt("Company", "client.company", S.channel.via ? "End customer legal name" : "Client legal name", "span")}
      ${F.txt("Contact name", "client.contact")}${F.txt("Title", "client.title")}
      ${F.txt("Email", "client.email")}${F.txt("Phone", "client.phone")}
      ${F.area("Address", "client.address", "Street, city, country", "span")}
      ${F.txt("Country", "client.country")}${F.txt("Tax ID", "client.taxId")}
      ${F.txt("Industry", "client.industry", "e.g. Oil & gas, mining")}${F.txt("Website", "client.web")}
      ${S.channel.via ? F.txt("End use", "client.endUse", "e.g. Prime power for electric frac fleet", "span") : ""}</div>`, isOpen("client")),
    sec("site", 5, "Installation site", `<div class="g2">
      ${F.txt("Site / facility", "site.name", "e.g. Pad LCa-112")}${F.txt("City / region", "site.city")}
      ${F.txt("Country", "site.country")}${F.txt("Coordinates", "site.coords", "-38.21, -68.95")}
      ${F.num("Design ambient (max)", "site.ambient", "1", "", "°C")}${F.num("Altitude", "site.altitude", "10", "", "m")}
      ${F.txt("Application", "site.application", "e.g. Electric frac fleet, prime power", "span")}</div>
      ${F.tip(`Site output ≈ <b>${fmtN(c.siteMw, 2)} MW</b> per system (${fmtN(c.fT * c.fA * 100)} % of ISO) at ${fmtN(S.site.ambient)} °C and ${fmtN(S.site.altitude)} m. Shown in the proposal as an indicative screening value.`)}`, isOpen("site")),
    sec("options", 6, "Options & additional items", `<label class="chk via aftersales"><input type="checkbox" data-k="afterSales" data-bool data-rr ${S.afterSales !== false ? "checked" : ""}><span><b>Include the After-sales page</b><small>Post-sale support: technical support, spare parts and major repairs (one page before the terms).</small></span></label>
      <div class="sub-h">Options quoted</div>${opts}
      <div class="sub-h">Additional line items</div>${custom}
      <button type="button" class="btn small" id="bAddItem">+ Add item</button>
      ${F.tip("Options at price 0 print as <i>included</i>. Untick an option to remove it from the proposal and from the scope page.")}`, isOpen("options")),
    sec("logistics", 7, "Transport & Incoterm", `<div class="g2">
      ${F.sel("Incoterm (2020)", "logistics.incoterm", Object.keys(INCOTERMS).map((k) => [k, k]), "", true)}
      ${F.sel("Transport mode", "logistics.transport", Object.entries(L.transportMode), "", true)}</div>
      ${F.tip(`<b>${S.logistics.incoterm}:</b> ${incHelp[S.logistics.incoterm]}`)}
      <div class="g2">
      ${F.txt("Named place", "logistics.namedPlace", S.logistics.incoterm.startsWith("D") ? "Site address" : "e.g. Port of Charleston, SC")}
      ${F.num("Transit time", "logistics.transitWeeks", "1", "", "weeks")}
      ${F.txt("Port / place of loading", "logistics.pol", "e.g. Charleston, SC, USA")}
      ${F.txt("Port / place of destination", "logistics.pod", "e.g. Buenos Aires, AR")}</div>
      <div class="sub-h">Costs the seller carries under ${S.logistics.incoterm}</div>
      <div class="costs">${costs}</div>
      ${inc.costs.includes("insurance") ? `<div class="g2"><label class="chk inl"><input type="checkbox" data-k="logistics.autoIns" data-bool data-rr ${S.logistics.autoIns ? "checked" : ""}><span>Auto-calculate insurance</span></label>${F.num("Insurance rate", "logistics.insRate", "0.05", "", "% of 110 % CIF")}</div>` : ""}`, isOpen("logistics")),
    sec("pricing", 8, "Discount & taxes", `<div class="g2">
      ${F.num("Commercial discount", "pricing.discountPct", "0.5", "", "%")}
      ${F.txt("Tax label", "pricing.taxLabel", "e.g. VAT, IVA, Sales tax")}
      ${F.num("Tax rate", "pricing.taxPct", "0.5", "", "%")}</div>
      <div class="calc"><div><span>Total</span><b>${money(c.total, S.currency)}</b><small>${money(c.total / c.mwTot, S.currency)} per MW</small></div></div>`, isOpen("pricing")),
    sec("internal", "$", "Deal tracking & intermediary", `
      <div class="sub-h">Internal · feeds the Details sheet · never printed in the proposal</div>
      <div class="g2">
      ${F.sel("Deal status", "internal.status", [["", "Auto (draft / sent)"], ["draft", "Draft"], ["sent", "Sent"], ["nego", "Negotiation"], ["won", "Won"], ["lost", "Lost"]], "", true)}
      ${F.num("Win probability", "internal.probability", "5", "", "%")}
      </div>
      <label class="chk via"><input type="checkbox" data-k="internal.introOn" data-bool data-rr ${S.internal.introOn ? "checked" : ""}><span><b>There is an intermediary / introducer</b><small>A third party who brought the deal (besides the associate) and earns a fee.</small></span></label>
      ${S.internal.introOn ? `<div class="g2 mt8">
      ${F.txt("Company", "internal.introCompany")}${F.txt("Contact", "internal.introName")}
      ${F.txt("Email", "internal.introEmail")}${F.txt("Phone", "internal.introPhone")}
      ${F.num("Fee", "internal.introPct", "0.5", "", "% of equipment")}
      ${F.txt("Notes", "internal.introNotes")}</div>` : ""}
      ${F.area("Internal notes (Details sheet only)", "internal.notes", "Negotiation status, competitors, next steps…", "span")}
      <div class="calc" id="dealOut">${dealMini()}</div>`, isOpen("internal")),
    sec("payment", 9, "Conditions of sale · payments", `<div class="pays">${pays}</div>
      <div class="paysum ${Math.abs(paySum - 100) > 0.01 ? "bad" : "ok"}">Total: <b>${fmtN(paySum, 1)} %</b> ${Math.abs(paySum - 100) > 0.01 ? "— must equal 100 %" : "✓"}</div>
      ${F.txt("Payment method", "payment.method", "", "span")}
      ${F.tip("PTE policy: <b>50 % down payment</b> at contract signing, 20 % at Inspection 1, 20 % at Inspection 2 (FAT) and 10 % before delivery. <b>100 % must be paid before delivery — no exceptions</b>; the PDF cannot be issued otherwise. Leave labels blank to use the standard wording.")}`, isOpen("payment")),
    sec("delivery", 10, "Delivery & warranty", `<div class="g2">
      ${F.num("Setting & commissioning", "delivery.installWeeks", "1", "", "weeks")}
      ${F.num("Warranty", "delivery.warrantyMonths", "1", "", "months")}</div>`, isOpen("delivery")),
    sec("terms", 11, "Terms & special conditions", `
      ${F.txt("Governing law", "terms.law", "", "span")}
      ${F.txt("Dispute resolution", "terms.dispute", "", "span")}
      ${F.area("Special conditions (printed on the terms page)", "notes", "Anything specific to this deal", "span")}`, isOpen("terms")),
    sec("seller", 12, "Seller & prepared by", `<div class="g2">
      ${F.txt("Prepared by", "quote.preparedBy", "Name")}${F.txt("Title", "quote.preparedTitle", "e.g. Sales Director")}
      ${F.txt("Email", "quote.preparedEmail")}${F.txt("Phone", "quote.preparedPhone")}
      ${F.txt("Seller company", "seller.company", "", "span")}
      ${F.txt("Website", "seller.web")}${F.txt("General email", "seller.email")}</div>`, isOpen("seller"))
  ].join("");
  const form = document.getElementById("form");
  const scroll = form.scrollTop;
  form.innerHTML = html;
  form.scrollTop = scroll;
}

/* ---------- render ---------- */
let tmr;
function renderAll(rebuildForm) {
  if (rebuildForm) buildForm();
  document.getElementById("page-size").textContent = S.paper === "a4"
    ? "@page{size:A4;margin:0} :root{--pw:210mm;--ph:297mm}"
    : "@page{size:letter;margin:0} :root{--pw:8.5in;--ph:11in}";
  document.getElementById("doc").innerHTML = renderDoc(S);
  document.documentElement.lang = S.lang;
  const c = calc(S);
  document.getElementById("barTotal").innerHTML = `<span>${c.qty} × ${c.m.id} · ${fmtN(c.mwTot)} MW</span><b>${money(c.total, S.currency)}</b>`;
  document.getElementById("pageCount").textContent = `${document.querySelectorAll("#doc .pg").length} pages · ${S.paper === "a4" ? "A4" : "US Letter"}`;
}
const schedule = (rebuild) => { clearTimeout(tmr); tmr = setTimeout(() => renderAll(rebuild), rebuild ? 0 : 140); };

/* live numbers in the form without rebuilding it (keeps focus) */
function refreshFormNumbers() {
  const c = calc(S);
  document.querySelectorAll(".pay-row output").forEach((o, i) => (o.textContent = money(c.pays[i].amt, S.currency)));
  const ps = S.payment.m.reduce((a, p) => a + num(p.pct), 0), el = document.querySelector(".paysum");
  if (el) { el.className = "paysum " + (Math.abs(ps - 100) > 0.01 ? "bad" : "ok"); el.innerHTML = `Total: <b>${fmtN(ps, 1)} %</b> ${Math.abs(ps - 100) > 0.01 ? "— must equal 100 %" : "✓"}`; }
  const calcs = document.querySelectorAll(".calc");
  if (calcs[0]) calcs[0].innerHTML = `<div><span>Unit price</span><b>${money(c.unit, S.currency)}</b><small>${money(c.ppm, S.currency)} × ${c.m.mw} MW</small></div><div><span>Equipment</span><b>${money(c.equip, S.currency)}</b><small>${c.qty} × ${c.m.id} · ${fmtN(c.mwTot)} MW</small></div>`;
  if (calcs[1]) calcs[1].innerHTML = `<div><span>Total</span><b>${money(c.total, S.currency)}</b><small>${money(c.total / c.mwTot, S.currency)} per MW</small></div>`;
  const co = document.getElementById("commOut");
  if (co) co.innerHTML = commHtml(c);
  const dm = document.getElementById("dealOut");
  if (dm) dm.innerHTML = dealMini();
  const auto = document.querySelector(".cost.auto em");
  if (auto) { const ins = c.logi.find((x) => x.key === "insurance"); auto.textContent = `${money(ins ? ins.amt : 0, S.currency)} · auto`; }
}

/* ---------- events ---------- */
const form = document.getElementById("form");
form.addEventListener("input", (e) => {
  const el = e.target; const k = el.dataset.k; if (!k) return;
  let v = el.dataset.bool !== undefined ? el.checked : el.value;
  if (el.dataset.num !== undefined) v = el.value === "" ? 0 : parseFloat(el.value);
  set(S, k, v);
  if (k === "channel.company" && applyKnownAssociate(S.channel)) { toast("Known associate: details filled in"); return schedule(true); }
  if (el.dataset.rr !== undefined) return schedule(true);
  refreshFormNumbers();
  schedule(false);
});
form.addEventListener("change", (e) => { if (e.target.dataset.rr !== undefined || e.target.tagName === "SELECT") schedule(true); });
form.addEventListener("click", (e) => {
  const m = e.target.closest("[data-model]");
  if (m) {
    S.product.model = m.dataset.model;
    const mdl = MODELS.find((x) => x.id === S.product.model);
    if (mdl.mw >= 2 && S.product.voltage === "0.48 kV") S.product.voltage = mdl.volt;
    return schedule(true);
  }
  if (e.target.id === "bAddItem") { S.customItems.push({ desc: "", qty: 1, price: 0, note: "" }); return schedule(true); }
  const d = e.target.closest("[data-delitem]");
  if (d) { S.customItems.splice(+d.dataset.delitem, 1); return schedule(true); }
});

const toast = (msg) => { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 2200); };

/* PTE payment policy: ≥ 50 % down payment and 100 % paid before delivery, no exceptions */
function paymentPolicyError() {
  const sum = S.payment.m.reduce((a, p) => a + num(p.pct), 0);
  if (Math.abs(sum - 100) > 0.01) return `Payments add up to ${fmtN(sum, 1)} %. 100 % must be paid before delivery.`;
  if (num(S.payment.m[0].pct) < 50) return `Down payment is ${fmtN(S.payment.m[0].pct, 1)} %. PTE policy requires at least 50 %.`;
  return "";
}
/* ---------- storage: the local desktop server (disk) or, on the web, this browser ---------- */
const RENDER = new URLSearchParams(location.search).has("render");   // headless PDF render by server.py
let DISK = null;                                                       // { folder, next } when server.py is running
async function api(path, body) {
  const r = await fetch(path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  const j = await r.json().catch(() => ({ ok: false, error: "bad response" }));
  if (!r.ok || !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
async function detectDisk() {
  if (location.protocol === "file:") return null;
  try { const j = await api("/api/info"); lsSet(LS_SEQ, j.next); return j; } catch { return null; }
}
function showMode() {
  const el = document.getElementById("saveMode");
  if (!el) return;
  el.className = "save-mode " + (DISK ? "disk" : "web");
  el.innerHTML = DISK ? `<b>Disk</b><span title="${esc(DISK.folder)}">Quotes \\ Cotizaciones</span>` : `<b>Browser</b><span>open the .bat to save to disk</span>`;
  document.getElementById("bSave").title = DISK ? "Save this proposal's data to the Cotizaciones folder" : "Save to this browser's library";
}
function busy(btn, on, label) {
  if (!btn) return;
  if (on) { btn.dataset.label = btn.textContent; btn.textContent = label || "Saving…"; btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}
let savedSnap = "";
const markSaved = () => (savedSnap = JSON.stringify(S));
const isDirty = () => JSON.stringify(S) !== savedSnap;

/* ---------- Download PDF: issue the proposal ---------- */
document.getElementById("bPdf").onclick = async () => {
  const perr = paymentPolicyError();
  if (perr) { const el = document.getElementById("s-payment"); if (el) { el.open = true; el.scrollIntoView({ block: "start" }); } return toast(perr); }
  const btn = document.getElementById("bPdf");
  if (DISK) {
    busy(btn, true, "Creating PDF…");
    try {
      const j = await api("/api/issue", { state: S, open: true });
      S.quote.no = j.no; S.quote.issued = true; lsSet(LS_SEQ, j.next); DISK.next = j.next;
      renderAll(true); markSaved();
      toast(`${j.no} saved to Cotizaciones · next: ${fmtNo(j.next)}`);
    } catch (e) { toast("Could not save: " + e.message); }
    busy(btn, false);
    return;
  }
  const old = document.title;
  const client = (S.client.company || "Client").replace(/[^\w\- ]+/g, "").trim();
  document.title = `${S.quote.no} - ${client} - ${S.product.model}`;
  const first = !S.quote.issued;
  issueNumber();
  saveToLibrary();
  renderAll(true); markSaved();
  toast(first ? `${S.quote.no} issued · next proposal: ${fmtNo(nextSeq())}` : "Print dialog: choose “Save as PDF” as destination");
  window.print();
  setTimeout(() => (document.title = old), 800);
};

/* ---------- Details: internal deal sheet ---------- */
const dealWrap = document.getElementById("dealWrap");
function openDeal() {
  document.getElementById("dealDoc").innerHTML = renderDeal(S);
  dealWrap.hidden = false; document.body.classList.add("deal-open");
}
document.getElementById("bDeal").onclick = openDeal;
document.getElementById("bDealClose").onclick = () => { dealWrap.hidden = true; document.body.classList.remove("deal-open"); };
document.getElementById("bDealPdf").onclick = async () => {
  if (DISK) {
    const btn = document.getElementById("bDealPdf");
    busy(btn, true, "Creating PDF…");
    try { await api("/api/details", { state: S, open: true }); toast("Deal details saved to Cotizaciones"); }
    catch (e) { toast("Could not save: " + e.message); }
    busy(btn, false);
    return;
  }
  const old = document.title;
  const client = (S.client.company || "Client").replace(/[^\w\- ]+/g, "").trim();
  document.title = `${S.quote.no} - ${client} - Deal details INTERNAL`;
  document.body.classList.add("print-deal");
  window.print();
  setTimeout(() => { document.body.classList.remove("print-deal"); document.title = old; }, 800);
};
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !dealWrap.hidden) document.getElementById("bDealClose").click(); });

function saveToLibrary() {
  const lib = lsGet(LS_LIB, {});
  lib[S.quote.no + " Rev " + S.quote.rev] = { saved: new Date().toISOString(), data: S };
  lsSet(LS_LIB, lib);
}
document.getElementById("bNew").onclick = () => {
  if (isDirty() && !confirm("Start a new proposal? Unsaved changes to the current one will be lost.")) return;
  startBlank();
};
function startBlank(withStart) {
  S = defaults(); syncDraftNo(); renderAll(true); markSaved();
  if (!RENDER && !navigator.webdriver) askChannel(withStart);
}
/* start screen: the most recent saved proposals, one click to open */
async function savedList() {
  if (DISK) return (await api("/api/list")).items.map((it) => ({ key: it.file, disk: true, no: it.no, rev: it.rev, issued: it.issued, client: it.client, associate: it.associate, model: it.model, qty: it.qty }));
  const lib = lsGet(LS_LIB, {});
  return Object.keys(lib).sort((a, b) => lib[b].saved.localeCompare(lib[a].saved)).map((k) => { const d = lib[k].data; return { key: k, disk: false, no: d.quote.no, rev: d.quote.rev, issued: d.quote.issued, client: d.client.company, associate: d.channel && d.channel.via ? d.channel.company : "", model: d.product.model, qty: d.product.qty }; });
}
async function fillRecent() {
  const box = document.getElementById("startRecent"), warn = document.getElementById("startWarn");
  warn.hidden = !!DISK;
  warn.innerHTML = DISK ? "" : "This window is the web version: proposals are kept only in this browser. To save to <b>Quotes \\ Cotizaciones</b>, open the app with <b>Abrir PTE Quote Studio.bat</b>.";
  box.innerHTML = "";
  try {
    const items = await savedList();
    document.getElementById("startOpenSub").textContent = items.length ? `${items.length} saved · ${DISK ? "Cotizaciones folder" : "this browser"}` : "No saved proposals yet";
    box.innerHTML = items.slice(0, 8).map((it) => `<button type="button" class="recent" data-key="${esc(it.key)}" data-disk="${it.disk ? 1 : ""}"><b>${esc(it.no || "—")}${it.rev && it.rev !== "A" ? " Rev " + esc(it.rev) : ""}</b><span>${esc(it.client || "—")}${it.associate ? " · via " + esc(it.associate) : ""} · ${esc(it.qty || 1)} × ${esc(it.model || "")}</span><em class="${it.issued ? "iss" : "drf"}">${it.issued ? "issued" : "draft"}</em></button>`).join("");
  } catch (e) { box.innerHTML = `<p class="muted">Could not read saved proposals: ${esc(e.message)}</p>`; }
}
async function openSaved(key, disk) {
  if (disk) { const j = await api("/api/load?file=" + encodeURIComponent(key)); S = merge(defaults(), j.state); }
  else { const lib = lsGet(LS_LIB, {}); if (!lib[key]) throw new Error("not found"); S = merge(defaults(), lib[key].data); }
  syncDraftNo(); renderAll(true); markSaved(); toast("Opened " + S.quote.no);
}

/* every new proposal asks whether the deal comes through an associate */
function askChannel(withStart) {
  const d = document.getElementById("askDlg");
  document.getElementById("askStart").hidden = !withStart;
  document.getElementById("askNewStep").hidden = !!withStart;
  if (withStart) fillRecent();
  document.getElementById("askMore").hidden = true;
  ["askCo", "askPct"].forEach((id) => (document.getElementById(id).value = ""));
  d.showModal();
}
function openSection(id) {
  const el = document.getElementById("s-" + id);
  if (el) { el.open = true; el.scrollIntoView({ block: "start" }); }
}
document.getElementById("askNo").onclick = () => {
  S.channel.via = false; document.getElementById("askDlg").close(); renderAll(true); openSection("client"); toast("Direct client");
};
document.getElementById("askYes").onclick = () => { document.getElementById("askMore").hidden = false; document.getElementById("askCo").focus(); };
document.getElementById("askGo").onclick = () => {
  const pct = parseFloat(document.getElementById("askPct").value);
  if (!isFinite(pct) || pct < 0 || pct > 100) { document.getElementById("askPct").focus(); return toast("Enter the associate's commission %"); }
  Object.assign(S.channel, { via: true, company: document.getElementById("askCo").value.trim(), commPct: pct, commMode: document.getElementById("askMode").value });
  applyKnownAssociate(S.channel);
  document.getElementById("askDlg").close(); renderAll(true); openSection("channel");
  toast(`Associate commission ${fmtN(pct, 1)} % set for this quote`);
};
document.getElementById("askDlg").addEventListener("cancel", (e) => e.preventDefault());
document.getElementById("startNew").onclick = () => { document.getElementById("askStart").hidden = true; document.getElementById("askNewStep").hidden = false; };
document.getElementById("startOpen").onclick = () => { document.getElementById("askDlg").close(); document.getElementById("bLib").click(); };
document.getElementById("startRecent").onclick = async (e) => {
  const b = e.target.closest(".recent"); if (!b) return;
  try { await openSaved(b.dataset.key, !!b.dataset.disk); document.getElementById("askDlg").close(); }
  catch (err) { toast("Could not open: " + err.message); }
};

/* ---------- Save / Open ---------- */
document.getElementById("bSave").onclick = async () => {
  if (DISK) {
    try { await api("/api/save", { state: S }); markSaved(); toast("Saved to Cotizaciones: " + S.quote.no); }
    catch (e) { toast("Could not save: " + e.message); }
    return;
  }
  saveToLibrary(); markSaved(); toast("Saved to this browser: " + S.quote.no);
};
document.getElementById("bLib").onclick = async () => {
  const list = document.getElementById("libList");
  if (DISK) {
    list.innerHTML = "<p>Loading…</p>";
    document.getElementById("libDlg").showModal();
    try {
      const j = await api("/api/list");
      list.innerHTML = `<div class="lib-path">${esc(DISK.folder)} <button class="btn small ghost" data-reveal="1">Open folder</button></div>` + (j.items.length ? j.items.map((it) => `<div class="lib-row"><div><b>${esc(it.no || "—")}${it.rev && it.rev !== "A" ? " Rev " + esc(it.rev) : ""} ${it.issued ? '<em class="iss">issued</em>' : '<em class="drf">draft</em>'}</b><span>${esc(it.client || "—")}${it.associate ? " · via " + esc(it.associate) : ""} · ${esc(it.qty || 1)} × ${esc(it.model || "")}</span></div><button class="btn small" data-file="${esc(it.file)}">Open</button></div>`).join("") : "<p>No proposals in the folder yet.</p>");
    } catch (e) { list.innerHTML = `<p>Could not read the folder: ${esc(e.message)}</p>`; }
    return;
  }
  const lib = lsGet(LS_LIB, {});
  const keys = Object.keys(lib).sort((a, b) => lib[b].saved.localeCompare(lib[a].saved));
  list.innerHTML = keys.length ? keys.map((k) => { const d = lib[k].data; const c = calc(d); return `<div class="lib-row"><div><b>${esc(k)}</b><span>${esc(d.client.company || "—")} · ${c.qty} × ${c.m.id} · ${money(c.total, d.currency)}</span></div><button class="btn small" data-open="${esc(k)}">Open</button><button class="btn small ghost" data-del="${esc(k)}">Delete</button></div>`; }).join("") : "<p>No saved proposals yet.</p>";
  document.getElementById("libDlg").showModal();
};
document.getElementById("libList").onclick = async (e) => {
  const t = e.target;
  if (t.dataset.reveal) { api("/api/reveal", {}).catch(() => {}); return; }
  if (t.dataset.file) {
    try { const j = await api("/api/load?file=" + encodeURIComponent(t.dataset.file)); S = merge(defaults(), j.state); syncDraftNo(); document.getElementById("libDlg").close(); renderAll(true); markSaved(); toast("Opened " + S.quote.no); }
    catch (err) { toast("Could not open: " + err.message); }
    return;
  }
  const lib = lsGet(LS_LIB, {});
  if (t.dataset.open) { S = merge(defaults(), lib[t.dataset.open].data); syncDraftNo(); document.getElementById("libDlg").close(); renderAll(true); markSaved(); toast("Opened " + t.dataset.open); }
  if (t.dataset.del && confirm("Delete " + t.dataset.del + "?")) { delete lib[t.dataset.del]; lsSet(LS_LIB, lib); document.getElementById("bLib").click(); }
};
document.getElementById("bExport").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }));
  a.download = `${S.quote.no}.json`; a.click();
};
document.getElementById("fImport").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { S = merge(defaults(), JSON.parse(await f.text())); syncDraftNo(); renderAll(true); markSaved(); toast("Imported " + f.name); } catch { toast("Not a valid proposal file"); }
  e.target.value = "";
};
document.getElementById("zoomSeg").onclick = (e) => {
  const z = e.target.dataset.z; if (!z) return;
  document.querySelectorAll("#zoomSeg button").forEach((b) => b.classList.toggle("on", b === e.target));
  document.getElementById("doc").style.setProperty("--z", z);
};

/* ---------- associate logo upload ---------- */
function readLogo(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("could not read the file"));
    r.onload = () => {
      if (file.type === "image/svg+xml") return resolve(r.result);
      const img = new Image();
      img.onerror = () => reject(new Error("not an image"));
      img.onload = () => {
        const k = Math.min(1, 900 / img.width, 450 / img.height);   // keep it light inside the saved data
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        const ctx = cv.getContext("2d");
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        // near-white background -> transparent, so the logo sits cleanly on the white page header
        const px = ctx.getImageData(0, 0, cv.width, cv.height), d = px.data;
        for (let i = 0; i < d.length; i += 4) {
          const lo = Math.min(d[i], d[i + 1], d[i + 2]), hi = Math.max(d[i], d[i + 1], d[i + 2]);
          if (lo > 215 && hi - lo < 20) d[i + 3] = Math.round(d[i + 3] * (1 - Math.min(1, (lo - 215) / 25)));
        }
        ctx.putImageData(px, 0, 0);
        resolve(cv.toDataURL("image/png"));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
form.addEventListener("change", async (e) => {
  if (e.target.id !== "fLogo") return;
  const f = e.target.files[0]; if (!f) return;
  try { S.channel.logo = await readLogo(f); renderAll(true); toast("Associate logo added to every page"); }
  catch (err) { toast("Logo: " + err.message); }
});
form.addEventListener("click", (e) => {
  if (e.target.id === "bLogoDel") { S.channel.logo = ""; renderAll(true); }
  if (e.target.id === "bGoPpm") {
    openSection("system");
    const inp = document.querySelector('[data-k="product.pricePerMw"]');
    if (inp) { inp.scrollIntoView({ block: "center" }); inp.focus(); inp.select(); }
  }
});

window.PTEQS = { defaults, get state() { return S; }, set state(v) { S = merge(defaults(), v); renderAll(true); } };
// an unissued proposal always carries the next free number; older saved proposals are brought up to date
function syncDraftNo() {
  applyKnownAssociate(S.channel);
  if (S.quote.issued) return;
  const m = /^PTE (\d+)$/.exec(S.quote.no || "");
  if (!m || parseInt(m[1], 10) < nextSeq()) S.quote.no = newQuoteNo();
  if (S.quote.preparedPhone === "+1 646 350 3999") S.quote.preparedPhone = "+1 786 793 9141"; // Gabriel's US number replaces the old default
  // proposals on an older default split (30/30/30/10, 45/20/20/15) move to the current 50/20/20/10 policy
  if (["30,30,30,10", "45,20,20,15"].includes(S.payment.m.map((p) => num(p.pct)).join())) [50, 20, 20, 10].forEach((v, i) => (S.payment.m[i].pct = v));
}
form.addEventListener("change", (e) => {
  if (e.target.id !== "seqNext") return;
  const n = parseInt(e.target.value, 10);
  if (!isFinite(n) || n < 1) return toast("Enter a valid number");
  lsSet(LS_SEQ, n);
  if (!S.quote.issued) S.quote.no = fmtNo(n);
  renderAll(true); toast("Next proposal number: " + fmtNo(n));
});
window.addEventListener("beforeunload", (e) => { if (!RENDER && isDirty()) { e.preventDefault(); e.returnValue = ""; } });

/* every time the app opens it starts with a blank proposal */
(async () => {
  lsSet(LS_DRAFT, null);
  renderAll(true); markSaved();
  if (RENDER) return;
  DISK = await detectDisk();
  showMode();
  startBlank(true);
})();
