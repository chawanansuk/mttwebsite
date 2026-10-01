/* ============================================================
   _gen-articles.mjs — ส่วนที่ซ้ำกันของบทความ สร้างจาก data/articles.json ที่เดียว
   รัน: node _gen-articles.mjs  (อยู่ใน npm run gen)

   เนื้อหาบทความยังเขียนมือใน articles/*.html ตามเดิม ตัวนี้เติมเฉพาะช่องที่มี marker:
     <!--art:head-->   title / meta / og / JSON-LD (Article, BreadcrumbList, FAQPage)
     <!--art:hero-->   breadcrumb + eyebrow + h1 + บรรทัดผู้เขียน/วันที่
     <!--art:toc-->    สารบัญ (เฉพาะบทความที่มีหัวข้อ h2 ตั้งแต่ 5 ข้อ)
     <!--art:next-->   อ่านต่อ
   FAQPage schema ดึงจากคำถามที่แสดงใน <div class="qa"> จริง → schema กับหน้าเว็บตรงกันเสมอ
   ตารางที่มี class="art stack" ได้ data-label จากหัวตาราง (มือถือแสดงเป็นการ์ด)
   และสร้าง articles/index.html (หน้ารวมบทความ) + การ์ดบทความบนหน้าแรก (<!--art:home-->)
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";
import { bakeChrome } from "./_chrome.mjs";
import { guideCardsHTML as guideCards } from "./_gen-lib.mjs";

const SITE = "https://mtthardware.com";
const SHOP_NAME = "ม.ทวีภัณฑ์";
const ORG = { "@type": "Organization", name: "ม.ทวีภัณฑ์ (M.T.T. Hardware)" };
const PUBLISHER = { ...ORG, logo: { "@type": "ImageObject", url: `${SITE}/assets/img/apple-touch-icon.png?v=2` } };
const { categories: CATS, articles: ARTICLES } = JSON.parse(readFileSync("data/articles.json", "utf8"));
const BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const text = (h) => unesc(h.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
/* ข้อความสองภาษา (layout.js สลับด้วย innerHTML → markup ข้างในต้อง escape ไว้ใน attribute) */
const bi = (th, en) => `data-th="${esc(th)}" data-en="${esc(en)}">${th}`;
const ld = (o) => `<script type="application/ld+json">\n${JSON.stringify({ "@context": "https://schema.org", ...o }, null, 2)}\n</script>`;

const TH_MONTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const EN_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dTH = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${TH_MONTH[m - 1]} ${y + 543}`; };
const dEN = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${EN_MONTH[m - 1]} ${y}`; };

function put(html, name, inner, file) {
  const re = new RegExp(`<!--art:${name}-->[\\s\\S]*?<!--/art:${name}-->`);
  if (!re.test(html)) throw new Error(`${file}: ไม่พบ <!--art:${name}-->`);
  return html.replace(re, () => `<!--art:${name}-->\n${inner}\n<!--/art:${name}-->`);
}

/* ---------- FAQ: อ่านจากหน้าจริง ---------- */
export function visibleFaq(html) {
  const m = html.match(/<div class="qa">([\s\S]*?)<\/div>/);
  if (!m) return [];
  return [...m[1].matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((x) => ({ q: text(x[1]), a: text(x[2]) }));
}

/* ---------- ตาราง stack: ใส่ data-label จากหัวตาราง ---------- */
function labelTables(html) {
  return html.replace(/<table class="art stack"[\s\S]*?<\/table>/g, (tbl) => {
    const heads = [...tbl.matchAll(/<th\b[^>]*data-th="([^"]*)"[^>]*data-en="([^"]*)"/g)].map((h) => [h[1], h[2]]);
    return tbl.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
      if (cells.includes("<th")) return row;
      let i = 0;
      return "<tr>" + cells.replace(/<td\b([^>]*)>/g, (td, attrs) => {
        const h = heads[i++];
        if (i === 1 || !h) return td; // คอลัมน์แรก = ชื่อแถว ไม่ต้องมีป้าย
        const a = attrs.replace(/\s*data-label(-en)?="[^"]*"/g, "");
        return `<td${a} data-label="${h[0]}" data-label-en="${h[1]}">`;
      }) + "</tr>";
    });
  });
}

