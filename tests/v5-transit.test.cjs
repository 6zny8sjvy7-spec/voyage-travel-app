const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('voyage-transit-v5.js','utf8');
const cities={
KR:{countryCode:'KR',city:'Seoul',lat:37.5665,lon:126.978},
TH:{countryCode:'TH',city:'Bangkok',lat:13.7563,lon:100.5018},
JP:{countryCode:'JP',city:'Tokyo',lat:35.6762,lon:139.6503},
VN:{countryCode:'VN',city:'Ho Chi Minh City',lat:10.8231,lon:106.6297}
};
function init(fetcher){
 const env={console,URLSearchParams,fetch:fetcher,Date,Math,Set,Map,Number,Error};
 env.window=env;
 env.VoyageRegionV4={
 countryCode:t=>t.countryCode,
 trustedCoords:t=>({latitude:t.lat,longitude:t.lon})
 };
 vm.runInNewContext(source,env);
 return env.VoyageTransitV5;
}
const response=data=>({ok:true,json:async()=>data});
function fakeProvider(code,{mismatch=false}={}){
 const t=cities[code],requests=[];
 const fetcher=async url=>{
 requests.push(String(url));
 const u=new URL(url);
 const name=u.searchParams.get('text')||'',isOrigin=name.toLowerCase().includes('origin');
 const coords=isOrigin?{lat:t.lat+0.001,lon:t.lon+0.001}:{lat:t.lat+0.02,lon:t.lon+0.025};
 if(u.pathname.endsWith('/geocode'))return response([{id:(isOrigin?'a':'b')+code,name:isOrigin?'Origin Station':'Destination Station',...coords,country:mismatch?'ZZ':code}]);
 if(u.pathname.endsWith('/plan'))return response({itineraries:[{duration:1440,transfers:1,legs:[
  {mode:code==='TH'?'SUBWAY':'RAIL',displayName:'Line 1',headsign:'Toward Center',duration:600,realTime:false,from:{name:'Origin Station',...coords},intermediateStops:[{name:'Middle Stop'}],to:{name:'Transfer Hub',lat:t.lat+.01,lon:t.lon+.01}},
  {mode:code==='VN'?'BUS':'SUBWAY',displayName:'Line 2',headsign:'Toward Destination',duration:600,realTime:false,from:{name:'Transfer Hub',lat:t.lat+.01,lon:t.lon+.01},intermediateStops:[{name:'Second Stop'}],to:{name:'Destination Station',lat:t.lat+.02,lon:t.lon+.025}}
 ]}]});
 if(u.pathname.endsWith('/stoptimes'))return response({stopTimes:[
  {displayName:'L1',headsign:'Toward Airport',realTime:false,place:{name:'Origin Station',departure:new Date(Date.now()+6*60000).toISOString(),departureTimestampReason:'NO_RT_DATA'}},
  {displayName:'L2',headsign:'Toward Center',realTime:true,place:{name:'Origin Station',departure:new Date(Date.now()+4*60000).toISOString(),departureTimestampReason:'PREDICTED'}}
 ]});
 throw new Error('unexpected '+url);
 };
 return{fetcher,requests}
}
test('all four pilot countries resolve routes against their OWN city and data',async()=>{
 for(const code of Object.keys(cities)){
  const {fetcher,requests}=fakeProvider(code),A=init(fetcher);
  const routes=await A.plan('Origin','Destination',cities[code],{fetcher});
  assert.equal(routes.length,1,code);
  assert.equal(routes[0].country,code);
  assert.equal(routes[0].minutes,24);
  assert.equal(routes[0].transfers,1);
  assert.equal(routes[0].legs.length,2);
  assert.equal(routes[0].legs[0].stations[1].zh,'Middle Stop');
  assert.equal(routes[0].legs[0].sequenceComplete,true);
  assert.equal(routes[0].legs[0].stationCount,2);
  assert.equal(routes[0].legs[1].stationCount,2);
  assert.equal(routes[0].legs[0].directionVerified,true);
  assert.equal(routes[0].legs[1].headsign,'Toward Destination');
  assert.equal(routes[0].hasRealtime,false);
  assert.ok(requests.every(x=>x.startsWith('https://api.transitous.org/')));
  assert.ok(requests.some(x=>x.includes('language='+({KR:'ko',TH:'th',JP:'ja',VN:'vi'})[code])),code);
 }
});
test('wrong-country station matches are rejected rather than used for route',async()=>{
 const {fetcher,requests}=fakeProvider('TH',{mismatch:true});
 const A=init(fetcher);
 await assert.rejects(()=>A.plan('Origin','Destination',cities.TH,{fetcher}),/可靠車站/);
 assert.equal(requests.filter(u=>u.includes('/plan')).length,0);
});
test('out-of-city stations are rejected instead of silently routing across the wrong country',()=>{
 const A=init(async()=>response([]));
 const bad=[{country:'KR',name:'Siam',lat:13.746,lon:100.53}];
 assert.equal(A.suggestStation(bad,'Siam',cities.KR),null);
});
test('actual live data is distinguished from scheduled predictions',async()=>{
 const {fetcher}=fakeProvider('JP'),A=init(fetcher);
 const departures=await A.departures('Origin',cities.JP,{fetcher});
 assert.equal(departures.items.length,2);
 assert.equal(departures.items[0].realtime,false);
 assert.equal(departures.items[1].realtime,true);
 assert.ok(departures.items[0].minutes>=0&&departures.items[0].minutes<=7);
 assert.ok(departures.items[1].minutes>=0&&departures.items[1].minutes<=5);
});
test('missing departure timestamp NEVER produces an invented ETA',()=>{
 const A=init(async()=>response([]));
 assert.equal(A.readableDeparture({displayName:'L1',realTime:true,place:{name:'Origin',departureTimestampReason:'PREDICTED'}}),null);
 assert.equal(A.readableDeparture({realTime:false,place:{departure:'not-a-date'}}),null);
});
test('API budget is keyless and provider list is limited to legitimate public sources',()=>{
 const A=init(async()=>response([]));
 for(const c of Object.keys(cities))assert.match(A.description(cities[c]),new RegExp({KR:'韓國',TH:'泰國',JP:'日本',VN:'越南'}[c]));
 assert.equal(A.context(cities.KR).country,'KR');
 assert.throws(()=>A.context({countryCode:'US',city:'NYC',lat:40,lon:-73}),/四國/);
 assert.doesNotMatch(source,/maps\.googleapis\.com|service_role|apiKey=|AIza/);
});

