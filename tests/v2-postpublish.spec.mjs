import {test,expect} from "@playwright/test";
import {readFileSync} from "node:fs";
const pageUrl="https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/";
const leaflet=readFileSync(new URL("./leaflet-stub.js",import.meta.url),"utf8");
test.beforeEach(async({page})=>{
 await page.route("**/leaflet.js",r=>r.fulfill({status:200,contentType:"application/javascript",body:leaflet}));
 await page.route("**/leaflet.css",r=>r.fulfill({status:200,contentType:"text/css",body:""}));
 await page.route("**/api.open-meteo.com/**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({current:{temperature_2m:24,weather_code:1,is_day:1},daily:{sunrise:["2026-11-14T06:00"],sunset:["2026-11-14T18:00"]}})}));
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#v2Home")).toBeVisible();
});
test("actual public URL serves the audited zero-cost official Thai stop sequence (Siam to Asok four stops)",async({page})=>{
 const result=await page.evaluate(async()=>{
  const api=window.VoyageTransitV5,staticData=window.VoyageThaiOTP;
  if(!api||!staticData)return null;
  const trip={id:"qa",country:"泰國",countryCode:"TH",city:"曼谷",lat:13.7563,lon:100.5018,tz:"Asia/Bangkok"};
  const ref=await api.plan("Siam","Asok",trip,{time:"2026-11-19T09:20:00+07:00"});
  return{kind:ref[0].kind,ids:ref[0].legs[0].stations.map(x=>x.id),count:ref[0].legs[0].stationCount,line:ref[0].legs[0].line,realtime:ref[0].hasRealtime,minutes:ref[0].minutes,source:ref[0].source};
 });
 expect(result).not.toBeNull();
 expect(result.kind).toBe("otp-th-static");
 expect(result.ids).toEqual(["12","28","27","26","25"]);
 expect(result.count).toBe(4);
 expect(result.line).toBe("BTS Sukhumvit");
 expect(result.realtime).toBe(false);
 expect(result.minutes).toBeNull();
 expect(result.source).toContain("OTP");
});
test("actual public URL retains full V7 trip, fee, calendar map and duplicate-free packing after latest release",async({page})=>{
 await expect(page.locator('.footnav [data-tablink="expenses"]')).toHaveCount(1);
 await expect(page.locator('.footnav [data-tablink="map"]')).toHaveCount(0);
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#v3InlineMap")).toBeVisible();
 await page.locator("#weeklyView").click();
 await expect(page.locator("#week .v3-grid-viewport")).toBeVisible();
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await expect(page.locator("#v1Content")).toContainText("已記帳台幣");
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/行李清單/}).click();
 await expect(page.locator("#v3PackLibrary")).toHaveCount(1);
 await expect(page.getByRole("button",{name:"縮小清單"})).toHaveCount(0);
 await expect(page.getByRole("button",{name:"展開選擇"})).toHaveCount(0);
});
test("actual public URL has a genuinely dark mobile and desktop night palette after CSS transition",async({page})=>{
 await page.evaluate(()=>localStorage.setItem("voyage-theme-v2-review-20261112","dark"));
 await page.reload();
 await expect(page.locator("body.dark")).toHaveCount(1);
 const lum=x=>{const m=x.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);return m?Number(m[1])*.2126+Number(m[2])*.7152+Number(m[3])*.0722:NaN};
 const read=()=>page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,hero:getComputedStyle(document.querySelector("#v2Home .v2-home-hero")).backgroundImage}));
 await expect.poll(async()=>lum((await read()).body),{timeout:4000}).toBeLessThan(65);
 const v=await read();expect(v.hero).toMatch(/gradient/);
});

