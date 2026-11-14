/* VOYAGE V3 independently constructed Seoul sample subway graph.
   Verified station sequence from Seoul Metro line maps (see source references).
   This is a PARTIAL reference network, not official realtime routing. */
(function(){
"use strict";
const nodes={
seoul:["首爾站","서울역","Seoul Station",37.5546,126.9724,["首爾","seoul"]],
hoehyeon:["會賢","회현","Hoehyeon",37.5585,126.9781],
myeongdong:["明洞","명동","Myeongdong",37.5609,126.9865],
chungmuro:["忠武路","충무로","Chungmuro",37.5613,126.9941],
ddp:["東大門歷史文化公園","동대문역사문화공원","Dongdaemun History Culture Park",37.5658,127.0093,["東大門歷史文化公園站","ddp"]],
dongdaemun:["東大門","동대문","Dongdaemun",37.5713,127.0095],
euljiro4:["乙支路4街","을지로4가","Euljiro 4-ga",37.5669,126.9982],
euljiro3:["乙支路3街","을지로3가","Euljiro 3-ga",37.5663,126.9917],
euljiro1:["乙支路入口","을지로입구","Euljiro 1-ga",37.5660,126.9820],
cityhall:["市廳","시청","City Hall",37.5657,126.9771],
chungjeongno:["忠正路","충정로","Chungjeongno",37.5596,126.9636],
ahyeon:["阿峴","아현","Ahyeon",37.5573,126.9560],
ewha:["梨大","이대","Ewha Womans Univ.",37.5568,126.9459,["梨花女子大學"]],
sinchon:["新村","신촌","Sinchon",37.5552,126.9369],
hongdae:["弘大入口","홍대입구","Hongik Univ.",37.5572,126.9254,["弘大","hongdae","hongik"]],
gongdeok:["孔德","공덕","Gongdeok",37.5440,126.9513],
sindang:["新堂","신당","Sindang",37.5659,127.0195],
sangwangsimni:["上往十里","상왕십리","Sangwangsimni",37.5644,127.0291],
wangsimni:["往十里","왕십리","Wangsimni",37.5613,127.0374],
hanyang:["漢陽大","한양대","Hanyang Univ.",37.5558,127.0435],
ttukseom:["纛島","뚝섬","Ttukseom",37.5472,127.0474,["聖水前一站"]],
seongsu:["聖水","성수","Seongsu",37.5446,127.0559,["聖水站","seongsu"]]
};
const lines={
"地鐵 4 號線":["seoul","hoehyeon","myeongdong","chungmuro","ddp","dongdaemun"],
"地鐵 2 號線":["hongdae","sinchon","ewha","ahyeon","chungjeongno","cityhall","euljiro1","euljiro3","euljiro4","ddp","sindang","sangwangsimni","wangsimni","hanyang","ttukseom","seongsu"],
"AREX 機場鐵道普通列車":["seoul","gongdeok","hongdae"]
};
const alias=x=>String(x||"").trim().toLowerCase().replace(/\s/g,"").replace(/(?:역|站|station)$/i,"").replace(/[\u00b7.]/g,"");
function key(text){const raw=alias(text);if(!raw)return null;for(const [id,n] of Object.entries(nodes)){if([n[0],n[1],n[2],...(n[5]||[])].some(a=>alias(a)===raw))return id}return null}
function station(id){const n=nodes[id];return{zh:n[0],local:n[1],en:n[2],lat:n[3],lon:n[4]}}
const edges=new Map(),all=[];
const addEdge=(a,b,cost,transfer=false)=>{if(!edges.has(a))edges.set(a,[]);edges.get(a).push({to:b,cost,transfer})};
for(const [line,stops] of Object.entries(lines)){for(const id of stops)all.push(line+"|"+id);for(let i=1;i<stops.length;i++){const from=line+"|"+stops[i-1],to=line+"|"+stops[i],cost=line.includes("AREX")?4:2;addEdge(from,to,cost);addEdge(to,from,cost)}}
const byStation={};for(const code of all){const id=code.split("|")[1];(byStation[id]??=[]).push(code)}
for(const list of Object.values(byStation))for(let i=0;i<list.length;i++)for(let j=0;j<list.length;j++)if(i!==j)addEdge(list[i],list[j],5,true);
function route(from,to){const a=key(from),b=key(to);if(!a||!b||a===b)return null;
const distances=new Map(),previous=new Map(),queue=[];
for(const start of byStation[a]||[]){distances.set(start,0);queue.push(start)}
let goal=null;
while(queue.length){queue.sort((x,y)=>(distances.get(x)??Infinity)-(distances.get(y)??Infinity));const u=queue.shift(),uid=u.split("|")[1];if(uid===b){goal=u;break}
for(const e of edges.get(u)||[]){const alt=(distances.get(u)??Infinity)+e.cost;if(alt<(distances.get(e.to)??Infinity)){distances.set(e.to,alt);previous.set(e.to,u);if(!queue.includes(e.to))queue.push(e.to)}}}
if(!goal)return null;
const path=[];for(let u=goal;u;u=previous.get(u))path.unshift(u);
const legs=[];let track=null;
for(const code of path){const [line,id]=code.split("|");if(!track||track.line!==line){track={line,mode:line.includes("AREX")?"SUBURBAN":"SUBWAY",headsign:"",stations:[station(id)]};legs.push(track)}else if(track.stations.at(-1).zh!==station(id).zh)track.stations.push(station(id));}
for(let i=0;i<legs.length;i++){const l=legs[i],next=l.stations[1];if(next)l.headsign="搭往「"+next.zh+"」方向的月台；請以當日列車終點顯示核對";else l.headsign="此站轉乘 "+(legs[i+1]?.line||"")}
const estimated=Math.ceil(distances.get(goal)||0), transfers=Math.max(0,legs.length-1);
return{kind:"seoul-partial",minutes:estimated,transfers,legs,source:"https://metro.nuua.travel/en/seoul/station/156/line/2",label:"首爾部分站網參考 · 約 "+estimated+" 分含轉乘步行估算、不含等車（非即時班次），範圍僅涵蓋已整理的 2／4 號線部分區間和 AREX 普通列車。完整路線以當日 NAVER／Google 地圖及月台公告為準。"}}
window.VoyageSeoulNetwork={key,route,stations:nodes,lines};
})();
