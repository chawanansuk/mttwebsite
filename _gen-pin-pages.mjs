/* ============================================================
   _gen-pin-pages.mjs — สร้างหน้าสินค้าเข็มกลัดรายเบอร์ (SEO)
   รัน: node _gen-pin-pages.mjs  → เขียน products/safety-pins-<เบอร์>.html
   แก้ข้อมูล/เลย์เอาต์ที่นี่ที่เดียวแล้วรันใหม่ ทั้ง 10 หน้าอัปเดตพร้อมกัน
   ============================================================ */
import { writeFileSync } from "fs";
import { bakeChrome } from "./_chrome.mjs";

const SITE = "https://mtthardware.com";

import { PINS, packStr, packMin, packCell, priceTableOne, stockBadge, originStrip, offerFor, brandRef } from "./_gen-pins-lib.mjs";


/* ---------- ลิงก์คู่มือที่เกี่ยวข้องรายเบอร์ (landing/บทความ) ---------- */
const REL = {
  "000": ["safety-pins-tags.html", "คู่มือเข็มกลัดติดป้ายราคา →", "Tag-pin guide →"],
  "00":  ["safety-pins-tags.html", "คู่มือเข็มกลัดติดป้ายราคา →", "Tag-pin guide →"],
  "0":   ["safety-pins-running.html", "คู่มือผู้จัดงานวิ่ง →", "Race-organizer guide →"],
  "2":   ["safety-pins-running.html", "คู่มือผู้จัดงานวิ่ง →", "Race-organizer guide →"],
  "4":   ["safety-pins-diaper.html", "คู่มือเข็มกลัดผ้าอ้อม →", "Diaper-pin guide →"],
  "5":   ["safety-pins-canvas.html", "คู่มืองานผ้าใบ เต็นท์ →", "Canvas & tent guide →"],
  "6":   ["safety-pins-canvas.html", "คู่มืองานผ้าใบ เต็นท์ →", "Canvas & tent guide →"],
  "7":   ["safety-pins-canvas.html", "คู่มืองานผ้าใบ เต็นท์ →", "Canvas & tent guide →"],
};

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jstr = (s) => JSON.stringify(s);
const MAXMM = 85;

function neighbors(i) {
  if (i === 0) return [0, 1, 2];
  if (i === PINS.length - 1) return [i - 2, i - 1, i];
  return [i - 1, i, i + 1];
}