/* ---------- ช่องต่าง ๆ ของบทความ ---------- */
function headBlock(a, faq) {
  const url = `${SITE}/articles/${a.slug}.html`;
  const cat = CATS[a.cat];
  const title = `${a.title_th} | ${SHOP_NAME}`;
  if (title.length > 60) throw new Error(`${a.slug}: title ยาว ${title.length} ตัวอักษร (เกิน 60)`);
  if (a.desc_th.length > 155) throw new Error(`${a.slug}: description ยาว ${a.desc_th.length} (เกิน 155)`);
  const img = `${SITE}/${a.image}`;
  const blocks = [
    ld({ "@type": "Article", headline: a.h1_th, description: a.desc_th, image: img, inLanguage: "th",
      datePublished: a.published, dateModified: a.modified, author: ORG, publisher: PUBLISHER, mainEntityOfPage: url }),
    ld({ "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: cat.th, item: `${SITE}/${cat.href}` },
      { "@type": "ListItem", position: 3, name: a.short_th, item: url },
    ] }),
  ];
  if (faq.length) blocks.push(ld({ "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }));
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(a.desc_th)}">
<meta name="keywords" content="${esc(a.keywords)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(a.title_th)}">
<meta property="og:description" content="${esc(a.og_desc_th)}">
<meta property="og:type" content="article">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="${a.image_w}">
<meta property="og:image:height" content="${a.image_h}">
<meta property="article:published_time" content="${a.published}">
<meta property="article:modified_time" content="${a.modified}">
<meta name="twitter:card" content="summary_large_image">
${blocks.join("\n")}`;
}

function heroBlock(a) {
  const cat = CATS[a.cat];
  const pub = `<time datetime="${a.published}">`, mod = `<time datetime="${a.modified}">`;
  const bylineTH = `โดย ม.ทวีภัณฑ์ สำเพ็ง · เผยแพร่ ${pub}${dTH(a.published)}</time>` + (a.modified !== a.published ? ` · อัปเดต ${mod}${dTH(a.modified)}</time>` : "");
  const bylineEN = `By M.T.T. Hardware, Sampheng · Published ${pub}${dEN(a.published)}</time>` + (a.modified !== a.published ? ` · Updated ${mod}${dEN(a.modified)}</time>` : "");
  return `    <nav class="crumbs" aria-label="breadcrumb"><a href="/" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <a href="../${cat.href}" ${bi(cat.th, cat.en)}</a> › <span ${bi(a.short_th, a.short_en)}</span></nav>
    <span class="eyebrow" ${bi(a.eyebrow_th, a.eyebrow_en)}</span>
    <h1 ${bi(a.h1_th, a.h1_en)}</h1>
    <p class="art-meta" ${bi(bylineTH, bylineEN)}</p>`;
}

function tocBlock(html) {
  const body = html.slice(html.indexOf("<!--/art:toc-->"), html.indexOf("<!--art:next-->"));
  const hs = [...body.matchAll(/<h2 class="sec-h" id="([^"]+)" data-th="([^"]*)" data-en="([^"]*)"/g)];
  if (hs.length < 5) return "";
  return `    <nav class="toc" aria-label="สารบัญ">
      <b data-th="ในบทความนี้" data-en="In this article">ในบทความนี้</b>
      <ol>
${hs.map((h) => `        <li><a href="#${h[1]}" data-th="${h[2]}" data-en="${h[3]}">${unesc(h[2])}</a></li>`).join("\n")}
      </ol>
    </nav>`;
}

function nextBlock(a) {
  const cards = a.related.map((s) => BY_SLUG[s]).map((r) =>
    `      <a href="${r.slug}.html"><b ${bi(r.short_th, r.short_en)}</b><span ${bi(r.card_th, r.card_en)}</span></a>`);
  for (const l of CATS[a.cat].links) cards.push(`      <a href="../${l.href}"><b ${bi(l.th, l.en)}</b><span ${bi(l.sub_th, l.sub_en)}</span></a>`);
  cards.push(`      <a href="/articles"><b data-th="บทความทั้งหมด" data-en="All guides">บทความทั้งหมด</b><span data-th="คู่มือเลือกซื้อไฟฟู่และเข็มกลัดทุกเรื่อง" data-en="Every buying guide on the site">คู่มือเลือกซื้อไฟฟู่และเข็มกลัดทุกเรื่อง</span></a>`);
  return `    <h2 class="sec-h" id="read-next" data-th="อ่านต่อ" data-en="Read next">อ่านต่อ</h2>
    <div class="nextlinks">
${cards.join("\n")}
    </div>`;
}

/* ---------- บทความแต่ละชิ้น ---------- */
for (const a of ARTICLES) {
  const file = `articles/${a.slug}.html`;
  let html = bakeChrome(readFileSync(file, "utf8")); // เติมข้อความจาก shop-config ก่อน FAQ จะอ่านคำตอบ
  html = labelTables(html);
  const faq = visibleFaq(html);
  html = put(html, "head", headBlock(a, faq), file);
  html = put(html, "hero", heroBlock(a), file);
  html = put(html, "next", nextBlock(a), file);
  html = put(html, "toc", tocBlock(html), file);
  writeFileSync(file, bakeChrome(html));
  console.log(`${file}: FAQ ${faq.length} ข้อ · title ${a.title_th.length + SHOP_NAME.length + 3}`);
}

/* ---------- หน้าแรก: การ์ดบทความ ---------- */
{
  const html = readFileSync("index.html", "utf8");
  writeFileSync("index.html", bakeChrome(put(html, "home", guideCards("articles/"), "index.html")));
}

/* ---------- หน้ารวมบทความ /articles ---------- */
{
  const URL = `${SITE}/articles`;
  const TITLE = `บทความและคู่มือเลือกซื้อ | ${SHOP_NAME}`;
  const DESC = "รวมคู่มือเลือกซื้อจากหน้าร้านสำเพ็ง — ไฟฟู่ยี่ห้อไหนดี รุ่นเล็กหรือรุ่นใหญ่ คิดกำไรขายส่ง และเข็มกลัดเบอร์ไหนใช้ทำอะไร";
  const newest = ARTICLES.map((a) => a.modified).sort().at(-1);
  const groups = Object.entries(CATS).map(([key, c]) => {
    const list = ARTICLES.filter((a) => a.cat === key);
    return list.length ? `    <h2 class="sec-h" id="${key}" ${bi(c.th, c.en)}</h2>
    <div class="guide-grid">
${guideCards("/articles/", list)}
    </div>` : "";
  }).filter(Boolean).join("\n\n");
  const page = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='th')document.documentElement.classList.add('pending-lang');}catch(e){}</script>
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${URL}">
<meta property="og:title" content="บทความและคู่มือเลือกซื้อ ม.ทวีภัณฑ์">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${URL}">
<meta property="og:image" content="${SITE}/assets/img/og-image.png?v=2">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap"></noscript>
<link rel="stylesheet" href="../assets/css/theme.css?v=5">
<link rel="stylesheet" href="../assets/css/article.css?v=3">
${ld({ "@type": "CollectionPage", name: "บทความและคู่มือเลือกซื้อ", description: DESC, url: URL, inLanguage: "th", dateModified: newest,
  mainEntity: { "@type": "ItemList", itemListElement: ARTICLES.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.h1_th, url: `${SITE}/articles/${a.slug}.html` })) } })}
${ld({ "@type": "BreadcrumbList", itemListElement: [
  { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
  { "@type": "ListItem", position: 2, name: "บทความ", item: URL },
] })}
</head>
<body>
<div id="site-header"></div>
<main id="main">

<section class="art-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="/" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <span data-th="บทความ" data-en="Guides">บทความ</span></nav>
    <span class="eyebrow" data-th="คู่มือเลือกซื้อ ฉบับหน้าร้านสำเพ็ง" data-en="Buying guides from a Sampheng shop">คู่มือเลือกซื้อ ฉบับหน้าร้านสำเพ็ง</span>
    <h1 data-th="บทความและคู่มือเลือกซื้อ" data-en="Guides and buying advice">บทความและคู่มือเลือกซื้อ</h1>
    <p class="lead" ${bi("เทียบรุ่น เทียบเบอร์ และคิดต้นทุนต่อชิ้น ก่อนสั่งไฟฟู่หรือเข็มกลัด ตัวเลขทุกตัวตรงกับราคาและสเปกจริงบนหน้าสินค้า", "Compare models and sizes and work out the cost per piece before you order jet lighters or safety pins. Every figure matches the live product pages.")}</p>
  </div>
</section>

<section style="padding-top:6px">
  <div class="wrap art-body">
${groups}

    <div class="cta-band">
      <div>
        <h2 data-th="มีคำถามที่ไม่มีในบทความ? ถามทาง LINE ได้เลย" data-en="Question not covered here? Ask on LINE">มีคำถามที่ไม่มีในบทความ? ถามทาง LINE ได้เลย</h2>
        <p data-th="บอกงานที่จะใช้หรือจำนวนที่ต้องการ ทีมงานสำเพ็งแนะนำและแจ้งราคาให้" data-en="Tell us the job or the quantity and we'll advise and quote.">บอกงานที่จะใช้หรือจำนวนที่ต้องการ ทีมงานสำเพ็งแนะนำและแจ้งราคาให้</p>
      </div>
      <a class="btn btn-primary" data-line-ask="สอบถามจากหน้าบทความ" href="#" target="_blank" rel="noopener" data-th="ทัก LINE ถามเลย" data-en="Ask on LINE">ทัก LINE ถามเลย</a>
    </div>
  </div>
</section>

</main>
<div id="site-footer"></div>

<script>window.MTT_BASE="../";window.MTT_PAGE="";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=3"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script>
document.querySelectorAll("[data-line-ask]").forEach(function(a){
  a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
});
</script>
<script src="../assets/js/layout.js?v=4"></script>
<script src="/_vercel/insights/script.js" defer></script>
</body>
</html>
`;
  writeFileSync("articles/index.html", bakeChrome(page));
  console.log(`articles/index.html: ${ARTICLES.length} บทความ`);
}
