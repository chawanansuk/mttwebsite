/* ============================================================
   Smoke test — โหลดทุกหน้า ตรวจ JS error, ตะกร้า, สลับภาษา,
   จำค่า, overflow แนวนอน (มือถือ), ขนาดไอคอน, toast/CTA
   รันด้วย: npm test
   ============================================================ */
import pw from "playwright";
const { chromium } = pw;
import http from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { execSync } from "child_process";
import { extname, join, resolve } from "path";
import { useLocalFonts } from "./fonts.mjs";

const ROOT = resolve(process.argv[2] || ".");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };
const IGNORE = [/fonts\.g/i, /_vercel/i, /favicon\.ico/i, /net::ERR/i, /Failed to load resource/i];
const ignorable = (t) => IGNORE.some((r) => r.test(t));

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]).replace(/^\/en\/assets\//, "/assets/"); // vercel.json rewrite
  if (p.endsWith("/")) p += "index.html";
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html"); // /products → products/index.html เหมือน Vercel
  if (existsSync(f) && statSync(f).isFile()) {
    res.writeHead(200, { "Content-Type": MIME[extname(f)] || "text/plain" });
    res.end(readFileSync(f));
  } else { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const base = "http://localhost:" + port;

const fails = [];
const log = (m) => console.log("  " + m);
// บน GitHub Actions ข้อที่ไม่ผ่านขึ้นเป็น annotation ด้วย (เห็นในหน้า PR/commit โดยไม่ต้องเปิด log)
const GHA = !!process.env.GITHUB_ACTIONS;
const ghaEsc = (m) => String(m).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
function assert(cond, msg) { if (cond) log("✓ " + msg); else { fails.push(msg); log("✗ " + msg); if (GHA) console.log("::error title=smoke::" + ghaEsc(msg)); } }

process.on("unhandledRejection", (e) => { console.error("\n❌ UNHANDLED: " + (e && e.message || e)); process.exit(1); });

// ตั้ง CHROMIUM_PATH ได้ ถ้าเครื่องมี Chromium อยู่แล้วแต่เวอร์ชันไม่ตรงกับที่ Playwright ดาวน์โหลด
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// ฟอนต์จริงแบบออฟไลน์ (test/fonts.mjs) — เลย์เอาต์ตรงกับเว็บจริงทุกเครื่อง ไม่ขึ้นกับว่าต่อ Google Fonts ได้ไหม
console.log(useLocalFonts(browser) ? "ฟอนต์: Kanit/Anuphan จาก @fontsource (ออฟไลน์)" : "ฟอนต์: ไม่พบ @fontsource — ใช้ฟอนต์จากเน็ต/ฟอนต์สำรอง");
async function newPage(vp) {
  const page = await browser.newPage(vp ? { viewport: vp } : undefined);
  page.setDefaultNavigationTimeout(30000);      // การโหลดหน้า (cold start ช้าได้)
  page.setDefaultTimeout(10000);                // action (click/fill) — ล้มเร็วถ้า element ไม่โผล่
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !ignorable(m.text())) errs.push("CONSOLE: " + m.text()); });
  page.__errs = errs;
  return page;
}

const ALL_PAGES = ["/", "/products", "/index.html", "/products/index.html", "/products/tools.html", "/products/tools-holding.html", "/products/tools-automotive.html", "/products/tools-wrenches.html", "/products/tools-electrical.html", "/products/tools-screwdrivers.html", "/products/tools-cutting.html", "/products/tools-cutter.html", "/products/tools-padlock.html", "/products/tools-striking.html", "/products/tools-garden.html", "/products/tools-upholster.html", "/products/tools-measuring.html", "/products/tools-blades.html", "/products/tools-soldering.html", "/products/tools-hydraulic.html", "/products/mtt-brand.html", "/products/safety-pins.html", "/products/safety-pins-wholesale.html", "/products/safety-pins-canvas.html", "/products/safety-pins-running.html", "/products/safety-pins-tags.html", "/products/safety-pins-lion-brand.html", "/products/safety-pins-diaper.html", "/articles/which-safety-pin-size.html", "/products/safety-pins-000.html", "/products/safety-pins-00.html", "/products/safety-pins-0.html", "/products/safety-pins-1.html", "/products/safety-pins-2.html", "/products/safety-pins-3.html", "/products/safety-pins-4.html", "/products/safety-pins-5.html", "/products/safety-pins-6.html", "/products/safety-pins-7.html", "/products/jet-lighter.html", "/articles/jet-lighter-compact-or-large.html","/articles/jet-lighter-wholesale-margin.html","/articles/which-jet-lighter-brand.html", "/articles/jet-lighter-wont-light.html", "/articles/safety-pins-how-many-boxes.html", "/articles", "/privacy.html", "/404.html"];
/* บทความทุกชิ้นใน data/articles.json ต้องอยู่ในการตรวจด้วย (เดิมรายการมือขาดบทความใหม่) */
for (const a of JSON.parse(readFileSync(join(ROOT, "data/articles.json"), "utf8")).articles) {
  const u = `/articles/${a.slug}.html`; if (!ALL_PAGES.includes(u)) ALL_PAGES.push(u);
}

