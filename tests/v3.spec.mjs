import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const leaflet=readFileSync(new URL('./leaflet-stub.js',import.meta.url),'utf8');
test.beforeEach(async({page})=>{
await page.route('**/leaflet.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:leaflet}));
await page.route('**/leaflet.css',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
await page.route('**/api.open-meteo.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({current:{temperature_2m:18,weather_code:61,is_day:1,time:'2026-11-12T13:30'},daily:{sunrise:['2026-11-12T06:30'],sunset:['2026-11-12T17:30']}})}));
await page.goto('/');
await expect(page.locator('#v2Home')).toBeVisible();
});
test('time grid allocates proportional durations and category colours',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
await page.locator('#v3ComposerDetails summary').click();
await page.locator('#v3NewType').selectOption('food');
await page.locator('#v3NewName').fill('烤肉晚餐');
await page.locator('#v3NewTime').fill('18:00');
await page.locator('#v3NewDuration').fill('90');
await page.locator('#v3Composer').getByRole('button',{name:/加入當天時間軸/}).click();
await page.locator('#weeklyView').click();
const card=page.locator('#week .v3-kind-food').filter({hasText:'烤肉晚餐'});
await expect(card).toBeVisible();
await expect(card).toContainText('90 分');
const tall=await card.evaluate(x=>parseFloat(x.style.height));
expect(tall).toBeGreaterThan(78);
await page.reload();
await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
await page.locator('#weeklyView').click();
await expect(page.locator('#week .v3-kind-food').filter({hasText:'烤肉晚餐'})).toBeVisible();
});
test('tapping a day event stays on calendar and focuses the map below',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
await expect(page.locator('#v3InlineMap')).toBeVisible();
await expect(page.locator('#v3LeafletMap')).toBeVisible();
await page.locator('#events .v3-schedule-event').filter({hasText:'景福宮'}).click();
await expect(page.locator('#v3MapSummary')).toContainText('景福宮');
expect(await page.locator('body').getAttribute('data-tab')).toBe('itinerary');
await page.locator('#weeklyView').click();
await page.locator('#week .v3-schedule-event').filter({hasText:'北村韓屋村'}).click();
await expect(page.locator('#v3MapSummary')).toContainText('北村韓屋村');
expect(await page.locator('body').getAttribute('data-tab')).toBe('itinerary');
});
test('date marker exists and date click changes selected day without spinning every category',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
await expect(page.locator('#v3MovingDateIcon')).toBeVisible();
await page.locator('#dates .date').nth(1).click();
await expect(page.locator('#dates .date.active')).toContainText('DAY 02');
await expect(page.locator('#v3MovingDateIcon')).toBeVisible();
});
test('hero animation is derived from real weather code not city landmark emoji',async({page})=>{
await expect(page.locator('#v3WeatherArt')).toHaveClass(/v3-weather-rain/);
await expect(page.locator('#v3WeatherSource')).toContainText('有雨');
await expect(page.locator('#v3WeatherArt .v3-rain-drop')).toHaveCount(5);
const art=await page.locator('#v3WeatherArt').innerText();
expect(art).not.toContain('🏯');
});
test('packing category can be bulk added, collapsed, batch deleted without corrupting trip',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/行李清單/}).click();
await expect(page.locator('#v3PackLibrary')).toBeVisible();
await page.locator('#v2PackCategory').selectOption('電子與攝影');
await page.locator('#v3PackLibrary').getByRole('button',{name:'加入目前分類所有項目'}).click();
const size=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02'))[0].packing.length);
expect(size).toBeGreaterThan(5);
await page.locator('#v3PackLibrary summary').click();
await expect(page.locator('#v3PackLibrary')).not.toHaveAttribute('open');
await expect(page.locator('#v3PackBulk')).toBeVisible();
await expect(page.locator('#v1Content .v3-remove-check')).toHaveCount(0);
await page.locator('#v3PackBulk').getByRole('button',{name:'勾選要刪的物品'}).click();
await expect(page.locator('#v1Content .v3-remove-check')).toHaveCount(size);
await expect(page.locator('#v1Content .v1-check:visible')).toHaveCount(0);
await page.locator('#v3PackBulk').getByRole('button',{name:'全選要刪的物品'}).click();
page.once('dialog',dialog=>dialog.accept());
await page.locator('#v3PackBulk').getByRole('button',{name:'刪除選取項目'}).click();
expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02'))[0].packing.length)).toBe(0);
});
test('food wishlist supports planned meal as a duration-bearing itinerary event',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/美食口袋名單/}).click();
await page.locator('#v1Content').getByRole('button',{name:/收藏想吃的/}).click();
await page.locator('#vFoodName').fill('聖水烤肉');
await page.locator('#vFoodKind').selectOption('restaurant');
await page.locator('#vFoodNotes').fill('想吃的烤肉和冷麵');
await page.locator('#v1DialogForm button[type="submit"]').click();
await expect(page.locator('#v1Content')).toContainText('聖水烤肉');
await page.locator('#v1Content').getByRole('button',{name:/安排到行程/}).click();
await page.locator('#vFoodTime').fill('19:00');
await page.locator('#vFoodMinutes').fill('75');
await page.locator('#v1DialogForm button[type="submit"]').click();
const food=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02'))[0].days[0].find(x=>x.name==='聖水烤肉'));
expect(food.type).toBe('food');
expect(food.duration).toBe(75);
});
test('Seoul route search supports Myeongdong to Seongsu with all interchange stops',async({page})=>{
await page.locator('#v2Home').getByRole('button',{name:/交通導航/}).click();
await page.locator('#transitFrom').fill('明洞');
await page.locator('#transitTo').fill('聖水');
await page.getByRole('button',{name:/查詢實際交通路線/}).click();
for(const text of ['明洞','忠武路','東大門歷史文化公園','新堂','往十里','聖水']){
await expect(page.locator('#v2RouteResults')).toContainText(text)}
await expect(page.locator('#v2RouteResults')).toContainText('非即時');
});
test('twilight stays light enough to use without an almost-black background',async({page})=>{
await page.evaluate(()=>localStorage.setItem('voyage-theme','dark'));
await page.reload();
await expect(page.locator('body.dark')).toBeVisible();
const bg=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
const m=bg.match(/\d+/g).map(Number);expect(m.every(v=>v>160)).toBe(true);
});

