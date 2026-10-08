/* ============================================================
   _gen-pins-lib.mjs — โค้ดร่วมของทุกหน้าเข็มกลัดตราสิงโต อ่านข้อมูลจาก data/pins.json ที่เดียว
   - หน้ารายเบอร์ (_gen-pin-pages.mjs) เรียกฟังก์ชันตรง ๆ
   - หน้าที่เขียนมือ (หน้ารวม ขายส่ง งานวิ่ง แบรนด์ ฯลฯ) ใช้ marker <!--pins:xxx-->…<!--/pins:xxx-->
     แล้ว _gen-pins-shared.mjs เติมให้ (รันซ้ำได้ ผลเท่าเดิม)
   กติกา: ช่องที่เป็น null ใน pins.json = ไม่แสดง ห้ามใส่ตัวเลขเดา
   ============================================================ */
import { readFileSync, existsSync } from "fs";
import vm from "vm";

/* ข้อมูลร้าน (ที่อยู่) จากไฟล์เดียวกับหน้าเว็บ — ใส่ค่าจริงลง HTML ให้ตรงกับที่ _chrome.mjs ฝัง */
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL("./assets/js/shop-config.js", import.meta.url), "utf8"), sandbox);
const SHOP = sandbox.window.SHOP || {};

export const SITE = "https://mtthardware.com";
export const DATA = JSON.parse(readFileSync(new URL("./data/pins.json", import.meta.url), "utf8"));
export const PINS = DATA.sizes;
export const BRAND = DATA.brand;
const TESTI_FILE = new URL("./data/testimonials.json", import.meta.url);
export const TESTIMONIALS = existsSync(TESTI_FILE) ? JSON.parse(readFileSync(TESTI_FILE, "utf8")) : [];

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/* ข้อความสองภาษา: ค่าใน attribute escape เสมอ ส่วนเนื้อในเป็นไทย (ถ้า html=true เนื้อในมี tag ได้) */
export const bi = (th, en, html = false) => `data-th="${esc(th)}" data-en="${esc(en)}">${html ? th : esc(th)}`;
const num = (n) => Number(n).toLocaleString("en-US");
const baht = (n) => "฿" + num(n);

/* ---------- จำนวนต่อกล่อง ---------- */
export const packStr = (p) => p.pack.min === p.pack.max ? num(p.pack.min) : `${num(p.pack.min)}–${num(p.pack.max)}`;
export const packMin = (p) => p.pack.min;
export const packCell = (p) => packStr(p) + (p.pack.min === 144 && p.pack.max === 144 ? ' <span data-th="(1 กุรุส)" data-en="(1 gross)">(1 กุรุส)</span>' : "");
export const bySize = (no) => PINS.find((p) => p.no === String(no));

/* ---------- ราคา ---------- */
const UNIT = {
  box:    { th: "ยกกล่อง", en: "Per box",   qty: (p) => packStr(p), per: (p) => p.pack.min },
  gross:  { th: "กุรุส",   en: "Per gross", qty: () => "144",        per: () => 144 },
  bunch:  { th: "พวง",     en: "Per bunch", qty: () => "12",         per: () => 12 },
  packet: { th: "ซอง",     en: "Per packet", qty: () => "—",         per: () => null },
};
export const hasPrice = (p) => Object.values(p.price || {}).some((v) => typeof v === "number");
export const anyPrice = () => PINS.some(hasPrice);
const perPiece = (price, n) => n ? (price / n).toFixed(2) : null;

