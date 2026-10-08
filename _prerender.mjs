/* ============================================================
   _prerender.mjs — เอาการ์ดที่ JS วาด (หมวดหมู่/สินค้าเด่นหน้าแรก, รายการสินค้า /products)
   มาเขียนลง HTML ดิบ ให้บอตที่ไม่รัน JS และหน้า /en เห็นของจริงตรงกับ catalog.js เสมอ
   เดิม HTML ดิบเป็นสำเนาที่ก๊อปไว้ด้วยมือ แก้ catalog แล้วสำเนาไม่ตาม
   รัน: node _prerender.mjs [--check]   (ต้องมี Chromium: CHROMIUM_PATH หรือ playwright ที่ติดตั้งแล้ว)
   ============================================================ */
import pw from "playwright";
import http from "http";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";

const TARGETS = [
  { file: "index.html", url: "/index.html", ids: ["featGrid"] },
  { file: "products/index.html", url: "/products/index.html", ids: ["pgrid"] },
];
const CHECK = process.argv.includes("--check");

/* แทนเนื้อในของ <div id="..."> (นับ div ที่ซ้อนอยู่) */
export function replaceInner(html, id, inner) {
  const open = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  if (!open) throw new Error(`ไม่พบ #${id}`);
  const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = open.index + open[0].length;
  let depth = 1, m;
  while (depth && (m = re.exec(html))) depth += m[1] ? -1 : 1;
  if (depth) throw new Error(`#${id} ไม่มี </div> ปิด`);
  return html.slice(0, open.index + open[0].length) + inner + html.slice(m.index);
}

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".svg": "image/svg+xml", ".png": "image/png" };
const srv = http.createServer((q, res) => {
  const f = join(process.cwd(), decodeURIComponent(q.url.split("?")[0]));
  if (existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { "Content-Type": MIME[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f)); }
  else { res.writeHead(404); res.end(); }
});
await new Promise((r) => srv.listen(0, r));
const base = "http://localhost:" + srv.address().port;
const br = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const stale = [];
try {
  for (const t of TARGETS) {
    const ctx = await br.newContext();
    await ctx.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(base + t.url, { waitUntil: "load" });
    let html = readFileSync(t.file, "utf8");
    for (const id of t.ids) {
      const inner = await page.$eval("#" + id, (e) => e.innerHTML);
      html = replaceInner(html, id, inner);
    }
    await ctx.close();
    if (html === readFileSync(t.file, "utf8")) continue;
    if (CHECK) stale.push(t.file); else { writeFileSync(t.file, html); console.log("prerender", t.file); }
  }
} finally { await br.close(); srv.close(); }
if (CHECK && stale.length) { console.error("การ์ดใน HTML ดิบไม่ตรงกับ catalog.js — รัน node _prerender.mjs:\n  " + stale.join("\n  ")); process.exit(1); }
