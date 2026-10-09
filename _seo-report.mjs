/* ============================================================
   _seo-report.mjs — ตรวจหน้าเป้าหมายของคำค้นใน data/seo-targets.json (npm run seo)
   ตรวจจาก HTML ที่ generate แล้ว: title ไม่เกิน 62 ตัวอักษร, มี meta description, canonical ตรง URL,
   มี JSON-LD ชนิดที่กำหนด, และคำค้น (ทุกคำย่อย) อยู่ใน h1 หรือย่อหน้าแรกของเนื้อหา
   ไม่ได้วัดอันดับ Google — ตัวเลขอันดับ/คลิกต้องดูจาก Search Console (docs/seo-baseline.md)
   รัน: node _seo-report.mjs [--json]   exit 1 ถ้ามีข้อไม่ผ่าน
   ============================================================ */
import { readFileSync, existsSync } from "fs";

const SITE = "https://mtthardware.com";
const T = JSON.parse(readFileSync(new URL("./data/seo-targets.json", import.meta.url), "utf8"));

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const text = (h) => unesc(String(h || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
/* ไทยไม่เว้นวรรคระหว่างคำ: เทียบแบบตัดช่องว่างทิ้ง และไม่สนตัวพิมพ์เล็ก-ใหญ่ */
const norm = (s) => s.toLowerCase().replace(/\s+/g, "");

export function fileOf(url) {
  if (url === "/") return "index.html";
  return url.replace(/^\//, "");
}

function ldTypes(html) {
  const types = new Set();
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      const t = o["@type"]; (Array.isArray(t) ? t : t ? [t] : []).forEach((x) => types.add(x));
      Object.values(o).forEach(walk);
    }
  };
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { walk(JSON.parse(m[1])); } catch { types.add("!JSON_ERROR"); }
  }
  return types;
}

/* h1 + ย่อหน้าแรกหลัง h1 (ข้าม breadcrumb/eyebrow ซึ่งไม่ใช่ <p>) */
function leadText(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
  const h1m = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const after = h1m ? main.slice(h1m.index + h1m[0].length) : main;
  /* ข้ามบรรทัดผู้เขียน/วันที่ของบทความ (p.art-meta) ซึ่งไม่ใช่ย่อหน้าเนื้อหา */
  const pm = [...after.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)].map((m) => [m[0], m[2], m[1]]).find((m) => !/art-meta|crumbs/.test(m[2]));
  return { h1: text(h1m && h1m[1]), p: text(pm && pm[1]) };
}

export function checkTarget(t) {
  const file = fileOf(t.url);
  const r = { kw: t.kw, group: t.group, url: t.url, ok: true, fails: [] };
  const fail = (k, why) => { r.ok = false; r.fails.push(`${k}: ${why}`); };
  if (!existsSync(file)) { fail("page", "ยังไม่มีหน้านี้"); return r; }
  const html = readFileSync(file, "utf8");
  const title = text((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
  r.titleLen = title.length;
  if (!title) fail("title", "ไม่มี"); else if (title.length > 62) fail("title", `${title.length} ตัวอักษร (เกิน 62)`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  if (!desc.trim()) fail("description", "ไม่มี");
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
  const want = t.url === "/" ? `${SITE}/` : `${SITE}${t.url}`;
  if (canon !== want) fail("canonical", canon ? `ชี้ ${canon}` : "ไม่มี");
  const types = ldTypes(html);
  if (types.has("!JSON_ERROR")) fail("schema", "JSON-LD อ่านไม่ได้");
  const missing = (t.schema || []).filter((s) => !types.has(s));
  if (missing.length) fail("schema", `ขาด ${missing.join(", ")}`);
  const { h1, p } = leadText(html);
  const hay = norm(`${h1} ${p} ${title}`.replace(/\./g, ""));
  const variants = [t.kw, ...(t.also || [])];
  const hit = variants.some((v) => v.split(/\s+/).every((tok) => hay.includes(norm(tok.replace(/\./g, "")))));
  /* คำค้นต้องอยู่ใน h1 หรือย่อหน้าแรก — title นับด้วยเพราะ Google ใช้เป็นหัวข้อผลค้นหา แต่ถ้ามีแค่ใน title ให้เตือน */
  const inBody = variants.some((v) => v.split(/\s+/).every((tok) => norm(`${h1} ${p}`.replace(/\./g, "")).includes(norm(tok.replace(/\./g, "")))));
  if (!hit) fail("keyword", "ไม่อยู่ใน title, h1 หรือย่อหน้าแรก");
  else if (!inBody) fail("keyword", "อยู่แค่ใน title ไม่อยู่ใน h1/ย่อหน้าแรก");
  return r;
}

export function runAll() { return T.targets.map(checkTarget); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runAll();
  if (process.argv.includes("--json")) { console.log(JSON.stringify(res, null, 2)); process.exit(res.every((r) => r.ok) ? 0 : 1); }
  const pad = (s, n) => { s = String(s); return s + " ".repeat(Math.max(0, n - [...s].length)); };
  console.log(`คำค้นเป้าหมาย ${res.length} คำ (เริ่มติดตาม ${T.started})\n`);
  for (const g of Object.keys(T.groups)) {
    console.log(`[ ${T.groups[g]} ]`);
    for (const r of res.filter((x) => x.group === g)) {
      console.log(`  ${r.ok ? "✓" : "✗"} ${pad(r.kw, 28)} ${pad(r.url, 44)} ${r.ok ? "" : r.fails.join(" · ")}`);
    }
  }
  const bad = res.filter((r) => !r.ok).length;
  console.log(`\n${bad ? `❌ ไม่ผ่าน ${bad} จาก ${res.length}` : `✅ ผ่านทั้ง ${res.length} คำ`}`);
  console.log("หมายเหตุ: สคริปต์นี้ตรวจความพร้อมของหน้าเว็บเรา ไม่ได้วัดอันดับ Google — อันดับและคลิกดูจาก Search Console");
  process.exit(bad ? 1 : 0);
}
