# ม ทวีภัณฑ์ (M.T.T.) — เว็บไซต์ร้านค้า

เว็บไซต์ร้านอุปกรณ์ไฟฟ้า & ฮาร์ดแวร์ **ม ทวีภัณฑ์** เป็น static site (HTML/CSS/JS ล้วน)
พร้อม deploy ขึ้น Vercel ได้ทันที ออกแบบให้ **ต่อยอดเพิ่มสินค้า/หมวดหมู่ได้ง่าย**
โดยแก้ข้อมูลจากไฟล์กลางไม่กี่ไฟล์

## โครงสร้าง

```
index.html                    หน้าแรก — แบรนด์ฮับ (หมวดหมู่ + สินค้าเด่น + ติดต่อ)
products/
  index.html                  หน้ารวมสินค้าทั้งหมด + กรองตามหมวด
  jet-lighter.html            หน้าขาย "ไฟฟู่ M.T.T." (ตะกร้า + QR พร้อมเพย์ + ฟอร์มที่อยู่ + LINE)
privacy.html                  นโยบายความเป็นส่วนตัว (PDPA) + เงื่อนไข (แบบร่าง)
404.html                      หน้า Not Found (Vercel ใช้อัตโนมัติ)
assets/
  css/theme.css               ⭐ ดีไซน์กลาง (โทนสี/ปุ่ม/การ์ด/ฟอร์ม/หัว-ท้าย) ใช้ร่วมทุกหน้า
  js/shop-config.js           ⭐ ตั้งค่าร้านที่เดียว: PromptPay, LINE, เบอร์, ที่อยู่, บัญชีธนาคาร
  js/catalog.js               ⭐ ข้อมูลสินค้า/หมวดหมู่/ราคา "ที่เดียว" (single source of truth)
  js/cart.js                  ตะกร้าที่จำค่าไว้ (localStorage) ใช้ร่วมทุกหน้า + badge
  js/layout.js                ฉีด header/footer/ปุ่ม LINE/toast + สลับภาษา TH/EN
  js/vendor/qrcode.min.js     ไลบรารีสร้าง QR (ฝังในโปรเจกต์ ไม่พึ่ง CDN)
  img/                        favicon.svg, apple-touch-icon.png, og-image.png
sitemap.xml, robots.txt       SEO
vercel.json                   security headers + cache
test/smoke.mjs                ชุดทดสอบอัตโนมัติ (npm test)
.github/workflows/ci.yml      รันทดสอบทุก PR
```

## ตั้งค่าก่อนใช้จริง (สำคัญ)

แก้ **`assets/js/shop-config.js`** ที่เดียว มีผลทั้งเว็บ:

| ค่า | คือ |
|-----|-----|
| `PROMPTPAY_ID` | เบอร์พร้อมเพย์ หรือเลขบัตรประชาชนของร้าน (ใช้สร้าง QR — **ตรวจให้ถูกก่อนเปิดจริง**) |
| `LINE_URL` / `LINE_ID` | ลิงก์ & ไอดี LINE OA |
| `PHONE`, `PHONE_TEL`, `EMAIL`, `ADDRESS_TH`, `HOURS_TH` | ข้อมูลติดต่อ (แสดงทั้งเว็บอัตโนมัติ) |
| `BANK_ACCOUNT` | บัญชีธนาคารสำรอง (แสดงใต้ QR พร้อมปุ่มคัดลอก) |

> ⚠️ ค่าเริ่มต้นเป็น **ตัวอย่างทั้งหมด** — โดยเฉพาะ `PROMPTPAY_ID` ต้องแก้เป็นของจริง
> ไม่งั้น QR จะโอนเงินเข้าเบอร์ผิด

ราคา/แพ็กเกจ/สี ของไฟฟู่ แก้ได้ในไฟล์ **`assets/js/catalog.js`** (`% ประหยัด` และช่วงราคาหน้าแรกคำนวณให้อัตโนมัติ)

## เพิ่มสินค้าใหม่ใน ~15 นาที

1. เพิ่ม object ใน `products` ของ **`assets/js/catalog.js`**
   - สินค้าที่ยังไม่พร้อมขาย ใส่ `live:false` → จะขึ้น "เร็ว ๆ นี้" อัตโนมัติ
   - สินค้าที่พร้อมขาย ใส่ `live:true`, `url`, `variants[].options[]` (มีราคา/จำนวน)
2. ถ้าต้องมีหน้าสินค้าเฉพาะ → **ก็อป `products/jet-lighter.html`** เป็นเทมเพลต
   แล้วแก้ `CATALOG.byId("...")` + meta/JSON-LD ให้ตรงสินค้าใหม่
3. หมวดหมู่หน้าแรก/หน้ารวม แก้ที่ array `categories` ในไฟล์เดียวกัน

ทุกหน้าดึง header/footer/สี/ตะกร้า จากไฟล์กลางร่วมกัน — หน้าใหม่จะหน้าตาเป็นชุดเดียวกันเอง

## รันทดสอบ

```bash
npm install
npx playwright install --with-deps chromium
npm test          # โหลดทุกหน้า เช็ค JS error, ตะกร้า, QR, สลับภาษา, จำค่า
```

## Deploy

อัปโหลดทั้งโฟลเดอร์ขึ้น Vercel (Add New → Project) — ไม่ต้อง build
- หน้าไฟฟู่: `/products/jet-lighter.html`
- หน้ารวมสินค้า: `/products/`
- Vercel Web Analytics เปิดใช้ได้จาก Dashboard (สคริปต์ `/_vercel/insights` ฝังไว้แล้ว)

หลัง deploy: ตั้งโดเมนจริง แล้วแก้ URL ใน `sitemap.xml`, `robots.txt`, tag `canonical`/`og:*`
(ตอนนี้ตั้งเป็น `www.mttaweephan.com` เป็นตัวอย่าง)

## ฟีเจอร์

- ดีไซน์ industrial-retail (หมึกกรมท่า + เหลืองอำพัน) รองรับมือถือเต็มรูปแบบ
- สลับภาษา ไทย/อังกฤษ (จำค่าไว้ให้)
- ตะกร้าจำค่าข้ามหน้า + badge บน header + แถบสั่งซื้อลอยบนมือถือ
- ฟอร์มชื่อ-ที่อยู่ (จำค่า) รวมเข้าออเดอร์ให้อัตโนมัติ
- สร้าง QR พร้อมเพย์ยอดตรง (มาตรฐาน EMVCo) + บัญชีธนาคารสำรองพร้อมปุ่มคัดลอก
- คัดลอกออเดอร์ (2 ภาษา) & เปิด LINE, ปุ่ม LINE ลอยทุกหน้า
- SEO ครบ: meta, Open Graph + og-image, canonical, JSON-LD (Store/Product/FAQ), sitemap, robots
- Accessibility: ปุ่มใช้คีย์บอร์ดได้, aria-label/aria-pressed, คอนทราสต์ผ่านเกณฑ์

## ยังต้องเตรียมจากเจ้าของร้าน

- ข้อมูลจริงใน `shop-config.js` (โดยเฉพาะ PromptPay/LINE)
- รูปถ่ายสินค้าจริง (ตอนนี้ใช้ไอคอน/emoji ชั่วคราว)
- พิกัด Google Maps (ฝังในหน้าแรก section ติดต่อ) และตรวจร่าง `privacy.html`
