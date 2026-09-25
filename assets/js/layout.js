/* ============================================================
   ม.ทวีภัณฑ์ — layout.js
   header/footer ฝังในไฟล์ HTML แล้ว (แก้ที่ _chrome.mjs แล้วรัน npm run bake)
   ไฟล์นี้: สลับภาษา TH/EN (จำค่า) + เติมข้อมูลร้านจาก SHOP + เมนูมือถือ + badge ตะกร้า + toast
   ต้องโหลด "หลัง" shop-config.js, catalog.js, cart.js
   ============================================================ */
(function () {
  var S = window.SHOP || {};

  /* ลิงก์ "ข้ามไปเนื้อหา" พาโฟกัสเข้า <main id="main"> ได้ */
  var mainEl = document.getElementById("main");
  if (mainEl && !mainEl.hasAttribute("tabindex")) mainEl.setAttribute("tabindex", "-1");
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
    // ไม่มีอีเมล = ไม่ต้องใส่ href (กันลิงก์ mailto: เปล่าค้างใน DOM)
    if (S.EMAIL) fill("[data-shop=email-href]", "mailto:" + S.EMAIL, "href");
    fill("[data-shop=address]", S.ADDRESS_TH || "");
    fill("[data-shop=hours]", S.HOURS_TH || "");
    // เวลาทำการยังไม่มีข้อมูลจริง → ซ่อนแถวไว้ก่อน (เดิมโชว์ "โทรสอบถามเวลาทำการ" ในช่องเวลาทำการ)
    if (!S.HOURS_TH) document.querySelectorAll("[data-shop=hours]").forEach(function (el) { var row = el.closest(".row") || el; row.style.display = "none"; });
    fill("[data-shop=bank]", S.BANK_ACCOUNT || "");
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
    var closeNav = function () { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      // เปิดแล้วพาโฟกัสเข้าเมนู (nav-links อยู่ก่อน nav-right ใน DOM กด Tab ต่อจะหลุดไปเนื้อหา)
      if (open) { var first = links.querySelector("a"); if (first) setTimeout(function () { first.focus(); }, 260); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) { closeNav(); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (links.classList.contains("open") && !e.target.closest(".nav-links,.nav-toggle")) closeNav();
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
    /* แอตทริบิวต์ที่ผู้ใช้เห็น (placeholder/aria-label) สลับภาษาแยกจาก innerHTML */
    ["placeholder", "aria-label", "title"].forEach(function (at) {
      document.querySelectorAll("[data-th-" + at + "]").forEach(function (el) {
        var v = el.getAttribute("data-" + l + "-" + at);
        if (v != null) el.setAttribute(at, v);
      });
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
  // ล้างรายการค้างที่ id ไม่มีใน catalog แล้ว (เช่นเปลี่ยนรหัสแพ็กเกจ)
  // ไม่งั้น badge จะนับของที่มองไม่เห็น/ลบไม่ได้ในหน้าตะกร้า
  if (window.Cart && window.CATALOG) {
    var validIds = {};
    CATALOG.products.forEach(function (p) {
      CATALOG.allOptions(p).forEach(function (o) { validIds[o.id] = true; });
    });
    Cart.ids().forEach(function (id) { if (!validIds[id]) Cart.set(id, 0); });
  }
  function updateBadge() {
    if (!window.Cart) return;
    var n = window.Cart.count();
    ["cartBadge", "tabCartBadge"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.textContent = n; el.hidden = n <= 0; }
    });
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

  /* ---------- conversion tracking (Vercel Web Analytics custom events) ----------
     วัดว่าลูกค้ากด "ทัก LINE" / "โทร" จากตำแหน่งไหน — รู้ conversion จริง
     ปลอดภัยแม้ยังไม่เปิด Analytics: window.va ไม่มี → no-op เงียบ ๆ */
  function track(name, data) {
    try { if (typeof window.va === "function") window.va("event", data ? Object.assign({ name: name }, data) : { name: name }); } catch (e) {}
  }
  window.mttTrack = track;
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a,button") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (a.matches("[data-shop=line-url], .btn-line") || href.indexOf("line.me") >= 0) {
      track("line_click", { where: (a.id || a.getAttribute("data-shop") || a.className || "").toString().slice(0, 60) });
    } else if (href.indexOf("tel:") === 0 || a.matches("[data-shop=phone-tel]")) {
      track("phone_click");
    }
  }, true);

  /* fire once so pages render in the saved language */
  applyLang(lang);
})();