/* ---- header/footer อยู่ใน HTML ดิบ (บอตที่ไม่รัน JS เห็น) และตรงกับ _chrome.mjs ---- */
console.log("\n[ header/footer ฝังใน HTML ]");
const { bakeChrome, SHOP } = await import(new URL("../_chrome.mjs", import.meta.url));
const count = (s, needle) => s.split(needle).length - 1;
for (const path of ALL_PAGES) {
  const raw = await (await fetch(base + path)).text();
  const ok = count(raw, '<header class="site-header"') === 1 && count(raw, '<footer class="site-footer"') === 1 &&
    count(raw, '<nav class="tabbar"') === 1 && !raw.includes('id="site-header"></div>') && !raw.includes('id="site-footer"></div>');
  assert(ok, path + " HTML ดิบมี header/footer/แถบล่าง อย่างละหนึ่ง");
  assert(bakeChrome(raw) === raw, path + " ตรงกับ _chrome.mjs (ไม่ค้างเวอร์ชันเก่า)");
  assert(raw.includes('href="' + SHOP.LINE_URL + '"') && raw.includes('href="tel:' + SHOP.PHONE_TEL + '"') && !/data-shop="(line-url|phone-tel)" href="#"/.test(raw),
    path + " ลิงก์ LINE/โทร เป็นค่าจริงตั้งแต่ HTML");
}

/* ---- ข้อมูลโครงสร้าง + บทความ (อ่านจาก HTML ดิบ ไม่ต้องเปิดเบราว์เซอร์) ---- */
console.log("\n[ JSON-LD / บทความ ]");
const ARTS = JSON.parse(readFileSync(join(ROOT, "data/articles.json"), "utf8")).articles;
const SITEMAP = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
const untag = (h) => h.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const ldBlocks = (raw) => [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
let badLd = [], askHash = [];
for (const path of ALL_PAGES) {
  const raw = await (await fetch(base + path)).text();
  for (const b of ldBlocks(raw)) { try { JSON.parse(b); } catch (e) { badLd.push(path); } }
  if (/<a\b[^>]*data-line-ask="[^"]*"[^>]*href="#"|<a\b[^>]*href="#"[^>]*data-line-ask=/.test(raw)) askHash.push(path);
}
assert(badLd.length === 0, "JSON-LD ทุกบล็อกทุกหน้า parse ได้" + (badLd.length ? " → " + badLd.join(", ") : ""));
assert(askHash.length === 0, "ปุ่ม/ลิงก์ถาม LINE (data-line-ask) มีลิงก์จริงตั้งแต่ HTML ไม่มี href=\"#\"" + (askHash.length ? " → " + askHash.join(", ") : ""));
for (const a of ARTS) {
  const path = "/articles/" + a.slug + ".html", url = "https://mtthardware.com" + path;
  const raw = await (await fetch(base + path)).text();
  const lds = ldBlocks(raw).map((b) => JSON.parse(b));
  const art = lds.find((o) => o["@type"] === "Article"), crumbs = lds.find((o) => o["@type"] === "BreadcrumbList"), faq = lds.find((o) => o["@type"] === "FAQPage");
  const qa = (raw.match(/<div class="qa">([\s\S]*?)<\/div>/) || [])[1] || "";
  const shown = [...qa.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => [untag(m[1]), untag(m[2])]);
  const inLd = faq ? faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]) : [];
  assert(shown.length > 0 && JSON.stringify(shown) === JSON.stringify(inLd), `${a.slug}: คำถาม-คำตอบใน FAQPage ตรงกับที่แสดงบนหน้า (${shown.length}/${inLd.length} ข้อ)`);
  const canon = (raw.match(/<link rel="canonical" href="([^"]+)"/) || [])[1], ogUrl = (raw.match(/property="og:url" content="([^"]+)"/) || [])[1];
  assert(canon === url && ogUrl === url && art && art.mainEntityOfPage === url && crumbs && crumbs.itemListElement.at(-1).item === url, `${a.slug}: canonical = og:url = mainEntityOfPage = breadcrumb`);
  const times = [...raw.matchAll(/<time datetime="([^"]+)"/g)].map((m) => m[1]);
  const lastmod = (SITEMAP.match(new RegExp(url.replace(/[.]/g, "\\.") + "</loc>\\s*<lastmod>([^<]+)")) || [])[1];
  assert(art && art.dateModified === a.modified && times.at(-1) === a.modified && lastmod === a.modified, `${a.slug}: วันที่อัปเดตตรงกันทั้งบนหน้า / schema / sitemap (${a.modified})`);
  const title = (raw.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const ogImg = (raw.match(/property="og:image" content="([^"]+)"/) || [])[1] || "";
  assert(title.length <= 60 && title.endsWith("| ม.ทวีภัณฑ์") && /og:image:width" content="1200"/.test(raw) && /og:image:height" content="630"/.test(raw) && existsSync(join(ROOT, ogImg.replace("https://mtthardware.com/", ""))),
    `${a.slug}: title ≤60 มีชื่อร้าน · รูป OG 1200×630 มีไฟล์จริง`);
}
{
  const raw = await (await fetch(base + "/products/jet-lighter.html")).text();
  const faq = ldBlocks(raw).map((b) => JSON.parse(b)).find((o) => o["@type"] === "FAQPage");
  const ans = (q) => faq.mainEntity.find((x) => x.name === q).acceptedAnswer.text;
  const { SHOP: S } = await import(new URL("../_chrome.mjs", import.meta.url));
  assert(ans("การจัดส่ง") === S.SHIPPING_TH && ans("เลือกสีในกล่องเองได้ไหม") === S.COLORS_TH && ans("ไฟฟู่จุดไม่ติด เปลี่ยนได้ไหม") === S.RETURNS_TH, "หน้าไฟฟู่: คำตอบเรื่องจัดส่ง/เลือกสี/เปลี่ยนสินค้าใน schema ตรงกับ shop-config");
  let mismatch = [];
  for (const path of ["/products/jet-lighter.html", ...ARTS.filter((a) => a.cat === "jet").map((a) => "/articles/" + a.slug + ".html")]) {
    const r = await (await fetch(base + path)).text();
    for (const m of r.matchAll(/data-shop-text="(\w+)" data-th="([^"]*)"/g)) {
      const want = { shipping: S.SHIPPING_TH, colors: S.COLORS_TH, returns: S.RETURNS_TH }[m[1]];
      if (untag(m[2]) !== want) mismatch.push(path + ":" + m[1]);
    }
  }
  assert(mismatch.length === 0, "ข้อความจัดส่ง/เลือกสี/เปลี่ยนสินค้า เหมือนกันทุกหน้า (มาจาก shop-config)" + (mismatch.length ? " → " + mismatch.join(", ") : ""));
}

