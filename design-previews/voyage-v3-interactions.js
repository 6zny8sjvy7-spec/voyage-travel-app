(function voyageV2Interactions(){
"use strict";
/* V3 interactive visual draft; live itinerary, weather, translations and routing APIs intentionally not connected. */
const tabs=[["home","🏠","首頁","為旅行，留一點期待 ✨"],["itinerary","🗓️","行程","今天的旅行故事 ✨"],["transport","🚇","交通","搭對車，玩得更安心"],["translate","🗣️","翻譯","旅行溝通小幫手"],["expenses","💳","費用","旅途的小小錢包"],["more","🧳","更多","旅行工具箱"]];
const countries={
 kr:{name:"首爾",lang:"韓文",caption:"從漢江到首爾塔，每一站都有小驚喜",sticker:["💌","🧳"],mode:"🚇 首爾地鐵 4 號線",direction:"往舍堂（사당）／烏耳島（오이도）方向（示意，實際需核對列車終點）",greeting:"首爾交通卡｜搭車之前，先對照韓文站牌",stops:[["明洞","명동","424"],["會賢","회현","425"],["首爾站","서울역","426"]]},
 jp:{name:"東京",lang:"日文",caption:"街角櫻花和小電車，一起收藏東京日常",sticker:["🌸","🍡"],mode:"🚇 東京 Metro 銀座線 G",direction:"往淺草方向（靜態站序示例）",greeting:"東京交通卡｜繁中加日文，現場對照更容易",stops:[["銀座","銀座","G09"],["京橋","京橋","G10"],["日本橋","日本橋","G11"],["三越前","三越前","G12"],["神田","神田","G13"],["末廣町","末広町","G14"],["上野廣小路","上野広小路","G15"],["上野","上野","G16"],["稻荷町","稲荷町","G17"],["田原町","田原町","G18"],["淺草","浅草","G19"]]},
 th:{name:"曼谷",lang:"泰文",caption:"搭上 BTS，遇見閃閃發光的曼谷午後",sticker:["🥥","🌺"],mode:"🚝 BTS Sukhumvit 線",direction:"往凱哈（เคหะฯ／Kheha）方向（靜態站序示例）",greeting:"曼谷交通卡｜泰文＋繁中，對照站名與站序",stops:[["暹羅","สยาม","Siam"],["奇隆","ชิดลม","Chit Lom"],["奔集","เพลินจิต","Phloen Chit"],["娜娜","นานา","Nana"],["阿索克","อโศก","Asok"]]},
 vn:{name:"胡志明市",lang:"越南文",caption:"小摩托、熱帶街景，城市裡的慢慢旅行",sticker:["🛵","🍜"],mode:"🚇 胡志明市 Metro 1 號線",direction:"往仙泉巴士總站方向（站序示例）",greeting:"越南交通卡｜中文為參考譯名，現場以越文原名為準",stops:[["濱城","Bến Thành",""],["市立劇院","Nhà hát Thành phố",""],["巴山","Ba Son",""],["文聖","Văn Thánh",""],["新港","Tân Cảng",""],["草田","Thảo Điền",""],["安富","An Phú",""],["瀝隻","Rạch Chiếc",""],["福隆","Phước Long",""],["平泰","Bình Thái",""],["守德","Thủ Đức",""],["高科技園區","Khu Công nghệ cao",""],["國家大學","Đại học Quốc gia",""],["仙泉巴士總站","Bến xe Suối Tiên",""]]}
};
const $=id=>document.getElementById(id);
let current="home",country="kr",weather="sun",selectedDay=2;
function fmt(stop){return stop[0]===stop[1]?stop[0]:stop[0]+"（"+stop[1]+"）"}
function sceneSvg(code){
const common=`
<g class="soft-cloud" fill="#ffffffe0"><ellipse cx="160" cy="72" rx="56" ry="18"/><circle cx="141" cy="62" r="22"/><circle cx="172" cy="54" r="24"/><ellipse cx="374" cy="80" rx="40" ry="14"/><circle cx="369" cy="68" r="21"/></g>
<g class="city-flight"><path d="M254 48l14 -14 -2 16 25 9 -5 6 -26 -7 -13 9 -4 -2 5 -13 -16 -4z" fill="#fff" stroke="#6d90af" stroke-width="2.2"/></g>
<path d="M0 288 Q115 258 229 285 T458 278 T720 282 V360 H0Z" fill="#aad8c2" opacity=".8"/>
<g fill="#91b8d3" stroke="#fff7" stroke-width="3"><rect x="15" y="211" width="75" height="113" rx="9"/><rect x="93" y="183" width="86" height="144" rx="9"/><rect x="185" y="236" width="59" height="92" rx="8"/><rect x="634" y="217" width="52" height="111" rx="8"/></g>
<g fill="#fff3bc" class="city-light"><rect x="33" y="230" width="9" height="13" rx="2"/><rect x="59" y="256" width="9" height="13" rx="2"/><rect x="115" y="206" width="11" height="15" rx="2"/><rect x="150" y="253" width="10" height="16" rx="2"/><rect x="651" y="242" width="12" height="14" rx="2"/></g>
<g class="city-bird" stroke="#789ab0" stroke-width="3" fill="none" stroke-linecap="round"><path d="M437 58q9 -10 17 0q8 -9 16 0"/></g>`;
const kr=`<path d="M295 301Q405 218 530 259T720 275V360H280Z" fill="#91c7a4"/>
<g stroke="#617f98" stroke-width="4"><path d="M489 249L508 102 524 249Z" fill="#fff4e9"/><rect x="484" y="154" width="53" height="24" rx="8" fill="#ed9aa7"/><rect x="492" y="181" width="37" height="10" rx="4" fill="#f5fcff"/><path d="M515 102V70" stroke-width="5"/></g>
<g fill="#e8edfa" stroke="#7ba2ba" stroke-width="3"><rect x="300" y="236" width="78" height="55" rx="10"/><rect x="390" y="238" width="48" height="45" rx="7"/></g>
<path d="M0 313Q170 298 340 310T720 310V360H0Z" fill="#a6d9e6" opacity=".85"/>
<path d="M0 304H720" stroke="#7492b3" stroke-width="7" opacity=".6"/>
<g fill="#f4ceda"><circle cx="311" cy="211" r="12"/><circle cx="328" cy="206" r="9"/><circle cx="612" cy="207" r="12"/></g>`;
const jp=`<g stroke="#d5777a" stroke-linejoin="round"><path d="M498 278L546 102 589 278Z" fill="#ffede8" stroke-width="10"/><path d="M520 202h52M528 177h37M541 144h17M516 239h64" stroke-width="9"/><path d="M546 102V69" stroke-width="5"/></g>
<g fill="#ffe0e7"><circle cx="299" cy="200" r="28"/><circle cx="326" cy="167" r="30"/><circle cx="353" cy="192" r="28"/><circle cx="368" cy="162" r="17"/></g><path d="M335 239v69" stroke="#977f88" stroke-width="9"/>
<g fill="#fff4d1" stroke="#8899b8" stroke-width="3"><rect x="408" y="245" width="80" height="63" rx="9"/><path d="M402 246l46 -36 47 36" fill="#e6abb8"/><rect x="439" y="266" width="22" height="41" rx="3" fill="#b5cbd9"/></g>
<path d="M0 310H720" stroke="#ccadab" stroke-width="9"/>`;
const th=`<path d="M0 279H720" stroke="#8a77b1" stroke-width="15"/><path d="M0 292H720" stroke="#e9d7e7" stroke-width="5"/>
<g stroke="#ab84a4" stroke-width="6"><path d="M88 281v57M288 281v57M624 281v57"/></g>
<g fill="#ffebbd" stroke="#ba8e77" stroke-width="4"><path d="M402 294L432 210 461 294Z"/><path d="M482 294L518 153 556 294Z"/><path d="M574 295L596 221 625 295Z"/><path d="M506 154L518 97 530 154Z" fill="#f6c980"/><path d="M421 213L433 171 441 213Z" fill="#f6c980"/><rect x="378" y="283" width="264" height="25" rx="5" fill="#ffe7ac"/></g>
<path d="M259 311q8 -76 48 -105" stroke="#6faf90" stroke-width="7" fill="none"/>
<g fill="#7dbe9a"><ellipse cx="298" cy="207" rx="40" ry="11" transform="rotate(-34 298 207)"/><ellipse cx="304" cy="203" rx="39" ry="12" transform="rotate(26 304 203)"/></g>`;
const vn=`<g stroke="#bc8f85" stroke-width="4" fill="#ffeac3"><rect x="341" y="236" width="254" height="74" rx="7"/><path d="M330 239L375 198H555L605 239Z" fill="#e4a4a0"/><rect x="430" y="182" width="78" height="90" rx="4"/><path d="M419 183L469 143L519 183Z" fill="#e5aaaa"/><circle cx="468" cy="217" r="20" fill="#fffefd"/><path d="M468 217v-12m0 12l12 5" stroke="#8299ad" stroke-width="3"/><rect x="451" y="266" width="36" height="44" rx="16" fill="#a8c5d4"/></g>
<g fill="#b2d4c4"><path d="M640 305V160l9 -37 10 37v145Z"/><path d="M664 305V178l10 -23 10 23v127Z"/></g>
<g transform="translate(250 304)" stroke="#718fa0" stroke-width="3"><circle cx="0" cy="0" r="11" fill="#fff"/><circle cx="51" cy="0" r="11" fill="#fff"/><path d="M0 -3h31l20 3m-27 -18l9 15" fill="none"/><circle cx="28" cy="-33" r="8" fill="#fad5a5"/><path d="M28 -25l-7 17" stroke="#c37a7b" stroke-width="7"/></g><path d="M0 319H720" stroke="#dfc4a5" stroke-width="9"/>`;
const things={kr:kr,jp:jp,th:th,vn:vn};
const body=things[code]||kr;
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${common}${body}
<g class="city-train"><rect x="-132" y="304" width="149" height="37" rx="16" fill="${code==="jp"?"#f9d8ec":code==="th"?"#d8e1fe":"#f9c9b8"}" stroke="#6a8ba7" stroke-width="4"/><rect x="-111" y="313" width="32" height="12" rx="4" fill="#fff"/><rect x="-68" y="313" width="31" height="12" rx="4" fill="#fff"/><circle cx="-98" cy="341" r="5" fill="#65819d"/><circle cx="-34" cy="341" r="5" fill="#65819d"/></g>
<path d="M0 350Q120 335 300 349T720 347V360H0Z" fill="#fff0d7"/></svg>`;
}
function navIcon(key){const shapes={home:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m3 10 9-7 9 7v10H3V10Z\"/><path d=\"M9 20v-7h6v7\"/></svg>",itinerary:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M8 2v4M16 2v4M3 10h18\"/></svg>",transport:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"16\" rx=\"4\"/><path d=\"M3 11h18M7 19l-2 3m12-3 2 3M8 7h3m2 0h3\"/></svg>",translate:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m5 8 6 6m-8 0 6-7m-5-3h12M9 2v2m5 18 5-12 5 12m-8-4h6\"/></svg>",expenses:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"2\" y=\"6\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20m-6 5h2M6 6V3h12\"/></svg>",more:"<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"2\"/></svg>"};return shapes[key]||shapes.home;}
function drawNav(){for(const id of ["sideNav","mobileNav"]){const el=$(id);el.replaceChildren();for(const [key,emoji,label] of tabs){const b=document.createElement("button");b.className="tab"+(key===current?" active":"");b.type="button";b.setAttribute("aria-current",key===current?"page":"false");const i=document.createElement("span");i.className="ico";i.innerHTML=navIcon(key);const t=document.createElement("span");t.textContent=label;b.append(i,t);b.onclick=()=>go(key);el.append(b)}}}
function go(name){current=name;document.querySelectorAll(".view").forEach(e=>e.classList.toggle("active",e.id==="view-"+name));$("pagetitle").textContent=tabs.find(t=>t[0]===name)[3];drawNav();if(name==="itinerary")requestAnimationFrame(()=>moveDatePlane(false));window.scrollTo({top:0,behavior:"smooth"})}
function hero(){
 const t=countries[country],el=$("hero");
 el.dataset.country=country;el.dataset.weather=weather;
 $("cityTitle").textContent="我們的"+t.name+"旅行";
 $("cityCaption").textContent=t.caption;
 $("locale").textContent=t.lang;
 const isSeoul=country==="kr";
 $("countryPending").hidden=isSeoul;
 document.querySelector(".seoul-art-tag").textContent=isSeoul?"SEOUL / CITY DIARY":"ART DIRECTION / REVIEW PENDING";
 $("countryArt").alt="首爾原創城市日間插畫；不是其他國家的主視覺";
 $("weatherLabel").textContent=t.name+" · "+({sun:"晴天",rain:"雨景",snow:"雪景",night:"夜景"}[weather])+"（效果示意）";
 document.querySelectorAll("[data-weather]").forEach(b=>{
   b.classList.toggle("active",b.dataset.weather===weather);
   b.setAttribute("aria-pressed",String(b.dataset.weather===weather));
   if(b.dataset.weather==="snow"){b.disabled=country==="th"||country==="vn";b.title=b.disabled?"此城市雪景尚未納入設計原型":"";}
 });
 $("heroDates").textContent="2027.01.10—01.15 · 六天五夜（示意旅程）";
 const now=new Date(),departure=Date.UTC(2027,0,10),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
 document.querySelector("#hero .countdown strong").textContent=Math.max(0,Math.ceil((departure-today)/86400000));
}
function transport(){
 const t=countries[country],st=t.stops;
 $("transportGreeting").textContent=t.greeting;$("transportFrom").textContent="📍 A 出發｜"+fmt(st[0]);$("transportTo").textContent="🏁 B 抵達｜"+fmt(st[st.length-1]);
 $("transportMode").textContent=t.mode+" · 示意";$("transportCount").textContent="搭乘 "+(st.length-1)+" 站";
 $("transportLine").textContent=t.mode.replace(/^🚇 |^🚝 /,"");$("transportDirection").textContent=t.direction;
 $("transportStart").textContent=fmt(st[0])+(st[0][2]?" · "+st[0][2]:"");$("transportEnd").textContent=fmt(st[st.length-1])+(st[st.length-1][2]?" · "+st[st.length-1][2]:"");
 $("transportSticker").textContent=country==="th"?"🚝":"🚇";
 const ol=$("stopList");ol.replaceChildren();
 st.forEach((s,i)=>{const li=document.createElement("li"),title=document.createElement("strong"),idx=document.createElement("span"),sub=document.createElement("small");title.textContent=fmt(s);idx.className="stop-index";idx.textContent=s[2]||"第 "+i+" 站";sub.textContent=i===0?"🟠 上車站":i===st.length-1?"🔵 下車站":"途經第 "+i+" 站";li.append(idx,title,sub);ol.append(li)});
 const expanded=$("toggleStops").getAttribute("aria-expanded")==="true";ol.hidden=!expanded;$("toggleStops").firstElementChild.textContent=expanded?"🚉 收合全部車站":"🚉 展開全部 "+st.length+" 個車站";
}
function changeCountry(value){if(!countries[value])return;country=value;if((value==="th"||value==="vn")&&weather==="snow")weather="sun";hero();transport();const d=$("dayCity");if(d)d.textContent="📍 "+countries[country].name}
const dayScenes=[
 ["✈️ DAY 1｜出發旅行日","✈️",[["05:30","07:00","🧳 準備行李","1 小時 30 分"],["未定","","✈️ 航班與機場交通","時間待確認"],["16:00","17:00","🏨 入住住宿","1 小時"]]],
 ["🍜 DAY 2｜巷弄美食日","🍜",[["09:30","10:30","☕ 早餐時光","1 小時"],["未定","","🚇 前往城市景點","時間待確認"],["12:00","14:00","🍜 小吃與街景","2 小時"]]],
 ["🌸 DAY 3｜城市散步日","🐱",[["09:30","10:30","☕ 早餐與咖啡","1 小時"],["未定","","🚇 地鐵交通","時間待確認"],["11:30","14:00","🛍️ 城市逛街","2 小時 30 分"],["15:00","16:00","🌳 公園散步","1 小時"]]],
 ["📸 DAY 4｜風景收藏日","📸",[["09:00","11:30","📍 人氣景點","2 小時 30 分"],["未定","","🚌 交通接駁","時間待確認"],["13:30","16:00","📸 街頭拍照","2 小時 30 分"]]],
 ["🧁 DAY 5｜小店尋寶日","🧁",[["10:00","11:00","🥐 早午餐","1 小時"],["未定","","🚶 散步前往小店","時間待確認"],["12:00","15:30","🛍️ 購物願望清單","3 小時 30 分"]]],
 ["🎒 DAY 6｜回程日","🎒",[["08:00","09:00","🧳 整理行李","1 小時"],["未定","","🚆 前往機場","時間待確認"],["16:00","17:00","✈️ 回家","航班時間示意"]]]
];
function moveDatePlane(animate){const b=document.querySelectorAll(".daychip")[selectedDay],p=$("dateFlight"),wrap=document.querySelector(".date-stage");if(!b||!p||!wrap)return;const r=b.getBoundingClientRect(),w=wrap.getBoundingClientRect();p.style.left=Math.max(8,Math.min(wrap.clientWidth-35,r.left-w.left+r.width/2-12))+"px";if(animate&&p.animate)p.animate([{transform:"translateY(0) rotate(-3deg)"},{transform:"translateY(-22px) rotate(14deg)"},{transform:"translateY(0) rotate(-3deg)"}],{duration:530,easing:"cubic-bezier(.18,.81,.25,1)"})}
function renderDay(){
 const [title,emoji,events]=dayScenes[selectedDay],panel=$("daypanel");
 $("dayHeadline").textContent=title;$("dayMascot").textContent=emoji;$("dayCity").textContent="📍 "+countries[country].name;
 panel.querySelectorAll(".event").forEach(x=>x.remove());const anchor=panel.querySelector(".softnote");
 for(const [start,end,name,duration] of events){
  const ride=start==="未定",row=document.createElement("div");row.className="event"+(ride?" ride":"");
  const clock=document.createElement("div");clock.className="clock";
  const s=document.createElement("span");s.textContent=start;clock.append(s);if(end){const e=document.createElement("span");e.textContent=end;clock.append(e)}
  const line=document.createElement("div");line.className="line";const dot=document.createElement("div");dot.className="dot";line.append(dot);
  const card=document.createElement("div");card.className="event-card";const h=document.createElement("h3");h.textContent=name;const d=document.createElement("div");d.className="detail";d.textContent=ride?"時間待確認 · 未接真實交通":start+"–"+end+" · "+duration;card.append(h,d);
  if(!ride){const actions=document.createElement("div");actions.className="links";actions.textContent="📍 當日地圖  ·  ✏️ 編輯（僅版面示意）";card.append(actions)}
  row.append(clock,line,card);panel.insertBefore(row,anchor);
 }
}
function selectDay(index,animate=true){if(index<0||index>5)return;selectedDay=index;document.querySelectorAll(".daychip").forEach((b,i)=>b.classList.toggle("active",i===index));document.querySelectorAll(".weekcard").forEach((b,i)=>b.classList.toggle("active",i===index));renderDay();requestAnimationFrame(()=>moveDatePlane(animate))}
function setMode(mode){document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("daypanel").style.display=mode==="week"?"none":"block";$("weekpanel").style.display=mode==="week"?"block":"none";requestAnimationFrame(()=>moveDatePlane(false))}
function init(){
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
 document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 document.querySelectorAll("[data-weather]").forEach(b=>b.onclick=()=>{const w=b.dataset.weather;if(w==="snow"&&(country==="th"||country==="vn"))return;weather=w;hero()});
 $("tripSelect").onchange=e=>changeCountry(e.target.value);
 $("toggleStops").onclick=()=>{const b=$("toggleStops"),on=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",String(!on));transport()};
 const chipTexts=["日","一","二","三","四","五"];
 document.querySelectorAll(".daychip").forEach((b,i)=>{b.innerHTML="<small>週"+chipTexts[i]+"</small><strong>"+(10+i)+"</strong><small>DAY "+(i+1)+"</small>";b.onclick=()=>selectDay(i,true)});
 document.querySelectorAll(".weekcard").forEach((b,i)=>{const h=b.querySelector("strong");if(h)h.textContent="DAY "+(i+1)+" · 01/"+(10+i);b.onclick=()=>{selectDay(i,true);setMode("day")}});
 $("dateChips").addEventListener("scroll",()=>requestAnimationFrame(()=>moveDatePlane(false)),{passive:true});
 window.addEventListener("resize",()=>requestAnimationFrame(()=>moveDatePlane(false)));
 const badge=$("daypanel").querySelector(".pill");if(badge)badge.id="dayCity";
 changeCountry("kr");selectDay(2,false);drawNav();setMode("day");
}
init();
})();