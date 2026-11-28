/* VOYAGE high-resolution vivid Thai hero: retain original art, no passenger, no aircraft duplicates. */
(()=>{'use strict';
const HOME=document.getElementById('v2Home'),asset=new URL('./assets/voyage-thailand-vivid-hero-20261128.webp',document.currentScript?.src||document.baseURI).href;
if(!HOME||document.getElementById('voyage-vivid-thai-style'))return;
const style=document.createElement('style');style.id='voyage-vivid-thai-style';style.textContent="\n/* Crisp imagery, zero fullscreen frosted glass; artwork is the approved 1672px hero. */\n#v2Home .vw-scene[data-country=\"TH\"].v4-th-hero{\n  height:clamp(475px,51vw,710px)!important;background:#21b7eb!important;border-color:#3168a6!important;\n}\n#v2Home .v4-th-hero .v4-picture{left:0!important;right:0!important;top:0!important;bottom:0!important;width:100%!important;height:100%!important}\n#v2Home .v4-th-hero .v4-image{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 47%!important;transform:none!important;image-rendering:auto!important}\n#v2Home .v4-th-hero .v4-fade{display:none!important}\n#v2Home .v4-th-hero .v4-nightshade{background:#0b215a!important}\n#v2Home .v4-th-hero[data-night=\"true\"] .v4-nightshade{opacity:.13!important}\n#v2Home .v4-th-hero .vw-copy{\n top:7%!important;left:3%!important;width:min(51%,530px)!important;padding:12px 16px!important;\n border-radius:18px!important;background:linear-gradient(90deg,#e8f8ffec,#eaf7ffae 78%,#eaf7ff1e)!important;\n box-shadow:0 4px 16px #16498e26!important;text-shadow:0 1px 5px #fff!important;\n}\n#v2Home .v4-th-hero .vw-copy h2{color:#183e77!important;text-shadow:0 2px 3px #fff!important}\n#v2Home .v4-th-hero .vw-copy p{color:#254771!important;text-shadow:0 1px 2px #fff!important}\n#v2Home .v4-th-hero[data-night=\"true\"] .vw-copy,\n#v2Home .v4-th-hero[data-night=\"true\"] .vw-copy h2,\n#v2Home .v4-th-hero[data-night=\"true\"] .vw-copy p{color:#173f71!important;text-shadow:0 1px 5px #fff!important}\n#v2Home .v4-th-hero .v4-weather{top:3%!important;right:2%!important;left:auto!important;max-width:42%!important;background:#2168b3e8!important;backdrop-filter:none!important}\n@media(max-width:700px){\n #v2Home .vw-scene[data-country=\"TH\"].v4-th-hero{height:560px!important}\n #v2Home .v4-th-hero .v4-picture{top:0!important;left:0!important;width:100%!important;height:100%!important}\n #v2Home .v4-th-hero .v4-image{object-position:80% center!important}\n #v2Home .v4-th-hero .vw-copy{top:3.5%!important;left:3.5%!important;width:93%!important;padding:9px 11px!important;\n  background:linear-gradient(180deg,#f0fbfff5,#edf9fff0 82%,#e9f8ffcc)!important}\n #v2Home .v4-th-hero .vw-copy h2{font-size:25px!important}\n #v2Home .v4-th-hero .vw-copy p{font-size:12px!important}\n #v2Home .v4-th-hero .v4-weather{left:4%!important;right:auto!important;top:47%!important;max-width:91%!important}\n}\n";document.head.append(style);
function paint(){
 const t=window.VoyageUI?.current?.();
 if(window.VoyageRegionV4?.countryCode?.(t)!=='TH')return;
 const scene=HOME.querySelector('.v4-th-hero[data-country="TH"]');if(!scene)return;
 const img=scene.querySelector('img.v4-image');
 if(img&&img.src!==asset){img.src=asset;img.decoding='async';img.setAttribute('aria-label','曼谷高解析插畫：無乘客飛機、四面佛、嘟嘟車、寺廟與水上市場')}
 const source=scene.querySelector('picture source');
 if(source&&source.srcset!==asset)source.srcset=asset;
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;paint()})}
new MutationObserver(schedule).observe(HOME,{childList:true,subtree:false});
document.addEventListener('voyage-trip-changed',schedule);
document.addEventListener('voyage-weather',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
window.VoyageVividThaiV1={asset};
})();