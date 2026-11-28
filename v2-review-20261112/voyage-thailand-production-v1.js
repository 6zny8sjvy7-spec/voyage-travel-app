/* VOYAGE official homepage: TH-only approved artwork responsive repair.
   No changes to KR/JP scenes, trips, storage, weather, navigation or other tools. */
(()=>{'use strict';
const home=document.getElementById('v2Home');
if(!home||document.getElementById('voyage-official-thailand-style'))return;
const el=document.createElement('style');el.id='voyage-official-thailand-style';
el.textContent=`
/* The approved animated artwork itself remains exactly the one selected by the user. */
#v2Home .vw-scene[data-country="TH"].v4-th-hero{
 height:clamp(550px,58vw,710px)!important;
 max-height:none!important;max-width:100%!important;width:100%!important;
 background:#95c7ed!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-stage{
 background:#95c7ed!important;inset:0!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-picture{
 position:absolute!important;inset:0!important;
 width:100%!important;height:100%!important;
 right:auto!important;top:0!important;
 overflow:hidden!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-image{
 display:block!important;width:100%!important;height:100%!important;
 object-fit:cover!important;object-position:53% 44%!important;transform:none!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-fade{
 position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
 background:linear-gradient(90deg,#eaf4ffe8 0%,#edf5ffb8 24%,#eaf4ff60 42%,transparent 72%)!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy{
 left:3.5%!important;top:8%!important;width:min(49%,580px)!important;
 box-sizing:border-box!important;padding:12px!important;
 background:linear-gradient(90deg,#eef6ff6b,transparent)!important;
 border-radius:17px!important;z-index:8!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy h2{
 color:#1a2b61!important;font-size:clamp(25px,3.5vw,48px)!important;
 text-shadow:0 1px 9px #fff,0 1px 2px #fff!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy p{
 color:#293465!important;text-shadow:0 1px 7px #fff!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-weather{
 left:auto!important;right:2.6%!important;top:4%!important;
 max-width:40%!important;background:#2866b3db!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-nightshade{
 background:linear-gradient(100deg,#1a275426 0%,#0a194e66 100%)!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero[data-night="true"] .v4-nightshade{opacity:.5!important}
#v2Home .vw-scene[data-country="TH"].v4-th-hero[data-night="true"] .vw-copy{
 background:linear-gradient(90deg,#f0f6ffed,#eaf1ffc0,transparent)!important;
}
#v2Home .vw-scene[data-country="TH"].v4-th-hero[data-night="true"] .vw-copy h2,
#v2Home .vw-scene[data-country="TH"].v4-th-hero[data-night="true"] .vw-copy p{
 color:#18315b!important;text-shadow:0 1px 7px #fff!important;
}
@media(max-width:700px){
 #v2Home .vw-scene[data-country="TH"].v4-th-hero{height:560px!important;border-radius:18px!important}
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-picture{
   inset:0!important;width:100%!important;height:100%!important;
 }
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-image{
   object-position:61% 48%!important;
 }
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-fade{
   background:linear-gradient(180deg,#ecf6fff4 0%,#edf5ffde 33%,#edf6ff6f 54%,transparent 83%)!important;
 }
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy{
   left:4%!important;top:4%!important;width:92%!important;
   padding:8px!important;background:transparent!important;
 }
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy h2{font-size:27px!important}
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .vw-copy p{font-size:13px!important}
 #v2Home .vw-scene[data-country="TH"].v4-th-hero .v4-weather{
   left:4%!important;right:auto!important;top:43%!important;max-width:90%!important;
 }
}
`;
document.head.appendChild(el);
})();
