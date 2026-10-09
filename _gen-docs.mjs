/* ============================================================
   _gen-docs.mjs — สร้าง docs/marketplace-listing.md (ชื่อสินค้า คำอธิบาย และรูปสำหรับลง Shopee/Lazada)
   จาก data/pins.json และ assets/js/catalog.js ตัวเลขทุกตัวจึงตรงกับเว็บเสมอ
   รัน: node _gen-docs.mjs [--check]   (อยู่ใน npm run gen)
   ราคาเข็มกลัดที่ยังเป็น null ใน pins.json จะขึ้นว่า "รอราคาจากร้าน" — ห้ามใส่ตัวเลขเดา
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";
import vm from "vm";
import { PINS, BRAND, packStr } from "./_gen-pins-lib.mjs";

const SITE = "https://mtthardware.com";
const sb = { window: {}, document: { documentElement: { lang: "th", getAttribute: () => "th" } } };
vm.runInNewContext(readFileSync("assets/js/shop-config.js", "utf8") + ";" + readFileSync("assets/js/catalog.js", "utf8") + ";this.C = window.CATALOG || CATALOG;", sb);
const C = sb.C, SHOP = sb.window.SHOP;
const JET = C.products.find((p) => p.id === "jet-lighter");
const utm = (path, campaign) => `${SITE}${path}?utm_source=shopee&utm_medium=marketplace&utm_campaign=${campaign}`;
const baht = (n) => `${Number(n).toLocaleString("en-US")} บาท`;
const UNIT = { packet: "ซอง", bunch: "พวง (12 ตัว)", gross: "กุรุส (144 ตัว)", box: "กล่อง" };

const out = [];
out.push(`# ลงสินค้าบน Shopee / Lazada

ไฟล์นี้สร้างอัตโนมัติจาก \`data/pins.json\` และ \`assets/js/catalog.js\` ด้วย \`node _gen-docs.mjs\` (อยู่ใน \`npm run gen\`)
ห้ามแก้ไฟล์นี้ด้วยมือ ถ้าตัวเลขต้องเปลี่ยน ให้แก้ที่ไฟล์ข้อมูลแล้วรัน gen ใหม่ เว็บกับร้านบนแพลตฟอร์มจะได้ตรงกันทุกตัวเลข

## หลักการ

- ชื่อร้านบนแพลตฟอร์มใช้ "${SHOP.name_th || "ม.ทวีภัณฑ์"}" ให้ตรงกับเว็บ และระบุว่าเป็นร้านทางการของ${BRAND.name_th}
- ทุกสินค้าใส่ลิงก์กลับเว็บในคำอธิบาย ลิงก์มี UTM \`utm_source=shopee\` ไว้แยกยอดคนที่มาจากแพลตฟอร์มใน Vercel Analytics
  ถ้าลงบน Lazada ให้เปลี่ยน \`utm_source=shopee\` เป็น \`utm_source=lazada\`
- เมื่อเปิดร้านแล้ว ส่งลิงก์ร้านให้ผู้ดูแลเว็บใส่ใน \`data/pins.json\` ช่อง \`marketplaces\` เช่น
  \`[{ "name": "Shopee", "url": "https://shopee.co.th/ชื่อร้าน" }]\`
  หน้าเข็มกลัดตราสิงโตจะแสดงลิงก์ร้านทางการให้เอง
- ห้ามอ้างมาตรฐานหรือใบรับรองใด ๆ ในชื่อหรือคำอธิบาย เพราะเว็บไม่ได้อ้างไว้
- รูป: ใช้รูปจากโฟลเดอร์ที่ระบุ รูปกล่องจริงของแต่ละเบอร์ยังไม่มี เมื่อร้านถ่ายแล้วให้ใช้เป็นรูปที่ 1

## คำอธิบายร้าน (ใส่ในหน้าร้าน)

ม.ทวีภัณฑ์ สำเพ็ง ร้านเครื่องมือช่างและฮาร์ดแวร์ ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย และเจ้าของแบรนด์${BRAND.name_th} M.T.T.
ขายทั้งปลีกและส่ง เข็มกลัดนับจำนวนจริงทุกกล่อง ออกใบกำกับภาษีเต็มรูปได้
ดูสเปกครบทุกรุ่นและบทความแนะนำการเลือกซื้อที่ ${utm("/", "shop_profile")}
สั่งจำนวนมากหรือขอใบเสนอราคา ทัก LINE ${SHOP.LINE_ID || "@wynnstools"}
`);

out.push(`## เข็มกลัดซ่อนปลาย${BRAND.name_th} (${PINS.length} เบอร์)\n`);
for (const p of PINS) {
  const units = ["packet", "bunch", "gross", "box"].filter((u) => p.units.includes(u));
  const prices = units.map((u) => `${UNIT[u]}: ${typeof (p.price || {})[u] === "number" ? baht(p.price[u]) : "รอราคาจากร้าน"}`);
  const title = `เข็มกลัดซ่อนปลาย ${BRAND.name_th} เบอร์ ${p.no} ยาว ${p.mm} มม. ยกกล่อง ${packStr(p)} ตัว`;
  out.push(`### เบอร์ ${p.no}

**ชื่อสินค้า** (${[...title].length} ตัวอักษร)
${title}

**คำอธิบาย**
เข็มกลัดซ่อนปลาย${BRAND.name_th} เบอร์ ${p.no}${p.aka_th && p.aka_th !== "—" ? ` หรือที่เรียกว่า ${p.aka_th}` : ""}
- ยาว ${p.mm} มม. (${p.cm} ซม. / ${p.inch}) ลวดหนา ${p.wire} มม. เหล็กสปริงชุบนิกเกิลสีเงิน ปลายเข็มซ่อนในฝาครอบ
- บรรจุ${p.packing_th === "ซอง" ? "ซองซีลตราสิงโต" : "พวงละ 12 ตัว"} กล่องละ ${packStr(p)} ตัว นับจำนวนจริง ไม่ชั่งน้ำหนัก
- เหมาะกับ: ${p.uses_th.join(" / ")}
- แบรนด์ของ ม.ทวีภัณฑ์ สำเพ็ง ซื้อตรงจากต้นทาง ออกใบกำกับภาษีได้
- ดูตารางขนาดและรูปจริงทุกเบอร์: ${utm(`/products/safety-pins-${p.no}.html`, `pin_${p.no}`)}

**ตัวเลือกและราคา**
${prices.map((x) => `- ${x}`).join("\n")}

**รูปที่ควรใช้**
1. รูปกล่องหรือซองจริงของเบอร์ ${p.no} (รอร้านถ่าย ใช้เป็นรูปแรกเมื่อได้แล้ว)
2. \`assets/img/products/pin-${p.no}.webp\`
3. \`assets/img/products/safety-pin-sizes.webp\` (ตารางขนาดทุกเบอร์)
`);
}

out.push(`## ${JET.name_th}\n`);
for (const v of JET.variants) {
  const colors = (v.colors || []).map((c) => c.th || c.name_th || c.key).join(" ");
  const title = `${JET.name_th} ${v.name_th} ${v.code} ไฟแช็กหัวพ่นไฟ เจอลมไม่ดับ เติมแก๊สได้`;
  out.push(`### ${v.name_th} ${v.code}

**ชื่อสินค้า** (${[...title].length} ตัวอักษร)
${title}

**คำอธิบาย**
${JET.tagline_th}
- ${v.spec_th}
- สีที่มี: ${colors}
- ยกกล่องได้ราคาส่ง คละสีในกล่อง
- ดูคลิป เลือกสี และราคาส่งยกกล่อง: ${utm("/products/jet-lighter.html", `jet_${v.key}`)}

**ตัวเลือกและราคา** (ตรงกับหน้าเว็บ ถ้าราคาบนแพลตฟอร์มต้องต่างเพราะค่าธรรมเนียม ให้แก้ \`assets/js/catalog.js\` และระบุในคำอธิบาย)
${v.options.map((o) => `- ${o.label_th}${o.note_th ? ` (${o.note_th})` : ""}: ${baht(o.price)}`).join("\n")}

**รูปที่ควรใช้**
${[v.img_colors, v.img_box, v.img_life].filter(Boolean).map((x, k) => `${k + 1}. \`${x}\``).join("\n")}
`);
}

const md = out.join("\n");
const file = "docs/marketplace-listing.md";
if (process.argv.includes("--check")) {
  if (readFileSync(file, "utf8") !== md) { console.error(`${file} ไม่ตรงกับข้อมูลล่าสุด — รัน node _gen-docs.mjs`); process.exit(1); }
  console.log(`${file} ตรงกับข้อมูลล่าสุด`);
} else { writeFileSync(file, md); console.log(`${file}: ${PINS.length} เบอร์ + ไฟฟู่ ${JET.variants.length} รุ่น`); }
