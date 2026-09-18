/* สร้าง sitemap.xml จากไฟล์จริง — lastmod เอาจากวันที่ commit ล่าสุดของไฟล์ (ไฟล์ที่แก้ค้างอยู่ = วันนี้)
   รันด้วย: node _gen-sitemap.mjs  (อยู่ใน npm run gen)
   เดิมแก้มือแล้วลืมอัปเดต 24/41 URL เก่ากว่าของจริง Google จะเลิกเชื่อ lastmod ทั้งไฟล์ */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "fs";

const SITE = "https://mtthardware.com";
const today = new Date().toISOString().slice(0, 10);
const dirty = new Set(execSync("git status --porcelain", { encoding: "utf8" }).split("\n").map((l) => l.slice(3).trim()).filter(Boolean));
const lastmod = (f) => dirty.has(f) ? today : (execSync(`git log -1 --format=%cs -- "${f}"`, { encoding: "utf8" }).trim() || today);

/* priority/changefreq ตามบทบาทของหน้า */
const rule = (f) => {
  if (f === "index.html") return ["weekly", "1.0"];
  if (f === "privacy.html") return ["yearly", "0.2"];
  if (/^products\/(index|tools|safety-pins|jet-lighter|mtt-brand)\.html$/.test(f)) return ["weekly", "0.9"];
  if (/^products\/tools-/.test(f)) return ["monthly", "0.8"];
  if (/^products\//.test(f)) return ["monthly", "0.7"];
  if (/^articles\//.test(f)) return ["monthly", "0.6"];
  return ["monthly", "0.5"];
};
const loc = (f) => f === "index.html" ? `${SITE}/` : f === "products/index.html" ? `${SITE}/products` : `${SITE}/${f}`;

const files = globSync("{index,privacy}.html").concat(globSync("products/*.html"), globSync("articles/*.html")).sort();
const urls = files.map((f) => {
  const [cf, pr] = rule(f);
  return `  <url>\n    <loc>${loc(f)}</loc>\n    <lastmod>${lastmod(f)}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`;
});
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
console.log(`sitemap.xml: ${files.length} URL`);
