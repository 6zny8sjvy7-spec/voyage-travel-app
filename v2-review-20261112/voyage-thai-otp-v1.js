/* VOYAGE V7 Thailand official OTP GTFS static corridor.
 * Free public CC-BY route data, NOT live train times. Data audited 2026-11-14
 * from https://namtang-api.otp.go.th/download/namtang-gtfs.zip,
 * feed_version 20261112, trips on Sukhumvit route_id 1, Siam stop_id=12,
 * Chit Lom=28, Phloen Chit=27, Nana=26, Asok=25.
 * Official GTFS trip patterns have full stop_sequence, direction and headsign.
 * This module adds a narrowly verified corridor only; other routes use the
 * existing transit adapter and must not be guessed. No payments or API keys.
 */
(function(){
"use strict";
const adapter=window.VoyageTransitV5;
if(!adapter||typeof adapter.plan!=="function")return;
const prior=adapter.plan;
const source="Thailand OTP Namtang GTFS 2026-11-12 · CC BY · 官方靜態停靠站序（非即時進站）";
const feed="https://namtang-api.otp.go.th/opendata";
const stops=[
 {id:"12",en:"Siam",local:"สยาม",name:"BTS สยาม;BTS Siam",aliases:["暹羅","暹罗","Siam","สยาม"]},
 {id:"28",en:"Chit Lom",local:"ชิดลม",name:"BTS ชิดลม;BTS Chit Lom",aliases:["Chit Lom","Chidlom","ชิดลม"]},
 {id:"27",en:"Phloen Chit",local:"เพลินจิต",name:"BTS เพลินจิต;BTS Phloen Chit",aliases:["Phloen Chit","Phloenchit","เพลินจิต"]},
 {id:"26",en:"Nana",local:"นานา",name:"BTS นานา;BTS Nana",aliases:["Nana","นานา"]},
 {id:"25",en:"Asok",local:"อโศก",name:"BTS อโศก;BTS Asok",aliases:["阿索克","Asok","Asoke","อโศก"]}
];
const norm=s=>String(s||"").normalize("NFKC").toLocaleLowerCase().trim()
 .replace(/^(?:bts|mrt)\s+/i,"").replace(/\s+(?:station|bts|mrt)$/i,"")
 .replace(/[\s._·・-]/g,"");
function stationIndex(raw){
 const k=norm(raw);
 if(!k)return-1;
 return stops.findIndex(x=>[x.en,x.local,...x.aliases].some(y=>norm(y)===k));
}
function validCountry(t){
 const code=window.VoyageRegionV4?.countryCode(t)||t?.countryCode||"";
 const city=String(t?.city||"").toLocaleLowerCase();
 return code==="TH"&&/曼谷|bangkok|กรุงเทพ/.test(city);
}
function serviceDay(time){
 const date=String(time||"").slice(0,10);
 if(!/^\d{4}-\d\d-\d\d$/.test(date)||date<"2026-11-12"||date>"2026-12-31")return null;
 const n=new Date(date+"T12:00:00Z");if(!Number.isFinite(n.getTime())||n.toISOString().slice(0,10)!==date)return null;
 return{date,weekend:n.getUTCDay()===0||n.getUTCDay()===6};
}
function fromStatic(from,to,t,options={}){
 if(!validCountry(t))return null;
 const a=stationIndex(from),b=stationIndex(to);
 if(a<0||b<0||b<=a)return null;  // reverse branch not yet audited.
 const service=serviceDay(options.time);
 if(!service)return null;
 const routeStops=stops.slice(a,b+1).map(x=>({id:x.id,name:x.name,en:x.en,local:x.local,zh:""}));
 const headsign=service.weekend?"BTS Kheha / เคหะฯ":"BTS Samrong / สำโรง 或 BTS Kheha / เคหะฯ";
 return[{
   kind:"otp-th-static",
   country:"TH",origin:{name:stops[a].en},destination:{name:stops[b].en},
   label:"泰國官方 GTFS 已核實停靠順序；不代表此時有實際列車",
   minutes:null,transfers:0,
   source:source+" · "+feed,
   sourceUpdated:"2026-11-12",
   requestedAt:new Date().toISOString(),
   hasRealtime:false,staticSchedule:true,serviceDate:service.date,
   legs:[{mode:"SUBWAY",line:"BTS Sukhumvit",headsign,routeId:"1",directionVerified:true,sequenceComplete:true,
     stations:routeStops,stationCount:b-a,duration:0,realtime:false,departure:null,arrival:null}]
 }];
}
adapter.plan=async function(from,to,t,options={}){
 const reference=fromStatic(from,to,t,options);
 if(reference)return reference;
 return prior(from,to,t,options);
};
window.VoyageThaiOTP={stationIndex,fromStatic,sourceUpdated:"2026-11-12",license:"CC BY",staticOnly:true};
})();
