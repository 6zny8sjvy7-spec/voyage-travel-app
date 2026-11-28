/* VOYAGE: trip-specific places-to-visit inbox; no modification to approved home cards. */
(()=>{'use strict';
const U=window.VoyageUI;if(!U||!document.getElementById('v2Home'))return;
const home=document.getElementById('v2Home');
const style=document.createElement('style');style.id='voyage-ideas-style-v1';
style.textContent=`
#voyageIdeasDialog{width:min(680px,94vw);max-height:85dvh;border:0;border-radius:22px;padding:0;background:#fff;color:#213557;box-shadow:0 20px 80px #14376355}
#voyageIdeasDialog::backdrop{background:#10294b8c}
#voyageIdeasDialog .ideas-body{padding:24px;display:grid;gap:12px;max-height:80dvh;overflow-y:auto}
#voyageIdeasDialog h2{margin:0;font-size:22px}
#voyageIdeasDialog label{display:grid;gap:5px;font-weight:700;font-size:14px}
#voyageIdeasDialog input,#voyageIdeasDialog textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #bfcde7;border-radius:12px;font:inherit;color:#213557;background:#fff}
#voyageIdeasDialog .ideas-actions{display:flex;flex-wrap:wrap;gap:8px}
#voyageIdeasDialog button{padding:9px 14px;border:1px solid #b9c9ee;border-radius:12px;cursor:pointer;background:#f2f6ff;color:#24477e;font:inherit}
#voyageIdeasDialog button.primary{background:#4473e0;color:#fff}
#voyageIdeasDialog .ideas-item{display:grid;gap:7px;padding:12px 14px;border-radius:16px;background:#f2f7ff;border:1px solid #dce6fa;overflow-wrap:anywhere}
#voyageIdeasDialog .ideas-item strong{font-size:16px}
#voyageIdeasDialog .ideas-item small{font-size:12px;color:#687b9a}
#voyageIdeasDialog .ideas-item a{color:#2559d9;text-decoration:underline;font-weight:700}
#v2Home .v2-link.voyage-ideas-entry .v2-icon{color:#7b5fd9}
`;
document.head.append(style);
const dialog=document.createElement('dialog');dialog.id='voyageIdeasDialog';
dialog.innerHTML=`<div class="ideas-body"><div class="ideas-actions" style="justify-content:space-between;align-items:center"><h2>📋 行程名單</h2><button type="button" data-action="close">關閉</button></div><p style="margin:0;color:#64728c">先收藏大家想去的景點、餐廳或活動，不會自動排入每日行程。</p><form id="voyageIdeasForm" style="display:grid;gap:10px"><label>想去的地點或活動名稱<input name="name" maxlength="140" required placeholder="例：洽圖洽週末市集"></label><label>網址（Google Maps／Instagram／Threads 或其他 HTTPS 網址）<input name="url" inputmode="url" type="url" placeholder="https://..." autocomplete="off"></label><label>備註（選填）<textarea name="notes" rows="2" maxlength="900" placeholder="朋友推薦、店家資訊、預算等"></textarea></label><div class="ideas-actions"><button class="primary" type="submit">＋ 加入行程名單</button></div></form><div id="voyageIdeasItems" aria-live="polite"></div></div>`;
document.body.append(dialog);
dialog.querySelector('[data-action="close"]').onclick=()=>dialog.close();
const form=dialog.querySelector('#voyageIdeasForm'),items=dialog.querySelector('#voyageIdeasItems');
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return''}};
function getTrip(){return U.current?.()}
function read(){const t=getTrip();if(!Array.isArray(t.ideaPlaces))t.ideaPlaces=[];return t.ideaPlaces}
function store(){U.save();document.dispatchEvent(new Event('voyage-trip-changed'))}
function show(){
 const t=getTrip();dialog.querySelector('h2').textContent='📋 行程名單 · '+String(t?.city||'');
 const collection=read();items.replaceChildren();
 if(!collection.length){const p=document.createElement('p');p.textContent='還沒有收藏的地點，先貼一筆網址試試。';items.append(p)}
 collection.forEach((x,i)=>{
  const item=document.createElement('div');item.className='ideas-item';
  const name=document.createElement('strong');name.textContent=x.name;item.append(name);
  if(x.notes){const small=document.createElement('small');small.textContent=x.notes;item.append(small)}
  const actions=document.createElement('div');actions.className='ideas-actions';
  if(safeUrl(x.url)){const link=document.createElement('a');link.textContent=/instagram\.com/i.test(x.url)?'開啟 Instagram':/threads\.(?:net|com)/i.test(x.url)?'開啟 Threads':/google\.|maps\.app\./i.test(x.url)?'開啟 Google Maps':'開啟原始連結';link.href=x.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link)}
  const del=document.createElement('button');del.type='button';del.textContent='刪除此筆';del.onclick=()=>{if(confirm('確定刪除「'+x.name+'」這筆收藏嗎？')){read().splice(i,1);store();show()}};
  actions.append(del);item.append(actions);items.append(item);
 });
}
form.addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(form);const name=String(data.get('name')||'').trim(),raw=String(data.get('url')||'').trim(),notes=String(data.get('notes')||'').trim();
 if(!name){alert('請填寫地點或活動名稱');return}
 const url=raw?safeUrl(raw):'';if(raw&&!url){alert('連結必須是完整的 https:// 網址');return}
 read().push({id:crypto.randomUUID?.()||('idea-'+Date.now()),name,url,notes,createdAt:new Date().toISOString()});
 store();form.reset();show();
});
function placeEntry(){
 const grid=home.querySelector('.v2-quick-grid');if(!grid||grid.querySelector('.voyage-ideas-entry'))return;
 const food=[...grid.querySelectorAll('.v2-link')].find(x=>x.textContent.includes('美食口袋名單'));
 if(!food)return;
 const b=document.createElement('button');b.type='button';b.className='v2-link voyage-ideas-entry';
 const ico=document.createElement('span');ico.className='v2-icon';ico.textContent='📋';
 const name=document.createElement('span');name.textContent='行程名單';
 const sub=document.createElement('small');sub.textContent='想去的地點・貼上連結收藏';
 b.append(ico,name,sub);b.onclick=()=>{show();dialog.showModal()};
 food.after(b);
}
let pending=false;function refresh(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;placeEntry()})}
new MutationObserver(refresh).observe(home,{childList:true,subtree:false});
document.addEventListener('voyage-trip-changed',()=>{if(dialog.open)show();refresh()});
refresh();
window.VoyageIdeas={show,read};
})();
