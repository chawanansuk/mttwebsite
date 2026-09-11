/* ============================================================
   สร้างหน้าหมวดเครื่องมือ WYNN'S TOOLS จาก data/wynn-tools.json
   รันด้วย: node _gen-tool-pages.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from "fs";

const SITE = "https://mtthardware.com";
const DATA = JSON.parse(readFileSync("data/wynn-tools.json", "utf8"));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jstr = (s) => JSON.stringify(s);

/* meta ต่อหมวด — title ≤62, description ≤155 (เกณฑ์เดียวกับ smoke test) */
const META = {
  holding: {
    file: "tools-holding.html",
    title: "คีม ประแจจับท่อ ปากกาจับชิ้นงาน WYNN'S TOOLS ราคาส่ง",
    desc: "คีมช่าง WYNN'S TOOLS ครบทุกแบบ — คีมปากรวม ปากแหลม ปากตัด คีมล็อค คีมหนีบแหวน ประแจจับท่อ ซีแคลมป์ ปากกาจับชิ้นงาน มีรหัสและสเปคครบ",
    kw: "คีมช่าง, คีมปากรวม, คีมล็อค, คีมปากแหลม, คีมหนีบแหวน, ประแจจับท่อ, ซีแคลมป์, ปากกาจับชิ้นงาน, WYNN'S TOOLS, วินส์ทูลส์",
    lead_th: "คีมและอุปกรณ์จับยึดทุกแบบที่ช่างใช้จริง ตั้งแต่คีมมินิ 5 นิ้วสำหรับงานละเอียด ไปจนถึงประแจจับท่อ 900 มม. และปากกาจับชิ้นงาน 8 นิ้ว ทุกตัวมีรหัสสินค้า ขนาด จำนวนต่อลัง และเกรดเหล็กระบุชัด",
    lead_en: "Every holding tool a workshop actually uses — from 5-inch mini pliers for fine work to 900 mm pipe wrenches and 8-inch bench vises. Item numbers, sizes, carton quantities and steel grades all listed.",
    eyebrow_th: "หมวดจับยึด", eyebrow_en: "Holding tools",
  },
  wrenches: {
    file: "tools-wrenches.html",
    title: "ประแจ ลูกบล็อก ประแจแหวน WYNN'S TOOLS ครบทุกเบอร์",
    desc: "ประแจ WYNN'S TOOLS — ประแจเลื่อน ปากตายแหวนข้าง แหวนคู่ แหวนฟรี 72 เฟือง ลูกบล็อก ด้ามบล็อก ประแจหางหนู หกเหลี่ยม พร้อมรหัสและขนาดครบ",
    kw: "ประแจ, ประแจเลื่อน, ประแจแหวน, ประแจปากตาย, ประแจแหวนฟรี, ลูกบล็อก, ด้ามบล็อก, ประแจหางหนู, ประแจหกเหลี่ยม, WYNN'S TOOLS",
    lead_th: "หมวดที่ใหญ่ที่สุดของแคตตาล็อก มีตั้งแต่ประแจเลื่อน 6 นิ้วถึง 24 นิ้ว ประแจปากตายแหวนข้างครบเบอร์ 8–32 มม. ประแจแหวนฟรี 72 เฟือง ลูกบล็อกสั้น-ยาว 1/2 นิ้ว ไปจนถึงชุดประแจสำเร็จรูปหลายขนาด",
    lead_en: "The biggest section in the catalogue: adjustable wrenches from 6 to 24 inches, combination wrenches in every size from 8 to 32 mm, 72-tooth ratchet wrenches, short and deep 1/2-inch sockets, and ready-made wrench sets.",
    eyebrow_th: "หมวดประแจ", eyebrow_en: "Wrenches",
  },
  electrical: {
    file: "tools-electrical.html",
    title: "เครื่องมือช่างไฟฟ้า WYNN'S TOOLS คีมย้ำ มิเตอร์ หัวแร้ง",
    desc: "เครื่องมือช่างไฟ WYNN'S TOOLS — คีมตัด-ปอก-ย้ำสายไฟ คีมย้ำหางปลา คีมเข้าสายแลน มิเตอร์ดิจิตอล แคลมป์มิเตอร์ หัวแร้งบัดกรี ปืนลมร้อน",
    kw: "เครื่องมือช่างไฟฟ้า, คีมปอกสายไฟ, คีมย้ำหางปลา, คีมเข้าสายแลน, มิเตอร์ดิจิตอล, แคลมป์มิเตอร์, หัวแร้งบัดกรี, ปืนลมร้อน, ไขควงลองไฟ",
    lead_th: "ครบตั้งแต่คีมปอกสายไฟอัตโนมัติ คีมย้ำหางปลาทุกขนาด 0.5–38 ตร.มม. คีมเข้าสายแลน RJ-45 ไปจนถึงมิเตอร์ดิจิตอล แคลมป์มิเตอร์ หัวแร้งบัดกรี และปืนเป่าลมร้อน",
    lead_en: "Automatic wire strippers, crimping pliers for every size from 0.5 to 38 mm², RJ-45 crimpers, digital multimeters, clamp meters, soldering irons and heat guns.",
    eyebrow_th: "หมวดช่างไฟฟ้า", eyebrow_en: "Electrical tools",
  },
  automotive: {
    file: "tools-automotive.html",
    title: "เครื่องมือช่างยนต์ WYNN'S TOOLS เหล็กดูด กากบาท อัดจารบี",
    desc: "เครื่องมือช่างยนต์ WYNN'S TOOLS — เหล็กดูด 3 ขา ถอดกรองน้ำมัน ประแจกากบาท เหล็กงัดยาง กระบอกอัดจารบี ปืนฉีดลม เกจวัดลมยาง โคมไฟซ่อมรถ",
    kw: "เครื่องมือช่างยนต์, เหล็กดูด 3 ขา, ถอดกรองน้ำมัน, ประแจกากบาท, เหล็กงัดยาง, กระบอกอัดจารบี, ปืนฉีดลม, เกจวัดลมยาง, ตัวถอดสปริงโช๊ค",
    lead_th: "เครื่องมือเฉพาะทางสำหรับอู่และช่างยนต์ ตั้งแต่เหล็กดูด 3 ขา 3–16 นิ้ว ชุดถ้วยถอดกรองน้ำมัน 14 ชิ้น ตัวถอดสปริงโช๊ค ประแจกากบาทถอดล้อ ไปจนถึงกระบอกอัดจารบี ปืนฉีดลม เกจวัดลมยาง และโคมไฟ LED ซ่อมรถ",
    lead_en: "Specialist tools for workshops: 3-jaw pullers from 3 to 16 inches, 14-cup oil filter sets, coil spring compressors, cross rim wrenches, grease guns, air blow guns, tyre gauges and LED work lamps.",
    eyebrow_th: "หมวดช่างยนต์", eyebrow_en: "Automotive tools",
  },
  screwdrivers: {
    file: "tools-screwdrivers.html",
    title: "ไขควง WYNN'S TOOLS ไขควงตอก ชุดซ่อมมือถือ ดอกถอนเกลียว",
    desc: "ไขควง WYNN'S TOOLS — ไขควงตอกแม่เหล็ก ชุดไขควงเปลี่ยนหัว ชุดซ่อมคอม-มือถือ 22/34/45 ชิ้น หัวไขควงดอกสว่าน และดอกถอนเกลียวซ้าย",
    kw: "ไขควง, ไขควงตอก, ไขควงแม่เหล็ก, ชุดไขควง, ไขควงซ่อมมือถือ, ไขควงซ่อมนาฬิกา, ดอกถอนเกลียว, หัวไขควงดอกสว่าน, WYNN'S TOOLS",
    lead_th: "ไขควงตอกแกน CR-V ทนแรงตอก ชุดไขควงเปลี่ยนหัวสำหรับงานทั่วไป ชุดไขควงจิ๋วซ่อมนาฬิกา-คอม-มือถือ ตั้งแต่ 6 ถึง 45 ชิ้น และดอกถอนเกลียวซ้ายสำหรับถอนน็อตหรือท่อที่หักคา",
    lead_en: "CR-V impact screwdrivers, interchangeable-bit drivers, precision kits from 6 to 45 pieces for watches, computers and phones, plus left-hand extractors for snapped bolts and pipes.",
    eyebrow_th: "หมวดไขควง", eyebrow_en: "Screwdrivers",
  },
  cutting: {
    file: "tools-cutting.html",
    title: "กรรไกรตัดเหล็กเส้น คีมตัดเคเบิล กรรไกรตัดสังกะสี WYNN'S",
    desc: "เครื่องมือประเภทตัด WYNN'S TOOLS — กรรไกรตัดเหล็กเส้น 18–42 นิ้ว คีมตัดสายเคเบิลแบบล้อเฟือง คีมตัดลวดสลิง กรรไกรตัดสังกะสี พร้อมรหัสและสเปค",
    kw: "กรรไกรตัดเหล็กเส้น, คีมตัดเคเบิล, คีมตัดสายไฟ, คีมตัดลวดสลิง, กรรไกรตัดสังกะสี, กรรไกรอเนกประสงค์, WYNN'S TOOLS, วินส์ทูลส์",
    lead_th: "เครื่องมือสำหรับงานตัดโดยเฉพาะ ตั้งแต่กรรไกรตัดเหล็กเส้น 18 ถึง 42 นิ้ว ที่ระบุขนาดเหล็กที่ตัดได้ชัดเจน คีมตัดเคเบิลแบบล้อเฟืองสำหรับสายใหญ่ถึง 240 ตร.มม. ไปจนถึงกรรไกรตัดสังกะสีและกรรไกรอเนกประสงค์",
    lead_en: "Purpose-built cutting tools: bolt cutters from 18 to 42 inches with the bar diameter each one handles, ratchet cable cutters for conductors up to 240 mm², tin snips and multi-purpose shears.",
    eyebrow_th: "หมวดตัด", eyebrow_en: "Cutting tools",
  },
  cutter: {
    file: "tools-cutter.html",
    title: "คัตเตอร์ ตะไบ เลื่อยเหล็ก โฮลซอว์ ดอกสว่าน WYNN'S TOOLS",
    desc: "เครื่องมือประเภทคัตเตอร์ WYNN'S TOOLS — คัตเตอร์อเนกประสงค์ คีมตัดท่อ PVC ตะไบ เลื่อยเหล็ก ชุดโฮลซอว์ ดอกสว่านไฮสปีด ตัวตอกเลข พร้อมรหัสครบ",
    kw: "คัตเตอร์, คีมตัดท่อ PVC, ตะไบ, ตะไบเพชร, เลื่อยเหล็ก, ใบเลื่อยเหล็ก, โฮลซอว์, ดอกสว่าน, ดอกเจาะปูน, ตัวตอกเลข, WYNN'S TOOLS",
    lead_th: "หมวดใหญ่ที่รวมงานตัด เจาะ และแต่งผิวไว้ด้วยกัน มีคัตเตอร์อเนกประสงค์ คีมและกรรไกรตัดท่อ PVC ตัวตอกเลข-ตอกรหัส ตะไบทุกหน้าตัด โครงเลื่อยเหล็ก ชุดโฮลซอว์ ดอกสว่านไฮสปีด และดอกเจาะปูนสำหรับสว่านโรตารี่",
    lead_en: "Cutting, drilling and finishing in one section: utility knives, PVC pipe cutters, number and letter punches, files in every profile, hacksaw frames and blades, hole saw kits, HSS twist drills and SDS masonry chisels.",
    eyebrow_th: "หมวดคัตเตอร์", eyebrow_en: "Cutter tools",
  },
  garden: {
    file: "tools-garden.html",
    title: "กรรไกรตัดกิ่ง กรรไกรตัดหญ้า เลื่อยพับ WYNN'S TOOLS ราคาส่ง",
    desc: "เครื่องมือการเกษตร WYNN'S TOOLS — กรรไกรตัดกิ่ง กรรไกรตัดกิ่งด้ามยาว กรรไกรตัดหญ้า เลื่อยพับ เลื่อยธนู ปืนฉีดน้ำ พร้อมรหัสและขนาดครบ",
    kw: "กรรไกรตัดกิ่ง, กรรไกรตัดหญ้า, กรรไกรตัดกิ่งด้ามยาว, เลื่อยพับ, เลื่อยธนู, ปืนฉีดน้ำ, เครื่องมือการเกษตร, WYNN'S TOOLS",
    lead_th: "เครื่องมือสวนและการเกษตร ตั้งแต่กรรไกรตัดกิ่งใบสปริงเหล็กกล้าคาร์บอนสูง กรรไกรตัดหญ้าทั้งด้ามไม้และด้ามยืดปรับได้ เลื่อยพับฟัน 3 คม เลื่อยธนู ไปจนถึงกรรไกรตัดกิ่งด้ามยาวปรับได้ถึง 3 เมตร และปืนฉีดน้ำชุบโลหะ",
    lead_en: "Garden and orchard tools: by-pass pruners with high-carbon spring blades, grass shears with wooden or telescopic handles, three-edge folding saws, bow saws, tree pruners reaching three metres, and metal-plated water guns.",
    eyebrow_th: "หมวดการเกษตร", eyebrow_en: "Garden tools",
  },
  striking: {
    file: "tools-striking.html",
    title: "ค้อน ค้อนหงอน ค้อนปอนด์ สิ่ว เหล็กสกัด WYNN'S TOOLS",
    desc: "เครื่องมือทุบและตอก WYNN'S TOOLS — ค้อนหงอนด้ามไฟเบอร์ ค้อนปอนด์ ค้อนหัวกลม ค้อนยาง สิ่วไม้ ชุดเหล็กสกัด เกรียงโป๊ว พร้อมรหัสและน้ำหนักครบ",
    kw: "ค้อน, ค้อนหงอน, ค้อนปอนด์, ค้อนหัวกลม, ค้อนยาง, ค้อนไม้, สิ่วไม้, เหล็กสกัด, เกรียงโป๊ว, ตราสิงห์, WYNN'S TOOLS",
    lead_th: "ค้อนและเครื่องมือตอกครบทุกแบบ ค้อนหงอนด้ามไฟเบอร์กันลื่น ค้อนปอนด์ด้ามไฟเบอร์และด้ามสั้น ค้อนหัวกลม ค้อนไม้ตีกิฟ พร้อมสิ่วไม้ด้ามใส ชุดเหล็กสกัด 12 ชิ้น และเกรียงโป๊วสี — รวมค้อนตราสิงห์และตรา M.T.T. ของร้าน",
    lead_en: "Hammers and striking tools of every kind: fibre-handle claw hammers, sledge and short-handle club hammers, round-head and mallet types, crystal-handle wood chisels, 12-piece cold chisel sets and putty knives — including the shop's own ตราสิงห์ and M.T.T. hammers.",
    eyebrow_th: "หมวดทุบและตอก", eyebrow_en: "Striking tools",
  },
  measuring: {
    file: "tools-measuring.html",
    title: "ตลับเมตร วัดระดับน้ำ ฉากผสม ลูกดิ่ง WYNN'S TOOLS",
    desc: "เครื่องมือวัด WYNN'S TOOLS — วัดระดับน้ำอลูมิเนียมแบบแม่เหล็ก ไม้บรรทัดพับ 600 มม. ฉากผสม ฉากสามเหลี่ยมสแตนเลส ลูกดิ่ง พร้อมรหัสครบ",
    kw: "วัดระดับน้ำ, ระดับน้ำแม่เหล็ก, ไม้บรรทัดพับ, ฉากผสม, ฉากสามเหลี่ยม, ลูกดิ่ง, เครื่องมือวัด, WYNN'S TOOLS, วินส์ทูลส์",
    lead_th: "เครื่องมือวัดสำหรับงานก่อสร้างและงานไม้ วัดระดับน้ำอลูมิเนียมทั้งแบบธรรมดาและแบบมีแถบแม่เหล็กยึดติดเหล็กได้ ไม้บรรทัดพับอลูมิเนียม 600 มม. ฉากผสมปรับองศา ฉากสามเหลี่ยมสแตนเลส และลูกดิ่งแบบมีล้อเก็บสาย",
    lead_en: "Measuring tools for building and joinery: aluminium spirit levels plain or with a magnetic strip, 600 mm folding rulers, adjustable combination squares, stainless triangle rulers and plumb bobs with retractable reels.",
    eyebrow_th: "หมวดเครื่องมือวัด", eyebrow_en: "Measuring tools",
  },
  upholster: {
    file: "tools-upholster.html",
    title: "คีมย้ำรีเวท ปืนยิงกาว ปืนยิงแม็ก เข็มกลัด WYNN'S TOOLS",
    desc: "เครื่องมือแต่งบ้าน WYNN'S TOOLS — คีมย้ำรีเวทอลูมิเนียม ปืนยิงกาวซิลิโคน ค้อนยิงลวดแม็ก เลื่อยฉลุผนัง ถ้วยดูดกระจก และเข็มกลัดตรา M.T.T.",
    kw: "คีมย้ำรีเวท, ปืนยิงกาว, กาวแท่ง, ปืนยิงแม็ก, ลวดเย็บ, เลื่อยฉลุ, ถ้วยดูดกระจก, เข็มกลัด, ตรา M.T.T., WYNN'S TOOLS",
    lead_th: "เครื่องมือสำหรับงานตกแต่งและซ่อมแซมในบ้าน คีมย้ำรีเวทอลูมิเนียมแบบปรับหัวได้ ปืนยิงกาวซิลิโคนโครงเหล็ก ค้อนยิงลวดแม็ก เลื่อยหางหนูตัดผนังยิปซัม ถ้วยดูดกระจก 2 และ 3 ขา พร้อมสินค้าตรา M.T.T. ของร้านเอง ทั้งปืนยิงกาว ลวดเย็บ และเข็มกลัดซ่อนปลาย",
    lead_en: "Tools for finishing and repairs around the house: adjustable-head aluminium riveters, steel-frame silicone glue guns, hammer staplers, wallboard saws, two- and three-cup glass lifters, plus the shop's own M.T.T. glue guns, staples and safety pins.",
    eyebrow_th: "หมวดแต่งบ้าน", eyebrow_en: "Upholster tools",
  },
  soldering: {
    file: "tools-soldering.html",
    title: "กล่องเครื่องมือ กระเป๋าเครื่องมือ แว่นเซฟตี้ WYNN'S TOOLS",
    desc: "กล่องเครื่องมือและอุปกรณ์เซฟตี้ WYNN'S TOOLS — กล่องเครื่องมือเหล็ก 14–18 นิ้ว กระเป๋าเครื่องมือผ้า แว่นตาเซฟตี้ใส ถุงมือเซฟตี้ พร้อมรหัสครบ",
    kw: "กล่องเครื่องมือ, กระเป๋าเครื่องมือ, กล่องเครื่องมือเหล็ก, แว่นตาเซฟตี้, ถุงมือเซฟตี้, เครื่องมือเชื่อมเหล็ก, WYNN'S TOOLS",
    lead_th: "กล่องและกระเป๋าสำหรับเก็บเครื่องมือ พร้อมอุปกรณ์ป้องกันพื้นฐาน มีทั้งกล่องเครื่องมือเหล็กหลายขนาด กระเป๋าเครื่องมือผ้าแบบสะพาย แว่นตาเซฟตี้ใส และถุงมือเซฟตี้",
    lead_en: "Toolboxes and bags with the basic protective kit: steel toolboxes in several sizes, canvas tool bags, clear safety goggles and work gloves.",
    eyebrow_th: "หมวดกล่องเครื่องมือ", eyebrow_en: "Tool storage & safety",
  },
  hydraulic: {
    file: "tools-hydraulic.html",
    title: "คีมย้ำหางปลาไฮดรอลิค เหล็กดูดไฮดรอลิค WYNN'S TOOLS",
    desc: "เครื่องมือไฮดรอลิค WYNN'S TOOLS — ชุดคีมย้ำหางปลาไฮดรอลิค 8 ตัน ชุดเครื่องดูดลูกปืนมูเล่ย์ไฮดรอลิค และขาตั้งรถยนต์ พร้อมรหัสและสเปคครบ",
    kw: "คีมย้ำหางปลาไฮดรอลิค, เหล็กดูดไฮดรอลิค, เครื่องดูดลูกปืน, ดูดมูเล่ย์, ขาตั้งรถยนต์, แม่แรง, WYNN'S TOOLS, วินส์ทูลส์",
    lead_th: "เครื่องมือไฮดรอลิคสำหรับงานหนัก ชุดคีมย้ำหางปลาไฮดรอลิคแรงกด 8 ตันพร้อมดายหลายขนาด ชุดเครื่องดูดลูกปืนและมูเล่ย์แบบไฮดรอลิค และขาตั้งรถยนต์รับน้ำหนัก",
    lead_en: "Hydraulic tools for heavy work: 8-tonne hydraulic crimping sets with a range of dies, hydraulic bearing and pulley pullers, and axle stands.",
    eyebrow_th: "หมวดไฮดรอลิค", eyebrow_en: "Hydraulic tools",
  },
  padlock: {
    file: "tools-padlock.html",
    title: "กุญแจสิงห์เงิน กุญแจสิงห์ทอง กุญแจคีย์อะไลค์ ตรา M.T.T.",
    desc: "กุญแจ ม.ทวีภัณฑ์ — กุญแจสิงห์เงินและสิงห์ทองระบบลูกปืน ไส้ทองเหลืองแท้ กุญแจคีย์อะไลค์ไขดอกเดียว กุญแจห่วงเฮง ครบทุกขนาด 20–60 มม.",
    kw: "กุญแจ, กุญแจสิงห์เงิน, กุญแจสิงห์ทอง, กุญแจคีย์อะไลค์, กุญแจลูกปืน, กุญแจทองเหลือง, กุญแจห่วงเฮง, ตรา M.T.T., ตราสิงโต",
    lead_th: "กุญแจตรา M.T.T. ของร้านเอง ปั๊มรูปสิงโตบนตัวกุญแจ มีทั้งสิงห์เงินระบบลูกปืนและสิงห์ทองไส้ทองเหลืองแท้ คอสั้นและคอยาว ขนาด 20 ถึง 60 มม. พร้อมชุดคีย์อะไลค์ที่ไขด้วยดอกเดียวกันทั้งชุด เหมาะกับร้านค้า โกดัง และหอพักที่ต้องถือกุญแจดอกเดียว",
    lead_en: "The shop's own M.T.T. padlocks, lion-embossed on the body: silver-lion ball-locking and gold-lion solid brass cylinders, short or long shackle, 20 to 60 mm, plus keyed-alike sets that open on one key — made for shops, warehouses and rental blocks.",
    eyebrow_th: "หมวดกุญแจ", eyebrow_en: "Padlocks",
  },
  blades: {
    file: "tools-blades.html",
    title: "มีดครัวตราสิงห์คู่ ใบมีดโกน กรรไกรตัดผม ตรา M.T.T.",
    desc: "ของมีคมใช้ในบ้าน ม.ทวีภัณฑ์ — มีดครัวตราสิงห์คู่ M.T.T. ใบมีดสแตนเลส 2 คม มีดโกน SPORTS กรรไกรตัดผม และกรรไกรซอยผม พร้อมรหัสครบ",
    kw: "มีดครัว, มีดครัวตราสิงห์คู่, ใบมีดโกน, ใบมีด 2 คม, มีดโกน, กรรไกรตัดผม, กรรไกรซอยผม, ตรา M.T.T., ของมีคมใช้ในบ้าน",
    lead_th: "ของมีคมใช้ในบ้าน ส่วนใหญ่เป็นสินค้าตรา M.T.T. ของร้านเอง มีดครัวตราสิงห์คู่ทั้งแบบแพ็คและแบบเปล่า ใบมีดโกนสแตนเลส 2 คม มีดโกน SPORTS M.T.T. พร้อมกรรไกรตัดผมและกรรไกรซอยผม",
    lead_en: "Household blades, mostly the shop's own M.T.T. line: twin-lion kitchen knives packed or loose, stainless double-edge razor blades, SPORTS M.T.T. razors, and hair cutting and thinning scissors.",
    eyebrow_th: "หมวดของมีคม", eyebrow_en: "Household blades",
  },
};

