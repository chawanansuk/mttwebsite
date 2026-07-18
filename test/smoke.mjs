/* ============================================================
   Smoke test — โหลดทุกหน้า ตรวจ JS error, ตะกร้า, QR, สลับภาษา,
   และการจำค่าตะกร้า (localStorage)  รันด้วย: npm test
   ============================================================ */
import pw from "playwright";
const { chromium } = pw;
import http from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";

const ROOT = resolve(process.argv[2] || ".");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };

// ยอมรับ error จากทรัพยากรภายนอกที่บล็อกใน CI (ฟอนต์ / Vercel insights)
const IGNORE = [/fonts\.g/i, /_vercel/i, /favicon\.ico/i, /net::ERR/i, /Failed to load resource/i];
function ignorable(t) { return IGNORE.some((r) => r.test(t)); }

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

const browser = await chromium.launch();

async function newPage() {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !ignorable(m.text())) errs.push("CONSOLE: " + m.text()); });
  return { page, errs };
}

/* ---- หน้าแรก ---- */
console.log("\n[ index.html ]");
{
  const { page, errs } = await newPage();
  await page.goto(base + "/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  assert(errs.length === 0, "ไม่มี JS error" + (errs.length ? " → " + errs.join(" | ") : ""));
  assert((await page.$$eval("#catGrid .cat", (e) => e.length)) === 6, "แสดงหมวดหมู่ครบ 6");
  assert((await page.$$eval("#featGrid .prod", (e) => e.length)) === 4, "แสดงสินค้าเด่น 4 การ์ด");
  assert((await page.$eval("#hvPrice", (e) => e.textContent)).includes("฿"), "ราคา hero มาจาก catalog");
  assert(await page.$(".site-header .brand"), "header ถูกฉีด");
  assert(await page.$(".site-footer"), "footer ถูกฉีด");
  await page.click(".lang button[data-lang=en]");
  await page.waitForTimeout(200);
  assert((await page.$eval('.nav-links a[data-nav=home]', (e) => e.textContent)) === "Home", "สลับเป็น EN ได้");
  await page.close();
}

/* ---- หน้ารวมสินค้า ---- */
console.log("\n[ products/index.html ]");
{
  const { page, errs } = await newPage();
  await page.goto(base + "/products/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  assert(errs.length === 0, "ไม่มี JS error" + (errs.length ? " → " + errs.join(" | ") : ""));
  const total = await page.$$eval("#pgrid .prod", (e) => e.length);
  assert(total === 4, "แสดงสินค้าทั้งหมด 4 (ก่อนกรอง)");
  await page.click('.fchip:has-text("ไฟฟู่")').catch(() => {});
  await page.waitForTimeout(200);
  assert((await page.$$eval("#pgrid .prod", (e) => e.length)) === 1, "กรองหมวดไฟฟู่เหลือ 1");
  await page.close();
}

/* ---- หน้าไฟฟู่: ตะกร้า + QR + จำค่า ---- */
console.log("\n[ products/jet-lighter.html ]");
{
  const { page, errs } = await newPage();
  await page.goto(base + "/products/jet-lighter.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  assert(errs.length === 0, "ไม่มี JS error" + (errs.length ? " → " + errs.join(" | ") : ""));
  assert((await page.$eval("#heroFrom", (e) => e.textContent)).includes("฿"), "ราคาเริ่มต้นจาก catalog");
  assert((await page.$$eval(".pcard .save", (e) => e.length)) >= 2, "มี badge ประหยัด % อย่างน้อย 2");
  await page.click(".add");
  await page.waitForTimeout(300);
  assert((await page.$eval("#cartAmt", (e) => e.textContent)) === "฿59", "เพิ่มลงตะกร้า ยอด ฿59");
  assert(!!(await page.$("#qrcode canvas, #qrcode img")), "สร้าง QR สำเร็จ");
  assert((await page.$eval("#cartBadge", (e) => e.textContent)) === "1", "badge ตะกร้าบน header = 1");
  assert(await page.$eval("#orderForm", (e) => getComputedStyle(e).display !== "none"), "ฟอร์มที่อยู่แสดงเมื่อมีของ");
  // จำค่า: reload แล้วตะกร้าต้องยังอยู่
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  assert((await page.$eval("#cartAmt", (e) => e.textContent)) === "฿59", "ตะกร้าจำค่าไว้หลัง reload");
  await page.close();
}

await browser.close();
server.close();

console.log("\n" + (fails.length ? "❌ FAILED: " + fails.length + " ข้อ" : "✅ ผ่านทั้งหมด"));
process.exit(fails.length ? 1 : 0);
