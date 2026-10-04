/* ============================================================
   _gen-en.mjs — สร้างหน้าภาษาอังกฤษที่มี URL ของตัวเอง (/en/...) จากหน้าไทยที่ bake แล้ว
   - ทุกข้อความในเว็บมี data-th/data-en อยู่แล้ว (layout.js ใช้สลับภาษาในเบราว์เซอร์)
     ไฟล์นี้เอา data-en มาเขียนลง HTML ตรง ๆ → Google เห็นเนื้อหาอังกฤษจริง
   - title / meta description ภาษาอังกฤษอยู่ที่ data/en-meta.json (ทุกหน้าต้องมี ไม่งั้น build ล้ม)
   - หน้าไทยได้ <link rel="alternate" hreflang> ชี้หากัน + สคริปต์พาไปภาษาที่ผู้ใช้เลือกไว้
   - ถ้าหน้าอังกฤษยังมีข้อความไทยที่ไม่ได้แปล build จะล้มพร้อมรายการ (ชื่อร้าน/ที่อยู่ไทยยกเว้นไว้)
   รัน: node _gen-en.mjs [--report]   (รันหลัง _chrome.mjs เสมอ — npm run gen / bake จัดลำดับให้แล้ว)
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

export const SITE = "https://mtthardware.com";
/* หน้าที่ยังไม่มีฉบับอังกฤษ: แคตตาล็อกเครื่องมือรายหมวดและหน้าตรา M.T.T.
   ชื่อสินค้า/กลุ่ม/วัสดุราว 2,200 รายการยังไม่มีคำแปล — ต้องตรงกับ pageHref() ใน assets/js/catalog.js */
export const EN_SKIP = /^\/products\/(tools-|mtt-brand)/;
export const hasEn = (u) => !u.startsWith("/en") && u !== "/404.html" && !EN_SKIP.test(u);
export const enUrl = (u) => u === "/" ? "/en" : "/en" + u;
export const urlToFile = (u) => u === "/" ? "index.html" : u === "/products" ? "products/index.html" : u === "/articles" ? "articles/index.html" : u.slice(1);
/* หน้าไทยทั้งหมดที่จะมีฉบับอังกฤษ (อ่านจาก sitemap ที่ _gen-sitemap.mjs สร้าง) */
export const enPages = () => [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>https:\/\/mtthardware\.com(\/[^<]*)<\/loc>/g)]
  .map((m) => m[1]).filter(hasEn);

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const THAI = /[฀-฾เ-๿]/; /* ไม่นับ ฿ (U+0E3F) */
/* ข้อความไทยที่ยอมให้อยู่ในหน้าอังกฤษ: ชื่อร้าน ชื่อนิติบุคคล และที่อยู่ไทย (ใช้ส่งของ/เรียกรถ) */
const THAI_OK = /ม\.ทวีภัณฑ์|ถนนเยาวพานิช|วินส์ทูลส์/;

