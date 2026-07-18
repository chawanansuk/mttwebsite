---
name: build-website
description: สร้างเว็บไซต์ใช้งานจริงจากคำสั่งสั้นๆ ตั้งแต่ scaffold โค้ดจนถึง deploy production ใช้เมื่อผู้ใช้ขอ "สร้างเว็บ", "ทำเว็บไซต์", "build a website", "make me a site" หรือบอก requirement เว็บโดยไม่ระบุ stack เทคนิค Stack: Next.js + Vercel + Supabase (+ Cloudflare เมื่อจำเป็น) รองรับ 4 ประเภท: landing/static, เว็บแอป (login/db), e-commerce, dashboard — ประเภทอื่นแจ้งว่ายังไม่รองรับ ออกแบบให้มือใหม่ใช้ง่ายและดีไซน์ไม่เหมือน template AI
---

# Build Website

Skill นี้พาจากคำสั่งปากเปล่า → เว็บที่ deploy จริง ใช้ pipeline ตายตัวตามลำดับด้านล่าง **ห้ามข้ามขั้นตอนและห้ามสลับลำดับ** — แต่ละ step จัดไว้ให้เจอปัญหาถูกที่ (เช่น เช็คเครื่องมือครบก่อนถามผู้ใช้ จะได้ไม่เสียเวลาเปล่า)

**หลักตลอดทั้ง skill:** ผู้ใช้อาจเป็นมือใหม่ที่ไม่รู้เรื่องโค้ดเลย — คุยด้วยภาษาง่ายๆ ไม่ใช้ศัพท์เทคนิคโดยไม่จำเป็น และถามด้วยตัวเลือกสำเร็จรูปเสมอ

## Step 0 — เช็คขอบเขต (ก่อนอื่นทั้งหมด)

รองรับเฉพาะ 4 ประเภท:
1. **Landing / static page** — ไม่มี backend เช่น หน้าโปรโมท, portfolio, บริษัท
2. **เว็บแอปเต็ม** — มี login/database
3. **E-commerce** — ขายของ มีตะกร้า/สินค้า/ชำระเงิน
4. **Dashboard / internal tool** — admin panel, data dashboard

ถ้าคำขอไม่เข้าข่าย 4 ประเภทนี้ (เช่น mobile app, browser extension, desktop app, ระบบ real-time video/voice ซับซ้อน) ให้บอกตรงๆ ว่า **ยังไม่รองรับ** ห้ามดันทำเอง และห้ามไปต่อ Step 1

## Step 1 — เช็คการเชื่อมต่อเครื่องมือ (ก่อนถามผู้ใช้)

เช็ค MCP tools ที่จำเป็นตามประเภทเว็บจาก Step 0:
- **ทุกประเภท**: Git/GitHub (commit+push ก่อน deploy), Vercel MCP (deploy), Browser MCP (verify)
- **เว็บแอป / e-commerce / dashboard**: เพิ่ม Supabase MCP (backend/database)
- **เฉพาะเมื่อต้องใช้จริง**: Cloudflare MCP (โดเมนผูก Cloudflare อยู่แล้ว, เก็บไฟล์ใหญ่ผ่าน R2)

ไม่ต้องเช็คว่ามี GitHub repo อยู่แล้วหรือยัง แค่เช็คว่ามีสิทธิ์เข้าถึง GitHub (สร้าง repo ใหม่ตอน Step 8 ได้)

ถ้าเครื่องมือจำเป็นตัวไหนยังไม่เชื่อมต่อหรือ auth ค้าง ("requires authentication") ให้ **หยุดทันที** แจ้งผู้ใช้ให้เชื่อมก่อน:
- claude.ai connector → หน้า connector settings
- MCP server อื่น → `claude mcp` หรือ `/mcp` ใน interactive session

อย่าถามคำถาม Step 2 ทั้งที่รู้ว่าท้ายที่สุดจะ deploy/ต่อ backend ไม่ได้

## Step 2 — Clarify requirement (ถามผู้ใช้)

ถามน้อยข้อที่สุดเท่าที่จำเป็น ใช้ AskUserQuestion พร้อมตัวเลือกสำเร็จรูปเสมอ (ห้ามถามปลายเปิดล้วนๆ ที่มือใหม่ตอบไม่ถูก)

