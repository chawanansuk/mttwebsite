/* ============================================================
   _chrome.mjs — ฝัง header / footer / แถบเมนูมือถือ ลงไฟล์ HTML ตรง ๆ
   เดิม layout.js สร้างส่วนนี้ตอนเปิดหน้า → หน้ากระพริบ และบอตที่ไม่รัน JS ไม่เห็นเมนู/ลิงก์ท้ายเว็บ
   ตอนนี้ markup อยู่ที่ไฟล์นี้ที่เดียว แก้แล้วรัน `npm run bake` (หรือ `npm run gen`)
   ตัวสร้างหน้า (_gen-*.mjs) เรียก bakeChrome() เองก่อนเขียนไฟล์
   รันซ้ำได้: ส่วนที่ฝังไว้อยู่ระหว่าง <!--chrome:xxx--> … <!--/chrome:xxx--> จะถูกแทนที่ของเดิม
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import vm from "vm";
import { fileURLToPath } from "url";

/* ข้อมูลร้านจากไฟล์เดียวกับที่หน้าเว็บใช้ */
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL("./assets/js/shop-config.js", import.meta.url), "utf8"), sandbox);
export const SHOP = sandbox.window.SHOP;
const S = SHOP;
/* รายการบทความ (คอลัมน์ "บทความ" ใน footer) — แหล่งเดียวกับ _gen-articles.mjs */
const ARTICLES = JSON.parse(readFileSync(new URL("./data/articles.json", import.meta.url), "utf8")).articles;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const LINE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.58 7.39 8.42 8.03.33.07.77.22.88.5.1.26.07.66.03.92l-.14.85c-.04.26-.2 1.02.89.56 1.09-.46 5.86-3.45 8-5.91C21.4 13.4 22 11.85 22 10.13 22 5.64 17.52 2 12 2z"/></svg>';
const BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>';
const CART_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>';

const LINE_ATTRS = `data-shop="line-url" href="${esc(S.LINE_URL || "#")}" target="_blank" rel="noopener"`;
const TEL_HREF = `data-shop="phone-tel" href="tel:${esc(S.PHONE_TEL || "")}"`;

/* ---------- markup (base = "" | "../" | "/" ตาม window.MTT_BASE ของหน้า) ---------- */
function headerHTML(base, page) {
  const NAV = [
    { key: "home",     th: "หน้าแรก",       en: "Home",        href: "/" },
    { key: "cats",     th: "หมวดหมู่",       en: "Categories",  href: "/#categories" },
    { key: "products", th: "สินค้าทั้งหมด",  en: "Products",    href: "/products" },
    { key: "tools",    th: "เครื่องมือช่าง",  en: "Tools",       href: base + "products/tools.html" },
    { key: "pins",     th: "เข็มกลัด",        en: "Safety pins", href: base + "products/safety-pins.html" },
    { key: "contact",  th: "ติดต่อ",         en: "Contact",     href: "/#contact" },
  ];
  const links = NAV.map((n) => {
    const on = n.key === page;
    return `<a href="${n.href}" data-nav="${n.key}"${on ? ' class="active" aria-current="page"' : ""} data-th="${n.th}" data-en="${n.en}">${n.th}</a>`;
  }).join("\n      ");
  return `<a class="skip" href="#main" data-th="ข้ามไปเนื้อหา" data-en="Skip to content">ข้ามไปเนื้อหา</a>
<header class="site-header"><div class="wrap nav">
  <a class="brand" href="/" aria-label="ม.ทวีภัณฑ์ หน้าแรก" data-th-aria-label="ม.ทวีภัณฑ์ หน้าแรก" data-en-aria-label="M.T.T. Hardware home"><span class="mark">${BOLT}</span><span class="b-th">ม.ทวีภัณฑ์<small>M.T.T. Hardware</small></span></a>
  <nav class="nav-links" id="navLinks">
      ${links}
  </nav>
  <div class="nav-right">
    <a class="cart-btn" href="${base}products/jet-lighter.html#order" aria-label="ตะกร้าสินค้า" title="ตะกร้าสินค้า" data-th-aria-label="ตะกร้าสินค้า" data-en-aria-label="Cart" data-th-title="ตะกร้าสินค้า" data-en-title="Cart">${CART_ICON}<span class="cart-badge" id="cartBadge" hidden>0</span></a>
    <div class="lang" role="group" aria-label="ภาษา" data-th-aria-label="ภาษา" data-en-aria-label="Language"><button data-lang="th" aria-pressed="true">TH</button><button data-lang="en" aria-pressed="false">EN</button></div>
    <a class="btn btn-line btn-sm" ${LINE_ATTRS} aria-label="สั่งทาง LINE" data-th-aria-label="สั่งทาง LINE" data-en-aria-label="Order on LINE">${LINE_ICON}<span data-th="สั่งทาง LINE" data-en="LINE">สั่งทาง LINE</span></a>
    <button class="nav-toggle" aria-label="เปิดเมนู" data-th-aria-label="เปิดเมนู" data-en-aria-label="Open menu" aria-expanded="false" aria-controls="navLinks"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  </div>
</div></header>`;
}