function pageHTML(p, i) {
  const title = `เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ${p.mm} มม. ขายส่งยกกล่อง | ม.ทวีภัณฑ์`;
  // meta description ต้อง <=155 ตัวอักษร (Google ตัดที่ราว ๆ นี้) — ต่อท้ายเท่าที่ยังพอดี
  const use = p.uses_th[0].split(' — ')[0];
  const descBase = `เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ยาว ${p.cm} ซม. (${p.mm} มม.) เหล็กชุบนิกเกิล เหมาะ${use} ขายยกกล่อง ${packStr(p)} ตัว ราคาส่ง`;
  const desc = [' นับจำนวนจริง', ' ส่งทั่วไทย'].reduce((acc, tail) => (acc + tail).length <= 155 ? acc + tail : acc, descBase);
  const url = `${SITE}/products/safety-pins-${p.no}.html`;
  const near = neighbors(i);
  const lineMsg = `สอบถามราคา เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.) ยกกล่อง/แบ่งขาย`;

  const faq = [
    [`เข็มกลัดเบอร์ ${p.no} ยาวกี่เซน?`, `ยาวประมาณ ${p.cm} ซม. (${p.mm} มม. / ${p.inch}) วัดจากหัวฝาถึงปลายขดสปริง — ผู้ผลิตแต่ละเจ้าอาจต่างกัน ±2–3 มม.`,
     `How long is size ${p.no}?`, `About ${p.cm} cm (${p.mm} mm / ${p.inch}), measured cap to coil; makers vary by ±2–3 mm.`],
    [`เบอร์ ${p.no} กล่องละกี่ตัว?`, `ประมาณ ${packStr(p)} ตัว/กล่อง (นับจำนวนจริง ไม่ชั่งน้ำหนัก) — แบ่งขายเป็นพวง 12 ตัว หรือกุรุส 144 ตัวก็ได้`,
     `How many per box?`, `About ${packStr(p)} pins per box (counted, not weighed) — also sold by the dozen bunch or 144-pin gross.`],
    [p.faqx_th[0], p.faqx_th[1], p.faqx_en[0], p.faqx_en[1]],
  ];

  const faqSchema = faq.map(f => `    { "@type": "Question", "name": ${jstr(f[0])},
      "acceptedAnswer": { "@type": "Answer", "text": ${jstr(f[1])} } }`).join(",\n");

  const compareRows = near.map(j => {
    const q = PINS[j];
    const self = j === i;
    const name = self ? `<b data-th="เบอร์ ${q.no} (หน้านี้)" data-en="Size ${q.no} (this page)">เบอร์ ${q.no} (หน้านี้)</b>` : `<a href="safety-pins-${q.no}.html" data-th="เบอร์ ${q.no}" data-en="Size ${q.no}">เบอร์ ${q.no}</a>`;
    return `        <tr${self ? ' class="me"' : ""}><td>${name}</td><td data-th="${q.mm} มม. (${q.cm} ซม.)" data-en="${q.mm} mm (${q.cm} cm)">${q.mm} มม. (${q.cm} ซม.)</td><td data-th="~${packStr(q)}" data-en="~${packStr(q)}">~${packStr(q)}</td><td data-th="${esc(q.uses_th[0])}" data-en="${esc(q.uses_en[0])}">${esc(q.uses_th[0])}</td></tr>`;
  }).join("\n");

  const useList = p.uses_th.map((u, k) =>
    `      <li data-th="${esc(u)}" data-en="${esc(p.uses_en[k])}">${esc(u)}</li>`).join("\n");

  const faqHTML = faq.map(f => `      <details><summary data-th="${esc(f[0])}" data-en="${esc(f[2])}">${esc(f[0])}</summary>
        <div class="a" data-th="${esc(f[1])}" data-en="${esc(f[3])}">${esc(f[1])}</div></details>`).join("\n");

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='th')document.documentElement.classList.add('pending-lang');}catch(e){}</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(`เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.) | ม.ทวีภัณฑ์`)}">
<meta property="og:url" content="${url}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:locale" content="th_TH">
<meta property="og:image" content="${SITE}/assets/img/products/safety-pins-og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap"></noscript>
<link rel="stylesheet" href="../assets/css/theme.css?v=6">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": "${SITE}/" },
    { "@type": "ListItem", "position": 2, "name": "เข็มกลัดซ่อนปลาย", "item": "${SITE}/products/safety-pins.html" },
    { "@type": "ListItem", "position": 3, "name": "เบอร์ ${p.no}", "item": "${url}" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": ${jstr(`เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.)`)},
  "description": ${jstr(desc)},
  "image": ["${SITE}/assets/img/products/pin-${p.no}.webp", "${SITE}/assets/img/products/safety-pin-sizes.webp"],
  "url": "${url}",
  "brand": ${jstr(brandRef())},
  "category": "เข็มกลัดซ่อนปลาย / Safety pins",${offerFor(p, url) ? `\n  "offers": ${JSON.stringify(offerFor(p, url))},` : ""}
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "ความยาว", "value": "${p.mm} มม. (${p.cm} ซม.)" },
    { "@type": "PropertyValue", "name": "ขนาดลวด", "value": "${p.wire} มม." },
    { "@type": "PropertyValue", "name": "บรรจุต่อกล่อง", "value": "${packStr(p)} ตัว" },
    { "@type": "PropertyValue", "name": "วัสดุ", "value": "เหล็กสปริงชุบนิกเกิล" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqSchema}
  ]
}
</script>
<link rel="stylesheet" href="../assets/css/pins.css?v=2">
</head>
<body>
<div id="site-header"></div>
<main id="main">