**หลักการแบ่ง:** ตัวตนจริงของธุรกิจ/เงิน/กฎหมาย → ต้องถาม ห้ามแต่งหรือเดาเอง ส่วนรายละเอียดเทคนิคล้วนๆ ตัดสินใจเองตาม Step 3–4

ต้องได้คำตอบครบทุกข้อก่อนเริ่ม Step 3:

1. **ประเภทธุรกิจ** — เสนอ **business preset** เป็นหมวดจริง (ไม่ใช่ "landing page ทั่วไป") เพื่อ scaffold เนื้อหา/หน้า/ฟีเจอร์ให้ตรงธุรกิจตั้งแต่แรก เช่น:
   - ร้านอาหาร / คาเฟ่ / เบเกอรี่
   - ร้านเสริมสวย / สปา / คลินิกความงาม
   - คลินิก / หมอ / บริการสุขภาพ
   - ฟิตเนส / โยคะ / เทรนเนอร์ส่วนตัว
   - อสังหาริมทรัพย์ / นายหน้า
   - การศึกษา / ติวเตอร์ / คอร์สออนไลน์
   - งานแต่งงาน / ช่างภาพ / อีเวนต์
   - ที่ปรึกษา / ฟรีแลนซ์ / พอร์ตโฟลิโอ
   - ร้านค้าปลีก / แฟชั่น / งานฝีมือ (ถ้าไปทาง e-commerce)
   - บริษัท / องค์กร / เทคสตาร์ทอัพ (B2B, SaaS)
   - องค์กรไม่แสวงหากำไร / มูลนิธิ
   - ขนย้าย / รถสไลด์ / ขนส่ง / โลจิสติกส์
   - ช่างซ่อม / งานช่างที่บ้าน (ไฟฟ้า, ประปา, แอร์, ต่อเติม)
   - รถเช่า / เช่ารถขนของ / ขนส่งผู้โดยสาร
   - ยานยนต์ / อู่ซ่อมรถ / ล้างรถ
   - อื่นๆ — ให้ผู้ใช้พิมพ์อธิบายเองถ้าไม่ตรงหมวด

   แต่ละหมวดมี section เริ่มต้นต่างกัน (ร้านอาหาร→เมนู+แผนที่, คลินิก→จองคิว, พอร์ตโฟลิโอ→case study, ขนย้าย→พื้นที่บริการ+แกลเลอรี+ปุ่มโทร/แชท+รีวิว, ช่างซ่อม→รายการบริการ+ราคาคร่าวๆ+พื้นที่บริการ) ใช้เป็นฐานแล้วค่อยถามฟีเจอร์เพิ่มในข้อถัดไป
2. **Design style** — เสนอ style preset ที่มีชื่อ+คำอธิบายภาพชัดเจน (ดู Step 4) ห้ามถามลอยๆ ว่า "ชอบสีอะไร"
3. **เนื้อหา/ฟีเจอร์หลัก** — หน้าไหนบ้าง, ฟีเจอร์ที่ต้องมีนอกเหนือจาก business preset
4. **ชื่อธุรกิจ/แบรนด์ + ข้อมูลติดต่อจริง** (เบอร์, ที่อยู่, อีเมล, โซเชียล) — ห้ามแต่งข้อมูลปลอมเด็ดขาด ถ้ายังไม่มีให้ถามว่าจะใส่ placeholder ที่ระบุชัดว่า "ตัวอย่าง แก้ทีหลัง" ไปก่อนไหม
5. **เนื้อหาจริงของหน้าเว็บ** (ราคา, รายละเอียดสินค้า/บริการ, About) — ถ้ายังไม่มีให้ถามว่าจะใช้ placeholder ไปก่อน หรือรอผู้ใช้ส่งมา
6. **โลโก้/รูปภาพ** — มีไฟล์อยากใช้ไหม ถ้าไม่มีให้ถามว่าจะใช้ placeholder หรือให้ Claude ออกแบบกราฟิกคร่าวๆ ให้
7. **โดเมนเนม** — ใช้ domain ฟรีของ Vercel (xxx.vercel.app) ไปก่อน หรือมีโดเมนตัวเองจะผูกทีหลัง
8. **(เว็บแอป/e-commerce/dashboard)** — มีข้อมูลอะไรบ้างที่ต้องเก็บจากผู้ใช้ (โปรไฟล์, เบอร์, ที่อยู่จัดส่ง) ถามด้วยภาษาธรรมดา ไม่ใช้คำว่า "schema" — กระทบ privacy/PDPA ต้องรู้ scope ตั้งแต่ต้น

