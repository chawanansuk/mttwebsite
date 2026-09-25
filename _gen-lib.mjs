/* ============================================================
   โค้ดร่วมของ generator หน้าแคตตาล็อก (tools-*.html และ mtt-brand.html)
   — ก่อนหน้านี้ทั้งสองไฟล์ copy ฟังก์ชัน rows()/groupHTML()/CSS/สคริปต์ค้นหา
     ซ้ำกันทั้งชุด แก้ที่หนึ่งแล้วลืมอีกที่ จึงรวมไว้ที่เดียว
   CSS ตารางอยู่ที่ assets/css/catalog.css, สคริปต์ค้นหาอยู่ที่ assets/js/catalog-find.js
   ============================================================ */
import { readFileSync } from "fs";

export const SITE = "https://mtthardware.com";
export const DATA = JSON.parse(readFileSync("data/wynn-tools.json", "utf8"));

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const jstr = (s) => JSON.stringify(s);
export const slug = (c) => String(c).replace(/\//g, "-");

/* ข้อความสองภาษา: ใส่ data-th/data-en บน <span> ที่ครอบ "ข้อความล้วน" เท่านั้น
   เพราะ layout.js สลับภาษาด้วย innerHTML — ถ้าใส่บน element ที่มีลูกเป็น <a>/<b> ลูกจะหาย */
export const bi = (th, en, tag = "span", cls = "") =>
  `<${tag}${cls ? ` class="${cls}"` : ""} data-th="${esc(th)}" data-en="${esc(en || th)}">${esc(th)}</${tag}>`;

/* ---------- จัดโครงข้อมูล ---------- */

/* แคตตาล็อกต้นฉบับแยกกลุ่มต่อ SKU ในบางหมวด (กรรไกรตัดกิ่ง 13 กลุ่ม กลุ่มละ 1 รายการ)
   ทำให้หน้าเว็บมีหัวข้อ+ตารางซ้ำติดกัน 13 รอบ — รวมกลุ่มที่ชื่อไทยเดียวกันและอยู่ติดกันเป็นตารางเดียว
   วัสดุ/โน้ตระดับกลุ่มที่ต่างกันย้ายลงไปเป็นของรายการ เพื่อไม่ให้ข้อมูลหาย */
export function mergeGroups(groups) {
  /* รวมตามชื่อไทยทั้งหมวด (ไม่ใช่แค่ที่ติดกัน) — garden มี "กรรไกรตัดกิ่ง" กระจายอยู่ 3 ช่วง
     ลำดับกลุ่มยึดตามตำแหน่งที่ชื่อนั้นปรากฏครั้งแรก */
  const order = []; const byTh = new Map();
  for (const g of groups) {
    if (!byTh.has(g.th)) { byTh.set(g.th, []); order.push(g.th); }
    byTh.get(g.th).push(g);
  }
  return order.map((th) => {
    const srcs = byTh.get(th);
    if (srcs.length === 1) return srcs[0];
    const mats = [...new Set(srcs.map((g) => g.mat || "").filter(Boolean))];
    const ens = [...new Set(srcs.map((g) => g.en || "").filter(Boolean))];
    /* โน้ตระดับกลุ่ม: เก็บไว้ที่กลุ่มเฉพาะข้อที่ทุกกลุ่มย่อยมีเหมือนกัน ที่เหลือย้ายไปเป็นโน้ตของรายการ
       (ไม่งั้นโน้ต 4 ข้อ × 13 SKU กลายเป็นกำแพง 22 bullet เหนือตารางเดียว) */
    const common = (srcs[0].notes_th || []).filter((n) => srcs.every((g) => (g.notes_th || []).includes(n)));
    const items = srcs.flatMap((g) => {
      const own = (g.notes_th || []).filter((n) => !common.includes(n));
      return g.items.map((x) => {
        const y = { ...x };
        if (mats.length > 1 && !y.mat && g.mat) y.mat = g.mat;
        if (own.length) y.notes_th = [y.notes_th, own.join(" · ")].filter(Boolean).join(" · ");
        return y;
      });
    });
    return { ...srcs[0], en: ens.join(" / "), mat: mats.length === 1 ? mats[0] : "", notes_th: common, items };
  });
}

/* ตระกูล = รายการชื่อไทย+อังกฤษเดียวกันที่เรียงติดกัน "และวัสดุเดียวกัน"
   (ก่อนหน้านี้ไม่ดูวัสดุ ทำให้ประแจแอล SK-45 ถูกจับรวมกับรุ่น S-2 แล้วซ่อนชื่อ)
   พิมพ์ชื่อแค่แถวแรกของตระกูล ไม่ใช้ rowspan เพราะช่องค้นหาซ่อนแถวได้ */
export function families(items) {
  const fams = [];
  for (const x of items) {
    const l = fams[fams.length - 1];
    const sameMat = l && (!l.mat || !x.mat || l.mat === x.mat);
    /* รวมเป็นตระกูลเฉพาะ "เบอร์ต่างกันของสินค้าเดียวกัน": โรงงานติด pic_same หรือไม่มีรูปทั้งคู่
       ถ้าต่างคนต่างมีรูปของตัวเอง ถือเป็นคนละสินค้า พิมพ์ชื่อทุกแถว */
    const sameKind = l && ((x.pic_same && l.items[0].pic_same) || (!x.img && !l.items[0].img));
    if (l && l.th === x.th && l.en === x.en && sameMat && sameKind) { l.items.push(x); if (!l.mat) l.mat = x.mat || ""; }
    else fams.push({ th: x.th, en: x.en, mat: x.mat || "", items: [x] });
  }
  return fams;
}

/* เข็มกลัด MTT ในแคตตาล็อกเครื่องมือมีหน้าเฉพาะเบอร์พร้อมราคาอยู่แล้ว — ลิงก์ข้ามไปให้ */
const PIN_PAGES = new Set(["000", "00", "0", "1", "2", "3", "4", "5", "6", "7"]);
export function pinPage(x) {
  const m = /^เข็มกลัดMTT-(\d+)$/.exec(x.code || "");
  return m && PIN_PAGES.has(m[1]) ? `safety-pins-${m[1]}.html` : null;
}

/* ---------- HTML ตาราง ---------- */

const FAMNOTE_TH = "ทุกเบอร์ในตระกูลนี้หน้าตาเหมือนกัน ต่างที่ขนาด";
const FAMNOTE_EN = "Every size in this family looks alike; only the size differs.";

/* คอลัมน์ที่ไม่มีค่าเลยทั้งกลุ่มไม่พิมพ์ (soldering/hydraulic ไม่มีวัสดุทั้งหมวด เคยพิมพ์หัว "วัสดุ" ว่างๆ) */
export function columns(items) {
  return {
    pic: items.some((x) => x.img),
    size: items.some((x) => x.size),
    pcs: items.some((x) => x.pcs),
    mat: items.some((x) => x.mat),
  };
}

/* brandTh: ชื่อตราสำหรับ alt รูป — รายการที่ติด brand:"MTT" ใช้ตรา M.T.T. แม้จะอยู่ในหมวด WYNNTOOLS */
export function rows(items, cols, brandTh = "WYNNTOOLS", groupTh = null) {
  const out = [];
  families(items).forEach((f, fi) => {
    const sizes = new Set(f.items.map((x) => x.size || ""));
    /* "ใช้รูปเดียวทั้งตระกูล" คือทุกแถวชี้ไฟล์เดียวกันจริง ไม่ใช่แค่ติดธง pic_same
       ตระกูลที่โรงงานให้มาหลายรูป (เช่น ประแจเลื่อน 6" กับ 10") ไม่เข้าเงื่อนไขนี้ */
    const imgs = new Set(f.items.map((x) => x.img || ""));
    const oneSharedPic = f.items.length > 1 && imgs.size === 1 && !!f.items[0].img;
    const shownImgs = new Set();
    /* โน้ตเดียวกันทุกเบอร์ในตระกูล (เช่น "ตัวกุญแจปั๊มนูนรูปสิงห์") พิมพ์ครั้งเดียวที่แถวหัว */
    const sharedNote = f.items.length > 1 && f.items.every((x) => x.notes_th && x.notes_th === f.items[0].notes_th);
    f.items.forEach((x, xi) => {
      const lead = xi === 0;
      const brand = x.brand === "MTT" ? "ตรา M.T.T." : brandTh;
      const ask = `สอบถามราคา ${x.code} ${x.th}${x.size ? " (" + x.size + ")" : ""}`;
      /* แสดงรูปที่ "แถวแรกที่ใช้ไฟล์นั้น" — โรงงานถ่ายรูปเดียวใช้หลายเบอร์ ถ้าวางทุกแถวจะกลายเป็น
         แถว 8 มม. โชว์รูปประแจ 19 มม. แต่ถ้าให้เฉพาะแถวหัวก็จะซ่อนรูปของแถวอื่นที่มีรูปของตัวเองทิ้ง */
      const showPic = !!x.img && !shownImgs.has(x.img);
      if (x.img) shownImgs.add(x.img);
      const pic = !cols.pic ? "" : (showPic
        ? `\n            <td class="pic"><a href="../${x.img}" target="_blank" rel="noopener" aria-label="ดูรูปใหญ่ ${esc(x.code)}"><img src="../${x.img.replace(".webp", "-sm.webp")}" alt="${esc(x.th)}${oneSharedPic ? "" : " " + esc(x.code)} ${esc(brand)}" width="320" height="240" loading="lazy"></a></td>`
        : `\n            <td class="pic"></td>`);
      const famnote = (lead && oneSharedPic && sizes.size > 1) ? `<div class="famnote" data-th="${FAMNOTE_TH}" data-en="${FAMNOTE_EN}">${FAMNOTE_TH}</div>` : "";
      const note = (x.notes_th && (!sharedNote || lead)) ? `<div class="note">${esc(x.notes_th)}</div>` : "";
      const pin = pinPage(x);
      const pinlink = pin ? `<a class="nmlink" href="${pin}" data-th="ดูหน้าเบอร์ ${esc(x.code.split("-")[1])} พร้อมราคา →" data-en="Size ${esc(x.code.split("-")[1])} page with prices →">ดูหน้าเบอร์ ${esc(x.code.split("-")[1])} พร้อมราคา →</a>` : "";
      /* กลุ่มรายการเดียวที่ชื่อสินค้าตรงกับหัวกลุ่มอยู่แล้ว ไม่ต้องพิมพ์ซ้ำในแถว (เปลืองสองบรรทัดต่อสินค้า) */
      const dupOfGroup = items.length === 1 && groupTh && x.th === groupTh;
      const nameHTML = (lead && !dupOfGroup) ? `<b data-th="${esc(x.th)}" data-en="${esc(x.en || x.th)}">${esc(x.th)}</b><small data-th="${esc(x.en || "")}" data-en="${esc(x.en ? x.th : "")}">${esc(x.en || "")}</small>` : "";
      out.push(`          <tr${lead ? ' class="fam-lead"' : ""} data-fam="${fi}" data-nth="${esc(x.th)}" data-nen="${esc(x.en || "")}">${pic}
            <td class="code"><a data-line-ask="${esc(ask)}" href="#" target="_blank" rel="noopener">${esc(x.code)}</a></td>
            <td class="nm"><span class="nmtxt">${nameHTML}</span>${famnote}${note}${pinlink}</td>${cols.size ? `
            <td class="sz">${esc(x.size || "")}</td>` : ""}${cols.pcs ? `
            <td class="pcs">${esc(x.pcs || "")}</td>` : ""}${cols.mat ? `
            <td class="mat">${esc(x.mat || "")}</td>` : ""}
          </tr>`);
    });
  });
  return out.join("\n");
}

/* หนึ่งกลุ่ม = หัวข้อ + วัสดุ + โน้ต + ตาราง (+ HTML ต่อท้าย เช่น ลิงก์กลับหมวดเดิมในหน้า M.T.T.) */
export function groupHTML(g, i, brandTh = "WYNNTOOLS", after = "") {
  const cols = columns(g.items);
  const notes = (g.notes_th || []).map((n) => `<li>${esc(n)}</li>`).join("");
  const n = g.items.length;
  return `    <h3 class="grp-h" id="g${i}">${bi(g.th, g.en)} ${g.en ? `<span class="ge" data-th="${esc(g.en)}" data-en="${esc(g.th)}">${esc(g.en)}</span>` : ""} <em>${n} ${bi("รายการ", "items")}</em></h3>
${g.mat ? `    <p class="grp-mat">${bi("วัสดุ", "Material")}: ${esc(g.mat)}</p>\n` : ""}${notes ? `    <ul class="grp-notes">${notes}</ul>\n` : ""}    <div class="tblwrap" id="tw${i}" tabindex="0" role="region" aria-label="${esc(g.th)}">
      <table class="tools${cols.pic ? " haspic" : ""}">
        <caption class="vh">${esc(g.th)}</caption>
        <thead><tr>
${cols.pic ? `          <th scope="col" class="pic">${bi("รูป", "Photo")}</th>\n` : ""}          <th scope="col">${bi("รหัส", "Item no.")}</th>
          <th scope="col">${bi("ชื่อสินค้า", "Product")}</th>
${cols.size ? `          <th scope="col">${bi("ขนาด", "Size")}</th>\n` : ""}${cols.pcs ? `          <th scope="col">${bi("จำนวน/ลัง", "Per carton")}</th>\n` : ""}${cols.mat ? `          <th scope="col">${bi("วัสดุ", "Material")}</th>\n` : ""}        </tr></thead>
        <tbody>
${rows(g.items, cols, brandTh, g.th)}
        </tbody>
      </table>
    </div>${after}`;
}

/* สารบัญกลุ่มในหน้า — หน้า cutter มี 48 กลุ่มยาว 23,000px แต่ไม่มีทางกระโดด ทั้งที่ h3 มี id อยู่แล้ว */
export function grpNavHTML(groups, label = "กลุ่มสินค้าในหมวดนี้") {
  if (groups.length < 4) return "";
  return `    <nav class="grpnav" aria-label="${esc(label)}">
${groups.map((g, i) => `      <a href="#g${i}">${bi(g.th, g.en)} <small>${g.items.length}</small></a>`).join("\n")}
    </nav>`;
}

/* ---------- <head> และ scripts ร่วม ---------- */

export function headHTML({ title, desc, kw, url, ogTitle, ogDesc, ogImage, ld = [], style = "" }) {
  if (title.length > 62) throw new Error(`title ยาวเกิน (${title.length}) — ${title}`);
  if (desc.length > 155) throw new Error(`description ยาวเกิน (${desc.length}) — ${title}`);
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='th')document.documentElement.classList.add('pending-lang');}catch(e){}</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(kw)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(ogDesc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/theme.css?v=3">
<link rel="stylesheet" href="../assets/css/catalog.css?v=1">
${ld.map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join("\n")}
${style ? `<style>\n${style}\n</style>\n` : ""}</head>`;
}

export function scriptsHTML(page) {
  return `<script>window.MTT_BASE="../";window.MTT_PAGE="${page}";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=3"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script src="../assets/js/catalog-find.js?v=1"></script>
<script src="../assets/js/layout.js?v=4"></script>
<script src="/_vercel/insights/script.js" defer></script>`;
}

/* breadcrumb ที่มองเห็น — ลิงก์หน้าแรกใช้ "/" ให้ตรง canonical (เดิม ../index.html ทำให้ Google เห็น 2 URL) */
export function crumbsHTML(mid, last) {
  return `    <nav class="crumbs" aria-label="breadcrumb"><a href="/" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › ${mid} › <span>${esc(last)}</span></nav>`;
}

export function ctaBandHTML(h2th, h2en, ask) {
  return `    <div class="cta-band">
      <div>
        <h2 data-th="${esc(h2th)}" data-en="${esc(h2en)}">${esc(h2th)}</h2>
        <p data-th="กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้" data-en="Tap any item number and LINE opens with the message ready — or just tell us what you need and we'll check stock and quote.">กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้</p>
      </div>
      <a class="btn btn-primary" data-line-ask="${esc(ask)}" href="#" target="_blank" rel="noopener" data-th="ทัก LINE ถามราคา" data-en="Ask on LINE">ทัก LINE ถามราคา</a>
    </div>`;
}
