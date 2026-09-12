/* ============================================================
   หน้ารวมสินค้าแบรนด์ร้านเอง "ตรา M.T.T. / ตราสิงโต"
   ดึงเฉพาะรายการที่ทำเครื่องหมาย brand:"MTT" ใน data/wynn-tools.json
   รันด้วย: node _gen-mtt-page.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";

const SITE = "https://mtthardware.com";
const DATA = JSON.parse(readFileSync("data/wynn-tools.json", "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (c) => String(c).replace(/\//g, "-");

const FILE = "mtt-brand.html";
const URL = `${SITE}/products/${FILE}`;
const TITLE = "สินค้าตรา M.T.T. ตราสิงโต กุญแจ เข็มกลัด ประแจ มีดครัว";
const DESC = "สินค้าแบรนด์ของ ม.ทวีภัณฑ์ เอง — กุญแจสิงห์เงิน-สิงห์ทองปั๊มรูปสิงโต ชุดคีย์อะไลค์ เข็มกลัดซ่อนปลาย ประแจเลื่อนรมดำ มีดครัวตราสิงห์คู่ พร้อมรหัสครบ";
const KW = "ตรา M.T.T., ตราสิงโต, MTT International, กุญแจสิงห์เงิน, กุญแจสิงห์ทอง, คีย์อะไลค์, เข็มกลัด MTT, ประแจเลื่อนรมดำ, มีดครัวตราสิงห์คู่, ม.ทวีภัณฑ์";
if (TITLE.length > 62) throw new Error("title ยาวเกิน " + TITLE.length);
if (DESC.length > 155) throw new Error("desc ยาวเกิน " + DESC.length);

/* หมวดบนหน้าแบรนด์ — เรียงตามความสำคัญทางการค้า */
const SECTIONS = [
  { key: "padlock", th: "กุญแจตราสิงโต", en: "Lion-brand padlocks", icon: "🔐",
    lead_th: "กุญแจสิงห์เงินระบบลูกปืน กุญแจสิงห์ทองไส้ทองเหลืองแท้ และชุดคีย์อะไลค์ที่ไขด้วยดอกเดียวกันทั้งชุด ตัวกุญแจปั๊มรูปสิงโตและอักษร M.T.T. ทุกลูก",
    lead_en: "Silver-lion ball-locking padlocks, gold-lion solid-brass cylinders, and keyed-alike sets that open on one key. Every body is embossed with the lion and the letters M.T.T." },
  { key: "pin", th: "เข็มกลัดซ่อนปลาย", en: "Safety pins", icon: "🧷",
    lead_th: "ครบ 8 เบอร์ตั้งแต่ 000 ถึง 5 เหล็กชุบนิกเกิล ขายเป็นพวงและยกหีบ ขนาดยึดตามตารางสเปคโรงงาน — ดูรายละเอียดต่อเบอร์ได้ที่หน้าเข็มกลัด",
    lead_en: "Eight sizes from 000 to 5, nickel-plated steel, sold by the bunch or the case. Sizes follow the factory spec sheet — see the safety-pin pages for per-size detail." },
  { key: "wrench", th: "ประแจ", en: "Wrenches", icon: "🔧",
    lead_th: "ประแจเลื่อนรมดำ 6–24 นิ้ว และชุดประแจแหวนข้าง 14 ชิ้น ภายใต้แบรนด์ของร้าน",
    lead_en: "Black-oxide adjustable wrenches from 6 to 24 inches and a 14-piece combination wrench set under the shop's own brand." },
  { key: "blade", th: "มีดครัวและของมีคม", en: "Kitchen knives & blades", icon: "🔪",
    lead_th: "มีดครัวสแตนเลสตราสิงห์คู่ ด้ามไม้และด้ามพลาสติก และมีดโกน SPORTS M.T.T.",
    lead_en: "Twin-lion stainless kitchen knives with wooden or plastic handles, and SPORTS M.T.T. razors." },
  { key: "other", th: "เครื่องมือช่างอื่นๆ", en: "Other hand tools", icon: "🧰",
    lead_th: "ค้อน เหล็กงัดยาง กรรไกรตัดท่อ PVC ปืนยิงกาว ลวดเย็บ และกาวแท่ง",
    lead_en: "Hammer, tyre lever, PVC pipe cutter, glue guns, staples and glue sticks." },
];

