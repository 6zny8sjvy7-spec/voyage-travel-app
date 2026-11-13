/* VOYAGE V4 compact home: one destination/weather/countdown card, no duplicated full-width hero. */
(function(global){
"use strict";
const originalWeather=document.querySelector(".hero .glass");
const tripbar=document.querySelector("#trips .tripbar");
if(!originalWeather||!tripbar)return;
originalWeather.id="v4WeatherGlass";
function layout(){
 const hero=document.querySelector("#v2Home .v2-home-hero");
 if(!hero)return;
 if(originalWeather.parentElement!==hero)hero.append(originalWeather);
 if(tripbar.parentElement!==hero)hero.append(tripbar);
 const title=hero.querySelector(".v2-hero-copy h2");
 if(title)title.setAttribute("aria-label","目前旅程："+title.textContent);
}
const original=render;
render=function(){original();layout()};
layout();
global.VoyageHomeV4={layout};
})(window);
