/* VOYAGE official: per-trip linked place list, country-aware picker/history and KR-only NAVER.
   This code never deletes or bulk-modifies existing trip records. */
(()=>{'use strict';
const U=window.VoyageUI,R=window.VoyageRegionV4;
if(!U||!R||document.getElementById('voyage-places-country-style'))return;
const style=document.createElement('style');style.id='voyage-places-country-style';
style.textContent="\n#v2Home .v2-link.voyage-place-shortcut{position:relative;outline-offset:3px}\n#v2Home .voyage-new-flag{position:absolute;right:8px;top:4px;padding:2px 6px;border-radius:9px;color:#fff;background:#e1446c;font-size:10px;font-weight:900;line-height:1.4}\n.voyage-place-box{padding:13px;border:1px solid var(--line,#d5dded);border-radius:18px;background:var(--card,#fff);margin-bottom:12px}\n.voyage-place-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}\n.voyage-place-form label{display:flex;flex-direction:column;gap:4px;font-size:13px}\n.voyage-place-form input,.voyage-place-form select{width:100%;min-width:0;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid #c2cde0;background:var(--card,#fff);color:var(--ink,#222)}\n.voyage-place-wide{grid-column:1/-1}\n.voyage-place-row{display:flex;justify-content:space-between;gap:10px;align-items:center;border-bottom:1px solid #d9e1ef;padding:12px 2px;flex-wrap:wrap}\n.voyage-place-row:last-child{border-bottom:0}\n.voyage-place-name{font-weight:800;word-break:break-word}\n.voyage-place-link{display:inline-block;padding:9px 11px;text-decoration:none;background:#e8efff;color:#1b4c8a;border-radius:11px}\n.voyage-place-actions{display:flex;gap:7px;flex-wrap:wrap}\n.voyage-place-action{border:1px solid #a6b9d2;padding:8px 10px;border-radius:12px;background:#fff;color:#2e487b}\n.voyage-history-row{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:13px 3px;border-bottom:1px solid #d9e1eb}\n@media(max-width:650px){.voyage-place-form{grid-template-columns:1fr}.voyage-place-wide{grid-column:1}}\n";document.head.append(style);
const country=t=>R.countryCode(t)||String(t?.country||'').trim();
const make=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==null)n.textContent=txt;if(cls)n.className=cls;return n};
const button=(txt,fn)=>{const b=make('button',txt,'voyage-place-action');b.type='button';b.onclick=fn;return b};
const safeURL=v=>{try{const u=new URL(String(v||'').trim());if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return'';return u.href}catch{return''}};
const service=url=>{const host=new URL(url).hostname.toLowerCase();if(host==='instagram.com'||host.endsWith('.instagram.com'))return'Instagram';if(host==='threads.net'||host==='threads.com'||host.endsWith('.threads.com'))return'Threads';if(host.includes('google.')||host==='maps.app.goo.gl')return'Google Maps';if(host.endsWith('naver.com')||host==='naver.me')return'NAVER';return'外部網址'};
function places(){const t=U.current();if(!Array.isArray(t.savedPlaces))t.savedPlaces=[];return t.savedPlaces}
function renderPlaces(box){
 const t=U.current(),list=places();box.replaceChildren();
 box.append(make('h2','📌 行程名單｜想去的地方'),make('p','先收藏地點、餐廳、活動、商店與網址，不必決定行程日期。可直接開啟地圖、IG、Threads 等原始連結。'));
 const form=make('form',null,'voyage-place-box voyage-place-form');
 const field=(label,tag,attrs={})=>{const l=make('label',label),x=document.createElement(tag);Object.assign(x,attrs);l.append(x);form.append(l);return x};
 const name=field('地點／店家／活動名稱','input',{type:'text',placeholder:'例如：曼谷必逛市集',required:true,maxLength:140});
 const category=field('分類','select');for(const c of ['景點','美食','購物','活動','其他'])category.add(new Option(c,c));
 const link=field('連結網址（Google Maps／IG／Threads／其他網站）','input',{type:'url',placeholder:'https://...',required:true,maxLength:2200});link.parentElement.classList.add('voyage-place-wide');
 const memo=field('備註（選填）','input',{type:'text',placeholder:'例如：營業時間、必吃、朋友推薦',maxLength:280});memo.parentElement.classList.add('voyage-place-wide');
 const add=document.createElement('button');add.type='submit';add.textContent='＋ 加到行程名單';add.className='primary voyage-place-wide';form.append(add);
 form.onsubmit=e=>{e.preventDefault();const url=safeURL(link.value);if(!name.value.trim()||!url){alert('請輸入名稱與有效的 HTTPS 網址');return}
  const entries=places();entries.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:name.value.trim(),category:category.value,url,note:memo.value.trim(),created:new Date().toISOString()});
  U.save();renderPlaces(box);
 };
 box.append(form,make('p','已收藏 '+list.length+' 筆 · '+(t.name||'目前旅行')));
 for(const entry of list.slice().reverse()){
  const row=make('div',null,'voyage-place-row'),details=make('div'),actions=make('div',null,'voyage-place-actions');
  details.append(make('div',(entry.category||'景點')+' · '+entry.name,'voyage-place-name'));
  if(entry.note)details.append(make('small',entry.note));
  const url=safeURL(entry.url);
  if(url){const a=make('a','開啟 '+service(url)+' ↗','voyage-place-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);
   actions.append(button('複製網址',async()=>{try{await navigator.clipboard.writeText(url)}catch{prompt('複製網址',url)}}))}
  actions.append(button('刪除',()=>{if(!confirm('只移除這筆收藏，不影響每日行程，確定嗎？'))return;
    const i=places().findIndex(x=>x.id===entry.id);if(i>=0){places().splice(i,1);U.save();renderPlaces(box)} }));
  row.append(details,actions);box.append(row);
 }
 box.append(make('p','行程名單儲存在目前瀏覽器的旅行資料；分享外部網址不等於多人自動同步，建議定期匯出旅行備份。'));
}
U.pages.travelWishlist=renderPlaces;
function insertShortcut(){
 const grid=document.querySelector('#v2Home .v2-quick-grid');if(!grid||grid.querySelector('.voyage-place-shortcut'))return;
 const food=[...grid.querySelectorAll('.v2-link')].find(n=>n.textContent.includes('美食口袋名單'));if(!food)return;
 const b=document.createElement('button');b.type='button';b.className='v2-link voyage-place-shortcut';
 b.append(make('span','📌','v2-icon'),make('span','行程名單'),make('small','景點 · 連結收藏'),make('span','NEW','voyage-new-flag'));
 b.onclick=()=>U.showPage('travelWishlist');food.after(b);
}
function filterCountryPicker(){
 const picker=document.getElementById('tripSelect');if(!picker||typeof trips==='undefined')return;
 const t=trips[active];if(!t)return;const code=country(t);
 for(const o of [...picker.options]){const x=trips[Number(o.value)];if(x&&x.id!==t.id&&(country(x)!==code||x.archived))o.remove()}
 picker.value=String(active);picker.setAttribute('aria-label','目前國家的旅行；其他國家請從歷史紀錄開啟');
 const label=picker.closest('.v7-trip-switch')?.querySelector('label');if(label)label.textContent='目前國家旅行 · 切換行程（其他國家在歷史紀錄）';
}
U.pages.history=box=>{
 const current=U.current(),code=country(current);
 box.replaceChildren(make('h2','📚 旅行歷史紀錄'),make('p','切換國家後，上一個國家的旅行會在這裡；原有內容保留不刪除。'));
 const older=trips.map((t,i)=>({t,i})).filter(x=>x.i!==active&&(country(x.t)!==code||x.t.archived));
 if(!older.length){box.append(make('p','目前沒有其他國家的旅行紀錄。'));return}
 for(const {t,i} of older){
  const row=make('div',null,'voyage-history-row'),desc=make('div');
  desc.append(make('b',t.name||'未命名旅行'),make('div',[t.country,t.city,t.startDate||'日期未設定',t.days.length+' 天'].filter(Boolean).join(' · ')));
  row.append(desc,button('開啟這趟旅行',()=>{active=i;day=0;localStorage.setItem('voyage-v02-active-id',String(t.id));render();document.dispatchEvent(new Event('voyage-trip-changed'));setTab('trips')}));
  box.append(row);
 }
 box.append(button('備份全部旅行',()=>U.backup()));
};
function toggleNaver(){
 const isKorea=country(U.current())==='KR';
 for(const root of ['#week','#itinerary','#mapSection','#v3CalendarSection','#v3MapSummary']){
  for(const el of document.querySelectorAll(root+' button,'+root+' a')){
   if(/NAVER/i.test(el.textContent||'')){el.hidden=!isKorea;el.style.display=isKorea?'':'none'}
  }
 }
}
const previousRender=render;render=function(){previousRender();filterCountryPicker();toggleNaver();queueMicrotask(insertShortcut)};
const home=document.getElementById('v2Home');
if(home){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;insertShortcut()})}).observe(home,{childList:true,subtree:false})}
document.addEventListener('voyage-trip-changed',()=>{filterCountryPicker();toggleNaver();queueMicrotask(insertShortcut)});
filterCountryPicker();toggleNaver();insertShortcut();
window.VoyagePlacesV1={renderPlaces,filterCountryPicker,toggleNaver};
})();