function footerHTML(base) {
  const li = (href, th, en) => `<li><a href="${href}" data-th="${th}" data-en="${en}">${th}</a></li>`;
  const row = (icon, inner) => `<div class="row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">${icon}</svg>${inner}</div>`;
  const contact = [
    S.PHONE && row('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
      `<a ${TEL_HREF}><span data-shop="phone">${esc(S.PHONE)}</span></a>`),
    S.EMAIL && row('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
      `<a data-shop="email-href" href="mailto:${esc(S.EMAIL)}"><span data-shop="email">${esc(S.EMAIL)}</span></a>`),
    S.ADDRESS_TH && row('<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
      `<span data-shop="address">${esc(S.ADDRESS_TH)}</span>`),
  ].filter(Boolean).join("\n      ");
  return `<footer class="site-footer"><div class="wrap"><div class="foot-grid">
  <div class="foot-brand"><div class="brand"><span class="mark">${BOLT}</span><span class="b-th">ม.ทวีภัณฑ์<small>M.T.T. Hardware</small></span></div>
    <p data-th="ศูนย์รวมเครื่องมือช่างและฮาร์ดแวร์ สำเพ็ง — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย ราคาปลีก-ส่ง ส่งทั่วไทย" data-en="Tools &amp; hardware, Sampheng — exclusive WYNNTOOLS importer in Thailand. Retail &amp; wholesale, nationwide.">ศูนย์รวมเครื่องมือช่างและฮาร์ดแวร์ สำเพ็ง — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย ราคาปลีก-ส่ง ส่งทั่วไทย</p></div>
  <div class="foot-col"><h2 data-th="สินค้า" data-en="Products">สินค้า</h2><ul>
    ${li(base + "products/jet-lighter.html", "ไฟฟู่ / ไฟแช็ก", "Jet lighters")}
    ${li(base + "products/tools.html", "เครื่องมือช่าง WYNNTOOLS", "WYNNTOOLS")}
    ${li(base + "products/tools-wrenches.html", "ประแจ ลูกบล็อก", "Wrenches &amp; sockets")}
    ${li(base + "products/tools-holding.html", "คีม แคลมป์ ปากกาจับ", "Pliers &amp; clamps")}
    ${li(base + "products/safety-pins.html", "เข็มกลัดซ่อนปลาย", "Safety pins")}
    ${li(base + "products/mtt-brand.html", "สินค้าตรา M.T.T. ตราสิงโต", "M.T.T. brand products")}
    ${li(base + "products/safety-pins-wholesale.html", "เข็มกลัด ขายส่งยกกล่อง", "Safety pins wholesale")}
    ${li(base + "products/safety-pins-canvas.html", "เข็มกลัดผ้าใบ เต็นท์", "Canvas &amp; tent pins")}
    ${li("/products", "สินค้าทั้งหมด", "All products")}
    ${li("/#categories", "หมวดหมู่", "Categories")}
  </ul></div>
  <div class="foot-col"><h2 data-th="บทความ" data-en="Guides">บทความ</h2><ul>
    ${ARTICLES.map((a) => li(base + "articles/" + a.slug + ".html", a.short_th, a.short_en)).join("\n    ")}
    ${li("/articles", "บทความทั้งหมด", "All guides")}
  </ul></div>
  <div class="foot-col"><h2 data-th="ลิงก์" data-en="Links">ลิงก์</h2><ul>
    ${li("/#why", "ทำไมต้องเรา", "Why us")}
    ${li("/#contact", "ติดต่อ", "Contact")}
    ${li(base + "privacy.html", "ความเป็นส่วนตัว", "Privacy")}
    <li><a ${LINE_ATTRS}>LINE OA</a></li>
  </ul></div>
  <div class="foot-col"><h2 data-th="ติดต่อ" data-en="Contact">ติดต่อ</h2><div class="foot-contact">
      ${contact}
  </div></div>
</div><div class="foot-bottom">
  <span>© 2026 ม.ทวีภัณฑ์ · ${esc(S.legal_th || "")} · <span data-th="สงวนลิขสิทธิ์" data-en="All rights reserved">สงวนลิขสิทธิ์</span></span>
  <span data-th="ออกแบบเพื่อการสั่งซื้อที่ง่ายที่สุด" data-en="Built for the easiest ordering">ออกแบบเพื่อการสั่งซื้อที่ง่ายที่สุด</span>
</div></div></footer>`;
}

