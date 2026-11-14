/* VOYAGE V2 route search: verified Seoul corridor plus best-effort public routing.
 Never display guessed live vehicle positions or departures. */
(function(){
"use strict";
const D=window.VoyageDomain,U=window.VoyageUI;if(!U)return;
const $=id=>document.getElementById(id);
const E=(tag,attrs={},children=[])=>{const el=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="text")el.textContent=String(v);else if(k==="class")el.className=v;else el.setAttribute(k,String(v))}for(const c of children)el.append(c);return el};
const button=(label,onClick,cls="secondary")=>{const b=E("button",{text:label,class:cls});b.type="button";b.onclick=onClick;return b};
const labels={
myeongdong:["明洞","myeongdong","명동"],hongdae:["弘大","hongdae","hongik","hongik university","hongik univ","홍대","홍대입구"],
seoul:["首爾站","seoul station","서울역"],gongdeok:["孔德","gongdeok","공덕"]
};
const stations={
myeongdong:{zh:"明洞",local:"명동",en:"Myeongdong",lat:37.5609,lon:126.9865},
hoehyeon:{zh:"會賢",local:"회현",en:"Hoehyeon",lat:37.5585,lon:126.9781},
seoul:{zh:"首爾站",local:"서울역",en:"Seoul Station",lat:37.5546,lon:126.9724},
gongdeok:{zh:"孔德",local:"공덕",en:"Gongdeok",lat:37.5440,lon:126.9513},
hongdae:{zh:"弘大入口",local:"홍대입구",en:"Hongik Univ.",lat:37.5572,lon:126.9254}
};
const key=s=>{const n=String(s||"").trim().toLowerCase().replace(/[（(][^)）]*[)）]/g,"").replace(/站|station/ig,"").trim();for(const [k,names] of Object.entries(labels))if(names.some(x=>x.toLowerCase()===n||n.includes(x.toLowerCase())&&n.length<24))return k;return null};
const result=E("section",{id:"v2RouteResults",class:"v1-box"});
const panel=$("transportSection");
const legacyExternalRouteButton=$("vTransitRoute");
if(legacyExternalRouteButton)legacyExternalRouteButton.remove();
panel.insertBefore(result,panel.querySelector(".transport-panel"));
const toolbar=E("div",{class:"v1-actions"}),searchBtn=button("🔎 查詢實際交通路線",search,"primary");
toolbar.append(searchBtn);
const regionInfo=E("div",{id:"v4TransitRegion",class:"v1-box"});
panel.insertBefore(regionInfo,result);
const navButtons=toolbar.querySelectorAll("button");
let lastDestination="";
let seededDateKey="";
function destinationToday(t){
 const code=window.VoyageRegionV4?.countryCode(t)||"";
 const zone=({"KR":"Asia/Seoul","JP":"Asia/Tokyo","TH":"Asia/Bangkok","VN":"Asia/Ho_Chi_Minh"})[code]||t.tz||"Asia/Taipei";
 try{
  const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return parts.year+"-"+parts.month+"-"+parts.day;
 }catch{return new Date().toISOString().slice(0,10)}
}
function ensurePlanDate(t){
 const input=$("transitPlanDate");if(!input)return "";
 const key=t.id+"|"+day;
 if(seededDateKey!==key){
  seededDateKey=key;
  const today=destinationToday(t);
  const target=t.startDate?D.dayISO(t.startDate,day):"";
  input.value=target&&target>=today?target:today;
 }
 return input.value;
}
function refreshRegion(){
 const t=trip(),reg=window.VoyageRegionV4?.get(t),name=(t.country||"未設定國家")+" · "+(t.city||"未設定城市"),identifier=[t.id,reg?.code,t.city].join("|");
 ensurePlanDate(t);
 if(!regionInfo.firstChild||lastDestination!==identifier){
  regionInfo.replaceChildren();
  const heading=E("strong",{text:"📍 目前查詢地區："+name});
  const description=E("p",{class:"v1-sub",text:(reg?.rail||"依城市查詢")+"／"+(reg?.bus||"公車")+"。車站查詢、資料來源與可用服務會依目前旅行目的地切換；沒有授權的即時到站資訊不顯示倒數。"});
  regionInfo.append(heading,description);
  regionInfo.append(E("p",{class:"v1-sub",text:"所有查詢結果留在 VOYAGE，無法確認站序就顯示資料不足，不需要跳到其他網站。"}));
  lastDestination=identifier;
 }
 if(navButtons[2])navButtons[2].hidden=reg?.code!=="KR";
}