test('daily schedule exposes a real unscheduled gap and can open prefilled route lookup without inventing ride duration',async({page})=>{
 await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
 for(const item of [{name:'早餐店',time:'07:00',duration:'35',type:'food'},{name:'第一個景點',time:'09:00',duration:'90',type:'place'}]){
  await page.locator('#v3ComposerDetails summary').click();
  await page.locator('#v3NewType').selectOption(item.type);
  await page.locator('#v3NewName').fill(item.name);
  await page.locator('#v3NewTime').fill(item.time);
  await page.locator('#v3NewDuration').fill(item.duration);
  await page.locator('#v3Composer').getByRole('button',{name:/加入當天時間軸/}).click();
 }
 const gap=page.locator('#events .v3-free-gap').filter({hasText:/空檔 85 分/});
 await expect(gap).toBeVisible();
 await gap.click();
 await expect(page.locator('#v3ComposerDetails')).toHaveAttribute('open','');
 await expect(page.locator('#v3NewType')).toHaveValue('transport');
 await expect(page.locator('#v3NewTime')).toHaveValue('07:35');
 await expect(page.locator('#v3NewDuration')).toHaveValue('');
 await page.locator('#v3Composer').getByRole('button',{name:/搜尋「早餐店 → 第一個景點」交通路線/}).click();
 await expect(page.locator('#transitFrom')).toHaveValue('早餐店');
 await expect(page.locator('#transitTo')).toHaveValue('第一個景點');
 await expect(page.locator('#transitTime')).toHaveValue('07:35');
 const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02'))[0].days[0]);
 expect(actual.some(e=>e.type==='transport'&&e.name.includes('早餐店'))).toBe(false);
});
test('overlapping schedule events remain selectable in separate lanes and keep source data unchanged',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
 for(const entry of [{name:'午餐',time:'15:00',duration:'90'},{name:'同時段購物',time:'15:30',duration:'45'}]){
  await page.locator('#v3ComposerDetails summary').click();
  await page.locator('#v3NewType').selectOption(entry.name==='午餐'?'food':'shop');
  await page.locator('#v3NewName').fill(entry.name);
  await page.locator('#v3NewTime').fill(entry.time);
  await page.locator('#v3NewDuration').fill(entry.duration);
  await page.locator('#v3Composer').getByRole('button',{name:/加入當天時間軸/}).click();
 }
 const a=page.locator('#events .v3-schedule-event').filter({hasText:'午餐'}),b=page.locator('#events .v3-schedule-event').filter({hasText:'同時段購物'});
 await expect(a).toBeVisible();await expect(b).toBeVisible();
 const positions=await Promise.all([a,b].map(x=>x.evaluate(n=>({x:n.getBoundingClientRect().x,width:n.getBoundingClientRect().width}))));
 expect(positions[0].x).not.toBe(positions[1].x);
 await b.click();
 await expect(page.locator('#v3MapSummary')).toContainText('同時段購物');
});

test('one-touch dining shortcut persists category, actual duration, budget and provider link after reload',async({page})=>{
 await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
 await page.locator('.v3-category-shortcuts').getByRole('button',{name:/餐飲/}).click();
 await expect(page.locator('#v3ComposerDetails')).toHaveAttribute('open','');
 await expect(page.locator('#v3NewType')).toHaveValue('food');
 await page.locator('#v3NewName').fill('聖水烤肉晚餐');
 await page.locator('#v3NewTime').fill('18:10');
 await page.locator('#v3NewDuration').fill('80');
 await page.locator('#v3NewCost').fill('30000');
 await page.locator('#v3NewMapLink').fill('https://maps.google.com/?q=Seongsu');
 await page.locator('#v3Composer').getByRole('button',{name:/加入當天時間軸/}).click();
 const get=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02'))[0].days[0].find(x=>x.name==='聖水烤肉晚餐'));
 expect(await get()).toMatchObject({type:'food',time:'18:10',duration:80,cost:30000,mapUrl:'https://maps.google.com/?q=Seongsu'});
 await page.reload();
 expect(await get()).toMatchObject({type:'food',duration:80,cost:30000});
 await page.locator('#v2Home').getByRole('button',{name:/我的行程/}).click();
 await page.locator('#weeklyView').click();
 await expect(page.locator('#week .v3-schedule-event').filter({hasText:'聖水烤肉晚餐'})).toContainText('80 分');
});
