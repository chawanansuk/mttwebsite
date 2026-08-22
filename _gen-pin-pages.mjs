/* ============================================================
   _gen-pin-pages.mjs — สร้างหน้าสินค้าเข็มกลัดรายเบอร์ (SEO)
   รัน: node _gen-pin-pages.mjs  → เขียน products/safety-pins-<เบอร์>.html
   แก้ข้อมูล/เลย์เอาต์ที่นี่ที่เดียวแล้วรันใหม่ ทั้ง 10 หน้าอัปเดตพร้อมกัน
   ============================================================ */
import { writeFileSync } from "fs";

const SITE = "https://www.mttaweephan.com";

const PINS = [
  { no: "000", mm: 19, cm: "1.9", inch: '3/4"', pack: "720–1,500",
    aka_th: "เบอร์จิ๋ว (3/0)", aka_en: "tiny (3/0)",
    colors_th: "เงิน / ทอง / ดำ", colors_en: "silver / gilt / black",
    groups_th: "งานฝีมือ ร้านเสื้อผ้า ร้านเครื่องประดับ", groups_en: "crafts, garment shops, jewellery",
    uses_th: ["ติดป้ายราคา (hang tag) / ป้ายผ้า", "ร้อยลูกปัด งานฝีมือ DIY", "กลัดจี้ / พระเครื่ององค์เล็ก", "งานเครื่องประดับ"],
    uses_en: ["Price / hang tags", "Beading & DIY crafts", "Small pendants & amulets", "Jewellery work"],
    faqx_th: ["เบอร์ 000 ต่างจากเบอร์ 00 ยังไง?", "เบอร์ 000 (3/0) เล็กกว่า — ยาว 1.9 ซม. ส่วนเบอร์ 00 (2/0) ยาว 2.3 ซม. งานแท็กเล็กมาก ๆ ใช้ 000 ถ้าอยากได้อึดขึ้นนิดใช้ 00"],
    faqx_en: ["How is 000 different from 00?", "000 (3/0) is smaller at 1.9 cm; 00 (2/0) is 2.3 cm. Use 000 for the tiniest tags, 00 for a bit more strength."] },
  { no: "00", mm: 23, cm: "2.3", inch: '7/8"', pack: "864–1,440",
    aka_th: "2/0", aka_en: "2/0",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "ร้านเสื้อผ้า โรงงานผลิต งานพิมพ์ป้าย", groups_en: "garment trade, factories, tag printers",
    uses_th: ["ติดป้ายสินค้า / แท็กเสื้อผ้า", "กลัดถุงพลาสติก ซองเอกสาร", "งาน OEM โรงงานเสื้อผ้า", "ร้านขายส่งประตูน้ำ-โบ๊เบ๊"],
    uses_en: ["Garment tags", "Bags & document pouches", "OEM garment work", "Wholesale clothing markets"],
    faqx_th: ["เบอร์ 2/0 กับ 00 เหมือนกันไหม?", "เหมือนกัน — 2/0 เป็นอีกชื่อของเบอร์ 00 (และ 3/0 คือ 000)"],
    faqx_en: ["Is 2/0 the same as 00?", "Yes — 2/0 is another name for size 00 (and 3/0 is 000)."] },
  { no: "0", mm: 28, cm: "2.8", inch: '1-1/16"', pack: "864–1,728",
    aka_th: "—", aka_en: "—",
    colors_th: "เงิน / ทอง / ดำ", colors_en: "silver / gilt / black",
    groups_th: "ใช้ทั่วไป โรงแรม ร้านซักรีด", groups_en: "general use, hotels, laundries",
    uses_th: ["กลัดเสื้อผ้าชั่วคราว", "ติดหมายเลขผ้าซักรีด / โรงแรม", "ร้อยยางยืดเส้นเล็ก", "งานบ้านสารพัดประโยชน์"],
    uses_en: ["Temporary garment pinning", "Laundry numbering", "Threading thin elastic", "Everyday household use"],
    faqx_th: ["ร้านซักรีดนิยมใช้เบอร์อะไร?", "เบอร์ 0–1 กำลังดี — เล็กพอไม่ทำลายผ้า แต่แข็งแรงพอกลัดป้ายหมายเลขผ้าได้แน่น"],
    faqx_en: ["Which size do laundries use?", "Sizes 0–1 — small enough to spare the fabric, strong enough to hold number tags."] },
  { no: "1", mm: 33, cm: "3.1–3.4", inch: '1-1/4"', pack: "864",
    aka_th: "—", aka_en: "—",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "งานตัดเย็บ ใช้ทั่วไป", groups_en: "sewing, general use",
    uses_th: ["ร้อยยางยืดขอบกางเกง/กระโปรง", "กลัดเสื้อผ้าชำรุดชั่วคราว", "กลัดผ้าคลุมไหล่", "งานเย็บผ้าทั่วไป"],
    uses_en: ["Threading waistband elastic", "Emergency garment fixes", "Pinning shawls", "General sewing"],
    faqx_th: ["ร้อยยางยืดใช้เข็มกลัดเบอร์ไหนดี?", "ยางยืดเส้นเล็ก-กลางใช้เบอร์ 1 ถ้ายางยืดหน้ากว้างใช้เบอร์ 3 จะจับง่ายกว่า"],
    faqx_en: ["Best size for threading elastic?", "Size 1 for narrow elastic; size 3 grips wide elastic better."] },
  { no: "2", mm: 38, cm: "3.8", inch: '1-1/2"', pack: "864",
    aka_th: "เบอร์งานวิ่ง", aka_en: "race-bib size",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "งานวิ่ง กีฬา โรงเรียน อีเวนต์", groups_en: "races, sports, schools, events",
    uses_th: ["กลัดเบอร์วิ่ง (BIB) มาราธอน — ใช้ 4 ตัว/คน", "กลัดชุดนักเรียน / ป้ายชื่อ", "งานอีเวนต์ แจกผู้เข้าร่วม", "ใช้ทั่วไปขนาดมาตรฐาน"],
    uses_en: ["Race bibs — 4 pins per runner", "School uniforms & name tags", "Event handouts", "Standard general use"],
    faqx_th: ["จัดงานวิ่งต้องใช้เข็มกลัดกี่ตัว?", "นักวิ่ง 1 คนใช้ 4 ตัว — เช่นงาน 500 คนใช้ 2,000 ตัว ≈ 3 กล่อง (864 ตัว/กล่อง) ควรเผื่อสำรอง 5–10%"],
    faqx_en: ["How many pins for a race?", "Four per runner — a 500-runner race needs 2,000 pins ≈ 3 boxes of 864. Add a 5–10% buffer."] },
  { no: "3", mm: 47, cm: "4.7", inch: '1-7/8"', pack: "408–432",
    aka_th: "—", aka_en: "—",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "งานตัดเย็บ งานผ้าหนา", groups_en: "sewing, thick fabrics",
    uses_th: ["ควิลท์ / ผ้านวม", "กลัดผ้าหนา ผ้ายีนส์", "ร้อยยางยืดหน้ากว้าง", "งานเย็บที่ต้องการเข็มยาว"],
    uses_en: ["Quilting & duvets", "Denim & thick fabric", "Wide elastic threading", "Long-reach pinning"],
    faqx_th: ["งานควิลท์ใช้เข็มกลัดเบอร์อะไร?", "เบอร์ 3 (47 มม.) ยาวพอทะลุผ้าหลายชั้น — สายควิลท์จริงจังอาจใช้แบบหัวโค้ง (curved) เพิ่ม ทักถามได้"],
    faqx_en: ["Which size for quilting?", "Size 3 (47 mm) reaches through layered fabric; serious quilters may also want curved pins — just ask."] },
  { no: "4", mm: 56, cm: "5.6", inch: '2-1/4"', pack: "432",
    aka_th: "เข็มกลัดผ้าห่ม / ผ้าอ้อม (blanket pin)", aka_en: "blanket / diaper pin",
    colors_th: "เงิน / คละสี", colors_en: "silver / assorted",
    groups_th: "แม่และเด็ก โรงพยาบาล โรงแรม", groups_en: "mother & baby, hospitals, hotels",
    uses_th: ["เข็มกลัดผ้าอ้อมเด็ก", "กลัดผ้าห่ม ผ้าขนหนู", "ผ้าคลุมเตียงโรงแรม/โรงพยาบาล", "ผ้าคลุมต่าง ๆ ที่ต้องกลัดแน่น"],
    uses_en: ["Cloth diapers", "Blankets & towels", "Hospital/hotel bedding", "Secure heavy-fabric pinning"],
    faqx_th: ["ใช้กลัดผ้าอ้อมปลอดภัยไหม?", "เบอร์ 4 เป็นขนาดผ้าอ้อมมาตรฐาน ปลายซ่อนในฝาครอบ — ถ้าต้องการปลอดภัยขึ้นอีกมีแบบหัวพลาสติกล็อค ทัก LINE ถามได้"],
    faqx_en: ["Safe for diapers?", "Size 4 is the standard diaper pin with a capped point — plastic-head locking pins are also available, just ask."] },
  { no: "5", mm: 65, cm: "6.5", inch: '2-1/2"', pack: "216",
    aka_th: "—", aka_en: "—",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "งานแสดง เวที เครื่องแต่งกาย", groups_en: "stage, costume, display",
    uses_th: ["กลัดผ้าเวที / ผ้าประดับงาน", "ผ้าม่าน ผ้าใบ", "ชุดคอสเพลย์ / ชุดการแสดง", "จับจีบผ้าจัดบูธ"],
    uses_en: ["Stage & event draping", "Curtains & canvas", "Cosplay & costumes", "Booth fabric styling"],
    faqx_th: ["จับจีบผ้าจัดงานใช้เบอร์อะไร?", "เบอร์ 5 (65 มม.) กลัดผ้าหลายทบได้อยู่ ถ้าผ้าใบหนาหรือกลางแจ้งขยับไปเบอร์ 6–7"],
    faqx_en: ["Which size for event draping?", "Size 5 (65 mm) holds multiple folds; go 6–7 for heavy canvas or outdoor work."] },
  { no: "6", mm: 75, cm: "7.5", inch: '3"', pack: "144",
    aka_th: "—", aka_en: "—",
    colors_th: "เงิน", colors_en: "silver",
    groups_th: "อุตสาหกรรม ก่อสร้าง การเกษตร", groups_en: "industry, construction, farming",
    uses_th: ["กลัดผ้าใบกันแดด", "ตาข่ายกันนก / ตาข่ายเกษตร", "ถุงกระสอบ", "งานกลางแจ้งที่ต้องการเข็มใหญ่"],
    uses_en: ["Shade tarps", "Netting", "Sacks & bags", "Heavy outdoor pinning"],
    faqx_th: ["กลัดผ้าใบ/กระสอบ เบอร์ 6 พอไหม?", "งานผ้าใบทั่วไปเบอร์ 6 เอาอยู่ — ถ้าผืนใหญ่หนามากหรือรับแรงดึงสูง ใช้เบอร์ 7 (85 มม.)"],
    faqx_en: ["Is size 6 enough for tarps?", "Yes for typical tarps — for very heavy or high-tension work, step up to size 7 (85 mm)."] },
  { no: "7", mm: 85, cm: "8.5", inch: '3-1/4"', pack: "144",
    aka_th: "เข็มกลัดยักษ์", aka_en: "jumbo pin",
    colors_th: "เงิน / ทอง", colors_en: "silver / gilt",
    groups_th: "อุตสาหกรรม งานตกแต่ง กิ๊ฟต์ช็อป", groups_en: "industry, décor, gift shops",
    uses_th: ["เข็มกลัดยักษ์ทำพวงกุญแจ", "กลัดป้ายผ้าขนาดใหญ่ / แบนเนอร์", "แขวนสินค้ากิ๊ฟต์ช็อป", "งานตกแต่ง display"],
    uses_en: ["Jumbo keychain pins", "Large fabric banners", "Gift-shop hanging", "Display décor"],
    faqx_th: ["เข็มกลัดยักษ์เอาไปทำอะไรได้บ้าง?", "ยอดฮิตคือพวงกุญแจ/งานคราฟต์ แขวนป้ายผ้าใหญ่ และแขวนสินค้าหน้าร้าน — สั่งชุบทองสำหรับงานตกแต่งก็มี"],
    faqx_en: ["What are jumbo pins for?", "Keychains and crafts, hanging big fabric signs, and shop displays — gilt finish available for décor work."] },
];