/* ตารางราคาของเบอร์เดียว (หน้ารายเบอร์) — ว่างถ้ายังไม่มีราคา */
export function priceTableOne(p, from) {
  if (!hasPrice(p)) return "";
  const rows = p.units.filter((u) => typeof p.price[u] === "number").map((u) => {
    const U = UNIT[u], pp = perPiece(p.price[u], U.per(p));
    return `          <tr><td ${bi(U.th, U.en)}</td><td ${bi(U.qty(p) + " ตัว", U.qty(p) + " pcs")}</td><td><b>${baht(p.price[u])}</b></td><td>${pp ? `฿${pp}` : "—"}</td></tr>`;
  });
  if (p.tier && typeof p.tier.box === "number") {
    rows.push(`          <tr class="tier"><td ${bi(`สั่ง ${p.tier.min_boxes} กล่องขึ้นไป`, `${p.tier.min_boxes}+ boxes`)}</td><td ${bi(packStr(p) + " ตัว/กล่อง", packStr(p) + " pcs/box")}</td><td><b>${baht(p.tier.box)}</b> <span ${bi("ต่อกล่อง", "per box")}</span></td><td>฿${perPiece(p.tier.box, p.pack.min)}</td></tr>`);
  }
  const ask = `สั่งเข็มกลัดเบอร์ ${p.no} ยกกล่อง จำนวน ... กล่อง (จากหน้า${from})`;
  return `    <h2 class="sec-h" id="price" ${bi(`ราคาเข็มกลัดเบอร์ ${p.no}`, `Size ${p.no} prices`)}</h2>
    <div class="tblwrap" tabindex="0" role="region" aria-label="ราคาเข็มกลัดเบอร์ ${p.no}" data-th-aria-label="ราคาเข็มกลัดเบอร์ ${p.no}" data-en-aria-label="Size ${p.no} prices">
      <table class="cmp price">
        <thead><tr><th ${bi("หน่วย", "Unit")}</th><th ${bi("จำนวน", "Count")}</th><th ${bi("ราคา", "Price")}</th><th ${bi("ตกตัวละ", "Per pin")}</th></tr></thead>
        <tbody>
${rows.join("\n")}
        </tbody>
      </table>
    </div>
    <p class="price-note" ${bi("ราคาหน้าร้านสำเพ็ง ยังไม่รวมค่าส่ง สั่งจำนวนมากทักมาคุยได้", "Sampheng counter prices before shipping. Message us for larger quantities.")}</p>
    <p><a class="btn btn-primary" data-line-ask="${esc(ask)}" href="#" target="_blank" rel="noopener" ${bi(`สั่งเบอร์ ${p.no} ทาง LINE`, `Order size ${p.no} on LINE`)}</a></p>
`;
}

/* ตารางราคาทุกเบอร์ (หน้ารวม/ขายส่ง/แบรนด์) — ว่างถ้าไม่มีเบอร์ไหนมีราคา */
export function priceTableAll(from) {
  if (!anyPrice()) return "";
  const units = ["box", "gross", "bunch", "packet"].filter((u) => PINS.some((p) => typeof (p.price || {})[u] === "number"));
  const tier = PINS.some((p) => p.tier && typeof p.tier.box === "number");
  const head = [`<th ${bi("เบอร์", "Size")}</th>`, `<th ${bi("บรรจุ/กล่อง", "Per box")}</th>`]
    .concat(units.map((u) => `<th ${bi(UNIT[u].th, UNIT[u].en)}</th>`), [`<th ${bi("ตกตัวละ (ยกกล่อง)", "Per pin (by box)")}</th>`], tier ? [`<th ${bi("10 กล่องขึ้นไป", "10+ boxes")}</th>`] : []);
  const rows = PINS.map((p) => {
    const cells = [`<td><b><a href="safety-pins-${p.no}.html" ${bi(`เบอร์ ${p.no}`, `Size ${p.no}`)}</a></b></td>`, `<td>${packStr(p)}</td>`]
      .concat(units.map((u) => `<td>${typeof (p.price || {})[u] === "number" ? baht(p.price[u]) : "—"}</td>`))
      .concat([`<td>${typeof (p.price || {}).box === "number" ? "฿" + perPiece(p.price.box, p.pack.min) : "—"}</td>`])
      .concat(tier ? [`<td>${p.tier && typeof p.tier.box === "number" ? `${baht(p.tier.box)} <span ${bi(`(ตั้งแต่ ${p.tier.min_boxes} กล่อง)`, `(from ${p.tier.min_boxes})`)}</span>` : "—"}</td>`] : []);
    return `          <tr>${cells.join("")}</tr>`;
  });
  return `    <h2 class="sec-h" id="price" ${bi("ราคาเข็มกลัดตราสิงโต ทุกเบอร์", "Lion-brand safety pin prices, every size")}</h2>
    <div class="tblwrap" tabindex="0" role="region" aria-label="ราคาเข็มกลัดทุกเบอร์" data-th-aria-label="ราคาเข็มกลัดทุกเบอร์" data-en-aria-label="Prices for every size">
      <table class="box price">
        <thead><tr>${head.join("")}</tr></thead>
        <tbody>
${rows.join("\n")}
        </tbody>
      </table>
    </div>
    <p class="price-note" ${bi("ราคาหน้าร้านสำเพ็ง ยังไม่รวมค่าส่ง สั่งคละเบอร์ในออเดอร์เดียวได้", "Sampheng counter prices before shipping. Mix sizes in one order.")}</p>
    <p><a class="btn btn-primary" data-line-ask="${esc(`สั่งเข็มกลัดตราสิงโต เบอร์ ... จำนวน ... กล่อง (จากหน้า${from})`)}" href="#" target="_blank" rel="noopener" ${bi("สั่งทาง LINE ระบุเบอร์และจำนวน", "Order on LINE with size and quantity")}</a></p>
`;
}

