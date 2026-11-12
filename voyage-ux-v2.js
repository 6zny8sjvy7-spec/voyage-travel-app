/* VOYAGE V2 experience based on the original pastel city travel mockup. */
(function(){
"use strict";
const U=window.VoyageUI,D=window.VoyageDomain;if(!U||!D)throw Error("VOYAGE dependencies missing");
const $=id=>document.getElementById(id);
function el(tag,attrs={},children=[]){const x=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="text")x.textContent=String(v);else if(k==="class")x.className=v;else x.setAttribute(k,String(v))}for(const c of children)x.append(c);return x}
function btn(label,handler,cls="secondary"){const b=el("button",{text:label,class:cls});b.type="button";b.onclick=handler;return b}
const icons={food:"🍜",place:"🏯",shop:"🛍️",transport:"🚆",hotel:"🛏️",flight:"✈️",other:"✨",activity:"🎡"};
function landmark(t){const s=(t.country+" "+t.city).toLowerCase();if(/首爾|seoul|韓國|korea/.test(s))return["🏯","🎐","⛰️","首爾宮殿"];if(/曼谷|bangkok|泰國|thailand/.test(s))return["🛕","🛺","🌅","曼谷寺廟"];if(/東京|tokyo|日本|japan/.test(s))return["🗼","🗻","🌸","東京高塔與富士山"];if(/新加坡|singapore/.test(s))return["🦁","🌺","🌇","新加坡魚尾獅"];if(/巴黎|paris/.test(s))return["🗼","🥐","🌟","巴黎鐵塔"];if(/紐約|new york/.test(s))return["🗽","🌆","✨","紐約自由女神"];if(/倫敦|london/.test(s))return["🎡","🕰️","🌧️","倫敦"];if(/台北|臺北|taipei|台灣|taiwan/.test(s))return["🏙️","🧋","🌇","台灣"];return["🏰","✈️","🌤️","旅遊城市"]}
const home=el("section",{id:"v2Home"}),dayBar=el("div",{id:"v2DayBar"}),banner=el("div",{id:"v2ItineraryBanner"}),art=el("div",{class:"hero-art",role:"img","aria-label":"城市地標"}),dialog=el("dialog",{id:"v2EventDialog"});
$("trips").after(home);
$("dates").after(dayBar);
$("itinerary").insertBefore(banner,$("dates"));
$("top").append(art);
document.body.append(dialog);
function addDay(){const t=trip();if(t.days.length>=366){alert("一趟旅行最多可安排 366 天");return}t.days.push([]);day=t.days.length-1;save();render();syncView()}
function removeLastEmptyDay(){const t=trip();if(t.days.length<=1){alert("至少要留一天");return}if(t.days[t.days.length-1].length){alert("最後一天有活動。先移動或備份，不能直接刪除避免遺失資料");return}if(!confirm("確定移除最後一個空白日期？"))return;t.days.pop();day=Math.min(day,t.days.length-1);save();render()}
function editDate(){const t=trip(),raw=prompt("出發日期（YYYY-MM-DD）。此動作不會刪除或移動原有行程。",t.startDate||"2026-11-12");if(raw===null)return;if(!D.dayISO(raw,0)){alert("日期無效，例如 2026-11-20");return}t.startDate=raw;save();render()}
function renderDayBar(){const t=trip();dayBar.replaceChildren(el("span",{class:"v2-day-count",id:"v2DayCountNotice",text:"現在共 "+t.days.length+" 天，可持續新增"}),btn("＋ 新增一天",addDay,"secondary"),btn("－ 移除末日",removeLastEmptyDay,"ghost"),btn(t.startDate?"📅 "+t.startDate:"📅 設定出發日",editDate,"secondary"));dayBar.children[1].id="v2AddDay";dayBar.children[2].id="v2RemoveDay"}
function mapFor(item){if(item.type==="transport"){setTab("transport");$("transitFrom").value=item.from||"";$("transitTo").value=item.to||"";return}if(!Number.isFinite(Number(item.lat))||!Number.isFinite(Number(item.lon))){if(confirm("這個地點尚未確認座標。現在搜尋並確認位置？"))geocode(item);return}setTab("map");setTimeout(()=>{try{map.setView([Number(item.lat),Number(item.lon)],16);map.invalidateSize()}catch(e){console.warn(e)}},240)}
function showDetails(item,i,d=day){const t=trip(),sym=icons[item.type]||"📍",when=t.startDate?D.dayISO(t.startDate,d):"第 "+(d+1)+" 天";dialog.replaceChildren();const head=el("div",{class:"v2-dialog-title"},[el("span",{text:sym}),el("div",{},[el("h2",{text:item.name}),el("div",{class:"v1-sub",text:when+" · "+(item.time||"未定時間")+" · "+(item.duration?item.duration+" 分鐘":"未設定停留時間")})])]);dialog.append(el("div",{class:"v2-section-label"},[head,btn("✕",()=>dialog.close(),"ghost")]));
if(item.type==="transport")dialog.append(el("p",{class:"v1-notice",text:"🚆 "+(item.from||"出發")+" → "+(item.to||"抵達")+" · "+(item.line||"方向尚未確認")}));
if(item.notes)dialog.append(el("p",{text:item.notes}));if(item.cost)dialog.append(el("p",{class:"v1-sub",text:"預估費用："+D.money(item.cost,t.currency||"TWD")}));
const actions=el("div",{class:"v2-map-actions"});actions.append(btn("🗺 查看地圖",()=>{dialog.close();mapFor(item)}));if(item.type!=="transport")actions.append(btn("Google 導航",()=>nav(item,"google")),btn("NAVER 導航",()=>nav(item,"naver")));
actions.append(btn("✏️ 編輯",()=>{dialog.close();day=d;render();const correct=trip().days[day].indexOf(item);if(correct>=0)U.eventEditor(correct,false)}));dialog.append(actions);dialog.showModal()}
function renderHome(){const t=trip(),v=landmark(t);home.replaceChildren();const card=el("div",{class:"v2-home-hero"}),copy=el("div",{class:"v2-hero-copy"});copy.append(el("div",{class:"eyebrow",text:"MY NEXT JOURNEY"}),el("h2",{text:t.country+" · "+t.city}),el("p",{text:(t.startDate?t.startDate+" 起 · ":"")+t.days.length+" 天 · "+((t.people||[]).length||1)+" 位旅伴"}),el("div",{class:"v2-toolbar"},[btn("＋ 規劃新旅行",()=>$("newTrip").click(),"primary"),btn("管理日期",()=>{setTab("itinerary");editDate()}),btn("邀請朋友",()=>U.showPage("collab"))]));card.append(copy,el("span",{class:"v2-big-icon",text:v[0],role:"img","aria-label":v[3]}),el("span",{class:"v2-small-icon",text:v[1]}));home.append(card);
home.append(el("div",{class:"v2-section-label"},[el("h2",{text:"旅行快速入口"}),el("span",{text:"點一下，就到要用的功能"})]));
const nav=[
["🗓️","我的行程","時間軸與週行事曆",()=>setTab("itinerary")],
["🚇","交通導航","查路線與搭乘",()=>setTab("transport")],
["🗺️","旅行地圖","選景點直接定位",()=>setTab("map")],
["💳","費用與分帳","換匯與結算",()=>U.showPage("expenses")],
["🧳","行李清單","旅伴各自打包",()=>U.showPage("packing")],
["🗣️","即時翻譯","翻譯與朗讀",()=>U.showPage("translation")],
["🏨","機票住宿","預約與地址",()=>U.showPage("documents")],
["✨","探索景點","來源可查的推薦",()=>setTab("discover")],
["👥","多人協作","邀請好友同行",()=>U.showPage("collab")],
["📥","匯入行程","備份與追加匯入",()=>U.showPage("import")],["📚","旅行紀錄","歷史旅行和封存",()=>U.showPage("history")],["📖","旅行回憶","旅程後寫下日記",()=>U.showPage("diary")]
];
const grid=el("div",{class:"v2-quick-grid"});for(const [emoji,label,sub,fn] of nav){const b=el("button",{class:"v2-link"});b.append(el("span",{class:"v2-icon",text:emoji}),el("span",{text:label}),el("small",{text:sub}));b.onclick=fn;grid.append(b)}home.append(grid);
home.append(el("div",{class:"v2-section-label"},[el("h2",{text:"旅程小提醒"}),el("span",{text:"旅行資料會自動儲存在裝置上"})]));
const total=t.days.flat().length,done=t.days.flat().filter(x=>x.done).length;home.append(el("div",{class:"v1-metrics"},[
U.metric(t.days.length+" 天","旅程長度"),U.metric(done+"/"+total,"已完成活動"),U.metric((t.expenses||[]).length+" 筆","費用紀錄"),U.metric((t.packing||[]).length+" 件","行李清單")
]))}
function renderBanner(){const t=trip(),v=landmark(t);banner.replaceChildren(el("div",{},[el("div",{class:"eyebrow",text:"ITINERARY · D"+(day+1)}),el("h3",{text:t.country+" · "+t.city}),el("p",{text:(t.startDate?D.dayISO(t.startDate,day)+" · ":"")+"一天的旅行，由你安排"})]),el("span",{class:"v2-banner-landmark",text:v[0]}));art.replaceChildren(...v.slice(0,3).map(x=>el("span",{text:x})));art.setAttribute("aria-label",v[3])}
function decorateEvents(){const a=trip().days[day]||[];$("events").querySelectorAll(".event").forEach((node,i)=>{const item=a[i];if(!item||node.querySelector(".v2-event-controls"))return;const top=node.querySelector(".event-top");if(top){const icon=el("span",{class:"v2-event-type",text:icons[item.type]||"📍","aria-hidden":"true"});top.insertBefore(icon,top.querySelector(".event-time"))}
node.append(el("div",{class:"v2-event-controls"},[btn("🔎 行程詳情",()=>showDetails(item,i)),btn("🗺 查看地圖",()=>mapFor(item)),...(item.type==="transport"?[btn("🚆 路線",()=>mapFor(item))]:[])]))})}
function customWeek(){const t=trip(),total=t.days.length,start=Math.floor(day/7)*7,w=$("week");w.replaceChildren();w.append(el("div",{class:"v1-weeknav"},[btn("← 上一週",()=>{day=Math.max(0,start-7);render()}),el("strong",{text:"第 "+(start+1)+"–"+Math.min(total,start+7)+" 天"}),btn("下一週 →",()=>{day=Math.min(total-1,start+7);render()})]));const row=el("div",{class:"v2-week-list"});for(let i=start;i<Math.min(total,start+7);i++){const col=el("div",{class:"v2-week-card"});if(i===day)col.setAttribute("aria-current","date");col.append(el("div",{class:"v2-week-day"},[btn("D"+(i+1)+(t.startDate?" · "+D.dayISO(t.startDate,i).slice(5):""),()=>{day=i;weekMode=false;syncView();render()}),el("span",{class:"v1-sub",text:t.days[i].length+" 項"})]));const originals=t.days[i];if(!originals.length)col.append(el("p",{class:"v1-sub",text:"尚未安排行程"}));for(const e of originals.slice().sort((a,b)=>(a.time||"").localeCompare(b.time||""))){const b=el("button",{class:"v2-week-event"});b.append(el("span",{text:icons[e.type]||"📍"}),el("div",{},[el("small",{text:e.time||"未定時間"}),el("b",{text:e.name})]));b.onclick=()=>showDetails(e,originals.indexOf(e),i);col.append(b)}row.append(col)}w.append(row)}
renderWeek=customWeek;
const prevRender=render;
render=function(){prevRender();try{renderDayBar();renderHome();renderBanner();decorateEvents()}catch(err){console.error("VOYAGE V2 view render error",err)}};
window.VoyageV2={addDay,removeLastEmptyDay,editDate,showDetails,mapFor};
render();
})();
