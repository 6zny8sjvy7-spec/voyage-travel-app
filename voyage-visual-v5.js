/* Original four-country vector icons with light movement and weather-based badges. */
(function(global){
"use strict";
const R=global.VoyageRegionV4;if(!R)return;
const $=id=>document.getElementById(id),NS="http://www.w3.org/2000/svg";
const data={
KR:{title:"韓國宮殿",main:"#dd737b",dark:"#355478",base:"#9cb0c7",paths:["M12 90 L164 90 L164 102 L12 102 Z","M15 63 Q40 63 53 47 L84 54 L98 42 L121 52 Q144 61 164 63 Q135 76 93 63 Q52 78 15 63 Z","M39 42 Q71 38 90 23 Q112 37 142 42 L128 51 L91 39 L52 51 Z"],pillars:[32,62,91,121]},
TH:{title:"泰國寺廟",main:"#c99556",dark:"#8767a0",base:"#b6cbd3",paths:["M18 103 L165 103 L165 111 L18 111 Z","M57 100 L66 57 L92 13 L117 57 L129 100 Z","M10 101 L25 70 L41 47 L58 70 L72 101 Z","M118 101 L131 70 L148 47 L163 70 L177 101 Z"],pillars:[]},
JP:{title:"日本鳥居與富士山",main:"#d86c69",dark:"#6377a5",base:"#bccedc",paths:["M84 95 L131 32 L175 95 Z","M102 70 L131 32 L153 70 L137 63 L128 69 L118 63 Z","M12 26 L102 26 L98 39 L16 39 Z","M24 42 L38 42 L38 109 L24 109 Z","M75 42 L89 42 L89 109 L75 109 Z","M22 61 L90 61 L90 69 L22 69 Z"],pillars:[]},
VN:{title:"越南一柱寺",main:"#ce7772",dark:"#507d88",base:"#a5bfaa",paths:["M10 108 Q45 102 84 107 T176 108 L176 115 L10 115 Z","M11 65 Q35 64 50 46 L82 53 L95 40 L126 52 Q148 66 171 64 Q148 79 93 65 Q50 80 11 65 Z","M38 41 Q70 37 94 21 Q116 35 145 41 L134 49 L94 33 L50 49 Z"],pillars:[39,70,102,132]}
};
function picture(country){
const spec=data[country]||data.KR,node=document.createElementNS(NS,"svg");node.setAttribute("viewBox","0 0 185 125");node.setAttribute("class","v5-landmark-svg");node.setAttribute("role","img");node.setAttribute("aria-label",spec.title);
const layer=(kind,attrs)=>{const e=document.createElementNS(NS,kind);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));node.append(e);return e};
if(country==="KR"||country==="VN")for(const x of spec.pillars)layer("rect",{x,y:67,width:12,height:29,rx:2,fill:spec.base,stroke:spec.dark,"stroke-width":2});
for(const [i,d] of spec.paths.entries())layer("path",{d,fill:i===0?spec.base:i%2?spec.main:spec.dark,stroke:spec.dark,"stroke-width":i===0?1:2,"stroke-linejoin":"round"});
return node}
let lastCity="",lastWeather="";
function draw(){
const card=$("v2Home")?.querySelector(".v2-home-hero");if(!card)return;
const t=trip(),c=R.countryCode(t),key=c+"|"+t.city;
let holder=card.querySelector(".v5-country-art");if(!holder||lastCity!==key){holder?.remove();holder=document.createElement("div");holder.className="v5-country-art";holder.dataset.country=c;holder.append(picture(c));card.append(holder);lastCity=key;lastWeather=""}
for(const sel of [".v2-big-icon",".v2-small-icon"]){const old=card.querySelector(sel);if(old)old.style.display="none"}
const w=global.VoyageCurrentWeather,valid=w&&w.city===t.city&&w.countryCode===c;
const kind=valid&&global.VoyageWeatherV3?.classify?global.VoyageWeatherV3.classify(w.code,w.isDay):"unknown";
const icons={sun:"☀️",moon:"🌙",rain:"🌧️",cloud:"☁️",snow:"❄️",fog:"🌫️",storm:"⛈️",unknown:"☁️"};
let badge=holder.querySelector(".v5-country-weather");if(!badge){badge=document.createElement("span");holder.append(badge)}
badge.className="v5-country-weather v5-weather-"+kind;badge.textContent=icons[kind]||"☁️";
badge.setAttribute("role","img");badge.setAttribute("aria-label",valid?"目前天氣："+kind:"目前尚未取得可靠天氣");
if(lastWeather!==key+kind){holder.classList.remove("v5-country-arrive");void holder.offsetWidth;holder.classList.add("v5-country-arrive");lastWeather=key+kind}
}
const original=render;render=function(){original();draw()};
document.addEventListener("voyage-weather",draw);draw();
global.VoyageVisualV5={data,picture,draw};
})(window);