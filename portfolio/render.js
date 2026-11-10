// 목업 페이지를 긴 PNG로 저장: node portfolio/render.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:+(process.argv[2]||1)});
await p.goto('file://'+path.join(__dirname,'index.html'));await p.waitForTimeout(500);
await p.screenshot({path:path.join(__dirname,process.argv[3]||'moodi-mockup.png'),fullPage:true});await b.close()})();
