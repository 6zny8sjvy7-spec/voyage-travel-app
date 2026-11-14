/* VOYAGE V3 weather artwork follows actual current Open-Meteo WMO weather_code.
   No animated city landmark decorations are treated as weather observations. */
(function(){
"use strict";
const $=id=>document.getElementById(id),E=(tag,attrs={},children=[])=>{const x=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="class")x.className=v;else if(k==="text")x.textContent=String(v);else x.setAttribute(k,v)}for(const c of children)x.append(c);return x};
const hero=document.querySelector(".hero-art"),glass=document.querySelector(".hero .glass");if(!glass)return;if(hero)hero.style.display="none";
const weather=E("div",{id:"v3WeatherArt","aria-live":"polite",role:"img"}),source=E("div",{id:"v3WeatherSource"});
glass.append(weather,source);
const badge=$("weatherEmoji");
function classify(code,isDay){const n=Number(code);if(!Number.isFinite(n))return "unknown";if(n>=95)return "storm";if(n>=71&&n<=86)return "snow";if(n>=51&&n<=67||n>=80&&n<=82)return "rain";if(n===45||n===48)return "fog";if(n===0||n===1)return isDay?"sun":"moon";if(n>=2&&n<=3)return "cloud";return isDay?"cloud":"moon"}
function draw(payload){if(!glass.contains(weather))glass.append(weather,source);if(hero)hero.style.display="none";const w=payload&&payload.city===trip().city?payload:null,kind=w?classify(w.code,w.isDay):"unknown";
weather.className="v3-weather-"+kind;weather.replaceChildren();const main=E("div",{class:"v3-weather-scene"});
if(kind==="sun"){main.append(E("span",{class:"v3-sun",text:"☀"}),E("span",{class:"v3-small-cloud",text:"☁"}))}
else if(kind==="moon"){main.append(E("span",{class:"v3-moon",text:"☾"}),E("span",{class:"v3-stars",text:"✦ ✧"}))}
else if(kind==="cloud"){main.append(E("span",{class:"v3-cloud-main",text:"☁"}),E("span",{class:"v3-cloud-sub",text:"☁"}))}
else if(kind==="rain"||kind==="storm"){main.append(E("span",{class:"v3-cloud-main",text:"☁"}));for(let i=0;i<5;i++)main.append(E("span",{class:"v3-rain-drop",text:"·","data-i":i}));if(kind==="storm")main.append(E("span",{class:"v3-lightning",text:"ϟ"}))}
else if(kind==="snow"){main.append(E("span",{class:"v3-cloud-main",text:"☁"}));for(let i=0;i<6;i++)main.append(E("span",{class:"v3-snow-flake",text:"❄","data-i":i}))}
else if(kind==="fog"){main.append(E("span",{class:"v3-fog",text:"☁ ≋ ≋"}))}
else main.append(E("span",{class:"v3-weather-unknown",text:"☁"}));
weather.append(main);
const label={sun:"晴朗",moon:"晴朗夜晚",cloud:"多雲",rain:"有雨",storm:"雷雨",snow:"降雪",fog:"有霧",unknown:"天氣資料暫時無法取得"}[kind];
weather.setAttribute("aria-label","目的地目前天氣："+label);
source.textContent=w?"依 "+w.city+" 當地現在天氣（"+label+"）變化":"尚無目的地即時天氣資料";
if(badge)badge.textContent={sun:"☀️",moon:"🌙",cloud:"☁️",rain:"🌧️",storm:"⛈️",snow:"❄️",fog:"🌫️",unknown:"☁️"}[kind];
const homeIcon=$("v2Home")?.querySelector(".v2-big-icon"),homeSmall=$("v2Home")?.querySelector(".v2-small-icon");
if(homeIcon){homeIcon.textContent=badge?.textContent||"◌";homeIcon.setAttribute("aria-label","目前天氣 "+label)}
if(homeSmall)homeSmall.textContent="";
}
document.addEventListener("voyage-weather",event=>draw(event.detail));
const old=render;render=function(){old();try{draw(window.VoyageCurrentWeather)}catch(e){console.error("VOYAGE live-weather visual",e)}};
draw(window.VoyageCurrentWeather);
window.VoyageWeatherV3={classify,draw};
})();
