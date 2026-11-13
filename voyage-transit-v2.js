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


const form=$("transportSection").querySelector(".transport-panel");
const toLabel=$("transitTo").closest("label");
toLabel.after(toolbar);
const advanced=E("details"),advancedTitle=E("summary",{text:"進階：自行輸入或修改線路方向（只有已查到的路線才會自動填入）"});
const lineLabel=$("transitLine").closest("label");
advanced.append(advancedTitle,lineLabel);
form.append(advanced);
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
return {kind:"verified-reference",label:"公開交通路線參考（不是即時班次）",minutes:12,transfers:1,legs:steps.map(x=>({...x,stations:x.stations.map(id=>stations[id])})),source:"https://koreafare.com/subway/myeongdong-to-hongdae",sourceAlt:"https://kmetro.app/en/station/myeongdong"}
}
function openProvider(){const from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),t=trip();if(!from||!to){U.toast("請輸入出發及抵達站");return}const url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(from+", "+t.city+", "+t.country)+"&destination="+encodeURIComponent(to+", "+t.city+", "+t.country)+"&travelmode=transit";window.open(url,"_blank","noopener")}
function status(text){result.replaceChildren(E("p",{class:"v2-route-status",text}))}
async function apiSearch(from,to){const geocode=async name=>{const url="https://api.transitous.org/api/v1/geocode?text="+encodeURIComponent(name+", "+trip().city+", "+trip().country)+"&type=STOP";const res=await fetch(url,{credentials:"omit"});if(!res.ok)throw Error("站名查詢服務 HTTP "+res.status);const data=await res.json();let list=Array.isArray(data)?data:data.results||data.features||data.places||[];const entry=list.find(x=>x&&((x.lat!==undefined&&x.lon!==undefined)||x.location||x.geometry));if(!entry)throw Error("交通服務找不到站名："+name);const p=entry.location||entry;const lat=Number(p.lat??p.latitude??entry.geometry?.coordinates?.[1]),lon=Number(p.lon??p.lng??p.longitude??entry.geometry?.coordinates?.[0]);if(!Number.isFinite(lat)||!Number.isFinite(lon))throw Error("車站座標資料無效");const origin=window.VoyageRegionV4?.trustedCoords(trip());if(origin){const rd=Math.PI/180,p1=origin.latitude*rd,p2=lat*rd,dl=(lon-origin.longitude)*rd,da=(lat-origin.latitude)*rd,dh=Math.sin(da/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;if(6371*2*Math.asin(Math.sqrt(Math.min(1,dh)))>130)throw Error("服務搜尋到的站點離目的地城市太遠，為避免搭錯車不採用該站名");}return lat+","+lon};
const a=await geocode(from),b=await geocode(to);
const url="https://api.transitous.org/api/v6/plan?fromPlace="+encodeURIComponent(a)+"&toPlace="+encodeURIComponent(b)+"&numItineraries=3&detailedLegs=true";
const res=await fetch(url,{credentials:"omit"});if(!res.ok)throw Error("路線服務 HTTP "+res.status);const data=await res.json();if(!Array.isArray(data.itineraries)||!data.itineraries.length)throw Error("沒有可用路線，可能該城市尚無公開交通資料");
const choices=data.itineraries.filter(x=>Array.isArray(x.legs)&&x.legs.some(l=>l.mode&&l.mode!=="WALK")).slice(0,3).map(x=>({kind:"transitous",label:"公開交通時刻參考（部分城市可能有即時資料）",minutes:Math.ceil(x.duration/60),transfers:x.transfers,legs:x.legs.map(l=>({mode:l.mode,line:l.displayName||l.routeShortName||l.routeLongName||l.mode,headsign:l.headsign||"請依車站月台資訊確認方向",stations:[l.from,...(l.intermediateStops||[]),l.to].filter(Boolean).map(p=>({zh:p.name||p.stopName||"未命名站",local:p.name||"",en:p.name||"",lat:p.lat,lon:p.lon})),duration:Number(l.duration)||0,realtime:!!l.realTime})),source:"https://transitous.org/sources/"}));if(!choices.length)throw Error("沒有包含大眾運輸的可用路線");
return choices}
async function search(){const from=$("transitFrom").value.trim(),to=$("transitTo").value.trim();if(!from||!to){status("先輸入出發站與抵達站，再按『查詢實際交通路線』。");return}if(from===to){status("起終站相同，請確認目的地");return}const network=window.VoyageSeoulNetwork;const inSeoul=!!window.VoyageRegionV4?.isSeoul(trip());if(network&&inSeoul){const route=network.route(from,to);if(route){draw([route]);return}}const known=inSeoul?routeSEO(key(to),key(from)):null;if(known){draw([known]);return}
status("正在查詢公開交通路線…資料依城市可用程度而不同。");
searchBtn.disabled=true;
try{const rows=await apiSearch(from,to);draw(rows)}catch(err){selectedRoute=null;status("此起終站尚無可驗證的內建站序："+err.message+"。上方「Google Maps 動態規劃」或「NAVER 路線」能帶入這組起終站查詢；請以外部服務提供的當日班次與方向為準，無須自己填寫終點方向。")}finally{searchBtn.disabled=false}}
function stationText(s){const name=(s.zh||s.en||s.local||"未命名站");const alias=[s.local,s.en].filter(Boolean).filter(x=>x!==name);return name+(alias.length?" · "+alias.join(" / "):"")}
function draw(routes){result.replaceChildren(E("h3",{text:"查詢結果 · 請選擇搭乘路線"}));for(const [index,route] of routes.entries()){const card=E("article",{class:"v2-route-card"}),title=E("h3",{text:"路線 "+(index+1)+" · "+(route.minutes?"約 "+route.minutes+" 分（不含候車等差異）":"車程時間需確認")+" · "+route.transfers+" 次轉乘"});card.append(title,E("p",{class:"v1-sub",text:route.label}));for(const [i,leg] of route.legs.entries()){const row=E("div",{class:"v2-route-leg"});row.append(E("strong",{text:(i+1)+". "+(leg.mode==="WALK"?"🚶 步行":"🚆 "+leg.line)}),E("div",{class:"v1-sub",text:leg.headsign||""}));for(const station of leg.stations){row.append(E("div",{class:"v2-route-station",text:stationText(station)}))}card.append(row)}
const source=E("div",{class:"v2-route-source",text:"資料來源："}),link=E("a",{href:route.source,target:"_blank",rel:"noopener noreferrer",text:route.kind==="verified-reference"?"首爾交通路線資料":"Transitous 公開資料源"});source.append(link,E("span",{text:" · 車次、月台方向、步行距離與是否有即時資料以當日官方公告為準"}));card.append(source,E("div",{class:"v1-actions"},[button("加入我的行程",()=>saveRoute(route),"primary"),button("搭乘這條路線",()=>startRide(route))]));result.append(card)}}
function routeStops(route){return route.legs.flatMap((leg,i)=>{const arr=leg.stations||[];return i>0&&arr.length?arr.slice(1):arr})}
function saveRoute(route){const t=trip(),stops=routeStops(route),from=$("transitFrom").value.trim(),to=$("transitTo").value.trim(),time=$("transitTime").value||"11:00";if(!D.validTime(time)){U.toast("請先設定有效出發時間");return}if(!confirm("把查詢到的 "+route.legs.length+" 段交通路線加入 DAY "+(day+1)+"？不會改動其他行程。"))return;const first=route.legs.find(x=>x.mode!=="WALK")||route.legs[0],notes=route.legs.map((l,i)=>(i+1)+". "+l.line+(Number(l.duration)>0?" · 約 "+Math.ceil(l.duration/60)+" 分鐘":"")+"："+l.stations.map(x=>x.zh||x.en).join(" → ")+"\n方向："+l.headsign).join("\n")+"\n資料參考："+route.source+"\n"+route.label;t.days[day].push({id:D.uid(),type:"transport",name:"🚆 "+from+" → "+to,from,to,time,duration:Number(route.minutes)>0?route.minutes:null,line:first?.line||"",notes,source:route.source,routeInfo:D.clone(route),stopSequence:D.clone(stops)});save();render();setTab("itinerary");U.toast("交通路線已加入這一天的時間軸")}
function startRide(route){selectedRoute=route;setTransitMode("ride");$("transitStops").value=routeStops(route).map(x=>stationText(x)).join("\n");if(route.legs[0]?.line)$("transitLine").value=route.legs[0].line+" · "+route.legs[0].headsign;drawRide();result.scrollIntoView({behavior:"smooth",block:"start"});U.toast("已帶入查到的路線；搭乘進度仍需手動或 GPS 輔助確認")}
window.VoyageRouteV2={search,routeSEO,routeStops,startRide,saveRoute,getActiveRoute:()=>selectedRoute};
status("輸入起終站，例如「明洞」與「弘大」，按上方『查詢實際交通路線』即可看到站序及轉乘。非所有國家都支援公開交通資料。");
const oldRender=render;
render=function(){oldRender();refreshRegion()};
refreshRegion();

})();