ห้ามเริ่ม Step 3 จนได้คำตอบครบ

## Step 3 — เลือก stack (Skill ตัดสินใจเอง ไม่ถามผู้ใช้เรื่องเทคนิค)

Stack หลัก — **Next.js + Vercel + Supabase + Cloudflare**:

- **Framework**: Next.js (App Router) + TypeScript + Tailwind CSS — ใช้ทั้ง 4 ประเภท เพื่อ deploy บน Vercel ได้ลื่น
- **Hosting/Deploy**: Vercel (`mcp__3dcabb14-b9ec-42cc-9142-149b8ff5cd40__*`) — HTTPS, CDN, preview URL อัตโนมัติ
- **Backend/Database** (เฉพาะเว็บแอป/e-commerce/dashboard): Supabase (`mcp__supabase__*`)
  - ใช้ `list_tables` ก่อนถ้ามี project อยู่แล้ว
  - สร้าง schema ด้วย `apply_migration` (ไม่ใช้ execute_sql สำหรับ DDL)
  - ใช้ Supabase Auth แทนการทำ auth เอง
  - ตรวจ `get_advisors` (type: security) หลังสร้างตารางเสมอ
  - ห้าม hardcode service_role key ฝั่ง client — ใช้ publishable key เท่านั้น (`get_publishable_keys`)
- **Cloudflare** — ใช้เมื่อมีความต้องการเฉพาะทาง ไม่ใช่ default:
  - **R2** — เก็บไฟล์/รูป/อัปโหลดใหญ่ (ถูกกว่า S3 ไม่มีค่า egress)
  - **KV** — cache/session ระดับ edge
  - **D1** — แทน Supabase เฉพาะโปรเจกต์เล็กมากที่ไม่ต้องการ auth/real-time (ปกติใช้ Supabase)
  - **Custom domain** — ถ้าผู้ใช้จัดการ DNS ผ่าน Cloudflare อยู่แล้ว
  - ยึดหลัก **ง่ายที่สุดที่ยังทำงานได้จริง** — ถ้า Vercel + Supabase พอแล้วอย่าเพิ่ม Cloudflare
- **Payment (e-commerce)**: ถ้าไม่ระบุ gateway ให้ scaffold ตะกร้า/checkout UI ไว้ก่อน แต่ **ห้าม**ต่อ payment gateway จริงหรือใส่ API key โดยไม่ถามผู้ใช้ (ข้อยกเว้นเดียวที่ต้องหยุดถาม เพราะเกี่ยวกับเงินจริง)

## Step 4 — Design: หลากหลาย ห้ามเหมือน "AI generate"

เลี่ยงสัญลักษณ์เว็บที่ดูเหมือน AI สร้าง: gradient ม่วง-น้ำเงินเป็น hero, ฟอนต์ Inter ล้วน, layout 3-icon-feature-grid, การ์ด rounded-2xl+shadow เท่ากันหมด, ไม่มี custom illustration/photography, spacing generic

วิธีแก้: เสนอ style preset ที่มีตัวตนชัดใน Step 2 (AskUserQuestion แบบมี description ให้เห็นภาพ):