/* แถบเมนูล่าง (มือถือ) — หน้าแรก / สินค้า / ตะกร้า / LINE (ซ่อนบนจอใหญ่ผ่าน CSS) */
function tabbarHTML(base, page) {
  const cur = (on) => (on ? ' aria-current="page"' : "");
  const isProducts = page === "products" || page === "tools" || page === "pins";
  return `<nav class="tabbar" aria-label="เมนูหลัก" data-th-aria-label="เมนูหลัก" data-en-aria-label="Main menu">
  <a href="/"${cur(page === "home")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg><span data-th="หน้าแรก" data-en="Home">หน้าแรก</span></a>
  <a href="/products"${cur(isProducts)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M3 7 12 3l9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg><span data-th="สินค้า" data-en="Products">สินค้า</span></a>
  <a href="${base}products/jet-lighter.html#order" aria-label="ตะกร้าสินค้า" data-th-aria-label="ตะกร้าสินค้า" data-en-aria-label="Cart">${CART_ICON}<span data-th="ตะกร้า" data-en="Cart">ตะกร้า</span><span class="tab-badge" id="tabCartBadge" hidden>0</span></a>
  <a class="tab-line" ${LINE_ATTRS}>${LINE_ICON}<span data-th="ทัก LINE" data-en="LINE">ทัก LINE</span></a>
</nav>`;
}

/* ---------- ข้อมูลร้านในเนื้อหน้า (data-shop) ---------- */
/* ใส่ค่าจริงแทน href="#" / "—" ให้บอตเห็นเบอร์ ที่อยู่ ลิงก์ LINE โดยไม่ต้องรัน JS
   ค่าที่ว่าง (อีเมล เวลาทำการ บัญชี) ปล่อยไว้ layout.js ซ่อนแถวเหมือนเดิม */
const HREF = { "line-url": S.LINE_URL, "phone-tel": S.PHONE_TEL && "tel:" + S.PHONE_TEL, "email-href": S.EMAIL && "mailto:" + S.EMAIL };
const TEXT = { phone: S.PHONE, address: S.ADDRESS_TH, "line-id": S.LINE_ID, email: S.EMAIL, hours: S.HOURS_TH };
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
/* ลิงก์ "ทัก LINE พร้อมข้อความ" — ตรรกะเดียวกับ CATALOG.lineAsk() ใน assets/js/catalog.js */
/* อักษรไทยเก็บไว้ตรง ๆ ไม่ percent-encode — URL Standard อนุญาต และเบราว์เซอร์ encode ให้เองตอนกด
   เดิม encode ทุกตัว (ไทย 1 ตัว = 9 ไบต์) หน้าแคตตาล็อกประแจหนัก ~290KB เพราะลิงก์พวกนี้ราว 80KB */