/* ---------- 1) ข้อความ: element ที่มี data-th + data-en → เนื้อในเป็น data-en ---------- */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/* tag เปิด/ปิดที่รู้จัก quote — ค่าใน data-th มี <br> <b> ได้ ห้ามใช้ [^>]* ตรง ๆ */
const ATTRS = `(?:\\s+[^\\s=>/]+(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?)*`;
const OPEN_RE = new RegExp(`<([a-zA-Z][a-zA-Z0-9]*)(${ATTRS})\\s*(/?)>`, "g");
function swapText(html) {
  let out = "", i = 0, m;
  OPEN_RE.lastIndex = 0;
  while ((m = OPEN_RE.exec(html))) {
    const [tag, name, attrs, selfClose] = m;
    if (!/\sdata-th="/.test(attrs) || selfClose || VOID.has(name.toLowerCase())) continue;
    const en = (attrs.match(/\sdata-en="([^"]*)"/) || [])[1];
    if (en === undefined) continue;
    /* หา tag ปิดที่คู่กัน (นับ tag ชื่อเดียวกันที่ซ้อนอยู่ข้างใน) */
    const re = new RegExp(`<(/?)${name}(${ATTRS})\\s*(/?)>`, "gi"); re.lastIndex = m.index + tag.length;
    let depth = 1, c;
    while (depth && (c = re.exec(html))) depth += c[1] ? -1 : (c[3] ? 0 : 1);
    if (depth) throw new Error(`ไม่พบ </${name}> ของ ${tag.slice(0, 80)}`);
    /* data-en ที่ตั้งใจเป็นไทย (ชื่อไทยตัวเล็กใต้ชื่ออังกฤษ) → บอกเบราว์เซอร์/Google ว่าเป็นภาษาไทย */
    const t2 = THAI.test(unesc(en)) && !/\slang="/.test(attrs) ? tag.replace(/^<([a-zA-Z0-9]+)/, '<$1 lang="th"') : tag;
    out += html.slice(i, m.index) + t2 + unesc(en);
    i = c.index; OPEN_RE.lastIndex = c.index;
  }
  out += html.slice(i);
  /* แอตทริบิวต์ที่ผู้ใช้เห็น: data-en-alt → alt ฯลฯ */
  return out.replace(/<[a-zA-Z][^>]*\sdata-en-(?:placeholder|aria-label|title|alt)="[^"]*"[^>]*>/g, (t) => {
    for (const at of ["placeholder", "aria-label", "title", "alt"]) {
      const v = (t.match(new RegExp(`\\sdata-en-${at}="([^"]*)"`)) || [])[1];
      if (v === undefined) continue;
      t = new RegExp(`\\s${at}="`).test(t) ? t.replace(new RegExp(`(\\s${at})="[^"]*"`), `$1="${v}"`) : t.replace(/>$/, ` ${at}="${v}">`);
    }
    return t;
  });
}

/* ---------- 2) ลิงก์: ทุกลิงก์ในหน้าอังกฤษเป็น absolute ----------
   หน้าโฟลเดอร์ (/en, /en/products, /en/articles) เสิร์ฟแบบไม่มี / ท้าย ลิงก์ relative จะหลุดไปหน้าไทย
   หน้าที่มีฉบับอังกฤษ → /en/... · หน้าที่ยังไม่มี → หน้าไทย · asset → /assets/... */
