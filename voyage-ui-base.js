/* VOYAGE integrated UI shell: extends existing itinerary without destructive storage migration */
(function(){
"use strict";
const D=window.VoyageDomain;if(!D)throw Error("缺少 VoyageDomain");
const E=(tag,attrs={},children=[])=>{const x=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="text")x.textContent=v;else if(k==="class")x.className=v;else if(k==="value")x.value=v;else x.setAttribute(k,v)}for(const c of children)x.append(c);return x};
const $v=id=>document.getElementById(id);
let page="overview",weekStart=0,noticeVersion=0;
const pages={};
const css=(function(){/*
body[data-tab] #v1More,body[data-tab] #v1Summary{display:none}
body[data-tab='more'] #v1More,body[data-tab='trips'] #v1Summary{display:block}
body[data-tab='more'] #moreSection{display:none}
.v1-pills{display:flex;gap:7px;overflow-x:auto;padding-bottom:14px;white-space:nowrap}
.v1-pills button{padding:9px 13px;border-radius:12px;background:var(--soft);color:var(--ink);flex-shrink:0}
.v1-pills button.active{background:#2878d4;color:#fff}
.v1-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.v1-metric{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--soft)}
.v1-metric strong{display:block;font-size:20px;overflow-wrap:anywhere}.v1-metric small{color:var(--muted)}
.v1-box{border:1px solid var(--line);border-radius:16px;padding:14px;margin:12px 0;background:var(--card)}
.v1-box h3{font-size:16px;margin:0 0 8px}.v1-stack{display:grid;gap:10px}
.v1-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:12px 0}
.v1-fields label,#v1DialogFields label{display:grid;gap:4px;font-size:13px;color:var(--muted)}
.v1-fields input,.v1-fields select,.v1-fields textarea,#v1DialogFields input,#v1DialogFields select,#v1DialogFields textarea{width:100%;min-width:0;padding:10px;border:1px solid var(--line);border-radius:11px;color:var(--ink);background:var(--card);font:inherit}
.v1-fields label.full,#v1DialogFields label.full{grid-column:1/-1}
.v1-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.v1-actions button{font-size:13px}
.v1-item{display:flex;align-items:flex-start;gap:8px;padding:12px 2px;border-bottom:1px solid var(--line)}
.v1-item-main{flex:1;min-width:0}.v1-sub{font-size:12px;color:var(--muted);overflow-wrap:anywhere}
.v1-struck{text-decoration:line-through;opacity:.55}.v1-chip{font-size:11px;padding:3px 7px;background:var(--soft);border-radius:8px;display:inline-block}
.v1-notice{padding:12px;background:var(--soft);border-radius:12px;font-size:13px;margin:10px 0;white-space:pre-line}
.v1-warning{padding:10px;border:1px solid #d79220;background:#fff3d8;color:#6c4711;border-radius:10px;margin:10px 0}
.v1-tablewrap{max-width:100%;overflow-x:auto}.v1-table{border-collapse:collapse;width:100%;min-width:430px;font-size:13px}
.v1-table th,.v1-table td{border-bottom:1px solid var(--line);padding:9px;text-align:left}
.v1-check{width:19px;height:19px;flex:none}
#v1Dialog{border:1px solid var(--line);border-radius:22px;box-shadow:0 24px 80px #0005;background:var(--card);color:var(--ink);width:min(640px,calc(100vw - 20px));max-height:calc(100dvh - 25px);overflow-y:auto;padding:18px}
#v1Dialog::backdrop{background:#0a234a85}#v1DialogFields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:11px}
.v1-modal-head,.v1-form-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}
.v1-form-actions{justify-content:flex-end;margin:20px 0 0}#v1DialogTitle{margin:0;font-size:20px}
#v1ExpenseQuick{position:fixed;z-index:1002;bottom:calc(75px + env(safe-area-inset-bottom));right:16px;border-radius:99px;box-shadow:0 8px 25px #1c538a66;font-size:14px}
#v1Notice{display:none;position:fixed;z-index:1100;top:12px;left:50%;transform:translateX(-50%);width:min(550px,92vw);padding:10px 16px;background:#183453;color:#fff;border-radius:12px;box-shadow:0 8px 30px #0004}
#v1Notice.show{display:block}
#itinerary .v1-extra{font-size:12px;color:var(--muted);margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.v1-week{display:flex;gap:8px;overflow-x:auto;padding:6px 0 14px;scroll-snap-type:x proximity}
.v1-week .weekcol{min-width:175px;flex:1;scroll-snap-align:start}
.v1-weeknav{display:flex;gap:8px;justify-content:space-between;align-items:center}
.v1-phrase{display:grid;gap:5px;border-bottom:1px solid var(--line);padding:12px 0}
@media(max-width:600px){#v1More{padding:15px}#v1ExpenseQuick{right:11px;padding:10px 13px}#v1Dialog{width:calc(100vw - 16px)}.v1-week .weekcol{min-width:165px}}
*/}).toString().split("/*")[1].split("*/")[0];
document.head.append(E("style",{text:css}));
const root=E("section",{id:"v1More",class:"card"}),summary=E("section",{id:"v1Summary",class:"card"}),notice=E("div",{id:"v1Notice",role:"status"}),quick=E("button",{id:"v1ExpenseQuick",class:"primary",text:"＋ 記帳"}),dialog=E("dialog",{id:"v1Dialog"});
root.innerHTML='<div class="eyebrow">旅行工具</div><h2>旅行工具</h2><div id="v1Menu" class="v1-pills"></div><div id="v1Content"></div>';
dialog.innerHTML='<div class="v1-modal-head"><h2 id="v1DialogTitle">編輯</h2><button class="secondary" id="v1DialogClose" type="button">✕</button></div><form id="v1DialogForm"><div id="v1DialogFields"></div><div id="v1DialogWarning" class="v1-warning hidden"></div><div class="v1-form-actions"><button class="secondary" type="button" id="v1Cancel">取消</button><button class="primary" type="submit">儲存</button></div></form>';
document.querySelector("main.shell").append(root);document.getElementById("trips").after(summary);
document.body.append(notice,quick,dialog);
$v("v1DialogClose").onclick=() => dialog.close();$v("v1Cancel").onclick=()=>dialog.close();
function toast(message){const n=$v("v1Notice"),key=++noticeVersion;n.textContent=message;n.classList.add("show");setTimeout(()=>{if(key===noticeVersion)n.classList.remove("show")},4200)}
function current(){const t=trip();if(!t.people||!t.people.length)t.people=["我"];if(!Array.isArray(t.packing))t.packing=[];if(!Array.isArray(t.expenses))t.expenses=[];if(!Array.isArray(t.documents))t.documents=[];t.currency=t.currency||"TWD";return t}
function button(label,cb,cls="secondary"){const b=E("button",{class:cls,text:label});b.type="button";b.onclick=cb;return b}
function field(id,title,type="text",value="",opts={}){const w=E("label",{class:opts.full?"full":""});w.append(E("span",{text:title}));let x;if(type==="select"){x=E("select",{id});for(const [v,label] of opts.options||[])x.append(E("option",{value:v,text:label}));x.value=String(value)}else if(type==="textarea"){x=E("textarea",{id});x.rows=3;x.value=String(value??"")}else{x=E("input",{id,type,value:String(value??"")});if(opts.min!==undefined)x.min=opts.min;if(opts.step!==undefined)x.step=opts.step;if(opts.placeholder)x.placeholder=opts.placeholder}w.append(x);return w}
function get(id){return $v(id).value.trim()}
function openDialog(title,fields,submit){$v("v1DialogTitle").textContent=title;$v("v1DialogWarning").classList.add("hidden");$v("v1DialogFields").replaceChildren(...fields);$v("v1DialogForm").onsubmit=e=>{e.preventDefault();try{const ok=submit();if(ok!==false){dialog.close();save();render()}}catch(err){$v("v1DialogWarning").textContent=err.message;$v("v1DialogWarning").classList.remove("hidden")}};dialog.showModal()}
function currencyGuess(t){const c=t.currency;if(c&&c!=="TWD")return c;const s=t.country+" "+t.city;return /韓國|Korea/i.test(s)?"KRW":/日本|Japan/i.test(s)?"JPY":/泰國|Thailand/i.test(s)?"THB":/新加坡|Singapore/i.test(s)?"SGD":/美國|USA|United States/i.test(s)?"USD":"TWD"}
function tripEditor(){const t=current();openDialog("旅行設定",[
field("vTripName","旅行名稱","text",t.name),field("vTripDate","開始日期（可留空）","date",t.startDate||""),field("vTripBudget","旅程預算（台幣）","number",t.budget||0,{min:0}),
field("vTripCurrency","目的地幣別","select",currencyGuess(t),{options:["TWD","KRW","JPY","THB","USD","EUR","SGD","HKD","CNY","GBP","AUD","CAD","VND","MYR","PHP","IDR"].map(c=>[c,c])}),
field("vTripPeople","旅伴名稱（以頓號分隔）","text",t.people.join("、"),{full:true}),field("vTripNotes","旅行備註","textarea",t.notes||"",{full:true})
],()=>{const name=get("vTripName"),date=get("vTripDate"),ps=get("vTripPeople").split(/[、,，]/).map(s=>D.clean(s,40)).filter(Boolean);if(!name)throw Error("旅行名稱不可空白");if(date&&!D.dayISO(date,0))throw Error("開始日期有誤");t.name=name;t.startDate=date;t.budget=D.amount(get("vTripBudget"))||0;t.currency=get("vTripCurrency");t.people=ps.length?[...new Set(ps)]:["我"];t.notes=get("vTripNotes");return true})}
function eventEditor(index,isNew=false){const t=current(),events=t.days[day],e=isNew?{name:"",time:"10:00",duration:60,type:"place"}:events[index];if(!e)return;openDialog(isNew?"新增完整行程":"編輯行程",[
field("vEvName","名稱","text",e.name),field("vEvType","類別","select",e.type||"place",{options:[["place","景點"],["food","餐飲"],["shop","購物"],["transport","交通"],["hotel","住宿"],["flight","航班"],["other","其他"]]}),
field("vEvTime","開始時間","time",e.time||"10:00"),field("vEvDuration","預估分鐘","number",e.duration||60,{min:0}),
field("vEvNotes","備註／地址／預訂資訊","textarea",e.notes||"",{full:true}),field("vEvCost","預估費用（旅行幣別）","number",e.cost||0,{min:0,step:"0.01"}),
field("vEvURL","地點網址（HTTPS）","url",e.mapUrl||e.url||"",{full:true}),field("vEvPhoto","可選填景點照片 HTTPS 網址（不支援相簿上傳）","url",e.photoUrl||"",{full:true}),field("vEvFrom","交通起點","text",e.from||""),field("vEvTo","交通終點","text",e.to||""),field("vEvLine","路線及搭乘方向","text",e.line||"")
],()=>{const name=get("vEvName"),time=get("vEvTime"),duration=Number(get("vEvDuration")),url=get("vEvURL");if(!name||!D.validTime(time)||!Number.isFinite(duration)||duration<0||duration>2880)throw Error("請填名稱、有效時間及合理分鐘數");if(url&&!/^https:\/\//i.test(url))throw Error("連結必須是 HTTPS");const x={...e,name,time,duration,type:get("vEvType"),notes:get("vEvNotes"),cost:D.amount(get("vEvCost"))||0,from:get("vEvFrom"),to:get("vEvTo"),line:get("vEvLine")};if(url){x.url=url;if(/(google|naver|goo\.gl|naver\.me)/i.test(url))x.mapUrl=url}else{delete x.url;delete x.mapUrl}const photo=get("vEvPhoto");if(photo&&!/^https:\/\//i.test(photo))throw Error("照片必須使用 HTTPS 網址");if(photo)x.photoUrl=photo;else delete x.photoUrl;if(!isNew&&e.name!==name){delete x.lat;delete x.lon}const all=events.filter((_,i)=>isNew||i!==index),conflicts=D.conflicts([...all,x]);if(conflicts.length&&!confirm("時間與既有行程重疊。保留原有時間並儲存嗎？"))return false;if(isNew)events.push(x);else events[index]=x;return true})}
function metric(value,label){const n=E("div",{class:"v1-metric"});n.append(E("strong",{text:String(value)}),E("small",{text:label}));return n}
function summaryRender(){const t=current(),total=t.days.flat().length,done=t.days.flat().filter(x=>x.done).length;let countdown="未設定出發日期";if(t.startDate&&D.dayISO(t.startDate,0)){const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:t.tz||"UTC",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(p=>[p.type,p.value]));const today=parts.year+"-"+parts.month+"-"+parts.day,diff=Math.round((Date.parse(t.startDate+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/86400000);countdown=diff>0?"倒數 "+diff+" 天":diff===0?"今天出發":"已開始 "+(-diff)+" 天"}const spent=t.expenses.reduce((a,e)=>a+(Number(e.twd)||0),0);summary.replaceChildren(E("div",{class:"eyebrow",text:"旅行概況"}),E("h2",{text:t.city+" · "+countdown}),E("div",{class:"v1-metrics"},[metric(t.days.length,"旅行天數"),metric(done+"/"+total,"完成活動"),metric(D.money(spent,"TWD"),"已記帳（台幣）"),metric(t.people.length,"旅伴人數")]),E("div",{class:"v1-actions"},[button("✎ 旅行設定",tripEditor),button("＋ 完整行程",()=>{setTab("itinerary");eventEditor(0,true)}),button("費用",()=>showPage("expenses")),button("行李",()=>showPage("packing"))]));if(t.notes)summary.append(E("p",{class:"v1-sub",text:t.notes}))}
function renderMore(){const tabs=[["overview","我的工具"],["history","旅行紀錄"],["diary","旅行回憶"],["wishlist","購物願望"],["import","匯入／備份"],["collab","好友共編"]],menu=$v("v1Menu");menu.replaceChildren();tabs.forEach(([id,label])=>menu.append(button(label,()=>{page=id;renderMore()},page===id?"active":"")));const box=$v("v1Content");box.replaceChildren();if(pages[page])pages[page](box);else box.append(E("p",{text:"功能模組載入中或尚未連接"}))}
function showPage(which){page=which;setTab("more");renderMore();root.scrollIntoView({block:"start"})}
function backup(){const blob=new Blob([JSON.stringify({version:3,exportedAt:new Date().toISOString(),trips},null,2)],{type:"application/json"}),href=URL.createObjectURL(blob),a=E("a",{href,download:"voyage-backup-"+new Date().toISOString().slice(0,10)+".json"});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000)}
function eventExtras(){const a=current().days[day];$v("events").querySelectorAll(".event").forEach((node,i)=>{const e=a[i];if(!e)return;const info=node.querySelector(".event-detail");if(info){const details=[e.type&&e.type!=="place"?"類別："+e.type:"",Number(e.duration)>0?"預估 "+e.duration+" 分鐘":"",e.notes||"",e.cost?"預估 "+D.money(e.cost,current().currency):""].filter(Boolean).join(" · ");if(details)info.after(E("div",{class:"v1-extra",text:details}))}const edit=[...node.querySelectorAll(".event-actions button")].find(x=>x.textContent==="編輯");if(edit)edit.onclick=()=>eventEditor(i,false)});const conflicts=D.conflicts(a);if(conflicts.length)$v("events").prepend(E("div",{class:"v1-warning",text:"⚠ "+conflicts.length+" 組行程時間重疊；不會自動改動行程時間。"}))}
function weekRender(){const t=current(),total=t.days.length;weekStart=Math.min(Math.max(weekStart,0),Math.floor((total-1)/7)*7);const w=$v("week");w.replaceChildren();const nav=E("div",{class:"v1-weeknav"});nav.append(button("← 前 7 天",()=>{weekStart=Math.max(0,weekStart-7);weekRender()}),E("strong",{text:"DAY "+(weekStart+1)+"–"+Math.min(total,weekStart+7)}),button("後 7 天 →",()=>{weekStart=Math.min(Math.floor((total-1)/7)*7,weekStart+7);weekRender()}));const grid=E("div",{class:"v1-week"});t.days.slice(weekStart,weekStart+7).forEach((events,j)=>{const i=weekStart+j,col=E("div",{class:"weekcol"}),title="DAY "+(i+1)+(t.startDate?" · "+D.dayISO(t.startDate,i).slice(5):"");col.append(button(title,()=>{day=i;weekMode=false;syncView();render()}));events.slice().sort((a,b)=>(a.time||"").localeCompare(b.time||"")).forEach(e=>col.append(button((e.time||"未定")+" · "+e.name,()=>{day=i;weekMode=false;syncView();render()},"weekevent")));grid.append(col)});w.append(nav,grid)}
const advanced=E("div",{class:"v1-actions"},[button("＋ 完整行程資料",()=>eventEditor(0,true),"primary"),button("旅行日期與預算",tripEditor)]);
$v("itinerary").append(advanced);
$v("mapSection").append(E("div",{class:"v1-actions"},[button("在 Google 地圖規劃當日多站路線",()=>{const t=current(),list=t.days[day].filter(x=>x.type!=="transport"&&(x.name||"").trim());if(list.length<2){toast("至少需要兩個目的地");return}const query=x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)?x.lat+","+x.lon:x.name+", "+t.city+", "+t.country;const first=query(list[0]),last=query(list[list.length-1]),mid=list.slice(1,-1).slice(0,8).map(query).join("|"),url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(first)+"&destination="+encodeURIComponent(last)+"&travelmode=walking"+(mid?"&waypoints="+encodeURIComponent(mid):"");window.open(url,"_blank","noopener");toast("外部地圖會計算真實道路，請核對交通方式")})]));
try{trips=trips.map(D.normaliseTrip);save()}catch(e){console.warn("舊資料無法全數遷移，未覆寫",e)}
pages.overview=box=>box.append(E("p",{text:"旅行資料預設儲存在這台裝置的瀏覽器中；跨裝置同步需先連接真正的雲端服務。"}),E("div",{class:"v1-actions"},[button("修改旅行",tripEditor),button("匯出完整備份",backup),button("備份設定",()=>$v("settingsToggle").click())]),E("div",{class:"v1-notice",text:"真正的車輛即時到站、AI 網路建議、多人同步須有可靠資料源或後端；此版不會捏造即時狀態。"}));
renderWeek=weekRender;
const originalRender=render;render=function(){originalRender();try{summaryRender();renderMore();eventExtras()}catch(e){console.error("VOYAGE 擴充畫面",e)}};
quick.onclick=()=>{if(typeof window.VoyageUI.addExpense==="function")window.VoyageUI.addExpense();else toast("費用模組尚未載入")};
window.VoyageUI={E,$v,D,button,field,get,openDialog,metric,toaster:toast,toast,current,tripEditor,eventEditor,backup,renderMore,showPage,pages,dialog,root};
render();
})();