/* ---------- ลิงก์คู่มือที่เกี่ยวข้องรายเบอร์ (landing/บทความ) ---------- */
const REL = {
  "000": ["safety-pins-tags.html", "คู่มือเข็มกลัดติดป้ายราคา →", "Tag-pin guide →"],
  "00":  ["safety-pins-tags.html", "คู่มือเข็มกลัดติดป้ายราคา →", "Tag-pin guide →"],
  "2":   ["safety-pins-running.html", "คู่มือผู้จัดงานวิ่ง →", "Race-organizer guide →"],
  "4":   ["safety-pins-diaper.html", "คู่มือเข็มกลัดผ้าอ้อม →", "Diaper-pin guide →"],
};

/* ---------- helpers ---------- */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const jstr = (s) => JSON.stringify(s);
const MAXMM = 85;

function neighbors(i) {
  if (i === 0) return [0, 1, 2];
  if (i === PINS.length - 1) return [i - 2, i - 1, i];
  return [i - 1, i, i + 1];
}

function pageHTML(p, i) {
  const title = `เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.) ขายส่งยกกล่อง | ม ทวีภัณฑ์`;
  const desc = `เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ยาว ${p.cm} ซม. (${p.mm} มม.) เหล็กชุบนิกเกิล เหมาะ${p.uses_th[0]} ขายยกกล่อง ${p.pack} ตัว ราคาส่ง แบ่งขายพวง/กุรุส นับจำนวนจริง ส่งทั่วไทย`;
  const url = `${SITE}/products/safety-pins-${p.no}.html`;
  const near = neighbors(i);
  const lineMsg = `สอบถามราคา เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.) ยกกล่อง/แบ่งขาย`;

  const faq = [
    [`เข็มกลัดเบอร์ ${p.no} ยาวกี่เซน?`, `ยาวประมาณ ${p.cm} ซม. (${p.mm} มม. / ${p.inch}) วัดจากหัวฝาถึงปลายขดสปริง — ผู้ผลิตแต่ละเจ้าอาจต่างกัน ±2–3 มม.`,
     `How long is size ${p.no}?`, `About ${p.cm} cm (${p.mm} mm / ${p.inch}), measured cap to coil; makers vary by ±2–3 mm.`],
    [`เบอร์ ${p.no} กล่องละกี่ตัว?`, `ประมาณ ${p.pack} ตัว/กล่อง (นับจำนวนจริง ไม่ชั่งน้ำหนัก) — แบ่งขายเป็นพวง 12 ตัว หรือกุรุส 144 ตัวก็ได้`,
     `How many per box?`, `About ${p.pack} pins per box (counted, not weighed) — also sold by the dozen bunch or 144-pin gross.`],
    [p.faqx_th[0], p.faqx_th[1], p.faqx_en[0], p.faqx_en[1]],
  ];

  const faqSchema = faq.map(f => `    { "@type": "Question", "name": ${jstr(f[0])},
      "acceptedAnswer": { "@type": "Answer", "text": ${jstr(f[1])} } }`).join(",\n");

  const compareRows = near.map(j => {
    const q = PINS[j];
    const self = j === i;
    const name = self ? `<b>เบอร์ ${q.no} (หน้านี้)</b>` : `<a href="safety-pins-${q.no}.html">เบอร์ ${q.no}</a>`;
    return `        <tr${self ? ' class="me"' : ""}><td>${name}</td><td>${q.mm} มม. (${q.cm} ซม.)</td><td>~${q.pack}</td><td data-th="${esc(q.uses_th[0])}" data-en="${esc(q.uses_en[0])}">${esc(q.uses_th[0])}</td></tr>`;
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
<meta property="og:title" content="${esc(`เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.) | ม ทวีภัณฑ์`)}">
<meta property="og:url" content="${url}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:locale" content="th_TH">
<meta property="og:image" content="${SITE}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/theme.css?v=2">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "หน้าแรก", "item": "${SITE}/" },
    { "@type": "ListItem", "position": 2, "name": "เข็มกลัดซ่อนปลาย", "item": "${SITE}/products/safety-pins.html" },
    { "@type": "ListItem", "position": 3, "name": "เข็มกลัดซ่อนปลาย เบอร์ ${p.no}", "item": "${url}" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": ${jstr(`เข็มกลัดซ่อนปลาย เบอร์ ${p.no} (${p.mm} มม.)`)},
  "description": ${jstr(desc)},
  "image": "${SITE}/assets/img/og-image.png",
  "url": "${url}",
  "category": "เข็มกลัดซ่อนปลาย / Safety pins",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "ความยาว", "value": "${p.mm} มม. (${p.cm} ซม.)" },
    { "@type": "PropertyValue", "name": "บรรจุต่อกล่อง", "value": "${p.pack} ตัว" },
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
<style>
.pd-hero{background:radial-gradient(900px 420px at 82% -20%,rgba(18,161,80,.16),transparent 60%),linear-gradient(180deg,#fff,var(--bg));padding:48px 0 26px}
.crumbs{font-size:.82rem;color:var(--ink-mute);margin-bottom:14px}
.crumbs a{color:var(--ink-mute)}
.pd-hero h1{font-size:clamp(1.7rem,3.6vw,2.5rem);margin:6px 0 8px}
.trust{display:flex;flex-wrap:wrap;gap:9px;margin:14px 0 18px}
.trust .badge{font-size:.83rem;padding:7px 14px}
.cta-row{display:flex;flex-wrap:wrap;gap:10px}
.sizebox{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--surface);padding:22px;margin-top:8px}
.sizebar{height:14px;position:relative;margin:6px 0 16px}
.sizebar i{position:absolute;left:0;top:3px;height:8px;border-radius:99px;background:linear-gradient(90deg,var(--amber),var(--amber-dark));box-shadow:0 2px 8px rgba(18,161,80,.35)}
.sizebar::after{content:"";position:absolute;left:0;right:0;top:6px;height:2px;background:var(--line);z-index:-1}
.spec-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.spec-grid .it{background:var(--bg-soft);border-radius:var(--r);padding:12px 14px}
.spec-grid .it small{display:block;color:var(--ink-mute);font-size:.75rem;margin-bottom:2px}
.spec-grid .it b{font-family:"Kanit";font-size:.98rem}
.sec-h{font-size:clamp(1.2rem,2.4vw,1.5rem);margin:38px 0 12px}
.use-list{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;padding:0;margin:0;list-style:none}
.use-list li{padding:10px 14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);font-size:.9rem}
.use-list li::before{content:"✔ ";color:var(--amber-dark);font-weight:700}
.tblwrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}
table.cmp{width:100%;border-collapse:collapse;font-size:.88rem;min-width:520px}
table.cmp th{font-family:"Kanit";font-weight:600;text-align:left;background:var(--navy);color:#fff;padding:9px 14px;white-space:nowrap}
table.cmp td{padding:9px 14px;border-top:1px solid var(--line)}
table.cmp tr.me td{background:#e9f8f0}
.faq{margin-top:6px;display:grid;gap:10px}
.faq details{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:0 18px}
.faq summary{cursor:pointer;font-family:"Kanit";font-weight:600;font-size:.95rem;padding:13px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:10px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:1.2rem;color:var(--amber);flex:none}
.faq details[open] summary::after{content:"–"}
.faq .a{padding:0 0 13px;color:var(--ink-2);font-size:.88rem}
.cta-band{background:var(--navy);color:#fff;border-radius:var(--r-lg);padding:28px;margin-top:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
.cta-band h2{color:#fff;font-size:1.25rem;margin:0 0 4px}
.cta-band p{color:#c2cbde;margin:0;font-size:.9rem}
@media(max-width:760px){.spec-grid{grid-template-columns:1fr 1fr}.use-list{grid-template-columns:1fr}}
</style>
</head>
<body>
<div id="site-header"></div>

<section class="pd-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="../index.html" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <a href="safety-pins.html" data-th="เข็มกลัดซ่อนปลาย" data-en="Safety pins">เข็มกลัดซ่อนปลาย</a> › <span data-th="เบอร์ ${p.no}" data-en="Size ${p.no}">เบอร์ ${p.no}</span></nav>
    <span class="eyebrow" data-th="เข็มกลัดซ่อนปลาย · ขายส่ง สำเพ็ง" data-en="Safety pins · Sampheng wholesale">เข็มกลัดซ่อนปลาย · ขายส่ง สำเพ็ง</span>
    <h1 data-th="เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม." data-en="Safety pin size ${p.no} — ${p.mm} mm">เข็มกลัดซ่อนปลาย เบอร์ ${p.no} ขนาด ${p.mm} มม.</h1>
    <p class="muted" style="margin:0;max-width:640px" data-th="${esc(`เหล็กสปริงชุบนิกเกิล ปลายซ่อนในฝาครอบ ไม่ทิ่มมือ — กลุ่มที่ใช้บ่อย: ${p.groups_th} ขายยกกล่องราคาส่ง แบ่งขายพวง/กุรุสได้`)}" data-en="${esc(`Nickel-plated spring steel with a capped point — popular with ${p.groups_en}. Wholesale by the box, split by dozen or gross.`)}">เหล็กสปริงชุบนิกเกิล ปลายซ่อนในฝาครอบ ไม่ทิ่มมือ — กลุ่มที่ใช้บ่อย: ${esc(p.groups_th)} ขายยกกล่องราคาส่ง แบ่งขายพวง/กุรุสได้</p>
    <div class="trust">
      <span class="badge" data-th="🔢 นับจำนวนจริง ไม่ชั่ง" data-en="🔢 Counted, not weighed">🔢 นับจำนวนจริง ไม่ชั่ง</span>
      <span class="badge" data-th="📦 แบ่งขาย พวง/กุรุส/กล่อง" data-en="📦 Dozen / gross / box">📦 แบ่งขาย พวง/กุรุส/กล่อง</span>
      <span class="badge" data-th="🚚 ส่งทั่วไทย" data-en="🚚 Ships nationwide">🚚 ส่งทั่วไทย</span>
    </div>
    <div class="cta-row">
      <a class="btn btn-primary" data-line-ask="${esc(lineMsg)}" href="#" target="_blank" rel="noopener" data-th="เช็คราคาเบอร์ ${p.no} ทาง LINE" data-en="Ask price on LINE">เช็คราคาเบอร์ ${p.no} ทาง LINE</a>
      <a class="btn btn-ghost" href="safety-pins.html" data-th="ดูครบทุกเบอร์ 000–7" data-en="See all sizes 000–7">ดูครบทุกเบอร์ 000–7</a>
    </div>
  </div>
</section>

<section style="padding-top:8px">
  <div class="wrap">

    <div class="sizebox">
      <small style="color:var(--ink-mute)" data-th="ความยาวเทียบเบอร์ใหญ่สุด (เบอร์ 7 = 85 มม.)" data-en="Length vs the largest size (7 = 85 mm)">ความยาวเทียบเบอร์ใหญ่สุด (เบอร์ 7 = 85 มม.)</small>
      <div class="sizebar" aria-hidden="true"><i style="width:${Math.round(p.mm / MAXMM * 100)}%"></i></div>
      <div class="spec-grid">
        <div class="it"><small data-th="ความยาว" data-en="Length">ความยาว</small><b>${p.cm} ซม. · ${p.mm} มม. (${esc(p.inch)})</b></div>
        <div class="it"><small data-th="บรรจุ/กล่อง" data-en="Per box">บรรจุ/กล่อง</small><b>~${p.pack} ตัว</b></div>
        <div class="it"><small data-th="วัสดุ" data-en="Material">วัสดุ</small><b data-th="เหล็กสปริงชุบนิกเกิล" data-en="Nickel-plated steel">เหล็กสปริงชุบนิกเกิล</b></div>
        <div class="it"><small data-th="สีที่มี" data-en="Colors">สีที่มี</small><b data-th="${esc(p.colors_th)}" data-en="${esc(p.colors_en)}">${esc(p.colors_th)}</b></div>
      </div>
    </div>

    <h2 class="sec-h" data-th="เบอร์ ${p.no} เหมาะกับงานอะไร" data-en="What size ${p.no} is for">เบอร์ ${p.no} เหมาะกับงานอะไร</h2>
    <ul class="use-list">
${useList}
    </ul>

    <h2 class="sec-h" data-th="เปรียบเทียบกับเบอร์ใกล้เคียง" data-en="Compare with nearby sizes">เปรียบเทียบกับเบอร์ใกล้เคียง</h2>
    <div class="tblwrap">
      <table class="cmp">
        <thead><tr><th data-th="เบอร์" data-en="Size">เบอร์</th><th data-th="ความยาว" data-en="Length">ความยาว</th><th data-th="บรรจุ/กล่อง" data-en="Per box">บรรจุ/กล่อง</th><th data-th="งานเด่น" data-en="Best for">งานเด่น</th></tr></thead>
        <tbody>
${compareRows}
        </tbody>
      </table>
    </div>
    <p style="font-size:.85rem;color:var(--ink-mute);margin-top:8px"><a href="safety-pins.html#size-table" data-th="ดูตารางขนาดครบทุกเบอร์ →" data-en="Full size chart →">ดูตารางขนาดครบทุกเบอร์ →</a>${REL[p.no] ? ` · <a href="${REL[p.no][0]}" data-th="${esc(REL[p.no][1])}" data-en="${esc(REL[p.no][2])}">${esc(REL[p.no][1])}</a>` : ""} · <a href="../articles/which-safety-pin-size.html" data-th="เบอร์ไหนใช้ทำอะไร →" data-en="Size-choosing guide →">เบอร์ไหนใช้ทำอะไร →</a></p>

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

<div id="site-footer"></div>

<script>window.MTT_BASE="../";window.MTT_PAGE="pins";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=2"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script>
/* ปุ่ม data-line-ask → ลิงก์ทัก LINE พร้อมข้อความ */
document.querySelectorAll("[data-line-ask]").forEach(function(a){
  a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
});
</script>
<script src="../assets/js/layout.js?v=2"></script>
<script src="/_vercel/insights/script.js" defer></script>
</body>
</html>
`;
}

let made = [];
PINS.forEach((p, i) => {
  const file = `products/safety-pins-${p.no}.html`;
  writeFileSync(file, pageHTML(p, i));
  made.push(file);
});
console.log("generated " + made.length + " pages:\n" + made.join("\n"));