/* ---- ปิด JS แล้วยังเห็นเมนู/ท้ายเว็บ (เหมือนบอตที่ไม่รัน JS) ---- */
console.log("\n[ ปิด JavaScript ]");
for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(base + "/products/tools.html", { waitUntil: "domcontentloaded" });
  const r = await page.evaluate(() => {
    const vis = (q) => { const el = document.querySelector(q); return !!el && el.getBoundingClientRect().height > 0 && getComputedStyle(el).visibility !== "hidden"; };
    return { header: vis(".site-header .brand"), nav: vis(".nav-links"), tab: vis(".tabbar"), foot: document.querySelectorAll(".site-footer a[href]").length };
  });
  assert(r.header && r.foot >= 15 && (w < 901 ? r.tab : r.nav), `ปิด JS @${w}: เห็นโลโก้ ${w < 901 ? "แถบล่าง" : "เมนู"} และลิงก์ท้ายเว็บ ${r.foot} ลิงก์`);
  await ctx.close();
}

/* ---- โหลดได้ ไม่มี JS error ทุกหน้า ---- */
console.log("\n[ โหลดทุกหน้า ]");
for (const path of ALL_PAGES) {
  const page = await newPage();
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(180);
  assert(page.__errs.length === 0, path + " ไม่มี JS error" + (page.__errs.length ? " → " + page.__errs.join(" | ") : ""));
  const n = await page.evaluate(() => [".site-header", ".site-footer", ".tabbar", ".skip"].map((q) => document.querySelectorAll(q).length).join(","));
  assert(n === "1,1,1,1", path + " header/footer/แถบล่าง/skip ไม่ซ้ำหลัง JS ทำงาน (" + n + ")");
  await page.close();
}

/* ---- รูปไม่ยืดผิดสัดส่วน (aspect-ratio guard) ---- */
console.log("\n[ รูปไม่ยืดผิดสัดส่วน ]");
for (const [path, w] of [["/products/jet-lighter.html", 1280], ["/products/jet-lighter.html", 390], ["/index.html", 1280], ["/articles/jet-lighter-compact-or-large.html", 390], ["/articles/jet-lighter-wholesale-margin.html", 1280], ["/articles/which-jet-lighter-brand.html", 390]]) {
  const page = await newPage({ width: w, height: 900 });
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll("img")].map((im) => {
      if (!im.naturalWidth) return null;
      const r = im.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return null;
      const fit = getComputedStyle(im).objectFit;
      if (fit === "cover" || fit === "contain" || fit === "scale-down") return null; // cover = ตั้งใจ crop, contain = ย่อทั้งรูปไม่บิดสัดส่วน
      const natAR = im.naturalWidth / im.naturalHeight, renAR = r.width / r.height;
      return Math.abs(natAR - renAR) / natAR > 0.02
        ? im.src.split("/").pop() + " " + natAR.toFixed(2) + "→" + renAR.toFixed(2) : null;
    }).filter(Boolean));
  assert(bad.length === 0, `${path} @${w}px ไม่มีรูปยืด${bad.length ? " → " + bad.join(", ") : ""}`);
  await page.close();
}

/* ---- SEO guard: title/description ยาวพอดี SERP + ลำดับหัวข้อไม่ข้ามชั้น ---- */
console.log("\n[ SEO: title/desc/heading ]");
for (const path of ALL_PAGES) {
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  const seo = await page.evaluate(() => {
    const t = document.title;
    const d = (document.querySelector("meta[name=description]") || {}).content || "";
    const jumps = [];
    let prev = 0;
    document.querySelectorAll("h1,h2,h3,h4").forEach((h) => {
      const l = +h.tagName[1];
      if (prev && l > prev + 1) jumps.push("h" + prev + "->h" + l);
      prev = l;
    });
    const robots = (document.querySelector("meta[name=robots]") || {}).content || "";
    return { t: t.length, d: d.length, h1: document.querySelectorAll("h1").length, jumps, noindex: /noindex/i.test(robots) };
  });
  // หน้า noindex (เช่น 404) ไม่ขึ้นผลค้นหา จึงไม่ต้องมี title/description ตามเกณฑ์ SERP
  if (!seo.noindex) {
    assert(seo.t > 0 && seo.t <= 62, `${path} title ${seo.t} ตัวอักษร (ต้อง 1-62)`);
    assert(seo.d > 0 && seo.d <= 155, `${path} meta description ${seo.d} ตัวอักษร (ต้อง 1-155)`);
  }
  assert(seo.h1 === 1, `${path} มี h1 เดียว (พบ ${seo.h1})`);
  assert(seo.jumps.length === 0, `${path} ลำดับหัวข้อไม่ข้ามชั้น${seo.jumps.length ? " → " + seo.jumps.join(",") : ""}`);
  await page.close();
}

/* ---- ไม่มี overflow แนวนอน (BUG-1 guard) ----
   เดิมตรวจแค่ 360/390 จึงไม่เคยจับการล้น 102px ของหน้าเข็มกลัดที่ 1024px
   เพิ่ม 768 กับ 1024 ให้ครอบคลุมแท็บเล็ตและโน้ตบุ๊กจอเล็กด้วย */
console.log("\n[ ไม่มี overflow แนวนอน @360/390/768/1024 ]");
for (const w of [360, 390, 768, 1024]) {
  for (const path of ALL_PAGES) {
    const page = await newPage({ width: w, height: 780 });
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(180);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(over <= 1, `${path} @${w}px ไม่ล้นแนวนอน (เกิน ${over}px)`);
    await page.close();
  }
}

