import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';

const origin=process.env.VOYAGE_BASE || 'http://127.0.0.1:8000/voyage-travel-app/';
const seed=[
 {id:'existing-seoul',name:'保留舊韓國旅行',country:'韓國',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,startDate:'2026-11-19',days:[[],[]]}
];
const states=[['chromium',chromium],['webkit',webkit]];
let failures=0;
for(const [engine,type] of states){
 let browser;
 try{
  browser=await type.launch({headless:true});
  for(const [device,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport});
   await context.addInitScript(data=>{
    if(sessionStorage.getItem('voyage-qa-seeded'))return;
    localStorage.setItem('voyage-v02',JSON.stringify(data));
    localStorage.setItem('voyage-v02-active-id','existing-seoul');
    localStorage.setItem('voyage-theme','light');
    sessionStorage.setItem('voyage-qa-seeded','1');
   },seed);
   const page=await context.newPage();
   const alerts=[],jsErrors=[];
   page.on('pageerror',e=>jsErrors.push(e.message));
   let prompts=['泰國曼谷旅遊','曼谷','泰國','5','2027-03-19'];
   page.on('dialog',async d=>{
    if(d.type()==='prompt')await d.accept(prompts.shift()||'');
    else if(d.type()==='confirm')await d.accept();
    else {alerts.push(d.message());await d.accept();}
   });
   // Model the service returning zero results to reproduce the reported bug.
   await page.route('**/geocoding-api.open-meteo.com/v1/search?**',r=>r.fulfill({
      status:200,contentType:'application/json',body:JSON.stringify({results:[]})
   }));
   try{
    const response=await page.goto(origin+'?qa=thai-create-'+engine+'-'+device,{waitUntil:'load',timeout:60000});
    assert.equal(response?.status(),200);
    await page.locator('#v2Home').waitFor({timeout:12000});
    await page.waitForTimeout(700);
    assert.equal(await page.locator('#v2ReviewTop').count(),0);
    const homepage=await page.locator('#v2Home').isVisible();
    assert(homepage,'official V2 homepage is visible, not old landing');
    const opener=page.locator('#v2Home .v2-toolbar button').filter({hasText:'規劃新旅行'}).first();
    await opener.click({timeout:12000});
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('voyage-v02')||'[]').length===2,{timeout:12000});
    const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')||'[]'));
    assert.equal(data.length,2,'must add Thai trip without removing original');
    assert.equal(data[0].name,'保留舊韓國旅行','old trip unchanged');
    const thai=data[1];
    assert(['泰國','Thailand'].includes(thai.country),'TH country code persisted without changing the original country language');
    assert(['曼谷','Bangkok'].includes(thai.city),'Bangkok is normalized to Thai destination in native UI');
    assert.equal(thai.tz,'Asia/Bangkok');
    assert.equal(thai.days.length,5);
    assert.equal(thai.startDate,'2027-03-19');
    await page.locator('.vw-scene[data-country="TH"]').waitFor({timeout:12000});
    const img=page.locator('.vw-scene[data-country="TH"] img.v4-image');
    await img.waitFor({timeout:12000});
    assert(await img.evaluate(x=>x.naturalWidth>0&&x.currentSrc.includes('voyage-thai-approved-fourface-v4.webp')),'Thai animation loaded');
    assert.equal(prompts.length,0,'all prompts handled without retry');
    assert.equal(alerts.length,0,'no failed city alert');
    await page.reload({waitUntil:'load'});
    await page.locator('.vw-scene[data-country="TH"]').waitFor({timeout:12000});
    const persist=await page.evaluate(()=>({trips:JSON.parse(localStorage.getItem('voyage-v02')||'[]'),active:localStorage.getItem('voyage-v02-active-id')}));
    assert.equal(persist.trips.length,2);
    assert.equal(persist.active,thai.id);
    assert.equal(persist.trips[0].name,'保留舊韓國旅行');
    const confirmed=await page.locator('title').textContent();
    console.log('PASS',engine,device,'create Thailand/Mandarin, preserve Seoul, reload persistence, V2 home visible; ',confirmed);
    if(jsErrors.length)console.warn('BROWSER JS WARNINGS',engine,device,jsErrors.slice(0,4));
   }catch(e){failures++;console.error('FAIL',engine,device,e.stack||String(e))}
   finally{await context.close()}
  }
 }catch(e){failures++;console.error('BROWSER LAUNCH FAIL',engine,e.stack||String(e))}
 finally{await browser?.close()}
}
if(failures){console.error(failures+' Thai create regression failures');process.exit(1)}
console.log('PASS all 4 create-trip end-to-end cases');
