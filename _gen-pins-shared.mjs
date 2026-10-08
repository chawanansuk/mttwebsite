/* ============================================================
   _gen-pins-shared.mjs — เติม marker <!--pins:xxx--> ในหน้าเข็มกลัดที่เขียนมือ จาก data/pins.json
   (หน้ารวม ขายส่ง งานวิ่ง ผ้าใบ ผ้าอ้อม ป้ายราคา และหน้าแบรนด์) — หน้ารายเบอร์สร้างโดย _gen-pin-pages.mjs
   รัน: node _gen-pins-shared.mjs [--check]   (อยู่ใน npm run gen ก่อน _chrome.mjs)
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";
import { fillPinMarkers } from "./_gen-pins-lib.mjs";

const PAGES = {
  "products/safety-pins.html": { from: "รวมเข็มกลัด" },
  "products/safety-pins-wholesale.html": { from: "ขายส่ง" },
  "products/safety-pins-running.html": { from: "งานวิ่ง" },
  "products/safety-pins-canvas.html": { from: "ผ้าใบ" },
  "products/safety-pins-diaper.html": { from: "ผ้าอ้อม" },
  "products/safety-pins-tags.html": { from: "ป้ายราคา" },
  "products/safety-pins-lion-brand.html": { from: "ตราสิงโต" },
};
const check = process.argv.includes("--check");
const stale = [];
for (const [file, opt] of Object.entries(PAGES)) {
  const src = readFileSync(file, "utf8");
  const out = fillPinMarkers(src, { base: "../", from: opt.from });
  if (!/<!--pins:/.test(src)) throw new Error(`${file}: ไม่มี marker pins:`);
  if (out === src) continue;
  if (check) stale.push(file); else { writeFileSync(file, out); console.log("เติมข้อมูลเข็มกลัด", file); }
}
if (check && stale.length) { console.error("หน้าเข็มกลัดไม่ตรง data/pins.json — รัน npm run gen:\n  " + stale.join("\n  ")); process.exit(1); }
if (check) console.log("หน้าเข็มกลัดทุกหน้าตรงกับ data/pins.json");
