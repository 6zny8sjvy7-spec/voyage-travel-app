import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const root='http://127.0.0.1:8000/voyage-travel-app/';
const seed=[
 {id:'old-seoul',name:'首爾秋日旅行',country:'韓國',city:'首爾',tz:'Asia/Seoul',lat:37.5665,lon:126.978,startDate:'2026-11-19',days:[[],[],[]]},
 {id:'new-bangkok',name:'泰國曼谷自由行',country:'泰國',city:'曼谷',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,startDate:'2027-03-19',days:[[],[],[],[],[]]},
 {id:'old-japan',name:'日本福岡旅行',country:'日本',city:'福岡',tz:'Asia/Tokyo',lat:33.5904,lon:130.4017,startDate:'2027-03-28',days:[[],[],[]]}
];
let fails=0;
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 let browser;
 try{
  browser=await type.launch({headless:true});
  for(const [device,viewport] of [['desktop',{width:1260,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,deviceScaleFactor:1});
   await ctx.addInitScript(trips=>{
     if(sessionStorage.getItem('voyage-qa-once'))return;
     sessionStorage.setItem('voyage-qa-once','yes');
     localStorage.setItem('voyage-v02',JSON.stringify(trips));
     localStorage.setItem('voyage-v02-active-id','new-bangkok');
     localStorage.setItem('voyage-theme','light');
   },seed);
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(root,{waitUntil:'load',timeout:90000});
    await page.locator('#v2Home .v2-quick-grid').waitFor();
    await page.locator('.v4-th-hero img.v4-image').waitFor({timeout:12000});
    await page.waitForFunction(()=>{
      const x=document.querySelector('.v4-th-hero img.v4-image');
      return x&&x.complete&&x.naturalWidth>=1500&&x.currentSrc.includes('voyage-thailand-vivid-hero-20261128.webp')
    },{timeout:15000});
    await fs.mkdir('qa-previews/visual-shots',{recursive:true});
    await page.screenshot({path:'qa-previews/visual-shots/'+engine+'-'+device+'-thai-home.png',fullPage:false});
    const noOld=await page.locator('#v2Home .v2-quick-grid .v2-link.voyage-place-shortcut').count();
    assert.equal(noOld,1,'NEW places shortcut exists');
    const adjacent=await page.locator('#v2Home .v2-link.voyage-place-shortcut').evaluate(x=>x.previousElementSibling?.textContent.includes('美食口袋名單'));
    assert(adjacent,'new shortcut must be immediately after food');
    assert.equal(await page.locator('#v2Home .voyage-place-shortcut .voyage-new-flag').textContent(),'NEW');
    const names=await page.locator('#tripSelect option').allTextContents();
    assert.equal(names.length,1,'picker only shows current country');
    assert(names[0].includes('泰國'),'Thai trip in selector');
    await page.locator('#v2Home .voyage-place-shortcut').click();
    await page.locator('#v1Content h2').filter({hasText:'行程名單'}).waitFor({timeout:12000});
    await page.locator('#v1Content .voyage-place-form input').nth(0).fill('洽圖洽市集');
    await page.locator('#v1Content .voyage-place-form input').nth(1).fill('https://www.threads.com/@travel/post/C4test');
    await page.locator('#v1Content .voyage-place-form button[type=submit]').click();
    assert.equal(await page.locator('#v1Content a.voyage-place-link').count(),1);
    assert((await page.locator('#v1Content a.voyage-place-link').getAttribute('href')).startsWith('https://www.threads.com/'));
    let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')));
    assert.equal(saved[1].savedPlaces?.length,1,'savedPlaces persisted to Thai trip');
    await page.reload({waitUntil:'load'});
    await page.locator('#v2Home .voyage-place-shortcut').click();
    await page.locator('#v1Content a.voyage-place-link').waitFor();
    assert.equal(await page.locator('#v1Content a.voyage-place-link').count(),1,'list survives reload');
    await page.evaluate(()=>setTab('transport'));
    await page.locator('#thaiTransitGuide').waitFor();
    assert(await page.locator('#thaiTransitGuide').isVisible(),'Thai transit tools visible');
    const rail=await page.evaluate(()=>window.VoyageThailandTransitV1.plan('Siam','Asok','rail'));
    assert.equal(rail.count,4,'Siam to Asok must be 4 stops');
    assert.equal(rail.direction,'Kheha','correct terminal direction');
    const mrt=await page.evaluate(()=>window.VoyageThailandTransitV1.plan('Sukhumvit','Hua Lamphong','rail'));
    assert.equal(mrt.count,6);
    await page.locator('#thaiTransitGuide input').nth(0).fill('Siam');
    await page.locator('#thaiTransitGuide input').nth(1).fill('Asok');
    await page.locator('#thaiTransitGuide button.thai-action').first().click();
    assert((await page.locator('#thaiTransitGuide .thai-result').innerText()).includes('搭 4 站'));
    assert((await page.locator('#thaiTransitGuide .thai-result').innerText()).includes('Kheha'));
    await page.locator('#thaiTransitGuide .thai-tabs button').last().click();
    await page.locator('#thaiTransitGuide button.thai-action').first().click();
    assert((await page.locator('#thaiTransitGuide .thai-result').innerText()).includes('公車'));
    assert((await page.locator('#thaiTransitGuide a[href*="google.com/maps/dir"]').count())===1);
    await page.evaluate(()=>window.VoyageUI.showPage('history'));
    const history=await page.locator('#v1Content').innerText();
    assert(history.includes('首爾秋日旅行')&&history.includes('日本福岡旅行')&&!history.includes('泰國曼谷自由行'),'other countries are in history, not picker');
    const openKorea=page.locator('#v1Content .voyage-history-row').filter({hasText:'首爾秋日旅行'}).getByRole('button',{name:'開啟這趟旅行'});
    await openKorea.click();
    assert.equal(await page.evaluate(()=>window.VoyageRegionV4.countryCode(window.VoyageUI.current())),'KR');
    assert.equal(await page.locator('#tripSelect option').count(),1,'Korean trip in selector, not Thai');
    await page.evaluate(()=>window.VoyageUI.showPage('history'));
    assert((await page.locator('#v1Content').innerText()).includes('泰國曼谷自由行'),'Thai now in history');
    saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')));
    assert.equal(saved[1].savedPlaces[0].name,'洽圖洽市集','Thai places unchanged after switching countries');
    assert.equal(saved.length,3,'no trip deleted');
    console.log('PASS',engine,device,'Thai hi-res art, new card, links, BTS/MRT/bus guide, historical country switching, persistence');
    if(errors.length)console.log('BROWSER_PAGE_ERRORS',engine,device,errors.slice(0,4));
   }catch(e){fails++;console.error('FAIL',engine,device,e.stack||String(e))}
   finally{await ctx.close()}
  }
 }catch(e){fails++;console.error('BROWSER START FAIL',engine,e.stack||String(e))}
 finally{await browser?.close()}
}
if(fails)process.exit(1);
console.log('PASS ALL 4 / 4 real UX flows');