/* ---- หน้าแรก ---- */
console.log("\n[ index.html ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  // นับจาก CATALOG ตรง ๆ — เพิ่มสินค้า/หมวดใหม่แล้วเทสต์ไม่ล้าสมัย
  const nProds = await page.evaluate(() => CATALOG.products.length);
  assert((await page.$$eval("#featGrid .prod", (e) => e.length)) === nProds, `แสดงสินค้าใน hero ครบ ${nProds} กลุ่มตาม catalog`);
  assert((await page.$eval("#featGrid .price:not(.ask)", (e) => e.textContent)).includes("฿"), "ราคาในการ์ดสินค้ามาจาก catalog");
  const iconW = await page.$eval("#why .a svg", (e) => Math.round(e.getBoundingClientRect().width));
  assert(iconW > 0 && iconW < 40, `ไอคอนแถบความมั่นใจขนาดปกติ (${iconW}px, ต้อง < 40)`);
  /* หน้าแรก V3: ส่วนที่ซ้ำกันถูกรวมแล้ว ต้องไม่กลับมา */
  assert(!(await page.$("#catGrid")) && (await page.$$eval(".cta-band", (e) => e.length)) === 0, "หน้าแรกไม่มีหมวดหมู่ซ้ำกับสินค้า และไม่มีแถบ CTA ซ้อนกัน");
  const nGuides = await page.$$eval("#guides .gcard", (e) => e.length);
  const nGuideCats = await page.evaluate(async () => Object.keys((await (await fetch("/data/articles.json")).json()).categories).length);
  assert(nGuides === nGuideCats, `คู่มือหน้าแรกหมวดละ 1 ชิ้น (${nGuides}/${nGuideCats})`);
  assert(await page.$eval("#races a[href$='safety-pins-running.html']", () => true).catch(() => false), "หน้าแรกยังมีทางไปเครื่องคำนวณงานวิ่ง");
  assert((await page.$eval(".hero-cta a[href='/products']", (a) => !!a)), "ปุ่ม 'ดูสินค้าทั้งหมด' ไปหน้า /products");
  await page.click(".lang button[data-lang=en]");
  await page.waitForTimeout(200);
  assert((await page.$eval('.nav-links a[data-nav=home]', (e) => e.textContent)) === "Home", "สลับเป็น EN ได้");
  await page.close();
}

/* ---- ไม่มี flash ภาษา (UP-1): บันทึก EN แล้วเปิดใหม่ ต้องไม่โผล่ TH ค้าง ---- */
console.log("\n[ ไม่มี flash TH→EN ]");
{
  const ctx = await browser.newContext();
  const p1 = await ctx.newPage();
  await p1.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
  await p1.evaluate(() => localStorage.setItem("mtt_lang", "en"));
  await p1.close();
  const p2 = await ctx.newPage();
  await p2.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
  await p2.waitForTimeout(180);
  assert((await p2.$eval(".hero h1", (e) => e.textContent)).includes("the source for"), "เปิดหน้าใหม่แสดง EN ถูกต้อง (จำภาษาได้)");
  await p2.close();
  await ctx.close();
}

/* ---- หน้ารวมสินค้า ---- */
console.log("\n[ products/index.html ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  const nAll = await page.evaluate(() => CATALOG.products.length);
  assert((await page.$$eval("#pgrid .prod", (e) => e.length)) === nAll, `แสดงสินค้าทั้งหมด ${nAll} ตาม catalog (ก่อนกรอง)`);
  await page.click('.fchip:has-text("ไฟฟู่")').catch(() => {});
  await page.waitForTimeout(200);
  assert((await page.$$eval("#pgrid .prod", (e) => e.length)) === 1, "กรองหมวดไฟฟู่เหลือ 1");
  await page.close();
}

/* ---- หน้าไฟฟู่: ตะกร้า + ขั้นตอนชำระเงิน + จำค่า + toast ---- */
console.log("\n[ products/jet-lighter.html ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  assert((await page.$eval("#heroFrom", (e) => e.textContent)).includes("฿"), "ราคาเริ่มต้นจาก catalog");
  /* schema อยู่ใน HTML ตรงๆ แล้ว (ไม่ได้สร้างด้วย JS) — ราคาต้องตรงกับ catalog.js เสมอ
     ถ้าแก้ราคาใน catalog.js แต่ลืมแก้ JSON-LD ใน <head> ข้อนี้จะตก */
  {
    const r = await page.evaluate(() => {
      const P = CATALOG.byId("jet-lighter");
      const want = { low: CATALOG.boxMinPerPiece(P), high: CATALOG.unitPriceRange(P).max };
      const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent));
      const prod = blocks.filter((b) => b["@type"] === "Product");
      return { want, count: prod.length, got: prod[0] && prod[0].offers,
               types: blocks.map((b) => b["@type"]).sort().join(",") };
    });
    assert(r.count === 1, `Product schema มีก้อนเดียว (พบ ${r.count})`);
    assert(r.got && r.got.lowPrice === r.want.low && r.got.highPrice === r.want.high,
      `ราคาใน schema ตรง catalog.js (schema ${r.got && r.got.lowPrice}–${r.got && r.got.highPrice} · catalog ${r.want.low}–${r.want.high})`);
    assert(/BreadcrumbList/.test(r.types) && /FAQPage/.test(r.types), "มี FAQPage และ BreadcrumbList ใน HTML");
  }
  assert(!!(await page.$('#heroVideo source[src$=".mp4"]')) && !!(await page.$('#heroVideo[poster]')), "คลิป hero มี source mp4 + poster");
  assert((await page.$$eval(".pcard .save", (e) => e.length)) >= 2, "มี badge ประหยัด % อย่างน้อย 2");
  await page.click(".add");
  await page.waitForTimeout(180);
  assert((await page.$eval("#cartAmt", (e) => e.textContent)) === "฿59", "เพิ่มลงตะกร้า ยอด ฿59");
  assert((await page.$$eval(".pay .paysteps li", (e) => e.length)) === 3, "มีขั้นตอนสั่งซื้อ/ชำระเงิน 3 ขั้น");
  assert((await page.$eval("#cartBadge", (e) => e.textContent)) === "1", "badge ตะกร้า = 1");
  assert(await page.$eval("#orderForm", (e) => getComputedStyle(e).display !== "none"), "ฟอร์มที่อยู่แสดงเมื่อมีของ");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  assert((await page.$eval("#cartAmt", (e) => e.textContent)) === "฿59", "ตะกร้าจำค่าไว้หลัง reload");
  await page.close();
}

