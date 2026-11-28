/* VOYAGE travel ideas v2: food-list style page; add/edit dialog only on user action.
   Per-trip storage remains ideaPlaces in canonical voyage-v02; original links preserved. */
(()=>{'use strict';
const U=window.VoyageUI,home=document.getElementById('v2Home');
if(!U||!home)return;
const {E,button,field,get,openDialog,D,pages}=U;
const style=document.createElement('style');style.id='voyage-ideas-style-v2';
style.textContent=[
'#v1Content .ideas-page{display:grid;gap:12px}',
'#v1Content .ideas-header{display:flex;align-items:center;gap:13px;margin-bottom:4px}',
'#v1Content .ideas-illustration{font-size:34px;background:linear-gradient(145deg,#ede0ff,#fff1f4);width:64px;height:64px;border-radius:18px;display:grid;place-items:center}',
'#v1Content .ideas-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:12px}',
'#v1Content .ideas-card{min-width:0;padding:16px;border:1px solid #dce5f7;border-radius:18px;background:var(--card);box-shadow:0 3px 14px #182b4720}',
'#v1Content .ideas-card strong{display:block;font-size:17px;overflow-wrap:anywhere}',
'#v1Content .ideas-note{color:var(--muted);font-size:13px;white-space:pre-wrap;margin:7px 0 4px;overflow-wrap:anywhere}',
'#v1Content .ideas-source{display:block;margin:9px 0;color:#3266c7;font-size:13px;overflow-wrap:anywhere}',
'#v1Content .ideas-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}',
'#v1Content .ideas-actions button{white-space:normal;padding:9px 12px;border-radius:12px}',
'#v1Content .ideas-empty{border:1px dashed #bdcde9;background:var(--card);padding:24px;border-radius:18px;color:var(--muted)}',
'#v1Content .ideas-status{display:inline-block;background:#eaf4ed;color:#28633b;border-radius:999px;padding:4px 9px;font-size:12px;margin-top:8px}',
'@media(max-width:620px){#v1Content .ideas-grid{grid-template-columns:1fr}#v1Content .ideas-card{padding:14px}}'
].join('\n');
document.head.append(style);
const safeUrl=v=>{try{const u=new URL(String(v||''));return u.protocol==='https:'&&u.hostname?u.href:''}catch{return''}};
const current=()=>U.current?.();
const list=()=>{const t=current();if(!t)return [];if(!Array.isArray(t.ideaPlaces))t.ideaPlaces=[];return t.ideaPlaces};
function sourceName(url){
 try{const h=new URL(url).hostname.toLowerCase();if(h.includes('threads.'))return 'Threads';if(h.includes('instagram.com'))return 'Instagram';if(h==='maps.app.goo.gl'||h.includes('google.'))return 'Google Maps';return new URL(url).hostname}catch{return '原始連結'}
}
function openNew(existing=null){
 const editing=!!existing;
 openDialog(editing?'編輯行程名單':'＋ 新增想去的地點',[
 field('vIdeaName','景點／店家／活動名稱','text',existing?.name||'',{full:true}),
 field('vIdeaUrl','Google Maps／IG／Threads 網址（可選填）','url',existing?.url||'',{full:true}),
 field('vIdeaNotes','備註','textarea',existing?.notes||'',{full:true})
 ],()=>{
  const name=get('vIdeaName'),raw=get('vIdeaUrl'),url=raw?safeUrl(raw):'';
  if(!name)throw Error('請輸入名稱');
  if(raw&&!url)throw Error('請輸入完整的 HTTPS 網址');
  if(editing){existing.name=name;existing.url=url;existing.notes=get('vIdeaNotes')}
  else list().push({id:D.uid(),name,url,notes:get('vIdeaNotes'),createdAt:new Date().toISOString()});
  return true;
 });
}
function arrange(item){
 const t=current();if(!t||!t.days?.length){U.toast('這趟旅行沒有可安排的日期');return}
 openDialog('📅 將「'+item.name+'」排入每日行程',[
 field('vIdeaDay','選擇安排日期','select','0',{options:t.days.map((_,i)=>[String(i),'第 '+(i+1)+' 天'+(t.startDate?' · '+D.dayISO(t.startDate,i):'')])}),
 field('vIdeaTime','預定時間','time','10:00'),
 field('vIdeaDuration','停留時間（分鐘）','number','60',{min:0,step:5}),
 field('vIdeaMemo','行程備註','textarea',item.notes||'',{full:true})
 ],()=>{
  const index=Number(get('vIdeaDay')),time=get('vIdeaTime'),duration=Number(get('vIdeaDuration'));
  if(!Number.isInteger(index)||index<0||index>=t.days.length)throw Error('請選擇正確的旅行日期');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('時間格式不正確');
  if(!Number.isFinite(duration)||duration<0)throw Error('停留分鐘數不正確');
  const event={id:D.uid(),name:item.name,type:'place',time,duration,notes:get('vIdeaMemo')};
  if(safeUrl(item.url)){event.mapUrl=item.url;event.url=item.url}
  t.days[index].push(event);
  item.scheduledCount=(Number(item.scheduledCount)||0)+1;
  item.lastScheduledDay=index;
  U.toast('已加入第 '+(index+1)+' 天行程；收藏仍會保留');
  return true;
 });
}
function renderIdeas(box){
 const t=current();if(!t){box.textContent='請先建立旅行';return}
 const root=E('section',{class:'ideas-page'});
 const head=E('div',{class:'ideas-header'},[
  E('span',{class:'ideas-illustration',text:'📋'}),
  E('div',{},[E('h3',{text:'行程名單 · '+(t.city||t.country||'目前旅行')}),E('p',{class:'v1-sub',text:'先瀏覽大家想去的地點，確定要去再安排到每日行程。'})])
 ]);
 root.append(head);
 root.append(E('div',{class:'v1-actions'},[button('＋ 新增地點／貼上網址',()=>openNew(),'primary')]));
 const grid=E('div',{class:'ideas-grid'});
 const collection=list();
 if(!collection.length)grid.append(E('div',{class:'ideas-empty',text:'目前沒有收藏。點「新增地點／貼上網址」後才會開啟輸入視窗。'}));
 for(const item of collection){
  const card=E('article',{class:'ideas-card'});
  card.append(E('strong',{text:item.name||'未命名地點'}));
  if(item.notes)card.append(E('p',{class:'ideas-note',text:item.notes}));
  const url=safeUrl(item.url);
  if(url)card.append(E('a',{class:'ideas-source',href:url,target:'_blank',rel:'noopener noreferrer',text:'🔗 開啟 '+sourceName(url)+' 原始連結'}));
  if(item.scheduledCount)card.append(E('span',{class:'ideas-status',text:'已安排到行程 '+item.scheduledCount+' 次'}));
  const actions=E('div',{class:'ideas-actions'});
  actions.append(button('📅 加入每日行程',()=>arrange(item),'primary'),button('編輯',()=>openNew(item)),button('刪除收藏',()=>{
   if(!confirm('確定刪除「'+item.name+'」的收藏嗎？已加入每日行程的活動不會刪除。'))return;
   const index=list().indexOf(item);if(index>=0)list().splice(index,1);
   U.save();U.renderMore();
  }));
  card.append(actions);grid.append(card);
 }
 root.append(grid);box.append(root);
}
pages.ideas=renderIdeas;
function placeEntry(){
 const grid=home.querySelector('.v2-quick-grid');if(!grid)return;
 const food=[...grid.querySelectorAll('.v2-link')].find(x=>x.textContent.includes('美食口袋名單'));
 if(!food)return;
 let buttonEntry=grid.querySelector('.voyage-ideas-entry');
 if(!buttonEntry){
  buttonEntry=document.createElement('button');buttonEntry.type='button';buttonEntry.className='v2-link voyage-ideas-entry';
  buttonEntry.append(E('span',{class:'v2-icon',text:'📋'}),E('span',{text:'行程名單'}),E('small',{text:'想去的地點與連結收藏'}));
 }
 food.after(buttonEntry);
 buttonEntry.onclick=()=>U.showPage('ideas');
}
let scheduled=false;
function refresh(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;placeEntry()})}
new MutationObserver(refresh).observe(home,{childList:true,subtree:false});
document.addEventListener('voyage-trip-changed',refresh);
refresh();
window.VoyageIdeas={show:()=>U.showPage('ideas'),read:list,arrange};
})();