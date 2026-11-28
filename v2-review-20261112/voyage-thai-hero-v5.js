/* VOYAGE Thailand Hero V5: only replaces TH scene's image and adds a separate moving plane.
   No background motion, no passenger, no duplicate/static airplane, no change to KR/JP. */
(()=>{'use strict';
const host=document.getElementById('v2Home');if(!host)return;
const imgUrl=new URL('./assets/voyage-thai-clean-v5.webp',document.currentScript?.src||document.baseURI).href;
const planeUrl=new URL('./assets/voyage-thai-airplane-v5.webp',document.currentScript?.src||document.baseURI).href;
const css=document.createElement('style');css.id='voyage-thai-flight-v5-css';
css.textContent=`
#v2Home .vw-scene[data-country="TH"].v4-th-hero{overflow:hidden!important;background-color:#42b9ec!important}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-picture{inset:0!important;width:100%!important;height:100%!important}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-image{object-fit:cover!important;object-position:center 43%!important;transform:none!important;filter:none!important}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-fade{z-index:2!important;background:linear-gradient(90deg,#dbf1ffe8 0%,#ecf7ffad 23%,#e8faff42 46%,transparent 72%)!important}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight{position:absolute;z-index:2;left:-27%;top:9%;width:clamp(100px,20%,240px);height:auto;pointer-events:none;animation:voyage-thai-flight-left-to-right 22s linear infinite;will-change:left,transform}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight img{width:100%;height:auto;display:block;filter:drop-shadow(0 2px 1px #0d39652e)}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight::before,
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight::after{content:"";position:absolute;width:62%;height:2px;right:85%;top:66%;border-radius:99px;background:#ffffffa8;transform:rotate(-10deg);box-shadow:0 1px 2px #4a9ad11e}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight::after{top:77%;right:89%;opacity:.7}
@keyframes voyage-thai-flight-left-to-right{0%{left:-29%;transform:translateY(24px) scale(.87);opacity:0}6%{opacity:1}89%{opacity:1}100%{left:114%;transform:translateY(-36px) scale(1.05);opacity:0}}
@media(max-width:700px){
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-image{object-position:58% center!important}
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-fade{background:linear-gradient(180deg,#e9f7fff2 0%,#e6f5ffad 35%,transparent 75%)!important}
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight{top:14%;width:29%;animation-duration:20s}
}
@media(prefers-reduced-motion:reduce){#v2Home .vw-scene[data-country="TH"].v4-th-hero .v5-plane-flight{animation:none;left:46%;top:14%;opacity:1}}
`;
document.head.appendChild(css);
function apply(){
 const scene=host.querySelector('.vw-scene.v4-th-hero[data-country="TH"]');
 if(!scene)return;
 const picture=scene.querySelector('.v4-picture'),bg=scene.querySelector('.v4-image');
 if(!picture||!bg)return;
 if(bg.getAttribute('src')!==imgUrl)bg.setAttribute('src',imgUrl);
 const reduced=picture.querySelector('source[media]');if(reduced&&reduced.getAttribute('srcset')!==imgUrl)reduced.setAttribute('srcset',imgUrl);
 if(!scene.querySelector('.v5-plane-flight')){
  const flight=document.createElement('div');flight.className='v5-plane-flight';
  flight.setAttribute('aria-hidden','true');
  const plane=document.createElement('img');plane.src=planeUrl;plane.alt='';plane.decoding='async';flight.appendChild(plane);
  scene.querySelector('.v4-stage')?.appendChild(flight);
 }
}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})}
new MutationObserver(schedule).observe(host,{childList:true,subtree:false});
document.addEventListener('voyage-trip-changed',schedule);
schedule();
window.VoyageThailandHeroV5={asset:imgUrl,airplane:planeUrl,refresh:apply};
})();