1. **Minimal สายสวิส** — ขาว-ดำ-สีเน้นเดียว, grid เป๊ะ, typography เป็นพระเอก, ไม่มี gradient/shadow
2. **Neo-brutalist** — สีจัดตัดกันแรง, ขอบหนาดำ, ไม่มี border-radius, ตัวหนังสือใหญ่กล้าหักกฎ
3. **Editorial / นิตยสาร** — ภาพใหญ่ + serif ผสม sans, layout คอลัมน์หนังสือพิมพ์
4. **Warm & organic** — ครีม/เทอร์ราคอตต้า/เขียวมอส, มุมโค้งนุ่ม, ทำมือ ไม่ corporate
5. **Dark tech / SaaS** — พื้นเข้ม, accent สีเดียวจัด, monospace ผสม, feel developer tool
6. **Luxury / Elegant** — ดำ-ทอง หรือ ขาว-ทอง, serif หรู, spacing กว้าง (ไฟน์ไดนิ่ง, สปา, อสังหาหรู)
7. **Playful / Bold color** — สีสดหลายสีตัดกัน, ตัวอักษรกลมมีบุคลิก, illustration การ์ตูน (การศึกษาเด็ก, ไลฟ์สไตล์, ธุรกิจครอบครัว)
8. **Retro / Vintage** — สีซีดแบบฟิล์มเก่า, ฟอนต์ 70s-90s, texture กระดาษ/grain (ร้านกาแฟ, งานฝีมือ, แบรนด์เล่ามรดก)
9. **Nature / Eco** — เขียว-น้ำตาลดิน, ภาพธรรมชาติ, ฟอนต์ organic (ฟาร์ม, ออร์แกนิก, NGO)
10. **Corporate / Professional** — น้ำเงิน-เทา-ขาว, grid เป็นระเบียบ, sans สุภาพ (B2B, การเงิน, กฎหมาย)

อย่ายัดทั้ง 10 ให้เลือกทีเดียวจนงง — ดูจากประเภทธุรกิจใน Step 2 แล้ว pre-select 3-4 style ที่เข้ากันที่สุด (เช่น ร้านกาแฟ → Warm & organic, Retro/Vintage, Minimal) พร้อมตัวเลือก "ดูสไตล์อื่นทั้งหมด"

หลังเลือก preset **ต้องปรับ token จริงให้ต่างกัน** ไม่ใช่แค่เปลี่ยนสีบน theme เดิม:
- ฟอนต์เปลี่ยนคู่ (heading/body) ตาม mood ไม่ใช้ Inter ทุกโปรเจกต์
- Layout rhythm/section order ต่างกันตาม preset
- สี derive จาก brand ที่ผู้ใช้บอก ไม่ใช่ violet/indigo default ของ Tailwind
- ใส่รายละเอียดที่มีตัวตน เช่น custom cursor, micro-interaction, illustration เฉพาะ — เท่าที่เหมาะกับ scope

## Step 5 — Scaffold โค้ด

ตาม coding standard ระดับ Senior Developer (global CLAUDE.md):
- แยก concern ชัด, ไฟล์ไม่ยาวเกิน ~150 บรรทัด
- Types แม่นยำ ห้ามใช้ `any`
- Component/route/service แยกชั้นชัด
- Error handling ทุก external call (Supabase, API) — ห้าม catch เงียบ
- ถ้าผู้ใช้แนบภาพจริง (โลโก้/สินค้า/ทีมงาน) ให้ใช้แทน placeholder ทันที

โครงสร้างเริ่มต้น:
```
app/            # routes (Next.js App Router)
components/     # reusable UI components
lib/            # business logic, Supabase client, utils
types/          # centralized domain types
```

## Step 6 — Security (คำนึงถึงทุกครั้ง ไม่ใช่แค่ตอนท้าย)

- ห้าม commit/hardcode API key/secret — ใช้ environment variables ผ่าน Vercel project settings เท่านั้น
- เว็บมี login → เปิด Row Level Security (RLS) ทุกตารางที่มีข้อมูล user, ห้าม deploy ถ้ายังไม่เปิด RLS
- ใช้ Supabase Auth แทนการเก็บ password เอง
- Validate input ทุกจุดที่รับจากผู้ใช้ (ฟอร์ม, API route) ด้วย schema validation (เช่น zod) ก่อนเขียน database
- ใส่ security headers พื้นฐาน (CSP, X-Frame-Options) ผ่าน Next.js middleware/config
- Rate limit API route เสี่ยง (login, form submit, checkout)
- ตรวจ `get_advisors` (type: security) หลังสร้าง schema ทุกครั้งก่อน deploy — มี warning ต้องแก้ก่อน
- ฟอร์มข้อมูลอ่อนไหว (checkout) ส่งผ่าน HTTPS เท่านั้น (ตรวจ redirect http→https ให้ชัวร์)

