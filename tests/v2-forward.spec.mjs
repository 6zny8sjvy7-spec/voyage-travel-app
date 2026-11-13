import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
const leaflet=readFileSync(new URL("./leaflet-stub.js",import.meta.url),"utf8");
test.beforeEach(async({page})=>{
 await page.route("**/leaflet.js",r=>r.fulfill({status:200,contentType:"application/javascript",body:leaflet}));
 await page.route("**/leaflet.css",r=>r.fulfill({status:200,contentType:"text/css",body:""}));
 await page.route("**/api.open-meteo.com/**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({current:{temperature_2m:24,weather_code:1,is_day:1,time:"2026-11-13T10:00"},daily:{sunrise:["2026-11-13T06:00"],sunset:["2026-11-13T18:00"]}})}));
 await page.goto("/v2-review-20261112/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#v2Home")).toBeVisible();
});
test("bottom map is replaced with operational expense page, and no standalone map link remains",async({page})=>{
 const nav=page.locator(".footnav [data-tablink]");
 await expect(nav).toHaveCount(5);
 await expect(page.locator('.footnav [data-tablink="map"]')).toHaveCount(0);
 await expect(page.locator('.footnav [data-tablink="expenses"]')).toHaveCount(1);
 await expect(page.locator("#v2Home .v2-link").filter({hasText:"旅行地圖"})).toHaveCount(0);
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await expect(page.locator("body")).toHaveAttribute("data-tab","expenses");
 await expect(page.locator("#v1More")).toBeVisible();
 await expect(page.locator("#v1Content")).toContainText("已記帳台幣");
 await expect(page.locator("#v1Content")).toContainText("旅程預算");
 await expect(page.locator("#v1Content")).toContainText("剩餘預算");
 await expect(page.locator("#v1Content")).toContainText("最新公開參考匯率");
 await expect(page.locator("#v1Content").getByRole("button",{name:/新增費用/})).toBeVisible();
 await expect(page.locator("#mapSection")).toBeHidden();
 await page.locator('.footnav [data-tablink="more"]').click();
 await expect(page.locator("body")).toHaveAttribute("data-tab","more");
 await expect(page.locator("#v1More")).toBeVisible();
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await expect(page.locator("#v1Content")).toContainText("已記帳台幣");
});
test("expense entry persists across reload without overwriting old trips",async({page})=>{
 const key="voyage-v2-review-20261112";
 const original=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0].days.map(x=>x.map(e=>e.name)),key);
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await page.locator("#v1Content").getByRole("button",{name:/新增費用/}).click();
 await expect(page.locator("#v1Dialog")).toBeVisible();
 await page.locator("#vExTitle").fill("測試地鐵票");
 await page.locator("#vExAmount").fill("150");
 await page.locator("#vExCurrency").selectOption("TWD");
 await page.locator("#vExRate").fill("1");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await expect(page.locator("#v1Dialog")).toBeHidden();
 await expect(page.locator("#v1Content")).toContainText("測試地鐵票");
 await page.reload();
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await expect(page.locator("#v1Content")).toContainText("測試地鐵票");
 const trip=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],key);
 expect(trip.expenses.some(e=>e.title==="測試地鐵票"&&e.amount===150&&e.currency==="TWD")).toBe(true);
 expect(trip.days.map(x=>x.map(e=>e.name))).toEqual(original);
 expect(await page.evaluate(()=>localStorage.getItem("voyage-v02"))).toBeNull();
});
test("itinerary still has embedded map and existing date/edit flow; old map route cannot reopen",async({page})=>{
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#itinerary")).toBeVisible();
 await expect(page.locator("#v3InlineMap")).toBeVisible();
 await expect(page.locator("#mapSection")).toBeHidden();
 const scene=page.locator("#events .v3-schedule-event").filter({hasText:"景福宮"}).first();
 await expect(scene).toBeVisible();
 await scene.click();
 await expect(page.locator("#v3MapSummary")).toContainText("景福宮");
 await page.evaluate(()=>setTab("map"));
 await expect(page.locator("body")).toHaveAttribute("data-tab","itinerary");
 await expect(page.locator("#mapSection")).toBeHidden();
});

