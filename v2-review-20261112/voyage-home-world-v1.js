/* VOYAGE: distinct Bangkok / Tokyo home scenes. Home UI ONLY. */
(()=>{'use strict';
const U=window.VoyageUI,home=document.getElementById('v2Home');
if(!U||!home)return;
const style=document.createElement('style');
style.id='vw-country-home-style';
style.textContent=[
'#v2Home .vw-scene{position:relative;width:100%;height:clamp(280px,30vw,390px);overflow:hidden;isolation:isolate;border:2px solid #2b3a61;border-radius:24px;margin:0 0 13px;background:#b7ddff;color:#27334f}',
'#v2Home .vw-art{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center center}',
'#v2Home .vw-copy{position:absolute;z-index:5;left:5%;top:8%;width:58%;color:#233556;text-shadow:0 1px 1px #fff8}',
'#v2Home .vw-copy h2{font-size:clamp(22px,3.7vw,46px);font-weight:900;margin:0 0 11px;line-height:1.1}',
'#v2Home .vw-copy p{font-size:clamp(12px,1.6vw,21px);font-weight:750;line-height:1.5;margin:0 0 10px}',
'#v2Home .vw-counter{display:inline-block;background:#fff0a0;color:#27334f;border:2px solid #304565;border-radius:50px;padding:12px 18px;font-weight:900;font-size:clamp(15px,2.1vw,26px)}',
'#v2Home .vw-warning{background:#fff9e9e8;border:1px solid #d3ad78;padding:9px;border-radius:12px;font-size:12px;margin-top:9px;line-height:1.4}',
'#v2Home .vw-warning button{display:block;background:#4268ca;color:white;padding:8px 12px;margin-top:7px;border-radius:9px}',
'#v2Home .vw-night{opacity:0;transition:opacity .5s}',
'#v2Home .vw-night-fill{position:absolute;inset:0;background:linear-gradient(150deg,#101947bc,#061c38b7);z-index:1;pointer-events:none}',
'#v2Home .vw-scene[data-condition="rain"] .vw-art-photo,#v2Home .vw-scene[data-condition="storm"] .vw-art-photo{filter:brightness(.79) saturate(.81)}',
'#v2Home .vw-scene[data-condition="snow"] .vw-art-photo{filter:brightness(1.04) saturate(.73)}',
'#v2Home .vw-scene[data-night="true"] .vw-art-photo{filter:brightness(.65) saturate(.75)}',
'#v2Home .vw-waterlight{position:absolute;left:0;right:0;bottom:0;height:19%;pointer-events:none;z-index:2;opacity:.5;background:repeating-linear-gradient(97deg,transparent 0 31px,#fffecb4d 33px 38px,transparent 41px 78px);animation:vw-waterlight 7s ease-in-out infinite alternate}',
'#v2Home .vw-scene[data-night="true"] .vw-waterlight{opacity:.25}',
'#v2Home .vw-precip{z-index:3}',
'#v2Home .vw-scene .vw-copy{padding:10px 14px;border-radius:18px;background:linear-gradient(90deg,#e9f4ffba 0%,#eaf5ff6b 60%,transparent 100%)}',
'@keyframes vw-waterlight{from{background-position:0 0}to{background-position:140px 0}}',
'#v2Home .vw-scene[data-night="true"] .vw-copy,#v2Home .vw-scene[data-night="true"] .vw-copy h2{color:#fff9e9;text-shadow:0 2px 5px #061328ea}',
'#v2Home .vw-scene[data-night="true"] .vw-counter{color:#26334f;text-shadow:none}',
'#v2Home .vw-scene[data-night="true"] .vw-night{opacity:.72}',
'#v2Home .vw-sun{opacity:0}',
'#v2Home .vw-scene[data-condition="sun"]:not([data-night="true"]) .vw-sun{opacity:1}',
'#v2Home .vw-precip{position:absolute;inset:0;pointer-events:none;opacity:0}',
'#v2Home .vw-scene[data-condition="rain"] .vw-precip,#v2Home .vw-scene[data-condition="storm"] .vw-precip{opacity:1;background:repeating-linear-gradient(112deg,transparent 0 29px,#f1f9ffc9 31px 33px,transparent 35px 54px);background-size:150px 100px;animation:vw-rain 1.2s linear infinite}',
'#v2Home .vw-scene[data-condition="snow"] .vw-precip{opacity:1;background-image:radial-gradient(4px 4px at 16% 20%,white 95%,transparent),radial-gradient(4px 4px at 65% 37%,white 95%,transparent),radial-gradient(3px 3px at 83% 62%,white 95%,transparent);background-size:120px 160px;animation:vw-snow 9s linear infinite}',
'#v2Home .vw-boat{animation:vw-float 6s ease-in-out infinite}',
'#v2Home .vw-train{animation:vw-travel 15s ease-in-out infinite alternate}',
'#v3WeatherArt .vw-weather-illustration{display:block;width:100%;height:100%;min-height:96px;max-width:186px}',
'#v2Home .v2-home-hero.vw-home-actions{min-height:0!important;margin:0 0 18px!important;padding:0 4px 4px!important;display:flex!important;background:transparent!important;border:0!important;box-shadow:none!important}',
'#v2Home .v2-home-hero.vw-home-actions .v2-small-icon,#v2Home .v2-home-hero.vw-home-actions .eyebrow,#v2Home .v2-home-hero.vw-home-actions h2,#v2Home .v2-home-hero.vw-home-actions p{display:none!important}',
'#v2Home .v2-home-hero.vw-home-actions .v2-big-icon{display:inline-flex!important;align-items:center;font-size:32px!important;line-height:1;order:-1;margin-right:6px}',
'#v2Home .v2-home-hero.vw-home-actions .v2-hero-copy{width:100%;max-width:none!important;padding:0!important}',
'#v2Home .v2-home-hero.vw-home-actions .v2-toolbar{display:flex;flex-wrap:wrap;gap:9px;margin:0!important;padding:0!important}',
'#v2Home .v2-home-hero.vw-home-actions .v2-toolbar button{flex:1 1 150px}',
'@keyframes vw-rain{from{background-position:0 -100px}to{background-position:24px 0}}',
'@keyframes vw-snow{from{background-position:0 -90px}to{background-position:100px 90px}}',
'@keyframes vw-float{50%{transform:translate(14px,-7px)}}',
'@keyframes vw-travel{from{transform:translateX(-42px)}to{transform:translateX(100px)}}',
'@media(max-width:650px){#v2Home .vw-scene{height:430px}#v2Home .vw-copy{left:5%;top:6%;width:80%;background:linear-gradient(90deg,#ffffffcc,#ffffff25);padding:8px;border-radius:14px}#v2Home .vw-copy h2{font-size:24px}#v2Home .vw-copy p{font-size:13px}#v2Home .vw-counter{font-size:16px;padding:9px}}',
'@media(prefers-reduced-motion:reduce){#v2Home .vw-boat,#v2Home .vw-train,#v2Home .vw-precip{animation:none}}'
].join('\n');
document.head.append(style);
const asText=x=>String(x==null?'':x);
const countryCode=t=>window.VoyageRegionV4?.countryCode?.(t)||(/[日本]|japan/i.test(asText(t?.country))?'JP':/[泰國]|thailand/i.test(asText(t?.country))?'TH':'');
function mismatch(t){
 const c=countryCode(t),s=asText(t?.city);
 const observed=/(曼谷|bangkok|清邁|chiang mai|phuket|普吉)/i.test(s)?'TH':/(東京|tokyo|大阪|osaka|京都|kyoto)/i.test(s)?'JP':/(首爾|seoul|釜山|busan)/i.test(s)?'KR':'';
 const zone=asText(t?.tz),expectedZone={KR:'Asia/Seoul',JP:'Asia/Tokyo',TH:'Asia/Bangkok',VN:'Asia/Ho_Chi_Minh'}[c];
  return !!((observed&&c&&observed!==c)||(expectedZone&&zone&&zone!==expectedZone));
}
window.VoyageHomeGuard={cityMismatch:mismatch,countryCode};
function tripDates(t){
 const begin=asText(t?.startDate),length=Array.isArray(t?.days)?Math.max(1,t.days.length):1;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(begin))return['日期尚未設定','出發日期待設定'];
 const stamp=Date.parse(begin+'T12:00:00Z');if(!Number.isFinite(stamp))return['日期待核實','日期待核實'];
 const finish=new Date(stamp+(length-1)*86400000).toISOString().slice(5,10).replace('-','/');
 const zone=asText(t?.tz)|| (countryCode(t)==='TH'?'Asia/Bangkok':'Asia/Tokyo');
 let today=new Date().toISOString().slice(0,10);
 try{let parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());let v=Object.fromEntries(parts.map(p=>[p.type,p.value]));today=v.year+'-'+v.month+'-'+v.day}catch(e){}
 const count=Math.round((stamp-Date.parse(today+'T12:00:00Z'))/86400000);
 return[begin.replace(/-/g,'/')+'－'+finish+' · '+length+' 天',count>=0?'距離出發 '+count+' 天':'已出發 '+(-count)+' 天'];
}
function flower(x,y,fill){return '<g fill="'+fill+'" stroke="#a96291" stroke-width="4"><ellipse cx="'+(x-14)+'" cy="'+y+'" rx="24" ry="14"/><ellipse cx="'+(x+14)+'" cy="'+y+'" rx="24" ry="14"/><ellipse cx="'+x+'" cy="'+(y-13)+'" rx="14" ry="23"/><ellipse cx="'+x+'" cy="'+(y+13)+'" rx="14" ry="23"/><circle cx="'+x+'" cy="'+y+'" r="10" fill="#ffe3a3"/></g>'}
function cloud(x,y){return '<path d="M'+x+' '+(y+27)+'Q'+(x-15)+' '+y+' '+(x+14)+' '+(y-8)+'Q'+(x+25)+' '+(y-39)+' '+(x+57)+' '+(y-25)+'Q'+(x+87)+' '+(y-54)+' '+(x+114)+' '+(y-23)+'Q'+(x+156)+' '+(y-16)+' '+(x+151)+' '+(y+20)+'Q'+(x+144)+' '+(y+40)+' '+x+' '+(y+27)+'Z" fill="#fff8ff" stroke="#7896b9" stroke-width="6"/>'}
const prefix='<svg class="vw-art" viewBox="0 0 1448 850" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="vwSkyT" x2="0" y2="1"><stop stop-color="#71bcfa"/><stop offset="1" stop-color="#ffdfac"/></linearGradient><linearGradient id="vwSkyJ" x2="0" y2="1"><stop stop-color="#8ab7f8"/><stop offset="1" stop-color="#f5d8e8"/></linearGradient><linearGradient id="vwRiver" x2="0" y2="1"><stop stop-color="#6acee0"/><stop offset="1" stop-color="#287dba"/></linearGradient></defs>';
const overlay='<g class="vw-night"><rect width="1448" height="850" fill="#122447"/>'+Array.from({length:32},(_,i)=>'<circle fill="#fff6d3" cx="'+((i*167+32)%1448)+'" cy="'+((i*113+19)%480)+'" r="'+(i%4?2:3)+'"/>').join('')+'</g></svg>';
function thailand(){
 // The approved art direction requires detailed original illustration, NOT a
 // collection of primitive geometric SVG shapes. Image is stored locally in
 // this same repository and contains no baked city/date/weather labels.
 return '<img class="vw-art vw-art-photo" src="./assets/voyage-thailand-hero-v2.webp" '+
 'alt="昭披耶河、鄭王廟、長尾船、熱帶花卉的曼谷插畫" decoding="async" loading="eager">'+
 '<div class="vw-night vw-night-fill" aria-hidden="true"></div>'+
 '<div class="vw-waterlight" aria-hidden="true"></div>';
}
function japan(t){
 if(/福岡|fukuoka|博多|hakata/i.test(asText(t?.city))){
  return '<img class="vw-art vw-art-photo" src="./assets/voyage-japan-fukuoka-hero-v2.webp" alt="福岡港灣、櫻花與鐵道的主題插畫" decoding="async" loading="eager">'+
   '<div class="vw-night vw-night-fill" aria-hidden="true"></div><div class="vw-waterlight" aria-hidden="true"></div>';
 }
 let s=prefix+'<rect width="1448" height="850" fill="url(#vwSkyJ)"/><g class="vw-sun"><circle cx="1230" cy="130" r="67" fill="#ffefbd" stroke="#f3c4a0" stroke-width="7"/></g>';
 s+=cloud(825,170)+cloud(1220,270);
 s+='<g fill="#9ab0cb">'+Array.from({length:18},(_,i)=>'<rect x="'+(i*92)+'" y="'+(420-i%5*33)+'" width="'+(57+i%3*13)+'" height="250" rx="8"/>').join('')+'</g>';
 // Skytree and Japanese city streetscape; no Thai river or temple.
 s+='<g stroke="#3a4c79" stroke-width="8" stroke-linejoin="round"><path d="M1042 645L1069 265L1114 266L1142 645Z" fill="#d5e4ff"/><path d="M1061 270L1091 150L1118 268Z" fill="#f3a9b9"/><path d="M1091 153V102" stroke="#f17c9c"/><path d="M1017 327H1142" stroke="#fff1e4" stroke-width="23"/><path d="M1054 424H1127" stroke="#f49bb0" stroke-width="18"/><path d="M1048 540H1139" stroke="#fff1dd" stroke-width="18"/><path d="M741 617V511L807 483L866 509V617Z" fill="#fff0dc"/><path d="M717 512L807 439L898 512L872 521L807 467L736 521Z" fill="#df6f8a"/><path d="M809 489V383L840 352L865 389V485Z" fill="#fff3d9"/><path d="M775 388L839 329L903 390L887 402L838 353L791 402Z" fill="#e26f8b"/></g>';
 for(let i=0;i<12;i++){const x=655+i*86;s+='<ellipse cx="'+x+'" cy="'+(613+i%3*12)+'" rx="51" ry="48" fill="'+(i%2?'#f5a7d0':'#ed8fbc')+'" stroke="#b86d9b" stroke-width="7"/>'}
 s+='<rect y="633" width="1448" height="217" fill="#879cbc"/><path d="M0 686H1448" stroke="#f0dadd" stroke-width="15"/>';
 for(let i=0;i<11;i++)s+='<path d="M'+(i*153)+' 765h75" stroke="#faf1ca" stroke-width="18" stroke-linecap="round"/>';
 s+='<g class="vw-train" stroke="#354b7b" stroke-width="9"><rect x="740" y="640" width="324" height="116" rx="48" fill="#fffaf8"/><path d="M755 719H1056" stroke="#e985a1" stroke-width="17"/><rect x="779" y="665" width="67" height="40" rx="12" fill="#b1e4fa"/><rect x="858" y="665" width="67" height="40" rx="12" fill="#b1e4fa"/><rect x="938" y="665" width="66" height="40" rx="12" fill="#b1e4fa"/></g>';
 s+='<path d="M-20 -7Q185 117 361 -12" fill="none" stroke="#845671" stroke-width="26"/>';
 for(let i=0;i<12;i++)s+='<ellipse cx="'+(i*56-22)+'" cy="'+(i%3*22+5)+'" rx="72" ry="46" fill="'+(i%2?'#ffbfdc':'#f89bc5')+'" stroke="#b8739b" stroke-width="6"/>';
 for(let i=0;i<16;i++)s+='<ellipse cx="'+((i*117+21)%1448)+'" cy="'+((i*61+175)%610)+'" rx="9" ry="5" fill="#ffe2eb"/>';
 return s+overlay;
}
function iconSVG(kind,night){
 const sun='<circle cx="129" cy="48" r="33" fill="#ffec9b" stroke="#e3bb65" stroke-width="5"/>';
 const moon='<path d="M129 18Q100 72 154 94Q108 109 91 64Q81 32 118 14Z" fill="#fff4bb" stroke="#e7cc99" stroke-width="5"/>';
 const cloudShape='<path d="M31 105Q11 100 23 76Q30 61 49 66Q59 28 91 45Q110 15 140 41Q161 35 174 69Q198 70 191 92Q184 110 160 109Z" fill="#fff9ff" stroke="#718ab7" stroke-width="5"/>';
 const sky=night?moon:kind==='sun'?sun:'';
 const rain=kind==='rain'||kind==='storm'?Array.from({length:5},(_,i)=>'<path d="M'+(48+i*25)+' 116l-9 20" stroke="#80bdec" stroke-width="6" stroke-linecap="round"/>').join(''):'';
 const snow=kind==='snow'?[48,95,145].map((x,i)=>'<g transform="translate('+x+' '+(125+i%2*9)+')" stroke="#91c3ef" stroke-width="4" stroke-linecap="round"><path d="M-10 0H10M0 -10V10M-7 -7L7 7M7 -7L-7 7"/></g>').join(''):'';
  const lightning=kind==='storm'?'<path d="M113 109l-17 24h18l-11 17" fill="none" stroke="#e9b848" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>':'';
 return '<svg class="vw-weather-illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 150" aria-hidden="true">'+sky+cloudShape+rain+snow+lightning+'</svg>';
}
let scene=null,currentKey='',iconKey='';
function state(t){
 const w=window.VoyageCurrentWeather;
 const valid=!!(!mismatch(t)&&w&&w.city===t.city&&String(w.tripId)===String(t.id)&&w.locationKey===JSON.stringify([t.country,t.city,t.lat,t.lon,t.tz])&&Number.isInteger(w.code)&&typeof w.isDay==='boolean');
 if(!valid)return{kind:'unknown',night:false};
 let isDay=w.isDay;
 const zone=asText(t.tz)|| (countryCode(t)==='TH'?'Asia/Bangkok':'Asia/Tokyo');
 try{
  const x=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(z=>[z.type,z.value]));
  const now=x.year+'-'+x.month+'-'+x.day+'T'+x.hour+':'+x.minute;
  if(w.sunrise?.slice(0,10)===now.slice(0,10)&&w.sunset?.slice(0,10)===now.slice(0,10))isDay=now>=w.sunrise&&now<w.sunset;
 }catch(e){}
 return{kind:window.VoyageWeatherV3?.classify?.(w.code,isDay)||'unknown',night:!isDay};
}
async function repairCity(){
 const t=U.current?.();if(!t)return;
 const country=countryCode(t),city=prompt('國家與城市不相符。請輸入這趟旅行正確城市英文名稱（例如 Tokyo）。原行程不會刪除。',country==='JP'?'Tokyo':'Bangkok');
 if(city===null||!city.trim())return;
 try{const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city.trim())+'&count=10&language=en&format=json');if(!r.ok)throw Error('無法連接地理查詢');const res=await r.json(),found=(res.results||[]).find(x=>x.country_code===country&&Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)&&x.timezone);if(!found)throw Error('找不到屬於所選國家的城市，請用完整英文名稱');
 if(!confirm('確認更正為 '+found.name+' · '+found.country+'？保留原本行程、備忘與費用。'))return;
 t.city=found.name;t.lat=found.latitude;t.lon=found.longitude;t.tz=found.timezone;t.needsLocation=false;U.save?.();location.reload();
 }catch(e){alert('沒有修改旅行資料：'+e.message)}
}
function refresh(){
 const t=U.current?.(),card=home.querySelector('.v2-home-hero');if(!t||!card)return;
 const code=countryCode(t),enabled=code==='TH'||code==='JP',old=home.querySelector('.vw-scene');
 const artKey=code==='JP'&&/福岡|fukuoka|博多|hakata/i.test(asText(t.city))?'JP-FUKUOKA':code==='JP'?'JP-OTHER':code;
 if(!enabled){old?.remove();card.classList.remove('vw-home-actions');scene=null;currentKey='';return;}
 if(!scene||!scene.isConnected||scene.dataset.country!==code||scene.dataset.artKey!==artKey){
  old?.remove();scene=document.createElement('section');scene.className='vw-scene';scene.dataset.country=code;scene.dataset.artKey=artKey;
  scene.innerHTML=(code==='TH'?thailand():japan(t))+'<div class="vw-precip"></div><div class="vw-copy"><h2></h2><p class="vw-detail"></p><p class="vw-dates"></p><div class="vw-counter"></div><div class="vw-warning" hidden></div></div>';
  home.insertBefore(scene,card);currentKey='';
 }
 const key=JSON.stringify([t.id,t.city,t.name,t.startDate,t.days?.length,code]);
 if(key!==currentKey){
  const invalid=mismatch(t),name=invalid?(code==='TH'?'泰國':'日本')+' · 城市待確認':asText(t.city||t.country);
  const dates=tripDates(t);
  scene.querySelector('h2').textContent='下一站，'+name+' ♡';
  scene.querySelector('.vw-detail').textContent=code==='TH'?(/曼谷|bangkok/i.test(asText(t.city))?'昭披耶河的色彩與熱帶微風，等你收藏。':'泰國代表插畫：曼谷河畔（非目前城市的實景）'):(/福岡|fukuoka|博多|hakata/i.test(asText(t.city))?'福岡的港灣、櫻花與春日街景，等你探索。':/東京|tokyo/i.test(asText(t.city))?'東京城市主題插畫與列車，等你探索。':'日本代表插畫：東京風格（非目前城市的實景）');
  scene.querySelector('.vw-dates').textContent=dates[0]+' · '+asText(t.name||'旅行');
  scene.querySelector('.vw-counter').textContent='▣ '+dates[1];
  const warn=scene.querySelector('.vw-warning');warn.replaceChildren();
  if(invalid){warn.hidden=false;warn.append(document.createTextNode('目前選擇的是「'+asText(t.country)+'」，但是儲存的城市為「'+asText(t.city)+'」。請核對目的地。'));const b=document.createElement('button');b.textContent='更正城市（經確認才儲存）';b.type='button';b.addEventListener('click',repairCity);warn.append(b)}else warn.hidden=true;
  currentKey=key;
 }
 card.classList.add('vw-home-actions');
 const current=state(t);scene.dataset.condition=current.kind;scene.dataset.night=String(current.night);
}
function prettyIcon(){
 const t=U.current?.(),box=document.getElementById('v3WeatherArt');if(!t||!box)return;
 const w=state(t),key=JSON.stringify([t.id,w.kind,w.night]);
 if(key===iconKey&&box.querySelector('.vw-weather-illustration'))return;
 iconKey=key;box.innerHTML=iconSVG(w.kind,w.night);
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();prettyIcon()})}
new MutationObserver(schedule).observe(home,{childList:true});
document.addEventListener('voyage-weather',()=>{iconKey='';schedule()});
document.addEventListener('voyage-trip-changed',()=>{iconKey='';schedule()});
setInterval(()=>{if(!document.hidden){iconKey='';schedule()}},60000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
window.VoyageHomeWorldQA={countryCode,mismatch,tripDates,state};
})();