## Step 7 — Local verification (ห้ามข้าม)

ก่อน deploy ต้อง:
1. รัน dev server ผ่าน `mcp__Claude_Browser__preview_start`
2. เปิดดูจริงใน browser (`navigate`, `screenshot`/`read_page`)
3. เดิน golden path อย่างน้อย 1 รอบ (กรอกฟอร์ม, คลิก nav, ทดสอบ login ถ้ามี)
4. เช็ค console error (`read_console_messages`) ต้องไม่มี error แดง
5. เช็คจอมือถือ (`resize_window` preset mobile) — ผู้ใช้ปลายทางส่วนใหญ่เข้าจากมือถือ

เจอบั๊กแก้ให้เสร็จก่อนไป Step 8

## Step 8 — Commit + Push ขึ้น GitHub (ต้องทำก่อน deploy เสมอ)

โค้ดต้องอยู่บน GitHub ก่อน deploy ทุกครั้ง เพื่อมีประวัติ/backup และให้ Vercel ผูก repo ได้ถูก:

1. ยังไม่มี git repo → `git init`
2. ยังไม่มี remote → สร้าง repo ใหม่ (ตั้งชื่อตามธุรกิจ/โปรเจกต์จาก Step 2) แล้วผูก remote
3. `git add` เฉพาะไฟล์ที่เกี่ยว — ห้าม add `.env`/secret เด็ดขาด ต้องมี `.gitignore` ครอบ `.env*`, `node_modules`, credential ก่อน commit แรกเสมอ
4. Commit ด้วยข้อความสั้นๆ อธิบายว่าสร้างเว็บอะไร
5. Push ขึ้น GitHub
6. ตรวจว่า push สำเร็จจริงก่อนไป Step 9 — push fail (auth ค้าง) ต้องแก้ก่อน ห้ามข้ามไป deploy

repo ใหม่ default เป็น **private** เว้นแต่ผู้ใช้ขอ public ชัดเจน

## Step 9 — Deploy ขึ้น Vercel (อัตโนมัติ ไม่ต้องถามยืนยัน)

ผู้ใช้ยืนยันแล้วว่าให้ deploy อัตโนมัติทุกครั้ง ให้ deploy โดยผูกกับ GitHub repo ที่ push ใน Step 8 (ไม่ใช่ upload โฟลเดอร์ตรง) เพื่อให้ push ใหม่แล้ว Vercel deploy ต่อเนื่องเองได้:

1. ใช้ `mcp__3dcabb14-b9ec-42cc-9142-149b8ff5cd40__deploy_to_vercel` เชื่อมกับ GitHub repo ที่ push ไว้
2. ตรวจ build logs ด้วย `get_deployment_build_logs` — deploy fail ต้อง debug แล้ว deploy ใหม่ ไม่ปล่อยให้ user เจอ error เอง
3. deploy สำเร็จ → ให้ URL จริงพร้อมสรุปสั้นๆ ภาษาง่ายๆ ว่าเว็บมีอะไร เข้าดูยังไง

**ข้อยกเว้นเดียวที่ต้องหยุดถามก่อนทำ**: payment gateway จริงหรือ credential ที่เกี่ยวกับเงิน/บัญชีจริง — ทำตาม Prohibited/Explicit-permission rules ปกติเสมอ ไม่ว่า skill นี้จะ auto-deploy แค่ไหน

## Step 10 — ส่งมอบแบบมือใหม่เข้าใจง่าย

สรุปแบบไม่ใช้ศัพท์เทคนิค:
- ลิงก์เว็บที่ใช้งานได้จริง
- สรุปสั้นๆ ว่าเว็บทำอะไรได้ (ไม่พูดเรื่อง stack/โครงสร้างโค้ด เว้นแต่ผู้ใช้ถาม)
- อยากแก้อะไร (สี, ข้อความ, เพิ่มหน้า) บอกได้เลยเป็นประโยคธรรมดา ไม่ต้องรู้ศัพท์เทคนิค
- ถ้ามี login บอกวิธีทดสอบ/สมัครบัญชีแรกแบบง่ายๆ
