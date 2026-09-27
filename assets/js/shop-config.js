/* ============================================================
   ม.ทวีภัณฑ์ — ตั้งค่าร้านที่เดียว (ใช้ร่วมทุกหน้า)
   แก้ข้อมูลจริงของร้านตรงนี้ แล้วมีผลทั้งเว็บ
   ============================================================ */
window.SHOP = {
  name_th: "ม.ทวีภัณฑ์",
  name_en: "M. Taweephan",
  abbr: "M.T.T.",
  legal_th: "บริษัท วินส์ทูลส์ ฮาร์ดแวร์ (ประเทศไทย) จำกัด",
  tagline_th: "ศูนย์รวมเครื่องมือช่าง & ฮาร์ดแวร์ สำเพ็ง — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย",
  tagline_en: "Professional tools & hardware, Sampheng — exclusive WYNNTOOLS importer in Thailand",

  // ✅ LINE OA จริงของร้าน
  LINE_URL: "https://line.me/R/ti/p/@wynnstools",
  LINE_ID: "@wynnstools",
  BANK_ACCOUNT: "",                                  // บัญชีธนาคาร (เว้นว่าง = ไม่แสดง) — ร้านรับออเดอร์และแจ้งวิธีชำระทาง LINE

  // ✅ ข้อมูลจริง (จาก Thailand YellowPages — โปรไฟล์ร้าน ม.ทวีภัณฑ์ สำเพ็ง)
  PHONE: "0-2221-7712",
  PHONE_TEL: "022217712",
  PHONE_MORE: "",                                    // เบอร์เพิ่มเติม — ร้านขอให้ใช้เบอร์เดียว (เว้นว่าง = ไม่แสดง)
  EMAIL: "",                                         // ยังไม่มีอีเมลสาธารณะ (เว้นว่าง = ไม่แสดง)
  ADDRESS_TH: "132/1 ถนนเยาวพานิช แขวงจักรวรรดิ เขตสัมพันธวงศ์ กรุงเทพฯ 10100",
  HOURS_TH: "",   // ยังไม่มีข้อมูลจากร้าน — ว่าง = ซ่อนแถวเวลาทำการ (ใส่เช่น "จันทร์–เสาร์ 8:30–17:30")
  FACEBOOK_URL: "#",

  // ข้อความนโยบายที่ใช้ซ้ำหลายหน้า (หน้าสินค้าไฟฟู่ + บทความ) — แก้ที่นี่ที่เดียว แล้วรัน npm run bake
  // ใส่ลงหน้าเว็บผ่าน data-shop-text="shipping" / "colors" / "returns" (ดู _chrome.mjs)
  SHIPPING_TH: "สินค้าบรรจุแก๊ส (ไวไฟ) จัดส่งผ่าน DHL ส่งทั่วไทย เก็บเงินปลายทางได้ ทางร้านแจ้งค่าส่งให้ก่อนยืนยันออเดอร์",
  SHIPPING_EN: "Contains flammable gas and ships nationwide via DHL. Cash on delivery available, and we confirm the shipping cost before you commit.",
  COLORS_TH: "ไม่ได้ สั่งยกกล่องจะได้แบบคละสีตามที่มาในกล่อง ถ้าต้องการสีเจาะจง สั่งเป็นชิ้นหรือแพ็ก 3 ชิ้นแล้วระบุสีในตะกร้า",
  COLORS_EN: "No. Full boxes come colour-mixed as packed. If you need specific colours, order single pieces or 3-packs and note the colours in the cart.",
  RETURNS_TH: "ไฟฟู่ที่จุดไม่ติดจากการผลิต แจ้งทางร้านทาง LINE ภายใน 7 วัน พร้อมรูปหรือคลิป เพื่อเปลี่ยนสินค้า",
  RETURNS_EN: "If a lighter won't light because of a manufacturing fault, tell us on LINE within 7 days with a photo or clip and we'll exchange it.",

  // วาง URL ฝัง Google Maps ของร้าน (คัดลอกจาก Google Maps > แชร์ > ฝังแผนที่ > src="...")
  // ถ้าเว้นว่าง หน้าแรกจะซ่อนช่องแผนที่ให้อัตโนมัติ
  MAPS_EMBED_URL: ""
};