/* ---------- สถานะสต็อก ---------- */
export function stockBadge(p) {
  if (p.in_stock === true) return `<span class="badge green stock" ${bi("พร้อมส่ง", "In stock")}</span>`;
  if (p.in_stock === false) return `<span class="badge gray stock" ${bi("สินค้าหมด รอรอบใหม่", "Out of stock")}</span>`;
  return "";
}

/* ---------- ค่าส่ง ---------- */
export function shippingHTML() {
  const s = DATA.shipping;
  if (!s) return "";
  if (s.type === "flat") return `    <p class="ship-note" ${bi(`ค่าส่งเหมา ${baht(s.amount)} ต่อออเดอร์ สั่งกี่กล่องก็ได้`, `Flat shipping of ${baht(s.amount)} per order, any number of boxes`)}</p>\n`;
  if (s.type === "table" && Array.isArray(s.rows) && s.rows.length) {
    const rows = s.rows.map((r) => `          <tr><td ${bi(`${r.boxes_min}–${r.boxes_max} กล่อง`, `${r.boxes_min}–${r.boxes_max} boxes`)}</td><td>${baht(r.bkk)}</td><td>${baht(r.upcountry)}</td></tr>`);
    return `    <div class="tblwrap" tabindex="0" role="region" aria-label="ค่าส่ง" data-th-aria-label="ค่าส่ง" data-en-aria-label="Shipping">
      <table class="cmp ship">
        <thead><tr><th ${bi("จำนวนกล่อง", "Boxes")}</th><th ${bi("กรุงเทพฯ และปริมณฑล", "Bangkok area")}</th><th ${bi("ต่างจังหวัด", "Upcountry")}</th></tr></thead>
        <tbody>
${rows.join("\n")}
        </tbody>
      </table>
    </div>
`;
  }
  return "";
}

/* ---------- แถบ "ซื้อตรงจากต้นทาง" ---------- */
export function originStrip(base) {
  const th = `ตราสิงโตเป็นแบรนด์ของ ม.ทวีภัณฑ์ สั่งที่นี่คือซื้อตรงจากต้นทาง ไม่ผ่านคนขายต่อ <a href="${base}products/safety-pins-lion-brand.html">รู้จักเข็มกลัดตราสิงโต</a>`;
  const en = `Lion brand belongs to M.T.T. Hardware. Ordering here means buying straight from the source, not a reseller. <a href="${base}products/safety-pins-lion-brand.html">About Lion-brand pins</a>`;
  return `    <p class="origin-strip" ${bi(th, en, true)}</p>`;
}

