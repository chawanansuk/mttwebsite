/* ============================================================
   ม ทวีภัณฑ์ — site.js
   เมนูมือถือ · สลับภาษา TH/EN · เติมข้อมูลร้านจาก SHOP config
   i18n แบบง่าย: ใส่ data-th / data-en บน element ที่จะสลับภาษา
   ============================================================ */
(function(){
  var S = window.SHOP || {};

  /* ---- เติมข้อมูลติดต่อจาก config ลงทุกจุดที่ mark ไว้ ---- */
  function fill(sel, val, attr){
    document.querySelectorAll(sel).forEach(function(el){
      if(attr){ el.setAttribute(attr, val); }
      else { el.textContent = val; }
    });
  }
  fill("[data-shop=line-url]", S.LINE_URL, "href");
  fill("[data-shop=line-id]", S.LINE_ID);
  fill("[data-shop=phone]", S.PHONE);
  fill("[data-shop=phone-tel]", "tel:"+(S.PHONE_TEL||""), "href");
  fill("[data-shop=email]", S.EMAIL);
  fill("[data-shop=email-href]", "mailto:"+(S.EMAIL||""), "href");
  fill("[data-shop=address]", S.ADDRESS_TH);
  fill("[data-shop=hours]", S.HOURS_TH);
  document.querySelectorAll("[data-shop=fb-url]").forEach(function(el){ el.setAttribute("href", S.FACEBOOK_URL||"#"); });

  /* ---- เมนูมือถือ ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links  = document.querySelector(".nav-links");
  if(toggle && links){
    toggle.addEventListener("click", function(){ links.classList.toggle("open"); });
    links.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ links.classList.remove("open"); });
    });
  }

  /* ---- สลับภาษา ---- */
  var saved = null;
  try { saved = localStorage.getItem("mtt_lang"); } catch(e){}
  var lang = saved || "th";

  function applyLang(l){
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll("[data-th]").forEach(function(el){
      var v = el.getAttribute("data-"+l);
      if(v!=null) el.innerHTML = v;
    });
    document.querySelectorAll(".lang button").forEach(function(b){
      b.classList.toggle("on", b.getAttribute("data-lang")===l);
    });
    try { localStorage.setItem("mtt_lang", l); } catch(e){}
    document.dispatchEvent(new CustomEvent("langchange",{detail:l}));
  }
  document.querySelectorAll(".lang button").forEach(function(b){
    b.addEventListener("click", function(){ applyLang(b.getAttribute("data-lang")); });
  });
  window.MTT = { getLang:function(){return lang;}, applyLang:applyLang };
  applyLang(lang);

  /* ---- toast ---- */
  var toastEl, toastTimer;
  window.mttToast = function(msg){
    if(!toastEl){ toastEl = document.querySelector(".toast"); }
    if(!toastEl) return;
    toastEl.innerHTML = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, 2000);
  };
})();
