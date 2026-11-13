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
panel.insertBefore(result,panel.querySelector(".transport-panel"));
const toolbar=E("div",{class:"v1-actions"}),searchBtn=button("🔎 查詢實際交通路線",search,"primary");
toolbar.append(searchBtn,button("🗺 Google Maps 動態規劃",openProvider),button("🌐 NAVER 路線",()=>{const t=trip();window.open("https://map.naver.com/p/search/"+encodeURIComponent($("transitTo").value+", "+t.city),"_blank","noopener")}));
const regionInfo=E("div",{id:"v4TransitRegion",class:"v1-box"});
panel.insertBefore(regionInfo,result);
const navButtons=toolbar.querySelectorAll("button");
let lastDestination="";
function refreshRegion(){
 const t=trip(),reg=window.VoyageRegionV4?.get(t),name=(t.country||"未設定國家")+" · "+(t.city||"未設定城市"),identifier=[t.id,reg?.code,t.city].join("|");
 if(!regionInfo.firstChild||lastDestination!==identifier){
  regionInfo.replaceChildren();
  const heading=E("strong",{text:"📍 目前查詢地區："+name});
  const description=E("p",{class:"v1-sub",text:(reg?.rail||"依城市查詢")+"／"+(reg?.bus||"公車")+"。車站查詢、資料來源與可用服務會依目前旅行目的地切換；沒有授權的即時到站資訊不顯示倒數。"});
  regionInfo.append(heading,description);
  const more=E("div",{class:"v1-actions"});
  for(const item of reg?.sources||[])more.append(E("a",{href:item.url,target:"_blank",rel:"noopener noreferrer",text:item.name+" · "+(item.type==="official-keyed"?"需要申請金鑰":item.type==="schedule-data"?"時刻表資料":item.type==="navigation"?"外部地圖":"參考服務")}));
  regionInfo.append(more);
  if(lastDestination&&lastDestination!==identifier){selectedRoute=null;status("目的地已切換為 "+name+"，請重新輸入起終站並查詢；不會沿用其他國家的地鐵站序。");$("transitFrom").value="";$("transitTo").value=""}
  lastDestination=identifier;
 }
 if(navButtons[2])navButtons[2].hidden=reg?.code!=="KR";
}


