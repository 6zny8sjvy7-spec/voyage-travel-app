/* VOYAGE formal-root map source continuity.
   A Google Maps short link is a valid saved source, NOT a verified coordinate.
   Expose the source in the actual map panel without guessing a Leaflet pin. */
(()=>{'use strict';
const U=window.VoyageUI,section=document.getElementById('mapSection'),note=document.getElementById('mapNote');
if(!U||!section||!note)return;
const root=document.createElement('section');
root.id='voyageSavedMapLinks';root.setAttribute('aria-label','已儲存的地圖連結');
note.after(root);
const style=document.createElement('style');
style.textContent=`
#voyageSavedMapLinks{display:grid;gap:9px;margin:13px 0;padding:14px;border-radius:15px;background:var(--card);border:1px solid var(--line)}
#voyageSavedMapLinks[hidden]{display:none!important}
#voyageSavedMapLinks h3{font-size:15px;margin:0}
#voyageSavedMapLinks .map-source-note{font-size:12px;color:var(--muted);margin:0}
#voyageSavedMapLinks .saved-map-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 0;border-top:1px solid var(--line)}
#voyageSavedMapLinks .saved-map-row strong{flex:1;min-width:125px;overflow-wrap:anywhere}
#voyageSavedMapLinks .v1-map-source-link{font-weight:750;font-size:13px;max-width:100%;overflow-wrap:anywhere;text-decoration:none;color:#2362ae;background:var(--soft);border:1px solid #bad1ea;padding:8px 11px;border-radius:11px}
`;
document.head.append(style);
function linkOf(value){
 try{const url=new URL(String(value||'').trim());if(url.protocol==='https:'&&url.hostname)return url.href}catch{}
 return '';
}
const add=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el};
function refresh(){
 const t=U.current?.(),index=Number(document.querySelector('#dates .date.active')?.dataset.day||0);
 const events=Array.isArray(t?.days?.[index])?t.days[index]:[];
 const saved=events.filter(event=>event?.type!=='transport'&&linkOf(event?.mapUrl||event?.url));
 root.replaceChildren();root.hidden=!saved.length;
 if(!saved.length)return;
 root.append(add('h3','📍 第 '+(index+1)+' 天已保存的地圖連結'));
 root.append(add('p','已從行程帶入原始網址。短網址不一定包含座標，需使用行程的「定位」功能核對後才會出現地圖圖釘。','map-source-note'));
 for(const event of saved){
  const url=linkOf(event.mapUrl||event.url);
  const row=add('div',undefined,'saved-map-row');
  row.append(add('strong',event.name||'未命名地點'));
  const anchor=add('a','🔗 開啟已保存地圖／來源','v1-map-source-link');
  anchor.href=url;anchor.target='_blank';anchor.rel='noopener noreferrer';
  row.append(anchor);root.append(row);
 }
}
const previousRender=render;
render=function(){previousRender();refresh()};
document.addEventListener('voyage-trip-changed',refresh);
refresh();
window.VoyageSavedMapLinks={refresh};
})();