/* บางหมวดไม่ใช่สินค้า WYNN'S — กุญแจและของมีคมเป็นตรา M.T.T. ของร้านและแบรนด์อื่น
   จึงห้ามพาดหัวว่า WYNN'S TOOLS เพราะจะเป็นการอ้างยี่ห้อผิด */
const BRAND = {
  padlock: { th: "ตรา M.T.T.", en: "M.T.T. brand", eyebrow_th: "ตรา M.T.T. และแบรนด์อื่น", eyebrow_en: "M.T.T. & other brands" },
  blades:  { th: "ตรา M.T.T.", en: "M.T.T. brand", eyebrow_th: "ตรา M.T.T.", eyebrow_en: "M.T.T. brand" },
};
const brandOf = (id) => BRAND[id] || { th: "WYNN'S TOOLS", en: "WYNN'S TOOLS", eyebrow_th: "WYNN'S TOOLS (วินส์ทูลส์)", eyebrow_en: "WYNN'S TOOLS" };

const NAV = Object.entries(META).map(([id, m]) => ({ id, file: m.file, th: DATA.categories.find((c) => c.id === id)?.th || id }));

function rows(items, withPics, brandTh) {
  return items.map((x) => {
    const ask = `สอบถามราคา ${x.code} ${x.th}${x.size ? " (" + x.size + ")" : ""}`;
    const note = x.notes_th ? `<div class="note">${esc(x.notes_th)}</div>` : "";
    const pic = !withPics ? "" : (x.img
      ? `\n            <td class="pic"><a href="../${x.img}" target="_blank" rel="noopener" aria-label="ดูรูปใหญ่ ${esc(x.code)}"><img src="../${x.img.replace(".webp", "-sm.webp")}" alt="${esc(x.th)} ${esc(x.code)} ${esc(brandTh)}" width="320" height="240" loading="lazy"></a></td>`
      : `\n            <td class="pic"></td>`);
    return `          <tr>${pic}
            <td class="code"><a data-line-ask="${esc(ask)}" href="#" target="_blank" rel="noopener">${esc(x.code)}</a></td>
            <td><b>${esc(x.th)}</b><small>${esc(x.en)}</small>${note}</td>
            <td>${esc(x.size)}</td>
            <td>${esc(x.pcs)}</td>
            <td>${esc(x.mat || "")}</td>
          </tr>`;
  }).join("\n");
}

