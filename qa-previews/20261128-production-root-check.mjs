// Official-root browser regression for VOYAGE (no user data; ephemeral browser profiles).
// Tests the same path that is published by the real root index.html.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium, webkit} from 'playwright';

const root = process.env.VOYAGE_QA_URL || 'http://127.0.0.1:8000/voyage-travel-app/';
const out = path.resolve('qa-previews/browser-shots');
await fs.mkdir(out,{recursive:true});
const trips = [
 {id:'qa-korea',name:'韓國橋梁 QA',country:'韓國',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,startDate:'2027-02-01',days:[[],[],[]]},
 {id:'qa-thai',name:'泰國動畫 QA',country:'泰國',city:'曼谷',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,startDate:'2027-03-19',days:[[],[],[]]},
 {id:'qa-japan',name:'日本動畫 QA',country:'日本',city:'福岡',tz:'Asia/Tokyo',lat:33.5904,lon:130.4017,startDate:'2027-03-28',days:[[],[],[]]}
];
const browserMatrix=[['chromium',chromium],['webkit',webkit]];
let failures=0;
for(const [browserName,browserType] of browserMatrix){
 let browser;
 try{
  browser=await browserType.launch({headless:true});
  for(const [profile,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport,deviceScaleFactor:1});
   await context.addInitScript(({trips})=>{
    localStorage.setItem('voyage-v02',JSON.stringify(trips));
    localStorage.setItem('voyage-theme','light');
    localStorage.removeItem('voyage-v2-review-20261112');
   },{trips});
   const page=await context.newPage();
   const broken=[];
   page.on('response',r=>{
    try{if(r.status()>=400&&new URL(r.url()).origin===new URL(root).origin&&/\.(js|css|webp|avif|html)(?:\?|$)/i.test(r.url()))broken.push(r.status()+' '+r.url())}catch{}
   });
   page.on('requestfailed',r=>{
    try{if(new URL(r.url()).origin===new URL(root).origin)broken.push(r.url())}catch{}
   });
   for(const t of trips){
    try{
     await page.addInitScript(id=>localStorage.setItem('voyage-v02-active-id',id),t.id);
     const response=await page.goto(root,{waitUntil:'load',timeout:90000});
     assert.equal(response?.status(),200,'root page must return 200');
     await page.locator('#v2Home').waitFor({timeout:30000});
     await page.waitForTimeout(2300);
     assert.equal(await page.locator('#v2ReviewTop').count(),0,'test banner must be gone');
     assert.equal(await page.locator('#v2PreviewReset').count(),0,'test data reset button must be gone');
     const base=await page.evaluate(()=>document.baseURI);
     assert(base.includes('/voyage-travel-app/v2-review-20261112/'),'subdir JS/CSS base path');
     const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')||'[]'));
     assert.equal(persisted.length,3,'do not lose original formal trips');
     let hero;
     if(t.id==='qa-korea'){
      hero=page.locator('.voyage-seoul-hero-v12');
      await hero.waitFor({timeout:10000});
      const frame=page.frameLocator('.voyage-seoul-hero-v12 iframe');
      await frame.locator('#plate').waitFor({timeout:25000});
      const okay=await frame.locator('#plate').evaluate(el=>el instanceof HTMLImageElement&&el.naturalWidth>0);
      assert(okay,'Korea source illustration must load');
     }else{
      const code=t.id==='qa-thai'?'TH':'JP';
      hero=page.locator('.vw-scene[data-country="'+code+'"]');
      await hero.waitFor({timeout:12000});
      const loaded=await hero.locator('img').evaluateAll(els=>els.some(el=>el.complete&&el.naturalWidth>0));
      assert(loaded,code+' illustration must load');
     }
     assert.equal(broken.length,0,'site-local assets missing: '+broken.join('; '));
     await hero.screenshot({path:path.join(out,browserName+'-'+profile+'-'+t.id+'.png')});
     console.log('PASS',browserName,profile,t.id,await page.title());
    }catch(e){failures++;console.error('FAIL',browserName,profile,t.id,e.stack||String(e))}
   }
   await context.close();
  }
 }catch(e){failures++;console.error('LAUNCH FAIL',browserName,e.stack||String(e))}
 finally{await browser?.close()}
}
if(failures){console.error(failures+' official-root QA cases failed');process.exit(1)}
console.log('Official-root Chromium & WebKit image loading, data, and layout shots passed.');
