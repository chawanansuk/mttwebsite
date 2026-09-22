/* ============================================================
   หน้ารวมสินค้าแบรนด์ร้านเอง "ตรา M.T.T. / ตราสิงโต"
   ดึงเฉพาะรายการที่ทำเครื่องหมาย brand:"MTT" ใน data/wynn-tools.json
   รันด้วย: node _gen-mtt-page.mjs   (หรือ npm run gen)
   โค้ดตาราง/หัว/สคริปต์ร่วมอยู่ใน _gen-lib.mjs
   ============================================================ */
import { writeFileSync } from "fs";
import { SITE, DATA, esc, bi, groupHTML, headHTML, scriptsHTML, crumbsHTML, ctaBandHTML } from "./_gen-lib.mjs";

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

/* ตารางกลุ่ม + ลิงก์กลับหมวดต้นทาง — ใช้ groupHTML ร่วมกับหน้าหมวด; ดัชนี g$i ต้องไม่ซ้ำข้ามเซกชัน */
let gi = 0;
function sectionHTML(s) {
  const gs = bySection[s.key];
  if (!gs.length) return "";
  const n = gs.reduce((m, g) => m + g.items.length, 0);
  const tables = gs.map((g) => {
    const after = `\n    <p class="srcline"><a href="${CAT_FILE[g.srcCat.id]}" data-th="ดูทั้งหมวด${esc(g.srcCat.th)} →" data-en="See the whole ${esc(g.srcCat.en || g.srcCat.th)} category →">ดูทั้งหมวด${esc(g.srcCat.th)} →</a></p>`;
    return groupHTML(g, gi++, "ตรา M.T.T.", after);
  }).join("\n\n");
  return `    <h2 class="sec-h" id="${s.key}"><span class="ic" aria-hidden="true">${s.icon}</span> ${bi(s.th, s.en)} <small>${bi(s.en, s.th)} · ${n} ${bi("รายการ", "items")}</small></h2>
    <p class="sec-lead" data-th="${esc(s.lead_th)}" data-en="${esc(s.lead_en)}">${esc(s.lead_th)}</p>
${tables}`;
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
    { "@type": "ListItem", position: 2, name: "สินค้า", item: `${SITE}/products` },
    { "@type": "ListItem", position: 3, name: "สินค้าตรา M.T.T.", item: URL },
  ],
};

const STYLE = `.hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center}
.hero-grid>div{min-width:0} /* grid item ต้องหดได้ ไม่งั้นแถบชิป nowrap ดันความกว้างจนหน้าล้น */
@media(max-width:820px){.hero-grid{grid-template-columns:1fr}}
.t-hero .muted{max-width:640px}
.hero-pic img{width:100%;height:auto;display:block;border-radius:var(--radius-lg);border:1px solid var(--line);background:#fff}
.why{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:26px 0 6px}
@media(max-width:720px){.why{grid-template-columns:1fr}}
.why .card{padding:18px}
.why h3{font-size:1rem;margin:0 0 6px}
.why p{font-size:.875rem;color:var(--ink-dim);margin:0}
.sec-h{font-size:clamp(1.25rem,2.6vw,1.6rem);margin:42px 0 4px;scroll-margin-top:140px}
.sec-h .ic{font-size:1.2em;vertical-align:-2px;margin-right:4px}
.sec-h small{display:block;font-family:var(--font-body);font-weight:500;font-size:.82rem;color:var(--ink-mute);margin-top:2px}
.sec-lead{color:var(--ink-dim);max-width:760px;margin:0 0 6px;font-size:.9rem}`;

const head = headHTML({
  title: TITLE, desc: DESC, kw: KW, url: URL,
  ogTitle: `สินค้าตรา M.T.T. ตราสิงโต — ${total} รายการ แบรนด์ของ ม.ทวีภัณฑ์`,
  ogDesc: DESC.slice(0, 110),
  ogImage: `${SITE}/assets/img/products/mtt-brand.webp`,
  ld: [crumbs, brand, itemList],
  style: STYLE,
});