/* ---------- ซื้อที่ไหนได้บ้าง (หน้าแบรนด์) ---------- */
export function whereToBuy() {
  /* ที่อยู่ใส่ค่าจริงทั้งใน attribute และเนื้อใน ให้บอตและหน้า /en เห็นโดยไม่ต้องรอ JS */
  const addr = `<span data-shop="address">${esc(SHOP.ADDRESS_TH || "")}</span>`;
  const items = [
    [`หน้าร้าน ม.ทวีภัณฑ์ สำเพ็ง ${addr}`, `M.T.T. Hardware, Sampheng ${addr}`],
    [`เว็บนี้ สั่งทาง LINE ส่งทั่วไทย ออกใบกำกับภาษีได้`, `This site, ordering on LINE with nationwide shipping and tax invoices`],
  ];
  for (const m of DATA.marketplaces || []) if (m && m.url && m.name) items.push([`ร้านทางการบน ${esc(m.name)}: <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.url)}</a>`, `Official ${esc(m.name)} store: <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.url)}</a>`]);
  const rs = (DATA.resellers || []).filter((r) => r && r.name && r.consent);
  let resellers = "";
  if (rs.length) {
    resellers = `    <h3 ${bi("ตัวแทนจำหน่าย", "Authorised resellers")}</h3>\n    <ul class="use-list">\n` +
      rs.map((r) => `      <li ${bi(`${r.name}${r.area ? " · " + r.area : ""}`, `${r.name}${r.area ? " · " + r.area : ""}`, false)}${r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>` : ""}</li>`).join("\n") + "\n    </ul>\n";
  }
  return `    <ul class="use-list">\n` + items.map(([t, e]) => `      <li ${bi(t, e, true)}</li>`).join("\n") + `\n    </ul>\n` + resellers;
}

/* ---------- รีวิวลูกค้า (เฉพาะที่มีคำยินยอม) ---------- */
export function reviewsHTML() {
  const list = (TESTIMONIALS || []).filter((t) => t && t.text_th && t.consent);
  if (!list.length) return "";
  return `    <h2 class="sec-h" id="reviews" ${bi("เสียงจากลูกค้า", "What customers say")}</h2>
    <div class="reviews">
` + list.map((t) => `      <blockquote class="review"><p ${bi(t.text_th, t.text_en || t.text_th)}</p><footer ${bi(t.who_th || "ลูกค้า ม.ทวีภัณฑ์", t.who_en || t.who_th || "M.T.T. customer")}</footer></blockquote>`).join("\n") + `
    </div>
`;
}

/* ---------- ข้อมูลให้สคริปต์ในหน้า (เครื่องคำนวณ/การ์ด) ---------- */
export function pinsDataScript() {
  const sizes = Object.fromEntries(PINS.map((p) => [p.no, { pack: p.pack, price: p.price, tier: p.tier, in_stock: p.in_stock }]));
  return `<script>window.PINS_DATA=${JSON.stringify({ sizes, shipping: DATA.shipping })};</script>`;
}
/* อาร์เรย์ PINS สำหรับการ์ดหน้ารวม (ชื่อฟิลด์เดิมของสคริปต์หน้ารวม) */
export function hubPinsJS() {
  const arr = PINS.map((p) => ({ no: p.no, mm: p.mm, cm: p.cm, pack: packStr(p), uth: p.short_th, uen: p.short_en, flag_th: p.flag_th || undefined, flag_en: p.flag_en || undefined, in_stock: p.in_stock, price_box: (p.price || {}).box ?? null }));
  return "const PINS = " + JSON.stringify(arr, null, 0).replace(/\},\{/g, "},\n  {").replace(/^\[/, "[\n  ").replace(/\]$/, "\n];");
}

/* ---------- ตาราง ---------- */
/* แถวตารางขนาดในหน้ารวม */
export function hubTableRows() {
  return PINS.map((p) => {
    const aka = p.aka_th && p.aka_th !== "—" ? `<td ${bi(p.aka_th, p.aka_en)}</td>` : "<td>—</td>";
    return `          <tr><td><a href="safety-pins-${p.no}.html"><b>${p.no}</b></a></td><td>${p.mm}</td><td>${p.cm}</td><td>${esc(p.inch)}</td><td>${packStr(p)}</td>${aka}</tr>`;
  }).join("\n");
}
/* แถวตารางหน้าขายส่ง */
export function wholesaleRows() {
  return PINS.map((p) => `          <tr><td><b><a href="safety-pins-${p.no}.html">${p.no}</a></b>${p.in_stock == null ? "" : " " + stockBadge(p)}</td><td ${bi(`${p.mm} มม.`, `${p.mm} mm`)}</td><td ${bi(`${p.wire} มม.`, `${p.wire} mm`)}</td><td>${packCell(p)}</td><td ${bi(p.packing_th, p.packing_en)}</td><td ${bi(p.typical_th, p.typical_en)}</td></tr>`).join("\n");
}
/* ตารางเบอร์ครบในหน้าแบรนด์ */
export function brandSizesTable() {
  return `    <div class="tblwrap" tabindex="0" role="region" aria-label="เข็มกลัดตราสิงโตทุกเบอร์" data-th-aria-label="เข็มกลัดตราสิงโตทุกเบอร์" data-en-aria-label="Every Lion-brand size">
      <table class="box">
        <thead><tr><th ${bi("เบอร์", "Size")}</th><th ${bi("ความยาว", "Length")}</th><th ${bi("ขนาดลวด", "Wire")}</th><th ${bi("บรรจุ/กล่อง", "Per box")}</th><th ${bi("บรรจุแบบ", "Packed as")}</th><th ${bi("ใช้บ่อย", "Typical use")}</th></tr></thead>
        <tbody>
${PINS.map((p) => `          <tr><td><b><a href="safety-pins-${p.no}.html" ${bi(`เบอร์ ${p.no}`, `Size ${p.no}`)}</a></b></td><td ${bi(`${p.mm} มม.`, `${p.mm} mm`)}</td><td ${bi(`${p.wire} มม.`, `${p.wire} mm`)}</td><td>${packCell(p)}</td><td ${bi(p.packing_th, p.packing_en)}</td><td ${bi(p.short_th, p.short_en)}</td></tr>`).join("\n")}
        </tbody>
      </table>
    </div>
`;
}

/* ---------- schema ---------- */
export const brandRef = () => ({ "@type": "Brand", "@id": BRAND.id, name: `${BRAND.name_th} M.T.T.`, alternateName: [BRAND.name_en, "M.T.T."] });
export function offerFor(p, url) {
  if (!p.price || typeof p.price.box !== "number") return null;
  const o = { "@type": "Offer", url, price: p.price.box, priceCurrency: "THB", itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${SITE}/#store` }, eligibleQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "box" } };
  if (p.in_stock === true) o.availability = "https://schema.org/InStock";
  if (p.in_stock === false) o.availability = "https://schema.org/OutOfStock";
  return o;
}

/* ---------- เติม marker ในหน้าที่เขียนมือ ---------- */
export function fillPinMarkers(html, { base = "../", size = null, from = "" } = {}) {
  const parts = {
    origin: () => originStrip(base),
    prices: () => size ? priceTableOne(bySize(size), from) : priceTableAll(from),
    shipping: () => shippingHTML(),
    data: () => pinsDataScript(),
    hubjs: () => hubPinsJS(),
    table: () => hubTableRows(),
    wholesale: () => wholesaleRows(),
    sizes: () => brandSizesTable(),
    buy: () => whereToBuy(),
    reviews: () => reviewsHTML(),
  };
  return html.replace(/<!--pins:([a-z]+)-->[\s\S]*?<!--\/pins:\1-->/g, (m, name) => {
    if (!parts[name]) throw new Error(`ไม่รู้จัก marker pins:${name}`);
    const inner = parts[name]().replace(/\s+$/, "");
    return `<!--pins:${name}-->\n${inner}\n<!--/pins:${name}-->`;
  });
}