/* ---- ฟอร์มที่อยู่จำค่า (UF-4) ---- */
console.log("\n[ ฟอร์มที่อยู่จำค่า ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.click(".add"); // ต้องมีของในตะกร้าก่อน ฟอร์มถึงจะแสดง
  await page.waitForTimeout(150);
  await page.fill("#ofName", "คุณทดสอบ");
  await page.waitForTimeout(100);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  assert((await page.$eval("#ofName", (e) => e.value)) === "คุณทดสอบ", "ชื่อในฟอร์มจำค่าไว้หลัง reload");
  await page.close();
}

/* ---- นับ funnel การสั่งซื้อ (Vercel Analytics custom events) ---- */
console.log("\n[ event หยิบลงตะกร้า / ส่งออเดอร์ ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.addInitScript(() => { window.__ev = []; window.va = (t, d) => window.__ev.push(d); window.open = () => null; });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.click(".add"); await page.click(".add");
  await page.waitForTimeout(150);
  await page.fill("#ofName", "คุณทดสอบ"); await page.fill("#ofPhone", "0812345678"); await page.fill("#ofAddr", "สำเพ็ง กรุงเทพฯ");
  await page.click("#lineOrder");
  await page.waitForTimeout(150);
  const ev = await page.evaluate(() => window.__ev);
  const sent = ev.find((e) => e.name === "order_sent");
  assert(ev.filter((e) => e.name === "add_to_cart").length === 2, "หยิบลงตะกร้า 2 ครั้ง → event add_to_cart 2 ครั้ง");
  assert(sent && sent.pieces === 2 && sent.lines === 1 && sent.value === 118, `ส่งออเดอร์ → event order_sent จำนวน/ยอดถูก (${JSON.stringify(sent)})`);
  assert(ev.some((e) => e.name === "line_click"), "ปุ่มส่งออเดอร์ยังนับเป็น line_click ด้วย");
  await page.close();
}

/* ---- สรุปออเดอร์ EN (UF-4) ---- */
console.log("\n[ สรุปออเดอร์ EN ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.click(".lang button[data-lang=en]");
  await page.waitForTimeout(200);
  await page.click(".add");
  await page.waitForTimeout(150);
  const txt = await page.evaluate(() => buildOrderText());
  assert(txt.split("\n")[0].includes("M.T.T. order"), "หัวออเดอร์ EN ถูกต้อง");
  assert(/Large 1 pc/.test(txt), "รายการ EN ถูกต้อง");
  await page.close();
}

/* ---- toast ไม่บังแถบสั่งซื้อมือถือ (BUG-3 guard) ---- */
console.log("\n[ toast ไม่ทับ CTA มือถือ ]");
{
  const page = await newPage({ width: 390, height: 844 });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.click(".add");
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const t = document.querySelector(".toast").getBoundingClientRect();
    const c = document.querySelector(".mobile-cta").getBoundingClientRect();
    return !(t.bottom < c.top || t.top > c.bottom);
  });
  assert(m === false, "toast ไม่ทับแถบ CTA");
  await page.close();
}

/* ตารางเครื่องมือ: ชื่อสินค้าพิมพ์ครั้งเดียวต่อตระกูล แต่ช่องค้นหาต้องยังหาเจอทุกแถว
   และถ้าแถวหัวตระกูลโดนซ่อน ชื่อต้องถูกยกมาให้แถวแรกที่ยังโชว์ ไม่งั้นตารางจะไร้ชื่อ */