const PAGE_DIR_FILE = (u) => "/en/" + urlToFile(u);
function mapPath(path) {
  const th = path.replace(/^\/en(?=\/|$)/, "") || "/";
  if (th.startsWith("/assets/") || !/(\.html$|^\/$|^\/products$|^\/articles$)/.test(th)) return th;
  const norm = th === "/index.html" ? "/" : th === "/products/index.html" ? "/products" : th === "/articles/index.html" ? "/articles" : th;
  return hasEn(norm) ? enUrl(norm) : norm;
}
function absUrl(v, baseUrl) {
  if (!v || /^(https?:|mailto:|tel:|#|data:|javascript:|\$\{)/.test(v)) return v;
  const r = new URL(v, baseUrl);
  return mapPath(r.pathname) + r.search + r.hash;
}
function fixLinks(html, u) {
  const baseUrl = "https://x" + PAGE_DIR_FILE(u);
  /* แยกส่วน <script> ออก แก้เฉพาะ markup — สตริงใน JS แก้เฉพาะ path ของ asset */
  return html.split(/(<script\b[\s\S]*?<\/script>)/).map((part, k) => {
    if (k % 2) {
      return part.replace(/(["'(\s,])(?:\.\.\/)*assets\//g, "$1/assets/")
        .replace(/productThumb\(p,"(?:\.\.\/)*"/g, 'productThumb(p,"/"');
    }
    return part
      /* ลิงก์ที่ซ่อนอยู่ในค่า data-th/data-en (layout.js เอาไปใส่ innerHTML ตอนโหลด) ก็ต้องแก้ด้วย */
      .replace(/\s(data-(?:th|en))="([^"]*)"/g, (a, at, v) => ` ${at}="${v.replace(/href=&quot;([^&]*(?:&amp;[^&]*)*)&quot;/g, (b, h) => `href=&quot;${absUrl(h.replace(/&amp;/g, "&"), baseUrl).replace(/&/g, "&amp;")}&quot;`)}"`)
      .replace(/\s(href|src|poster)="([^"]*)"/g, (a, at, v) => ` ${at}="${absUrl(v, baseUrl)}"`)
      .replace(/\ssrcset="([^"]*)"/g, (a, v) => ` srcset="${v.split(",").map((s) => { const [p, w] = s.trim().split(/\s+/); return absUrl(p, baseUrl) + (w ? " " + w : ""); }).join(", ")}"`)
      .replace(/url\((["']?)((?:\.\.\/)*assets\/[^)"']+)\1\)/g, (a, q, p) => `url(${q}/${p.replace(/^(\.\.\/)*/, "")}${q})`);
  }).join("");
}

/* ---------- 3) <head>: lang, title, description, canonical, hreflang, OG ---------- */
const altLinks = (u) => `<link rel="alternate" hreflang="th" href="${SITE}${u}">\n<link rel="alternate" hreflang="en" href="${SITE}${enUrl(u)}">\n<link rel="alternate" hreflang="x-default" href="${SITE}${u}">`;
/* สคริปต์หัวหน้า: ผู้ใช้เคยเลือกอีกภาษาไว้ → ไปหน้าภาษานั้นทันที (Googlebot ไม่มี localStorage จึงไม่โดน) */
const langScript = (want, other) => `<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='${want}')location.replace('${other}'+location.hash);}catch(e){}</script>`;
const HEAD_SCRIPT = /<script>try\{var l=localStorage\.getItem\('mtt_lang'\);[^<]*<\/script>/;
const ALT_BLOCK = /\n<link rel="alternate" hreflang="th"[^>]*>\n<link rel="alternate" hreflang="en"[^>]*>\n<link rel="alternate" hreflang="x-default"[^>]*>/;
const HTML_TAG = /<html lang="(?:th|en)"(?: data-page-lang="(?:th|en)")?([^>]*)>/;

function enHead(html, u, meta) {
  html = html.replace(HTML_TAG, '<html lang="en" data-page-lang="en"$1>');
  html = html.replace(HEAD_SCRIPT, langScript("en", u));
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.desc)}">`);
  html = html.replace(/\n<meta name="keywords" content="[^"]*">/, "");
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(meta.og || meta.title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(meta.desc)}">`);
  html = html.replace(/<meta property="og:locale" content="th_TH">/, '<meta property="og:locale" content="en_US">');
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}${enUrl(u)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}${enUrl(u)}">`);
  return html.replace(ALT_BLOCK, "").replace(/(<link rel="canonical"[^>]*>)/, `$1\n${altLinks(u)}`);
}
/* หน้าไทย: hreflang + สคริปต์จำภาษา (รันซ้ำได้ ผลเท่าเดิม) */
export function thHead(html, u) {
  if (!/<link rel="canonical"/.test(html)) throw new Error(`${u}: ไม่มี canonical`);
  html = html.replace(HTML_TAG, '<html lang="th" data-page-lang="th"$1>');
  html = html.replace(HEAD_SCRIPT, langScript("th", enUrl(u)));
  return html.replace(ALT_BLOCK, "").replace(/(<link rel="canonical"[^>]*>)/, `$1\n${altLinks(u)}`);
}

/* ---------- 4) JSON-LD ----------
   FAQ / breadcrumb / Article สร้างใหม่จากข้อความอังกฤษที่แสดงจริง (Google ต้องการให้ตรงกับหน้า)
   Product / Video / Store / ItemList มีอยู่ในหน้าไทย (canonical ของแต่ละภาษาเชื่อมด้วย hreflang) → ไม่ใส่ซ้ำเป็นภาษาไทยในหน้าอังกฤษ */
const plain = (h) => unesc(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
function visibleFaq(html) {
  const qa = (html.match(/<div class="qa">([\s\S]*?)<\/div>/) || [])[1];
  if (qa) return [...qa.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, q, a]) => [plain(q), plain(a)]);
  return [...html.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(([, q, a]) => [plain(q), plain(a)]);
}
function enSchema(html, u, meta) {
  return html.replace(/\n?<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g, (all, json) => {
    let o; try { o = JSON.parse(json); } catch (e) { throw new Error(`${u}: JSON-LD อ่านไม่ได้`); }
    const t = o["@type"];
    if (t === "FAQPage") {
      const items = visibleFaq(html).filter(([q, a]) => q && a);
      if (!items.length) return "";
      o.mainEntity = items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
    } else if (t === "Article") {
      Object.assign(o, { headline: meta.h1 || meta.title.replace(/ \| .*$/, ""), description: meta.desc, inLanguage: "en", mainEntityOfPage: SITE + enUrl(u) });
    } else if (t === "BreadcrumbList") {
      const crumbs = (html.match(/<nav class="crumbs"[^>]*>([\s\S]*?)<\/nav>/) || [])[1];
      const names = crumbs ? [...crumbs.matchAll(/<(a|span)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((x) => plain(x[2])) : [];
      if (names.length !== o.itemListElement.length) return "";
      o.itemListElement.forEach((it, k) => { it.name = names[k]; if (it.item) it.item = SITE + mapPath(it.item.replace(SITE, "") || "/"); });
    } else return "";
    return `\n<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`;
  });
}

/* ---------- 5) ข้อความไทยที่ยังโผล่ในหน้าอังกฤษ ---------- */
export function thaiLeft(html) {
  const body = html.slice(html.indexOf("<body"))
    .replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, "")
    .replace(/\sdata-[a-z-]+="[^"]*"/g, "")
    .replace(/<([a-z0-9]+)\b[^>]*\slang="th"[^>]*>[\s\S]*?<\/\1>/g, "");
  const left = [];
  for (const m of body.matchAll(/>([^<]+)</g)) { const t = m[1].trim(); if (THAI.test(t) && !THAI_OK.test(t)) left.push(t.slice(0, 70)); }
  for (const m of body.matchAll(/\s(alt|aria-label|placeholder|title)="([^"]*)"/g)) if (THAI.test(m[2]) && !THAI_OK.test(m[2])) left.push(`[${m[1]}] ${m[2].slice(0, 60)}`);
  const head = html.slice(0, html.indexOf("<body"));
  for (const m of head.matchAll(/<(title)>([^<]*)<|<meta (?:name|property)="(?:description|og:title|og:description)" content="([^"]*)"/g)) {
    const v = m[2] || m[3] || ""; if (THAI.test(v)) left.push(`[head] ${v.slice(0, 60)}`);
  }
  return left;
}

/* ---------- main ---------- */
export function buildEn(thHtml, u, META) {
  const meta = META[u];
  if (!meta || !meta.title || !meta.desc) throw new Error(`data/en-meta.json ไม่มี title/desc ของ ${u}`);
  let html = swapText(thHtml);
  html = enHead(html, u, meta);
  html = enSchema(html, u, meta);
  return fixLinks(html, u);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const REPORT = process.argv.includes("--report");
  const META = JSON.parse(readFileSync("data/en-meta.json", "utf8"));
  const pages = enPages();
  const out = new Map(), problems = [];
  for (const u of pages) {
    const f = urlToFile(u);
    const th = thHead(readFileSync(f, "utf8"), u);
    const en = buildEn(th, u, REPORT ? new Proxy(META, { get: (o, k) => o[k] || { title: "TODO", desc: "TODO" } }) : META);
    const left = thaiLeft(en);
    if (left.length) problems.push([u, left]);
    out.set(u, [f, th, en]);
  }
  for (const [u, left] of problems) { console.log(`${u}  ไทยค้าง ${left.length}`); left.slice(0, REPORT ? 99 : 8).forEach((l) => console.log("    " + l)); }
  if (REPORT) process.exit(0);
  if (problems.length) { console.error(`หน้าอังกฤษยังมีข้อความไทยที่ไม่ได้แปล ${problems.length} หน้า — เพิ่ม data-en ในหน้าไทยก่อน`); process.exit(1); }
  if (existsSync("en")) rmSync("en", { recursive: true });
  for (const [u, [f, th, en]] of out) {
    if (th !== readFileSync(f, "utf8")) writeFileSync(f, th);
    const dest = "en/" + f; mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, en);
  }
  console.log(`สร้างหน้าอังกฤษ ${out.size} หน้าใน en/`);
}