const toLabel=$("transitTo").closest("label");
toLabel.after(toolbar);
// Boarding direction is a ROUTE RESULT, never a field the traveler must guess.
const routeStyle=E("style",{text:".v2-route-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px;margin:11px 0}.v2-route-card h3{font-size:16px;margin:0 0 7px}.v2-route-leg{border-left:3px solid #f0ab72;margin:12px 0 0 9px;padding:2px 0 4px 18px}.v2-route-leg strong{font-size:14px}.v2-route-station{position:relative;padding:8px 2px;font-size:13px;border-bottom:1px solid var(--line)}.v2-route-station:before{content:'';position:absolute;left:-27px;top:14px;width:12px;height:12px;border-radius:50%;background:var(--card);border:3px solid #de9c77}.v2-route-station:last-child:before{background:#d48563}.v2-route-source{font-size:11px;color:var(--muted);line-height:1.65}.v2-route-source a{color:var(--blue)}.v2-route-status{background:var(--soft);border-radius:12px;padding:10px;font-size:12px;margin:8px 0}"});
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
 return adapter.plan(from,to,trip());
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
 status("正在查詢「"+t.city+"」的公開交通資料。來源查不到時不會編造站序與即時到站。");
 searchBtn.disabled=true;
 try{
  const routes=filterMode(await apiSearch(from,to));
  if(generation!==searchVersion||trip().id!==tripId||window.VoyageRegionV4?.countryCode(trip())!==country)return;
  if(!routes.length)throw Error("本次路線沒有符合目前交通模式的可驗證班次");
  draw(routes);
  // Query the boarding station as part of the SAME A→B action.
  // Only matching train line AND direction may be called a connection.
  window.VoyageTransitUIV5?.lookupForRoute?.(from,t,routes[0]);
 }catch(error){
  if(generation!==searchVersion||trip().id!==tripId)return;
  const reference=countryRouteFallback(from,to),mode=window.VoyageTransitUIV5?.mode||"mixed";
  if(reference&&mode!=="bus"){
   draw([reference]);
   const warning=E("p",{class:"v2-route-status",text:"注意：公開動態服務沒有取得即時路線，目前顯示首爾部分站網的靜態參考。非即時到站、非官方查核的行車分鐘；請再用 NAVER／Google 對照當天公告。"});
   result.prepend(warning);
   window.VoyageTransitUIV5?.lookupForRoute?.(from,t,reference);
  }else status("本次查不到足以驗證的「"+t.country+" · "+t.city+"」交通資料："+error.message+"。可點上方 Google Maps 或 NAVER（韓國）查看當日完整路線；不會使用其他國家的站序代替。");
 }finally{if(generation===searchVersion)searchBtn.disabled=false}
}
function stationText(s){const name=(s.zh||s.en||s.local||"未命名站");const alias=[s.local,s.en].filter(Boolean).filter(x=>x!==name);return name+(alias.length?" · "+alias.join(" / "):"")}
function knownCount(leg,route){
 if(["WALK","BIKE","CAR"].includes(leg.mode))return null;
 if(leg.sequenceComplete===false)return null;
 if(route.kind==="transitous"&&leg.sequenceComplete!==true)return null;
 return Array.isArray(leg.stations)&&leg.stations.length>=2?leg.stations.length-1:null;
}
function draw(routes){
 result.replaceChildren(E("h3",{text:"A → B 查詢結果 · 方向與站序"}));
 for(const [index,route] of routes.entries()){
  const card=E("article",{class:"v2-route-card"});
  const trainLegs=route.legs.filter(x=>!["WALK","BIKE","CAR"].includes(x.mode));
  const counts=trainLegs.map(x=>knownCount(x,route));
  const exact=counts.length>0&&counts.every(x=>Number.isInteger(x));
  const total=exact?counts.reduce((a,b)=>a+b,0):null;
  const title=E("h3",{text:"路線 "+(index+1)+" · "+(total===null?"總站數尚未核實":("總共 "+total+" 站"))+" · "+route.transfers+" 次轉乘"});
  card.append(title,E("p",{class:"v1-sub",text:route.label||"公開交通資料"}));
  if(total===null)card.append(E("p",{class:"v2-route-status",text:"來源未提供所有途經站，不能把只看到起終站誤算為 1 站。下列清單可能不完整；請以當地官方路線圖確認。"}));
  for(const [i,leg] of route.legs.entries()){
   const row=E("div",{class:"v2-route-leg"}),walking=["WALK","BIKE","CAR"].includes(leg.mode),n=knownCount(leg,route);
   row.append(E("strong",{text:(i+1)+". "+(walking?"🚶 步行":leg.mode==="BUS"?"🚌 "+leg.line:"🚆 "+leg.line)}));
   if(!walking){
    row.append(E("div",{class:"v1-sub",text:"搭乘方向："+(leg.headsign||"來源未提供方向，請核對月台")})); 
    row.append(E("div",{class:"v1-sub",text:n===null?"途經站數未核實":("乘坐 "+n+" 站")}));
    if(!leg.directionVerified&&route.kind==="transitous")row.append(E("div",{class:"v1-sub",text:"注意：來源未提供此車次的終點方向，不能據此選擇月台。"}));
   }
   for(const [j,station] of (leg.stations||[]).entries()){
    const mark=j===0?"上車／本段起點 · ":j===leg.stations.length-1?"下車／本段終點 · ":("第 "+j+" 站 · ");
    row.append(E("div",{class:"v2-route-station",text:mark+stationText(station)}));
   }
   card.append(row);
  }
  const source=E("div",{class:"v2-route-source",text:"資料來源："}),link=E("a",{href:route.source,target:"_blank",rel:"noopener noreferrer",text:route.kind==="verified-reference"||route.kind==="seoul-network"?"首爾部分路網資料參考":"Transitous 公開資料源"});
  source.append(link,E("span",{text:" · 方向以當日月台列車標示核對；班次是否即時須另外確認。"}));
  card.append(source,E("div",{class:"v1-actions"},[button("加入我的行程",()=>saveRoute(route),"primary")]));
  result.append(card);
 }
}
function routeStops(route){return route.legs.flatMap((leg,i)=>{const arr=leg.stations||[];return i>0&&arr.length?arr.slice(1):arr})}
function saveRoute(route){const t=trip(),stops=routeStops(route),from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),time=$("transitTime").value||"11:00";if(!D.validTime(time)){U.toast("請先設定有效出發時間");return}if(!confirm("把查詢到的 "+route.legs.length+" 段交通路線加入 DAY "+(day+1)+"？不會改動其他行程。"))return;const first=route.legs.find(x=>x.mode!=="WALK")||route.legs[0],notes=route.legs.map((l,i)=>(i+1)+". "+l.line+(Number(l.duration)>0?" · 約 "+Math.ceil(l.duration/60)+" 分鐘":"")+"："+l.stations.map(x=>x.zh||x.en).join(" → ")+"\n方向："+l.headsign).join("\n")+"\n資料參考："+route.source+"\n"+route.label;t.days[day].push({id:D.uid(),type:"transport",name:"🚆 "+from+" → "+to,from,to,time,duration:Number(route.minutes)>0?route.minutes:null,line:first?.line||"",notes,source:route.source,routeInfo:D.clone(route),stopSequence:D.clone(stops)});save();render();setTab("itinerary");U.toast("交通路線已加入這一天的時間軸")}
window.VoyageRouteV2={search,routeSEO,routeStops,saveRoute};
status("輸入起終站，例如「明洞」與「弘大」，按上方『查詢實際交通路線』即可看到站序及轉乘。非所有國家都支援公開交通資料。");
const oldRender=render;
render=function(){oldRender();refreshRegion()};
refreshRegion();

})();