test("published fixed review URL serves the same approved expense navigation",async({page})=>{
 await page.goto("https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#v2Home")).toBeVisible();
 await expect(page.locator('.footnav [data-tablink="expenses"]')).toHaveCount(1);
 await expect(page.locator('.footnav [data-tablink="map"]')).toHaveCount(0);
 await expect(page.locator("#v2Home .v2-link").filter({hasText:"旅行地圖"})).toHaveCount(0);
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await expect(page.locator("body")).toHaveAttribute("data-tab","expenses");
 await expect(page.locator("#v1Content")).toContainText("已記帳台幣");
 await expect(page.locator("#v1Content")).toContainText("最新公開參考匯率");
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#v3InlineMap")).toBeVisible();
 await expect(page.locator("#mapSection")).toBeHidden();
});


test("approved animated country landmark remains distinct from weather and works in both widths",async({page})=>{
 await expect(page.locator(".hero-art span").first()).toBeVisible();
 await expect(page.locator("#v2Home .v2-big-icon")).toContainText("🏯");
 await expect(page.locator(".hero .glass")).toBeVisible();
 const boxes=await page.evaluate(()=>{
  const a=document.querySelector(".hero-art").getBoundingClientRect(),
        b=document.querySelector(".hero .glass").getBoundingClientRect();
  return {overlap:Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))};
 });
 expect(boxes.overlap).toBeLessThan(30);
});
test("only one expandable activity composer and single click map, double click edit",async({page})=>{
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator(".v3-category-shortcuts")).toHaveCount(0);
 await expect(page.locator("#v3ComposerDetails")).toHaveCount(1);
 await expect(page.locator("#v3ComposerDetails")).not.toHaveAttribute("open","");
 await page.locator("#v3ComposerDetails summary").click();
 await expect(page.locator("#v3Composer")).toBeVisible();
 const scene=page.locator("#events .v3-schedule-event").filter({hasText:"景福宮"}).first();
 await expect(scene.locator(".v3-edit-mini")).toHaveCount(0);
 await scene.click();
 await expect(page.locator("#v3MapSummary")).toContainText("景福宮");
 await scene.dblclick();
 await expect(page.locator("#v1Dialog")).toBeVisible();
 await page.locator("#v1Cancel").click();
 await page.locator("#weeklyView").click();
 const week=page.locator("#week .v3-schedule-event").filter({hasText:"景福宮"}).first();
 await expect(week).toBeVisible();
 await expect(week.locator(".v3-edit-mini")).toHaveCount(0);
 await week.dblclick();
 await expect(page.locator("#v1Dialog")).toBeVisible();
});
test("transport composer changes fields for walking rail taxi bus and saves the route endpoints",async({page})=>{
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("transport");
 await expect(page.locator("#v3TransportMode")).toBeVisible();
 for(const mode of ["walk","rail","taxi","bus","flight"]){
  await page.locator("#v3TransportMode").selectOption(mode);
  if(mode==="rail")await expect(page.getByRole("button",{name:/查詢 A→B 的站名/})).toBeVisible();
  if(mode==="flight")await expect(page.getByRole("button",{name:/輸入航班號/})).toBeVisible();
 }
 await page.locator("#v3TransportMode").selectOption("walk");
 await page.locator("#v3NewFrom").fill("A 飯店");
 await page.locator("#v3NewTo").fill("B 車站");
 await page.locator("#v3NewTime").fill("13:40");
 await page.locator("#v3NewDuration").fill("18");
 await page.getByRole("button",{name:"加入當天時間軸"}).click();
 const t=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0]);
 const entry=t.days.flat().find(x=>x.from==="A 飯店"&&x.to==="B 車站");
 expect(entry).toBeTruthy();expect(entry.transportMode).toBe("walk");expect(entry.duration).toBe(18);
 expect(entry.source).toMatch(/尚未驗證路線、搭乘方向及站序/);
});
test("flight from itinerary uses complete linked local dates/times; invalid arrival is explained",async({page})=>{
 await page.locator("#v2Home").getByRole("button",{name:"旅行設定"}).click();
 await page.locator("#vTripDate").fill("2026-11-26");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("transport");
 await page.locator("#v3TransportMode").selectOption("flight");
 await expect(page.getByRole("button",{name:/輸入航班號/})).toBeVisible();
 await expect(page.getByRole("button",{name:"加入當天時間軸"})).toBeHidden();
 await page.getByRole("button",{name:/輸入航班號/}).click();
 await expect(page.locator("#v1Dialog")).toBeVisible();
 for(const id of ["vBFlight","vBFromCountry","vBToCountry","vBDepartDate","vBDepartTime","vBArriveDate","vBArriveTime"]){
  await expect(page.locator("#"+id)).toBeVisible();
 }
 const date=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0].startDate);
 expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
 await page.locator("#vBFlight").fill("IT-ABC");
 await page.locator("#vBFromCountry").selectOption("TW");
 await page.locator("#vBToCountry").selectOption("KR");
 await page.locator("#vBFrom").fill("高雄");
 await page.locator("#vBTo").fill("首爾");
 await page.locator("#vBDepartDate").fill(date);
 await page.locator("#vBArriveDate").fill(date);
 await page.locator("#vBDepartTime").fill("19:00");
 await page.locator("#vBArriveTime").fill("16:00");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await expect(page.locator("#v1DialogWarning")).toContainText("抵達日期");
 await expect(page.locator("#v1Dialog")).toBeVisible();
 await page.locator("#vBArriveTime").fill("23:00");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await expect(page.locator("#v1Dialog")).toBeHidden();
 const t=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0]);
 expect(t.documents.some(d=>d.name==="IT-ABC"&&d.departDate===date&&d.arriveDate===date)).toBe(true);
 expect(t.days.flat().some(d=>d.linkedDocumentId&&d.name.includes("IT-ABC"))).toBe(true);
});
test("A-to-B lookup only states exact stop count with complete source, shows direction and matching arrival",async({page})=>{
 await page.route("**/api/v1/geocode**",r=>{
  const query=new URL(r.request().url()).searchParams.get("text")||"";
  const a=query.includes("A站");
  return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify([{id:a?"A_STOP":"B_STOP",name:a?"A站":"B站",country:"KR",lat:a?37.565:37.575,lon:a?126.975:126.985}])});
 });
 await page.route("**/api/v6/plan**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({itineraries:[{duration:600,legs:[{mode:"SUBWAY",displayName:"Line 1",headsign:"Toward B",from:{name:"A站"},intermediateStops:[{name:"中間站"}],to:{name:"B站"},duration:600}]}]})}));
 await page.route("**/api/v6/stoptimes**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({stopTimes:[
  {displayName:"Line 1",headsign:"Wrong Direction",realTime:true,place:{name:"A站",departure:new Date(Date.now()+60000).toISOString(),departureTimestampReason:"PREDICTED"}},
  {displayName:"Line 1",headsign:"Toward B",realTime:true,place:{name:"A站",departure:new Date(Date.now()+240000).toISOString(),departureTimestampReason:"PREDICTED"}}
 ]})}));
 await page.locator('.footnav [data-tablink="transport"]').click();
 await page.locator("#transitFrom").fill("A站");await page.locator("#transitTo").fill("B站");
 await page.getByRole("button",{name:/查詢實際交通路線/}).click();
 await expect(page.locator("#v2RouteResults")).toContainText("共 2 站");
 await expect(page.locator("#v2RouteResults")).toContainText("搭乘方向：Toward B");
 await expect(page.locator("#v2RouteResults")).toContainText("中間站");
 await expect(page.locator("#v5DepartureResult")).toContainText("Toward B");
 await expect(page.locator("#v5DepartureResult")).not.toContainText("Wrong Direction");
 await expect(page.locator("#rideMode")).toBeHidden();
 await expect(page.locator("#v2GpsAssist")).toHaveCount(0);
});


