/* VOYAGE route/map list sync, schedule category decorations, lightweight city accents */
(function(){
"use strict";
const U=window.VoyageUI;if(!U)return;const {E,$v,D,button,current,toast}=U;
const list=E("div",{id:"v1MapStops",class:"v1-box"});$v("mapSection").append(list);
const icons=[["首爾","🏯"],["Seoul","🏯"],["釜山","🌊"],["Busan","🌊"],["東京","🗼"],["Tokyo","🗼"],["大阪","🏯"],["Osaka","🏯"],["曼谷","🛕"],["Bangkok","🛕"],["新加坡","🦁"],["Singapore","🦁"],["台北","🏙️"],["臺北","🏙️"],["高雄","⛵"],["巴黎","🗼"],["Paris","🗼"],["紐約","🗽"],["New York","🗽"],["倫敦","🎡"],["London","🎡"]];
function decorate(){const events=current().days[day];const display=document.querySelectorAll("#events .event");display.forEach((node,i)=>{const x=events[i];if(!x)return;const type=x.type||"place";node.dataset.kind=type;node.style.borderRight=type==="transport"?"3px solid #46a8d8":type==="food"?"3px solid #edb55e":type==="hotel"?"3px solid #a69ae6":"none";const time=node.querySelector(".event-time"),start=D.minutes(x.time);if(time&&start!==null&&Number(x.duration)>0){const end=start+Number(x.duration);const label=String(Math.floor((end%1440)/60)).padStart(2,"0")+":"+String(end%60).padStart(2,"0")+(end>=1440?"（隔日）":"");time.textContent=x.time+"–"+label}})}
function mapStops(){const t=current(),events=t.days[day];list.replaceChildren(E("h3",{text:"DAY "+(day+1)+" · 地圖與行程清單"}));let locationCount=0;
for(const [i,item] of events.entries()){const row=E("div",{class:"v1-item"}),body=E("div",{class:"v1-item-main"});body.append(E("b",{text:(i+1)+". "+item.name}),E("div",{class:"v1-sub",text:(item.time||"未定")+" · "+(item.type==="transport"?"交通規劃":Number.isFinite(item.lat)&&Number.isFinite(item.lon)?"已有地理座標":"尚未確認地圖位置")}));const action=E("div",{class:"v1-actions"});if(Number.isFinite(item.lat)&&Number.isFinite(item.lon)){locationCount++;action.append(button("定位在地圖",()=>{map.setView([item.lat,item.lon],16);map.invalidateSize()}))}
if(item.type==="transport")action.append(button("搭乘助手",()=>{setTab("transport");$v("transitFrom").value=item.from||"";$v("transitTo").value=item.to||"";$v("transitLine").value=item.line||"";setTransitMode("ride")}));
else{action.append(button("Google",()=>nav(item,"google")),button("NAVER",()=>nav(item,"naver")));if(!Number.isFinite(item.lat)||!Number.isFinite(item.lon))action.append(button("確認座標",()=>geocode(item)))}
body.append(action);row.append(body);list.append(row)}
if(!events.length)list.append(E("p",{class:"v1-sub",text:"目前沒有活動。先從行程頁新增，再決定是否定位。"}));
list.append(E("p",{class:"v1-sub",text:"已定位："+locationCount+" 項。地圖使用 OpenStreetMap 圖磚；尚無內嵌即時轉乘計算，外部導航會自行規劃實際道路。"}))}
function cityAccent(){const t=current(),h=$v("v1Summary")?.querySelector("h2");if(!h)return;const symbol=icons.find(([k])=>(t.city||"").includes(k))?.[1]||"✈️";h.textContent=symbol+" "+h.textContent}
const original=drawMap;drawMap=function(){original();mapStops();decorate()};
const originalRender=render;render=function(){originalRender();cityAccent()};
try{render()}catch(e){console.error("地圖列表載入失敗",e)}
})();