<section class="pd-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="/" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <a href="safety-pins.html" data-th="เข็มกลัดซ่อนปลาย" data-en="Safety pins">เข็มกลัดซ่อนปลาย</a> › <span data-th="เบอร์ ${p.no}" data-en="Size ${p.no}">เบอร์ ${p.no}</span></nav>
    <span class="eyebrow" data-th="เข็มกลัดซ่อนปลาย · ขายส่ง สำเพ็ง" data-en="Safety pins · Sampheng wholesale">เข็มกลัดซ่อนปลาย · ขายส่ง สำเพ็ง</span>
    <h1 data-th="เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม." data-en="Safety pin size ${p.no} — ${p.mm} mm">เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม.</h1>
    <p class="muted" style="margin:0;max-width:640px" data-th="${esc(`เหล็กสปริงชุบนิกเกิล ปลายซ่อนในฝาครอบ ไม่ทิ่มมือ — กลุ่มที่ใช้บ่อย: ${p.groups_th} ขายยกกล่องราคาส่ง แบ่งขายพวง/กุรุสได้`)}" data-en="${esc(`Nickel-plated spring steel with a capped point — popular with ${p.groups_en}. Wholesale by the box, split by dozen or gross.`)}">เหล็กสปริงชุบนิกเกิล ปลายซ่อนในฝาครอบ ไม่ทิ่มมือ — กลุ่มที่ใช้บ่อย: ${esc(p.groups_th)} ขายยกกล่องราคาส่ง แบ่งขายพวง/กุรุสได้</p>
    <div class="trust">
      <span class="badge" data-th="นับจำนวนจริง ไม่ชั่ง" data-en="Counted, not weighed">นับจำนวนจริง ไม่ชั่ง</span>
      <span class="badge" data-th="แบ่งขาย พวง/กุรุส/กล่อง" data-en="Dozen / gross / box">แบ่งขาย พวง/กุรุส/กล่อง</span>
      <span class="badge" data-th="ส่งทั่วไทย" data-en="Ships nationwide">ส่งทั่วไทย</span>
      ${stockBadge(p)}
    </div>
    <div class="cta-row">
      <a class="btn btn-primary" data-line-ask="${esc(lineMsg)}" href="#" target="_blank" rel="noopener" data-th="เช็คราคาเบอร์ ${p.no} ทาง LINE" data-en="Ask price on LINE">เช็คราคาเบอร์ ${p.no} ทาง LINE</a>
      <a class="btn btn-ghost" href="safety-pins.html" data-th="ดูครบทุกเบอร์ 000–7" data-en="See all sizes 000–7">ดูครบทุกเบอร์ 000–7</a>
      <a class="btn btn-ghost" href="safety-pins-wholesale.html" data-th="ราคาส่ง ยกกล่อง" data-en="Wholesale by the box">ราคาส่ง ยกกล่อง</a>
    </div>
${originStrip("../")}
  </div>
</section>

<section style="padding-top:8px">
  <div class="wrap">

    <div class="sizebox">
      <div class="sizebox-top">
        <img class="pinshot" src="../assets/img/products/pin-${p.no}.webp" alt="เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม. ลวด ${p.wire} มม. ชุบนิกเกิลสีเงิน" data-th-alt="เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม. ลวด ${p.wire} มม. ชุบนิกเกิลสีเงิน" data-en-alt="Size ${p.no} safety pin, ${p.mm} mm long, ${p.wire} mm wire, nickel-plated silver" width="450" height="600" loading="lazy">
        <div class="sizebox-body">
          <small style="color:var(--ink-mute)" data-th="ความยาวเทียบเบอร์ใหญ่สุด (เบอร์ 7 = 85 มม.)" data-en="Length vs the largest size (7 = 85 mm)">ความยาวเทียบเบอร์ใหญ่สุด (เบอร์ 7 = 85 มม.)</small>
          <div class="pinvis" aria-hidden="true"><img src="../assets/img/products/safety-pin.svg" alt="" width="200" height="72" style="width:${Math.round(p.mm / MAXMM * 100)}%"></div>
        </div>
      </div>
      <div class="spec-grid">
        <div class="it"><small data-th="ความยาว" data-en="Length">ความยาว</small><b data-th="${p.cm} ซม. · ${p.mm} มม. (${esc(p.inch)})" data-en="${p.cm} cm · ${p.mm} mm (${esc(p.inch)})">${p.cm} ซม. · ${p.mm} มม. (${esc(p.inch)})</b></div>
        <div class="it"><small data-th="บรรจุ/กล่อง" data-en="Per box">บรรจุ/กล่อง</small><b data-th="~${packStr(p)} ตัว" data-en="~${packStr(p)} pins">~${packStr(p)} ตัว</b></div>
        <div class="it"><small data-th="วัสดุ" data-en="Material">วัสดุ</small><b data-th="เหล็กสปริงชุบนิกเกิล" data-en="Nickel-plated steel">เหล็กสปริงชุบนิกเกิล</b></div>
        <div class="it"><small data-th="ขนาดลวด" data-en="Wire gauge">ขนาดลวด</small><b data-th="${p.wire} มม." data-en="${p.wire} mm">${p.wire} มม.</b></div>
        <div class="it"><small data-th="สีที่มี" data-en="Colours">สีที่มี</small><b data-th="${esc(p.colors_th)}" data-en="${esc(p.colors_en)}">${esc(p.colors_th)}</b></div>
      </div>
    </div>

