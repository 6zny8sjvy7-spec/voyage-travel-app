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
