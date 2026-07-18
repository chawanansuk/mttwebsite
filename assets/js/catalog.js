/* ============================================================
   ม ทวีภัณฑ์ — catalog.js
   แหล่งข้อมูลสินค้า/หมวดหมู่/ราคา "ที่เดียว" (single source of truth)
   ทุกหน้าดึงจากไฟล์นี้ — แก้ราคาที่นี่ที่เดียว มีผลทั้งเว็บ
   ค่าติดต่อ/พร้อมเพย์/LINE อยู่ที่ shop-config.js
   ============================================================ */
window.CATALOG = (function () {
  /* ---------- สี ---------- */
  const colors = [
    { key: "yellow", th: "เหลือง", en: "Yellow", hex: "#f5d000" },
    { key: "green",  th: "เขียว",  en: "Green",  hex: "#5fe84b" },
    { key: "blue",   th: "ฟ้า",    en: "Blue",   hex: "#2fa8ff" },
    { key: "purple", th: "ม่วง",   en: "Purple", hex: "#b56bff" },
    { key: "orange", th: "ส้ม",    en: "Orange", hex: "#ff7a2f" },
  ];

  /* ---------- สินค้า ----------
     url = ตำแหน่งไฟล์ (อิงจาก root ของเว็บ ไม่ต้องมี / นำหน้า)
     live = พร้อมขายจริงไหม (false = "เร็ว ๆ นี้")
     variants[].retail = ราคาปลีกต่อชิ้น (ใช้คำนวณ % ประหยัด)
     options[].qty = จำนวนชิ้นในแพ็ก, box = เป็นแบบยกกล่อง
  */
  const products = [
    {
      id: "jet-lighter",
      url: "products/jet-lighter.html",
      category: "lighter",
      name_th: "ไฟฟู่ M.T.T.", name_en: "M.T.T. Jet Lighter",
      glyph: "🔥",
      tagline_th: "หัวฟู่แรงดันสูง เจอลมไม่ดับ เติมแก๊สใช้ซ้ำ 5 สี",
      tagline_en: "High-pressure jet, windproof, refillable, 5 colors",
      live: true,
      flag_th: "ขายดี", flag_en: "Bestseller",
      colors: colors,
      variants: [
        {
          key: "large", name_th: "รุ่นใหญ่", name_en: "Large",
          spec_th: "บอดี้ใหญ่ แก๊สเยอะ ใช้ทน", spec_en: "Big body · more gas", retail: 59,
          options: [
            { id: "L1", qty: 1,  label_th: "1 ชิ้น", label_en: "1 pc",  note_th: "ปลีก",  note_en: "retail", price: 59,  best: false },
            { id: "L3", qty: 3,  label_th: "3 ชิ้น", label_en: "3 pcs", note_th: "โปรคุ้ม", note_en: "deal",  price: 100, best: true },
            { id: "LB", qty: 15, label_th: "ยกกล่อง 15 ชิ้น", label_en: "Box · 15 pcs", note_th: "ราคาส่ง", note_en: "wholesale", price: 450, best: false, box: true },
          ],
        },
        {
          key: "compact", name_th: "รุ่นเล็ก", name_en: "Compact",
          spec_th: "พกพาง่าย น้ำหนักเบา", spec_en: "Pocket size · light", retail: 45,
          options: [
            { id: "S1", qty: 1,  label_th: "1 ชิ้น", label_en: "1 pc",  note_th: "ปลีก",  note_en: "retail", price: 45,  best: false },
            { id: "S3", qty: 3,  label_th: "3 ชิ้น", label_en: "3 pcs", note_th: "โปรคุ้ม", note_en: "deal",  price: 100, best: true },
            { id: "SB", qty: 20, label_th: "ยกกล่อง 20 ชิ้น", label_en: "Box · 20 pcs", note_th: "ราคาส่ง", note_en: "wholesale", price: 480, best: false, box: true },
          ],
        },
      ],
    },
    /* ----- สินค้าที่กำลังจะเปิดขาย (โชว์เป็น "เร็ว ๆ นี้") ----- */
    { id: "plug-switch", category: "electrical", glyph: "🔌", live: false,
      name_th: "ชุดปลั๊ก-สวิตช์", name_en: "Plug & switch set",
      tagline_th: "มาตรฐาน มอก. ทนทาน ติดตั้งง่าย", tagline_en: "TIS-certified, durable, easy fit" },
    { id: "led-bulb", category: "lighting", glyph: "💡", live: false,
      name_th: "หลอด LED ประหยัดไฟ", name_en: "LED bulbs",
      tagline_th: "สว่างจริง อายุใช้งานยาว", tagline_en: "Bright, long-lasting" },
    { id: "tool-kit", category: "tools", glyph: "🧰", live: false,
      name_th: "ชุดเครื่องมือช่าง", name_en: "Tool kit",
      tagline_th: "ครบชุด ใช้งานได้จริง", tagline_en: "Complete, job-ready" },
  ];

  /* ---------- หมวดหมู่ (ใช้บนหน้าแรก + หน้ารวมสินค้า) ---------- */
  const categories = [
    { key: "lighter", icon: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>', th: "ไฟฟู่ / ไฟแช็ก", en: "Jet lighters",
      dth: "ไฟแช็กหัวฟู่ กันลม เติมแก๊สได้ ปลีก-ส่ง", den: "Windproof refillable jet lighters",
      url: "products/jet-lighter.html", live: true, accent: "amber" },
    { key: "electrical", icon: '<rect x="4" y="4" width="16" height="6" rx="1"/><path d="M8 10v10M16 10v10M4 20h16"/>', th: "อุปกรณ์ไฟฟ้า", en: "Electrical",
      dth: "ปลั๊ก สวิตช์ สายไฟ เบรกเกอร์ มาตรฐาน มอก.", den: "Plugs, switches, wire, breakers",
      url: "products/index.html", live: false, accent: "blue" },
    { key: "lighting", icon: '<path d="M15 7h5v5M20 7 9 18l-4-4"/><circle cx="6" cy="18" r="2"/>', th: "หลอด &amp; โคมไฟ", en: "Bulbs &amp; lighting",
      dth: "หลอด LED โคมไฟ ดาวน์ไลท์ ประหยัดไฟ", den: "LED bulbs, downlights, fixtures",
      url: "products/index.html", live: false, accent: "amber" },
    { key: "tools", icon: '<path d="m14 7 3 3M5 17l-2 4 4-2 11-11a2.1 2.1 0 0 0-3-3z"/>', th: "เครื่องมือช่าง", en: "Hand tools",
      dth: "ไขควง คีม ค้อน สว่าน เครื่องมือครบชุด", den: "Screwdrivers, pliers, drills",
      url: "products/index.html", live: false, accent: "blue" },
    { key: "fasteners", icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>', th: "น็อต สกรู ฮาร์ดแวร์", en: "Fasteners",
      dth: "น็อต สกรู พุก บานพับ อะไหล่จิปาถะ", den: "Nuts, screws, anchors, hinges",
      url: "products/index.html", live: false, accent: "amber" },
    { key: "home", icon: '<path d="M3 7h18v13H3zM3 7l3-4h12l3 4M9 12h6"/>', th: "ของใช้ในบ้าน", en: "Home supplies",
      dth: "อุปกรณ์ประปา ของใช้เบ็ดเตล็ดในบ้าน", den: "Plumbing & household items",
      url: "products/index.html", live: false, accent: "blue" },
  ];

  /* ---------- helpers ---------- */
  function byId(id) { return products.find(p => p.id === id) || null; }
  function allOptions(p) {
    if (!p || !p.variants) return [];
    return p.variants.flatMap(v => v.options.map(o => ({ ...o, retail: v.retail, variant: v })));
  }
  function optionById(p, id) { return allOptions(p).find(o => o.id === id) || null; }

  // ช่วงราคาต่อชิ้น (แบบ 1 ชิ้น) → เช่น {min:45,max:59}
  function unitPriceRange(p) {
    const singles = allOptions(p).filter(o => o.qty === 1).map(o => o.price);
    if (!singles.length) return null;
    return { min: Math.min(...singles), max: Math.max(...singles) };
  }
  // ราคาต่อชิ้นต่ำสุดแบบยกกล่อง
  function boxMinPerPiece(p) {
    const boxes = allOptions(p).filter(o => o.box).map(o => Math.round(o.price / o.qty));
    return boxes.length ? Math.min(...boxes) : null;
  }
  // % ประหยัดของแพ็ก เทียบราคาปลีก × จำนวน
  function savingsPct(option) {
    if (!option || option.qty <= 1 || !option.retail) return 0;
    const full = option.retail * option.qty;
    return Math.max(0, Math.round((full - option.price) / full * 100));
  }
  function perPiece(option) { return option.qty ? Math.round(option.price / option.qty) : option.price; }

  // ป้ายช่วงราคาสำหรับการ์ดหน้าแรก เช่น "฿45–59"
  function priceLabel(p, lang) {
    const r = unitPriceRange(p);
    if (!r) return "";
    return r.min === r.max ? ("฿" + r.min) : ("฿" + r.min + "–" + r.max);
  }
  // การ์ดราคาส่ง (ยกกล่อง) สำหรับ section wholesale
  function wholesaleCards(p, lang) {
    const th = lang !== "en";
    return allOptions(p).filter(o => o.box).map(o => ({
      name: (th ? o.variant.name_th : o.variant.name_en) + " · " + (th ? o.label_th : o.label_en).replace(/^.*?· ?/, ""),
      label: th ? o.variant.name_th + " · " + o.qty + " ชิ้น/กล่อง" : o.variant.name_en + " · " + o.qty + " pcs/box",
      price: "฿" + o.price,
      per: th ? ("เฉลี่ย ฿" + perPiece(o) + "/ชิ้น") : ("~฿" + perPiece(o) + "/pc"),
    }));
  }

  // UP-2: ลิงก์ทัก LINE พร้อมข้อความตั้งต้น (ถ้ามี LINE_ID จะ prefill ข้อความให้)
  function lineAsk(text) {
    const S = window.SHOP || {};
    const id = (S.LINE_ID || "").replace(/^@/, "");
    if (id) return "https://line.me/R/oaMessage/@" + id + "/?" + encodeURIComponent(text || "");
    return S.LINE_URL || "#";
  }
  // C-2: รูปสินค้า — ถ้ามี p.image ใช้รูปจริง (loading=lazy) ถ้าไม่มี fallback เป็น emoji
  function productThumb(p, base) {
    base = base || "";
    if (p.image) return '<img src="' + base + p.image + '" alt="' + (p.name_th || "") + '" loading="lazy">';
    return '<span class="glyph">' + (p.glyph || "📦") + '</span>';
  }

  return {
    colors, products, categories,
    byId, allOptions, optionById,
    unitPriceRange, boxMinPerPiece, savingsPct, perPiece, priceLabel, wholesaleCards,
    lineAsk, productThumb,
  };
})();