test("actual public URL serves officially verified Japanese and Vietnamese station sequences without false realtime",async({page})=>{
 const results=await page.evaluate(async()=>{
  const api=window.VoyageTransitV5;
  if(!api||!window.VoyageRailReferenceV1)return null;
  const jp=await api.plan("銀座駅","浅草駅",{id:"qa-jp",country:"日本",countryCode:"JP",city:"東京",tz:"Asia/Tokyo"},{time:"2026-11-19T10:00:00+09:00"});
  const vn=await api.plan("Bến Thành","Bến xe Suối Tiên",{id:"qa-vn",country:"越南",countryCode:"VN",city:"胡志明市",tz:"Asia/Ho_Chi_Minh"},{time:"2026-11-19T10:00:00+07:00"});
  const sample=v=>({kind:v[0].kind,count:v[0].legs[0].stationCount,ids:v[0].legs[0].stations.map(s=>s.id),local:v[0].legs[0].stations.map(s=>s.local),headsign:v[0].legs[0].headsign,minutes:v[0].minutes,realtime:v[0].hasRealtime});
  return{jp:sample(jp),vn:sample(vn)};
 });
 expect(results).not.toBeNull();
 expect(results.jp.kind).toBe("official-static-reference");
 expect(results.jp.count).toBe(10);
 expect(results.jp.ids[0]).toBe("G09");
 expect(results.jp.ids.at(-1)).toBe("G19");
 expect(results.jp.headsign).toContain("浅草");
 expect(results.jp.realtime).toBe(false);
 expect(results.jp.minutes).toBeNull();
 expect(results.vn.kind).toBe("official-static-reference");
 expect(results.vn.count).toBe(13);
 expect(results.vn.ids).toHaveLength(14);
 expect(results.vn.local[0]).toBe("Bến Thành");
 expect(results.vn.local.at(-1)).toBe("Bến xe Suối Tiên");
 expect(results.vn.realtime).toBe(false);
 expect(results.vn.minutes).toBeNull();
});

test("actual public URL has Japanese G19 and Vietnam Metro Line 1 13-stop direction verified routes",async({page})=>{
 const routes=await page.evaluate(async()=>{
  const jp={country:"日本",countryCode:"JP",city:"東京",tz:"Asia/Tokyo",lat:35.681,lon:139.767},
        vn={country:"越南",countryCode:"VN",city:"胡志明市",tz:"Asia/Ho_Chi_Minh",lat:10.823,lon:106.63};
  const j=(await window.VoyageTransitV5.plan("銀座站","浅草駅",jp,{time:"2026-11-19T10:00:00+09:00"}))[0],
        v=(await window.VoyageTransitV5.plan("Bến Thành","Bến xe Suối Tiên",vn,{time:"2026-11-19T10:00:00+07:00"}))[0];
  return{staticPresent:!!window.VoyageRailReferenceV1,
    j:{kind:j.kind,stations:j.legs[0].stations.map(x=>x.id),count:j.legs[0].stationCount,headsign:j.legs[0].headsign,minutes:j.minutes,realtime:j.hasRealtime},
    v:{kind:v.kind,stations:v.legs[0].stations.map(x=>x.name),count:v.legs[0].stationCount,headsign:v.legs[0].headsign,minutes:v.minutes,realtime:v.hasRealtime}};
 });
 expect(routes.staticPresent).toBe(true);
 expect(routes.j.kind).toBe("official-static-reference");
 expect(routes.j.stations).toEqual(["G09","G10","G11","G12","G13","G14","G15","G16","G17","G18","G19"]);
 expect(routes.j.count).toBe(10);expect(routes.j.headsign).toContain("Asakusa");
 expect(routes.v.kind).toBe("official-static-reference");
 expect(routes.v.count).toBe(13);
 expect(routes.v.stations[0]).toBe("Bến Thành");
 expect(routes.v.stations.at(-1)).toBe("Bến xe Suối Tiên");
 expect(routes.j.minutes).toBeNull();expect(routes.v.minutes).toBeNull();
 expect(routes.j.realtime).toBe(false);expect(routes.v.realtime).toBe(false);
});
test("actual public URL has no duplicate itinerary or expense shortcut, no fake JSON invite, and photo data input retired",async({page})=>{
 await expect(page.locator('.footnav [data-tablink="expenses"]')).toHaveCount(1);
 const summaryText=await page.locator("#v1Summary").textContent();
 expect(summaryText).not.toContain("＋ 完整行程");
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:"好友共編"}).click();
 await expect(page.locator("#v1Content")).toContainText("未連線前不顯示假邀請");
 await expect(page.locator("#v1Content").getByRole("button",{name:"先分享旅行備份"})).toHaveCount(0);
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#events .v3-schedule-event").first().dblclick();
 await expect(page.locator("#v1Dialog")).toBeVisible();
 await expect(page.locator("#vEvPhoto")).toHaveCount(0);
});