const askQuery = (text) => encodeURIComponent(text || "").replace(/(?:%E0%B[89]%[89AB][0-9A-F])+/g, decodeURIComponent);
const lineAsk = (text) => {
  const id = (S.LINE_ID || "").replace(/^@/, "");
  return id ? "https://line.me/R/oaMessage/@" + id + "/?" + askQuery(text) : S.LINE_URL || "#";
};
/* ข้อความนโยบายที่ใช้หลายหน้า: data-shop-text="shipping" → SHOP.SHIPPING_TH/EN */
const SHOP_TEXT = { shipping: [S.SHIPPING_TH, S.SHIPPING_EN], colors: [S.COLORS_TH, S.COLORS_EN], returns: [S.RETURNS_TH, S.RETURNS_EN] };
function fillShop(html) {
  html = html.replace(/<a\b[^>]*\bdata-shop="(line-url|phone-tel|email-href)"[^>]*>/g, (tag, key) =>
    HREF[key] ? tag.replace(/\bhref="[^"]*"/, `href="${esc(HREF[key])}"`) : tag);
  html = html.replace(/<a\b[^>]*\bdata-line-ask="([^"]*)"[^>]*>/g, (tag, ask) =>
    tag.replace(/\bhref="[^"]*"/, `href="${esc(lineAsk(unesc(ask)))}"`));
  html = html.replace(/<(p|span|div)\b([^>]*?)\s*\bdata-shop-text="(\w+)"([^>]*)>[^<]*<\/\1>/g, (m, tag, pre, key, post) => {
    const t = SHOP_TEXT[key];
    if (!t || !t[0]) return m;
    const attrs = (pre + post).replace(/\s*\bdata-(th|en)="[^"]*"/g, "");
    return `<${tag}${attrs} data-shop-text="${key}" data-th="${esc(t[0])}" data-en="${esc(t[1] || t[0])}">${esc(t[0])}</${tag}>`;
  });
  return html.replace(/(<(span|b|strong)\b[^>]*\bdata-shop="(phone|address|line-id|email|hours)"[^>]*>)([^<]*)(<\/\2>)/g,
    (m, open, _tag, key, _text, close) => (TEXT[key] ? open + esc(TEXT[key]) + close : m));
}

/* ---------- ฝังลงหน้า ---------- */
function block(name, inner) { return `<!--chrome:${name}-->\n${inner}\n<!--/chrome:${name}-->`; }
function put(html, name, slot, inner) {
  const re = new RegExp(`<!--chrome:${name}-->[\\s\\S]*?<!--/chrome:${name}-->`);
  if (re.test(html)) return html.replace(re, () => block(name, inner));
  if (!html.includes(slot)) throw new Error(`ไม่พบช่อง ${slot}`);
  return html.replace(slot, () => block(name, inner));
}

export function bakeChrome(html) {
  const base = (html.match(/window\.MTT_BASE="([^"]*)"/) || [])[1];
  if (base === undefined) throw new Error("หน้าไม่มี window.MTT_BASE");
  const page = (html.match(/window\.MTT_PAGE="([^"]*)"/) || [])[1] || "";
  html = put(html, "header", '<div id="site-header"></div>', headerHTML(base, page));
  // toast ของหน้า (ถ้ามี) ใช้ตัวเดิม ไม่ฝังซ้ำ
  const ownToast = html.replace(/<!--chrome:footer-->[\s\S]*?<!--\/chrome:footer-->/, "").includes('class="toast"');
  const toast = ownToast ? "" : '\n<div class="toast" id="toast" role="status" aria-live="polite"></div>';
  html = put(html, "footer", '<div id="site-footer"></div>', footerHTML(base) + "\n" + tabbarHTML(base, page) + toast);
  return bakeStoreSchema(fillShop(html));
}