test("V2 forward desktop/iPhone visual screenshots: home, night, itinerary, collapsed editor",async({page},testInfo)=>{
 mkdirSync("visual-evidence",{recursive:true});
 const id=testInfo.project.name.replace(/[^a-z0-9]/gi,"-").toLowerCase();
 await page.screenshot({path:"visual-evidence/"+id+"-home-day.png",fullPage:true});
 const width=await page.evaluate(()=>({content:document.documentElement.scrollWidth,window:innerWidth}));
 expect(width.content).toBeLessThanOrEqual(width.window+5);
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#v3ComposerDetails")).not.toHaveAttribute("open","");
 await page.screenshot({path:"visual-evidence/"+id+"-itinerary-collapsed.png",fullPage:true});
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("transport");
 await page.locator("#v3TransportMode").selectOption("rail");
 await page.screenshot({path:"visual-evidence/"+id+"-transport-form.png",fullPage:true});
 await page.evaluate(()=>localStorage.setItem("voyage-theme-v2-review-20261112","dark"));
 await page.reload();
 await expect(page.locator("body.dark")).toBeVisible();
 await page.screenshot({path:"visual-evidence/"+id+"-home-night.png",fullPage:true});
});

test("published URL overhaul smoke: one composer, touch edit, flight entry, currency labels, translation country",async({page})=>{
 await page.goto("https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#v2Home")).toBeVisible();
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#v3ComposerDetails")).toHaveCount(1);
 await expect(page.locator(".v3-category-shortcuts")).toHaveCount(0);
 await expect(page.locator("#events .v3-edit-mini")).toHaveCount(0);
 const item=page.locator("#events .v3-schedule-event").filter({hasText:"景福宮"}).first();
 await item.dblclick();
 await expect(page.locator("#v1Dialog")).toBeVisible();
 await page.locator("#v1Cancel").click();
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("transport");
 await page.locator("#v3TransportMode").selectOption("flight");
 await expect(page.getByRole("button",{name:/輸入航班號/})).toBeVisible();
 await page.getByRole("button",{name:/輸入航班號/}).click();
 await expect(page.locator("#vBDepartDate")).toBeVisible();
 await expect(page.locator("#vBArriveDate")).toBeVisible();
 await page.locator("#v1Cancel").click();
 await page.locator('.footnav [data-tablink="expenses"]').click();
 await page.locator("#v1Content").getByRole("button",{name:/新增費用/}).click();
 await expect(page.locator("#vExCurrency option[value=KRW]")).toContainText("韓國");
 await page.locator("#v1Cancel").click();
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:"翻譯"}).click();
 await expect(page.locator("#vLanguage")).toHaveValue("ko");
});

