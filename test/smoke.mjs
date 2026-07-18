/* ============================================================
   Smoke test — โหลดทุกหน้า ตรวจ JS error, ตะกร้า, QR, สลับภาษา,
   จำค่า, overflow แนวนอน (มือถือ), ขนาดไอคอน, toast/CTA
   รันด้วย: npm test
   ============================================================ */
import pw from "playwright";
const { chromium } = pw;
import http from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";

const ROOT = resolve(process.argv[2] || ".");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };
const IGNORE = [/fonts\.g/i, /_vercel/i, /favicon\.ico/i, /net::ERR/i, /Failed to load resource/i];
const ignorable = (t) => IGNORE.some((r) => r.test(t));

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  let f = join(ROOT, p);
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
function assert(cond, msg) { if (cond) log("✓ " + msg); else { fails.push(msg); log("✗ " + msg); } }

process.on("unhandledRejection", (e) => { console.error("\n❌ UNHANDLED: " + (e && e.message || e)); process.exit(1); });

const browser = await chromium.launch();
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

const ALL_PAGES = ["/index.html", "/products/index.html", "/products/jet-lighter.html", "/privacy.html", "/404.html"];

/* ---- โหลดได้ ไม่มี JS error ทุกหน้า ---- */
console.log("\n[ โหลดทุกหน้า ]");
for (const path of ALL_PAGES) {
  const page = await newPage();
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(180);
  assert(page.__errs.length === 0, path + " ไม่มี JS error" + (page.__errs.length ? " → " + page.__errs.join(" | ") : ""));
  assert(!!(await page.$(".site-header .brand")), path + " header ถูกฉีด");
  await page.close();
}

/* ---- ไม่มี overflow แนวนอนบนมือถือ (BUG-1 guard) ---- */
console.log("\n[ ไม่มี overflow แนวนอน @360/390 ]");
for (const w of [360, 390]) {
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
  assert((await page.$$eval("#catGrid .cat", (e) => e.length)) === 6, "แสดงหมวดหมู่ครบ 6");
  assert((await page.$$eval("#featGrid .prod", (e) => e.length)) === 4, "แสดงสินค้าเด่น 4 การ์ด");
  assert((await page.$eval("#hvPrice", (e) => e.textContent)).includes("฿"), "ราคา hero มาจาก catalog");
  const iconW = await page.$eval("#why .why-grid .ic svg", (e) => Math.round(e.getBoundingClientRect().width));
  assert(iconW > 0 && iconW < 40, `ไอคอน 'ทำไมต้องเรา' ขนาดปกติ (${iconW}px, ต้อง < 40)`);
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
  assert((await p2.$eval(".hero h1", (e) => e.textContent)).includes("all in one"), "เปิดหน้าใหม่แสดง EN ถูกต้อง (จำภาษาได้)");
  await p2.close();
  await ctx.close();
}

/* ---- หน้ารวมสินค้า ---- */
console.log("\n[ products/index.html ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  assert((await page.$$eval("#pgrid .prod", (e) => e.length)) === 4, "แสดงสินค้าทั้งหมด 4 (ก่อนกรอง)");
  await page.click('.fchip:has-text("ไฟฟู่")').catch(() => {});
  await page.waitForTimeout(200);
  assert((await page.$$eval("#pgrid .prod", (e) => e.length)) === 1, "กรองหมวดไฟฟู่เหลือ 1");
  await page.close();
}

/* ---- หน้าไฟฟู่: ตะกร้า + QR + จำค่า + toast ---- */
console.log("\n[ products/jet-lighter.html ]");
{
  const page = await newPage({ width: 1280, height: 900 });
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  assert((await page.$eval("#heroFrom", (e) => e.textContent)).includes("฿"), "ราคาเริ่มต้นจาก catalog");
  assert((await page.$$eval(".pcard .save", (e) => e.length)) >= 2, "มี badge ประหยัด % อย่างน้อย 2");
  await page.click(".add");
  await page.waitForTimeout(180);
  assert((await page.$eval("#cartAmt", (e) => e.textContent)) === "฿59", "เพิ่มลงตะกร้า ยอด ฿59");
  assert(!!(await page.$("#qrcode canvas, #qrcode img")), "สร้าง QR สำเร็จ");
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

await browser.close();
server.close();

console.log("\n" + (fails.length ? "❌ FAILED: " + fails.length + " ข้อ\n - " + fails.join("\n - ") : "✅ ผ่านทั้งหมด"));
process.exit(fails.length ? 1 : 0);
