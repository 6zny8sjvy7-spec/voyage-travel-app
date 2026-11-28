/* Production-root screenshot regression: Thai transit compact mode, full URL carry-through,
   delete scheduled event from edit modal, and legacy data unchanged. */
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const root=process.env.VOYAGE_ROOT||'http://127.0.0.1:8000/voyage-travel-app/';
const screen='qa-previews/thai-map-delete-shots';
await mkdir(screen,{recursive:true});
const url='https://maps.app.goo.gl/HGYd15MxhMFZrVWn9?g_st=ic';
const seed=[
{id:'kr-baseline',name:'韓國舊旅行',country:'韓國',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,days:[[]],startDate:'2026-11-19'},
{id:'th-demo',name:'泰國自由行',country:'泰國',city:'曼谷',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,days:[[{id:'event-cloudy',name:'CLOUDY',type:'place',time:'10:00',duration:60,mapUrl:url,url,notes:'5樓'}],[]],
startDate:'2027-03-19',ideaPlaces:[{id:'idea-cloudy',name:'CLOUDY',url,notes:'5樓'}]}
];
let fail=0;
for(const [browserName,browserType] of [['chromium',chromium],['webkit',webkit]]){
 let browser;
 try{browser=await browserType.launch({headless:true});
  for(const [device,viewport] of [['desktop',{width:1280,height:840}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport});
   await context.addInitScript(items=>{
    if(sessionStorage.getItem('one-time-th-qa'))return;
    localStorage.setItem('voyage-v02',JSON.stringify(items));
    localStorage.setItem('voyage-v02-active-id','th-demo');
    localStorage.setItem('voyage-theme','light');
    sessionStorage.setItem('one-time-th-qa','yes');
   },seed);
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('dialog',d=>d.accept());
   try{
    const res=await page.goto(root,{waitUntil:'load',timeout:90000});assert.equal(res?.status(),200);
    const panel=page.locator('#transportSection');
    await panel.locator('#thSimplePlanner').waitFor({timeout:13000});
    assert(await panel.evaluate(el=>el.classList.contains('th-integrated')),'TH mode active');
    for(const id of ['v5OptionalDepartures','v5ManualProgress','voyageThaiStationReference']){
     const element=panel.locator('#'+id);
     if(await element.count())assert.equal(await element.isVisible(),false,'Unneeded control hidden: '+id);
    }
    assert.equal(await panel.locator('#thSimplePlanner').evaluate(el=>el.open),false,'Planner collapsed by default');
    assert.equal(await panel.locator('#transitFrom').count(),1);
    assert.equal(await panel.locator('#transitTo').count(),1);
    await panel.locator('.v5-mode-switch button').filter({hasText:'地鐵／BTS'}).click();
    await panel.locator('#transitFrom').fill('Asok');
    await panel.locator('#transitTo').fill('Ari');
    await panel.getByRole('button',{name:/查詢 A → B 怎麼搭/}).click();
    const result=await panel.locator('#v2RouteResults').innerText();
    assert(result.includes('搭乘 9 站'),result.slice(0,1000));
    assert(result.includes('Khu Khot')&&result.includes('不需換線'),result.slice(0,1000));
    await page.screenshot({path:screen+'/'+browserName+'-'+device+'-rail.png'});
    await panel.locator('.v5-mode-switch button').filter({hasText:'公車'}).click();
    assert(await panel.locator('#thBusHint').isVisible(),'Bus view includes a safe alternative with actual link');
    const busHref=await panel.locator('#thBusHint a').first().getAttribute('href');
    assert(busHref.includes('travelmode=transit')&&busHref.includes('Asok')&&busHref.includes('Ari'),busHref);
    assert.equal(await panel.locator('#thSimplePlanner').isVisible(),true);
    await page.screenshot({path:screen+'/'+browserName+'-'+device+'-bus.png'});
    const mapLink=page.locator('#v1MapStops .v1-map-source-link').first();
    await mapLink.waitFor({timeout:8000});
    assert.equal(await mapLink.getAttribute('href'),url,'Original short URL must appear in map section exactly');
    assert((await page.locator('#v1MapStops').innerText()).includes('已保存地圖'),'Avoid saying saved maps URL is absent');
    await page.evaluate(()=>window.VoyageUI.eventEditor(0,false));
    await page.locator('#v1Dialog[open]').waitFor({timeout:7000});
    assert.equal(await page.locator('#vEvURL').inputValue(),url,'Editor carries original map link');
    const erase=page.locator('#v1DeleteScheduledEvent');
    await erase.waitFor({timeout:7000});
    await erase.click();
    await page.locator('#v1Dialog[open]').waitFor({state:'detached',timeout:7000});
    const after=await page.evaluate(()=>({
     data:JSON.parse(localStorage.getItem('voyage-v02')),
     backups:Object.keys(localStorage).filter(k=>k.startsWith('voyage-backup-before-event-delete-'))
    }));
    assert.equal(after.data.length,2,'All trips retained');
    assert.equal(after.data[0].name,'韓國舊旅行');
    assert.equal(after.data[1].days[0].length,0,'Scheduled event erased');
    assert.equal(after.data[1].ideaPlaces.length,1,'Saved idea survives deletion');
    assert(after.backups.length>0,'Backup exists before deletion');
    await page.reload({waitUntil:'load',timeout:90000});
    const persist=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')));
    assert.equal(persist[1].days[0].length,0);
    assert.equal(persist[1].ideaPlaces[0].url,url);
    assert.equal(errors.length,0,'JS errors: '+JSON.stringify(errors.slice(0,4)));
    console.log('PASS',browserName,device,'Asok→Ari 9 no-transfer, compact TH bus fallback, map source URL, delete+backup, reload persistence');
   }catch(e){fail++;console.error('FAIL',browserName,device,e.stack||String(e));console.log('JS_ERRORS',JSON.stringify(errors.slice(0,8)))}
   finally{await context.close()}
  }
 }catch(e){fail++;console.error('BROWSER_FAIL',browserName,e.stack||String(e))}
 finally{await browser?.close()}
}
if(fail){console.error(fail+' cases failed');process.exit(1)}
console.log('PASS ALL 4 production-root browser scenarios');