test("pasted Apple Notes with no dates survive reload and become editable dated itinerary items",async({page})=>{
 await page.locator("#v2Home").getByRole("button",{name:"旅行設定"}).click();
 await page.locator("#vTripDate").fill("2026-11-19");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/匯入/}).click();
 await expect(page.locator("#v6NotesPaste")).toBeVisible();
 await page.locator("#v6NotesPaste").fill("明洞逛街\n聖水洞");
 await page.getByRole("button",{name:"預覽貼上的地點"}).click();
 const rows=page.locator("#v6ImportPreview .v6-import-card");
 await expect(rows).toHaveCount(2);
 await expect(rows.first().locator('input[type="date"]')).toHaveValue("");
 await expect(rows.first().locator('input[type="time"]')).toHaveValue("");
 await page.getByRole("button",{name:"儲存勾選項目"}).click();
 await expect(page.locator("#v6UnplannedBox .v6-import-card")).toHaveCount(2);
 let trip=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0]);
 expect(trip.unplannedEvents.map(x=>x.name)).toEqual(["明洞逛街","聖水洞"]);
 expect(trip.days.flat().filter(x=>x.name==="明洞逛街")).toHaveLength(0); // 聖水洞 is already an original demo itinerary item, which must remain unchanged.
 await page.reload();
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/匯入/}).click();
 await expect(page.locator("#v6UnplannedBox .v6-import-card")).toHaveCount(2);
 const first=page.locator("#v6UnplannedBox .v6-import-card").first();
 await first.locator('input[type="date"]').fill("2026-11-19");
 await first.locator('input[type="time"]').fill("14:00");
 await first.getByRole("button",{name:"排入指定日期"}).click();
 trip=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0]);
 expect(trip.days[0].some(x=>x.name==="明洞逛街"&&x.time==="14:00")).toBe(true);
 expect(trip.unplannedEvents.some(x=>x.name==="聖水洞")).toBe(true);
 expect(trip.unplannedEvents.some(x=>x.name==="明洞逛街")).toBe(false);
});
test("free in-app bus route choices show precise different boarding stops, directions and stop counts",async({page})=>{
 await page.route("**/api/v1/geocode**",r=>{
  const q=new URL(r.request().url()).searchParams.get("text")||"";
  const a=q.includes("A站");
  return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify([{id:a?"A_STOP":"B_STOP",name:a?"A站":"B站",country:"KR",lat:a?37.565:37.575,lon:a?126.975:126.985}])});
 });
 const names=(n,index)=>Array.from({length:n},(_,j)=>({name:"第"+index+"線中間"+(j+1)+"站"}));
 const legs=[["12","往中央車站",3,"百貨公司站"],["48","往東門",6,"商圈東門站"],["99","往市場",2,"市場路口站"]].map(([line,headsign,middle,alight])=>({mode:"BUS",displayName:line,headsign,from:{name:"A站"},intermediateStops:names(middle,line),to:{name:alight},duration:480+middle*60}));
 await page.route("**/api/v6/plan**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({itineraries:legs.map(l=>({duration:l.duration,legs:[l]}))})}));
 await page.route("**/api/v6/stoptimes**",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({stopTimes:[]})}));
 await page.locator('.footnav [data-tablink="transport"]').click();
 await page.locator(".v5-mode-switch").getByRole("button",{name:/公車/}).click();
 await page.locator("#transitFrom").fill("A站");await page.locator("#transitTo").fill("B站");
 await page.getByRole("button",{name:/查詢實際交通路線/}).click();
 const options=page.locator(".v6-route-choice");
 await expect(options).toHaveCount(3);
 await expect(page.locator("#v6SelectedRoute")).toContainText("共 4 站");
 await expect(page.locator("#v6SelectedRoute")).toContainText("往中央車站");
 await expect(options.first()).toContainText("下車：百貨公司站");
 await options.nth(1).click();
 await expect(page.locator("#v6SelectedRoute")).toContainText("共 7 站");
 await expect(page.locator("#v6SelectedRoute")).toContainText("48");
 await expect(page.locator("#v6SelectedRoute")).toContainText("往東門");
 await expect(options.nth(1)).toContainText("下車：商圈東門站");
 await options.nth(2).click();
 await expect(page.locator("#v6SelectedRoute")).toContainText("共 3 站");
 await expect(page.locator("#v6SelectedRoute")).toContainText("99");
 await expect(page.locator("#v6SelectedRoute")).toContainText("往市場");
 await expect(options.nth(2)).toContainText("下車：市場路口站");
 await expect(page.locator("#transportSection").getByRole("button",{name:/Google Maps|NAVER 路線/})).toHaveCount(0);
});
test("flight ticket yields only one continuous linked event, never adds a fake arrival or gap",async({page})=>{
 await page.locator("#v2Home").getByRole("button",{name:"旅行設定"}).click();
 await page.locator("#vTripDate").fill("2026-11-19");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("transport");
 await page.locator("#v3TransportMode").selectOption("flight");
 await page.getByRole("button",{name:/輸入航班號/}).click();
 await page.locator("#vBFlight").fill("IT662");
 await page.locator("#vBFromCountry").selectOption("TW");
 await page.locator("#vBToCountry").selectOption("KR");
 await page.locator("#vBFrom").fill("高雄機場");
 await page.locator("#vBTo").fill("金浦機場");
 await page.locator("#vBDepartDate").fill("2026-11-19");
 await page.locator("#vBDepartTime").fill("17:55");
 await page.locator("#vBArriveDate").fill("2026-11-19");
 await page.locator("#vBArriveTime").fill("20:25");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await expect(page.locator("#v1Dialog")).toBeHidden();
 const trip=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112"))[0]);
 const doc=trip.documents.find(x=>x.name==="IT662");
 expect(doc.departTime).toBe("17:55");expect(doc.arriveTime).toBe("20:25");
 const linked=trip.days.flat().filter(x=>x.linkedDocumentId===doc.id);
 expect(linked).toHaveLength(1);
 expect(linked[0].duration).toBe(90);
 expect(linked[0].documentPhase).toBe("fullFlight");
 expect(linked[0].ticketArriveTime).toBe("20:25");
 expect(linked.every(x=>x.documentPhase!=="arrival")).toBe(true);
});

