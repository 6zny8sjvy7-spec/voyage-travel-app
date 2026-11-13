/* VOYAGE V4 resilient world-wide weather display.
   Reads exact trip coordinates/timezone; never reuses a different city's result or fabricates current temperature. */
(function(global){
"use strict";
const R=global.VoyageRegionV4;if(!R)return;
const $=id=>document.getElementById(id);
const cacheName="voyage-weather-v4:"+location.pathname;
const MAX_AGE=12*60*60*1000,REFRESH=15*60*1000;
let controller=null,seq=0,lastKey="",running=false;
const key=t=>[R.countryCode(t),String(t.city||"").trim(),Number(t.lat).toFixed(4),Number(t.lon).toFixed(4)].join("|");
const current=()=>typeof trip==="function"?trip():null;
function readCache(t){try{const data=JSON.parse(localStorage.getItem(cacheName)||"{}");const row=data[key(t)];return row&&Number.isFinite(row.at)&&Date.now()-row.at<=MAX_AGE?row:null}catch{return null}}
function writeCache(t,value){try{const all=JSON.parse(localStorage.getItem(cacheName)||"{}");all[key(t)]={...value,at:Date.now()};const entries=Object.entries(all).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,12);localStorage.setItem(cacheName,JSON.stringify(Object.fromEntries(entries)))}catch{/* Private browsing or storage limit */}}
function slot(){const glass=document.querySelector(".hero .glass");if(!glass)return null;let e=$("v4WeatherStatus");if(!e){e=document.createElement("div");e.id="v4WeatherStatus";e.className="v4-weather-status";const button=document.createElement("button");button.id="v4WeatherRetry";button.type="button";button.textContent="↻ 重試";button.onclick=()=>load({force:true});e.append(button);glass.append(e)}return e}
function label(message,canRetry=true){const el=slot();if(!el)return;el.childNodes.forEach(n=>{if(n.nodeType===3)n.remove()});el.prepend(document.createTextNode(message+" "));const b=$("v4WeatherRetry");if(b){b.hidden=!canRetry;b.disabled=running}}
function weatherEvent(info){global.VoyageCurrentWeather=info;if(typeof CustomEvent!=="undefined")document.dispatchEvent(new CustomEvent("voyage-weather",{detail:info}))}
function show(info,mode){const t=current();if(!t)return;const temp=$("temp"),city=$("cityLabel"),desc=$("weatherDesc");if(city)city.textContent=t.city||"未設定城市";
 if(!info){weatherEvent(null);if(temp)temp.textContent="--°";if(desc)desc.textContent="尚未取得目的地天氣";label("尚未取得目的地天氣，請重試");return}
 weatherEvent({code:info.code,isDay:info.isDay,city:t.city,countryCode:R.countryCode(t),observedAt:info.observedAt});
 if(temp)temp.textContent=Number(info.temp).toFixed(1)+"°C";
 if(desc)desc.textContent=(mode==="cached"?"上次成功更新 · ":mode==="fresh"?"當地天氣 · 更新 ":"上次更新 · ")+String(info.observedAt||"").replace("T"," ");
 label(mode==="cached"?"天氣服務暫時無回應，顯示同城市最近一次資料":mode==="fresh"?"最新目的地天氣":"正在更新天氣",mode!=="loading");
 if(typeof theme==="function")try{theme()}catch{}
}
function clear(){const t=current();if(!t)return;weatherEvent(null);const e=$("temp");if(e)e.textContent="--°";const city=$("cityLabel");if(city)city.textContent=t.city||"目的地";const desc=$("weatherDesc");if(desc)desc.textContent="正在取得 "+(t.city||"目的地")+" 天氣";label("連線中",false)}
function valid(currentWeather){const temp=Number(currentWeather?.temperature_2m),code=Number(currentWeather?.weather_code),day=currentWeather?.is_day;return Number.isFinite(temp)&&temp>-100&&temp<70&&Number.isInteger(code)&&code>=0&&code<=99&&(day===0||day===1||day===true||day===false)&&typeof currentWeather.time==="string"}
function abort(){seq++;controller?.abort();controller=null;running=false}
async function request(t,signal){const coords=R.trustedCoords(t);if(!coords)throw Error("此城市缺少已確認的座標");
 const query=new URLSearchParams({latitude:String(coords.latitude),longitude:String(coords.longitude),current:"temperature_2m,weather_code,is_day",daily:"sunrise,sunset",timezone:t.tz||"auto",forecast_days:"1"});
 const res=await fetch("https://api.open-meteo.com/v1/forecast?"+query.toString(),{signal,cache:"no-store"});
 if(!res.ok)throw Error("天氣來源 HTTP "+res.status);
 const data=await res.json();
 if(!valid(data.current))throw Error("天氣來源資料不完整");
 return{temp:Number(data.current.temperature_2m),code:Number(data.current.weather_code),isDay:!!data.current.is_day,observedAt:data.current.time,timeZone:data.timezone||t.tz||""}
}
async function load(options={}){
 const t=current();if(!t)return;
 const coords=R.trustedCoords(t),newKey=coords?key(t):"missing:"+R.countryCode(t)+":"+t.city;
 const existing=readCache(t);
 if(!options.force&&newKey===lastKey&&running)return;
 const generation=++seq;controller?.abort();controller=typeof AbortController!=="undefined"?new AbortController():null;lastKey=newKey;
 if(!coords){running=false;weatherEvent(null);const temp=$("temp");if(temp)temp.textContent="--°";const d=$("weatherDesc");if(d)d.textContent="尚未確認「"+(t.city||"目的地")+"」的座標";label("請先設定正確城市，才能取得天氣");return}
 running=true;
 if(existing)show(existing,"cached");else clear();
 label(existing?"正在更新，先顯示最近成功資料":"正在連線取得天氣",false);
 let error=null;
 for(let attempt=0;attempt<2;attempt++){
  if(attempt){await new Promise(resolve=>setTimeout(resolve,550));if(generation!==seq)return}
  const timeout=setTimeout(()=>controller?.abort(),8500);
  try{
   const w=await request(t,controller?.signal);
   clearTimeout(timeout);
   if(generation!==seq||key(current())!==newKey)return;
   running=false;writeCache(t,w);show(w,"fresh");return w;
  }catch(e){
   clearTimeout(timeout);error=e;
   if(generation!==seq)return;
   if(controller?.signal.aborted&&attempt===0)controller=typeof AbortController!=="undefined"?new AbortController():null;
  }
 }
 if(generation!==seq)return;
 running=false;
 if(existing)show(existing,"cached");
 else{show(null);const d=$("weatherDesc");if(d)d.textContent="天氣暫時無法取得 · 可按重試";}
 label(existing?"更新失敗，顯示同一城市最近一次成功資料":"天氣無法更新，請稍後重試");
 global.VoyageWeatherV4.lastError=String(error?.message||"未知原因");
}
function init(){slot();load();
 global.addEventListener?.("online",()=>load({force:true}));
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-(readCache(current())?.at||0)>REFRESH)load()});
 setInterval(()=>{if(!document.hidden&&current())load()},REFRESH);
}
global.VoyageWeatherV4={load,abort,valid,readCache,get lastError(){return""},get country(){return R.countryCode(current())}};
loadWeather=()=>load({force:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