${priceTableOne(p, `เข็มกลัดเบอร์ ${p.no}`)}
    <h2 class="sec-h" data-th="เบอร์ ${p.no} เหมาะกับงานอะไร" data-en="What size ${p.no} is for">เบอร์ ${p.no} เหมาะกับงานอะไร</h2>
    <ul class="use-list">
${useList}
    </ul>

    <h2 class="sec-h" data-th="เปรียบเทียบกับเบอร์ใกล้เคียง" data-en="Compare with nearby sizes">เปรียบเทียบกับเบอร์ใกล้เคียง</h2>
    <div class="tblwrap" tabindex="0" role="region" aria-label="เปรียบเทียบกับเบอร์ใกล้เคียง" data-th-aria-label="เปรียบเทียบกับเบอร์ใกล้เคียง" data-en-aria-label="Compare with nearby sizes">
      <table class="cmp">
        <thead><tr><th data-th="เบอร์" data-en="Size">เบอร์</th><th data-th="ความยาว" data-en="Length">ความยาว</th><th data-th="บรรจุ/กล่อง" data-en="Per box">บรรจุ/กล่อง</th><th data-th="งานเด่น" data-en="Best for">งานเด่น</th></tr></thead>
        <tbody>
${compareRows}
        </tbody>
      </table>
    </div>
    <p style="font-size:.875rem;color:var(--ink-mute);margin-top:8px"><a href="safety-pins.html#size-table" data-th="ดูตารางขนาดครบทุกเบอร์ →" data-en="Full size chart →">ดูตารางขนาดครบทุกเบอร์ →</a>${REL[p.no] ? ` · <a href="${REL[p.no][0]}" data-th="${esc(REL[p.no][1])}" data-en="${esc(REL[p.no][2])}">${esc(REL[p.no][1])}</a>` : ""} · <a href="../articles/which-safety-pin-size.html" data-th="เบอร์ไหนใช้ทำอะไร →" data-en="Size-choosing guide →">เบอร์ไหนใช้ทำอะไร →</a> · <a href="safety-pins-wholesale.html" data-th="สั่งยกกล่อง ราคาส่ง →" data-en="Wholesale by the box →">สั่งยกกล่อง ราคาส่ง →</a></p>

    <h2 class="sec-h" data-th="คำถามที่พบบ่อย" data-en="FAQ">คำถามที่พบบ่อย</h2>
    <div class="faq">
${faqHTML}
    </div>

    <div class="cta-band">
      <div>
        <h2 data-th="สั่งเข็มกลัดเบอร์ ${p.no} — บอกจำนวนที่ต้องการได้เลย" data-en="Order size ${p.no} — tell us how many">สั่งเข็มกลัดเบอร์ ${p.no} — บอกจำนวนที่ต้องการได้เลย</h2>
        <p data-th="ทีมงานเช็คสต็อก แจ้งราคาปลีก-ส่ง และค่าจัดส่ง จบในแชทเดียว" data-en="Stock check, retail/wholesale quote, and shipping — all in one chat.">ทีมงานเช็คสต็อก แจ้งราคาปลีก-ส่ง และค่าจัดส่ง จบในแชทเดียว</p>
      </div>
      <a class="btn btn-primary" data-line-ask="${esc(lineMsg)}" href="#" target="_blank" rel="noopener" data-th="ทัก LINE เลย" data-en="Chat on LINE">ทัก LINE เลย</a>
    </div>
  </div>
</section>

</main>
<div id="site-footer"></div>

<script>window.MTT_BASE="../";window.MTT_PAGE="pins";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=4"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script>
/* ปุ่ม data-line-ask → ลิงก์ทัก LINE พร้อมข้อความ */
document.querySelectorAll("[data-line-ask]").forEach(function(a){
  a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
});
</script>
<script src="../assets/js/layout.js?v=5"></script>
<script src="/_vercel/insights/script.js" defer></script>
</body>
</html>
`;
}

let made = [];
PINS.forEach((p, i) => {
  const file = `products/safety-pins-${p.no}.html`;
  writeFileSync(file, bakeChrome(pageHTML(p, i)));
  made.push(file);
});
console.log("generated " + made.length + " pages:\n" + made.join("\n"));
