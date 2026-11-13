/* VOYAGE V5 keyless transit adapter for four pilot countries.
   Uses published Transitous/MOTIS 2 API when coverage exists, never manufactures arrivals.
   Production capacity/terms: noncommercial, low-use, open-source; source attribution required. */
(function(global){
"use strict";
const R=global.VoyageRegionV4;
const SERVICE="https://api.transitous.org", ATTRIBUTION="https://transitous.org/sources/";
const supported=new Set(["KR","TH","JP","VN"]);
const lang={KR:"ko",TH:"th",JP:"ja",VN:"vi"};
let lastRequest=0;
const number=v=>v==null?NaN:Number(v);
function safeCoords(p){
 const q=p?.place||p?.location||p||{};
 const lat=number(q.lat??q.latitude??p?.lat??p?.geometry?.coordinates?.[1]);
 const lon=number(q.lon??q.lng??q.longitude??p?.lon??p?.geometry?.coordinates?.[0]);
 return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;
}
function distance(a,b){
 const deg=Math.PI/180,p1=a.lat*deg,p2=b.lat*deg,dl=(b.lon-a.lon)*deg,dp=(b.lat-a.lat)*deg;
 return 6371*2*Math.atan2(Math.sqrt(Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2),Math.sqrt(Math.max(0,1-(Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2))));
}
function cityOrigin(t){const c=R?.trustedCoords(t);return c?{lat:c.latitude,lon:c.longitude}:null}
function matchesCountry(entry,code){
 const match=String(entry?.countryCode||entry?.country||entry?.place?.countryCode||entry?.place?.country||"").trim().toUpperCase();
 if(!match)return true;
 const aliases={KR:["KR","KOR","REPUBLIC OF KOREA","SOUTH KOREA","대한민국","한국"],TH:["TH","THA","THAILAND","ประเทศไทย"],JP:["JP","JPN","JAPAN","日本"],VN:["VN","VNM","VIETNAM","VIỆT NAM","越南"]};
 return (aliases[code]||[]).includes(match);
}
// Display/search aliases are lookup hints, never invented verified stop sequences.
const stationAlias={
 KR:{"明洞":["Myeongdong","명동"],"弘大":["Hongik Univ.","홍대입구","Hongdae"],"弘大入口":["Hongik Univ.","홍대입구"],"聖水":["Seongsu","성수"],"首爾站":["Seoul Station","서울역"],"江南":["Gangnam","강남"],"孔德":["Gongdeok","공덕"]},
 TH:{"暹羅":["Siam","สยาม"],"阿索克":["Asok","อโศก"],"奇隆":["Chit Lom","ชิดลม"],"勝利紀念碑":["Victory Monument","อนุสาวรีย์ชัยสมรภูมิ"],"莫奇":["Mo Chit","หมอชิต"]},
 JP:{"新宿":["Shinjuku","新宿"],"澀谷":["Shibuya","渋谷"],"東京站":["Tokyo","東京"],"大阪":["Osaka","大阪"],"梅田":["Umeda","梅田"]},
 VN:{"濱城市場":["Bến Thành","Ben Thanh"],"檳城市場":["Bến Thành","Ben Thanh"],"濱城":["Bến Thành","Ben Thanh"],"河內":["Hà Nội","Hanoi"]}
};
const normName=v=>String(v||"").toLocaleLowerCase().replaceAll(" ","").replaceAll("站","").replaceAll("역","");
function aliases(query,code){
 const k=normName(query);
 for(const [main,others] of Object.entries(stationAlias[code]||{})){
  const group=[main,...others];
  if(group.some(name=>normName(name)===k))return group;
 }
 return[query];
}
function stationMatches(label,query,code){
 const normalize=x=>String(x||"").toLocaleLowerCase().trim().replaceAll(" ","").replaceAll("站","").replaceAll("역","");
 const name=normalize(label),q=normalize(query);
 if(!name||!q)return false;
 if(name===q||name.includes(q)&&q.length>=2||q.includes(name)&&name.length>=3)return true;
 const names=aliases(query,code);
 if(names.some(x=>normalize(x)===name))return true;
 if(names.some(x=>normalize(x).length>=2&&name.includes(normalize(x))))return true;
 return false;
}
function suggestStation(entries,phrase,t){
 const list=Array.isArray(entries)?entries:Array.isArray(entries?.results)?entries.results:[];
 const origin=cityOrigin(t),code=R?.countryCode(t),q=String(phrase).trim().toLowerCase();
 return list.map(p=>{
 const c=safeCoords(p);if(!c||!matchesCountry(p,code))return null;
 const km=origin?distance(origin,c):Infinity;if(!origin||km>120)return null;
 const label=String(p.name||p.place?.name||p.stopName||"").trim();
 if(!stationMatches(label,phrase,code))return null;
 let score=km/10+(label.toLowerCase()===q?-10:label.toLowerCase().includes(q)?-3:0);
 return{p,c,km,score,label,id:String(p.id||p.place?.id||"")};
 }).filter(Boolean).sort((a,b)=>a.score-b.score)[0]||null;
}
async function json(url,signal,fetcher=fetch){
 const response=await fetcher(url,{signal,credentials:"omit",headers:{Accept:"application/json"}});
 if(!response.ok)throw new Error("交通來源 HTTP "+response.status);
 return response.json();
}
function context(t){const country=R?.countryCode(t)||"";if(!supported.has(country))throw new Error("目前先支援韓國、泰國、日本、越南四國");if(!cityOrigin(t))throw new Error("尚未確認目的地城市座標，請先設定正確城市");return{country,language:lang[country],origin:cityOrigin(t)}}
async function geocode(name,t,{fetcher=fetch,signal}={}){
 const cfg=context(t),q=String(name||"").trim();if(!q)throw new Error("請輸入站名");
 const names=aliases(q,cfg.country),variants=[...names.flatMap(x=>[x+", "+t.city,x])],seen=new Set();
 for(const term of variants){
 if(seen.has(term))continue;seen.add(term);
 const p=new URLSearchParams({text:term,type:"STOP",place:cfg.origin.lat+","+cfg.origin.lon,numResults:"10",language:cfg.language});
 const found=await json(SERVICE+"/api/v1/geocode?"+p,signal,fetcher);
 const best=suggestStation(found,q,t);
 if(best)return{...best.c,id:best.id,name:best.label,source:"Transitous / OpenStreetMap",country:cfg.country};
 }
 throw new Error("公開站名資料沒有查到「"+q+"」附近的可靠車站");
}
function parseStop(raw){
 if(!raw)return null;
 const p=raw.place||raw,c=safeCoords(p);
 const name=String(p.name||p.stopName||"").trim();
 if(!name)return null;
 const translations=p.translations||p.names||{};
 return{zh:String(translations.zh||translations["zh-TW"]||"").trim(),local:String(translations.local||translations.native||"").trim(),en:String(translations.en||"").trim(),name,id:String(p.id||""),lat:c?.lat,lon:c?.lon};
}
function normalizePlan(data,{origin,destination,country}){
 if(!Array.isArray(data?.itineraries))throw new Error("路線資料格式不完整");
 return data.itineraries.filter(it=>Array.isArray(it.legs)&&it.legs.some(l=>l.mode!=="WALK"&&l.mode!=="BIKE"&&l.mode!=="CAR"))
 .slice(0,8).map(it=>{
 const legs=it.legs.map(l=>{
 const intermediate=Array.isArray(l.intermediateStops)?l.intermediateStops:null;
 const rawStops=[l.from,...(intermediate||[]),l.to];
 const list=rawStops.map(parseStop).filter(Boolean);
 const isWalk=["WALK","BIKE"].includes(l.mode);
 // Endpoint-only itineraries MUST NOT be counted as one station: an omitted
 // intermediateStops field is not evidence of adjacent stops.
 const sequenceComplete=isWalk||intermediate!==null&&list.length===rawStops.length&&list.length>=2;
 const headsign=String(l.headsign||l.tripTo?.name||"").trim();
 return{mode:l.mode,line:l.displayName||l.routeShortName||l.routeLongName||(isWalk?"步行":"大眾運輸"),headsign:headsign||"方向未提供，請以月台或官方資訊核對",directionVerified:!!headsign,stations:list,sequenceComplete,stationCount:sequenceComplete&&!isWalk?list.length-1:null,duration:Number(l.duration)||0,realtime:l.realTime===true,departure:l.startTime||null,arrival:l.endTime||null,routeId:l.routeId||null};
 });
 const transitLegs=legs.filter(l=>!["WALK","BIKE","CAR"].includes(l.mode));
 const transfers=Math.max(0,transitLegs.length-1);
 const duration=Number(it.duration)||0;
 return{kind:"transitous",country,origin,destination,label:"Transitous 公開交通路線 · 按取得資料顯示站名、線路、方向及班表；只有明確標示的路段使用即時資料",minutes:duration>0?Math.ceil(duration/60):null,transfers,legs,source:ATTRIBUTION,requestedAt:new Date().toISOString(),hasRealtime:transitLegs.some(l=>l.realtime)};
 });
}
async function plan(from,to,t,{fetcher=fetch,signal}={}){
 const c=context(t);
 const a=await geocode(from,t,{fetcher,signal}),b=await geocode(to,t,{fetcher,signal});
 if(distance(a,b)<.15)throw new Error("起點和終點距離太近，請確認站名");
 const query=new URLSearchParams({fromPlace:a.id||a.lat+","+a.lon,toPlace:b.id||b.lat+","+b.lon,numItineraries:"8",detailedLegs:"true",language:c.language});
 const result=normalizePlan(await json(SERVICE+"/api/v6/plan?"+query,signal,fetcher),{origin:a,destination:b,country:c.country});
 if(!result.length)throw new Error("此城市的公開交通資料目前沒有可驗證的乘車路線");
 return result;
}
function readableDeparture(row,now=Date.now()){
 const place=row.place||{};
 const ts=place.departure||place.departureTime||place.scheduledDeparture||row.departure||row.scheduledDeparture;
 if(!ts||!Number.isFinite(Date.parse(ts)))return null;
 const when=Date.parse(ts),mins=Math.ceil((when-now)/60000);
 if(mins<0||mins>180)return null;
 const realtime=row.realTime===true&&["OBSERVED","PREDICTED","PROPAGATED"].includes(place.departureTimestampReason);
 return{line:String(row.displayName||row.routeShortName||row.routeLongName||row.mode||"路線未標示"),headsign:String(row.headsign||row.tripTo?.name||"方向未標示"),minutes:mins,time:ts,realtime,cancelled:row.cancelled===true||row.tripCancelled===true,stop:String(place.name||""),source:ATTRIBUTION};
}
async function departures(name,t,{fetcher=fetch,signal}={}){
 const station=await geocode(name,t,{fetcher,signal});
 const query=new URLSearchParams(station.id?{stopId:station.id,n:"10"}:{center:station.lat+","+station.lon,radius:"180",n:"10"});
 const raw=await json(SERVICE+"/api/v6/stoptimes?"+query,signal,fetcher);
 const rows=Array.isArray(raw)?raw:raw?.stopTimes||raw?.stoptimes||raw?.departures||[];
 if(!Array.isArray(rows))throw new Error("到站資料格式無法辨識");
 const items=rows.map(row=>readableDeparture(row)).filter(Boolean);
 return{station,items,at:new Date().toISOString(),source:ATTRIBUTION};
}
function google(from,to,t){return"https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(from+", "+t.city+", "+t.country)+"&destination="+encodeURIComponent(to+", "+t.city+", "+t.country)+"&travelmode=transit"}
function naver(from,to,t){return"https://map.naver.com/p/search/"+encodeURIComponent(to+", "+t.city+", "+t.country)}
const countryText={KR:"韓國：地鐵／AREX／可取得的公車資料",TH:"泰國：BTS／MRT／機場快線／可取得的公車資料",JP:"日本：地鐵／鐵道／可取得的公車資料",VN:"越南：城市鐵路／可取得的公車資料"};
function description(t){const code=R?.countryCode(t);return countryText[code]||"尚未加入的國家"}
global.VoyageTransitV5={supported,context,geocode,plan,departures,normalizePlan,readableDeparture,suggestStation,stationMatches,matchesCountry,safeCoords,distance,google,naver,description,ATTRIBUTION};
})(window);