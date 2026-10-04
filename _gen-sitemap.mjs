/* สร้าง sitemap.xml จากไฟล์จริง — lastmod เอาจากวันที่ commit ล่าสุดของไฟล์ (ไฟล์ที่แก้ค้างอยู่ = วันนี้)
   รันด้วย: node _gen-sitemap.mjs  (อยู่ใน npm run gen)
   เดิมแก้มือแล้วลืมอัปเดต 24/41 URL เก่ากว่าของจริง Google จะเลิกเชื่อ lastmod ทั้งไฟล์ */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "fs";
import { hasEn, enUrl } from "./_gen-en.mjs";

const SITE = "https://mtthardware.com";
const today = new Date().toISOString().slice(0, 10);
const dirty = new Set(execSync("git status --porcelain", { encoding: "utf8" }).split("\n").map((l) => l.slice(3).trim()).filter(Boolean));
/* บทความใช้วันที่แก้เนื้อหาจริงจาก data/articles.json (ตรงกับวันที่บนหน้าและใน schema)
   ไม่ใช้วันที่ commit เพราะการแก้ header/footer ร่วมทั้งเว็บไม่ได้แปลว่าบทความถูกแก้ */
const ART = Object.fromEntries(JSON.parse(readFileSync("data/articles.json", "utf8")).articles.map((a) => [`articles/${a.slug}.html`, a.modified]));
const ART_NEWEST = Object.values(ART).sort().at(-1);
const lastmod = (f) => ART[f] || (f === "articles/index.html" ? ART_NEWEST : null)
  || (dirty.has(f) ? today : (execSync(`git log -1 --format=%cs -- "${f}"`, { encoding: "utf8" }).trim() || today));

/* priority/changefreq ตามบทบาทของหน้า */
const rule = (f) => {
  if (f === "index.html") return ["weekly", "1.0"];
  if (f === "privacy.html") return ["yearly", "0.2"];
  if (/^products\/(index|tools|safety-pins|jet-lighter|mtt-brand)\.html$/.test(f)) return ["weekly", "0.9"];
  if (/^products\/tools-/.test(f)) return ["monthly", "0.8"];
  if (/^products\//.test(f)) return ["monthly", "0.7"];
  if (f === "articles/index.html") return ["weekly", "0.7"];
  if (/^articles\//.test(f)) return ["monthly", "0.6"];
  return ["monthly", "0.5"];
};
const loc = (f) => f === "index.html" ? `${SITE}/` : /^(products|articles)\/index\.html$/.test(f) ? `${SITE}/${f.split("/")[0]}` : `${SITE}/${f}`;

const files = globSync("{index,privacy}.html").concat(globSync("products/*.html"), globSync("articles/*.html")).sort();
/* หน้าที่มีฉบับอังกฤษ (/en/...): ทั้งสองภาษาประกาศ hreflang หากันใน sitemap ด้วย */
const entry = (u, mod, cf, pr, alt) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${mod}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n${alt}  </url>`;
const alts = (u) => ["th", u, "en", enUrl(u), "x-default", u].reduce((s, v, k, a) => k % 2 ? s : s + `    <xhtml:link rel="alternate" hreflang="${v}" href="${SITE}${a[k + 1]}"/>\n`, "");
let n = 0;
const urls = files.flatMap((f) => {
  const [cf, pr] = rule(f); const u = loc(f).slice(SITE.length) || "/"; const mod = lastmod(f);
  if (!hasEn(u)) { n++; return [entry(u, mod, cf, pr, "")]; }
  n += 2;
  return [entry(u, mod, cf, pr, alts(u)), entry(enUrl(u), mod, cf, pr, alts(u))];
});
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
console.log(`sitemap.xml: ${n} URL`);