const toLabel=$("transitTo").closest("label");
toLabel.after(toolbar);
// Boarding direction is a ROUTE RESULT, never a field the traveler must guess.
const routeStyle=E("style",{text:".v2-route-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px;margin:11px 0}.v2-route-card h3{font-size:16px;margin:0 0 7px}.v2-route-leg{border-left:3px solid #f0ab72;margin:12px 0 0 9px;padding:2px 0 4px 18px}.v2-route-leg strong{font-size:14px}.v2-route-station{position:relative;padding:8px 2px;font-size:13px;border-bottom:1px solid var(--line)}.v2-route-station:before{content:'';position:absolute;left:-27px;top:14px;width:12px;height:12px;border-radius:50%;background:var(--card);border:3px solid #de9c77}.v2-route-station:last-child:before{background:#d48563}.v2-route-source{font-size:11px;color:var(--muted);line-height:1.65}.v2-route-source a{color:var(--blue)}.v2-route-status{background:var(--soft);border-radius:12px;padding:10px;font-size:12px;margin:8px 0}"});
const v6Styles=E("style",{text:".v6-route-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:9px;margin:14px 0}.v6-route-choice{display:block;text-align:left;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--card);font-weight:650;line-height:1.65;white-space:normal;color:var(--ink)}.v6-route-choice[aria-pressed=true]{border:2px solid var(--blue);background:var(--soft)}.v6-route-detail{padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--card)}.v6-route-detail .v2-route-leg{margin-top:11px}"});document.head.append(v6Styles);
document.head.append(routeStyle);
let selectedRoute=null;
function routeSEO(toKey,fromKey){const forward=fromKey==="myeongdong"&&toKey==="hongdae",reverse=fromKey==="hongdae"&&toKey==="myeongdong";if(!forward&&!reverse)return null;
const steps=forward?[
{line:"首爾地鐵 4 號線",headsign:"南下往首爾站／烏耳島方向（請以當日月台顯示為準）",stations:["myeongdong","hoehyeon","seoul"],mode:"SUBWAY"},
{line:"機場鐵道 AREX 普通列車",headsign:"往仁川國際機場方向（請搭普通列車，勿搭直達快車）",stations:["seoul","gongdeok","hongdae"],mode:"SUBURBAN"}
]:[
{line:"機場鐵道 AREX 普通列車",headsign:"往首爾站方向（普通列車）",stations:["hongdae","gongdeok","seoul"],mode:"SUBURBAN"},
{line:"首爾地鐵 4 號線",headsign:"往明洞、榛接方向（請核對月台終點）",stations:["seoul","hoehyeon","myeongdong"],mode:"SUBWAY"}
];
return {kind:"verified-reference",label:"首爾部分站序參考（未提供可靠行車時間、非即時到站）",minutes:null,transfers:1,legs:steps.map(x=>({...x,stations:x.stations.map(id=>stations[id])})),source:"https://koreafare.com/subway/myeongdong-to-hongdae",sourceAlt:"https://kmetro.app/en/station/myeongdong"}
}
function openProvider(){const from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),t=trip();if(!from||!to){U.toast("請輸入出發及抵達站");return}const url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(from+", "+t.city+", "+t.country)+"&destination="+encodeURIComponent(to+", "+t.city+", "+t.country)+"&travelmode=transit";window.open(url,"_blank","noopener")}
function status(text){result.replaceChildren(E("p",{class:"v2-route-status",text}))}
async function apiSearch(from,to){
 const adapter=window.VoyageTransitV5;
 if(!adapter)throw Error("四國公開交通資料引擎尚未載入");
 const t=trip(),date=ensurePlanDate(t),clock=$("transitTime")?.value||"";
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||D.dayISO(date,0)!==date)throw Error("請選擇有效的搭車日期");
 if(!D.validTime(clock))throw Error("請選擇有效的當地出發時間");
 const code=window.VoyageRegionV4?.countryCode(t)||"";
 const offset=code==="KR"||code==="JP"?"+09:00":code==="TH"||code==="VN"?"+07:00":null;
 if(!offset)throw Error("此國家的交通時區尚未建立");
 return adapter.plan(from,to,t,{time:date+"T"+clock+":00"+offset});
}
let searchVersion=0;
function countryRouteFallback(from,to){
 if(!window.VoyageRegionV4?.isSeoul(trip()))return null;
 // Deliberately limit offline fallback to the explicitly documented corridor.
 // The partial Seoul graph is NOT a complete route planner for arbitrary stations.
 return routeSEO(key(to),key(from));
}
function filterMode(routes){
 const mode=window.VoyageTransitUIV5?.mode||"mixed";
 if(mode==="mixed")return routes;
 const railModes=new Set(["RAIL","SUBWAY","SUBURBAN","TRAM","LIGHT_RAIL","MONORAIL","FUNICULAR"]);
 const transitOnly=routes.filter(route=>route.legs.some(l=>mode==="bus"?l.mode==="BUS":railModes.has(l.mode)));
 return transitOnly;
}
async function search(){
 const from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),t=trip();
 if(!from||!to){status("請先填出發站及抵達站");return}
 if(from===to){status("起點和終點相同，請確認站名");return}
 const generation=++searchVersion,country=window.VoyageRegionV4?.countryCode(t),tripId=t.id;
 status("正在查詢「"+t.city+"」"+ensurePlanDate(t)+" "+($("transitTime")?.value||"") +"（當地時間）的公開交通資料。來源查不到時不會編造站序與即時到站。");
 searchBtn.disabled=true;
 try{
  const routes=filterMode(await apiSearch(from,to));
  if(generation!==searchVersion||trip().id!==tripId||window.VoyageRegionV4?.countryCode(trip())!==country)return;
  if(!routes.length)throw Error("本次路線沒有符合目前交通模式的可驗證班次");
  draw(routes);
  // Draw selects the first in-app route and queries only its matching direction.
 }catch(error){
  if(generation!==searchVersion||trip().id!==tripId)return;
  status("查無能在 VOYAGE 內核實的「"+t.country+" · "+t.city+"」路線："+error.message+"。請檢查站名或嘗試當地文字；免費資料無法查到時不猜測站數或跳轉外站。");
 }finally{if(generation===searchVersion)searchBtn.disabled=false}
}
function stationText(s){const names=[s.zh,s.en,s.local,s.name].filter(Boolean);const id=String(s.id||"").trim();const passengerCode=/^(?:[A-Z]{1,3}\d{2}|M1-\d{2})$/.test(id)?id:"";return [...new Set([...names,...(passengerCode?[passengerCode]:[])])].join(" · ")||"站名資料不足"}
function knownCount(leg,route){
 if(["WALK","BIKE","CAR"].includes(leg.mode))return null;
 if(leg.sequenceComplete===false)return null;
 if(route.kind==="transitous"&&leg.sequenceComplete!==true)return null;
 return Array.isArray(leg.stations)&&leg.stations.length>=2?leg.stations.length-1:null;
}
function draw(routes){
 const signatures=new Set(),unique=[];
 for(const route of routes){
  const key=(route.legs||[]).map(l=>[l.mode,l.line,l.headsign,(l.stations||[]).map(x=>x.id||x.name).join(">")].join("|")).join(";");
  if(signatures.has(key))continue;signatures.add(key);unique.push(route);
  if(unique.length>=6)break;
 }
 result.replaceChildren(E("h3",{text:"A → B · 選擇搭乘路線"}));
 result.append(E("p",{class:"v1-sub",text:"請選擇一種搭法，下面直接展開車號、往哪個方向、上車站、搭乘站數、下車站及所有已核實的停靠站。公車不同班次的停靠站可能不同，不能用 A/B 距離猜站數。"}));
 const chooser=E("div",{class:"v6-route-options",role:"group","aria-label":"交通路線方案"});
 const details=E("div",{class:"v6-route-detail",id:"v6SelectedRoute"});
 const buttons=[];
 function label(route,index){
  const legs=route.legs.filter(x=>!["WALK","BIKE","CAR"].includes(x.mode));
  const counts=legs.map(l=>knownCount(l,route));
  const verified=counts.length>0&&counts.every(n=>Number.isInteger(n));
  const count=verified?counts.reduce((a,b)=>a+b,0):null;
  const main=legs.map(l=>(l.mode==="BUS"?"🚌 ":"🚇 ")+(l.line||"未知車號")).join(" → ");
  const walk=route.legs.filter(l=>["WALK","BIKE"].includes(l.mode)).reduce((n,l)=>n+(Number(l.duration)||0),0);
  const first=legs[0]?.stations?.[0],lastLeg=legs[legs.length-1],last=lastLeg?.stations?.[(lastLeg.stations||[]).length-1];
  const stationName=st=>st?([st.zh,st.en,st.local,st.name].filter(Boolean)[0]||"站名待核對"):"站名資料不足";
  return {
   title:"方案 "+(index+1)+" · "+main,
   stations:count===null?"站數尚未核實":"共 "+count+" 站",
   boarding:"上車："+stationName(first),
   alighting:"下車："+stationName(last),
   extra:route.transfers+" 次轉乘"+(route.minutes?" · 約 "+route.minutes+" 分":"")+(walk>0?" · 步行約 "+Math.ceil(walk/60)+" 分":"")
  };
 }
 function select(index){
  buttons.forEach((btn,i)=>btn.setAttribute("aria-pressed",String(i===index)));
  const route=unique[index],info=label(route,index);
  details.replaceChildren(E("h3",{text:info.title}),E("p",{class:"v1-sub",text:info.stations+" · "+info.extra}),E("p",{class:"v1-sub",text:info.boarding+" ｜ "+info.alighting}));
  const trainLegs=route.legs.filter(x=>!["WALK","BIKE","CAR"].includes(x.mode));
  const counts=trainLegs.map(x=>knownCount(x,route));
  if(!counts.length||counts.some(x=>x===null))details.append(E("p",{class:"v2-route-status",text:"資料來源未提供完整停靠站順序，不能確認總站數；不會把只有起終點的路段誤算為 1 站，也不會猜測公車站數。"}));
  for(const [i,leg] of route.legs.entries()){
   const row=E("div",{class:"v2-route-leg"}),walking=["WALK","BIKE","CAR"].includes(leg.mode),n=knownCount(leg,route);
   row.append(E("strong",{text:(i+1)+". "+(walking?"🚶 步行":leg.mode==="BUS"?"🚌 公車 "+(leg.line||"未提供車號"):"🚆 "+(leg.line||"未提供路線"))}));
   if(walking){
    if(Number(leg.duration)>0)row.append(E("div",{class:"v1-sub",text:"預估步行 "+Math.ceil(leg.duration/60)+" 分"}));
   }else{
    row.append(E("div",{class:"v1-sub",text:"搭乘方向："+(leg.headsign||"未提供目的地方向")}));
    row.append(E("div",{class:"v1-sub",text:n===null?"本段站數尚未核實":"本段搭乘 "+n+" 站"}));
    if(leg.directionVerified===false)row.append(E("p",{class:"v2-route-status",text:"來源缺少官方方向標示，不能確認正確月台或站牌方向。"}));
   }
   for(const [j,station] of (leg.stations||[]).entries()){
    const mark=j===0?"上車／本段起點 · ":j===leg.stations.length-1?"下車／本段終點 · ":("第 "+j+" 站 · ");
    row.append(E("div",{class:"v2-route-station",text:mark+stationText(station)}));
   }
   details.append(row);
  }
  details.append(E("p",{class:"v2-route-source",text:"資料依據："+(route.source||"來源未註明")+" · 查詢時間："+new Date(route.requestedAt||Date.now()).toLocaleString("zh-TW")+"；即時班次僅在來源可核對時才另行顯示。"}));
  const saveButton=button("將這條路線加入行程",()=>saveRoute(route),"primary");
  const validLegs=route.legs.filter(x=>!["WALK","BIKE","CAR"].includes(x.mode));
  const verified=validLegs.length>0&&validLegs.every(x=>knownCount(x,route)!==null&&!!x.headsign&&x.directionVerified!==false);
  saveButton.disabled=!verified;
  if(!verified)saveButton.title="需要完整停靠站與可靠行車方向，才能把這條方案加入行程";
  details.append(saveButton);
  if(route.kind==="otp-th-static"){
   details.append(E("p",{class:"v2-route-status",text:"這是泰國 OTP 官方 GTFS 的靜態停靠站順序，已核實各站與路線方向，但沒有即時列車到站預測。請勿把站數當成等候分鐘或保證有班車。"}));
  }else window.VoyageTransitUIV5?.lookupForRoute?.($("transitFrom").value.trim(),trip(),route);
 }
 unique.forEach((route,i)=>{
  const meta=label(route,i),btn=button(meta.title+" · "+meta.stations+" · "+meta.boarding+" · "+meta.alighting+" · "+meta.extra,()=>select(i));
  btn.className="v6-route-choice";btn.setAttribute("aria-pressed",String(i===0));
  chooser.append(btn);buttons.push(btn);
 });
 result.append(chooser,details);
 select(0);
}
function routeStops(route){
 const result=[];
 const sameStop=(a,b)=>{if(!a||!b)return false;if(a.id&&b.id)return a.id===b.id;
  const name=x=>String(x.name||x.local||x.en||x.zh||"").trim().toLowerCase();
  return !!name(a)&&name(a)===name(b)};
 for(const leg of route.legs||[]){
  for(const station of leg.stations||[]){
   if(result.length&&sameStop(result[result.length-1],station))continue;
   result.push(station);
  }
 }
 return result;
}
function saveRoute(route){
 const transit=(route.legs||[]).filter(x=>!["WALK","BIKE","CAR"].includes(x.mode));
 if(!transit.length||transit.some(leg=>knownCount(leg,route)===null||!leg.headsign||leg.directionVerified===false)){
  U.toast("本路線尚缺完整停靠站或行車方向，無法核實站數；請勿把不完整資訊當成已確認搭乘方案");
  return;
 }
 const t=trip(),stops=routeStops(route),from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),time=$("transitTime").value||"11:00";
 const chosenDate=$("transitPlanDate")?.value||"",firstDate=t.startDate||"";
 if(!firstDate||!chosenDate||D.dayISO(chosenDate,0)!==chosenDate){
  U.toast("請先設定旅行開始日期與正確的實際搭車日期，才能將路線加入當天行程");return;
 }
 const chosenDateIndex=Math.round((Date.parse(chosenDate+"T12:00:00Z")-Date.parse(firstDate+"T12:00:00Z"))/86400000);
 if(!Number.isInteger(chosenDateIndex)||chosenDateIndex<0||chosenDateIndex>=t.days.length){
  U.toast("搭車日期「"+chosenDate+"」不在旅行天數內；請先調整日期或新增天數");return;
 }
 if(!D.validTime(time)){U.toast("請先設定有效出發時間");return}if(!confirm("將 "+route.legs.length+" 段交通路線加入 "+chosenDate+"（第 "+(chosenDateIndex+1)+" 天）？不會更改你填寫的時間與既有行程。"))return;const first=route.legs.find(x=>x.mode!=="WALK")||route.legs[0],notes=route.legs.map((l,i)=>(i+1)+". "+l.line+(Number(l.duration)>0?" · 約 "+Math.ceil(l.duration/60)+" 分鐘":"")+"："+l.stations.map(x=>x.zh||x.en||x.local||x.name||"站名待核對").join(" → ")+"\n方向："+l.headsign).join("\n")+"\n資料參考："+route.source+"\n"+route.label;t.days[chosenDateIndex].push({id:D.uid(),type:"transport",name:(first?.mode==="BUS"?"🚌 ":"🚆 ")+from+" → "+to,from,to,time,date:chosenDate,duration:Number(route.minutes)>0?route.minutes:null,line:first?.line||"",notes,source:route.source,routeInfo:D.clone(route),stopSequence:D.clone(stops)});day=chosenDateIndex;save();render();setTab("itinerary");U.toast("交通路線已加入 "+chosenDate+" 的時間軸")}
window.VoyageRouteV2={search,routeSEO,routeStops,saveRoute};
status("輸入起終站，例如「明洞」與「弘大」，按上方『查詢實際交通路線』即可看到站序及轉乘。非所有國家都支援公開交通資料。");
const oldRender=render;
render=function(){oldRender();refreshRegion()};
refreshRegion();

})();