function groupHTML(g, i, withPics, brandTh) {
  const notes = (g.notes_th || []).map((n) => `<li>${esc(n)}</li>`).join("");
  return `    <h3 class="grp-h" id="g${i}">${esc(g.th)} <span>${esc(g.en)}</span> <em>${g.items.length} รายการ</em></h3>
${g.mat ? `    <p class="grp-mat"><span data-th="วัสดุ" data-en="Material">วัสดุ</span>: ${esc(g.mat)}</p>` : ""}
${notes ? `    <ul class="grp-notes">${notes}</ul>` : ""}
    <div class="tblwrap">
      <table class="tools${withPics ? " haspic" : ""}">
        <thead><tr>
${withPics ? `          <th class="pic" data-th="รูป" data-en="Photo">รูป</th>\n` : ""}          <th data-th="รหัส" data-en="Item no.">รหัส</th>
          <th data-th="ชื่อสินค้า" data-en="Product">ชื่อสินค้า</th>
          <th data-th="ขนาด" data-en="Size">ขนาด</th>
          <th data-th="จำนวน/ลัง" data-en="Per carton">จำนวน/ลัง</th>
          <th data-th="วัสดุ" data-en="Steel">วัสดุ</th>
        </tr></thead>
        <tbody>
${rows(g.items, withPics, brandTh)}
        </tbody>
      </table>
    </div>`;
}