test("Bangkok Thai text trip creation works without manual English entry and preserves original trips",async({page})=>{
 const previous=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112")).length);
 const responses=["曼谷自由行","曼谷","泰國","5","2026-11-19"];
 page.on("dialog",dialog=>{
  if(dialog.type()==="prompt")void dialog.accept(responses.shift()||"");
  else void dialog.accept();
 });
 await page.locator("#v2Home").getByRole("button",{name:/規劃新旅行/}).click();
 await expect(page.locator("#tripSelect")).toContainText("曼谷自由行");
 const list=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112")));
 expect(list).toHaveLength(previous+1);
 const t=list.at(-1);
 expect(t.name).toBe("曼谷自由行");expect(t.city).toBe("曼谷");
 expect(t.country).toBe("泰國");expect(t.currency).toBe("THB");
 expect(t.needsLocation).toBe(false);expect(t.days).toHaveLength(5);
 await expect(page.locator("#v6Countdown")).toBeVisible();
 await expect(page.locator("#v2Home .v2-hero-copy")).toContainText(/距離出發|今天出發|旅行已開始/);
 await expect(page.locator("#trips #newTrip")).toBeHidden();
});

test("actual published URL: notes paste and in-app routes are deployed",async({page})=>{
 await page.goto("https://6zny8sjvy7-spec.github.io/voyage-travel-app/v2-review-20261112/",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#v6Countdown")).toBeVisible();
 await expect(page.locator("#trips #newTrip")).toBeHidden();
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/匯入/}).click();
 await expect(page.locator("#v6NotesPaste")).toBeVisible();
 await page.locator("#v6NotesPaste").fill("明洞逛街\n弘大烤肉");
 await page.getByRole("button",{name:"預覽貼上的地點"}).click();
 await expect(page.locator("#v6ImportPreview .v6-import-card")).toHaveCount(2);
 await page.locator('.footnav [data-tablink="transport"]').click();
 await expect(page.locator("#v5TransitPanel")).toBeVisible();
 await expect(page.locator("#transportSection").getByRole("button",{name:/Google Maps|NAVER 路線/})).toHaveCount(0);
 await expect(page.locator("#v2RouteResults")).toContainText("輸入起終站");
});

