/* VOYAGE Thailand approved-animation integration v4. Presentation-only.
   Asset is derived from the user-selected four-faced-shrine animation with an EMPTY aircraft.
   No reading/writing localStorage, no itinerary/booking/transport changes.
   Maintains the country's original trip/date/counter UI. */
(()=>{'use strict';
const HOME_ID='v2Home',HOME=document.getElementById(HOME_ID);
if(!HOME||document.getElementById('v4-th-approved-style'))return;
const ANIM='./assets/voyage-thai-approved-fourface-v4.webp';
const STILL='./assets/voyage-thai-approved-fourface-still-v4.webp';
const style=document.createElement('style');
style.id='v4-th-approved-style';
style.textContent=`
#v2Home .vw-scene[data-country="TH"].v4-th-hero{
  position:relative!important;height:clamp(415px,46vw,620px)!important;
  max-width:none!important;max-height:none!important;width:100%!important;
  margin:0 0 13px!important;overflow:hidden!important;border:2px solid #3a5b91!important;
  border-radius:24px!important;isolation:isolate;background:#d8eafb!important;
  box-shadow:0 8px 26px #37476a1e;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero>.vw-art,
#v2Home .vw-scene[data-country="TH"].v4-th-hero>.vw-precip{display:none!important}
#v2Home .v4-th-hero .v4-stage{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;
  background:linear-gradient(145deg,#d0eaff 0%,#eadcf5 42%,#8ec3ee 75%,#73a9e6 100%)}
#v2Home .v4-th-hero .v4-picture{position:absolute;right:0;top:0;width:62%;height:100%;display:block}
#v2Home .v4-th-hero .v4-image{display:block;width:100%;height:100%;object-fit:cover;object-position:center center}
#v2Home .v4-th-hero .v4-fade{position:absolute;left:33%;top:0;width:23%;height:100%;z-index:2;
  background:linear-gradient(90deg,#dce6f8 0%,#dce6f8d5 21%,#dce6f8a3 43%,#dce6f800 100%)}
#v2Home .v4-th-hero .v4-nightshade{position:absolute;inset:0;z-index:3;opacity:0;transition:opacity 1.2s;
  background:linear-gradient(125deg,#172e6277,#14235d9e 65%,#213c7388)}
#v2Home .v4-th-hero[data-night="true"] .v4-nightshade{opacity:1}
#v2Home .v4-th-hero .v4-rain{position:absolute;inset:0;z-index:4;opacity:0;transition:opacity .5s;
  background:repeating-linear-gradient(114deg,transparent 0 27px,#f3faff8a 29px 30px,transparent 31px 56px);
  background-size:112px 160px;animation:v4-rain .83s linear infinite}
#v2Home .v4-th-hero[data-condition="rain"] .v4-rain,
#v2Home .v4-th-hero[data-condition="storm"] .v4-rain{opacity:.68}
@keyframes v4-rain{to{background-position:-15px 160px}}
#v2Home .v4-th-hero .vw-copy{z-index:8!important;left:4.5%!important;top:10%!important;
  width:42%!important;max-width:570px!important;box-sizing:border-box;background:transparent!important;
  padding:0!important;text-align:left;color:#292b62!important;text-shadow:0 2px 7px #fff9}
#v2Home .v4-th-hero .vw-copy h2{color:#22245b!important;font-size:clamp(25px,3.5vw,47px)!important;
  font-weight:950!important;margin:0 0 10px!important;line-height:1.15!important}
#v2Home .v4-th-hero .vw-copy p{color:#303267!important;font-size:clamp(12px,1.35vw,18px)!important;
  font-weight:800!important;line-height:1.45!important;margin-bottom:9px!important}
#v2Home .v4-th-hero .vw-copy .vw-dates{padding:7px 11px!important;border-radius:18px!important;
  background:#fffafdde!important;box-shadow:0 2px 12px #fff6;display:inline-block;max-width:100%}
#v2Home .v4-th-hero .vw-copy .vw-counter{font-size:clamp(14px,1.8vw,26px)!important;
  color:#28366d!important;background:#fff09b!important;border:2px solid #53609f!important;
  padding:11px 16px!important;border-radius:50px!important;box-shadow:0 4px 0 #ba9acf80;
  display:inline-block;max-width:100%;text-shadow:none}
#v2Home .v4-th-hero[data-night="true"] .vw-copy,
#v2Home .v4-th-hero[data-night="true"] .vw-copy h2,
#v2Home .v4-th-hero[data-night="true"] .vw-copy p{color:#fffaf7!important;text-shadow:0 2px 9px #03173ecf}
#v2Home .v4-th-hero[data-night="true"] .vw-copy .vw-dates{color:#273360!important;text-shadow:none}
#v2Home .v4-th-hero .v4-weather{position:absolute;z-index:7;left:51%;top:5%;max-width:45%;display:flex;gap:11px;
  box-sizing:border-box;align-items:center;padding:9px 14px;background:#2d76cebe;border:1.5px solid #fff;
  border-radius:17px;box-shadow:0 5px 16px #263d6250;backdrop-filter:blur(6px);color:#fff;text-shadow:0 1px 2px #14325680}
#v2Home .v4-th-hero .v4-weather .v4-icon{font-size:clamp(20px,2.2vw,32px);line-height:1.1}
#v2Home .v4-th-hero .v4-weather .v4-temp{font-weight:900;font-size:clamp(13px,1.52vw,20px)}
#v2Home .v4-th-hero .v4-weather .v4-meta{font-size:clamp(10px,.95vw,13px);line-height:1.4;opacity:.92}
#v2Home .v4-th-hero .vw-warning{color:#29345d!important;background:#fff9ecee!important;text-shadow:none!important}
@media(max-width:700px){
  #v2Home .vw-scene[data-country="TH"].v4-th-hero{height:540px!important;border-radius:19px!important}
  #v2Home .v4-th-hero .v4-stage{background:linear-gradient(180deg,#e9e9fc 0%,#e4eafa 42%,#95cbf0 65%)}
  #v2Home .v4-th-hero .v4-picture{top:36%;height:64%;right:0;width:100%}
  #v2Home .v4-th-hero .v4-image{object-fit:cover;object-position:center center}
  #v2Home .v4-th-hero .v4-fade{left:0;top:31%;width:100%;height:20%;
    background:linear-gradient(180deg,#e4eafa 0%,#e4eafad0 35%,transparent 100%)}
  #v2Home .v4-th-hero .vw-copy{left:5%!important;top:4.5%!important;width:90%!important;
    max-width:none!important;background:transparent!important;padding:0!important}
  #v2Home .v4-th-hero .vw-copy h2{font-size:27px!important;margin-bottom:8px!important}
  #v2Home .v4-th-hero .vw-copy p{font-size:13px!important;margin-bottom:8px!important}
  #v2Home .v4-th-hero .vw-copy .vw-dates{font-size:12px!important}
  #v2Home .v4-th-hero .vw-copy .vw-counter{font-size:17px!important;padding:8px 12px!important}
  #v2Home .v4-th-hero .v4-weather{left:5%;top:42%;max-width:90%;padding:7px 11px;gap:7px}
  #v2Home .v4-th-hero .v4-weather .v4-temp{font-size:15px}
  #v2Home .v4-th-hero .v4-weather .v4-meta{font-size:10px}
}
@media(prefers-reduced-motion:reduce){#v2Home .v4-th-hero .v4-rain{animation:none!important}}
`;
document.head.append(style);
const markup=`<div class="v4-stage" aria-hidden="true"><picture class="v4-picture">
  <source media="(prefers-reduced-motion: reduce)" srcset="${STILL}"/>
  <img class="v4-image" src="${ANIM}" alt="" decoding="async" fetchpriority="high"/>
 </picture><div class="v4-fade"></div><div class="v4-nightshade"></div><div class="v4-rain"></div></div>
 <div class="v4-weather" aria-live="polite"><span class="v4-icon">◌</span><div>
 <div class="v4-temp">天氣查詢中</div><div class="v4-meta">依旅行城市取得即時資料</div></div></div>`;
function currentTrip(){try{return window.VoyageUI?.current?.()||null}catch{return null}}
function isThailand(t){return !!(t && window.VoyageRegionV4?.countryCode?.(t)==='TH')}
function validWeather(t,w){return !!(t&&w&&!window.VoyageHomeGuard?.cityMismatch?.(t)
 &&String(w.tripId)===String(t.id)&&w.city===t.city
 &&w.locationKey===JSON.stringify([t.country,t.city,t.lat,t.lon,t.tz])
 &&Number.isInteger(w.code)&&typeof w.isDay==='boolean')}
function paint(){
 const t=currentTrip();if(!isThailand(t))return;
 const scene=HOME.querySelector('.vw-scene[data-country="TH"]');if(!scene)return;
 if(!scene.classList.contains('v4-th-hero')){
  scene.classList.add('v4-th-hero');
  const holder=document.createElement('div');holder.innerHTML=markup;
  scene.insertBefore(holder.firstElementChild,scene.firstChild);
  scene.insertBefore(holder.lastElementChild,scene.querySelector('.vw-copy'));
 }
 const detail=scene.querySelector('.vw-detail');
 const caption=/曼谷|bangkok/i.test(String(t.city||''))
  ?'水上市場、泰式寺廟與四面佛神龕，陪你探索曼谷。'
  :'泰國代表插畫：曼谷水上市場與寺廟（不是這趟旅行城市的實景）。';
 if(detail&&detail.textContent!==caption)detail.textContent=caption;
 const w=window.VoyageCurrentWeather,valid=validWeather(t,w),box=scene.querySelector('.v4-weather');
 if(!box)return;
 const icon=box.querySelector('.v4-icon'),temp=box.querySelector('.v4-temp'),meta=box.querySelector('.v4-meta');
 if(!valid){icon.textContent='◌';temp.textContent='天氣查詢中';meta.textContent='未取得可核對的當地天氣';return}
 const kind=scene.dataset.condition||'unknown',night=scene.dataset.night==='true';
 icon.textContent=kind==='rain'?'🌧️':kind==='storm'?'⛈️':kind==='snow'?'❄️':
 kind==='cloud'?'☁️':night?'🌙':kind==='sun'?'☀️':'◌';
 const fromApp=document.getElementById('temp')?.textContent?.trim()||'';
 const safeTemp=/^-?\d+(?:\.\d+)?°C$/.test(fromApp)?fromApp:'';
 temp.textContent=(safeTemp?safeTemp+' · ':'')+String(t.city||'泰國');
 meta.textContent=w.observedAt?'泰國當地資料 '+String(w.observedAt).replace('T',' ')+(w.fetchedAt?' · 查詢 '+new Date(w.fetchedAt).toLocaleTimeString('zh-TW',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}):''):'當地天氣已核對';
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint()})}
new MutationObserver(schedule).observe(HOME,{childList:true,subtree:false});
document.addEventListener('voyage-trip-changed',schedule);
document.addEventListener('voyage-weather',schedule);
setInterval(()=>{if(!document.hidden)schedule()},60000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
window.VoyageThaiHeroV4QA={isThailand,validWeather};
})();