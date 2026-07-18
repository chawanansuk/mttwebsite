import pw from "playwright"; const { chromium } = pw;
import http from 'http'; import { readFileSync, existsSync, statSync } from 'fs'; import { extname, join } from 'path';
const root='/home/user/mttwebsite';
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';let f=join(root,p);if(existsSync(f)&&statSync(f).isFile()){res.writeHead(200,{'Content-Type':mime[extname(f)]||'text/plain'});res.end(readFileSync(f));}else{res.writeHead(404);res.end('nf');}});
await new Promise(r=>server.listen(0,r));const port=server.address().port;const base='http://localhost:'+port;
const b=await chromium.launch();
const pages=['/index.html','/products/index.html','/products/jet-lighter.html','/privacy.html','/404.html'];
const seen=new Set(); const broken=[]; const anchors=[];
for(const path of pages){
  const p=await b.newPage();
  await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000}); await p.waitForTimeout(400);
  const links=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
  for(const href of links){
    if(!href||href.startsWith('http')||href.startsWith('tel:')||href.startsWith('mailto:')||href==='#') continue;
    const [file,frag]=href.split('#');
    if(file){
      const url=new URL(file, base+path).pathname;
      if(!seen.has(url)){ seen.add(url);
        const res=await p.evaluate(async u=>{const r=await fetch(u);return r.status;},url);
        if(res!==200) broken.push(path+' → '+href+' ('+res+')');
      }
    }
    if(frag) anchors.push({from:path, to:file?new URL(file,base+path).pathname:path, frag});
  }
  await p.close();
}
// ตรวจ anchor targets
for(const a of anchors){
  const p=await b.newPage();
  await p.goto(base+a.to,{waitUntil:'domcontentloaded',timeout:30000}); await p.waitForTimeout(500);
  const ok=await p.evaluate(id=>!!document.getElementById(id),a.frag);
  if(!ok) broken.push(a.from+' → '+a.to+'#'+a.frag+' (anchor missing)');
  await p.close();
}
console.log(broken.length?('BROKEN:\n'+[...new Set(broken)].join('\n')):'ลิงก์ภายในทุกตัว OK ('+seen.size+' ไฟล์, '+anchors.length+' anchors)');
await b.close();server.close();
