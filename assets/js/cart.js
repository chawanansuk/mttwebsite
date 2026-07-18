/* ============================================================
   ม ทวีภัณฑ์ — cart.js
   ตะกร้าสินค้าที่ "จำค่าไว้" (localStorage) และใช้ร่วมได้ทุกหน้า
   ยิง event 'cartchange' ทุกครั้งที่เปลี่ยน → หน้า/badge ไป re-render เอง
   ============================================================ */
window.Cart = (function () {
  const KEY = "mtt_cart_v1";      // { id: qty }
  const CKEY = "mtt_cart_colors_v1"; // ["green","blue"]
  let items = {};
  let colorsSel = [];

  try { items = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  try { colorsSel = JSON.parse(localStorage.getItem(CKEY)) || []; } catch (e) {}
  if (typeof items !== "object" || items === null) items = {};
  if (!Array.isArray(colorsSel)) colorsSel = [];

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      localStorage.setItem(CKEY, JSON.stringify(colorsSel));
    } catch (e) {}
  }
  function emit() {
    persist();
    document.dispatchEvent(new CustomEvent("cartchange"));
  }

  return {
    items: function () { return Object.assign({}, items); },
    ids: function () { return Object.keys(items).filter(id => items[id] > 0); },
    qty: function (id) { return items[id] || 0; },
    count: function () {
      let n = 0; for (const id in items) n += items[id]; return n;
    },
    add: function (id, n) {
      n = n || 1;
      items[id] = (items[id] || 0) + n;
      if (items[id] <= 0) delete items[id];
      emit();
    },
    set: function (id, n) {
      if (n <= 0) delete items[id]; else items[id] = n;
      emit();
    },
    clear: function () { items = {}; colorsSel = []; emit(); },
    colors: function () { return colorsSel.slice(); },
    hasColor: function (k) { return colorsSel.indexOf(k) >= 0; },
    toggleColor: function (k) {
      const i = colorsSel.indexOf(k);
      if (i >= 0) colorsSel.splice(i, 1); else colorsSel.push(k);
      emit();
    },
  };
})();