test("V7 all sixteen regression checks: packing has one collapse and bulk delete; no per-item remove",async({page})=>{
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/行李清單/}).click();
 await expect(page.locator("#v3PackLibrary")).toHaveCount(1);
 await expect(page.getByRole("button",{name:"縮小清單"})).toHaveCount(0);
 await expect(page.getByRole("button",{name:"展開選擇"})).toHaveCount(0);
 await expect(page.locator("#v1Content .v1-item").getByRole("button",{name:"移除",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:/勾選要刪的物品/}).click();
 await expect(page.getByRole("button",{name:/刪除選取項目/})).toBeVisible();
});
test("V7 all sixteen regression checks: one shared map is after both views and date labels are rounded",async({page})=>{
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#v3InlineMap")).toHaveCount(1);
 const positions=await page.evaluate(()=>{
  const it=document.querySelector("#itinerary"),week=document.querySelector("#week"),map=document.querySelector("#v3InlineMap");
  return{mapAfterWeek:!!(week.compareDocumentPosition(map)&Node.DOCUMENT_POSITION_FOLLOWING),dateFont:getComputedStyle(document.querySelector("#dates .date")).fontFamily};
 });
 expect(positions.mapAfterWeek).toBe(true);
 expect(positions.dateFont).toMatch(/ui-rounded|Hiragino Maru Gothic|Arial Rounded/);
});
test("V7 all sixteen regression checks: week can scroll left/right and cards don't clip on desktop or iPhone",async({page})=>{
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#weeklyView").click();
 const week=page.locator("#week .v3-grid-viewport");
 await expect(week).toBeVisible();
 const before=await week.evaluate(e=>({width:e.clientWidth,content:e.scrollWidth,overflow:getComputedStyle(e).overflowX}));
 if(before.content>before.width+50){const position=await week.evaluate(e=>{e.scrollLeft=99999;return e.scrollLeft});expect(position).toBeGreaterThan(100);const left=await week.evaluate(e=>{e.scrollLeft=0;return e.scrollLeft});expect(left).toBe(0)}else{expect(before.content).toBeLessThanOrEqual(before.width+50)}
 const card=page.locator("#week .v3-schedule-event").first();
 const heights=await card.evaluate(e=>({height:e.getBoundingClientRect().height,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflow}));
 expect(heights.height).toBeGreaterThanOrEqual(80);
 expect(heights.scroll).toBeLessThanOrEqual(heights.height+2);
});
test("V7 all sixteen regression checks: imported dated item uses same double-tap editor",async({page})=>{
 await page.locator("#v2Home").getByRole("button",{name:"旅行設定"}).click();
 await page.locator("#vTripDate").fill("2026-11-19");
 await page.locator("#v1Dialog").getByRole("button",{name:"儲存"}).click();
 await page.locator('.footnav [data-tablink="more"]').click();
 await page.locator("#v1Menu").getByRole("button",{name:/匯入/}).click();
 await page.locator("#v6NotesPaste").fill("全新測試景點");
 await page.getByRole("button",{name:"預覽貼上的地點"}).click();
 await page.locator("#v6ImportPreview .v6-import-card").first().locator('input[type="date"]').fill("2026-11-19");
 await page.locator("#v6ImportPreview .v6-import-card").first().locator('input[type="time"]').fill("13:00");
 await page.getByRole("button",{name:"儲存勾選項目"}).click();
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 const card=page.locator("#events .v3-schedule-event").filter({hasText:"全新測試景點"});
 await expect(card).toHaveCount(1);
 await card.dblclick();
 await expect(page.locator("#v1Dialog")).toBeVisible();
});