console.log("\n[ ตารางแบบจัดตระกูล + ช่องค้นหา ]");
{
  const page = await browser.newPage();
  await page.goto(base + "/products/tools-wrenches.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const visible = () => page.$$eval("table.tools tbody tr", (rs) => rs.filter((r) => !r.hidden).length);
  const leadNamed = () => page.$$eval("table.tools tbody tr", (rs) => { const v = rs.filter((r) => !r.hidden); return v.length ? !!v[0].querySelector(".nmtxt b") : false; });

  const all = await visible();
  assert(all === 179, "โชว์ครบทุกแถวตอนยังไม่ค้นหา");
  const named = await page.$$eval("table.tools tbody tr", (rs) => rs.filter((r) => r.querySelector(".nmtxt b")).length);
  assert(named < all, "ชื่อสินค้าไม่ได้พิมพ์ซ้ำทุกแถว (" + named + " จาก " + all + ")");
  assert((await page.$$eval("table.tools tbody tr", (rs) => rs.filter((r) => r.dataset.nth).length)) === all, "ทุกแถวมี data-nth ไว้ให้ค้นหา");

  await page.fill("#findInput", "ลูกบล็อกสั้น");
  await page.waitForTimeout(300);
  assert((await visible()) >= 11, "ค้นชื่อตระกูลแล้วเจอแถวลูกที่ไม่ได้พิมพ์ชื่อด้วย");
  assert(await leadNamed(), "แถวแรกที่โชว์มีชื่อกำกับ");

  await page.fill("#findInput", "WS005L");
  await page.waitForTimeout(300);
  assert((await visible()) === 1, "ค้นรหัสเจาะจงเจอแถวเดียว");
  assert(await leadNamed(), "แถวลูกที่ถูกค้นเจอได้ชื่อตระกูลคืนมา");

  await page.fill("#findInput", "");
  await page.waitForTimeout(300);
  assert((await visible()) === all, "ล้างคำค้นแล้วกลับมาครบ");
  assert((await page.$$eval("table.tools tbody tr", (rs) => rs.filter((r) => r.querySelector(".nmtxt b")).length)) === named, "ล้างคำค้นแล้วชื่อกลับไปพิมพ์ครั้งเดียวเท่าเดิม");
  await page.close();
}

/* ---- เครื่องคำนวณเข็มกลัดงานวิ่ง: เลือกเบอร์ 0/2 ---- */
console.log("\n[ เครื่องคำนวณงานวิ่ง ]");
{
  const page = await newPage({ width: 390, height: 844 });
  await page.addInitScript(() => { window.__ev = []; window.va = (t, d) => window.__ev.push(d); });
  await page.goto(base + "/products/safety-pins-running.html", { waitUntil: "load" });
  await page.waitForTimeout(150);
  assert(/4,400 ตัว ≈ 6 กล่อง/.test(await page.textContent("#calcRes")), "ค่าเริ่มต้นเบอร์ 2 · 1,000 คน = 4,400 ตัว ≈ 6 กล่อง");
  await page.click('.calc .seg button[data-size="0"]');
  await page.fill("#runners", "20000");
  await page.waitForTimeout(100);
  const res = await page.textContent("#calcRes"), href = decodeURIComponent(await page.getAttribute("#calcAsk", "href"));
  assert(/88,000 ตัว ไม่เกิน 102 กล่อง/.test(res) && /เบอร์ 0 งานวิ่ง 20,000 คน/.test(href), `เลือกเบอร์ 0 · 20,000 คน → ไม่เกิน 102 กล่อง และข้อความ LINE ระบุเบอร์ 0 (${res})`);
  await page.evaluate(() => document.getElementById("calcAsk").addEventListener("click", (e) => e.preventDefault(), true));
  await page.click("#calcAsk");
  const ev = (await page.evaluate(() => window.__ev)).find((e) => e.name === "race_quote");
  assert(ev && ev.size === "0" && ev.runners === 20000 && ev.boxes === 102, "กดขอราคา → event race_quote บันทึกเบอร์ จำนวนคน และจำนวนกล่อง");
  assert(await page.$eval("table.run-cmp", (t) => t.parentElement.scrollWidth <= t.parentElement.clientWidth + 1), "ตารางเทียบเบอร์ 0 กับ 2 พอดีจอมือถือ 390px");
  await page.close();
}

/* ---- เข็มกลัดตราสิงโต: ทุกหน้าอ่านจาก data/pins.json และส่วนที่ไม่มีข้อมูลต้องไม่แสดง ---- */
console.log("\n[ ข้อมูลเข็มกลัด data/pins.json ]");
{
  const L = await import(new URL("../_gen-pins-lib.mjs", import.meta.url));
  const read = (f) => readFileSync(join(ROOT, f), "utf8");
  const hub = read("products/safety-pins.html"), whole = read("products/safety-pins-wholesale.html"), run = read("products/safety-pins-running.html");
  const bad = [];
  for (const p of L.PINS) {
    const pg = read(`products/safety-pins-${p.no}.html`), ps = L.packStr(p);
    if (!pg.includes(`~${ps} ตัว`)) bad.push(`หน้าเบอร์ ${p.no} ไม่มี "${ps}"`);
    if (!new RegExp(`safety-pins-${p.no}\\.html"><b>${p.no}</b></a></td><td>${p.mm}</td><td>${p.cm}</td><td>[^<]*</td><td>${ps}</td>`).test(hub)) bad.push(`ตารางหน้ารวม เบอร์ ${p.no}`);
    if (!new RegExp(`safety-pins-${p.no}\\.html">${p.no}</a></b>[^<]*(<span[^>]*>[^<]*</span>)?</td><td[^>]*>${p.mm} มม\\.</td><td[^>]*>${p.wire} มม\\.</td><td>${ps}`).test(whole)) bad.push(`ตารางขายส่ง เบอร์ ${p.no}`);
    if (!pg.includes(`"@id":"${L.BRAND.id}"`)) bad.push(`หน้าเบอร์ ${p.no} ไม่อ้าง Brand @id`);
  }
  assert(!bad.length, "จำนวนต่อกล่อง/ขนาดทุกหน้าตรง data/pins.json และหน้าเบอร์อ้าง Brand" + (bad.length ? " → " + bad.slice(0, 4).join(" | ") : ""));
  const pdm = run.match(/window\.PINS_DATA=(\{[\s\S]*?\});<\/script>/);
  const pd = pdm ? JSON.parse(pdm[1]) : null;
  assert(pd && L.PINS.every((p) => pd.sizes[p.no] && pd.sizes[p.no].pack.min === p.pack.min), "เครื่องคำนวณงานวิ่งได้จำนวนต่อกล่องจาก data/pins.json");
  /* ไม่มีราคาใน pins.json → ห้ามมีตารางราคา/Offer โผล่ */
  const priced = L.PINS.filter(L.hasPrice).map((p) => p.no);
  const pinFiles = execSync("git ls-files 'products/safety-pins*.html'", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
  const leak = pinFiles.filter((f) => { const h = read(f); const no = (f.match(/safety-pins-(\w+)\.html/) || [])[1];
    return (/class="(cmp|box) price"/.test(h) && !priced.length) || (/"offers"/.test(h) && !priced.includes(no)); });
  assert(!leak.length, `ไม่มีตารางราคาหรือ Offer ในหน้าที่ pins.json ยังไม่มีราคา (เบอร์ที่มีราคา: ${priced.length ? priced.join(",") : "ไม่มี"})` + (leak.length ? " → " + leak.join(", ") : ""));
  const noStrip = pinFiles.filter((f) => !f.includes("lion-brand") && !read(f).includes('class="origin-strip"'));
  assert(!noStrip.length, "ทุกหน้าเข็มกลัดมีแถบซื้อตรงจากต้นทาง" + (noStrip.length ? " → " + noStrip.join(", ") : ""));
  const brandPage = read("products/safety-pins-lion-brand.html");
  assert(brandPage.includes(`"@type": "Brand"`) && brandPage.includes(`"@id": "${L.BRAND.id}"`), "หน้าแบรนด์มี Brand schema พร้อม @id");
  assert(read("index.html").includes(`"brand": { "@id": "${L.BRAND.id}" }`) || read("index.html").includes(`"brand": {"@id": "${L.BRAND.id}"}`), "Store schema หน้าแรกอ้าง Brand ตราสิงโต");
  for (const f of ["products/safety-pins.html", "products/safety-pins-wholesale.html", "products/safety-pins-running.html", "products/safety-pins-lion-brand.html"])
    assert(L.fillPinMarkers(read(f), { base: "../", from: "x" }).replace(/\(จากหน้า[^)]*\)/g, "") === read(f).replace(/\(จากหน้า[^)]*\)/g, ""), `${f} ตรง data/pins.json (ไม่ค้างเวอร์ชันเก่า)`);
  /* ท่อราคาทำงานเมื่อมีข้อมูล (ทดสอบด้วยค่าสมมติในหน่วยความจำ ไม่แตะไฟล์) */
  const fake = { ...L.PINS[4], price: { box: 500, gross: null, bunch: null, packet: null }, tier: { min_boxes: 10, box: 450 }, in_stock: true };
  const t = L.priceTableOne(fake, "ทดสอบ");
  assert(/฿500/.test(t) && /฿0\.58/.test(t) && /tier/.test(t) && /฿450/.test(t), "ตารางราคารายเบอร์คำนวณราคาต่อตัวและราคาขั้นบันไดถูกต้อง");
  const of = L.offerFor(fake, "https://x/"); const none = L.offerFor(L.PINS[4], "https://x/");
  assert(of && of.price === 500 && of.availability === "https://schema.org/InStock" && none === null, "Offer schema มีเฉพาะเมื่อมีราคา และบอกสถานะสต็อก");
  assert(L.stockBadge(L.PINS[4]) === "" && /พร้อมส่ง/.test(L.stockBadge(fake)), "ป้ายสต็อกแสดงเฉพาะเมื่อ in_stock ไม่ใช่ null");
  assert(L.shippingHTML() === "" || L.DATA.shipping, "ไม่มีนโยบายค่าส่งใน pins.json → ไม่แสดงบล็อกค่าส่ง");
}

