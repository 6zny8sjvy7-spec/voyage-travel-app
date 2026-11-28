import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
const root='https://6zny8sjvy7-spec.github.io/voyage-travel-app/?qa=ff8eb921';
const suffix=Date.now().toString(36),owner='QA-A-'+suffix,friend='QA-B-'+suffix;
const th={id:'qa-th-'+suffix,name:'VOYAGE QA '+suffix,country:'泰國',city:'曼谷',countryCode:'TH',tz:'Asia/Bangkok',lat:13.7563,lon:100.5018,days:[[]],people:['我'],packing:[{id:'qa-p',name:'QA adapter',owner:'我',type:'shared',checkedBy:{}}],wishlist:[{id:'qa-w',name:'QA shopping',bought:false}],expenses:[],documents:[]};
const kr={id:'qa-kr-'+suffix,name:'QA independent local trip',country:'韓國',city:'首爾',days:[[]],lat:37.5665,lon:126.978};
let a,b;
try{
 a=await chromium.launch();b=await webkit.launch();
 const ca=await a.newContext(),cb=await b.newContext();
 for(const [ctx,trips,id] of [[ca,[kr,th],th.id],[cb,[kr],kr.id]])await ctx.addInitScript(({trips,id})=>{if(!sessionStorage.getItem('qa-seed')){localStorage.setItem('voyage-v02',JSON.stringify(trips));localStorage.setItem('voyage-v02-active-id',id);sessionStorage.setItem('qa-seed','1')}},{trips,id});
 const pa=await ca.newPage(),pb=await cb.newPage();
 for(const p of [pa,pb]){p.on('dialog',d=>d.accept());}
 await pa.goto(root,{waitUntil:'domcontentloaded',timeout:85000});await pa.waitForFunction(()=>window.VoyageUI&&typeof window.VoyageUI.showPage==='function');
 await pa.evaluate(()=>window.VoyageUI.showPage('collab'));
 await pa.locator('#voyageFriendsName').fill(owner);
 await pa.getByRole('button',{name:'產生朋友邀請連結'}).click();
 try{await pa.locator('#voyageFriendsLink').waitFor({timeout:25000})}catch{throw Error('Owner invite did not succeed: '+await pa.locator('#voyageFriendsStatus').innerText())}
 const url=await pa.locator('#voyageFriendsLink').inputValue();
 await pb.goto(url,{waitUntil:'domcontentloaded',timeout:85000});
 await pb.locator('#voyageFriendsName').fill(friend);
 await pb.getByRole('button',{name:'加入旅行',exact:true}).click();
 const waitTrip=async(p,expected)=>p.waitForFunction(name=>{const t=JSON.parse(localStorage.getItem('voyage-v02')||'[]');return t.some(x=>x.cloudId&&x.people?.includes(name))},expected,{timeout:35000});
 await waitTrip(pb,friend);await waitTrip(pa,friend);
 await pa.locator('#voyageActivityBell').waitFor({timeout:30000});await pa.locator('#voyageActivityBell .va-count').waitFor({timeout:30000});await pa.locator('#voyageActivityBell').click();await pa.locator('#voyageActivityPanel').getByText(friend+' 加入了旅行',{exact:true}).waitFor({timeout:30000});await pa.locator('#voyageActivityPanel').getByText('關閉',{exact:true}).click();
 await pa.evaluate(()=>window.VoyageUI.showPage('wishlist'));
 await pa.locator('#v1Content .v1-item').filter({hasText:'QA shopping'}).locator('input[type=checkbox]').check();
 await pb.waitForFunction(n=>JSON.parse(localStorage.getItem('voyage-v02')).some(t=>t.cloudId&&t.wishlist?.some(x=>x.bought&&x.boughtBy===n)),owner,{timeout:35000});
 await pb.evaluate(()=>window.VoyageUI.showPage('packing'));
 await pb.locator('#v1Content > .v1-item').filter({hasText:'QA adapter'}).locator('.v1-check').check();
 await pa.waitForFunction(n=>JSON.parse(localStorage.getItem('voyage-v02')).some(t=>t.cloudId&&t.packing?.some(x=>x.checkedBy?.[n])),friend,{timeout:35000});
 await pb.evaluate(()=>{trip().days[0].push({id:'qa-event',name:'QA shared itinerary',time:'13:00'});save();render()});
 await pa.waitForFunction(()=>JSON.parse(localStorage.getItem('voyage-v02')).some(t=>t.cloudId&&t.days?.[0].some(x=>x.name==='QA shared itinerary')),null,{timeout:35000});
 await pa.locator('#voyageActivityBell').click();await pa.locator('#voyageActivityPanel').getByText(friend+' 新增了每日行程（1 項）',{exact:true}).waitFor({timeout:30000});await pa.locator('#voyageActivityPanel').getByText('關閉',{exact:true}).click();
 await pa.reload({waitUntil:'domcontentloaded'});await pa.waitForFunction(()=>JSON.parse(localStorage.getItem('voyage-v02')).some(t=>t.cloudId&&t.days?.[0].some(x=>x.name==='QA shared itinerary')));
 for(const p of [pa,pb])assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('voyage-v02')).some(t=>t.name==='QA independent local trip')));
 console.log('PASS: formal website two-browser join/add notifications, unread count, history and shared data');
}finally{await a?.close();await b?.close();}
