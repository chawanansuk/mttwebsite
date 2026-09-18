/* ค้นหาในหน้าแคตตาล็อก: กรองแถวตามรหัส/ชื่อ แล้วซ่อนกลุ่มที่ไม่เหลือแถว
   ใช้ร่วมกันใน products/tools-*.html และ products/mtt-brand.html (เดิมฝัง inline ซ้ำ 16 หน้า) */
(function () {
  document.querySelectorAll("[data-line-ask]").forEach(function (a) {
    a.href = CATALOG.lineAsk(a.getAttribute("data-line-ask"));
  });

  var inp = document.getElementById("findInput"), hit = document.getElementById("findHit");
  if (!inp) return;
  var wraps = [].slice.call(document.querySelectorAll(".tblwrap"));
  var blocks = wraps.map(function (w) {
    var head = w.previousElementSibling;
    while (head && !/^H3$/.test(head.tagName)) head = head.previousElementSibling;
    var extras = [];
    for (var e = w.previousElementSibling; e && e !== head; e = e.previousElementSibling) extras.push(e);
    var src = w.nextElementSibling && w.nextElementSibling.classList.contains("srcline") ? w.nextElementSibling : null;
    return { wrap: w, head: head, extras: extras, src: src, rows: [].slice.call(w.querySelectorAll("tbody tr")) };
  });
  var grpnav = document.querySelector(".grpnav");

  function apply() {
    var q = inp.value.trim().toLowerCase();
    var n = 0;
    blocks.forEach(function (b) {
      var shown = 0;
      b.rows.forEach(function (r) {
        var ok = !q || (r.textContent + " " + (r.dataset.nth || "") + " " + (r.dataset.nen || "")).toLowerCase().indexOf(q) >= 0;
        r.hidden = !ok; if (ok) shown++;
      });
      n += shown;
      var off = !!q && shown === 0;
      b.wrap.hidden = off;
      if (b.head) b.head.hidden = off;
      if (b.src) b.src.hidden = off;
      b.extras.forEach(function (e) { e.hidden = off; });
    });
    relead();
    if (grpnav) grpnav.hidden = !!q; /* สารบัญกลุ่มไม่มีความหมายตอนกรองอยู่ */
    var en = document.documentElement.lang === "en";
    if (q) { hit.hidden = false; hit.textContent = n ? (en ? n + " item(s) found" : "พบ " + n + " รายการ") : (en ? "No match — try a shorter code or name" : "ไม่พบรายการที่ค้นหา — ลองพิมพ์รหัสหรือชื่อสั้นลง"); }
    else { hit.hidden = true; }
  }

  /* ชื่อสินค้าพิมพ์แค่แถวแรกของตระกูล ถ้าค้นหาแล้วแถวแรกโดนซ่อน ต้องยกชื่อมาให้แถวแรกที่ยังโชว์อยู่
     สร้างด้วย textContent (ไม่ใช่ innerHTML) และใส่ data-th/data-en ไว้ให้สลับภาษาต่อได้ */
  function relead() {
    var seen = {};
    var en = document.documentElement.lang === "en";
    blocks.forEach(function (b) {
      b.rows.forEach(function (r) {
        var t = r.querySelector(".nmtxt"); if (!t || r.hidden) return;
        var f = b.wrap.id + "|" + r.dataset.fam;
        if (seen[f]) { if (!r.classList.contains("fam-lead")) t.textContent = ""; return; }
        seen[f] = true;
        if (t.querySelector("b")) return;
        t.textContent = "";
        var th = r.dataset.nth || "", enName = r.dataset.nen || "";
        var bEl = document.createElement("b"); bEl.textContent = en ? (enName || th) : th;
        bEl.setAttribute("data-th", th); bEl.setAttribute("data-en", enName || th);
        var sEl = document.createElement("small"); sEl.textContent = en ? (enName ? th : "") : enName;
        sEl.setAttribute("data-th", enName); sEl.setAttribute("data-en", enName ? th : "");
        t.appendChild(bEl); t.appendChild(sEl);
      });
    });
  }
  inp.addEventListener("input", apply);
})();