/* ---- tag ใดก็ตามต้องไม่มีแอตทริบิวต์ซ้ำ (เบราว์เซอร์ใช้ตัวแรก ตัวหลังหายเงียบ) ---- */
console.log("\n[ แอตทริบิวต์ซ้ำ ]");
{
  // execSync import ที่หัวไฟล์
  const files = execSync("git ls-files '*.html'", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
  const dup = [];
  for (const f of files) {
    const html = readFileSync(join(ROOT, f), "utf8").replace(/<script\b[\s\S]*?<\/script>/g, "");
    for (const m of html.matchAll(/<[a-zA-Z][a-zA-Z0-9]*((?:\s+[^\s=>/]+(?:="[^"]*"|='[^']*')?)*)\s*\/?>/g)) {
      const names = [...m[1].matchAll(/\s+([^\s=>/]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g)].map((x) => x[1].toLowerCase());
      const d = names.find((n, i) => names.indexOf(n) !== i);
      if (d) { dup.push(`${f}: ${d}`); break; }
    }
  }
  assert(!dup.length, `ไม่มีแอตทริบิวต์ซ้ำใน tag (${files.length} ไฟล์)` + (dup.length ? " → " + dup.slice(0, 5).join(" | ") : ""));
}

/* ---- หน้าอังกฤษ /en (สร้างโดย _gen-en.mjs) ---- */
console.log("\n[ หน้าอังกฤษ /en ]");
{
  const EN = await import(new URL("../_gen-en.mjs", import.meta.url));
  const META = JSON.parse(readFileSync(join(ROOT, "data/en-meta.json"), "utf8"));
  const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  const enLocs = [...sitemap.matchAll(/<loc>https:\/\/mtthardware\.com(\/en[^<]*)<\/loc>/g)].map((m) => m[1]);
  const thPages = EN.enPages();
  assert(enLocs.length === thPages.length && thPages.length >= 25, `sitemap มีหน้าอังกฤษครบคู่กับหน้าไทย (${enLocs.length}/${thPages.length})`);
  const stale = [], leftover = [], noAlt = [];
  for (const u of thPages) {
    const thRaw = readFileSync(join(ROOT, EN.urlToFile(u)), "utf8");
    const enRaw = readFileSync(join(ROOT, "en", EN.urlToFile(u)), "utf8");
    if (EN.buildEn(EN.thHead(thRaw, u), u, META) !== enRaw || EN.thHead(thRaw, u) !== thRaw) stale.push(u);
    if (EN.thaiLeft(enRaw).length) leftover.push(u);
    if (!thRaw.includes(`hreflang="en" href="https://mtthardware.com${EN.enUrl(u)}"`)) noAlt.push(u);
  }
  assert(!stale.length, "หน้าอังกฤษตรงกับหน้าไทยล่าสุด (ไม่ค้างเวอร์ชันเก่า)" + (stale.length ? " → " + stale.join(", ") + " · รัน npm run bake" : ""));
  assert(!leftover.length, "หน้าอังกฤษไม่มีข้อความไทยที่ยังไม่แปล" + (leftover.length ? " → " + leftover.join(", ") : ""));
  assert(!noAlt.length, "หน้าไทยมี hreflang ชี้หน้าอังกฤษ" + (noAlt.length ? " → " + noAlt.join(", ") : ""));
  const skipHasAlt = /hreflang=/.test(readFileSync(join(ROOT, "products/tools-wrenches.html"), "utf8"));
  assert(!skipHasAlt, "แคตตาล็อกเครื่องมือรายหมวด (ยังไม่มีฉบับอังกฤษ) ไม่ประกาศ hreflang");

  /* เปิดจริงทุกหน้า: ไม่มี JS error, รูปทุกรูปโหลดได้, ลิงก์ภายในไม่หลุดไปโฟลเดอร์ /en ที่ไม่มีไฟล์ */
  const errs = [], badImg = [], badLink = [];
  for (const u of enLocs) {
    const page = await newPage({ width: 390, height: 844 });
    page.on("pageerror", (e) => errs.push(u + ": " + e.message));
    await page.goto(base + u, { waitUntil: "load" });
    await page.waitForTimeout(250);
    const r = await page.evaluate(async () => {
      const imgs = [...document.images].map((i) => i.currentSrc || i.src).filter((s) => s.startsWith(location.origin));
      const links = [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin + "/en"));
      const st = async (x) => (await fetch(x, { method: "HEAD" })).status;
      const bi = []; for (const x of [...new Set(imgs)]) if (await st(x) !== 200) bi.push(x);
      const bl = []; for (const x of [...new Set(links.map((h) => h.split("#")[0]))]) if (await st(x) !== 200) bl.push(x);
      return { lang: document.documentElement.lang, bi, bl };
    });
    if (r.lang !== "en") errs.push(u + ": lang=" + r.lang);
    badImg.push(...r.bi.map((x) => u + " → " + x)); badLink.push(...r.bl.map((x) => u + " → " + x));
    await page.close();
  }
  assert(!errs.length, `เปิดหน้าอังกฤษ ${enLocs.length} หน้า ไม่มี JS error และ lang=en` + (errs.length ? " → " + errs.slice(0, 3).join(" | ") : ""));
  assert(!badImg.length, "รูปในหน้าอังกฤษโหลดได้ทุกรูป" + (badImg.length ? " → " + badImg.slice(0, 3).join(" | ") : ""));
  assert(!badLink.length, "ลิงก์ /en ทุกตัวมีหน้าจริง" + (badLink.length ? " → " + badLink.slice(0, 3).join(" | ") : ""));

  /* ปุ่มภาษา: หน้าที่มีคู่ → ไปอีก URL · หน้าที่ไม่มีคู่ → สลับในหน้าเดิม */
  {
    const page = await newPage({ width: 1280, height: 900 });
    await page.goto(base + "/products/jet-lighter.html", { waitUntil: "load" });
    await Promise.all([page.waitForURL("**/en/products/jet-lighter.html"), page.click(".lang button[data-lang=en]")]);
    assert(page.url().endsWith("/en/products/jet-lighter.html"), "กด EN ในหน้าไทย → ไปหน้า /en/products/jet-lighter.html");
    await page.waitForTimeout(200);
    await page.click(".add");
    await page.waitForTimeout(150);
    assert(/Large 1 pc/.test(await page.evaluate(() => buildOrderText())), "ตะกร้าในหน้าอังกฤษสรุปออเดอร์เป็นภาษาอังกฤษ");
    await page.goto(base + "/products/safety-pins.html", { waitUntil: "load" });
    assert(page.url().endsWith("/en/products/safety-pins.html"), "เคยเลือก EN ไว้ → เปิดหน้าไทยแล้วพาไปหน้าอังกฤษ");
    await Promise.all([page.waitForURL("**/products/safety-pins.html"), page.click(".lang button[data-lang=th]")]);
    assert(!page.url().includes("/en/"), "กด TH ในหน้าอังกฤษ → กลับหน้าไทย");
    await page.close();
  }
  {
    const page = await newPage({ width: 1280, height: 900 });
    await page.goto(base + "/products/tools-wrenches.html", { waitUntil: "load" });
    await page.click(".lang button[data-lang=en]");
    await page.waitForTimeout(200);
    assert(page.url().endsWith("/products/tools-wrenches.html") && (await page.evaluate(() => document.documentElement.lang)) === "en",
      "หน้าที่ยังไม่มีฉบับอังกฤษ กด EN แล้วสลับภาษาในหน้าเดิม");
    await page.close();
  }
  {
    const page = await newPage({ width: 1280, height: 900 });
    await page.goto(base + "/en", { waitUntil: "load" });
    const hrefs = await page.$$eval("#featGrid a", (as) => as.map((a) => a.getAttribute("href")));
    assert(hrefs.length >= 4 && hrefs.filter((h) => h.startsWith("/en/")).length >= 3 && hrefs.includes("/products/mtt-brand.html"),
      "การ์ดหน้าแรกอังกฤษ (วาดด้วย JS) ชี้ /en ส่วนหน้าตรา M.T.T. ชี้หน้าไทย");
    await page.close();
  }
}

await browser.close();
server.close();

console.log("\n" + (fails.length ? "❌ FAILED: " + fails.length + " ข้อ\n - " + fails.join("\n - ") : "✅ ผ่านทั้งหมด"));
process.exit(fails.length ? 1 : 0);
