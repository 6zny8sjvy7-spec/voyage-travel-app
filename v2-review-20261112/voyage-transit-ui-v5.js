/* VOYAGE V5 actual departures UI, no auto-generated countdowns.
   Origin station query is explicit; categories filter real routing results only. */
(function(global){
"use strict";
const A=global.VoyageTransitV5,U=global.VoyageUI,R=global.VoyageRegionV4;
if(!A||!U)return;
const $=id=>document.getElementById(id),E=U.E,button=U.button;
const section=$("transportSection"),toolbar=section?.querySelector(".transport-panel"),result=$("v2RouteResults");
if(!section||!toolbar||!result)return;
let mode="mixed",version=0,lastCountry="",lastData=null;
const bar=E("section",{id:"v5TransitPanel",class:"v5-transit-panel"});
bar.append(E("h3",{text:"🚇 交通助手 · 不用自己猜搭乘方向"}));
const desc=E("p",{class:"v1-sub",id:"v5RegionDesc",text:"請先選擇國家／城市旅行，系統才會查詢該城市的站網。"});bar.append(desc);
const modes=E("div",{class:"v5-mode-switch",role:"group","aria-label":"交通方式"});
for(const [id,label] of [["rail","🚇 地鐵／BTS"],["bus","🚌 公車"],["mixed","🔀 綜合轉乘"]]){
 const b=button(label,()=>{mode=id;version++;lastData=null;input.value="";arrivals.textContent="已切換「"+label+"」。舊的本站班次查詢結果已清除。";refresh.disabled=false;global.VoyageRouteV2?.invalidate?.();for(const child of modes.children)child.setAttribute("aria-pressed",String(child===b));result.replaceChildren(E("p",{class:"v2-route-status",text:"已切換成「"+label+"」。請在下方輸入 A 出發站與 B 抵達站查詢。"}));},"secondary");
 b.setAttribute("aria-pressed",String(id===mode));modes.append(b);
}
bar.append(modes);
const query=E("div",{class:"v5-departure-query"});
const input=E("input",{type:"search",id:"v5DepartureStation",placeholder:"查詢車站：例如 弘大入口／Siam／Shinjuku",autocomplete:"off"});
const refresh=button("查詢此站下一班",lookup,"secondary");
query.append(E("label",{},[E("span",{text:"本站到站／發車資訊（有即時資料才標即時）"}),input]),refresh);
const arrivals=E("div",{id:"v5DepartureResult",class:"v5-departure-result",text:"輸入車站名稱，再按查詢；沒有可靠即時資料時，只顯示班表或無資料。"});
bar.append(query,arrivals,E("p",{class:"v1-sub",text:"免費開放資料：Transitous（依來源授權、資料覆蓋及可用量限制）；任何到站分鐘都是從來源回應計算，不使用固定班距假裝即時倒數。"}));
const attribution=E("p",{class:"v1-sub"},[E("span",{text:"免費交通資料：Transitous（依各城市開放範圍）。站序、班次及即時資訊不足時留在 VOYAGE 顯示限制。資料授權歸屬："}),E("a",{href:A.ATTRIBUTION,rel:"noopener noreferrer",target:"_blank",text:"公開資料來源與授權"})]);bar.append(attribution);
section.insertBefore(bar,toolbar);
function refreshCountry(){
 const t=trip(),code=R?.countryCode(t)||"",key=code+"|"+t.city+"|"+t.id;
 desc.textContent=(A.description(t)||"尚未支援")+" · 目前目的地："+(t.city||"未設定城市")+"。只查詢該城市附近的車站，不會沿用前一國交通資料。";
 if(key!==lastCountry){if(lastCountry){arrivals.textContent="已切換目的地。請重新查詢這個城市的車站或 A→B 路線。";result.replaceChildren(E("p",{class:"v2-route-status",text:"已切換目的地；前一國家的結果已清除。"}));input.value="";lastData=null;global.VoyageRouteV2?.invalidate?.()}lastCountry=key;version++}
}
async function lookup(){
 const term=input.value.trim()||$("transitFrom")?.value.trim(),t=trip(),key=[t.id,R?.countryCode(t),t.city].join("|");
 if(!term){arrivals.textContent="請先輸入站名";return}
 const generation=++version;refresh.disabled=true;
 arrivals.textContent="正在向公開站點／班表服務查詢…";
 try{
  const data=await A.departures(term,t);
  if(generation!==version||key!==[trip().id,R?.countryCode(trip()),trip().city].join("|"))return;
  lastData=data;arrivals.replaceChildren(E("strong",{text:stationName(data.station,t)+" · 查詢時間 "+new Date(data.at).toLocaleTimeString("zh-TW")}));
  if(!data.items.length){arrivals.append(E("p",{text:"此站目前沒有可驗證的下一班資料。可以修改站名、方向或稍後在 VOYAGE 重新查詢；不偽造到站分鐘。"}));return}
  const allowed=itemsForMode(data.items);
  if(!allowed.length){arrivals.append(E("p",{text:"目前沒有符合此交通方式且明確標記車種的可核實班次；不會把地鐵誤當公車。"}));return;}
  const group=E("div",{class:"v5-departure-list"});
  for(const item of allowed.slice(0,10)){
   const row=E("div",{class:"v5-departure-item"});
   const info=E("div",{},[E("b",{text:lineName(item.line,t)+" · 往 "+stationName(item.headsign,t)}),E("div",{class:"v1-sub",text:item.cancelled?"已取消":item.realtime?"即時到站／來源有標記":"僅有表定時間，非即時倒數"})]);
   const eta=E("strong",{class:item.realtime?"v5-eta-realtime":"v5-eta-schedule",text:displayTime(item,t)});
   row.append(info,eta);group.append(row)
  }
  arrivals.append(group);
  arrivals.append(E("p",{class:"v1-sub",text:"更新時間："+new Date(data.at).toLocaleString("zh-TW")+"。此結果不會持續倒數；超過 60 秒請按重新查詢。"}));
 }catch(error){
  if(generation===version)arrivals.textContent="暫無可核實的到站資料："+String(error?.message||"來源無回應")+"。可更換站點候選名稱並在 VOYAGE 重試。";
 }finally{if(generation===version)refresh.disabled=false}
}

const railModes=new Set(["RAIL","SUBWAY","SUBURBAN","TRAM","LIGHT_RAIL","MONORAIL","FUNICULAR","METRO"]);
function itemsForMode(items){
 const list=Array.isArray(items)?items:[];
 if(mode==="mixed")return list;
 return list.filter(item=>mode==="bus"?item.mode==="BUS":railModes.has(item.mode));
}
function stationName(value,t){return A.stationLabel?.(value,t)||String(value?.name||value||"站名未提供")}
function lineName(line,t){
 const txt=String(line||"路線未標示");
 if(R?.countryCode(t)==="KR"){
  const m=txt.match(/^서울\s*(\d+)\s*호선$/);
  if(m)return"首爾地鐵 "+m[1]+" 號線 · "+txt;
  if(/공항철도/.test(txt))return"機場鐵道 · "+txt;
 }
 return txt;
}
function displayTime(item,t){
 if(item.cancelled)return "班次取消";
 if(item.realtime)return item.minutes===0?"即將到站":"預計 "+item.minutes+" 分鐘";
 const time=Date.parse(item.time||"");
 if(!Number.isFinite(time))return "班表時間未提供";
 let local="";
 try{local=new Intl.DateTimeFormat("zh-TW",{timeZone:t.tz||"Asia/Taipei",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(time))}
 catch{local=new Date(time).toISOString().slice(11,16)}
 return "表定 "+local;
}
function sameService(a,b){
 // Never attach a departure from a different line or opposite direction.
 const norm=x=>String(x||"").toLocaleLowerCase().replaceAll(" ","").replaceAll("·","").replaceAll("（","").replaceAll("）","").replaceAll("(","").replaceAll(")","").replaceAll("-","");
 const x=norm(a),y=norm(b);
 return !!x&&!!y&&(x===y);
}
async function lookupForRoute(from,t,route){
 const first=route?.legs?.find(l=>!["WALK","BIKE","CAR"].includes(l.mode));
 const key=[t.id,R?.countryCode(t),t.city].join("|"),generation=++version;
 input.value=from||"";
 if(!first||!first.line||!first.headsign||first.directionVerified===false){
  arrivals.textContent="此路線的車次或方向資料不完整，不能查證相符的進站分鐘；請看上方官方資料來源。";
  return;
 }
 arrivals.textContent="正在查詢 A 站「"+from+"」的 "+first.line+"／"+first.headsign+" 班次…";
 refresh.disabled=true;
 try{
  const data=await A.departures(from,t);
  if(generation!==version||key!==[trip().id,R?.countryCode(trip()),trip().city].join("|"))return;
  const matches=itemsForMode(data.items).filter(item=>!item.cancelled&&sameService(item.line,first.line)&&sameService(item.headsign,first.headsign)).sort((a,b)=>a.minutes-b.minutes);
  arrivals.replaceChildren(E("strong",{text:"A 站 · "+stationName(data.station,t)+" · "+lineName(first.line,t)+" · 往 "+stationName(first.headsign,t)}));
  if(!matches.length){
   arrivals.append(E("p",{class:"v1-sub",text:"未取得可確認同一路線及同方向的列車進站資訊。不能把其他線路的班次當成這班車，也不會猜測分鐘數。"}));
   return;
  }
  const group=E("div",{class:"v5-departure-list"});
  for(const item of matches.slice(0,5)){
   const row=E("div",{class:"v5-departure-item"});
   row.append(E("div",{},[E("b",{text:lineName(item.line,t)+" · 往 "+stationName(item.headsign,t)}),E("div",{class:"v1-sub",text:item.realtime?"來源標示即時到站":"時刻表預估，非即時"})]),E("strong",{class:item.realtime?"v5-eta-realtime":"v5-eta-schedule",text:displayTime(item,t)}));
   group.append(row);
  }
  arrivals.append(group,E("p",{class:"v1-sub",text:"查詢時間："+new Date(data.at).toLocaleString("zh-TW")+"。不是持續即時倒數；資訊過期請重新搜尋 A→B。"}));
 }catch(error){
  if(generation===version)arrivals.textContent="本次無法核對 A 站同線同方向的班次："+String(error?.message||"資料來源無回應")+"。";
 }finally{if(generation===version)refresh.disabled=false}
}
/* A→B is the primary action. Station-specific timetable and older manual
   boarding controls remain available under expandable advanced sections. */
function restoreJourneyOrder(){
 const region=$("v4TransitRegion");
 if(region)section.insertBefore(bar,region);
 else section.insertBefore(bar,toolbar);
 // Previously the route response rendered ABOVE the A/B input. Put it immediately
 // after the original input panel without replacing the actual source elements.
 section.insertBefore(toolbar,result);
 const timetable=E("details",{id:"v5OptionalDepartures",class:"v5-optional"});
 timetable.append(E("summary",{text:"查看此站下一班（班表／有來源才顯示即時）"}),query,arrivals);
 result.after(timetable);
 const oldSwitch=section.querySelector(":scope > .view-switch");
 if(oldSwitch){
  const legacy=E("details",{id:"v5ManualProgress",class:"v5-optional"});
  legacy.append(E("summary",{text:"手動記錄搭乘進度（舊功能，選用）"}),oldSwitch);
  timetable.after(legacy);
 }
 const fields=$("planFields"),minutes=$("transitDuration")?.closest("label"),add=$("addTransit");
 if(fields&&minutes&&add){
  const manual=E("details",{id:"v5ManualTransitAdd",class:"v5-optional"});
  manual.append(E("summary",{text:"手動新增交通行程（沒有查詢結果時選用）"}),minutes,add);
  fields.append(manual);
 }
 const help=E("p",{class:"v1-sub",text:"先選地鐵／BTS、公車或綜合轉乘，輸入 A 出發站和 B 目的站，再按「查詢 A → B 怎麼搭」。結果就在下方；沒有可信來源時明確標示站數／方向待核對。"});
 toolbar.before(help);
 const style=E("style",{text:`
 #transportSection .v5-mode-switch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}
 #transportSection .v5-mode-switch button{min-width:0;white-space:normal;padding:11px 5px}
 #transportSection .v5-mode-switch button[aria-pressed="true"]{border:2px solid var(--blue);background:var(--soft);font-weight:800}
 #transportSection .v5-optional{margin:12px 0;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:11px 13px}
 #transportSection .v5-optional summary{cursor:pointer;color:var(--ink);font-weight:700}
 #transportSection #v2RouteResults{scroll-margin-top:18px}
 #transportSection #v5DepartureResult{margin-top:10px}
 #transportSection .transport-panel{margin-top:9px}
 #transportSection #planFields #v5ManualTransitAdd{grid-column:1 / -1}
 @media(max-width:600px){#transportSection .v5-mode-switch button{font-size:12px;padding:10px 3px}}
 `});
 document.head.append(style);
}
restoreJourneyOrder();
const oldRender=render;render=function(){oldRender();refreshCountry()};
refreshCountry();
global.VoyageTransitUIV5={get mode(){return mode},refreshCountry,lookup,lookupForRoute};
})(window);