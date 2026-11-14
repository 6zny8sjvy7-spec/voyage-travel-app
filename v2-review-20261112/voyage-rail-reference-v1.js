/* VOYAGE V7 verified free, static urban rail station-sequence references.
 * JP Ginza Line (19 stops): Tokyo Metro official station-order page:
 * https://www.tokyometro.jp/en/route_station/index.html
 * https://www.tokyometro.jp/station/line_ginza/index.html
 * VN Metro Line 1 (14 stops): Ho Chi Minh City official information portal:
 * https://ttbc-hcm.gov.vn/thanh-pho-ho-chi-minh-lay-y-kien-nguoi-dan-ve-ten-tuyen-va-nha-ga-metro-1021719.html
 * Accessed 2026-11-14. These are verified line orders, NOT live service
 * availability, operational calendars, fares, or arrival predictions.
 * No API key, paid feed, credit card, external navigation, or fabricated time.
 */
(function(){
"use strict";
const adapter=window.VoyageTransitV5;
if(!adapter||typeof adapter.plan!=="function")return;
const prior=adapter.plan;
const routes={
 JP:{
  country:"JP",cities:/東京|tokyo/i,line:"東京 Metro 銀座線 / Tokyo Metro Ginza Line",
  id:"TokyoMetro-G",source:"Tokyo Metro 官方銀座線站序（19 站） · https://www.tokyometro.jp/en/route_station/index.html",
  stops:[
   ["G01","Shibuya","渋谷","澀谷"],
   ["G02","Omote-sando","表参道","表參道"],
   ["G03","Gaiemmae","外苑前","外苑前"],
   ["G04","Aoyama-itchome","青山一丁目","青山一丁目"],
   ["G05","Akasaka-mitsuke","赤坂見附","赤坂見附"],
   ["G06","Tameike-sanno","溜池山王","溜池山王"],
   ["G07","Toranomon","虎ノ門","虎之門"],
   ["G08","Shimbashi","新橋","新橋"],
   ["G09","Ginza","銀座","銀座"],
   ["G10","Kyobashi","京橋","京橋"],
   ["G11","Nihombashi","日本橋","日本橋"],
   ["G12","Mitsukoshimae","三越前","三越前"],
   ["G13","Kanda","神田","神田"],
   ["G14","Suehirocho","末広町","末廣町"],
   ["G15","Ueno-hirokoji","上野広小路","上野廣小路"],
   ["G16","Ueno","上野","上野"],
   ["G17","Inaricho","稲荷町","稻荷町"],
   ["G18","Tawaramachi","田原町","田原町"],
   ["G19","Asakusa","浅草","淺草"]
  ],
  aliases:{"Shibuya":["Shibuya Station"],"Omote-sando":["Omotesando"],"Aoyama-itchome":["Aoyama Itchome"],"Akasaka-mitsuke":["Akasaka Mitsuke"],"Tameike-sanno":["Tameike Sanno"],"Ueno-hirokoji":["Ueno Hirokoji"],"Suehirocho":["Suehirocho Station"]}
 },
 VN:{
  country:"VN",cities:/胡志明|ho[ -]?chi[ -]?minh|saigon|sài gòn|hồ chí minh/i,
  line:"胡志明市捷運 1 號線 / HCMC Metro Line 1",id:"HCMC-M1",
  source:"胡志明市政府官方資訊，1 號線 14 站 · https://ttbc-hcm.gov.vn/thanh-pho-ho-chi-minh-lay-y-kien-nguoi-dan-ve-ten-tuyen-va-nha-ga-metro-1021719.html",
  stops:[
   ["M1-01","Ben Thanh","Bến Thành","濱城"],
   ["M1-02","Opera House","Nhà hát Thành phố",""],
   ["M1-03","Ba Son","Ba Son",""],
   ["M1-04","Van Thanh Park","Công viên Văn Thánh",""],
   ["M1-05","Tan Cang","Tân Cảng",""],
   ["M1-06","Thao Dien","Thảo Điền",""],
   ["M1-07","An Phu","An Phú",""],
   ["M1-08","Rach Chiec","Rạch Chiếc",""],
   ["M1-09","Phuoc Long","Phước Long",""],
   ["M1-10","Binh Thai","Bình Thái",""],
   ["M1-11","Thu Duc","Thủ Đức",""],
   ["M1-12","Hi Tech Park","Khu Công nghệ cao",""],
   ["M1-13","National University","Đại học Quốc gia",""],
   ["M1-14","Suoi Tien Terminal","Bến xe Suối Tiên",""]
  ],
  aliases:{"Ben Thanh":["Bến Thành Station","Ben Thanh Station","BenThanh","檳城","濱城市場"],"Opera House":["Opera House Station"],"Thao Dien":["Thảo Điền Station"],"Suoi Tien Terminal":["Bến xe Suối Tiên Terminal","Suoi Tien Bus Station"]}
 }
};
function normalize(v){
 return String(v||"").normalize("NFKD").toLocaleLowerCase()
  .replace(/\p{M}/gu,"").replace(/(?:\s+(?:station|stop|駅|站))$/iu,"")
  .replace(/[\s_.\-·・／\\/]/g,"").trim();
}
function countryCode(t){
 return window.VoyageRegionV4?.countryCode(t)||t?.countryCode||"";
}
function indexOfStop(line,term){
 const q=normalize(term);if(!q)return-1;
 return line.stops.findIndex(([id,en,local,zh])=>{
  const variants=[id,en,local,zh,...(line.aliases?.[en]||[])];
  return variants.some(x=>x&&normalize(x)===q);
 });
}
function staticPlan(from,to,t,options={}){
 const code=countryCode(t),line=routes[code];
 if(!line||!line.cities.test(String(t?.city||"")))return null;
 const a=indexOfStop(line,from),b=indexOfStop(line,to);
 if(a<0||b<0||a===b)return null;
 const forward=b>a,part=(forward?line.stops.slice(a,b+1):line.stops.slice(b,a+1).reverse());
 const stations=part.map(([id,en,local,zh])=>({id,en,local,zh,name:local}));
 const end=forward?line.stops[line.stops.length-1]:line.stops[0];
 const headsign=end[1]+" / "+end[2];
 const requested=String(options.time||"");
 return [{
  kind:"official-static-reference",
  country:code,
  origin:{name:line.stops[a][2]},destination:{name:line.stops[b][2]},
  label:"已核實此路線停靠站順序；不能代表當日一定有營運班次",
  minutes:null,transfers:0,
  source:line.source,
  sourceUpdated:"2026-11-14",
  requestedAt:new Date().toISOString(),
  requestedTravelTime:requested,
  hasRealtime:false,staticSchedule:false,
  legs:[{
   mode:"SUBWAY",line:line.line,routeId:line.id,
   headsign,directionVerified:true,sequenceComplete:true,
   stations,stationCount:stations.length-1,
   duration:0,realtime:false,departure:null,arrival:null
  }]
 }];
}
adapter.plan=async function(from,to,t,options={}){
 const result=staticPlan(from,to,t,options);
 if(result)return result;
 return prior(from,to,t,options);
};
window.VoyageRailReferenceV1={
 routes:Object.fromEntries(Object.entries(routes).map(([code,v])=>[code,{line:v.line,stopCount:v.stops.length,source:v.source}])),
 staticPlan,sourceUpdated:"2026-11-14",staticOnly:true,license:"official public route order, reference-only"
};
})();