/* ---------- ข้อมูลร้านให้ Google: schema Store ในหน้าแรก + แท็กยืนยัน Search Console ----------
   ช่องที่ร้านยังไม่ให้ข้อมูล (เวลาเปิด พิกัด อีเมล Facebook) จะไม่ใส่เลย — ห้ามเดา */
const isUrl = (u) => /^https?:\/\/\S+$/.test(u || "");
function bakeStoreSchema(html) {
  html = html.replace(/\n<meta name="google-site-verification" content="[^"]*">/, "");
  const re = /(<script type="application\/ld\+json">\n)(\{[\s\S]*?"@id": "https:\/\/mtthardware\.com\/#store"[\s\S]*?\})(\n<\/script>)/;
  const m = html.match(re);
  if (!m) return html;
  if (S.SEARCH_CONSOLE_VERIFY) html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n<meta name="google-site-verification" content="${esc(S.SEARCH_CONSOLE_VERIFY)}">`);
  const o = JSON.parse(m[2]);
  for (const k of ["openingHoursSpecification", "geo", "hasMap", "email"]) delete o[k];
  const hours = (S.HOURS_SPEC || []).filter((h) => h && h.days && h.days.length && h.opens && h.closes);
  if (hours.length) o.openingHoursSpecification = hours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes }));
  const g = S.GEO || {};
  if (typeof g.lat === "number" && typeof g.lng === "number") o.geo = { "@type": "GeoCoordinates", latitude: g.lat, longitude: g.lng };
  if (isUrl(S.MAPS_URL)) o.hasMap = S.MAPS_URL;
  if (S.EMAIL) o.email = S.EMAIL;
  o.sameAs = [S.LINE_URL, S.FACEBOOK_URL].filter(isUrl);
  /* เรียงคีย์ใหม่ให้อ่านง่าย: ข้อมูลติดต่อ/ที่ตั้งอยู่ก่อน hasOfferCatalog */
  const { hasOfferCatalog, ...rest } = o;
  const out = JSON.stringify(hasOfferCatalog ? { ...rest, hasOfferCatalog } : rest, null, 2);
  return html.replace(re, (all, a, _b, c) => a + compactJSON(out) + c);
}
/* JSON.stringify ขยายทุก array/object ทีละบรรทัด — ย่อ object เล็กกลับเป็นบรรทัดเดียวแบบไฟล์เดิม */
function compactJSON(s) {
  return s.replace(/\{\n\s+("@type": "(?:OfferCatalog|Country)"[^{}\[\]]*?)\n\s+\}/g, (all, body) => "{ " + body.replace(/\n\s+/g, " ") + " }")
          .replace(/\[\n\s+((?:"[^"\n]*",?\n\s+)*"[^"\n]*")\n\s+\]/g, (all, body) => "[" + body.replace(/\n\s+/g, " ") + "]");
}

/* ---------- CLI: node _chrome.mjs [--check] ---------- */
export function pageFiles() {
  /* en/ สร้างจากหน้าไทยโดย _gen-en.mjs (header/footer เป็นภาษาอังกฤษแล้ว) ห้าม bake ทับ */
  return execSync("git ls-files '*.html'", { encoding: "utf8" }).split("\n").filter((f) => f && !f.startsWith("en/"));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const stale = [];
  for (const f of pageFiles()) {
    const src = readFileSync(f, "utf8");
    const out = bakeChrome(src);
    if (out === src) continue;
    if (check) stale.push(f); else { writeFileSync(f, out); console.log("ฝังแล้ว", f); }
  }
  if (check && stale.length) { console.error("header/footer ไม่ตรงกับ _chrome.mjs — รัน npm run bake:\n  " + stale.join("\n  ")); process.exit(1); }
  if (check) console.log("header/footer ทุกหน้าตรงกับ _chrome.mjs");
}