const html = `${head}
<body>
<div id="site-header"></div>
<main id="main">
<section class="t-hero mtt">
  <div class="wrap">
${crumbsHTML(`<a href="/products" data-th="สินค้า" data-en="Products">สินค้า</a>`, "สินค้าตรา M.T.T.")}
    <div class="hero-grid">
      <div>
        <span class="eyebrow" data-th="แบรนด์ของร้านเอง · ม.ทวีภัณฑ์ สำเพ็ง" data-en="Our own brand · M.T.T. Hardware, Sampheng">แบรนด์ของร้านเอง · ม.ทวีภัณฑ์ สำเพ็ง</span>
        <h1>${bi("สินค้าตรา M.T.T.", "M.T.T. brand products")} <span style="color:var(--amber-dark)" data-th="ตราสิงโต" data-en="Lion brand">ตราสิงโต</span></h1>
        <p class="muted" data-th="สินค้าที่ผลิตภายใต้แบรนด์ของ ม.ทวีภัณฑ์ เอง ปั๊มรูปสิงโตและอักษร M.T.T. บนตัวสินค้า ครอบคลุมกุญแจ เข็มกลัดซ่อนปลาย ประแจเลื่อน มีดครัว และเครื่องมือช่าง — ทุกรายการมีรหัส ขนาด และจำนวนต่อลังระบุชัด กดที่รหัสเพื่อถามราคาทาง LINE ได้ทันที" data-en="Products made under M.T.T. Hardware's own brand, embossed with the lion and the letters M.T.T. — padlocks, safety pins, adjustable wrenches, kitchen knives and hand tools. Every item lists its code, size and carton quantity; tap a code to ask the price on LINE.">สินค้าที่ผลิตภายใต้แบรนด์ของ ม.ทวีภัณฑ์ เอง ปั๊มรูปสิงโตและอักษร M.T.T. บนตัวสินค้า ครอบคลุมกุญแจ เข็มกลัดซ่อนปลาย ประแจเลื่อน มีดครัว และเครื่องมือช่าง — ทุกรายการมีรหัส ขนาด และจำนวนต่อลังระบุชัด กดที่รหัสเพื่อถามราคาทาง LINE ได้ทันที</p>
        <div class="trust">
          <span class="badge lion">${total} ${bi("รายการ", "items")}</span>
          <span class="badge" data-th="ราคาปลีก-ส่ง" data-en="Retail &amp; wholesale">ราคาปลีก-ส่ง</span>
          <span class="badge" data-th="ส่งทั่วไทย" data-en="Nationwide">ส่งทั่วไทย</span>
        </div>
        <nav class="grpnav" aria-label="หมวดสินค้าตรา M.T.T.">
${SECTIONS.filter((s) => bySection[s.key].length).map((s) => `          <a href="#${s.key}"><span aria-hidden="true">${s.icon}</span> ${bi(s.th, s.en)}</a>`).join("\n")}
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
      <input id="findInput" type="search" autocomplete="off" placeholder="ค้นรหัสหรือชื่อสินค้า เช่น กุญแจสิงห์ทอง-40L หรือ เข็มกลัด" data-th-placeholder="ค้นรหัสหรือชื่อสินค้า เช่น กุญแจสิงห์ทอง-40L หรือ เข็มกลัด" data-en-placeholder="Search code or name, e.g. safety pin">
      <div class="hit" id="findHit" hidden></div>
    </div>

${SECTIONS.map(sectionHTML).filter(Boolean).join("\n\n")}

${ctaBandHTML("ต้องการราคาส่งสินค้าตรา M.T.T.? ทัก LINE ได้เลย", "Want wholesale prices on M.T.T. products? Message us on LINE", "สอบถามราคาสินค้าตรา M.T.T. (ตราสิงโต)")}
  </div>
</section>
</main>

<div id="site-footer"></div>

${scriptsHTML("products")}
</body>
</html>
`;

writeFileSync("products/" + FILE, html);
console.log(`สร้าง products/${FILE} — ${total} รายการ (title ${TITLE.length} · desc ${DESC.length})`);
for (const s of SECTIONS) console.log(`  ${s.th}: ${bySection[s.key].reduce((m, g) => m + g.items.length, 0)}`);
