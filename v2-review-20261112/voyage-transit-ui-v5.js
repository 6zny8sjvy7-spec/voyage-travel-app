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
// Limited checked display glossary, not a claim of four-country station coverage.
const localizedNames={
 KR:{"명동":"明洞","명동역":"明洞","myeongdong":"明洞","서울역":"首爾站","서울":"首爾","seoul station":"首爾站",
 "진접":"榛接","jinjeop":"榛接","사당":"舍堂","sadang":"舍堂","오이도":"烏耳島","oido":"烏耳島",
 "홍대입구":"弘大入口","hongik univ.":"弘大入口","회현":"會賢","공덕":"孔德",
 "불암산":"佛岩山","당고개":"堂嶺（舊名，現稱佛岩山）","danggogae":"堂嶺（舊名，現稱佛岩山）",
 "강남":"江南","신촌":"新村","시청":"市廳","동대문":"東大門","성수":"聖水","을지로입구":"乙支路入口","종로3가":"鐘路三街","종각":"鐘閣","광화문":"光化門","잠실":"蠶室","여의도":"汝矣島","삼각지":"三角地","고속터미널":"高速巴士客運站","이태원":"梨泰院","동대문역사문화공원":"東大門歷史文化公園"},
 TH:{"สยาม":"暹羅","siam":"暹羅","อโศก":"阿索克","asok":"阿索克","ชิดลม":"奇隆","chit lom":"奇隆","เพลินจิต":"奔集","phloen chit":"奔集"},
 JP:{"渋谷":"澀谷","shibuya":"澀谷","新宿":"新宿","shinjuku":"新宿","浅草":"淺草","asakusa":"淺草","銀座":"銀座","ginza":"銀座","表参道":"表參道","omote-sando":"表參道","東京":"東京","tokyo":"東京"},
 VN:{"bến thành":"濱城","ben thanh":"濱城","濱城市場":"濱城","hồ chí minh":"胡志明市"}
};
function bilingual(raw,t,kind){
 const name=String(raw||"").trim().replace(/^(.+?)\s*[（(]\s*(?:\d+\s*호선|[1-9]\s*號線)\s*[）)]$/u,"$1");
 if(!name)return "中文名稱待確認";
 const code=R?.countryCode(t)||"";
 if(code==="KR"){
  const line=name.match(/^(?:서울\s*)?(\d+)\s*호선$/u);
  if(kind==="line"&&line)return "首爾地鐵 "+line[1]+" 號線 · "+name;
 }
 if(code==="TH"&&kind==="line"&&/^BTS\s+Sukhumvit/iu.test(name))return "BTS 素坤逸線 · "+name;
 if(code==="JP"&&kind==="line"&&/Ginza\s+Line|銀座線/iu.test(name))return "東京地鐵銀座線 · "+name;
 if(code==="VN"&&kind==="line"&&/(?:Metro|MRT)\s*(?:Line)?\s*1\b/iu.test(name))return "捷運 1 號線 · "+name;
 const key=name.toLocaleLowerCase().replace(/\s*(?:행|방면|역)$/u,"").trim();
 const known=localizedNames[code]?.[key]||localizedNames[code]?.[name];
 if(known)return known+"（"+name+"）";
 // Never invent a Chinese station name from a foreign-language source string.
 return "中文譯名待核實 · "+name;
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
 mode=id;version++;refresh.disabled=false;lastData=null;input.value="";if(typeof departureDetails!=="undefined")departureDetails.open=false;
 for(const child of modes.children)child.setAttribute("aria-pressed",String(child===b));
 result.replaceChildren(E("p",{class:"v2-route-status",text:"已切換成「"+label+"」，原先其他車種的路線結果已清除；請重新查詢 A→B。"}));
 arrivals.replaceChildren(E("p",{class:"v2-route-status",text:"已清空上一車種的班次清單。如需本站發車資訊，展開下方『查詢本站班次』再搜尋。"}));
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
const departureDetails=E("details",{id:"v5DepartureDetails",class:"v5-departure-details"});
departureDetails.append(E("summary",{text:"查詢本站班次（選填；無可靠即時資料不顯示倒數）"}),query,arrivals,E("p",{class:"v1-sub",text:"免費開放資料：Transitous（依資料覆蓋和授權範圍）；表定發車時間不是即時倒數。"}));
bar.append(departureDetails);
const attribution=E("p",{class:"v1-sub"},[E("span",{text:"免費交通資料：Transitous（依各城市開放範圍）。站序、班次及即時資訊不足時留在 VOYAGE 顯示限制。資料授權歸屬："}),E("a",{href:A.ATTRIBUTION,rel:"noopener noreferrer",target:"_blank",text:"公開資料來源與授權"})]);bar.append(attribution);
section.insertBefore(bar,toolbar);
const v8style=E("style",{text:"#v5TransitPanel{padding:12px 14px;margin:12px 0;border:1px solid var(--line);border-radius:16px;background:var(--card)}#v5TransitPanel .v5-mode-switch{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}#v5TransitPanel .v5-mode-switch [aria-pressed='true']{background:#286acb;color:white}#v5DepartureDetails{margin-top:8px;padding:10px 12px;border:1px solid var(--line);border-radius:12px}#v5DepartureDetails summary{cursor:pointer;font-weight:700;min-height:32px}#v5DepartureResult{max-height:260px;overflow:auto;margin-top:8px;overscroll-behavior:contain}#v5StationSuggestions{display:grid;gap:7px;margin-top:9px}#v5StationSuggestions button{text-align:left;white-space:normal;line-height:1.45;min-height:38px}"});document.head.append(v8style);
function refreshCountry(){
 const t=trip(),code=R?.countryCode(t)||"",key=code+"|"+t.city+"|"+t.id;
 desc.textContent=(A.description(t)||"尚未支援")+" · 目前目的地："+(t.city||"未設定城市")+"。只查詢該城市附近的車站，不會沿用前一國交通資料。";
 if(key!==lastCountry){if(lastCountry){arrivals.textContent="已切換目的地。請重新查詢這個城市的站名。";input.value="";lastData=null;departureDetails.open=false;document.getElementById("v5StationSuggestions")?.remove()}lastCountry=key;version++}
}
async function lookup(){
 const term=input.value.trim()||$("transitFrom")?.value.trim(),t=trip(),key=[t.id,R?.countryCode(t),t.city].join("|");
 if(!term){arrivals.textContent="請先輸入站名";return}
 const generation=++version;refresh.disabled=true;
 arrivals.textContent="正在向公開站點／班表服務查詢…";
 const former=document.getElementById("v5StationSuggestions");if(former)former.remove();
 try{
  const data=await A.departures(term,t);
  if(generation!==version||key!==[trip().id,R?.countryCode(trip()),trip().city].join("|"))return;
  lastData=data;renderDepartures(data,t);
 }catch(error){
  if(generation===version){
   arrivals.textContent="本次未取得可核實的班次："+String(error?.message||"來源無回應")+"。這不等於車站不存在。";
   try{
    const candidates=await A.suggestStations?.(term,t);
    if(generation===version&&candidates?.length){
     const box=E("div",{id:"v5StationSuggestions",role:"group","aria-label":"選擇已查到的候選站"});
     box.append(E("strong",{text:"找到附近候選站（請核對當地站名，再親自選擇）："}));
     for(const stop of candidates.slice(0,8)){
       const local=stop.local&&stop.local!==stop.name?" · "+stop.local:"",zh=stop.zh?stop.zh+"（"+stop.name+"）":stop.name;
       box.append(button(zh+local,()=>{input.value=stop.name;box.remove();lookup()},"secondary"));
     }arrivals.after(box);
    }
   }catch(_){/* Suggestions are optional, never invent a station. */}
  }
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