/* รวบรายการ MTT จากทุกหมวด โดยจำกลุ่มต้นทางไว้ (เอาชื่อกลุ่ม/วัสดุ/หมายเหตุ + ลิงก์กลับหมวดเดิม) */
const CAT_FILE = Object.fromEntries(DATA.categories.map((c) => [c.id, `tools-${c.id}.html`]));
const bySection = Object.fromEntries(SECTIONS.map((s) => [s.key, []]));
for (const c of DATA.categories) for (const g of c.groups) {
  const items = g.items.filter((x) => x.brand === "MTT");
  if (!items.length) continue;
  const fam = items[0].brand_fam;
  bySection[fam].push({ ...g, items, srcCat: c });
}
const total = Object.values(bySection).reduce((n, gs) => n + gs.reduce((m, g) => m + g.items.length, 0), 0);
const nPics = Object.values(bySection).reduce((n, gs) => n + gs.reduce((m, g) => m + g.items.filter((x) => x.img).length, 0), 0);
const withPics = nPics > 0;

/* ---- ตารางแบบเดียวกับหน้าหมวด (จัดตระกูล + รูปตัวแทน) — คัดลอกมาจาก _gen-tool-pages.mjs โดยตั้งใจ
        เพื่อไม่ให้ generator หลักต้องเปลี่ยนเป็นโมดูล ---- */
function rows(items) {
  const fams = [];
  for (const x of items) {
    const last = fams[fams.length - 1];
    if (last && last.th === x.th && last.en === x.en) last.items.push(x);
    else fams.push({ th: x.th, en: x.en, items: [x] });
  }
  const out = [];
  fams.forEach((f, fi) => {
    const samePic = f.items.length > 1 && f.items.some((x) => x.pic_same);
    f.items.forEach((x, xi) => {
      const lead = xi === 0;
      const ask = `สอบถามราคา ${x.code} ${x.th}${x.size ? " (" + x.size + ")" : ""}`;
      const note = x.notes_th ? `<div class="note">${esc(x.notes_th)}</div>` : "";
      const showPic = samePic ? lead : true;
      const pic = !withPics ? "" : ((showPic && x.img)
        ? `\n            <td class="pic"><a href="../${x.img}" target="_blank" rel="noopener" aria-label="ดูรูปใหญ่ ${esc(x.code)}"><img src="../${x.img.replace(".webp", "-sm.webp")}" alt="${esc(x.th)}${samePic ? "" : " " + esc(x.code)} ตรา M.T.T." width="320" height="240" loading="lazy"></a></td>`
        : `\n            <td class="pic"></td>`);
      const famnote = (lead && samePic)
        ? `<div class="famnote" data-th="ทุกเบอร์ในตระกูลนี้หน้าตาเหมือนกัน ต่างที่ขนาด — ดูขนาดจริงที่คอลัมน์ขนาด" data-en="Every size in this family looks alike; see the size column for the actual size.">ทุกเบอร์ในตระกูลนี้หน้าตาเหมือนกัน ต่างที่ขนาด — ดูขนาดจริงที่คอลัมน์ขนาด</div>` : "";
      const nameHTML = lead ? `<b>${esc(x.th)}</b><small>${esc(x.en)}</small>` : "";
      out.push(`          <tr${lead ? ' class="fam-lead"' : ""} data-fam="${fi}" data-nth="${esc(x.th)}" data-nen="${esc(x.en)}">${pic}
            <td class="code"><a data-line-ask="${esc(ask)}" href="#" target="_blank" rel="noopener">${esc(x.code)}</a></td>
            <td class="nm"><span class="nmtxt">${nameHTML}</span>${famnote}${note}</td>
            <td>${esc(x.size)}</td>
            <td>${esc(x.pcs)}</td>
            <td>${esc(x.mat || "")}</td>
          </tr>`);
    });
  });
  return out.join("\n");
}
let gi = 0;
function groupHTML(g) {
  const i = gi++;
  const notes = (g.notes_th || []).map((n) => `<li>${esc(n)}</li>`).join("");
  return `    <h3 class="grp-h" id="g${i}">${esc(g.th)} <span>${esc(g.en)}</span> <em>${g.items.length} รายการ</em></h3>
${g.mat ? `    <p class="grp-mat"><span data-th="วัสดุ" data-en="Material">วัสดุ</span>: ${esc(g.mat)}</p>` : ""}
${notes ? `    <ul class="grp-notes">${notes}</ul>` : ""}
    <div class="tblwrap" id="tw${i}">
      <table class="tools${withPics ? " haspic" : ""}">
        <thead><tr>
${withPics ? `          <th class="pic" data-th="รูป" data-en="Photo">รูป</th>\n` : ""}          <th data-th="รหัส" data-en="Item no.">รหัส</th>
          <th data-th="ชื่อสินค้า" data-en="Product">ชื่อสินค้า</th>
          <th data-th="ขนาด" data-en="Size">ขนาด</th>
          <th data-th="จำนวน/ลัง" data-en="Per carton">จำนวน/ลัง</th>
          <th data-th="วัสดุ" data-en="Steel">วัสดุ</th>
        </tr></thead>
        <tbody>
${rows(g.items)}
        </tbody>
      </table>
    </div>
    <p class="srcline"><a href="${CAT_FILE[g.srcCat.id]}" data-th="ดูทั้งหมวด${esc(g.srcCat.th)} →" data-en="See the whole ${esc(g.srcCat.en)} category →">ดูทั้งหมวด${esc(g.srcCat.th)} →</a></p>`;
}

