/* สร้างรูปย่อ 640px (ชื่อ <เดิม>-640.webp) สำหรับรูปที่แสดงจริงกว้างไม่เกิน ~450px — รันซ้ำได้ ข้ามไฟล์ที่มีแล้ว */
import pw from "playwright"; import { writeFileSync, existsSync } from "fs"; import { pathToFileURL } from "url";
const LIST = ["jet-lighter","wynn-tools","mtt-brand","jet-compact-colors","jet-large-colors","jet-compact-lifestyle","jet-large-lifestyle","jet-compact-box","jet-large-box","jet-lighter-flame"];
const br = await pw.chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--allow-file-access-from-files"] });
const pg = await br.newPage(); await pg.goto(pathToFileURL(process.cwd() + "/index.html").href);
const root = pathToFileURL(process.cwd() + "/").href;
for (const n of LIST) {
  const out = `assets/img/products/${n}-640.webp`; if (existsSync(out) && !process.argv.includes("--force")) continue;
  const data = await pg.evaluate(async ({ root, n }) => {
    const im = new Image(); im.src = root + `assets/img/products/${n}.webp`; await im.decode();
    const W = 640, H = Math.round(im.height * W / im.width); const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(im, 0, 0, W, H); return c.toDataURL("image/webp", 0.82);
  }, { root, n });
  const buf = Buffer.from(data.split(",")[1], "base64"); writeFileSync(out, buf); console.log(out, Math.round(buf.length / 1024) + "KB");
}
await br.close();
