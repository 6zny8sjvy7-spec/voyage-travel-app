import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const leaflet=readFileSync(new URL('./leaflet-stub.js',import.meta.url),'utf8');
const response=(temp,day=1,code=1)=>JSON.stringify({latitude:37.55,longitude:126.98,timezone:'Asia/Seoul',current:{temperature_2m:temp,weather_code:code,is_day:day,time:'2026-11-13T10:25'},daily:{sunrise:['2026-11-13T06:20'],sunset:['2026-11-13T17:30']}});
test.beforeEach(async({page})=>{
 await page.route('**/leaflet.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:leaflet}));
 await page.route('**/leaflet.css',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
 await page.route('**/api.open-meteo.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:response(15.2)}));
 await page.goto('/');
 await expect(page.locator('#v2Home')).toBeVisible();
});
test('weather shows real source data and keeps last successful SAME city weather when service fails',async({page})=>{
 await expect(page.locator('#temp')).toContainText('15.2');
 await expect(page.locator('#v4WeatherStatus')).toContainText('最新目的地天氣');
 await page.route('**/api.open-meteo.com/**',r=>r.fulfill({status:503,body:'temporarily unavailable'}));
 await page.evaluate(()=>loadWeather());
 await expect(page.locator('#v4WeatherStatus')).toContainText('顯示同一城市最近一次成功資料',{timeout:15000});
 await expect(page.locator('#temp')).toContainText('15.2');
 expect(await page.evaluate(()=>VoyageWeatherV4.lastError)).toContain('HTTP 503');
});
test('traveler changes between Korea Thailand Japan Vietnam with distinct city weather, no stale temperatures',async({page})=>{
 const all=[
  {id:'qa-kr',country:'韓國',countryCode:'KR',city:'首爾',tz:'Asia/Seoul',lat:37.55,lon:126.98,expectTemp:15},
  {id:'qa-th',country:'泰國',countryCode:'TH',city:'曼谷',tz:'Asia/Bangkok',lat:13.75,lon:100.5,expectTemp:31},
  {id:'qa-jp',country:'日本',countryCode:'JP',city:'東京',tz:'Asia/Tokyo',lat:35.68,lon:139.69,expectTemp:19},
  {id:'qa-vn',country:'越南',countryCode:'VN',city:'胡志明市',tz:'Asia/Ho_Chi_Minh',lat:10.82,lon:106.63,expectTemp:30}
 ];
 await page.route('**/api.open-meteo.com/**',route=>{
  const lat=Number(new URL(route.request().url()).searchParams.get('latitude'));
  const item=all.find(x=>Math.abs(x.lat-lat)<.04);
  return route.fulfill({status:200,contentType:'application/json',body:response(item?.expectTemp??5)});
 });
 for(const t of all){
  const code=await page.evaluate(async input=>{
   const c={id:input.id,name:'QA '+input.city,country:input.country,countryCode:input.countryCode,city:input.city,lat:input.lat,lon:input.lon,tz:input.tz,startDate:'2026-12-10',days:[[]]};
   trips.push(c);active=trips.length-1;day=0;save();render();
   await loadWeather();
   return VoyageRegionV4.countryCode(trip());
  },t);
  expect(code).toBe(t.countryCode);
  await expect(page.locator('#temp')).toHaveText(t.expectTemp.toFixed(1)+'°C');
  await expect(page.locator('#cityLabel')).toHaveText(t.city);
  await page.locator('[data-tablink="transport"]').click();
  await expect(page.locator('#v4TransitRegion')).toContainText(t.city);
  if(t.countryCode==='TH')await expect(page.locator('#v4TransitRegion')).toContainText('BTS／MRT');
  if(t.countryCode==='JP')await expect(page.locator('#v4TransitRegion')).toContainText('鐵道／地鐵');
  if(t.countryCode==='VN')await expect(page.locator('#v4TransitRegion')).toContainText('城市軌道');
  await page.locator('[data-tablink="trips"]').click();
 }
});
test('Bangkok never borrows prebuilt Seoul metro answer for Seoul-origin words',async({page})=>{
 await page.evaluate(()=>{
  trips.push({id:'bangkok-guard',name:'Thailand guard',country:'泰國',countryCode:'TH',city:'曼谷',tz:'Asia/Bangkok',lat:13.75,lon:100.50,days:[[]]});
  active=trips.length-1;save();render();
 });
 await page.route('**/api.transitous.org/**',r=>r.fulfill({status:503,body:'offline'}));
 await page.locator('[data-tablink="transport"]').click();
 await page.locator('#transitFrom').fill('明洞');
 await page.locator('#transitTo').fill('弘大');
 await page.getByRole('button',{name:/查詢實際交通路線/}).click();
 await expect(page.locator('#v2RouteResults')).toContainText('本次查不到足以驗證的「泰國 · 曼谷」交通資料');
 await expect(page.locator('#v2RouteResults')).not.toContainText('AREX');
 await expect(page.locator('#v4TransitRegion')).toContainText('曼谷');
});
test('packing normal mode has a checked-and-struck item; deletion checkboxes only appear after switching modes',async({page})=>{
 await page.locator('#v2Home').getByRole('button',{name:/行李清單/}).click();
 // New trips begin without any packing rows: explicitly add the public baseline list.
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#v1Content').getByRole('button',{name:'加入出國通用清單'}).click();
 const first=page.locator('#v1Content > .v1-item').filter({hasText:'護照'}).first();
 await expect(first).toBeVisible();
 await first.locator('.v1-check').check();
 await expect(first.locator('.v1-struck')).toBeVisible();
 await expect(first.locator('.v1-struck')).toHaveCSS('text-decoration-line','line-through');
 await expect(page.locator('#v1Content .v3-remove-check')).toHaveCount(0);
 await page.locator('#v3PackBulk').getByRole('button',{name:'勾選要刪的物品'}).click();
 await expect(page.locator('#v1Content .v3-remove-check').first()).toBeVisible();
 await expect(page.locator('#v1Content .v1-check:visible')).toHaveCount(0);
 await page.locator('#v3PackBulk').getByRole('button',{name:'取消刪除模式'}).click();
 await expect(page.locator('#v1Content .v3-remove-check')).toHaveCount(0);
 await expect(page.locator('#v1Content .v1-struck').first()).toBeVisible();
});


test('translation destination language resets correctly when switching from Korea to Vietnam and back',async({page})=>{
 await page.locator('#v2Home').getByRole('button',{name:/即時翻譯/}).click();
 await expect(page.locator('#vLanguage')).toHaveValue('ko');
 await page.evaluate(()=>{
  trips.push({id:'test-vi',name:'Vietnam trip',country:'越南',countryCode:'VN',city:'河內',tz:'Asia/Ho_Chi_Minh',lat:21.0285,lon:105.8542,days:[[]]});
  active=trips.length-1;save();render();VoyageUI.showPage('translation');
 });
 await expect(page.locator('#vLanguage')).toHaveValue('vi');
 await page.evaluate(()=>{active=0;save();render();VoyageUI.showPage('translation')});
 await expect(page.locator('#vLanguage')).toHaveValue('ko');
});
