/* VOYAGE V6: multi-language trip creation without false failure when geocoding cannot resolve Chinese city.
   Original localStorage and existing trips are preserved verbatim. */
(function(){
"use strict";
const D=window.VoyageDomain,button=document.getElementById("newTrip");if(!D||!button)return;
const normal=x=>String(x||"").trim().toLocaleLowerCase().replace(/\s+/g,"");
const nations={
 TH:{name:"泰國",code:"TH",tz:"Asia/Bangkok",currency:"THB",aliases:["thailand","ประเทศไทย","th"]},
 KR:{name:"韓國",code:"KR",tz:"Asia/Seoul",currency:"KRW",aliases:["korea","south korea","한국","대한민국","kr"]},
 JP:{name:"日本",code:"JP",tz:"Asia/Tokyo",currency:"JPY",aliases:["japan","jp"]},
 VN:{name:"越南",code:"VN",tz:"Asia/Ho_Chi_Minh",currency:"VND",aliases:["vietnam","việt nam","vn"]}
};
const known=[
 {name:"Bangkok",code:"TH",lat:13.7563,lon:100.5018,aliases:["曼谷","กรุงเทพมหานคร","bangkok"]},
 {name:"Chiang Mai",code:"TH",lat:18.7883,lon:98.9853,aliases:["清邁","เชียงใหม่","chiang mai","chiangmai"]},
 {name:"Seoul",code:"KR",lat:37.5665,lon:126.9780,aliases:["首爾","서울","seoul"]},
 {name:"Busan",code:"KR",lat:35.1796,lon:129.0756,aliases:["釜山","부산","busan"]},
 {name:"Tokyo",code:"JP",lat:35.6762,lon:139.6503,aliases:["東京","tokyo"]},
 {name:"Osaka",code:"JP",lat:34.6937,lon:135.5023,aliases:["大阪","osaka"]},
 {name:"Kyoto",code:"JP",lat:35.0116,lon:135.7681,aliases:["京都","kyoto"]},
 {name:"Hanoi",code:"VN",lat:21.0285,lon:105.8542,aliases:["河內","河内","hanoi","hà nội"]},
 {name:"Ho Chi Minh City",code:"VN",lat:10.8231,lon:106.6297,aliases:["胡志明市","胡志明","西貢","saigon","ho chi minh city","hồ chí minh"]}
];
function countryFrom(raw){
 const name=normal(raw);return Object.values(nations).find(n=>[n.name,n.code,...n.aliases].some(a=>normal(a)===name))||null;
}
async function locate(raw,country){
 const alias=known.find(c=>c.aliases.some(a=>normal(a)===normal(raw)));
 if(alias){
  if(country&&alias.code!==country.code)throw Error("「"+raw+"」與「"+country.name+"」不一致，請確認城市與國家。");
  const nation=Object.values(nations).find(x=>x.code===alias.code);
  return {name:alias.name,latitude:alias.lat,longitude:alias.lon,country_code:alias.code,timezone:nation?.tz||"UTC"};
 }
 try{
  const u=new URL("https://geocoding-api.open-meteo.com/v1/search");
  u.search=new URLSearchParams({name:raw,count:"10",language:"en",format:"json",...(country?{countryCode:country.code}:{})}).toString();
  const res=await fetch(u,{credentials:"omit"});
  if(!res.ok)return null;
  const j=await res.json(),options=Array.isArray(j.results)?j.results:[];
  return options.find(v=>Number.isFinite(Number(v.latitude))&&Number.isFinite(Number(v.longitude))&&(!country||v.country_code===country.code))||null;
 }catch{return null}
}
button.onclick=async()=>{
 const name=prompt("旅行名稱（例如：曼谷自由行）");if(!name?.trim())return;
 const city=prompt("目的地城市（支援中文，例如：曼谷）");if(!city?.trim())return;
 const countryInput=prompt("國家（例如：泰國）");if(countryInput===null)return;
 const country=countryFrom(countryInput);
 const lengthInput=prompt("旅行天數（1～365 天，以後仍可新增）","5");if(lengthInput===null)return;
 const days=Number(lengthInput);
 if(!Number.isInteger(days)||days<1||days>365){alert("請輸入 1～365 的整數天數");return}
 const dateInput=prompt("出發日期（YYYY-MM-DD，可留空）","");if(dateInput===null)return;
 const startDate=dateInput.trim();
 if(startDate&&D.dayISO(startDate,0)!==startDate){alert("出發日期不正確，請使用 YYYY-MM-DD");return}
 let located;
 try{located=await locate(city.trim(),country)}catch(e){alert(e.message);return}
 const canLocate=!!located,code=country?.code||located?.country_code||"";
 const fallback=Object.values(nations).find(v=>v.code===code);
 const newTrip={
  id:D.uid(),name:name.trim(),city:city.trim(),cityEnglish:located?.name||"",
  country:country?.name||fallback?.name||countryInput.trim()||"未設定國家",
  countryCode:code,tz:located?.timezone||country?.tz||fallback?.tz||"UTC",
  currency:country?.currency||fallback?.currency||"TWD",
  startDate,lat:canLocate?Number(located.latitude):null,lon:canLocate?Number(located.longitude):null,
  needsLocation:!canLocate,days:Array.from({length:days},()=>[]),people:["我"],expenses:[],packing:[],documents:[]
 };
 const warning=canLocate?"已找到城市中心位置（不是具體站牌）":"城市定位資料暫未取得，可先排旅行，稍後再定位";
 if(!confirm("建立「"+newTrip.name+"」\n"+newTrip.country+" · "+newTrip.city+"\n"+days+" 天"+(startDate?" · "+startDate+" 出發":" · 日期未設定")+"\n"+warning+"\n\n確定建立嗎？"))return;
 trips.push(newTrip);active=trips.length-1;day=0;save();render();loadWeather();
};
button.hidden=true;button.style.setProperty("display","none","important");
function countdown(){
 const home=document.getElementById("v2Home"),t=typeof trip==="function"?trip():null;
 const copy=home?.querySelector(".v2-hero-copy");if(!copy||!t)return;
 let label="尚未設定出發日期";
 if(t.startDate&&D.dayISO(t.startDate,0)===t.startDate){
  try{
   const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:t.tz||"Asia/Taipei",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
   const today=parts.year+"-"+parts.month+"-"+parts.day;
   const remaining=Math.round((Date.parse(t.startDate+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/86400000);
   label=remaining>0?"✈️ 距離出發還有 "+remaining+" 天":remaining===0?"✈️ 今天出發":"✈️ 旅行已開始 "+(-remaining)+" 天";
  }catch{label="✈️ 出發日期："+t.startDate}
 }
 let out=copy.querySelector("#v6Countdown");
 if(!out){out=document.createElement("p");out.id="v6Countdown";out.className="v6-countdown";copy.insertBefore(out,copy.children[1]||null)}
 out.textContent=label;
}
const style=document.createElement("style");
style.textContent=".v6-countdown{display:inline-block!important;margin:8px 0 12px;padding:6px 12px;border-radius:20px;background:var(--soft);border:1px solid var(--line);font-weight:750;font-size:14px;color:var(--ink)}";
document.head.append(style);
const previousRender=render;render=function(){previousRender();countdown()};countdown();
})();