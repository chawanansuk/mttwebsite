/* ============================================================
   สร้างหน้าหมวดเครื่องมือ WYNNTOOLS / ตรา M.T.T. จาก data/wynn-tools.json
   รันด้วย: node _gen-tool-pages.mjs   (หรือ npm run gen)
   โค้ดตาราง/หัว/สคริปต์ที่ใช้ร่วมกับ mtt-brand.html อยู่ใน _gen-lib.mjs
   ============================================================ */
import { writeFileSync } from "fs";
import { bakeChrome } from "./_chrome.mjs";
import { SITE, DATA, esc, bi, mergeGroups, groupHTML, grpNavHTML, headHTML, scriptsHTML, crumbsHTML, ctaBandHTML } from "./_gen-lib.mjs";

const META = {
  holding: {
    file: "tools-holding.html",
    title: "คีม ประแจจับท่อ ปากกาจับชิ้นงาน WYNNTOOLS ราคาส่ง",
    desc: "คีมช่าง WYNNTOOLS ครบทุกแบบ — คีมปากรวม ปากแหลม ปากตัด คีมล็อค คีมหนีบแหวน ประแจจับท่อ ซีแคลมป์ ปากกาจับชิ้นงาน มีรหัสและสเปคครบ",
    kw: "คีมช่าง, คีมปากรวม, คีมล็อค, คีมปากแหลม, คีมหนีบแหวน, ประแจจับท่อ, ซีแคลมป์, ปากกาจับชิ้นงาน, WYNNTOOLS, วินส์ทูลส์",
    lead_th: "คีมและอุปกรณ์จับยึดทุกแบบที่ช่างใช้จริง ตั้งแต่คีมมินิ 5 นิ้วสำหรับงานละเอียด ไปจนถึงประแจจับท่อ 900 มม. และปากกาจับชิ้นงาน 8 นิ้ว ทุกตัวมีรหัสสินค้า ขนาด จำนวนต่อลัง และเกรดเหล็กระบุชัด",
    lead_en: "Every holding tool a workshop actually uses — from 5-inch mini pliers for fine work to 900 mm pipe wrenches and 8-inch bench vises. Item numbers, sizes, carton quantities and steel grades all listed.",
    eyebrow_th: "หมวดจับยึด", eyebrow_en: "Holding tools",
  },
  wrenches: {
    file: "tools-wrenches.html",
    title: "ประแจ ลูกบล็อก ประแจแหวน WYNNTOOLS ครบทุกเบอร์",
    desc: "ประแจ WYNNTOOLS — ประแจเลื่อน ปากตายแหวนข้าง แหวนคู่ แหวนฟรี 72 เฟือง ลูกบล็อก ด้ามบล็อก ประแจหางหนู หกเหลี่ยม พร้อมรหัสและขนาดครบ",
    kw: "ประแจ, ประแจเลื่อน, ประแจแหวน, ประแจปากตาย, ประแจแหวนฟรี, ลูกบล็อก, ด้ามบล็อก, ประแจหางหนู, ประแจหกเหลี่ยม, WYNNTOOLS",
    lead_th: "หมวดที่ใหญ่ที่สุดของแคตตาล็อก มีตั้งแต่ประแจเลื่อน 6 นิ้วถึง 24 นิ้ว ประแจปากตายแหวนข้างครบเบอร์ 8–32 มม. ประแจแหวนฟรี 72 เฟือง ลูกบล็อกสั้น-ยาว 1/2 นิ้ว ไปจนถึงชุดประแจสำเร็จรูปหลายขนาด",
    lead_en: "The biggest section in the catalogue: adjustable wrenches from 6 to 24 inches, combination wrenches in every size from 8 to 32 mm, 72-tooth ratchet wrenches, short and deep 1/2-inch sockets, and ready-made wrench sets.",
    eyebrow_th: "หมวดประแจ", eyebrow_en: "Wrenches",
  },
  electrical: {
    file: "tools-electrical.html",
    title: "เครื่องมือช่างไฟฟ้า WYNNTOOLS คีมย้ำ มิเตอร์ หัวแร้ง",
    desc: "เครื่องมือช่างไฟ WYNNTOOLS — คีมตัด-ปอก-ย้ำสายไฟ คีมย้ำหางปลา คีมเข้าสายแลน มิเตอร์ดิจิตอล แคลมป์มิเตอร์ หัวแร้งบัดกรี ปืนลมร้อน",
    kw: "เครื่องมือช่างไฟฟ้า, คีมปอกสายไฟ, คีมย้ำหางปลา, คีมเข้าสายแลน, มิเตอร์ดิจิตอล, แคลมป์มิเตอร์, หัวแร้งบัดกรี, ปืนลมร้อน, ไขควงลองไฟ",
    lead_th: "ครบตั้งแต่คีมปอกสายไฟอัตโนมัติ คีมย้ำหางปลาทุกขนาด 0.5–38 ตร.มม. คีมเข้าสายแลน RJ-45 ไปจนถึงมิเตอร์ดิจิตอล แคลมป์มิเตอร์ หัวแร้งบัดกรี และปืนเป่าลมร้อน",
    lead_en: "Automatic wire strippers, crimping pliers for every size from 0.5 to 38 mm², RJ-45 crimpers, digital multimeters, clamp meters, soldering irons and heat guns.",
    eyebrow_th: "หมวดช่างไฟฟ้า", eyebrow_en: "Electrical tools",
  },
  automotive: {
    file: "tools-automotive.html",
    title: "เครื่องมือช่างยนต์ WYNNTOOLS เหล็กดูด กากบาท อัดจารบี",
    desc: "เครื่องมือช่างยนต์ WYNNTOOLS — เหล็กดูด 3 ขา ถอดกรองน้ำมัน ประแจกากบาท เหล็กงัดยาง กระบอกอัดจารบี ปืนฉีดลม เกจวัดลมยาง โคมไฟซ่อมรถ",
    kw: "เครื่องมือช่างยนต์, เหล็กดูด 3 ขา, ถอดกรองน้ำมัน, ประแจกากบาท, เหล็กงัดยาง, กระบอกอัดจารบี, ปืนฉีดลม, เกจวัดลมยาง, ตัวถอดสปริงโช๊ค",
    lead_th: "เครื่องมือเฉพาะทางสำหรับอู่และช่างยนต์ ตั้งแต่เหล็กดูด 3 ขา 3–16 นิ้ว ชุดถ้วยถอดกรองน้ำมัน 14 ชิ้น ตัวถอดสปริงโช๊ค ประแจกากบาทถอดล้อ ไปจนถึงกระบอกอัดจารบี ปืนฉีดลม เกจวัดลมยาง และโคมไฟ LED ซ่อมรถ",
    lead_en: "Specialist tools for workshops: 3-jaw pullers from 3 to 16 inches, 14-cup oil filter sets, coil spring compressors, cross rim wrenches, grease guns, air blow guns, tyre gauges and LED work lamps.",
    eyebrow_th: "หมวดช่างยนต์", eyebrow_en: "Automotive tools",
  },
  screwdrivers: {
    file: "tools-screwdrivers.html",
    title: "ไขควง WYNNTOOLS ไขควงตอก ชุดซ่อมมือถือ ดอกถอนเกลียว",
    desc: "ไขควง WYNNTOOLS — ไขควงตอกแม่เหล็ก ชุดไขควงเปลี่ยนหัว ชุดซ่อมคอม-มือถือ 22/34/45 ชิ้น หัวไขควงดอกสว่าน และดอกถอนเกลียวซ้าย",
    kw: "ไขควง, ไขควงตอก, ไขควงแม่เหล็ก, ชุดไขควง, ไขควงซ่อมมือถือ, ไขควงซ่อมนาฬิกา, ดอกถอนเกลียว, หัวไขควงดอกสว่าน, WYNNTOOLS",
    lead_th: "ไขควงตอกแกน CR-V ทนแรงตอก ชุดไขควงเปลี่ยนหัวสำหรับงานทั่วไป ชุดไขควงจิ๋วซ่อมนาฬิกา-คอม-มือถือ ตั้งแต่ 6 ถึง 45 ชิ้น และดอกถอนเกลียวซ้ายสำหรับถอนน็อตหรือท่อที่หักคา",
    lead_en: "CR-V impact screwdrivers, interchangeable-bit drivers, precision kits from 6 to 45 pieces for watches, computers and phones, plus left-hand extractors for snapped bolts and pipes.",
    eyebrow_th: "หมวดไขควง", eyebrow_en: "Screwdrivers",
  },
  cutting: {
    file: "tools-cutting.html",
    title: "กรรไกรตัดเหล็กเส้น คีมตัดเคเบิล กรรไกรตัดสังกะสี WYNNTOOLS",
    desc: "เครื่องมือประเภทตัด WYNNTOOLS — กรรไกรตัดเหล็กเส้น 18–42 นิ้ว คีมตัดสายเคเบิลแบบล้อเฟือง คีมตัดลวดสลิง กรรไกรตัดสังกะสี พร้อมรหัสและสเปค",
    kw: "กรรไกรตัดเหล็กเส้น, คีมตัดเคเบิล, คีมตัดสายไฟ, คีมตัดลวดสลิง, กรรไกรตัดสังกะสี, กรรไกรอเนกประสงค์, WYNNTOOLS, วินส์ทูลส์",
    lead_th: "เครื่องมือสำหรับงานตัดโดยเฉพาะ ตั้งแต่กรรไกรตัดเหล็กเส้น 18 ถึง 42 นิ้ว ที่ระบุขนาดเหล็กที่ตัดได้ชัดเจน คีมตัดเคเบิลแบบล้อเฟืองสำหรับสายใหญ่ถึง 240 ตร.มม. ไปจนถึงกรรไกรตัดสังกะสีและกรรไกรอเนกประสงค์",
    lead_en: "Purpose-built cutting tools: bolt cutters from 18 to 42 inches with the bar diameter each one handles, ratchet cable cutters for conductors up to 240 mm², tin snips and multi-purpose shears.",
    eyebrow_th: "หมวดตัด", eyebrow_en: "Cutting tools",
  },
  cutter: {
    file: "tools-cutter.html",
    title: "คัตเตอร์ ตะไบ เลื่อยเหล็ก โฮลซอว์ ดอกสว่าน WYNNTOOLS",
    desc: "เครื่องมือประเภทคัตเตอร์ WYNNTOOLS — คัตเตอร์อเนกประสงค์ คีมตัดท่อ PVC ตะไบ เลื่อยเหล็ก ชุดโฮลซอว์ ดอกสว่านไฮสปีด ตัวตอกเลข พร้อมรหัสครบ",
    kw: "คัตเตอร์, คีมตัดท่อ PVC, ตะไบ, ตะไบเพชร, เลื่อยเหล็ก, ใบเลื่อยเหล็ก, โฮลซอว์, ดอกสว่าน, ดอกเจาะปูน, ตัวตอกเลข, WYNNTOOLS",
    lead_th: "หมวดใหญ่ที่รวมงานตัด เจาะ และแต่งผิวไว้ด้วยกัน มีคัตเตอร์อเนกประสงค์ คีมและกรรไกรตัดท่อ PVC ตัวตอกเลข-ตอกรหัส ตะไบทุกหน้าตัด โครงเลื่อยเหล็ก ชุดโฮลซอว์ ดอกสว่านไฮสปีด และดอกเจาะปูนสำหรับสว่านโรตารี่",
    lead_en: "Cutting, drilling and finishing in one section: utility knives, PVC pipe cutters, number and letter punches, files in every profile, hacksaw frames and blades, hole saw kits, HSS twist drills and SDS masonry chisels.",
    eyebrow_th: "หมวดคัตเตอร์", eyebrow_en: "Cutter tools",
  },
  garden: {
    file: "tools-garden.html",
    title: "กรรไกรตัดกิ่ง กรรไกรตัดหญ้า เลื่อยพับ WYNNTOOLS ราคาส่ง",
    desc: "เครื่องมือการเกษตร WYNNTOOLS — กรรไกรตัดกิ่ง กรรไกรตัดกิ่งด้ามยาว กรรไกรตัดหญ้า เลื่อยพับ เลื่อยธนู ปืนฉีดน้ำ พร้อมรหัสและขนาดครบ",
    kw: "กรรไกรตัดกิ่ง, กรรไกรตัดหญ้า, กรรไกรตัดกิ่งด้ามยาว, เลื่อยพับ, เลื่อยธนู, ปืนฉีดน้ำ, เครื่องมือการเกษตร, WYNNTOOLS",
    lead_th: "เครื่องมือสวนและการเกษตร ตั้งแต่กรรไกรตัดกิ่งใบสปริงเหล็กกล้าคาร์บอนสูง กรรไกรตัดหญ้าทั้งด้ามไม้และด้ามยืดปรับได้ เลื่อยพับฟัน 3 คม เลื่อยธนู ไปจนถึงกรรไกรตัดกิ่งด้ามยาวปรับได้ถึง 3 เมตร และปืนฉีดน้ำชุบโลหะ",
    lead_en: "Garden and orchard tools: by-pass pruners with high-carbon spring blades, grass shears with wooden or telescopic handles, three-edge folding saws, bow saws, tree pruners reaching three metres, and metal-plated water guns.",
    eyebrow_th: "หมวดการเกษตร", eyebrow_en: "Garden tools",
  },
  striking: {
    file: "tools-striking.html",
    title: "ค้อน ค้อนหงอน ค้อนปอนด์ สิ่ว เหล็กสกัด WYNNTOOLS",
    desc: "เครื่องมือทุบและตอก WYNNTOOLS — ค้อนหงอนด้ามไฟเบอร์ ค้อนปอนด์ ค้อนหัวกลม ค้อนยาง สิ่วไม้ ชุดเหล็กสกัด เกรียงโป๊ว พร้อมรหัสและน้ำหนักครบ",
    kw: "ค้อน, ค้อนหงอน, ค้อนปอนด์, ค้อนหัวกลม, ค้อนยาง, ค้อนไม้, สิ่วไม้, เหล็กสกัด, เกรียงโป๊ว, ตราสิงห์, WYNNTOOLS",
    lead_th: "ค้อนและเครื่องมือตอกครบทุกแบบ ค้อนหงอนด้ามไฟเบอร์กันลื่น ค้อนปอนด์ด้ามไฟเบอร์และด้ามสั้น ค้อนหัวกลม ค้อนไม้ตีกิฟ พร้อมสิ่วไม้ด้ามใส ชุดเหล็กสกัด 12 ชิ้น และเกรียงโป๊วสี — รวมค้อนตราสิงห์และตรา M.T.T. ของร้าน",
    lead_en: "Hammers and striking tools of every kind: fibre-handle claw hammers, sledge and short-handle club hammers, round-head and mallet types, crystal-handle wood chisels, 12-piece cold chisel sets and putty knives — including the shop's own ตราสิงห์ and M.T.T. hammers.",
    eyebrow_th: "หมวดทุบและตอก", eyebrow_en: "Striking tools",
  },
  measuring: {
    file: "tools-measuring.html",
    title: "ตลับเมตร วัดระดับน้ำ ฉากผสม ลูกดิ่ง WYNNTOOLS",
    desc: "เครื่องมือวัด WYNNTOOLS — วัดระดับน้ำอลูมิเนียมแบบแม่เหล็ก ไม้บรรทัดพับ 600 มม. ฉากผสม ฉากสามเหลี่ยมสแตนเลส ลูกดิ่ง พร้อมรหัสครบ",
    kw: "วัดระดับน้ำ, ระดับน้ำแม่เหล็ก, ไม้บรรทัดพับ, ฉากผสม, ฉากสามเหลี่ยม, ลูกดิ่ง, เครื่องมือวัด, WYNNTOOLS, วินส์ทูลส์",
    lead_th: "เครื่องมือวัดสำหรับงานก่อสร้างและงานไม้ วัดระดับน้ำอลูมิเนียมทั้งแบบธรรมดาและแบบมีแถบแม่เหล็กยึดติดเหล็กได้ ไม้บรรทัดพับอลูมิเนียม 600 มม. ฉากผสมปรับองศา ฉากสามเหลี่ยมสแตนเลส และลูกดิ่งแบบมีล้อเก็บสาย",
    lead_en: "Measuring tools for building and joinery: aluminium spirit levels plain or with a magnetic strip, 600 mm folding rulers, adjustable combination squares, stainless triangle rulers and plumb bobs with retractable reels.",
    eyebrow_th: "หมวดเครื่องมือวัด", eyebrow_en: "Measuring tools",
  },
  upholster: {
    file: "tools-upholster.html",
    title: "คีมย้ำรีเวท ปืนยิงกาว ปืนยิงแม็ก เข็มกลัด WYNNTOOLS",
    desc: "เครื่องมือแต่งบ้าน WYNNTOOLS — คีมย้ำรีเวทอลูมิเนียม ปืนยิงกาวซิลิโคน ค้อนยิงลวดแม็ก เลื่อยฉลุผนัง ถ้วยดูดกระจก และเข็มกลัดตรา M.T.T.",
    kw: "คีมย้ำรีเวท, ปืนยิงกาว, กาวแท่ง, ปืนยิงแม็ก, ลวดเย็บ, เลื่อยฉลุ, ถ้วยดูดกระจก, เข็มกลัด, ตรา M.T.T., WYNNTOOLS",
    lead_th: "เครื่องมือสำหรับงานตกแต่งและซ่อมแซมในบ้าน คีมย้ำรีเวทอลูมิเนียมแบบปรับหัวได้ ปืนยิงกาวซิลิโคนโครงเหล็ก ค้อนยิงลวดแม็ก เลื่อยหางหนูตัดผนังยิปซัม ถ้วยดูดกระจก 2 และ 3 ขา พร้อมสินค้าตรา M.T.T. ของร้านเอง ทั้งปืนยิงกาว ลวดเย็บ และเข็มกลัดซ่อนปลาย",
    lead_en: "Tools for finishing and repairs around the house: adjustable-head aluminium riveters, steel-frame silicone glue guns, hammer staplers, wallboard saws, two- and three-cup glass lifters, plus the shop's own M.T.T. glue guns, staples and safety pins.",
    eyebrow_th: "หมวดแต่งบ้าน", eyebrow_en: "Upholster tools",
  },
  soldering: {
    file: "tools-soldering.html",
    title: "กล่องเครื่องมือ กระเป๋าเครื่องมือ แว่นเซฟตี้ WYNNTOOLS",
    desc: "กล่องเครื่องมือและอุปกรณ์เซฟตี้ WYNNTOOLS — กล่องเครื่องมือเหล็ก 14–18 นิ้ว กระเป๋าเครื่องมือผ้า แว่นตาเซฟตี้ใส ถุงมือเซฟตี้ พร้อมรหัสครบ",
    kw: "กล่องเครื่องมือ, กระเป๋าเครื่องมือ, กล่องเครื่องมือเหล็ก, แว่นตาเซฟตี้, ถุงมือเซฟตี้, เครื่องมือเชื่อมเหล็ก, WYNNTOOLS",
    lead_th: "กล่องและกระเป๋าสำหรับเก็บเครื่องมือ พร้อมอุปกรณ์ป้องกันพื้นฐาน มีทั้งกล่องเครื่องมือเหล็กหลายขนาด กระเป๋าเครื่องมือผ้าแบบสะพาย แว่นตาเซฟตี้ใส และถุงมือเซฟตี้",
    lead_en: "Toolboxes and bags with the basic protective kit: steel toolboxes in several sizes, canvas tool bags, clear safety goggles and work gloves.",
    eyebrow_th: "หมวดกล่องเครื่องมือ", eyebrow_en: "Tool storage & safety",
  },
  hydraulic: {
    file: "tools-hydraulic.html",
    title: "คีมย้ำหางปลาไฮดรอลิค เหล็กดูดไฮดรอลิค WYNNTOOLS",
    desc: "เครื่องมือไฮดรอลิค WYNNTOOLS — ชุดคีมย้ำหางปลาไฮดรอลิค 8 ตัน ชุดเครื่องดูดลูกปืนมูเล่ย์ไฮดรอลิค และขาตั้งรถยนต์ พร้อมรหัสและสเปคครบ",
    kw: "คีมย้ำหางปลาไฮดรอลิค, เหล็กดูดไฮดรอลิค, เครื่องดูดลูกปืน, ดูดมูเล่ย์, ขาตั้งรถยนต์, แม่แรง, WYNNTOOLS, วินส์ทูลส์",
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

/* บางหมวดไม่ใช่สินค้า WYNNTOOLS — กุญแจและของมีคมเป็นตรา M.T.T. ของร้านและแบรนด์อื่น
   จึงห้ามพาดหัวว่า WYNNTOOLS เพราะจะเป็นการอ้างยี่ห้อผิด */
const BRAND = {
  padlock: { th: "ตรา M.T.T.", en: "M.T.T. brand", eyebrow_th: "ตรา M.T.T. และแบรนด์อื่น", eyebrow_en: "M.T.T. & other brands" },
  blades:  { th: "ตรา M.T.T.", en: "M.T.T. brand", eyebrow_th: "ตรา M.T.T.", eyebrow_en: "M.T.T. brand" },
};
const brandOf = (id) => BRAND[id] || { th: "WYNNTOOLS", en: "WYNNTOOLS", eyebrow_th: "WYNNTOOLS (วินส์ทูลส์)", eyebrow_en: "WYNNTOOLS" };

const NAV = Object.entries(META).map(([id, m]) => { const c = DATA.categories.find((c) => c.id === id); return { id, file: m.file, th: c?.th || id, en: c?.en || "" }; });

function page(cat) {
  const m = META[cat.id];
  const b = brandOf(cat.id);
  const isMTT = !!BRAND[cat.id];
  const groups = mergeGroups(cat.groups);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const other = NAV.filter((n) => n.id !== cat.id);
  const url = `${SITE}/products/${m.file}`;

  const itemList = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: `${cat.th} ${b.th}`,
    description: m.desc,
    numberOfItems: total,
    itemListElement: groups.map((g, i) => ({
      "@type": "ListItem", position: i + 1,
      name: g.en ? `${g.th} (${g.en})` : g.th,          /* กลุ่มที่ไม่มีชื่ออังกฤษเคยออกมาเป็น "(undefined)" */
      url: `${url}#g${i}`,
      description: `${g.items.length} รายการ${g.mat ? " · วัสดุ " + g.mat : ""}`,
    })),
  };
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "เครื่องมือช่าง", item: `${SITE}/products/tools.html` },
      { "@type": "ListItem", position: 3, name: cat.th, item: url },
    ],
  };

  const head = headHTML({
    title: m.title, desc: m.desc, kw: m.kw, url,
    ogTitle: `${cat.th} ${b.th} — ${total} รายการ พร้อมรหัสและสเปค`,
    ogDesc: m.desc.slice(0, 110),
    ogImage: `${SITE}/assets/img/og-image.png`,
    ld: [crumbs, itemList],
  });

  return `${head}
<body>
<div id="site-header"></div>
<main id="main">
<section class="t-hero${isMTT ? " mtt" : ""}">
  <div class="wrap">
${crumbsHTML(`<a href="tools.html" data-th="เครื่องมือช่าง" data-en="Hand tools">เครื่องมือช่าง</a>`, cat.th)}
    <span class="eyebrow" data-th="${esc(m.eyebrow_th)} · ${esc(b.eyebrow_th)}" data-en="${esc(m.eyebrow_en)} · ${esc(b.eyebrow_en)}">${esc(m.eyebrow_th)} · ${esc(b.eyebrow_th)}</span>
    <h1>${bi(cat.th, cat.en)} ${bi(b.th, b.en)}</h1>
    <p class="muted" data-th="${esc(m.lead_th)}" data-en="${esc(m.lead_en)}">${esc(m.lead_th)}</p>
    <div class="trust">
      <span class="badge">${total} ${bi("รายการ", "items")}</span>
${isMTT
    ? `      <span class="badge lion" data-th="สินค้าตรา M.T.T. ของร้าน" data-en="Our own M.T.T. brand">สินค้าตรา M.T.T. ของร้าน</span>`
    : `      <span class="badge" data-th="ผู้นำเข้าโดยตรง" data-en="Direct importer">ผู้นำเข้าโดยตรง</span>`}
      <span class="badge" data-th="ราคาปลีก-ส่ง" data-en="Retail &amp; wholesale">ราคาปลีก-ส่ง</span>
      <span class="badge" data-th="ส่งทั่วไทย" data-en="Nationwide">ส่งทั่วไทย</span>
    </div>
${isMTT ? `    <p class="brand-link"><a href="mtt-brand.html" data-th="ดูสินค้าตรา M.T.T. ทั้งหมด →" data-en="All M.T.T. brand products →">ดูสินค้าตรา M.T.T. ทั้งหมด →</a></p>\n` : ""}    <nav class="catnav" aria-label="หมวดเครื่องมือ">
      <a href="tools.html" data-th="ทุกหมวด" data-en="All categories">ทุกหมวด</a>
      <a class="on" aria-current="page" href="${m.file}" data-th="${esc(cat.th)}" data-en="${esc(cat.en || cat.th)}">${esc(cat.th)}</a>
${other.map((n) => `      <a href="${n.file}" data-th="${esc(n.th)}" data-en="${esc(n.en || n.th)}">${esc(n.th)}</a>`).join("\n")}
    </nav>
  </div>
</section>

<section style="padding-top:10px">
  <div class="wrap">
    <div class="findbar">
      <label class="vh" for="findInput" data-th="ค้นหาในหมวดนี้" data-en="Search this category">ค้นหาในหมวดนี้</label>
      <input id="findInput" type="search" autocomplete="off" placeholder="ค้นรหัสหรือชื่อสินค้า เช่น ${esc(groups[0].items[0].code)} หรือ ${esc(groups[0].items[0].th.split(/[\s(]/)[0])}" data-th-placeholder="ค้นรหัสหรือชื่อสินค้า เช่น ${esc(groups[0].items[0].code)} หรือ ${esc(groups[0].items[0].th.split(/[\s(]/)[0])}" data-en-placeholder="Search code or name, e.g. ${esc(groups[0].items[0].code)}">
      <div class="hit" id="findHit" hidden></div>
    </div>
${grpNavHTML(groups)}

    <h2 class="vh">${esc(cat.th)} — ${total} รายการ</h2>
${groups.map((g, i) => groupHTML(g, i, b.th)).join("\n\n")}

${ctaBandHTML("เจอรหัสที่ต้องการแล้ว? กดที่รหัสเพื่อถามราคา", "Found your item number? Tap it to ask price", `สอบถามราคา${b.th === "WYNNTOOLS" ? "เครื่องมือ WYNNTOOLS หมวด" : ""}${cat.th}`)}
  </div>
</section>
</main>

<div id="site-footer"></div>

${scriptsHTML("tools")}
</body>
</html>
`;
}

const made = [];
for (const cat of DATA.categories) {
  const m = META[cat.id];
  if (!m) continue;
  writeFileSync("products/" + m.file, bakeChrome(page(cat)));
  const groups = mergeGroups(cat.groups);
  made.push(`  products/${m.file}  ${cat.groups.reduce((n, g) => n + g.items.length, 0)} รายการ  ${cat.groups.length}→${groups.length} กลุ่ม  (title ${m.title.length} · desc ${m.desc.length})`);
}
console.log("สร้างแล้ว " + made.length + " หน้า:\n" + made.join("\n"));
