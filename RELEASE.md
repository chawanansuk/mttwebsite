# ✅ Release Checklist — ม ทวีภัณฑ์

ทำตามลำดับก่อนเปิดเว็บให้ลูกค้าจริง

## 1) ข้อมูลร้าน (บล็อกการเปิดจริง)
- [ ] แก้ `assets/js/shop-config.js` ให้เป็นข้อมูลจริงทุกช่อง
  - [ ] `PROMPTPAY_ID` — **ทดสอบสแกน QR โอนจริง 1 บาท** แล้วเช็คว่าเงินเข้าบัญชีถูกต้อง
  - [ ] `LINE_URL` + `LINE_ID` (ถ้ายังไม่มี LINE OA ให้สมัครก่อน)
  - [ ] `PHONE`, `PHONE_TEL`, `EMAIL`, `ADDRESS_TH`, `HOURS_TH`, `BANK_ACCOUNT`
  - [ ] `MAPS_EMBED_URL` — คัดลอกจาก Google Maps › แชร์ › ฝังแผนที่ › ค่าใน `src="..."`
        (เว้นว่างได้ ระบบจะซ่อนช่องแผนที่ให้เอง)

## 2) รูปสินค้า (C-2 — โครงพร้อมแล้ว รอรูปจริง)
- [ ] ถ่ายรูปสินค้า พื้นหลังขาว/เทาอ่อน สัดส่วน 4:3 ขนาด ≥1200px (WebP/JPG)
- [ ] วางไฟล์ไว้ที่ `assets/img/products/`
- [ ] ใส่ path ในฟิลด์ `image` ของสินค้าใน `assets/js/catalog.js`
      (เช่น `image:"assets/img/products/jet-lighter.webp"`) — ระบบจะสลับจาก emoji เป็นรูปให้อัตโนมัติ

## 3) โดเมน & SEO
- [ ] จดโดเมน + ตั้งใน Vercel
- [ ] แก้โดเมนตัวอย่าง `www.mttaweephan.com` ให้เป็นโดเมนจริงใน:
      `sitemap.xml`, `robots.txt`, tag `canonical` และ `og:*` ทุกหน้า
- [ ] ยืนยันเว็บใน Google Search Console + submit `sitemap.xml`
- [ ] สร้าง Google Business Profile (ปักหมุดร้าน) — เอา URL ฝังมาใส่ `MAPS_EMBED_URL`

## 4) Deploy & ทดสอบ
- [ ] `npm test` เขียวทั้งหมด (โหลดทุกหน้า, ตะกร้า, QR, ภาษา, จำค่า, ไม่ล้นแนวนอน)
- [ ] Deploy ขึ้น Vercel → เปิด Web Analytics ใน Dashboard
- [ ] ทดสอบบนเครื่องจริง: **iPhone SE / จอ 375px** (เคสเสี่ยง header ล้น) + Android ราคาประหยัด 1 เครื่อง
- [ ] แชร์ลิงก์เข้าแชท LINE ตัวเอง → การ์ด og-image ต้องขึ้นรูปถูกต้อง
- [ ] วัด Lighthouse (mobile) จดค่าไว้เทียบครั้งหน้า — เป้า: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95

## 5) กฎหมาย
- [ ] ให้ผู้รู้ด้าน PDPA ตรวจ `privacy.html` + ใส่ชื่อนิติบุคคล/วันที่
