/* VOYAGE: history separates countries, deliberate delete with local backup, KR-only NAVER.
   Uses existing trip storage; never auto-deletes or auto-archives any prior trip. */
(()=>{'use strict';
const U=window.VoyageUI;if(!U||typeof trips==='undefined')return;
const code=t=>window.VoyageRegionV4?.countryCode?.(t)||String(t?.countryCode||t?.country||'');
function activeCountryOnly(){
 const picker=document.getElementById('tripSelect'),current=typeof trip==='function'?trip():null;
 if(!picker||!current)return;
 const c=code(current);
 const entries=trips.map((item,i)=>({item,i})).filter(({item})=>code(item)===c&&!item.archived);
 if(!entries.some(e=>e.i===active))entries.push({item:current,i:active});
 const sig=entries.map(e=>e.i+':'+e.item.name).join('|')+':'+active;
 if(picker.dataset.countryFilteredSig===sig)return;
 picker.replaceChildren(...entries.map(({item,i})=>new Option(item.name+' · '+item.country,String(i))));
 picker.value=String(active);
 picker.dataset.countryFilteredSig=sig;
 const lab=picker.closest('.v7-trip-switch')?.querySelector('label');
 if(lab)lab.textContent='目前國家已建立行程（其他國家在歷史紀錄）';
}
const previousHistory=U.pages.history;
U.pages.history=function(box){
 previousHistory(box);
 const rows=[...box.querySelectorAll('.v1-item')];
 rows.forEach((row,i)=>{
  const t=trips[i];if(!t)return;
  // The existing "開啟" action did not persist active travel ID; add that without replacing it.
  const open=[...row.querySelectorAll('button')].find(b=>b.textContent.trim()==='開啟');
  if(open)open.addEventListener('click',()=>{
   try{localStorage.setItem('voyage-v02-active-id',String(t.id))}catch{}
   document.dispatchEvent(new Event('voyage-trip-changed'));
  });
  const del=document.createElement('button');del.type='button';del.textContent='🗑 刪除';
  del.style.cssText='color:#ab2d39;background:#fff0f1;border:1px solid #eeb8bc;border-radius:12px;padding:8px 10px';
  del.onclick=()=>{
   if(trips.length<2){alert('目前只剩這趟旅行。為避免網站無旅行資料，請先建立另一趟再刪除。');return}
   if(!confirm('確定永久刪除「'+t.name+'」的行程、景點、費用及收藏嗎？此動作無法在網頁中還原。'))return;
   const snapshot=JSON.stringify(trips);
   try{localStorage.setItem('voyage-backup-before-delete-'+Date.now(),snapshot)}catch(err){alert('無法備份原旅行資料，因此取消刪除。請檢查儲存空間。');return}
   const removedCurrent=i===active;
   trips.splice(i,1);
   if(removedCurrent)active=Math.min(i,trips.length-1);
   else if(i<active)active--;
   day=0;
   try{localStorage.setItem('voyage-v02-active-id',String(trip().id))}catch{}
   save();render();
   document.dispatchEvent(new Event('voyage-trip-changed'));
   U.showPage('history');
  };
  row.append(del);
 });
};
// Country-specific navigation: NAVER only for Korea. Google remains for Thai itineraries.
function updateNaverVisibility(){
 const korea=code(U.current?.())==='KR';
 const roots=['#week','#itinerary','#v3MapSummary','#v3Calendar','#v3InlineMap','#mapSection'];
 roots.forEach(sel=>{
  document.querySelectorAll(sel+' button,'+sel+' a').forEach(el=>{
   if(!/^NAVER\b|NAVER\s|Naver/i.test(el.textContent.trim()))return;
   const allowed=korea;
   if(el.hidden===allowed)el.hidden=!allowed;
   if(el.style.display!==(allowed?'':'none'))el.style.display=allowed?'':'none';
   el.setAttribute('aria-hidden',allowed?'false':'true');
  });
 });
 document.querySelectorAll('#v3NewMapLink,#newMapUrl').forEach(input=>{
  const desired=korea?'Google Maps／NAVER 分享連結（選填）':'Google Maps 分享連結（選填）';
  if(input.placeholder!==desired)input.placeholder=desired;
 });
}
const prevRender=render;
render=function(){prevRender();activeCountryOnly();updateNaverVisibility()};
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;activeCountryOnly();updateNaverVisibility()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
document.addEventListener('voyage-trip-changed',schedule);
schedule();
window.VoyageHistoryV1={activeCountryOnly,updateNaverVisibility};
})();
