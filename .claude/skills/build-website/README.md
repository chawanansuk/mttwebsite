# วิธีติดตั้ง Skill "build-website"

Skill นี้ช่วยให้ Claude Code สร้างเว็บไซต์ใช้งานจริงจากคำสั่งสั้นๆ ตั้งแต่เขียนโค้ดจนถึง deploy ขึ้นอินเทอร์เน็ต

---

## ⚠️ ต้องมีก่อนใช้งาน (สำคัญ)

Skill นี้เรียกใช้เครื่องมือภายนอก ต้องเชื่อมต่อ MCP เหล่านี้ใน Claude Code ก่อน ไม่งั้นจะทำงานไม่ครบ:

- **GitHub** — สำหรับเก็บ/push โค้ด
- **Vercel** — สำหรับ deploy เว็บ
- **Supabase** — เฉพาะเว็บที่มีระบบ login/ฐานข้อมูล
- **Browser** — มากับ Claude Code อยู่แล้ว ไม่ต้องติดตั้งเพิ่ม

เชื่อมต่อ MCP ผ่านคำสั่ง `claude mcp` หรือ `/mcp` ใน Claude Code

---

## ขั้นตอนติดตั้ง

### Mac / Linux
```bash
unzip build-website.zip
mkdir -p ~/.claude/skills
mv build-website ~/.claude/skills/
ls ~/.claude/skills/build-website/SKILL.md   # เช็คว่าไฟล์อยู่ถูกที่
```

### Windows (PowerShell)
```powershell
Expand-Archive build-website.zip -DestinationPath $env:USERPROFILE\.claude\skills\
dir $env:USERPROFILE\.claude\skills\build-website\SKILL.md
```

---

## วิธีใช้งาน

1. **รีสตาร์ท Claude Code** (ปิดแล้วเปิดใหม่) เพื่อให้โหลด skill
2. เรียกใช้ได้ 2 แบบ:
   - พิมพ์คำสั่ง: `/build-website`
   - หรือพิมพ์ภาษาธรรมชาติ เช่น "สร้างเว็บร้านกาแฟให้หน่อย", "ทำเว็บไซต์บริษัท"
3. เช็คว่าติดตั้งสำเร็จ: พิมพ์ `/` แล้วดูว่ามี `build-website` ในรายการหรือไม่

---

## รองรับเว็บ 4 ประเภท
1. Landing / static page (หน้าโปรโมท, portfolio, บริษัท)
2. เว็บแอปเต็ม (มี login/ฐานข้อมูล)
3. E-commerce (ขายของ มีตะกร้า/ชำระเงิน)
4. Dashboard / internal tool (admin panel, data dashboard)

ประเภทอื่น (mobile app, browser extension ฯลฯ) ยังไม่รองรับ
