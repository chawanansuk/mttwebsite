/* รายการขอราคา: เก็บหลายรหัสแล้วส่งทาง LINE ทีเดียว (เดิมต้องกดถามทีละรหัส)
   - ปุ่ม + ข้างรหัสในตารางแคตตาล็อก (สร้างด้วย JS — ไม่เพิ่มน้ำหนัก HTML)
   - แถบลอยด้านล่างแสดงจำนวน เปิดดู/แก้จำนวน/ลบ แล้วกดส่งทาง LINE
   เก็บใน localStorage ใช้ร่วมกันทุกหน้าแคตตาล็อก ไม่มีราคาในระบบ — ร้านตอบราคาทาง LINE */
(function () {
  var KEY = "mtt_quote_v1", MAX = 30, list = [];
  try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
  if (!Array.isArray(list)) list = [];
  list = list.filter(function (x) { return x && typeof x.c === "string"; }).slice(0, MAX);

  function en() { return document.documentElement.lang === "en"; }
  function t(th, e) { return en() ? e : th; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  function find(code) { for (var i = 0; i < list.length; i++) if (list[i].c === code) return i; return -1; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function toast(msg) { var x = document.getElementById("toast"); if (!x) return; x.textContent = msg; x.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(function () { x.classList.remove("show"); }, 2200); }

  /* ---------- ปุ่ม + ในตาราง ---------- */
  var links = [].slice.call(document.querySelectorAll("table.tools td.code a"));
  function paintBtn(b) {
    var on = find(b.dataset.code) >= 0;
    b.textContent = on ? "✓" : "+";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", on ? t("เอา " + b.dataset.code + " ออกจากรายการขอราคา", "Remove " + b.dataset.code + " from quote list")
                                    : t("เพิ่ม " + b.dataset.code + " ในรายการขอราคา", "Add " + b.dataset.code + " to quote list"));
  }
  var btns = links.map(function (a) {
    var b = el("button", "qadd"); b.type = "button"; b.dataset.code = a.textContent.trim();
    a.parentNode.appendChild(b); paintBtn(b); return b;
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".qadd"); if (!b) return;
    var i = find(b.dataset.code);
    if (i >= 0) list.splice(i, 1);
    else {
      if (list.length >= MAX) { toast(t("รายการขอราคาเต็มแล้ว (" + MAX + " รายการ) กรุณาส่งชุดนี้ก่อน", "Quote list is full (" + MAX + " items). Send this batch first.")); return; }
      var tr = b.closest("tr"), sz = tr.querySelector(".sz");
      list.push({ c: b.dataset.code, n: tr.dataset.nth || "", e: tr.dataset.nen || "", s: sz ? sz.textContent.trim() : "", q: 1 });
      toast(t("เพิ่ม " + b.dataset.code + " ในรายการขอราคาแล้ว", b.dataset.code + " added to quote list"));
    }
    save(); render();
  });

  /* ---------- แถบลอย + แผงรายการ ---------- */
  var bar = el("div", "qbar"); bar.hidden = true;
  bar.setAttribute("role", "region");
  var panel = el("div", "qpanel"); panel.id = "qpanel"; panel.hidden = true;
  var row = el("div", "qrow");
  var toggle = el("button", "qtoggle"); toggle.type = "button"; toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-controls", "qpanel");
  var send = el("a", "btn btn-line btn-sm qsend"); send.target = "_blank"; send.rel = "noopener";
  send.href = (window.SHOP && SHOP.LINE_URL) || "#"; /* มี href ตั้งแต่สร้าง (ลิงก์ที่ไม่มี href = ลิงก์ที่ crawler/โปรแกรมอ่านจอข้าม) */
  row.appendChild(toggle); row.appendChild(send);
  bar.appendChild(panel); bar.appendChild(row);
  document.body.appendChild(bar);

  toggle.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    render();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); render(); toggle.focus(); }
  });

  function message() {
    /* รายการน้อยใส่ชื่อด้วย รายการเยอะใส่แค่รหัส+ขนาด ให้ลิงก์ LINE ไม่ยาวเกิน */
    var withName = list.length <= 8;
    var lines = list.map(function (x, i) {
      return (i + 1) + ". " + x.c + (withName && x.n ? " " + x.n : "") + (x.s ? " (" + x.s + ")" : "") + " x " + x.q;
    });
    return "ขอราคาสินค้า " + list.length + " รายการ\n" + lines.join("\n");
  }
  function render() {
    btns.forEach(paintBtn);
    bar.hidden = !list.length;
    document.documentElement.classList.toggle("has-qbar", !!list.length);
    if (!list.length) { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); return; }
    bar.setAttribute("aria-label", t("รายการขอราคา", "Quote list"));
    toggle.textContent = t("ขอราคา " + list.length + " รายการ ", "Quote: " + list.length + " item(s) ") + (panel.hidden ? "▴" : "▾");
    send.textContent = t("ส่งขอราคาทาง LINE", "Send on LINE");
    send.href = window.CATALOG ? CATALOG.lineAsk(message()) : "#";
    if (panel.hidden) return;
    panel.textContent = "";
    var ul = el("ul");
    list.forEach(function (x) {
      var li = el("li");
      var name = el("span", "qn"); name.appendChild(el("b", "", x.c));
      name.appendChild(document.createTextNode(" " + (en() && x.e ? x.e : x.n) + (x.s ? " · " + x.s : "")));
      var qty = el("input"); qty.type = "number"; qty.min = "1"; qty.max = "99999"; qty.value = x.q; qty.inputMode = "numeric";
      qty.setAttribute("aria-label", t("จำนวน " + x.c, "Quantity of " + x.c));
      qty.addEventListener("change", function () {
        var v = Math.floor(Number(qty.value)); x.q = v >= 1 ? Math.min(v, 99999) : 1; qty.value = x.q;
        save(); send.href = CATALOG.lineAsk(message());
      });
      var rm = el("button", "qrm", "×"); rm.type = "button";
      rm.setAttribute("aria-label", t("ลบ " + x.c, "Remove " + x.c));
      rm.addEventListener("click", function () { list.splice(find(x.c), 1); save(); render(); toggle.focus(); });
      li.appendChild(name); li.appendChild(qty); li.appendChild(rm); ul.appendChild(li);
    });
    panel.appendChild(ul);
    var foot = el("div", "qfoot");
    foot.appendChild(el("span", "", t("ใส่จำนวนที่ต้องการ ร้านแจ้งราคากลับทาง LINE", "Set quantities; we reply with prices on LINE")));
    var clr = el("button", "qclear", t("ล้างรายการ", "Clear list")); clr.type = "button";
    clr.addEventListener("click", function () { list = []; save(); render(); });
    foot.appendChild(clr); panel.appendChild(foot);
  }
  document.addEventListener("langchange", render);
  /* แท็บอื่นแก้รายการ → หน้านี้ตามให้ตรง */
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    try { list = JSON.parse(e.newValue) || []; } catch (x) { list = []; }
    if (!Array.isArray(list)) list = [];
    render();
  });
  render();
})();
