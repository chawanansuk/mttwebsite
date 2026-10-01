/* ============================================================
   _audit.mjs — ตรวจทุกหน้าใน sitemap ที่ 390/1280: title/desc, h1, alt/ขนาดรูป, รูปใหญ่เกินจอ,
   ลิงก์ภายนอกไม่มี noopener, ปุ่มไม่มีชื่อ, จุดกดเล็ก, overflow, ฟอนต์เล็กกว่า 12px, JSON-LD parse ได้
   รัน: npm run audit  (ต้องมี CHROMIUM ที่ /opt/pw-browsers/chromium)
   ============================================================ */
import pw from "playwright"; import http from "http"; import { readFileSync, existsSync, statSync } from "fs"; import { join, extname } from "path";
const MIME={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".mp4":"video/mp4",".webm":"video/webm",".xml":"application/xml",".txt":"text/plain",".json":"application/json"};
const srv=http.createServer((q,res)=>{let p=decodeURIComponent(q.url.split("?")[0]);if(p.endsWith("/"))p+="index.html";let f=join(".",p);if(existsSync(f)&&statSync(f).isDirectory())f=join(f,"index.html");if(existsSync(f)&&statSync(f).isFile()){res.writeHead(200,{"Content-Type":MIME[extname(f)]||"application/octet-stream"});res.end(readFileSync(f));}else{res.writeHead(404);res.end();}});
await new Promise(r=>srv.listen(0,r)); const base="http://localhost:"+srv.address().port;
const br=await pw.chromium.launch({executablePath:"/opt/pw-browsers/chromium"});

const urls=[...readFileSync("sitemap.xml","utf8").matchAll(/<loc>https:\/\/mtthardware\.com(\/[^<]*)<\/loc>/g)].map(m=>m[1]).concat(["/404.html"]);
const report={};
for(const path of urls){
  for(const w of [390,1280]){
    const ctx=await br.newContext({viewport:{width:w,height:844}}); const pg=await ctx.newPage();
    const errs=[]; pg.on("pageerror",e=>errs.push(e.message)); pg.on("console",m=>{if(m.type()==="error"&&!/fonts\.g|_vercel|favicon/.test(m.text()))errs.push(m.text())});
    const sizes={}; pg.on("response",async r=>{try{const u=r.url(); if(!u.startsWith(base))return; const b=await r.body(); const t=extname(u.split("?")[0])||".html"; sizes[t]=(sizes[t]||0)+b.length;}catch(e){}});
    await pg.goto(base+path,{waitUntil:"networkidle"}); await pg.waitForTimeout(300);
    const r=await pg.evaluate(()=>{
      const q=s=>[...document.querySelectorAll(s)];
      const title=document.title, desc=(document.querySelector('meta[name=description]')||{}).content||"";
      const h1=q("h1").length;
      const imgs=q("img"); const noAlt=imgs.filter(i=>!i.hasAttribute("alt")).length, noDim=imgs.filter(i=>!(i.getAttribute("width")&&i.getAttribute("height"))&&getComputedStyle(i).display!=="none").length;
      const big=imgs.filter(i=>i.naturalWidth&&i.getBoundingClientRect().width>0&&i.naturalWidth>i.getBoundingClientRect().width*devicePixelRatio*2).map(i=>i.getAttribute("src").split("/").pop()+":"+i.naturalWidth+">"+Math.round(i.getBoundingClientRect().width));
      const ext=q('a[href^="http"]').filter(a=>!a.href.includes(location.host)); const extNoRel=ext.filter(a=>a.target==="_blank"&&!/noopener/.test(a.rel)).length;
      const emptyLinks=q("a").filter(a=>!a.textContent.trim()&&!a.getAttribute("aria-label")&&!a.querySelector("img[alt]:not([alt=''])")).length;
      const btnNoName=q("button").filter(b=>!b.textContent.trim()&&!b.getAttribute("aria-label")).length;
      const small=q("a,button").filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&(r.width<24||r.height<24)&&getComputedStyle(e).visibility!=="hidden"}).map(e=>(e.className||e.tagName)+":"+Math.round(e.getBoundingClientRect().width)+"x"+Math.round(e.getBoundingClientRect().height));
      const ov=document.documentElement.scrollWidth-innerWidth;
      const lang=document.documentElement.lang; const canon=(document.querySelector('link[rel=canonical]')||{}).href||"";
      const headings=q("h1,h2,h3,h4").map(h=>+h.tagName[1]); let skips=0; for(let i=1;i<headings.length;i++) if(headings[i]>headings[i-1]+1) skips++;
      const inlineStyle=q("[style]").length; const styleTags=q("style").reduce((n,s)=>n+s.textContent.length,0);
      const fontSmall=q("p,li,td,span,a,small").filter(e=>e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<12&&getComputedStyle(e).visibility!=="hidden"&&e.getBoundingClientRect().height>0).length;
      const ld=q('script[type="application/ld+json"]').map(s=>{try{return JSON.parse(s.textContent)["@type"]}catch(e){return "BAD"}});
      return {title:title.length,desc:desc.length,h1,noAlt,noDim,big,extNoRel,emptyLinks,btnNoName,small,ov,lang,canon:canon.endsWith(location.pathname.replace(/\/index\.html$/,"").replace(/^\/$/,"/")||"/")||canon,skips,inlineStyle,styleTags,fontSmall,ld};
    });
    const perf=await pg.evaluate(()=>{const n=performance.getEntriesByType("navigation")[0]; const lcp=performance.getEntriesByType("largest-contentful-paint").pop(); return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),lcp:lcp?Math.round(lcp.startTime):null,lcpEl:lcp&&lcp.element?(lcp.element.tagName+"."+(lcp.element.className||"")).slice(0,30):null}});
    report[path+"@"+w]={...r,errs,sizes:Object.fromEntries(Object.entries(sizes).map(([k,v])=>[k,Math.round(v/1024)])),perf};
    await ctx.close();
  }
}
await br.close(); srv.close();
const out=[]; for(const [k,v] of Object.entries(report)){
  const flags=[];
  if(v.title>60||v.title<20)flags.push("title:"+v.title); if(v.desc>160||v.desc<50)flags.push("desc:"+v.desc); if(v.h1!==1)flags.push("h1:"+v.h1);
  if(v.noAlt)flags.push("noAlt:"+v.noAlt); if(v.noDim)flags.push("noDim:"+v.noDim); if(v.big.length)flags.push("oversized:"+v.big.join(","));
  if(v.extNoRel)flags.push("extNoRel:"+v.extNoRel); if(v.emptyLinks)flags.push("emptyLinks:"+v.emptyLinks); if(v.btnNoName)flags.push("btnNoName:"+v.btnNoName);
  if(v.small.length)flags.push("tiny:"+v.small.slice(0,4).join(",")); if(v.ov)flags.push("overflow:"+v.ov); if(v.canon!==true)flags.push("canon:"+v.canon); if(v.skips)flags.push("hSkip:"+v.skips);
  if(v.fontSmall)flags.push("font<12:"+v.fontSmall); if(v.errs.length)flags.push("ERR:"+v.errs.join("|").slice(0,120)); if(v.ld.includes("BAD"))flags.push("ldBAD");
  const tot=Object.values(v.sizes).reduce((a,b)=>a+b,0);
  out.push(`${k.padEnd(48)} ${String(tot).padStart(5)}KB img${String(v.sizes[".webp"]||0).padStart(5)} lcp${String(v.perf.lcp).padStart(5)} style${String(v.styleTags).padStart(6)} inl${String(v.inlineStyle).padStart(3)}  ${flags.join(" ")}`);
}
console.log(out.join("\n"));
