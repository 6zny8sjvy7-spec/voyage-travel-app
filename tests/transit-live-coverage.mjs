/* VOYAGE V7 low-volume, public-data coverage probe. Not a mock or user-facing guarantee.
 * 4 countries x one authentic station pair; no paid API. Transitous prototype use only;
 * requests identify the public project. License/attribution and operational eligibility
 * still require a separate review before a production traffic increase. */
import {mkdirSync,writeFileSync} from "node:fs";
const url="https://api.transitous.org";
const examples=[
 {country:"KR",city:"Seoul",language:"ko",center:"37.5665,126.9780",from:"Myeongdong",to:"Hongik Univ."},
 {country:"TH",city:"Bangkok",language:"th",center:"13.7563,100.5018",from:"Siam",to:"Asok"},
 {country:"JP",city:"Tokyo",language:"ja",center:"35.6762,139.6503",from:"Shinjuku",to:"Shibuya"},
 {country:"VN",city:"Ho Chi Minh City",language:"vi",center:"10.8231,106.6297",from:"Bến Thành",to:"Thảo Điền"}
];
const timeout=8500;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const headers={"Accept":"application/json","User-Agent":"VOYAGE-V7-Probe/1 (https://github.com/6zny8sjvy7-spec/voyage-travel-app)"};
function safe(s){return String(s??"").trim()}
function flatten(res){return Array.isArray(res)?res:Array.isArray(res?.results)?res.results:[]}
async function fetchJSON(path,query){
 const controller=new AbortController();const t=setTimeout(()=>controller.abort(),timeout);
 try{
  const response=await fetch(url+path+"?"+new URLSearchParams(query),{headers,signal:controller.signal});
  if(!response.ok)throw Error("HTTP "+response.status);
  return await response.json();
 }finally{clearTimeout(t)}
}
// Exact identity only. Never treat similar strings as stations (Myeongbong !== Myeongdong;
// ASOKHAR !== Asok). This test uses real, free data and is not mock-backed.
const aliases={
 "KR:Myeongdong":["Myeongdong","명동","명동역","Myeong-dong"],
 "KR:Hongik Univ.":["Hongik Univ.","홍대입구","홍대입구역","Hongik University"],
 "TH:Siam":["Siam","สยาม","Siam BTS"],
 "TH:Asok":["Asok","อโศก","Asoke","Asok BTS"],
 "JP:Shinjuku":["Shinjuku","新宿"],
 "JP:Shibuya":["Shibuya","渋谷"],
 "VN:Bến Thành":["Bến Thành","Ben Thanh","Ga Bến Thành"],
 "VN:Thảo Điền":["Thảo Điền","Thao Dien"]
};
function canonicalName(value){
 return safe(value).normalize("NFKC").toLocaleLowerCase()
  .replace(/[（(][^（）)]*[）)]/g,"")
  .replace(/(?:station|stn|stop|bts|mrt)$/ig,"")
  .replace(/[\s._·・-]/g,"")
  .replace(/(?:站|역|駅)$/u,"");
}
async function stop(city,searchTerm){
 const options=[...new Set(aliases[city.country+":"+searchTerm]||[searchTerm])].slice(0,4);
 const expected=new Set(options.map(canonicalName));
 const rejected=new Set(); let attempts=0;
 for(const query of options){
  const data=flatten(await fetchJSON("/api/v1/geocode",{text:query,type:"STOP",place:city.center,numResults:10,language:city.language}));
  attempts++;
  const good=data.filter(x=>{
   const name=safe(x.name||x.place?.name||x.stopName);
   if(name&&!expected.has(canonicalName(name)))rejected.add(name);
   return name&&expected.has(canonicalName(name));
  });
  if(!good.length)continue;
  const center=city.center.split(",").map(Number);
  const distance=x=>{
   const lat=Number(x.lat??x.latitude??x.place?.lat),lon=Number(x.lon??x.longitude??x.place?.lon);
   return Number.isFinite(lat)&&Number.isFinite(lon)?Math.abs(lat-center[0])+Math.abs(lon-center[1]):Infinity;
  };
  good.sort((a,b)=>distance(a)-distance(b));
  const s=good[0],lat=Number(s.lat??s.latitude??s.place?.lat),lon=Number(s.lon??s.longitude??s.place?.lon);
  const id=safe(s.id||s.place?.id);
  if(!id&&!(Number.isFinite(lat)&&Number.isFinite(lon)))continue;
  return {id,name:safe(s.name||s.place?.name||searchTerm),lat,lon,query:searchTerm,sourceSearch:query,attempts,rejectedSimilar:[...rejected].slice(0,7)};
 }
 throw Error("No EXACT matching station after "+attempts+" free queries for "+searchTerm+"; rejected lookalikes: "+[...rejected].slice(0,5).join(", "));
}
function auditRoute(r){
 if(!Array.isArray(r?.legs))return null;
 const segments=r.legs.filter(l=>!["WALK","BIKE","CAR"].includes(l.mode));
 if(!segments.length)return null;
 return{segments:segments.map(l=>{
  const list=l.intermediateStops;
  const all=Array.isArray(list)?[l.from,...list,l.to]:null;
  const named=all&&all.every(x=>safe(x?.name||x?.place?.name));
  return{mode:safe(l.mode),line:safe(l.displayName||l.routeShortName||l.routeLongName),headsign:safe(l.headsign||l.tripTo?.name),complete:!!named,stopCount:named?all.length-1:null,stopNames:named?all.map(x=>safe(x.name||x.place?.name)):[],realtime:l.realTime===true};
 }),durationSeconds:Number(r.duration)||null}
}
async function probe(c){
 const entry={country:c.country,city:c.city,from:c.from,to:c.to,source:"Transitous /api/v6/plan",testedAt:new Date().toISOString(),result:"not_verified",realTime:"not_verified",routes:[],errors:[]};
 try{
  const from=await stop(c,c.from);await wait(250);const to=await stop(c,c.to);
  entry.matchedStops={from:from.name,to:to.name};
  await wait(250);
  const data=await fetchJSON("/api/v6/plan",{fromPlace:from.id||(from.lat+","+from.lon),toPlace:to.id||(to.lat+","+to.lon),numItineraries:3,detailedLegs:true,language:c.language});
  const options=Array.isArray(data?.itineraries)?data.itineraries.map(auditRoute).filter(Boolean):[];
  entry.routes=options.slice(0,3);
  entry.result=!options.length?"no_route_found":options.some(x=>x.segments.every(l=>l.complete&&Number.isInteger(l.stopCount)&&l.headsign))?"verified_stop_sequences":"route_present_but_incomplete_stop_data";
  entry.realTime=options.some(x=>x.segments.some(l=>l.realtime))?"provider_marks_some_leg_realtime":"no_confirmed_realtime";
 }catch(err){entry.errors.push(safe(err?.message||err).slice(0,260))}
 return entry;
}
const report={purpose:"Temporary four-country real public transit coverage audit; not an ETA or production guarantee",sourcePolicy:"https://transitous.org/api/",time:new Date().toISOString(),cases:[],fullyVerified:false};
for(const c of examples){
 const result=await probe(c);
 report.cases.push(result);
 console.log(c.country+" "+result.result+" routes="+result.routes.length+" "+result.errors.join("; "));
 await wait(300);
}
mkdirSync("coverage-evidence",{recursive:true});
report.fullyVerified=report.cases.every(c=>c.result==="verified_stop_sequences");
if(!report.fullyVerified)console.warn("COVERAGE BLOCKER: Four-country live transit routing NOT verified; green CI means audit execution only.");
writeFileSync("coverage-evidence/transitous-4countries.json",JSON.stringify(report,null,2));
console.log("VERDICT "+JSON.stringify(report.cases.map(x=>({country:x.country,result:x.result,routeCount:x.routes.length,realtime:x.realTime,errors:x.errors}))));
