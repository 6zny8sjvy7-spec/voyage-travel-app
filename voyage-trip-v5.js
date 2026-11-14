/* VOYAGE V5: no-key country/city trip setup. Accurate city coordinates & timezone from geocoding. */
(function(global){
"use strict";
const R=global.VoyageRegionV4,D=global.VoyageDomain,U=global.VoyageUI;
if(!R||!D||!U)return;
const E=U.E,$=id=>document.getElementById(id);
const countries={KR:{name:"韓國",cities:[["Seoul","首爾"],["Busan","釜山"],["Jeju","濟州"]]},TH:{name:"泰國",cities:[["Bangkok","曼谷"],["Chiang Mai","清邁"],["Phuket","普吉島"]]},JP:{name:"日本",cities:[["Tokyo","東京"],["Osaka","大阪"],["Kyoto","京都"],["Fukuoka","福岡"]]},VN:{name:"越南",cities:[["Hanoi","河內"],["Ho Chi Minh City","胡志明市"],["Da Nang","峴港"]]}};
const dialog=E("dialog",{id:"v5TripDialog",class:"v5-trip-dialog"});
const header=E("div",{class:"v5-dialog-head"},[E("h2",{text:"✈️ 規劃下一趟旅行"}),E("p",{text:"只需選國家、城市和出發／回國日期。座標、時區與幣別會自動依城市確認；不需要 API 金鑰。"})]);
const form=E("form",{id:"v5TripForm"});
const country=E("select",{id:"v5TripCountry"}),city=E("select",{id:"v5TripCity"}),customCity=E("input",{id:"v5TripCustomCity",type:"text",placeholder:"其他城市（例：Pattaya；選填）"}),name=E("input",{id:"v5TripTitle",type:"text",placeholder:"例如：東京賞櫻行"}),start=E("input",{id:"v5TripStart",type:"date"}),end=E("input",{id:"v5TripEnd",type:"date"});
for(const [code,entry]of Object.entries(countries))country.append(E("option",{value:code,text:entry.name}));
function cityOptions(){const entry=countries[country.value];city.replaceChildren();for(const [value,label]of entry.cities)city.append(E("option",{value,text:label+" · "+value}));customCity.value="";name.value=entry.name+"自由行"}
country.addEventListener("change",cityOptions);country.value="KR";cityOptions();
const line=(label,node)=>E("label",{},[E("span",{text:label}),node]);
form.append(E("div",{class:"v5-trip-fields"},[line("目的地國家",country),line("目的地城市",city),line("其他城市英文／當地名稱（選填）",customCity),line("旅行名稱",name),line("出發日期",start),line("回國日期",end)]));
const alert=E("div",{id:"v5TripFeedback",class:"v5-trip-feedback",role:"status",text:"目前優先支援韓國、泰國、日本、越南。新旅行不會刪除或覆蓋舊旅程。"});
const submit=E("button",{type:"submit",class:"primary",text:"確認城市並建立旅行"}),cancel=E("button",{type:"button",class:"secondary",text:"取消"});
cancel.onclick=()=>dialog.close();
form.append(alert,E("div",{class:"v1-actions"},[cancel,submit]));
dialog.append(header,form);document.body.append(dialog);
const MAX=366;
function daysBetween(a,b){const startDate=Date.parse(a+"T12:00:00Z"),endDate=Date.parse(b+"T12:00:00Z");if(!Number.isFinite(startDate)||!Number.isFinite(endDate))return null;const days=Math.round((endDate-startDate)/86400000)+1;return days>=1&&days<=MAX?days:null}
function geocodeQuery(query){return"https://geocoding-api.open-meteo.com/v1/search?"+new URLSearchParams({name:query,count:"10",language:"en",format:"json"})}
async function resolveCity(query,countryCode,fetcher=fetch){
 const url=geocodeQuery(query),response=await fetcher(url,{cache:"no-store"});
 if(!response.ok)throw new Error("免費城市座標服務暫時無法使用（HTTP "+response.status+"）");
 const body=await response.json(),matches=(Array.isArray(body.results)?body.results:[]).filter(row=>{
  return row.country_code===countryCode&&Number.isFinite(Number(row.latitude))&&Number.isFinite(Number(row.longitude))&&typeof row.timezone==="string"&&row.timezone.includes("/");
 });
 if(!matches.length)throw new Error("未找到與「"+countries[countryCode]?.name+"」相符的城市，請輸入英文或當地語言名稱重新確認");
 const exact=matches.find(x=>x.name.toLowerCase()===query.trim().toLowerCase());
 return exact||matches[0];
}
form.onsubmit=async event=>{
 event.preventDefault();if(submit.disabled)return;
 const locationName=customCity.value.trim()||city.value,region=country.value,title=name.value.trim(),from=start.value,to=end.value;
 if(!title||!from||!to){alert.textContent="請填寫旅行名稱、出發日期與回國日期";return}
 const count=daysBetween(from,to);
 if(!count){alert.textContent="旅行日期不正確，單趟需介於 1–366 天";return}
 submit.disabled=true;alert.textContent="正在核對「"+locationName+"」的真實座標與時區…";
 try{
  const found=await resolveCity(locationName,region);
  const coords=Number(found.latitude).toFixed(4)+", "+Number(found.longitude).toFixed(4);
  if(!confirm("確認建立以下旅行？\n"+title+"\n"+countries[region].name+" · "+found.name+"\n"+from+" ～ "+to+"（"+count+" 天）\n時區："+found.timezone+"\n座標："+coords+"\n\n原有旅行資料不會被改動。"))return;
  trips.push({id:String(Date.now())+"-"+Math.random().toString(36).slice(2),name:title,city:found.name,country:countries[region].name,countryCode:region,tz:found.timezone,lat:Number(found.latitude),lon:Number(found.longitude),currency:R.data[region].currency,startDate:from,days:Array.from({length:count},()=>[]),people:["我"],packing:[],expenses:[]});
  active=trips.length-1;day=0;save();render();loadWeather();dialog.close();U.toast("已建立 "+title+" · "+count+" 天，天氣與交通會依 "+found.name+" 查詢");
 }catch(err){alert.textContent=String(err.message||err)}finally{submit.disabled=false}
};
const launch=$("newTrip");launch.addEventListener("click",event=>{event.preventDefault();event.stopImmediatePropagation();dialog.showModal()},{capture:true});
global.VoyageTripV5={countries,daysBetween,resolveCity,geocodeQuery};
})(window);