import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin=process.env.VOYAGE_ROOT || 'http://127.0.0.1:8000/voyage-travel-app/';
const seed=[
 {id:'kr1',name:'韓國舊行程',country:'韓國',countryCode:'KR',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,startDate:'2026-11-19',days:[[]]},
 {id:'th1',name:'泰國正式旅行',country:'泰國',countryCode:'TH',city:'曼谷',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,startDate:'2027-03-19',days:[[],[]],ideaPlaces:[
  {id:'old-idea',name:'CLOUDY',url:'https://www.google.com/maps/search/?api=1&query=Bangkok',notes:'5樓'}
 ]}
];
const shots='qa-previews/ideas-transit-shots';await mkdir(shots,{recursive:true});
let failures=0;
for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
 let browser;
 try{browser=await driver.launch({headless:true});
 for(const [device,viewport] of [['desktop',{width:1280,height:850}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  await context.addInitScript(data=>{
   if(sessionStorage.getItem('qa-ideas-seeded'))return;
   localStorage.setItem('voyage-v02',JSON.stringify(data));
   localStorage.setItem('voyage-v02-active-id','th1');
   localStorage.setItem('voyage-theme','light');
   sessionStorage.setItem('qa-ideas-seeded','1');
  },seed);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  try{
   const res=await page.goto(origin,{waitUntil:'load',timeout:85000});assert.equal(res?.status(),200);
   await page.locator('#v2Home .voyage-ideas-entry').waitFor({timeout:12000});
   await page.locator('#v2Home .voyage-ideas-entry').click();
   const section=page.locator('#v1Content .ideas-page');await section.waitFor({state:'visible',timeout:10000});
   assert.equal(await page.locator('#v1Dialog[open]').count(),0,'No form popup on viewing saved ideas');
   assert.equal(await section.locator('.ideas-card').count(),1,'Existing saved item shown');
   assert((await section.innerText()).includes('CLOUDY'),'Saved name');
   await page.screenshot({path:shots+'/'+engine+'-'+device+'-list.png'});
   await section.getByRole('button',{name:/新增地點/}).click();
   await page.locator('#v1Dialog[open]').waitFor({timeout:7000});
   await page.locator('#vIdeaName').fill('曼谷週末市集');
   await page.locator('#vIdeaUrl').fill('https://www.instagram.com/explore/tags/bangkok/');
   await page.locator('#vIdeaNotes').fill('朋友推薦，先收藏');
   await page.locator('#v1DialogForm button[type=submit]').click();
   await page.locator('#v1Dialog[open]').waitFor({state:'detached',timeout:7000});
   assert.equal(await page.locator('#v1Content .ideas-card').count(),2,'New place displayed in saved list, not in form');
   assert(await page.locator('#v1Content a.ideas-source').last().getAttribute('href')==='https://www.instagram.com/explore/tags/bangkok/');
   const card=page.locator('#v1Content .ideas-card').filter({hasText:'曼谷週末市集'});
   await card.getByRole('button',{name:/加入每日行程/}).click();
   await page.locator('#v1Dialog[open]').waitFor({timeout:7000});
   await page.locator('#vIdeaDay').selectOption('1');
   await page.locator('#vIdeaTime').fill('14:20');
   await page.locator('#v1DialogForm button[type=submit]').click();
   const trip=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')).find(x=>x.id==='th1'));
   assert(trip.days[1].some(x=>x.name==='曼谷週末市集'&&x.time==='14:20'),'Idea scheduled in chosen day');
   assert.equal(trip.ideaPlaces.length,2,'Idea stays saved after scheduling');
   assert(trip.ideaPlaces.find(x=>x.name==='曼谷週末市集').scheduledCount===1);
   await page.evaluate(()=>setTab('transport'));
   const panel=page.locator('#transportSection');await panel.waitFor({state:'visible',timeout:10000});
   assert.equal(await panel.locator('#voyageThaiTransit').count(),0,'No duplicate Thai search form');
   await panel.locator('.v5-mode-switch button').filter({hasText:'地鐵／BTS'}).click();
   await page.locator('#transitFrom').fill('暹羅');
   await page.locator('#transitTo').fill('阿索克');
   await panel.getByRole('button',{name:/查詢 A → B 怎麼搭/}).click();
   const result=await page.locator('#v2RouteResults').innerText();
   assert(result.includes('搭乘 4 站'),result.slice(0,800));
   assert(result.includes('Kheha'),result.slice(0,800));
   assert(await panel.locator('#voyageThaiStationReference').isVisible());
   await page.screenshot({path:shots+'/'+engine+'-'+device+'-transit.png'});
   await page.evaluate(()=>window.VoyageUI.showPage('collab'));
   const collaboration=await page.locator('#v1Content').innerText();
   assert(collaboration.includes('尚未啟用雲端'),'No false claim that collaboration already works');
   assert.equal(await page.locator('#v1Content button').filter({hasText:'產生邀請連結'}).count(),0,'Do not expose invite without backend');
   await page.reload({waitUntil:'load'});
   const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')));
   assert.equal(state.length,2,'Older trips not overwritten');
   assert.equal(state[0].name,'韓國舊行程');
   assert(state[1].ideaPlaces.some(x=>x.name==='曼谷週末市集'));
   assert(state[1].days[1].some(x=>x.name==='曼谷週末市集'));
   assert.equal(errors.length,0,'Browser JS errors: '+errors.slice(0,5));
   console.log('PASS',engine,device,'ideas list→add modal→arrange day, one Thai transit A→B, unconfigured collaboration blocked, persisted data');
  }catch(e){failures++;console.error('FAIL',engine,device,e.stack||String(e));console.log('BROWSER ERRORS',errors.slice(0,6))}
  finally{await context.close()}
 }
 }catch(e){failures++;console.error('ENGINE ERROR',engine,String(e))}
 finally{await browser?.close()}
}
if(failures){console.error(failures+' official-root test cases failed');process.exit(1)}
console.log('PASS ALL 4 official-root regression cases');