function page(cat) {
  const m = META[cat.id];
  const total = cat.groups.reduce((n, g) => n + g.items.length, 0);
  const nPics = cat.groups.reduce((n, g) => n + g.items.filter((x) => x.img).length, 0);
  const withPics = nPics > 0;
  const other = NAV.filter((n) => n.id !== cat.id);
  const url = `${SITE}/products/${m.file}`;

  const itemList = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: `${cat.th} ${brandOf(cat.id).th}`,
    description: m.desc,
    numberOfItems: total,
    itemListElement: cat.groups.map((g, i) => ({
      "@type": "ListItem", position: i + 1, name: `${g.th} (${g.en})`,
      description: `${g.items.length} รายการ${g.mat ? " · วัสดุ " + g.mat : ""}`,
    })),
  };
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "เครื่องมือช่าง WYNN'S TOOLS", item: `${SITE}/products/tools.html` },
      { "@type": "ListItem", position: 3, name: cat.th, item: url },
    ],
  };

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>try{var l=localStorage.getItem('mtt_lang');if(l&&l!=='th')document.documentElement.classList.add('pending-lang');}catch(e){}</script>
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.desc)}">
<meta name="keywords" content="${esc(m.kw)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(cat.th)} ${esc(brandOf(cat.id).th)} — ${total} รายการ พร้อมรหัสและสเปค">
<meta property="og:description" content="${esc(m.desc.slice(0, 110))}">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101a30">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&family=Anuphan:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/theme.css?v=2">
<script type="application/ld+json">
${JSON.stringify(crumbs, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
</script>
<style>
.t-hero{background:radial-gradient(900px 420px at 82% -20%,rgba(18,161,80,.16),transparent 60%),linear-gradient(180deg,#fff,var(--bg));padding:46px 0 24px}
.crumbs{font-size:.82rem;color:var(--ink-mute);margin-bottom:14px}
.crumbs a{color:var(--ink-mute)}
.t-hero h1{font-size:clamp(1.6rem,3.4vw,2.4rem);margin:6px 0 8px}
.t-hero .muted{max-width:740px;margin:0}
.trust{display:flex;flex-wrap:wrap;gap:9px;margin:16px 0 0}
.trust .badge{font-size:.83rem;padding:7px 14px}
.catnav{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0}
.catnav a{font-size:.85rem;padding:7px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--ink-2);text-decoration:none}
.catnav a:hover{border-color:var(--amber);color:var(--amber-dark)}
.catnav a.on{background:var(--navy);border-color:var(--navy);color:#fff}
.findbar{position:sticky;top:0;z-index:5;background:var(--bg);padding:14px 0 10px;border-bottom:1px solid var(--line)}
.findbar input{width:100%;max-width:460px;padding:12px 16px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);font:inherit;font-size:.95rem;background:var(--surface)}
.findbar input:focus{outline:2px solid var(--amber);border-color:transparent}
.findbar .hit{font-size:.83rem;color:var(--ink-mute);margin-top:8px}
.grp-h{font-size:clamp(1.05rem,2.1vw,1.3rem);margin:34px 0 6px;scroll-margin-top:80px}
.grp-h span{font-family:"Anuphan";font-weight:500;font-size:.8rem;color:var(--ink-mute);display:block}
.grp-h em{font-style:normal;font-family:"Anuphan";font-size:.78rem;color:var(--amber-dark);background:var(--amber-soft);border-radius:999px;padding:2px 10px;vertical-align:middle}
.grp-mat{font-size:.85rem;color:var(--ink-dim);margin:0 0 6px}
.grp-notes{margin:0 0 12px;padding-left:20px;font-size:.85rem;color:var(--ink-dim)}
.grp-notes li{padding:2px 0}
.tblwrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface)}
table.tools{width:100%;border-collapse:collapse;font-size:.88rem;min-width:660px}
table.tools.haspic{min-width:740px}
table.tools th{font-family:"Kanit";font-weight:600;text-align:left;background:var(--navy);color:#fff;padding:10px 14px;white-space:nowrap;position:sticky;top:0}
table.tools td{padding:10px 14px;border-top:1px solid var(--line);vertical-align:top}
table.tools tr:nth-child(even) td{background:var(--bg-soft)}
table.tools th.pic{width:88px}
table.tools td.pic{width:88px;padding:8px 10px}
table.tools td.pic img{width:72px;height:54px;object-fit:contain;display:block;background:#fff;border:1px solid var(--line);border-radius:8px}
table.tools td.pic a:hover img{border-color:var(--amber)}
table.tools td.code a{font-family:"Kanit";font-weight:600;color:var(--amber-dark);white-space:nowrap;text-decoration:none;border-bottom:1px dashed var(--amber)}
table.tools td.code a:hover{background:var(--amber-soft)}
table.tools td b{font-family:"Kanit";font-weight:500;display:block}
table.tools td small{color:var(--ink-mute);font-size:.78rem}
table.tools td .note{font-size:.78rem;color:var(--ink-dim);margin-top:4px;max-width:320px}
.cta-band{background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:28px;margin-top:40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
.cta-band h2{color:#fff;font-size:1.25rem;margin:0 0 4px}
.cta-band p{color:#c2cbde;margin:0;font-size:.9rem}
@media(max-width:600px){.findbar{position:static}table.tools td .note{max-width:none}}
</style>
</head>
<body>
<div id="site-header"></div>

<section class="t-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="../index.html" data-th="หน้าแรก" data-en="Home">หน้าแรก</a> › <a href="tools.html" data-th="เครื่องมือช่าง" data-en="Hand tools">เครื่องมือช่าง</a> › <span>${esc(cat.th)}</span></nav>
    <span class="eyebrow" data-th="${esc(m.eyebrow_th)} · ${esc(brandOf(cat.id).eyebrow_th)}" data-en="${esc(m.eyebrow_en)} · ${esc(brandOf(cat.id).eyebrow_en)}">${esc(m.eyebrow_th)} · ${esc(brandOf(cat.id).eyebrow_th)}</span>
    <h1>${esc(cat.th)} ${esc(brandOf(cat.id).th)}</h1>
    <p class="muted" data-th="${esc(m.lead_th)}" data-en="${esc(m.lead_en)}">${esc(m.lead_th)}</p>
    <div class="trust">
      <span class="badge">📋 ${total} <span data-th="รายการ" data-en="items">รายการ</span></span>
${withPics ? `      <span class="badge">📷 ` + nPics + ` <span data-th="รายการมีรูปสินค้า" data-en="with product photos">รายการมีรูปสินค้า</span></span>\n` : ""}
      <span class="badge" data-th="✔ ผู้นำเข้าโดยตรง" data-en="✔ Direct importer">✔ ผู้นำเข้าโดยตรง</span>
      <span class="badge" data-th="🏷️ ราคาปลีก-ส่ง" data-en="🏷️ Retail &amp; wholesale">🏷️ ราคาปลีก-ส่ง</span>
      <span class="badge" data-th="🚚 ส่งทั่วไทย" data-en="🚚 Nationwide">🚚 ส่งทั่วไทย</span>
    </div>
    <nav class="catnav" aria-label="หมวดเครื่องมือ">
      <a href="tools.html" data-th="ทุกหมวด" data-en="All categories">ทุกหมวด</a>
      <a class="on" aria-current="page" href="${m.file}">${esc(cat.th)}</a>
${other.map((n) => `      <a href="${n.file}">${esc(n.th)}</a>`).join("\n")}
    </nav>
  </div>
</section>

<section style="padding-top:10px">
  <div class="wrap">
    <div class="findbar">
      <label class="vh" for="findInput" data-th="ค้นหาในหมวดนี้" data-en="Search this category">ค้นหาในหมวดนี้</label>
      <input id="findInput" type="search" autocomplete="off" placeholder="ค้นรหัสหรือชื่อสินค้า เช่น ${esc(cat.groups[0].items[0].code)} หรือ ${esc(cat.groups[0].items[0].th.slice(0, 12))}">
      <div class="hit" id="findHit" hidden></div>
    </div>

    <h2 class="vh">${esc(cat.th)} — ${total} รายการ</h2>
${cat.groups.map((g, i) => groupHTML(g, i, withPics, brandOf(cat.id).th)).join("\n\n")}

    <div class="cta-band">
      <div>
        <h2 data-th="เจอรหัสที่ต้องการแล้ว? กดที่รหัสเพื่อถามราคา" data-en="Found your item number? Tap it to ask price">เจอรหัสที่ต้องการแล้ว? กดที่รหัสเพื่อถามราคา</h2>
        <p data-th="กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้" data-en="Tap any item number and LINE opens with the message ready — or just tell us what you need and we'll check stock and quote.">กดที่รหัสสินค้าในตาราง ระบบจะเปิด LINE พร้อมข้อความให้แล้ว หรือทักมาบอกรายการที่ต้องการก็ได้ ทีมงานเช็คสต็อกและแจ้งราคาส่งให้</p>
      </div>
      <a class="btn btn-primary" data-line-ask="สอบถามราคา${esc(brandOf(cat.id).th === "WYNN'S TOOLS" ? "เครื่องมือ WYNN'S TOOLS หมวด" : "")}${esc(cat.th)}" href="#" target="_blank" rel="noopener" data-th="ทัก LINE ถามราคา" data-en="Ask on LINE">ทัก LINE ถามราคา</a>
    </div>
  </div>
</section>

<div id="site-footer"></div>

<script>window.MTT_BASE="../";window.MTT_PAGE="tools";</script>
<script src="../assets/js/shop-config.js?v=2"></script>
<script src="../assets/js/catalog.js?v=2"></script>
<script src="../assets/js/cart.js?v=2"></script>
<script>
document.querySelectorAll("[data-line-ask]").forEach(function(a){
  a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
});
/* ค้นหาในหน้า: กรองแถวตามรหัส/ชื่อ แล้วซ่อนกลุ่มที่ไม่เหลือแถว */
(function(){
  var inp=document.getElementById("findInput"), hit=document.getElementById("findHit");
  if(!inp) return;
  var wraps=[].slice.call(document.querySelectorAll(".tblwrap"));
  var blocks=wraps.map(function(w){
    var head=w.previousElementSibling;
    while(head && !/^H3$/.test(head.tagName)) head=head.previousElementSibling;
    var extras=[];
    for(var e=w.previousElementSibling; e && e!==head; e=e.previousElementSibling) extras.push(e);
    return { wrap:w, head:head, extras:extras, rows:[].slice.call(w.querySelectorAll("tbody tr")) };
  });
  function apply(){
    var q=inp.value.trim().toLowerCase();
    var n=0;
    blocks.forEach(function(b){
      var shown=0;
      b.rows.forEach(function(r){
        var ok = !q || r.textContent.toLowerCase().indexOf(q) >= 0;
        r.hidden = !ok; if(ok) shown++;
      });
      n += shown;
      var off = q && shown===0;
      b.wrap.hidden = off;
      if(b.head) b.head.hidden = off;
      b.extras.forEach(function(e){ e.hidden = off; });
    });
    if(q){ hit.hidden=false; hit.textContent = n ? ("พบ " + n + " รายการ") : "ไม่พบรายการที่ค้นหา — ลองพิมพ์รหัสหรือชื่อสั้นลง"; }
    else { hit.hidden=true; }
  }
  inp.addEventListener("input", apply);
})();
</script>
<script src="../assets/js/layout.js?v=2"></script>
<script src="/_vercel/insights/script.js" defer></script>
</body>
</html>
`;
}

const made = [];
for (const cat of DATA.categories) {
  const m = META[cat.id];
  if (!m) continue;
  if (m.title.length > 62) throw new Error(`title ยาวเกิน (${m.title.length}) — ${cat.id}`);
  if (m.desc.length > 155) throw new Error(`description ยาวเกิน (${m.desc.length}) — ${cat.id}`);
  writeFileSync("products/" + m.file, page(cat));
  made.push(`  products/${m.file}  ${cat.groups.reduce((n, g) => n + g.items.length, 0)} รายการ  (title ${m.title.length} · desc ${m.desc.length})`);
}
console.log("สร้างแล้ว " + made.length + " หน้า:\n" + made.join("\n"));
