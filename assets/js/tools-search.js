/* ค้นหาเครื่องมือข้ามทุกหมวด (หน้ารวม products/tools.html)
   ดัชนี /assets/search/tools-index.json สร้างโดย _gen-tool-pages.mjs — โหลดเมื่อผู้ใช้แตะช่องค้นหาเท่านั้น
   กดผลลัพธ์ → ไปหน้าหมวดพร้อม ?q=รหัส (catalog-find.js กรองให้เหลือแถวนั้น) */
(function () {
  var inp = document.getElementById("allFind"), out = document.getElementById("allFindOut"), hit = document.getElementById("allFindHit");
  if (!inp || !out) return;
  var MAX = 30, data = null, loading = null, failed = false;
  function en() { return document.documentElement.lang === "en"; }
  function load() {
    if (data || loading) return loading;
    loading = fetch("/assets/search/tools-index.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        d.items.forEach(function (x) { x.push((x[0] + " " + x[1] + " " + x[2] + " " + x[3]).toLowerCase()); });
        data = d; render();
      }).catch(function () { failed = true; loading = null; render(); });
    return loading;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function render() {
    var q = inp.value.trim().toLowerCase();
    out.textContent = "";
    if (!q) { hit.hidden = true; out.hidden = true; return; }
    hit.hidden = false;
    if (failed) { hit.textContent = en() ? "Search could not load. Please browse the categories below." : "โหลดข้อมูลค้นหาไม่สำเร็จ เลือกดูตามหมวดด้านล่างได้เลย"; out.hidden = true; return; }
    if (!data) { hit.textContent = en() ? "Loading…" : "กำลังโหลด…"; out.hidden = true; return; }
    var toks = q.split(/\s+/);
    var found = data.items.filter(function (x) { return toks.every(function (t) { return x[5].indexOf(t) >= 0; }); });
    if (!found.length) { hit.textContent = en() ? "No match. Try a shorter code or name." : "ไม่พบรายการที่ค้นหา ลองพิมพ์รหัสหรือชื่อสั้นลง"; out.hidden = true; return; }
    hit.textContent = en()
      ? found.length + " item(s) found" + (found.length > MAX ? ", showing the first " + MAX : "")
      : "พบ " + found.length + " รายการ" + (found.length > MAX ? " แสดง " + MAX + " รายการแรก" : "");
    found.slice(0, MAX).forEach(function (x) {
      var cat = data.cats[x[4]];
      var a = el("a"); a.href = (window.CATALOG ? CATALOG.pageHref("/products/" + cat[0]) : "/products/" + cat[0]) + "?q=" + encodeURIComponent(x[0]);
      a.appendChild(el("b", "", x[0]));
      a.appendChild(el("span", "nm", (en() && x[2] ? x[2] : x[1]) + (x[3] ? " · " + x[3] : "")));
      a.appendChild(el("small", "", en() ? cat[2] : cat[1]));
      var li = el("li"); li.appendChild(a); out.appendChild(li);
    });
    out.hidden = false;
  }
  inp.addEventListener("focus", load);
  inp.addEventListener("input", function () { load(); render(); });
  document.addEventListener("langchange", render);
  /* มาจากหน้าหมวดที่ค้นแล้วไม่เจอ: tools.html?q=คำค้น */
  var q0 = new URLSearchParams(location.search).get("q");
  if (q0) { inp.value = q0; load(); render(); }
})();