function sectionHTML(s) {
  const gs = bySection[s.key];
  if (!gs.length) return "";
  const n = gs.reduce((m, g) => m + g.items.length, 0);
  return `    <h2 class="sec-h" id="${s.key}"><span class="ic">${s.icon}</span> ${esc(s.th)} <small>${esc(s.en)} · ${n} <span data-th="รายการ" data-en="items">รายการ</span></small></h2>
    <p class="sec-lead" data-th="${esc(s.lead_th)}" data-en="${esc(s.lead_en)}">${esc(s.lead_th)}</p>
${gs.map(groupHTML).join("\n\n")}`;
}

const itemList = {
  "@context": "https://schema.org", "@type": "ItemList",
  name: "สินค้าตรา M.T.T. (ตราสิงโต) ม.ทวีภัณฑ์", description: DESC, numberOfItems: total,
  itemListElement: SECTIONS.filter((s) => bySection[s.key].length).map((s, i) => ({
    "@type": "ListItem", position: i + 1, name: s.th, url: `${URL}#${s.key}`,
    description: `${bySection[s.key].reduce((m, g) => m + g.items.length, 0)} รายการ`,
  })),
};
const brand = {
  "@context": "https://schema.org", "@type": "Brand",
  name: "M.T.T.", alternateName: ["ตราสิงโต", "ตรา M.T.T.", "MTT International"],
  url: URL, logo: `${SITE}/assets/img/products/mtt-brand.webp`,
  description: "แบรนด์สินค้าของ ม.ทวีภัณฑ์ สำเพ็ง — กุญแจ เข็มกลัด ประแจ มีดครัว และเครื่องมือช่าง ปั๊มรูปสิงโตบนตัวสินค้า",
};
const crumbs = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "สินค้า", item: `${SITE}/products/index.html` },
    { "@type": "ListItem", position: 3, name: "สินค้าตรา M.T.T.", item: URL },
  ],
};

