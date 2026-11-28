/* VOYAGE: nickname-based shared trips, no email, no paid API. */
(function(){
"use strict";
const U=window.VoyageUI;if(!U)return;
const {E,button,pages,current,toast,D}=U;
const URL_BASE="https://jebxjyxpuxgnmowndhqb.supabase.co",KEY="sb_publishable_u9TGFHu8-OG1UUL9TYAwFA_j9LgB8vZ";
const AUTH="voyage-friends-auth-1",STATE="voyage-friends-state-1";
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
let auth=read(AUTH,null),state=read(STATE,{}),running=false,status="尚未連線",lastLink="",lastLinkTrip="",conflict=null,lastDiscovery=0;
const keep=()=>localStorage.setItem(STATE,JSON.stringify(state));
const copy=o=>JSON.parse(JSON.stringify(o));
const ordered=o=>Array.isArray(o)?o.map(ordered):o&&typeof o==="object"?Object.fromEntries(Object.keys(o).sort().map(k=>[k,ordered(o[k])])):o;
const eq=(a,b)=>JSON.stringify(ordered(a))===JSON.stringify(ordered(b));
const member=()=>auth?.user?.user_metadata?.nickname||auth?.nickname||"";
const validName=s=>typeof s==="string"&&s.trim().length>0&&s.trim().length<=30;
function payload(t){const x=copy(t);if(t.friendsOriginalId)x.id=t.friendsOriginalId;delete x.friendsOriginalId;delete x.cloudId;delete x.cloudVersion;delete x.cloudSnapshot;delete x.packingCollapsed;return x}
function persistAuth(data){if(!data?.access_token||!data?.refresh_token||!data?.user?.id)throw Error("無法建立暱稱登入");auth={...data,nickname:data.user.user_metadata?.nickname||auth?.nickname,expires_at:data.expires_at||Math.floor(Date.now()/1000)+(data.expires_in||3600)};localStorage.setItem(AUTH,JSON.stringify(auth));return auth}
async function request(path,body,token,method="POST"){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(URL_BASE+path,{method,headers:{apikey:KEY,"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(path.includes("/rest/v1/")&&method==="POST"&&!path.includes("/rpc/")?{Prefer:"return=representation"}:{})},...(method==="GET"?{}:{body:JSON.stringify(body)}),signal:controller.signal,cache:"no-store"});const txt=await r.text();let data;try{data=txt?JSON.parse(txt):null}catch{data=txt}if(!r.ok)throw Error(data?.message||data?.msg||data?.error_description||data?.error||"HTTP "+r.status);return data}finally{clearTimeout(timeout)}}
async function token(){if(!auth)throw Error("請先輸入暱稱");if(auth.expires_at>Date.now()/1000+90)return auth.access_token;return persistAuth(await request("/auth/v1/token?grant_type=refresh_token",{refresh_token:auth.refresh_token})).access_token}
async function login(nickname){if(auth)return token();if(!validName(nickname))throw Error("請輸入 1～30 字的暱稱");return persistAuth(await request("/auth/v1/signup",{data:{nickname:nickname.trim()}})).access_token}
async function rpc(name,args){return request("/rest/v1/rpc/"+name,args,await token())}
async function getRow(id){const rows=await request("/rest/v1/voyage_trips?id=eq."+encodeURIComponent(id)+"&select=id,owner,version,payload",null,await token(),"GET");if(!rows?.length)throw Error("無法讀取這趟旅行，請確認邀請有效");return rows[0]}
function bind(t,row){t.cloudId=row.id;t.cloudVersion=Number(row.version);t.friendsOriginalId=row.payload.id;state[row.id]={base:copy(row.payload),version:Number(row.version)};keep();save()}
function redraw(){try{render();U.renderMore();document.dispatchEvent(new Event("voyage-trip-changed"))}catch(e){console.warn("VOYAGE refresh",e)}}
function replace(t,row,p= row.payload){const localId=t.id,collapsed=t.packingCollapsed;Object.keys(t).forEach(k=>delete t[k]);Object.assign(t,copy(p),{id:localId,packingCollapsed:collapsed,cloudId:row.id,cloudVersion:Number(row.version),friendsOriginalId:row.payload.id});if(t===current())day=Math.max(0,Math.min(day,t.days.length-1));bind(t,row);if(t===current())redraw()}
function merge(base,local,remote,path=""){if(eq(local,remote))return local;if(eq(base,local))return remote;if(eq(base,remote))return local;
 if(Array.isArray(base)&&Array.isArray(local)&&Array.isArray(remote)){
  const identified=a=>a.every(x=>x&&typeof x==="object"&&typeof x.id==="string")&&new Set(a.map(x=>x.id)).size===a.length;
  if(identified(base)&&identified(local)&&identified(remote)){const ids=[...new Set([...local,...remote,...base].map(x=>x.id))];return ids.map(id=>merge(base.find(x=>x.id===id),local.find(x=>x.id===id),remote.find(x=>x.id===id),path+"/"+id)).filter(x=>x!==undefined)}
  if(base.length===local.length&&base.length===remote.length&&base.every(Array.isArray)&&local.every(Array.isArray)&&remote.every(Array.isArray))return base.map((x,i)=>merge(x,local[i],remote[i],path+"/"+i));
  if(path==="/people"&&base.every(x=>local.includes(x)&&remote.includes(x)))return [...new Set([...local,...remote])];
 }
 const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
 if(obj(base)&&obj(local)&&obj(remote)){const result=Object.create(null);for(const k of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){const v=merge(base[k],local[k],remote[k],path+"/"+k);if(v!==undefined)result[k]=v}return result}
 throw Error("同一欄位被同時修改："+(path||"旅行"));
}
function personName(t){return state[t.cloudId]?.name||member()}
function withName(t){const name=personName(t);if(name&&!t.people.includes(name))t.people.push(name)}
function uiStatus(s){status=s;const el=document.getElementById("voyageFriendsStatus");if(el)el.textContent=s}
async function syncOne(t){if(!t?.cloudId||!state[t.cloudId]||conflict?.id===t.cloudId)return;try{
 const st=state[t.cloudId],row=await getRow(t.cloudId),local=payload(t);const changed=!eq(st.base,local);
 if(!changed){if(Number(row.version)!==st.version)replace(t,row);uiStatus("已同步");return}
 let result=local;
 if(Number(row.version)!==st.version){try{result=merge(st.base,local,row.payload)}catch(e){conflict={id:t.cloudId,local,remote:row};localStorage.setItem("voyage-friends-conflict-"+t.cloudId,JSON.stringify(conflict));uiStatus(e.message+"。本機修改已保留，請到朋友共編處理。");toast(status);return}}
 const version=await rpc("voyage_save",{p_trip_id:row.id,p_expected_version:Number(row.version),p_payload:result});
 const updated={...row,version,payload:result};
 if(eq(payload(t),local)){if(!eq(local,result))replace(t,updated,result);else bind(t,updated)}else{state[t.cloudId]={...st,base:copy(result),version:Number(version)};keep();t.cloudVersion=Number(version);save()}
 uiStatus("已同步");
 }catch(e){uiStatus("同步暫停："+e.message+"；本機資料保留，將自動重試。")}}
async function discover(){const rows=await request("/rest/v1/voyage_trips?select=id,owner,version,payload",null,await token(),"GET");let added=0;for(const row of rows){if(trips.some(t=>t.cloudId===row.id))continue;const p=row.payload;if(!p||!Array.isArray(p.days)||!p.days.length)continue;const t=copy(p);if(trips.some(x=>x.id===t.id))t.id=D.uid();trips.push(t);bind(t,row);added++}if(added){save();redraw()}lastDiscovery=Date.now();return added}
async function sync(force=false){if(!auth||running||uiBusy||document.hidden)return;if(!force&&(document.querySelector("dialog[open]")||/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||"")&&!["checkbox","radio"].includes(document.activeElement?.type)))return;running=true;try{if(force||Date.now()-lastDiscovery>30000)await discover();for(const t of [...trips])if(t.cloudId&&state[t.cloudId])await syncOne(t)}catch(e){uiStatus("雲端讀取暫停："+e.message+"；本機資料保留。")}finally{running=false}}

async function createShare(name){const t=current();if(!t.cloudId&&!confirm("分享「"+t.name+"」整趟旅行內容（包含行程、清單、費用、訂房與備註）給收到邀請連結的朋友？"))return;
 await login(name);
 if(t.cloudId&&!state[t.cloudId])throw Error("此旅行使用舊共編設定，請先備份，不會覆蓋舊資料");
 if(!t.cloudId){withName(t);const rows=await request("/rest/v1/voyage_trips",{owner:auth.user.id,payload:payload(t)},await token());const row=rows[0];bind(t,row);state[row.id].name=member();keep()}
 const invitation=await rpc("voyage_create_invite",{p_trip_id:t.cloudId,p_role:"editor"});
 const link=new URL(location.origin+location.pathname);link.hash="invite="+encodeURIComponent(invitation);lastLink=link.toString();lastLinkTrip=t.cloudId;
 uiStatus("邀請連結已建立，7 天內可供多位朋友加入");
}
let invite=new URLSearchParams(location.hash.slice(1)).get("invite")||sessionStorage.getItem("voyage-friends-invite")||"";
if(invite&&/^[a-f0-9]{64}$/.test(invite))sessionStorage.setItem("voyage-friends-invite",invite);else invite="";
async function join(name){await login(name);const id=await rpc("voyage_accept_invite",{p_token:invite});const row=await getRow(id);
 let t=trips.find(x=>x.cloudId===id);
 if(!t){t=copy(row.payload);if(trips.some(x=>x.id===t.id))t.id=D.uid();t.friendsOriginalId=row.payload.id;trips.push(t)}
 bind(t,row);const actual=member();state[id].name=actual;keep();active=trips.indexOf(t);day=0;localStorage.setItem("voyage-v02-active-id",String(t.id));withName(t);save();invite="";sessionStorage.removeItem("voyage-friends-invite");history.replaceState(null,"",location.pathname+location.search);redraw();uiStatus("已加入旅行，正在同步");}
let uiBusy=false;
async function action(fn){if(uiBusy||running)return;uiBusy=true;try{await fn()}catch(e){uiStatus("未完成："+e.message);toast(status)}finally{uiBusy=false;U.renderMore();sync()}}
pages.collab=box=>{
 const t=current();box.append(E("h3",{text:invite?"✈️ 加入朋友的旅行":"👥 朋友共編"}),E("p",{class:"v1-sub",text:invite?"請輸入你自己的暱稱即可加入，所有旅伴都可以編輯。":"先設定你自己的暱稱，再分享目前旅行。朋友收到連結後會自行取名，不需要你替他們設定。"}));
 const input=E("input",{id:"voyageFriendsName",type:"text",maxlength:"30",placeholder:"輸入你自己的暱稱",value:member()});if(auth)input.disabled=true;
 box.append(E("label",{},[E("span",{text:"我的暱稱"}),input]),E("div",{id:"voyageFriendsStatus",class:"v1-notice",text:status}));
 if(!invite&&!auth)box.append(button("儲存我的暱稱",()=>action(async()=>{await login(input.value);uiStatus("我的暱稱已設定："+member())}),"secondary"));
 if(!invite&&auth)box.append(E("p",{class:"v1-sub",text:"我的暱稱："+member()+"；朋友加入後會顯示各自的暱稱。"}),button("同步所有共編旅行",async()=>{await sync(true);U.renderMore()},"secondary"));
 box.append(button(invite?"加入旅行":"產生朋友邀請連結",()=>action(()=>invite?join(input.value):createShare(input.value)),"primary"));
 if(lastLink&&!invite&&t.cloudId&&lastLinkTrip===t.cloudId){const link=E("input",{id:"voyageFriendsLink",readonly:"readonly",value:lastLink});box.append(link,button("複製邀請連結",async()=>{try{await navigator.clipboard.writeText(lastLink);toast("邀請連結已複製")}catch{link.select();toast("請長按複製連結")}},"primary"))}
 if(t.cloudId&&state[t.cloudId])box.append(E("p",{class:"v1-sub",text:"目前旅伴："+(t.people||[]).join("、")+"；旅行修改會自動同步。請勿清除瀏覽器資料，否則需重新接受邀請。"}));
 if(conflict&&t.cloudId&&conflict.id===t.cloudId)box.append(E("p",{class:"v1-warning",text:"同一欄位同時被修改；本機修改已保留。請先備份，再選擇載入雲端版本。"}),button("保留本機備份並載入雲端",()=>action(async()=>{if(!confirm("本機修改會備份保存，確定載入雲端版本？"))return;replace(t,await getRow(t.cloudId));conflict=null;uiStatus("已讀取雲端版本")})));
};
const wishlist=pages.wishlist;if(wishlist)pages.wishlist=box=>{wishlist(box);const t=current();if(!t.cloudId||!state[t.cloudId]||!member())return;const rows=[...box.children].filter(r=>r.classList.contains("v1-item"));rows.forEach((r,i)=>{const x=t.wishlist[i],check=r.querySelector(".v1-check"),main=r.querySelector(".v1-item-main");if(!x||!check||!main)return;main.append(E("div",{class:"v1-sub",text:x.bought?"已購買："+(x.boughtBy||"未記錄"):"尚未購買"}));check.onchange=()=>{x.bought=check.checked;if(x.bought)x.boughtBy=personName(t);else delete x.boughtBy;save();U.renderMore();sync()}})};
const packing=pages.packing;if(packing)pages.packing=box=>{packing(box);const t=current();if(!t.cloudId||!state[t.cloudId]||!member())return;const who=personName(t);const selector=box.querySelector("#vPackPerson");if(selector){selector.value=who;selector.disabled=true}const rows=[...box.children].filter(r=>r.classList.contains("v1-item"));rows.forEach((r,i)=>{const x=t.packing[i],check=r.querySelector(".v1-check"),main=r.querySelector(".v1-item-main");if(!x||!check||!main)return;x.checkedBy=x.checkedBy||{};check.checked=!!x.checkedBy[who];main.append(E("div",{class:"v1-sub",text:"已打包："+(Object.keys(x.checkedBy).filter(k=>x.checkedBy[k]).join("、")||"尚未打包")}));check.onchange=()=>{x.checkedBy[who]=check.checked;save();U.renderMore();sync()}})};
setInterval(()=>{if(!uiBusy)sync()},5000);if(auth&&!invite)setTimeout(()=>sync(true),800);document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!uiBusy)sync()});if(invite)setTimeout(()=>U.showPage("collab"),700);U.renderMore();
})();