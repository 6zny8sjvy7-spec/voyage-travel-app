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
// Chinese station names below are a limited, manually checked glossary.
// Unknown local destinations are shown with a Chinese warning, never guessed.
const koreanNames={
 "명동":"明洞","명동역":"明洞","서울역":"首爾站","서울":"首爾",
 "진접":"榛接","사당":"舍堂","오이도":"烏耳島",
 "홍대입구":"弘大入口","회현":"會賢","공덕":"孔德",
 "불암산":"佛岩山","당고개":"堂嶺（舊名，現稱佛岩山）",
 "강남":"江南","신촌":"新村","시청":"市廳","동대문":"東大門"
};
function bilingual(raw,t,kind){
 const name=String(raw||"").trim();
 if(!name)return "中文名稱待確認";
 const code=R?.countryCode(t)||"";
 if(code==="KR"){
  const line=name.match(/^(?:서울\s*)?(\d+)\s*호선$/u);
  if(kind==="line"&&line)return "首爾地鐵 "+line[1]+" 號線 · "+name;
  const key=name.replace(/\s*(?:행|방면|역)$/u,"").trim();
  const known=koreanNames[name]||koreanNames[key];
  if(known)return known+"（"+name+"）";
  if(/[가-힣]/u.test(name))return "中文譯名待核實 · "+name;
 }
 return name;
}
function modeName(m){return m==="rail"?"地鐵／BTS／鐵道":m==="bus"?"公車":"綜合轉乘"}
function modeItems(items){return (items||[]).filter(item=>mode==="mixed"||item.transportMode===mode)}
function renderDepartures(data,t){
 const rows=modeItems(data?.items),station=bilingual(data?.station?.name,t,"stop");
 arrivals.replaceChildren(E("strong",{class:"v5-station-heading",text:station+" · 查詢時間 "+new Date(data.at).toLocaleTimeString("zh-TW")}));
 if(!rows.length){
  arrivals.append(E("p",{class:"v2-route-status",text:mode==="mixed"?"此站目前沒有可驗證的下一班資料。":"此站未取得已確認屬於「"+modeName(mode)+"」的班次。未標示車種的資料不會混進此分類。"}));
  return;
 }
 const group=E("div",{class:"v5-departure-list"});
 for(const item of rows.slice(0,10)){
  const row=E("article",{class:"v5-departure-item"});
  const type=item.transportMode==="rail"?"🚇 鐵道":item.transportMode==="bus"?"🚌 公車":"⚠️ 車種未確認";
  const line=bilingual(item.line,t,"line"),head=bilingual(item.headsign,t,"destination");
  const info=E("div",{class:"v5-service-info"},[
   E("span",{class:"v5-service-type",text:type}),
   E("b",{text:line}),
   E("span",{class:"v5-service-headsign",text:"往 "+head}),
   E("small",{text:item.cancelled?"已取消":item.realtime?"來源標示即時":"僅表定班次，非即時倒數"})]);
  const eta=E("strong",{class:item.realtime?"v5-eta-realtime":"v5-eta-schedule",text:displayTime(item,t)});
  row.append(info,eta);group.append(row);
 }
 arrivals.append(group,E("p",{class:"v1-sub",text:"查詢結果只顯示來源可確認的班次與車種；未知車種僅在「綜合轉乘」內顯示。更新時間："+new Date(data.at).toLocaleString("zh-TW")+"；不是持續倒數。"}));
}
const bar=E("section",{id:"v5TransitPanel",class:"v5-transit-panel"});
bar.append(E("h3",{text:"🚇 交通助手 · 不用自己猜搭乘方向"}));
const desc=E("p",{class:"v1-sub",id:"v5RegionDesc",text:"請先選擇國家／城市旅行，系統才會查詢該城市的站網。"});bar.append(desc);
const modes=E("div",{class:"v5-mode-switch",role:"group","aria-label":"交通方式"});
for(const [id,label] of [["rail","🚇 地鐵／BTS"],["bus","🚌 公車"],["mixed","🔀 綜合轉乘"]]){
 const b=button(label,()=>{
 mode=id;version++;refresh.disabled=false;
 for(const child of modes.children)child.setAttribute("aria-pressed",String(child===b));
 result.replaceChildren(E("p",{class:"v2-route-status",text:"已切換成「"+label+"」，原先其他車種的路線結果已清除；請重新查詢 A→B。"}));
 if(lastData && input.value.trim())renderDepartures(lastData,trip());
 else arrivals.replaceChildren(E("p",{class:"v2-route-status",text:"目前選擇「"+modeName(mode)+"」。請查詢本站，結果只顯示相符車種。"}));
 document.dispatchEvent(new CustomEvent("voyage:transit-mode-changed",{detail:{mode}}));
},"secondary");
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
 if(key!==lastCountry){if(lastCountry){arrivals.textContent="已切換目的地。請重新查詢這個城市的站名。";input.value="";lastData=null}lastCountry=key;version++}
}
async function lookup(){
 const term=input.value.trim()||$("transitFrom")?.value.trim(),t=trip(),key=[t.id,R?.countryCode(t),t.city].join("|");
 if(!term){arrivals.textContent="請先輸入站名";return}
 const generation=++version;refresh.disabled=true;
 arrivals.textContent="正在向公開站點／班表服務查詢…";
 try{
  const data=await A.departures(term,t);
  if(generation!==version||key!==[trip().id,R?.countryCode(trip()),trip().city].join("|"))return;
  lastData=data;renderDepartures(data,t);
 }catch(error){
  if(generation===version)arrivals.textContent="暫無可核實的到站資料："+String(error?.message||"來源無回應")+"。可更換站點候選名稱並在 VOYAGE 重試。";
 }finally{if(generation===version)refresh.disabled=false}
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
  const matches=data.items.filter(item=>!item.cancelled&&(mode==="mixed"||item.transportMode===mode)&&sameService(item.line,first.line)&&sameService(item.headsign,first.headsign)).sort((a,b)=>a.minutes-b.minutes);
  arrivals.replaceChildren(E("strong",{class:"v5-station-heading",text:"A 站 · "+bilingual(data.station.name,t,"stop")+" · "+bilingual(first.line,t,"line")+" · 往 "+bilingual(first.headsign,t,"destination")}));
  if(!matches.length){
   arrivals.append(E("p",{class:"v1-sub",text:"未取得可確認同一路線及同方向的列車進站資訊。不能把其他線路的班次當成這班車，也不會猜測分鐘數。"}));
   return;
  }
  const group=E("div",{class:"v5-departure-list"});
  for(const item of matches.slice(0,5)){
   const row=E("article",{class:"v5-departure-item"});
   row.append(E("div",{class:"v5-service-info"},[E("b",{text:bilingual(item.line,t,"line")+" · 往 "+bilingual(item.headsign,t,"destination")}),E("div",{class:"v1-sub",text:item.realtime?"來源標示即時到站":"時刻表預估，非即時"})]),E("strong",{class:item.realtime?"v5-eta-realtime":"v5-eta-schedule",text:displayTime(item,t)}));
   group.append(row);
  }
  arrivals.append(group,E("p",{class:"v1-sub",text:"查詢時間："+new Date(data.at).toLocaleString("zh-TW")+"。不是持續即時倒數；資訊過期請重新搜尋 A→B。"}));
 }catch(error){
  if(generation===version)arrivals.textContent="本次無法核對 A 站同線同方向的班次："+String(error?.message||"資料來源無回應")+"。";
 }finally{if(generation===version)refresh.disabled=false}
}
const oldRender=render;render=function(){oldRender();refreshCountry()};
refreshCountry();
global.VoyageTransitUIV5={get mode(){return mode},refreshCountry,lookup,lookupForRoute};
})(window);