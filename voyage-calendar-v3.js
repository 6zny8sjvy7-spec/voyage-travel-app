/* VOYAGE V3: real time-proportional calendar and synchronized embedded map.
   Time ranges are based only on saved times/durations; default rendering estimates are labeled.
   A dashed day order is NOT a calculated road or transit route. */
(function(){
"use strict";
const U=window.VoyageUI,D=window.VoyageDomain;if(!U||!D)throw Error("VOYAGE modules not ready");
const $=id=>document.getElementById(id);
const E=(tag,attrs={},children=[])=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="text")n.textContent=String(v);else if(k==="class")n.className=v;else n.setAttribute(k,String(v))}for(const c of children)n.append(c);return n};
const button=(label,fn,cls="secondary")=>{const b=E("button",{text:label,class:cls});b.type="button";b.onclick=fn;return b};
const typeNames={place:"景點",food:"餐飲",transport:"交通／航班",shop:"購物",hotel:"住宿",flight:"航班",other:"其他"};
const types=[["place","景點"],["food","餐飲"],["transport","交通"],["shop","購物"],["hotel","住宿"],["flight","航班"],["other","其他"]];
const pxPerMin=.93,selected={event:null,day:0},cache=new WeakMap();let movingDate=false,inlineMap=null,inlineLayers=null,lastMapTrip="",overview=false;
const wrap=E("div",{class:"v3-date-wrap"}),marker=E("span",{id:"v3MovingDateIcon",role:"img","aria-label":"日期選取標記",text:"✈"});
const dateRow=$("dates");dateRow.parentNode.insertBefore(wrap,dateRow);wrap.append(dateRow,marker);
const preview=E("section",{id:"v3InlineMap",class:"v3-inline-map"}),mapHead=E("div",{class:"v3-map-head"}),mapDiv=E("div",{id:"v3LeafletMap"}),mapSummary=E("div",{id:"v3MapSummary",class:"v1-notice"});
preview.append(mapHead,mapDiv,mapSummary);
$("events").after(preview);
const form=$("itinerary").querySelector(".formrow"),composer=E("section",{id:"v3Composer",class:"v3-composer"});
if(form)form.before(composer);
function timeInfo(x){const original=Number(x.duration),has=Number.isFinite(original)&&original>0&&original<=2880;const mins=has?Math.round(original):35;const start=D.minutes(x.time);return{start:start===null?9*60:start,duration:mins,actual:has};}
function formatMinutes(min){const n=((min%1440)+1440)%1440;return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")+(min>=1440?"（隔日）":"")}
function category(x){return types.some(a=>a[0]===x.type)?x.type:"place"}
function routeText(x){if(x.type!=="transport")return"";const parts=x.routeInfo?.legs||[];if(parts.length)return parts.map(l=>{const mode=l.mode==="WALK"?"步行":l.line||"搭乘";return mode+(l.duration?(" "+Math.ceil(l.duration/60)+" 分"):"")}).join(" → ");return (x.from||"起點")+" → "+(x.to||"終點")+(x.line?" · "+x.line:"");}
function visibleDays(){const total=trip().days.length,start=Math.floor(day/7)*7;return Array.from({length:Math.min(7,total-start)},(_,i)=>start+i)}
function bounds(indices){let earliest=7*60,latest=21*60;for(const i of indices)for(const x of trip().days[i]||[]){const time=timeInfo(x);earliest=Math.min(earliest,time.start);latest=Math.max(latest,time.start+time.duration)}earliest=Math.max(0,Math.floor((earliest-30)/60)*60);latest=Math.min(2880,Math.ceil((latest+40)/60)*60);return{first:earliest,last:Math.max(latest,earliest+360),height:(Math.max(latest,earliest+360)-earliest)*pxPerMin}}
function makeRuler(b){const r=E("div",{class:"v3-ruler"});for(let t=b.first;t<=b.last;t+=60){r.append(E("span",{class:"v3-hour",text:formatMinutes(t).replace("（隔日）","")}));}return r}
function createEvent(x,dayIndex,b,single=false){const t=timeInfo(x),kind=category(x),y=Math.max(0,(t.start-b.first)*pxPerMin),h=Math.max(28,t.duration*pxPerMin-3),card=E("article",{class:"v3-schedule-event v3-kind-"+kind+(x.done?" is-done":"")+(selected.event===x&&selected.day===dayIndex?" is-selected":""),tabindex:"0",role:"button","aria-label":x.name+"，"+formatMinutes(t.start)+" 至 "+(t.actual?formatMinutes(t.start+t.duration):"未設定結束時間")+"，點選在下方地圖顯示"});
card.style.top=y+"px";card.style.height=h+"px";
const time=E("div",{class:"v3-event-time",text:formatMinutes(t.start)+"–"+(t.actual?formatMinutes(t.start+t.duration):"時間未定")+" · "+(t.actual?t.duration+" 分":"停留分鐘未設定")});
card.append(time,E("strong",{class:"v3-event-name",text:x.name}));
if(kind==="transport"){card.append(E("small",{class:"v3-event-detail",text:routeText(x)||"交通時間"}));}
else if(x.notes&&h>80){card.append(E("small",{class:"v3-event-detail",text:x.notes.slice(0,90)}))}
if(!t.actual)card.append(E("small",{class:"v3-duration-warning",text:"請設定停留分鐘"}));
const click=()=>{selected.event=x;selected.day=dayIndex;if(day!==dayIndex){day=dayIndex;render()}focusPlace(x,{scroll:true});};
card.onclick=click;card.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();click()}};
if(single){card.append(button("編輯",e=>{}, "ghost"));const edit=card.lastElementChild;edit.className="v3-edit-mini";edit.onclick=ev=>{ev.stopPropagation();day=dayIndex;const index=trip().days[dayIndex].indexOf(x);if(index>=0)U.eventEditor(index,false)};}
return card}
function drawGrid(indices,single){const b=bounds(indices),container=E("div",{class:"v3-grid-viewport"}),inner=E("div",{class:"v3-calendar-grid"}),ruler=makeRuler(b);
container.append(ruler,inner);
for(const i of indices){const col=E("section",{class:"v3-time-column"+(i===day?" active-day":""),"data-day":String(i)}),header=E("button",{class:"v3-column-heading",text:"第 "+(i+1)+" 天"+(trip().startDate?" · "+D.dayISO(trip().startDate,i).slice(5):"")});header.onclick=()=>{day=i;selected.day=i;render();syncView()};col.append(header);
const track=E("div",{class:"v3-time-track"});track.style.height=b.height+"px";for(let tick=b.first;tick<=b.last;tick+=60){const line=E("div",{class:"v3-grid-line"});line.style.top=(tick-b.first)*pxPerMin+"px";track.append(line)}
for(const x of trip().days[i]||[])track.append(createEvent(x,i,b,single));
col.append(track);inner.append(col)}
return container}
function drawWeek(){const w=$("week");if(!w)return;const existing=w.querySelector(".v3-grid-viewport"),scrollLeft=existing?existing.scrollLeft:0;const days=visibleDays();w.replaceChildren(E("div",{class:"v3-calendar-top"},[E("strong",{text:"第 "+(days[0]+1)+"–"+(days[days.length-1]+1)+" 天 · 時間行事曆"}),button("← 前七天",()=>{day=Math.max(0,Math.floor(day/7)*7-7);render()}),button("後七天 →",()=>{day=Math.min(trip().days.length-1,Math.floor(day/7)*7+7);render()})]));
const grid=drawGrid(days,false);w.append(grid);grid.scrollLeft=scrollLeft}
renderWeek=drawWeek;
function drawDaily(){const box=$("events");box.replaceChildren(drawGrid([day],true));}
function focusMarker(oldIndex,newIndex){const dates=[...dateRow.querySelectorAll(".date")],target=dates[newIndex];if(!target||!marker)return;const wrapRect=wrap.getBoundingClientRect(),targetRect=target.getBoundingClientRect(),targetX=targetRect.left-wrapRect.left+targetRect.width/2-11;
const old=dates[oldIndex],oldRect=old?.getBoundingClientRect(),oldX=oldRect?(oldRect.left-wrapRect.left+oldRect.width/2-11):targetX;
marker.style.left=targetX+"px";
if(oldIndex!==newIndex&&typeof marker.animate==="function"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
marker.animate([{transform:"translate("+(oldX-targetX)+"px,0)",opacity:.8},{transform:"translate("+(oldX-targetX)*.5+"px,-24px) rotate(13deg)",opacity:1},{transform:"translate(0,0) rotate(0deg)",opacity:1}],{duration:480,easing:"cubic-bezier(.22,.7,.22,1)"});
}}
function decorateDates(){const dates=[...dateRow.querySelectorAll(".date")];dates.forEach((b,i)=>{const old=b.onclick;b.onclick=event=>{const previous=day;old(event);focusMarker(previous,day)};});focusMarker(day,day)}
function ensureMap(){if(inlineMap||!window.L)return;inlineMap=L.map("v3LeafletMap",{zoomControl:true,scrollWheelZoom:false}).setView([Number(trip().lat)||37.5665,Number(trip().lon)||126.978],12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:19}).addTo(inlineMap);
inlineLayers=L.layerGroup().addTo(inlineMap)}
function pinPoints(){return (trip().days[day]||[]).filter(x=>x.type!=="transport"&&Number.isFinite(x.lat)&&Number.isFinite(x.lon))}
function fitMap(){if(!inlineMap)return;const points=pinPoints();if(!points.length){inlineMap.setView([Number(trip().lat)||37.5665,Number(trip().lon)||126.978],11);return}
if(points.length===1)inlineMap.setView([points[0].lat,points[0].lon],14);
else inlineMap.fitBounds(L.latLngBounds(points.map(x=>[x.lat,x.lon])).pad(.22),{maxZoom:14})}
function refreshMap(){mapHead.replaceChildren(E("div",{},[E("h3",{text:"🗺 行程下方地圖"}),E("p",{class:"v1-sub",text:"點上方景點，就在這張地圖定位。不需切換到其他分頁。"})]),E("div",{class:"v3-map-toolbar"},[button("今天全部景點",()=>{overview=true;selected.event=null;refreshMap();fitMap()}),button("在 Google 地圖看全天路線",openDayDirections),button("NAVER 查看地點",()=>{const x=selected.event||pinPoints()[0];if(x)nav(x,"naver");else U.toast("尚無已確認的景點可導航")})]));
ensureMap();if(!inlineMap)return;inlineLayers.clearLayers();
const points=pinPoints();for(const [i,x] of points.entries()){const icon=L.divIcon({html:'<div class="pin">'+(i+1)+"</div>",className:"",iconSize:[30,30],iconAnchor:[15,15]});const marker=L.marker([x.lat,x.lon],{icon}).bindPopup(x.name).addTo(inlineLayers);if(typeof marker.on==="function")marker.on("click",()=>focusPlace(x,{scroll:false}))}
mapSummary.replaceChildren();
if(!points.length){mapSummary.append(E("span",{text:"本日還沒有確認位置的景點。請點行事曆景點，再選擇定位；地圖不會猜測地址。"}))}
else {const name=selected.event&&selected.day===day?selected.event.name:"全日 "+points.length+" 個已定位地點";mapSummary.append(E("strong",{text:name}),E("span",{text:" · 地點依當天行程順序顯示。沒有畫假道路，也不會捏造交通分鐘。"}))}
if(selected.event&&selected.day===day&&Number.isFinite(selected.event.lat)&&Number.isFinite(selected.event.lon)&&!overview){
inlineMap.setView([selected.event.lat,selected.event.lon],16)}else fitMap();
setTimeout(()=>inlineMap.invalidateSize(),130);
}
function focusPlace(x,opts={}){if(x.type==="transport"){selected.event=x;selected.day=day;mapSummary.replaceChildren(E("span",{text:"🚆 "+routeText(x)+"。交通路線尚不能在內嵌地圖以官方軌跡顯示；請使用外部路線服務。"}));if(opts.scroll)preview.scrollIntoView({behavior:"smooth",block:"center"});return}
selected.event=x;selected.day=day;overview=false;
if(!Number.isFinite(x.lat)||!Number.isFinite(x.lon)){mapSummary.replaceChildren(E("span",{text:"「"+x.name+"」尚未確認座標；請先核對地點，才會移動地圖。"}),button("搜尋並確認此地點",()=>geocode(x)));if(opts.scroll)preview.scrollIntoView({behavior:"smooth",block:"center"});return}
refreshMap();
if(opts.scroll)preview.scrollIntoView({behavior:"smooth",block:"center"})}
function openDayDirections(){const t=trip(),points=pinPoints();if(points.length<2){U.toast("當日需要至少兩個已定位景點才能規劃路線");return}
const coord=x=>x.lat+","+x.lon,p0=points[0],pn=points[points.length-1],via=points.slice(1,-1).slice(0,8).map(coord).join("|");
const url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(coord(p0))+"&destination="+encodeURIComponent(coord(pn))+"&travelmode=transit"+(via?"&waypoints="+encodeURIComponent(via):"");
window.open(url,"_blank","noopener");U.toast("已交給外部地圖規劃路線；請核對途經點、路線與搭乘時間。")}
function showComposer(){composer.replaceChildren(E("div",{class:"v3-composer-top"},[E("h3",{text:"＋ 排入今天的行程"}),E("span",{class:"v1-sub",text:"餐飲、景點、購物、交通都可選類別與停留分鐘"})]));
const fields=E("div",{class:"v3-composer-fields"}),type=E("select",{id:"v3NewType"}),time=E("input",{id:"v3NewTime",type:"time",value:"10:00"}),duration=E("input",{id:"v3NewDuration",type:"number",min:"1",max:"1440",value:"45"}),name=E("input",{id:"v3NewName",placeholder:"例如：想吃的烤肉店、景點、地鐵轉乘"}),notes=E("input",{id:"v3NewNotes",placeholder:"食物推薦、地址或其他備註（可留空）"});
for(const [v,label] of types)type.append(E("option",{value:v,text:label}));type.value="food";
const make=(txt,input)=>E("label",{},[E("span",{text:txt}),input]);fields.append(make("類別",type),make("開始時間",time),make("停留／搭乘分鐘",duration),make("名稱",name),make("備註",notes));
composer.append(fields,button("加入當天時間軸",()=>{const t=trip(),tm=time.value,du=Number(duration.value),title=name.value.trim();if(!title||!D.validTime(tm)||!Number.isInteger(du)||du<1||du>1440){U.toast("請填名稱、有效開始時間、1 至 1440 分鐘");return}const item={id:D.uid(),name:title,time:tm,duration:du,type:type.value,notes:notes.value.trim()};const collisions=D.conflicts([...t.days[day],item]);if(collisions.length&&!confirm("時間和既有活動重疊 "+collisions.length+" 組。確定照原時間保留嗎？"))return;t.days[day].push(item);save();render();name.value="";notes.value="";U.toast("已加入 "+title+" · "+du+" 分鐘")},"primary"))}
showComposer();
function onRender(){drawDaily();decorateDates();refreshMap();$("itinerary").querySelectorAll(".v3-schedule-event").forEach(x=>x.setAttribute("data-rendered","true"));
const oldQuick=$("itinerary").querySelector(".formrow");if(oldQuick)oldQuick.classList.add("v3-legacy-quick");}
const before=render;render=function(){before();try{onRender()}catch(e){console.error("VOYAGE calendar+map view:",e)}};
const beforeTab=setTab;setTab=function(tab){beforeTab(tab);if(tab==="itinerary"){setTimeout(()=>{ensureMap();inlineMap?.invalidateSize()},130)}};
window.VoyageCalendar={timeInfo,formatMinutes,bounds,focusPlace,openDayDirections,drawWeek};
render();syncView();
})();