const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='th')document.documentElement.classList.add('pending-lang');}catch(e){}</script>
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<meta name="keywords" content="${esc(KW)}">
<link rel="canonical" href="${URL}">
<meta property="og:title" content="สินค้าตรา M.T.T. ตราสิงโต — ${total} รายการ แบรนด์ของ ม.ทวีภัณฑ์">
<meta property="og:description" content="${esc(DESC.slice(0, 110))}">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${URL}">
<meta property="og:image" content="${SITE}/assets/img/products/mtt-brand.webp">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/theme.css?v=2">
<script type="application/ld+json">
${JSON.stringify(crumbs, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(brand, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
</script>
<style>
.t-hero{background:radial-gradient(900px 420px at 82% -20%,rgba(214,158,46,.20),transparent 60%),linear-gradient(180deg,#fff,var(--bg));padding:46px 0 24px}
.crumbs{font-size:.82rem;color:var(--ink-mute);margin-bottom:14px}
.crumbs a{color:var(--ink-mute)}
.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center}
@media(max-width:820px){.hero-grid{grid-template-columns:1fr}}
.t-hero h1{font-size:clamp(1.6rem,3.4vw,2.4rem);margin:6px 0 8px}
.t-hero .muted{max-width:640px;margin:0}
.hero-pic img{width:100%;height:auto;display:block;border-radius:var(--radius-lg);border:1px solid var(--line);background:#fff}
.trust{display:flex;flex-wrap:wrap;gap:9px;margin:16px 0 0}
.trust .badge{font-size:.83rem;padding:7px 14px}
.secnav{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0}
.secnav a{font-size:.85rem;padding:7px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--ink-2);text-decoration:none}
.secnav a:hover{border-color:var(--amber);color:var(--amber-dark)}
.why{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:26px 0 6px}
@media(max-width:720px){.why{grid-template-columns:1fr}}
.why .card{padding:18px}
.why h3{font-size:1rem;margin:0 0 6px}
.why p{font-size:.86rem;color:var(--ink-dim);margin:0}
.findbar{position:sticky;top:0;z-index:5;background:var(--bg);padding:14px 0 10px;border-bottom:1px solid var(--line)}
.findbar input{width:100%;max-width:460px;padding:12px 16px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);font:inherit;font-size:.95rem;background:var(--surface)}
.findbar input:focus{outline:2px solid var(--amber);border-color:transparent}
.findbar .hit{font-size:.83rem;color:var(--ink-mute);margin-top:8px}
.sec-h{font-size:clamp(1.25rem,2.6vw,1.6rem);margin:42px 0 4px;scroll-margin-top:80px}
.sec-h .ic{font-size:1.2em;vertical-align:-2px;margin-right:4px}
.sec-h small{display:block;font-family:"Anuphan";font-weight:500;font-size:.82rem;color:var(--ink-mute);margin-top:2px}
.sec-lead{color:var(--ink-dim);max-width:760px;margin:0 0 6px;font-size:.92rem}
.grp-h{font-size:clamp(1.02rem,2vw,1.2rem);margin:26px 0 6px;scroll-margin-top:80px}
.grp-h span{font-family:"Anuphan";font-weight:500;font-size:.8rem;color:var(--ink-mute);display:block}
.grp-h em{font-style:normal;font-family:"Anuphan";font-size:.78rem;color:var(--amber-dark);background:var(--amber-soft);border-radius:999px;padding:2px 10px;vertical-align:middle}
.grp-mat{font-size:.85rem;color:var(--ink-dim);margin:0 0 6px}
.grp-notes{margin:0 0 12px;padding-left:20px;font-size:.85rem;color:var(--ink-dim)}
.grp-notes li{padding:2px 0}
.srcline{font-size:.84rem;margin:8px 0 0}
.srcline a{color:var(--amber-dark)}
.tblwrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}
table.tools{width:100%;border-collapse:collapse;font-size:.88rem;min-width:660px}
table.tools.haspic{min-width:740px}
table.tools th{font-family:"Kanit";font-weight:600;text-align:left;background:var(--navy);color:#fff;padding:10px 14px;white-space:nowrap;position:sticky;top:0}
table.tools td{padding:10px 14px;border-top:1px solid var(--line);vertical-align:top}
table.tools tr:nth-child(even) td{background:var(--bg-soft)}
table.tools tr.fam-lead td{border-top:2px solid var(--line-strong)}
table.tools tr.fam-lead:first-child td{border-top:0}
table.tools th.pic{width:88px}
table.tools td.pic{width:88px;padding:8px 10px}
table.tools td.pic img{width:72px;height:54px;object-fit:contain;display:block;background:#fff;border:1px solid var(--line);border-radius:8px}
table.tools td.pic a:hover img{border-color:var(--amber)}
table.tools td.code a{font-family:"Kanit";font-weight:600;color:var(--amber-dark);white-space:nowrap;text-decoration:none;border-bottom:1px dashed var(--amber)}
table.tools td.code a:hover{background:var(--amber-soft)}
table.tools td b{font-family:"Kanit";font-weight:500;display:block}
table.tools td small{color:var(--ink-mute);font-size:.78rem}
table.tools td .note{font-size:.78rem;color:var(--ink-dim);margin-top:4px;max-width:320px}
table.tools td.nm .famnote{font-size:.78rem;color:var(--amber-dark);margin-top:4px;max-width:320px}
.cta-band{background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:28px;margin-top:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
.cta-band h2{color:#fff;font-size:1.25rem;margin:0 0 4px}
.cta-band p{color:#c2cbde;margin:0;font-size:.9rem}
@media(max-width:600px){.findbar{position:static}table.tools td .note{max-width:none}}
</style>
</head>
<body>
<div id="site-header"></div>

<section class="t-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="../index.html" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <a href="index.html" data-th="สินค้า" data-en="Products">สินค้า</a> › <span>สินค้าตรา M.T.T.</span></nav>
    <div class="hero-grid">
      <div>
        <span class="eyebrow" data-th="แบรนด์ของร้านเอง · ม.ทวีภัณฑ์ สำเพ็ง" data-en="Our own brand · M.T.T. Hardware, Sampheng">แบรนด์ของร้านเอง · ม.ทวีภัณฑ์ สำเพ็ง</span>
        <h1>สินค้าตรา M.T.T. <span style="color:var(--amber-dark)">ตราสิงโต</span></h1>
        <p class="muted" data-th="สินค้าที่ผลิตภายใต้แบรนด์ของ ม.ทวีภัณฑ์ เอง ปั๊มรูปสิงโตและอักษร M.T.T. บนตัวสินค้า ครอบคลุมกุญแจ เข็มกลัดซ่อนปลาย ประแจเลื่อน มีดครัว และเครื่องมือช่าง — ทุกรายการมีรหัส ขนาด และจำนวนต่อลังระบุชัด กดที่รหัสเพื่อถามราคาทาง LINE ได้ทันที" data-en="Products made under M.T.T. Hardware's own brand, embossed with the lion and the letters M.T.T. — padlocks, safety pins, adjustable wrenches, kitchen knives and hand tools. Every item lists its code, size and carton quantity; tap a code to ask the price on LINE.">สินค้าที่ผลิตภายใต้แบรนด์ของ ม.ทวีภัณฑ์ เอง ปั๊มรูปสิงโตและอักษร M.T.T. บนตัวสินค้า ครอบคลุมกุญแจ เข็มกลัดซ่อนปลาย ประแจเลื่อน มีดครัว และเครื่องมือช่าง — ทุกรายการมีรหัส ขนาด และจำนวนต่อลังระบุชัด กดที่รหัสเพื่อถามราคาทาง LINE ได้ทันที</p>
        <div class="trust">
          <span class="badge">🦁 ${total} <span data-th="รายการ" data-en="items">รายการ</span></span>
${withPics ? `          <span class="badge">📷 ` + nPics + ` <span data-th="รายการมีรูปสินค้า" data-en="with product photos">รายการมีรูปสินค้า</span></span>\n` : ""}
          <span class="badge" data-th="🏷️ ราคาปลีก-ส่ง" data-en="🏷️ Retail &amp; wholesale">🏷️ ราคาปลีก-ส่ง</span>
          <span class="badge" data-th="🚚 ส่งทั่วไทย" data-en="🚚 Nationwide">🚚 ส่งทั่วไทย</span>
        </div>
        <nav class="secnav" aria-label="หมวดสินค้าตรา M.T.T.">
${SECTIONS.filter((s) => bySection[s.key].length).map((s) => `          <a href="#${s.key}">${s.icon} ${esc(s.th)}</a>`).join("\n")}
        </nav>
      </div>
      <div class="hero-pic"><img src="../assets/img/products/mtt-brand.webp" alt="สินค้าตรา M.T.T. ตราสิงโต — กุญแจ เข็มกลัด ประแจเลื่อน ปืนยิงกาว" width="1200" height="900" fetchpriority="high"></div>
    </div>

    <h2 class="vh" data-th="ทำไมต้องสินค้าตรา M.T.T." data-en="Why M.T.T. brand">ทำไมต้องสินค้าตรา M.T.T.</h2>
    <div class="why">
      <div class="card"><h3 data-th="ปั๊มตราบนตัวสินค้า" data-en="Embossed on the product">ปั๊มตราบนตัวสินค้า</h3><p data-th="กุญแจสิงห์เงิน-สิงห์ทองปั๊มรูปสิงโตและ M.T.T. บนตัวกุญแจ แพ็กเกจพิมพ์ MTT INTERNATIONAL CO.,LTD. ตรวจสอบของแท้ได้ด้วยตา" data-en="Silver- and gold-lion padlocks carry the lion and M.T.T. on the body, and the card prints MTT INTERNATIONAL CO.,LTD. — easy to verify by eye.">กุญแจสิงห์เงิน-สิงห์ทองปั๊มรูปสิงโตและ M.T.T. บนตัวกุญแจ แพ็กเกจพิมพ์ MTT INTERNATIONAL CO.,LTD. ตรวจสอบของแท้ได้ด้วยตา</p></div>
      <div class="card"><h3 data-th="คีย์อะไลค์ ดอกเดียวไขทั้งชุด" data-en="Keyed alike — one key, whole set">คีย์อะไลค์ ดอกเดียวไขทั้งชุด</h3><p data-th="ชุดสิงห์เงิน 3 และ 5 ลูก ขนาด 40 และ 50 มม. ไขด้วยดอกเดียวกัน เหมาะกับร้านค้า โกดัง หอพัก ที่ไม่อยากถือกุญแจเป็นพวง" data-en="Silver-lion sets of 3 or 5 locks in 40 and 50 mm that all open on one key — for shops, warehouses and rental blocks that don't want a ring full of keys.">ชุดสิงห์เงิน 3 และ 5 ลูก ขนาด 40 และ 50 มม. ไขด้วยดอกเดียวกัน เหมาะกับร้านค้า โกดัง หอพัก ที่ไม่อยากถือกุญแจเป็นพวง</p></div>
      <div class="card"><h3 data-th="ครบเบอร์ ครบสเปค" data-en="Every size, full specs">ครบเบอร์ ครบสเปค</h3><p data-th="เข็มกลัด 8 เบอร์ ประแจเลื่อน 7 ขนาด กุญแจ 3 ขนาด คอสั้น-คอยาว ทุกรายการระบุรหัส ขนาด และจำนวนต่อลังจากแคตตาล็อกโดยตรง" data-en="Eight pin sizes, seven wrench sizes, three padlock sizes in short or long shackle — every row carries its code, size and carton count straight from the catalogue.">เข็มกลัด 8 เบอร์ ประแจเลื่อน 7 ขนาด กุญแจ 3 ขนาด คอสั้น-คอยาว ทุกรายการระบุรหัส ขนาด และจำนวนต่อลังจากแคตตาล็อกโดยตรง</p></div>
    </div>
  </div>
</section>

<section style="padding-top:10px">
  <div class="wrap">
    <div class="findbar">
      <label class="vh" for="findInput" data-th="ค้นหาสินค้าตรา M.T.T." data-en="Search M.T.T. products">ค้นหาสินค้าตรา M.T.T.</label>
      <input id="findInput" type="search" autocomplete="off" placeholder="ค้นรหัสหรือชื่อสินค้า เช่น กุญแจสิงห์ทอง-40L หรือ เข็มกลัด">
      <div class="hit" id="findHit" hidden></div>
    </div>

${SECTIONS.map(sectionHTML).filter(Boolean).join("\n\n")}

    <div class="cta-band">
      <div>
        <h2 data-th="ต้องการราคาส่งสินค้าตรา M.T.T.? ทัก LINE ได้เลย" data-en="Want wholesale prices on M.T.T. products? Message us on LINE">ต้องการราคาส่งสินค้าตรา M.T.T.? ทัก LINE ได้เลย</h2>
        <p data-th="กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้" data-en="Tap any item number and LINE opens with the message ready — or just tell us what you need and we'll check stock and quote.">กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้</p>
      </div>
      <a class="btn btn-primary" data-line-ask="สอบถามราคาสินค้าตรา M.T.T. (ตราสิงโต)" href="#" target="_blank" rel="noopener" data-th="ทัก LINE ถามราคา" data-en="Ask on LINE">ทัก LINE ถามราคา</a>
    </div>
  </div>
</section>

<div id="site-footer"></div>

<script>window.MTT_BASE="../";window.MTT_PAGE="products";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=2"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script>
document.querySelectorAll("[data-line-ask]").forEach(function(a){
  a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
});
(function(){
  var inp=document.getElementById("findInput"), hit=document.getElementById("findHit");
  if(!inp) return;
  var wraps=[].slice.call(document.querySelectorAll(".tblwrap"));
  var blocks=wraps.map(function(w){
    var head=w.previousElementSibling;
    while(head && !/^H3$/.test(head.tagName)) head=head.previousElementSibling;
    var extras=[];
    for(var e=w.previousElementSibling; e && e!==head; e=e.previousElementSibling) extras.push(e);
    var src=w.nextElementSibling && w.nextElementSibling.classList.contains("srcline") ? w.nextElementSibling : null;
    return { wrap:w, head:head, extras:extras, src:src, rows:[].slice.call(w.querySelectorAll("tbody tr")) };
  });
  function apply(){
    var q=inp.value.trim().toLowerCase(); var n=0;
    blocks.forEach(function(b){
      var shown=0;
      b.rows.forEach(function(r){
        var ok = !q || (r.textContent + " " + (r.dataset.nth || "") + " " + (r.dataset.nen || "")).toLowerCase().indexOf(q) >= 0;
        r.hidden = !ok; if(ok) shown++;
      });
      n += shown;
      var off = q && shown===0;
      b.wrap.hidden = off; if(b.head) b.head.hidden = off; if(b.src) b.src.hidden = off;
      b.extras.forEach(function(e){ e.hidden = off; });
    });
    relead();
    if(q){ hit.hidden=false; hit.textContent = n ? ("พบ " + n + " รายการ") : "ไม่พบรายการที่ค้นหา — ลองพิมพ์รหัสหรือชื่อสั้นลง"; }
    else { hit.hidden=true; }
  }
  function relead(){
    var seen={};
    blocks.forEach(function(b){
      b.rows.forEach(function(r){
        var t=r.querySelector(".nmtxt"); if(!t || r.hidden) return;
        var f=b.wrap.id + "|" + r.dataset.fam;
        if(seen[f]){ t.textContent=""; return; }
        seen[f]=true;
        if(t.querySelector("b")) return;
        t.textContent="";
        var bEl=document.createElement("b"); bEl.textContent=r.dataset.nth||"";
        var sEl=document.createElement("small"); sEl.textContent=r.dataset.nen||"";
        t.appendChild(bEl); t.appendChild(sEl);
      });
    });
  }
  inp.addEventListener("input", apply);
})();
</script>
<script src="../assets/js/layout.js?v=2"></script>
<script src="/_vercel/insights/script.js" defer></script>
</body>
</html>
`;
writeFileSync(`products/${FILE}`, html);
console.log(`สร้าง products/${FILE}: ${total} รายการ · รูป ${nPics} · title ${TITLE.length} · desc ${DESC.length}`);
for (const s of SECTIONS) console.log(`  ${s.th}: ${bySection[s.key].reduce((m, g) => m + g.items.length, 0)}`);
