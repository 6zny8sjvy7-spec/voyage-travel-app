/* VOYAGE Seoul home art v12. Presentation-only integration; never reads/writes trip storage. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
#v2Home .voyage-seoul-hero-v12{width:100%;margin:0 0 12px;overflow:hidden;border-radius:22px}
#v2Home .voyage-seoul-hero-v12 iframe{width:100%;height:350px;max-height:none;display:block;overflow:hidden;border:0;border-radius:22px;background:#fffaf5}
#v2Home .v2-home-hero.v12-home-actions{min-height:0!important;margin:0 0 18px!important;padding:0 4px 4px!important;display:flex!important;background:transparent!important;border:0!important;box-shadow:none!important;color:inherit!important}
#v2Home .v2-home-hero.v12-home-actions .v2-big-icon,
#v2Home .v2-home-hero.v12-home-actions .v2-small-icon,
#v2Home .v2-home-hero.v12-home-actions .eyebrow,
#v2Home .v2-home-hero.v12-home-actions h2,
#v2Home .v2-home-hero.v12-home-actions p{display:none!important}
#v2Home .v2-home-hero.v12-home-actions .v2-hero-copy{width:100%;max-width:none!important;padding:0!important}
#v2Home .v2-home-hero.v12-home-actions .v2-toolbar{display:flex;flex-wrap:wrap;gap:9px;margin:0!important;padding:0!important}
#v2Home .v2-home-hero.v12-home-actions .v2-toolbar button{flex:1 1 150px;min-width:0}
@media(max-width:480px){#v2Home .voyage-seoul-hero-v12{border-radius:18px}#v2Home .v2-home-hero.v12-home-actions .v2-toolbar button{font-size:12px;flex-basis:105px}}
`;document.head.append(style);
let lastTripDate='';let frame=null;
const homeId='v2Home',source='../design-previews/VOYAGE-HERO-14-WEATHER.html?v=20261125';
function details(){try{return window.VoyageUI?.current?.() || null;}catch(e){return null}}
function isSeoul(t){const city=String(t?.city||'');return /(首爾|seoul|서울)/i.test(city)}
function sendTrip(t){const val=t?.startDate||'';if(frame?.contentWindow && val!==lastTripDate){lastTripDate=val;frame.contentWindow.postMessage({type:'voyage-home-scene',startDate:val},location.origin);}}
function refresh(){const home=document.getElementById(homeId);if(!home)return;const card=home.querySelector('.v2-home-hero');if(!card)return;
 const t=details(),shown=isSeoul(t);let wrapper=home.querySelector('.voyage-seoul-hero-v12');
 if(!shown){if(wrapper)wrapper.remove();card.classList.remove('v12-home-actions');frame=null;lastTripDate='';return;}
 if(!wrapper){wrapper=document.createElement('section');wrapper.className='voyage-seoul-hero-v12';wrapper.setAttribute('aria-label','首爾動態城市與天氣場景');const el=document.createElement('iframe');el.title='首爾旅程首頁插畫及天氣切換';el.setAttribute('scrolling','no');el.loading='eager';el.src=source;wrapper.append(el);home.insertBefore(wrapper,card);frame=el;lastTripDate='';el.addEventListener('load',()=>{lastTripDate='';sendTrip(details())});}
 else frame=wrapper.querySelector('iframe');card.classList.add('v12-home-actions');sendTrip(t);
}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
function start(){const home=document.getElementById(homeId);if(!home)return;new MutationObserver(schedule).observe(home,{childList:true});refresh()}
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type!=='voyage-hero-size'||!Number.isFinite(e.data.height))return;if(!frame||e.source!==frame.contentWindow)return;const h=Math.max(240,Math.min(1500,e.data.height));frame.style.height=h+'px';});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();