test("V7 native iPhone double tap on imported itinerary opens editor without needing long-press",async({page},testInfo)=>{
 test.skip(!testInfo.project.name.includes("iPhone"),"Touchscreen behavior is iPhone-specific");
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 const card=page.locator("#events .v3-schedule-event").filter({hasText:"景福宮"}).first();
 await expect(card).toBeVisible();
 await card.scrollIntoViewIfNeeded();
 const box=await card.boundingBox();expect(box).not.toBeNull();
 const x=box.x+box.width/2,y=box.y+Math.min(box.height/2,22);
 await page.touchscreen.tap(x,y);
 await page.touchscreen.tap(x,y);
 await expect(page.locator("#v1Dialog")).toBeVisible();
});

test("V7 trip switch and reload must preserve previous country, schedule, packing and expenses",async({page})=>{
 const initial=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112")));
 const original=initial[0];
 const responses=["曼谷出發測試","曼谷","泰國","4","2026-11-19"];
 page.on("dialog",d=>{
  if(d.type()==="prompt")void d.accept(responses.shift()||"");
  else void d.accept();
 });
 await page.locator("#v2Home").getByRole("button",{name:/規劃新旅行/}).click();
 await expect(page.locator("#tripSelect")).toContainText("曼谷出發測試");
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await page.locator("#v3ComposerDetails summary").click();
 await page.locator("#v3NewType").selectOption("place");
 await page.locator("#v3NewName").fill("暹羅站旁咖啡廳");
 await page.locator("#v3NewTime").fill("13:45");
 await page.locator("#v3NewDuration").fill("40");
 await page.getByRole("button",{name:/加入當天時間軸/}).click();
 let tripsNow=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112")));
 expect(tripsNow).toHaveLength(initial.length+1);
 expect(tripsNow.at(-1).days[0].some(e=>e.name==="暹羅站旁咖啡廳"&&e.time==="13:45")).toBe(true);
 const summarize=t=>({id:t.id,name:t.name,startDate:t.startDate,dayNames:t.days.map(day=>day.map(e=>e.name)),expenses:(t.expenses||[]).map(x=>x.title),packing:(t.packing||[]).map(x=>x.name)});
 expect(summarize(tripsNow[0])).toEqual(summarize(original));
 await page.locator("#tripSelect").selectOption("0");
 await expect(page.locator("#v2Home")).toContainText("韓國");
 await page.reload();
 await expect(page.locator("#tripSelect")).toContainText("曼谷出發測試");
 await page.locator("#tripSelect").selectOption(String(initial.length));
 await expect(page.locator("#v2Home")).toContainText("泰國");
 await page.locator('.footnav [data-tablink="itinerary"]').click();
 await expect(page.locator("#events .v3-schedule-event").filter({hasText:"暹羅站旁咖啡廳"})).toHaveCount(1);
 tripsNow=await page.evaluate(()=>JSON.parse(localStorage.getItem("voyage-v2-review-20261112")));
 expect(summarize(tripsNow[0])).toEqual(summarize(original));
});
