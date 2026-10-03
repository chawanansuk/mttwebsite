/* ============================================================
   test/fonts.mjs — ใช้ฟอนต์จริง (Kanit/Anuphan) แบบออฟไลน์ระหว่างทดสอบ
   หน้าเว็บโหลดฟอนต์จาก Google Fonts — ในเครื่องที่ต่อ Google ไม่ได้ เบราว์เซอร์จะใช้ฟอนต์สำรอง
   ทำให้ความกว้างข้อความ/การตัดบรรทัดไม่ตรงกับเว็บจริงและไม่ตรงกับ CI (ที่โหลดฟอนต์จริงได้)
   ตัวนี้ดักคำขอ fonts.googleapis.com / fonts.gstatic.com แล้วส่งไฟล์จาก @fontsource ใน node_modules
   → ทุกเครื่องได้ฟอนต์ชุดเดียวกัน ผลทดสอบเลย์เอาต์ตรงกัน และไม่ต้องรอเน็ตภายนอก
   ============================================================ */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const FAMILIES = { Kanit: "kanit", Anuphan: "anuphan" };
const CDN = "https://fonts.gstatic.com/mtt-local/";

/* CSS แบบเดียวกับที่ Google ส่ง: @font-face ต่อ subset พร้อม unicode-range */
function cssFor(query) {
  const out = [];
  for (const m of query.matchAll(/family=([A-Za-z+]+):wght@([\d;]+)/g)) {
    const pkg = FAMILIES[m[1].replace(/\+/g, " ")];
    if (!pkg) continue;
    for (const w of m[2].split(";")) {
      const f = join(ROOT, "node_modules/@fontsource", pkg, `${w}.css`);
      if (existsSync(f)) out.push(readFileSync(f, "utf8").replace(/url\(\.\/files\/([^)]+)\)/g, (_, file) => `url(${CDN}${pkg}/${file})`));
    }
  }
  return out.join("\n");
}

export function hasLocalFonts() { return existsSync(join(ROOT, "node_modules/@fontsource/kanit/500.css")); }

/* ติดตั้งกับ browser: ทุก context ที่สร้างหลังจากนี้ (รวม browser.newPage) ได้ฟอนต์ออฟไลน์ */
export function useLocalFonts(browser) {
  if (!hasLocalFonts()) return false;
  const orig = browser.newContext.bind(browser);
  browser.newContext = async (opts) => {
    const ctx = await orig(opts);
    await ctx.route("https://fonts.googleapis.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: cssFor(decodeURIComponent(route.request().url())) }));
    await ctx.route("https://fonts.gstatic.com/**", (route) => {
      const m = route.request().url().match(/mtt-local\/(\w+)\/([\w.-]+)$/);
      const f = m && join(ROOT, "node_modules/@fontsource", m[1], "files", m[2]);
      if (f && existsSync(f)) return route.fulfill({ status: 200, contentType: m[2].endsWith(".woff2") ? "font/woff2" : "font/woff", body: readFileSync(f) });
      return route.abort();
    });
    return ctx;
  };
  return true;
}