test('missing intermediate stops cannot be mislabeled as a one-station journey',()=>{
 const A=init(async()=>response([]));
 const base={origin:{name:'A'},destination:{name:'B'},country:'KR'};
 const incomplete=A.normalizePlan({itineraries:[{legs:[{mode:'SUBWAY',displayName:'M',headsign:'Toward B',from:{name:'A'},to:{name:'B'}}]}]},base);
 assert.equal(incomplete[0].legs[0].sequenceComplete,false);
 assert.equal(incomplete[0].legs[0].stationCount,null);
 const adjacent=A.normalizePlan({itineraries:[{legs:[{mode:'SUBWAY',displayName:'M',headsign:'Toward B',from:{name:'A'},intermediateStops:[],to:{name:'B'}}]}]},base);
 assert.equal(adjacent[0].legs[0].sequenceComplete,true);
 assert.equal(adjacent[0].legs[0].stationCount,1);
 const missingDirection=A.normalizePlan({itineraries:[{legs:[{mode:'SUBWAY',displayName:'M',from:{name:'A'},intermediateStops:[],to:{name:'B'}}]}]},base);
 assert.equal(missingDirection[0].legs[0].directionVerified,false);
});
test('resolved station IDs are passed to trip planning instead of coordinate guesses',async()=>{
 const {fetcher,requests}=fakeProvider('KR'),A=init(fetcher);
 await A.plan('Origin','Destination',cities.KR,{fetcher});
 const u=new URL(requests.find(x=>x.includes('/plan')));
 assert.equal(u.searchParams.get('fromPlace'),'aKR');
 assert.equal(u.searchParams.get('toPlace'),'bKR');
});
