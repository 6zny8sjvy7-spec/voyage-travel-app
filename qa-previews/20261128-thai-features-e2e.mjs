import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.VOYAGE_QA_ROOT||'http://127.0.0.1:8000/voyage-travel-app/';
const fixtures=[
{id:'kr-a',name:'原韓國旅行',country:'韓國',countryCode:'KR',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,startDate:'2026-11-19',days:[[]]},
{id:'th-a',name:'泰國自由行',country:'泰國',countryCode:'TH',city:'曼谷',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,startDate:'2027-03-19',days:[[],[]]},
{id:'jp-a',name:'日本測試旅程',country:'日本',countryCode:'JP',city:'福岡',tz:'Asia/Tokyo',lat:33.5904,lon:130.4017,startDate:'2027-04-08',days:[[]]}
];
let failures=0;
for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
 let browser;try{
 browser=await browserType.launch({headless:true});
 for(const [device,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  await context.addInitScript(seed=>{
   if(sessionStorage.getItem('qa-seeded'))return;
   localStorage.setItem('voyage-v02',JSON.stringify(seed));localStorage.setItem('voyage-v02-active-id','kr-a');
   localStorage.setItem('voyage-theme','light');sessionStorage.setItem('qa-seeded','1');
  },fixtures);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  try{
   const response=await page.goto(url,{waitUntil:'load',timeout:90000});
   assert.equal(response?.status(),200);
   await page.locator('#v2Home .v2-quick-grid').waitFor({timeout:16000});
   await page.locator('#v2Home .voyage-ideas-entry').waitFor({state:'attached',timeout:10000});
   const links=await page.locator('#v2Home .v2-quick-grid .v2-link').allTextContents();
   const food=links.findIndex(x=>x.includes('美食口袋名單'));
   assert(food>=0 && links[food+1]?.includes('行程名單'),'new shortcut follows food: '+JSON.stringify(links));
   assert.equal(links.filter(x=>x.includes('行程名單')).length,1);
   assert(!links[food+1].includes('NEW'),'no NEW badge');
   let picker=await page.locator('#tripSelect option').allTextContents();
   assert.equal(picker.length,1,'only active country in picker');
   assert(picker[0].includes('韓國'),'KR first');
   await page.locator('#v2Home .voyage-ideas-entry').click();
   await page.locator('#voyageIdeasDialog').waitFor({state:'visible'});
   await page.locator('#voyageIdeasForm input[name=name]').fill('曼谷友人分享景點');
   await page.locator('#voyageIdeasForm input[name=url]').fill('https://www.google.com/maps/place/Bangkok');
   await page.locator('#voyageIdeasForm textarea[name=notes]').fill('朋友想去');
   await page.locator('#voyageIdeasForm button[type=submit]').click();
   assert((await page.locator('#voyageIdeasItems a').first().getAttribute('href')).startsWith('https://www.google.com/maps/'));
   await page.locator('#voyageIdeasDialog [data-action=close]').click();
   await page.evaluate(()=>window.VoyageUI.showPage('history'));
   const rows=page.locator('.v1-item');
   const thaiRow=rows.filter({hasText:'泰國自由行'}).first();
   await thaiRow.getByRole('button',{name:'開啟'}).click();
   await page.waitForTimeout(350);
   const active=await page.evaluate(()=>localStorage.getItem('voyage-v02-active-id'));
   assert.equal(active,'th-a','history opening persists selected Thai trip');
   picker=await page.locator('#tripSelect option').allTextContents();
   assert.equal(picker.length,1,'previous countries are history only');
   assert(picker[0].includes('泰國'),'Thai picker shows only Thai');
   const scene=page.locator('.vw-scene[data-country="TH"].v4-th-hero');
   await scene.waitFor({state:'visible',timeout:14000});
   const img=scene.locator('img.v4-image');
   assert(await img.evaluate(x=>x.complete&&x.naturalWidth>=1600 && x.currentSrc.includes('voyage-thai-clean-v5.webp')),'sharp clean hero loaded');
   const plane=scene.locator('.v5-plane-flight img');
   assert(await plane.evaluate(x=>x.complete&&x.naturalWidth>=150),'separate airplane loaded');
   const flightInfo=await scene.locator('.v5-plane-flight').evaluate(el=>{
    const anim=el.getAnimations()[0];if(!anim)return {has:false};
    anim.pause();anim.currentTime=2000;const x1=el.getBoundingClientRect().x;
    anim.currentTime=17000;const x2=el.getBoundingClientRect().x;
    anim.play();return {has:true,x1,x2,name:getComputedStyle(el).animationName}
   });
   assert(flightInfo.has && flightInfo.x2>flightInfo.x1+60 && flightInfo.name.includes('flight-left-to-right'),'plane really flies left to right');
   await page.evaluate(()=>setTab('transport'));
   const transit=page.locator('#voyageThaiTransit');
   await transit.waitFor({state:'visible',timeout:6000});
   await page.locator('#thMode').selectOption('suk');
   await page.locator('#thStart').fill('暹羅');await page.locator('#thEnd').fill('阿索克');
   await page.locator('#thFind').click();
   assert((await page.locator('#thResult').innerText()).includes('搭乘 4 站'),'BTS 4 stops Siam to Asok');
   assert((await page.locator('#thResult').innerText()).includes('Kheha'),'BTS real direction');
   await page.locator('#thMode').selectOption('mrt');
   await page.locator('#thStart').fill('Sukhumvit');await page.locator('#thEnd').fill('Si Lom');
   await page.locator('#thFind').click();
   assert((await page.locator('#thResult').innerText()).includes('搭乘 4 站'),'MRT 4 stops');
   await page.locator('#thMode').selectOption('bus');
   await page.locator('#thFind').click();
   const bus=await page.locator('#thResult').innerText();
   assert(bus.includes('BMTA BUS') && !bus.includes('搭乘 4 站'),'Bus must not invent route');
   await page.evaluate(()=>window.VoyageUI.showPage('history'));
   await rows.filter({hasText:'日本測試旅程'}).first().getByRole('button',{name:'刪除'}).click();
   let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')));
   assert.equal(data.length,2,'deleted only selected test trip');
   assert(data.some(x=>x.id==='kr-a')&&data.some(x=>x.id==='th-a'),'other trips preserved');
   assert(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('voyage-backup-before-delete-'))),'before delete backup');
   await page.reload({waitUntil:'load'});
   await page.locator('.vw-scene[data-country="TH"].v4-th-hero').waitFor({state:'visible',timeout:16000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('voyage-v02-active-id')),'th-a');
   assert.equal((await page.locator('#tripSelect option').count()),1);
   assert.equal(await page.locator('#v2Home .voyage-ideas-entry').count(),1,'new feature persists');
   assert.equal(errors.length,0,'no browser errors: '+errors.slice(0,3).join(';'));
   console.log('PASS',engine,device,'hero plane motion, Thai route counts, collections, history, delete, reload');
  }catch(e){failures++;console.error('FAIL',engine,device,e.stack||String(e));console.log('BROWSER_ERRORS',errors.slice(0,8))}
  finally{await context.close()}
 }
 }catch(e){failures++;console.error('ENGINE ERROR',engine,e.stack||String(e))}
 finally{await browser?.close()}
}
if(failures){console.error(failures+' QA test suites failed');process.exit(1)}
console.log('PASS ALL Thai formal-root features Chrome/WebKit desktop/mobile');
