/* ============================================================
   MTT Hardware — ตั้งค่าร้านที่เดียว (ใช้ร่วมทุกหน้า)
   แก้ข้อมูลจริงของร้านตรงนี้ แล้วมีผลทั้งเว็บ
   ============================================================ */
window.SHOP = {
  name_th: "MTT Hardware",
  name_en: "MTT Hardware",
  abbr: "M.T.T.",
  legal_th: "บริษัท วินส์ทูลส์ ฮาร์ดแวร์ (ประเทศไทย) จำกัด",
  legal_en: "Wynns Tools Hardware (Thailand) Co., Ltd.", // ชื่อบริษัทภาษาอังกฤษ ใช้ใน footer หน้า /en (ตรงกับหน้าแบรนด์ตราสิงโต)
  tagline_th: "ร้านเครื่องมือช่าง & ฮาร์ดแวร์ออนไลน์ — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย",
  tagline_en: "Online tools & hardware — exclusive WYNNTOOLS importer in Thailand",

  // ✅ LINE OA จริงของร้าน
  LINE_URL: "https://line.me/R/ti/p/@wynnstools",
  LINE_ID: "@wynnstools",
  BANK_ACCOUNT: "",                                  // บัญชีธนาคาร (เว้นว่าง = ไม่แสดง) — ร้านรับออเดอร์และแจ้งวิธีชำระทาง LINE

  // ✅ ข้อมูลจริงจากร้าน (ร้านออนไลน์ ไม่มีหน้าร้าน จึงไม่มีที่อยู่ แผนที่ และเวลาเปิดหน้าร้าน)
  PHONE: "061-662-9659",
  PHONE_TEL: "0616629659",
  PHONE_MORE: "",                                    // เบอร์เพิ่มเติม — ร้านขอให้ใช้เบอร์เดียว (เว้นว่าง = ไม่แสดง)
  EMAIL: "",                                         // ยังไม่มีอีเมลสาธารณะ (เว้นว่าง = ไม่แสดง)
  HOURS_TH: "",   // เวลาตอบแชทและรับโทร ว่าง = ซ่อนแถวนี้ (ใส่เช่น "จันทร์–เสาร์ 8:30–17:30")
  FACEBOOK_URL: "#",

  // ข้อความนโยบายที่ใช้ซ้ำหลายหน้า (หน้าสินค้าไฟฟู่ + บทความ) — แก้ที่นี่ที่เดียว แล้วรัน npm run bake
  // ใส่ลงหน้าเว็บผ่าน data-shop-text="shipping" / "colors" / "returns" (ดู _chrome.mjs)
  SHIPPING_TH: "สินค้าบรรจุแก๊ส (ไวไฟ) จัดส่งผ่าน DHL ส่งทั่วไทย เก็บเงินปลายทางได้ ทางร้านแจ้งค่าส่งให้ก่อนยืนยันออเดอร์",
  SHIPPING_EN: "Contains flammable gas and ships nationwide via DHL. Cash on delivery available, and we confirm the shipping cost before you commit.",
  COLORS_TH: "ไม่ได้ สั่งยกกล่องจะได้แบบคละสีตามที่มาในกล่อง ถ้าต้องการสีเจาะจง สั่งเป็นชิ้นหรือแพ็ก 3 ชิ้นแล้วระบุสีในตะกร้า",
  COLORS_EN: "No. Full boxes come colour-mixed as packed. If you need specific colours, order single pieces or 3-packs and note the colours in the cart.",
  RETURNS_TH: "ไฟฟู่ที่จุดไม่ติดจากการผลิต แจ้งทางร้านทาง LINE ภายใน 7 วัน พร้อมรูปหรือคลิป เพื่อเปลี่ยนสินค้า",
  RETURNS_EN: "If a lighter won't light because of a manufacturing fault, tell us on LINE within 7 days with a photo or clip and we'll exchange it.",

  // ===== ข้อมูลให้ Google (ใส่แล้วรัน npm run bake — ระบบเขียนลง schema ร้านในหน้าแรกให้เอง) =====
  // ร้านออนไลน์ ไม่มีหน้าร้าน: ไม่ใส่ที่อยู่ พิกัด แผนที่ และเวลาเปิดหน้าร้านใน schema
  // ลิงก์ Google Business Profile ของร้าน (หลังยืนยันร้านแล้ว: โปรไฟล์ > แชร์ > คัดลอกลิงก์) เว้นว่าง = ไม่ใส่ — ดู docs/google-business.md
  GBP_URL: "",
  // Google Search Console > เพิ่ม property > ยืนยันด้วย "แท็ก HTML" > คัดลอกเฉพาะค่าใน content="..."
  SEARCH_CONSOLE_VERIFY: ""
};
