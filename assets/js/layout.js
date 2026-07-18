/* ============================================================
   ม ทวีภัณฑ์ — layout.js
   ฉีด header/footer/ปุ่ม LINE ลอย/toast ให้ทุกหน้า (ไม่ต้องก็อปซ้ำ)
   + สลับภาษา TH/EN (จำค่า) + เติมข้อมูลร้านจาก SHOP + badge ตะกร้า
   หน้าเว็บตั้งค่า: window.MTT_BASE ("" หรือ "../"), window.MTT_PAGE
   ต้องโหลด "หลัง" shop-config.js, catalog.js, cart.js
   ============================================================ */
(function () {
  var S = window.SHOP || {};
  var BASE = window.MTT_BASE || "";
  var PAGE = window.MTT_PAGE || "";

  var LINE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.58 7.39 8.42 8.03.33.07.77.22.88.5.1.26.07.66.03.92l-.14.85c-.04.26-.2 1.02.89.56 1.09-.46 5.86-3.45 8-5.91C21.4 13.4 22 11.85 22 10.13 22 5.64 17.52 2 12 2z"/></svg>';
  var BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>';

  var NAV = [
    { key: "home",     th: "หน้าแรก",       en: "Home",       href: BASE + "index.html" },
    { key: "cats",     th: "หมวดหมู่",       en: "Categories", href: BASE + "index.html#categories" },
    { key: "products", th: "สินค้าทั้งหมด",  en: "Products",   href: BASE + "products/index.html" },
    { key: "contact",  th: "ติดต่อ",         en: "Contact",    href: BASE + "index.html#contact" },
  ];
  var CHECKOUT = BASE + "products/jet-lighter.html#order";

  /* ---------- markup ---------- */
  function headerHTML() {
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '" data-nav="' + n.key + '" class="' + (n.key === PAGE ? "active" : "") +
        '" data-th="' + n.th + '" data-en="' + n.en + '">' + n.th + '</a>';
    }).join("");
    return '' +
    '<header class="site-header"><div class="wrap nav">' +
      '<a class="brand" href="' + BASE + 'index.html" aria-label="ม ทวีภัณฑ์">' +
        '<span class="mark">' + BOLT + '</span>' +
        '<span class="b-th">ม ทวีภัณฑ์<small>M.T.T. Hardware</small></span></a>' +
      '<nav class="nav-links" id="navLinks">' + links + '</nav>' +
      '<div class="nav-right">' +
        '<a class="cart-btn" href="' + CHECKOUT + '" aria-label="ตะกร้าสินค้า" title="ตะกร้าสินค้า">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>' +
          '<span class="cart-badge" id="cartBadge" hidden>0</span></a>' +
        '<div class="lang" role="group" aria-label="ภาษา">' +
          '<button data-lang="th" aria-pressed="true">TH</button>' +
          '<button data-lang="en" aria-pressed="false">EN</button></div>' +
        '<a class="btn btn-line btn-sm" data-shop="line-url" href="#" target="_blank" rel="noopener">' +
          LINE_ICON + '<span data-th="สั่งทาง LINE" data-en="LINE">สั่งทาง LINE</span></a>' +
        '<button class="nav-toggle" aria-label="เปิดเมนู" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
      '</div></div></header>';
  }

  function footerHTML() {
    return '' +
    '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div class="foot-brand"><div class="brand"><span class="mark">' + BOLT + '</span>' +
        '<span class="b-th">ม ทวีภัณฑ์<small>M.T.T. Hardware</small></span></div>' +
        '<p data-th="ศูนย์รวมเครื่องมือช่างและฮาร์ดแวร์ สำเพ็ง — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย ราคาปลีก-ส่ง ส่งทั่วไทย" data-en="Tools & hardware, Sampheng — exclusive WYNNTOOLS importer in Thailand. Retail & wholesale, nationwide.">ศูนย์รวมเครื่องมือช่างและฮาร์ดแวร์ สำเพ็ง — ผู้นำเข้า WYNNTOOLS แต่เพียงผู้เดียวในไทย ราคาปลีก-ส่ง ส่งทั่วไทย</p></div>' +
      '<div class="foot-col"><h4 data-th="สินค้า" data-en="Products">สินค้า</h4><ul>' +
        '<li><a href="' + BASE + 'products/jet-lighter.html" data-th="ไฟฟู่ / ไฟแช็ก" data-en="Jet lighters">ไฟฟู่ / ไฟแช็ก</a></li>' +
        '<li><a href="' + BASE + 'products/index.html" data-th="สินค้าทั้งหมด" data-en="All products">สินค้าทั้งหมด</a></li>' +
        '<li><a href="' + BASE + 'index.html#categories" data-th="หมวดหมู่" data-en="Categories">หมวดหมู่</a></li></ul></div>' +
      '<div class="foot-col"><h4 data-th="ลิงก์" data-en="Links">ลิงก์</h4><ul>' +
        '<li><a href="' + BASE + 'index.html#why" data-th="ทำไมต้องเรา" data-en="Why us">ทำไมต้องเรา</a></li>' +
        '<li><a href="' + BASE + 'index.html#contact" data-th="ติดต่อ" data-en="Contact">ติดต่อ</a></li>' +
        '<li><a href="' + BASE + 'privacy.html" data-th="ความเป็นส่วนตัว" data-en="Privacy">ความเป็นส่วนตัว</a></li>' +
        '<li><a data-shop="line-url" href="#" target="_blank" rel="noopener">LINE OA</a></li></ul></div>' +
      '<div class="foot-col"><h4 data-th="ติดต่อ" data-en="Contact">ติดต่อ</h4><div class="foot-contact">' +
        '<div class="row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg><a data-shop="phone-tel" href="#"><span data-shop="phone">—</span></a></div>' +
        '<div class="row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg><a data-shop="email-href" href="#"><span data-shop="email">—</span></a></div>' +
        '<div class="row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span data-shop="address">—</span></div>' +
      '</div></div>' +
    '</div><div class="foot-bottom">' +
      '<span>© 2026 ม.ทวีภัณฑ์ · ' + (S.legal_th || "") + ' · <span data-th="สงวนลิขสิทธิ์" data-en="All rights reserved">สงวนลิขสิทธิ์</span></span>' +
      '<span data-th="ออกแบบเพื่อการสั่งซื้อที่ง่ายที่สุด" data-en="Built for the easiest ordering">ออกแบบเพื่อการสั่งซื้อที่ง่ายที่สุด</span>' +
    '</div></div></footer>';
  }

  function fabHTML() {
    return '<a class="fab-line" data-shop="line-url" href="#" target="_blank" rel="noopener" aria-label="สั่งทาง LINE">' +
      LINE_ICON + '<span data-th="สั่งทาง LINE" data-en="Order on LINE">สั่งทาง LINE</span></a>';
  }

  /* ---------- inject ---------- */
  function inject(id, html, fallbackWhere) {
    var slot = document.getElementById(id);
    if (slot) { slot.outerHTML = html; return; }
    if (fallbackWhere === "start") document.body.insertAdjacentHTML("afterbegin", html);
    else document.body.insertAdjacentHTML("beforeend", html);
  }
  inject("site-header", headerHTML(), "start");
  inject("site-footer", footerHTML(), "end");
  document.body.insertAdjacentHTML("beforeend", fabHTML());
  if (!document.querySelector(".toast")) {
    document.body.insertAdjacentHTML("beforeend", '<div class="toast" id="toast" role="status" aria-live="polite"></div>');
  }

  /* ---------- fill shop data ---------- */
  function fill(sel, val, attr) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (attr) el.setAttribute(attr, val); else el.textContent = val;
    });
  }
  window.mttFillShop = function () {
    fill("[data-shop=line-url]", S.LINE_URL || "#", "href");
    fill("[data-shop=line-id]", S.LINE_ID || "");
    fill("[data-shop=phone]", S.PHONE || "");
    fill("[data-shop=phone-tel]", "tel:" + (S.PHONE_TEL || ""), "href");
    fill("[data-shop=phone-more]", S.PHONE_MORE || "");
    fill("[data-shop=email]", S.EMAIL || "");
    fill("[data-shop=email-href]", "mailto:" + (S.EMAIL || ""), "href");
    fill("[data-shop=address]", S.ADDRESS_TH || "");
    fill("[data-shop=hours]", S.HOURS_TH || "");
    fill("[data-shop=bank]", S.BANK_ACCOUNT || "");
    fill("[data-shop=promptpay]", S.PROMPTPAY_ID || "");
    // ค่าไหนว่าง → ซ่อนแถวนั้นทั้งแถว (กันโชว์ช่องเปล่า/ข้อมูลปลอม)
    [["email", S.EMAIL], ["phone-more", S.PHONE_MORE], ["bank", S.BANK_ACCOUNT]].forEach(function (pair) {
      if (!pair[1]) document.querySelectorAll("[data-shop=" + pair[0] + "]").forEach(function (el) {
        var row = el.closest(".row") || el.closest(".pay-alt") || el;
        row.style.display = "none";
      });
    });
  };
  window.mttFillShop();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- language ---------- */
  var lang = "th";
  try { lang = localStorage.getItem("mtt_lang") || "th"; } catch (e) {}

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.documentElement.classList.remove("pending-lang"); // UP-1: เผยข้อความหลังสลับภาษาเสร็จ
    document.querySelectorAll("[data-th]").forEach(function (el) {
      var v = el.getAttribute("data-" + l);
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === l;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("mtt_lang", l); } catch (e) {}
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });
  window.MTT = { getLang: function () { return lang; }, applyLang: applyLang };

  /* ---------- cart badge ---------- */
  function updateBadge() {
    var el = document.getElementById("cartBadge");
    if (!el || !window.Cart) return;
    var n = window.Cart.count();
    el.textContent = n;
    el.hidden = n <= 0;
  }
  document.addEventListener("cartchange", updateBadge);
  updateBadge();

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  window.mttToast = function (msg) {
    if (!toastEl) toastEl = document.querySelector(".toast");
    if (!toastEl) return;
    toastEl.innerHTML = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
  };

  /* fire once so pages render in the saved language */
  applyLang(lang);
})();
