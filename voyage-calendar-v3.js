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
const form=$("itinerary").querySelector(".formrow"),composer=E("section",{id:"v3Composer",class:"v3-composer"}),composerDetails=E("details",{id:"v3ComposerDetails",class:"v3-compose-shell"}),composerToggle=E("summary",{class:"v3-compose-toggle",text:"＋ 安排活動 · 景點／餐飲／交通／購物"});composerDetails.append(composerToggle,composer);
if(form){const switcher=$("itinerary").querySelector(".view-switch");if(switcher)switcher.after(composerDetails);else form.before(composerDetails)}
function timeInfo(x){const original=Number(x.duration),has=Number.isFinite(original)&&original>0&&original<=2880;const mins=has?Math.round(original):35;const start=D.minutes(x.time);return{start:start===null?9*60:start,duration:mins,actual:has,hasStart:start!==null};}
function formatMinutes(min){const n=((min%1440)+1440)%1440;return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")+(min>=1440?"（隔日）":"")}
function category(x){return types.some(a=>a[0]===x.type)?x.type:"place"}
function routeText(x){if(x.type!=="transport")return"";const parts=x.routeInfo?.legs||[];if(parts.length)return parts.map(l=>{const mode=l.mode==="WALK"?"步行":l.line||"搭乘";return mode+(l.duration?(" "+Math.ceil(l.duration/60)+" 分"):"")}).join(" → ");return (x.from||"起點")+" → "+(x.to||"終點")+(x.line?" · "+x.line:"");}
function visibleDays(){const total=trip().days.length,start=Math.floor(day/7)*7;return Array.from({length:Math.min(7,total-start)},(_,i)=>start+i)}
function bounds(indices){let earliest=7*60,latest=21*60;for(const i of indices)for(const x of trip().days[i]||[]){const time=timeInfo(x);earliest=Math.min(earliest,time.start);latest=Math.max(latest,time.start+time.duration)}earliest=Math.max(0,Math.floor((earliest-30)/60)*60);latest=Math.min(2880,Math.ceil((latest+40)/60)*60);return{first:earliest,last:Math.max(latest,earliest+360),height:(Math.max(latest,earliest+360)-earliest)*pxPerMin}}
function makeRuler(b){const r=E("div",{class:"v3-ruler"});for(let t=b.first;t<=b.last;t+=60){r.append(E("span",{class:"v3-hour",text:formatMinutes(t).replace("（隔日）","")}));}return r}
function eventClockLabel(x,t){
 if(x.type==="flight"&&x.documentPhase==="departure"&&x.ticketArriveTime){
  const from=(x.ticketDepartDate||"")+" "+(x.ticketDepartTime||x.time)+" "+(x.ticketStartTZ||"");
  const to=(x.ticketArriveDate||"")+" "+x.ticketArriveTime+" "+(x.ticketEndTZ||"");
  return from+" → "+to+" · 飛行約 "+t.duration+" 分";
 }
 if(x.type==="flight"&&x.documentPhase==="arrival")return "機票顯示抵達 "+(x.ticketArriveDate||"")+" "+(x.ticketArriveTime||x.time)+"（"+(x.ticketEndTZ||"目的地當地")+"）";
 return (t.hasStart?formatMinutes(t.start):"開始時間未設定")+"–"+(t.actual&&t.hasStart?formatMinutes(t.start+t.duration):"結束時間未定")+" · "+(t.actual?t.duration+" 分":"停留分鐘未設定");
}
function createEvent(x,dayIndex,b,single=false){const t=timeInfo(x),kind=category(x),y=Math.max(0,(t.start-b.first)*pxPerMin),h=Math.max(58,t.duration*pxPerMin-3),card=E("article",{class:"v3-schedule-event v3-kind-"+kind+(x.done?" is-done":"")+(selected.event===x&&selected.day===dayIndex?" is-selected":""),tabindex:"0",role:"button","aria-label":x.name+"，"+formatMinutes(t.start)+" 至 "+(t.actual?formatMinutes(t.start+t.duration):"未設定結束時間")+"，點選在下方地圖顯示"});
card.style.top=y+"px";card.style.height=h+"px";
const time=E("div",{class:"v3-event-time",text:eventClockLabel(x,t)});
const symbols={place:"🏛️",food:"🍽️",transport:"🚆",shop:"🛍️",hotel:"🛏️",flight:"✈️",other:"✨"};card.append(time,E("strong",{class:"v3-event-name",text:(symbols[kind]||"📍")+" "+x.name}));
if(kind==="transport"){card.append(E("small",{class:"v3-event-detail",text:routeText(x)||"交通時間"}));}
else if(x.notes&&h>80){card.append(E("small",{class:"v3-event-detail",text:x.notes.slice(0,90)}))}
if(!t.actual)card.append(E("small",{class:"v3-duration-warning",text:"請設定停留分鐘（目前僅為排版占位）"}));
const click=()=>{selected.event=x;selected.day=dayIndex;if(day!==dayIndex){day=dayIndex;render()}focusPlace(x,{scroll:true});};
card.onclick=click;card.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();click()}};card.ondblclick=event=>{event.preventDefault();event.stopPropagation();day=dayIndex;const index=trip().days[dayIndex].indexOf(x);if(index>=0)U.eventEditor(index,false)};
if(true){card.append(button("✎ 編輯",e=>{}, "ghost"));const edit=card.lastElementChild;edit.className="v3-edit-mini";edit.onclick=ev=>{ev.stopPropagation();day=dayIndex;const index=trip().days[dayIndex].indexOf(x);if(index>=0)U.eventEditor(index,false)};}
return card}
function drawGrid(indices,single){const b=bounds(indices),container=E("div",{class:"v3-grid-viewport"}),inner=E("div",{class:"v3-calendar-grid"}),ruler=makeRuler(b);
container.append(ruler,inner);
for(const i of indices){const col=E("section",{class:"v3-time-column"+(i===day?" active-day":""),"data-day":String(i)}),header=E("button",{class:"v3-column-heading",text:"第 "+(i+1)+" 天"+(trip().startDate?" · "+D.dayISO(trip().startDate,i).slice(5)+" "+new Intl.DateTimeFormat("zh-TW",{weekday:"short",timeZone:"UTC"}).format(new Date(D.dayISO(trip().startDate,i)+"T12:00:00Z")):"")});header.onclick=()=>{day=i;selected.day=i;render();syncView()};col.append(header);
const track=E("div",{class:"v3-time-track"});track.style.height=b.height+"px";for(let tick=b.first;tick<=b.last;tick+=60){const line=E("div",{class:"v3-grid-line"});line.style.top=(tick-b.first)*pxPerMin+"px";track.append(line)}
const scheduled=(trip().days[i]||[]).filter(x=>timeInfo(x).hasStart).slice().sort((a,c)=>timeInfo(a).start-timeInfo(c).start);
const lanes=[], cards=[];
for(const x of trip().days[i]||[]){
 const info=timeInfo(x);let lane=0;while(lane<3&&(lanes[lane]??-1)>info.start)lane++;
 lane=Math.min(lane,2);lanes[lane]=info.start+Math.max(info.duration,58/pxPerMin);
 const eventCard=createEvent(x,i,b,single);eventCard.dataset.lane=String(lane);
 if(lane>0)eventCard.classList.add("v3-overlapping");
 cards.push({x,info,lane,card:eventCard});track.append(eventCard);
}
for(const item of cards){
 const competitors=cards.filter(y=>y!==item&&y.info.start<item.info.start+Math.max(item.info.duration,58/pxPerMin)&&item.info.start<y.info.start+Math.max(y.info.duration,58/pxPerMin));
 if(competitors.length){const count=Math.min(3,Math.max(item.lane+1,...competitors.map(y=>y.lane+1)));item.card.style.left=(item.lane*100/count+1)+"%";item.card.style.width=(98/count)+"%";item.card.title="時間有重疊，請核對行程"}
}
if(single){let prev=null;for(const e of scheduled){if(prev){const gap=gapRender(prev,e,b,true);if(gap)track.append(gap)}const end=timeInfo(e).start+timeInfo(e).duration;if(!prev||end>timeInfo(prev).start+timeInfo(prev).duration)prev=e}}

col.append(track);inner.append(col)}
return container}
function gapMinutes(a,b){const x=timeInfo(a),y=timeInfo(b);if(!x.hasStart||!x.actual||!y.hasStart)return 0;return Math.max(0,y.start-x.start-x.duration)}
function addGapTravel(a,b){const before=timeInfo(a),mins=gapMinutes(a,b);if(mins<10)return;composerDetails.open=true;
 $("v3NewType").value="transport";$("v3NewTime").value=formatMinutes(before.start+before.duration).slice(0,5);
 $("v3NewDuration").value="";$("v3NewDuration").placeholder="請核對實際交通分鐘";
 $("v3NewName").value="前往 "+b.name;$("v3NewNotes").value="上一站："+a.name+"；下一站："+b.name+"。目前空檔 "+mins+" 分，尚非實際交通時間。";
 const previousShortcut=composer.querySelector(".v3-gap-search");if(previousShortcut)previousShortcut.remove();
 const routeBtn=button("🚇 搜尋「"+a.name+" → "+b.name+"」交通路線",()=>{
  $("transitFrom").value=a.name;$("transitTo").value=b.name;
  const arrive=timeInfo(a);$("transitTime").value=formatMinutes(arrive.start+arrive.duration).slice(0,5);
  setTab("transport");setTransitMode("plan");
 },"secondary");
 routeBtn.classList.add("v3-gap-search");composer.append(routeBtn);
 composerDetails.scrollIntoView({behavior:"smooth",block:"center"});$("v3NewDuration").focus();
}
function gapRender(a,b,boundsInfo,single){
 const n=gapMinutes(a,b);if(n<15)return null;
 const from=timeInfo(a),y=(from.start+from.duration-boundsInfo.first)*pxPerMin;
 const gap=E("button",{class:"v3-free-gap","aria-label":"未安排的空檔 "+n+" 分鐘，按此排入交通",text:"＋ 空檔 "+n+" 分 · 可加入交通"});
 gap.style.top=(y+3)+"px";gap.style.height=Math.max(16,Math.min(n*pxPerMin-5,25))+"px";
 if(!single&&n<25)gap.classList.add("v3-tiny-gap");
 gap.onclick=()=>addGapTravel(a,b);return gap;
}
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
function weekday(i){const start=trip().startDate,date=start?D.dayISO(start,i):"";return date?new Intl.DateTimeFormat("zh-TW",{weekday:"short",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z")):""}
function decorateDates(){const dates=[...dateRow.querySelectorAll(".date")];dates.forEach((b,i)=>{const wd=weekday(i);if(wd)b.prepend(E("small",{class:"v3-weekday",text:wd}));const old=b.onclick;b.onclick=event=>{const previous=day;old(event);focusMarker(previous,day)};});focusMarker(day,day)}
function ensureMap(){if(inlineMap||!window.L)return;inlineMap=L.map("v3LeafletMap",{zoomControl:true,scrollWheelZoom:false}).setView([Number(trip().lat)||37.5665,Number(trip().lon)||126.978],12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:19}).addTo(inlineMap);
inlineLayers=L.layerGroup().addTo(inlineMap)}
function pinPoints(){return (trip().days[day]||[]).filter(x=>x.type!=="transport"&&Number.isFinite(x.lat)&&Number.isFinite(x.lon))}
function fitMap(){if(!inlineMap)return;const points=pinPoints();if(!points.length){inlineMap.setView([Number(trip().lat)||37.5665,Number(trip().lon)||126.978],11);return}
if(points.length===1)inlineMap.setView([points[0].lat,points[0].lon],14);
else inlineMap.fitBounds(L.latLngBounds(points.map(x=>[x.lat,x.lon])).pad(.22),{maxZoom:14})}
function refreshMap(){mapHead.replaceChildren(E("div",{},[E("h3",{text:"🗺 行程下方地圖"}),E("p",{class:"v1-sub",text:"點上方景點，就在這張地圖定位。不需切換到其他分頁。"})]),E("div",{class:"v3-map-toolbar"},[button("今天全部景點",()=>{overview=true;selected.event=null;refreshMap();fitMap()}),button("Google 地圖：步行順序",openDayDirections),button("NAVER 查看地點",()=>{const x=selected.event||pinPoints()[0];if(x)nav(x,"naver");else U.toast("尚無已確認的景點可導航")})]));
ensureMap();if(!inlineMap)return;inlineLayers.clearLayers();
const points=pinPoints();/* Real street/transit routing is not available in this inline map: show numbered pins only. */for(const [i,x] of points.entries()){const icon=L.divIcon({html:'<div class="pin">'+(i+1)+"</div>",className:"",iconSize:[30,30],iconAnchor:[15,15]});const marker=L.marker([x.lat,x.lon],{icon}).bindPopup(E("span",{text:x.name})).addTo(inlineLayers);if(selected.event===x&&selected.day===day&&typeof marker.openPopup==="function")marker.openPopup();if(typeof marker.on==="function")marker.on("click",()=>focusPlace(x,{scroll:false}))}
mapSummary.replaceChildren();
if(!points.length){mapSummary.append(E("span",{text:"本日還沒有確認位置的景點。請點行事曆景點，再選擇定位；地圖不會猜測地址。"}))}
else {const name=selected.event&&selected.day===day?selected.event.name:"全日 "+points.length+" 個已定位地點";mapSummary.append(E("strong",{text:name}),E("span",{text:" · 已定位的地點以編號顯示；尚未取得實際道路路線時不繪製連線，也不推算交通分鐘。"}));if(selected.event&&selected.day===day){const x=selected.event;const row=E("div",{class:"v1-actions"}),idx=trip().days[day].indexOf(x);if(idx>=0){row.append(button("行程詳情",()=>window.VoyageV2?.showDetails(x,idx,day)),button("編輯時間／停留分鐘",()=>U.eventEditor(idx,false)),button(x.done?"取消完成":"✓ 標記完成",()=>{x.done=!x.done;save();render()}));if(x.type!=="transport")row.append(button("Google 地圖",()=>nav(x,"google")),button("NAVER 地圖",()=>nav(x,"naver")))}mapSummary.append(row)}}
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
const url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(coord(p0))+"&destination="+encodeURIComponent(coord(pn))+"&travelmode=walking"+(via?"&waypoints="+encodeURIComponent(via):"");
window.open(url,"_blank","noopener");U.toast("已交給 Google 地圖規劃步行多站路線；請核對是否需要改搭大眾交通工具。")}
function showComposer(){composer.replaceChildren(E("div",{class:"v3-composer-top"},[E("h3",{text:"＋ 排入今天的行程"}),E("span",{class:"v1-sub",text:"餐飲、景點、購物、交通都可選類別與停留分鐘"})]));
const fields=E("div",{class:"v3-composer-fields"}),type=E("select",{id:"v3NewType"}),time=E("input",{id:"v3NewTime",type:"time",value:"10:00"}),duration=E("input",{id:"v3NewDuration",type:"number",min:"1",max:"1440",value:"45"}),name=E("input",{id:"v3NewName",placeholder:"例如：想吃的烤肉店、景點、地鐵轉乘"}),notes=E("input",{id:"v3NewNotes",placeholder:"食物推薦、地址或其他備註（可留空）"});
for(const [v,label] of types)type.append(E("option",{value:v,text:label}));type.value="food";
const make=(txt,input)=>E("label",{},[E("span",{text:txt}),input]);
const cost=E("input",{id:"v3NewCost",type:"number",min:"0",step:"0.01",value:"0"}),mapLink=E("input",{id:"v3NewMapLink",type:"url",placeholder:"Google Maps／NAVER 分享連結（選填）"});
fields.append(make("類別",type),make("開始時間",time),make("停留／搭乘分鐘",duration),make("名稱",name),make("備註",notes),make("預算／花費（目的地幣別）",cost),make("地點連結（選填）",mapLink));
const shortcuts=E("div",{class:"v3-category-shortcuts"});
for(const [value,label] of [["place","🏞️ 景點"],["food","🍜 餐飲"],["transport","🚆 交通"],["shop","🛍️ 購物"]]){
 const pick=button("＋ "+label,()=>{composerDetails.open=true;type.value=value;name.placeholder=value==="food"?"餐廳、想吃的料理、咖啡店":value==="transport"?"例如：地鐵前往下一站":value==="shop"?"想去的商店或市集":"景點或活動名稱";name.focus()},"secondary");
 shortcuts.append(pick);
}
composerDetails.before(shortcuts);
composer.append(fields,button("加入當天時間軸",()=>{const t=trip(),tm=time.value,du=Number(duration.value),title=name.value.trim();if(!title||!D.validTime(tm)||!Number.isInteger(du)||du<1||du>1440){U.toast("請填名稱、有效開始時間、1 至 1440 分鐘");return}const spending=Number(cost.value||"0"),link=mapLink.value.trim();
if(!Number.isFinite(spending)||spending<0){U.toast("請輸入有效的預算／費用");return}
if(link&&!/^https:\/\//i.test(link)){U.toast("地點連結必須是 HTTPS 網址");return}
const item={id:D.uid(),name:title,time:tm,duration:du,type:type.value,notes:notes.value.trim(),cost:spending,...(link?{mapUrl:link,url:link}:{})};const collisions=D.conflicts([...t.days[day],item]);if(collisions.length&&!confirm("時間和既有活動重疊 "+collisions.length+" 組。確定照原時間保留嗎？"))return;t.days[day].push(item);save();render();name.value="";notes.value="";cost.value="0";mapLink.value="";composerDetails.open=false;U.toast("已加入 "+title+" · "+du+" 分鐘")},"primary"))}
showComposer();
function onRender(){drawDaily();decorateDates();refreshMap();$("itinerary").querySelectorAll(".v3-schedule-event").forEach(x=>x.setAttribute("data-rendered","true"));
const oldQuick=$("itinerary").querySelector(".formrow");if(oldQuick)oldQuick.classList.add("v3-legacy-quick");}
const before=render;render=function(){before();try{onRender()}catch(e){console.error("VOYAGE calendar+map view:",e)}};
const beforeTab=setTab;setTab=function(tab){beforeTab(tab);if(tab==="itinerary"){setTimeout(()=>{ensureMap();inlineMap?.invalidateSize()},130)}};
window.VoyageCalendar={timeInfo,formatMinutes,bounds,focusPlace,openDayDirections,drawWeek};
render();syncView();
})();
