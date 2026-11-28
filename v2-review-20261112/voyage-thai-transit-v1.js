/* VOYAGE TH transit: documented sequential station order, no invented live arrivals.
   BTS: https://www.bts.co.th/eng/library/system-structuer.html
   MRT Blue: https://metro.bemplc.co.th/Line-Maps?Line=1&lang=EN
   Bus guidance: https://www.thailand.go.th/public/issue-focus-detail/--bmta-bus------ */
(()=>{'use strict';
const U=window.VoyageUI,container=document.getElementById('transportSection');
if(!U||!container)return;
const data={
 suk:{title:'BTS 淺綠線 Sukhumvit（已核對的市區連續站段）',towardsStart:'往 Khu Khot（คูคต）',towardsEnd:'往 Kheha（เคหะ）',
 source:'https://www.bts.co.th/eng/library/system-structuer.html',
 stations:`N8|Mo Chit|莫奇;N7|Saphan Khwai|水牛橋;N5|Ari|阿里;N4|Sanam Pao|沙南拋;N3|Victory Monument|勝利紀念碑;N2|Phaya Thai|帕亞泰;N1|Ratchathewi|拉差貼威;CEN|Siam|暹羅;E1|Chit Lom|奇隆;E2|Phloen Chit|奔集;E3|Nana|娜娜;E4|Asok|阿索克;E5|Phrom Phong|澎蓬;E6|Thong Lo|通羅;E7|Ekkamai|億甲邁;E8|Phra Khanong|拍崑崙;E9|On Nut|安努;E10|Bang Chak|邦扎克;E11|Punnawithi|普納威提;E12|Udom Suk|烏東素;E13|Bang Na|邦納;E14|Bearing|貝林`.split(';').map(x=>x.split('|'))},
 sil:{title:'BTS 深綠線 Silom（完整 14 站）',towardsStart:'往 National Stadium（國家體育館）',towardsEnd:'往 Bang Wa（邦瓦）',
 source:'https://www.bts.co.th/eng/library/system-structuer.html',
 stations:`W1|National Stadium|國家體育館;CEN|Siam|暹羅;S1|Ratchadamri|拉差丹利;S2|Sala Daeng|沙拉當;S3|Chong Nonsi|衝暖詩;S4|Saint Louis|聖路易;S5|Surasak|蘇拉沙;S6|Saphan Taksin|沙潘塔克辛;S7|Krung Thon Buri|吞武里;S8|Wongwian Yai|大羅圈;S9|Pho Nimit|波尼密;S10|Talat Phlu|達叻普;S11|Wutthakat|武他卡;S12|Bang Wa|邦瓦`.split(';').map(x=>x.split('|'))},
 mrt:{title:'MRT 藍線 Blue Line（已核對的市區連續站段）',towardsStart:'往 Bang Sue / Tao Poon 方向（請核對月台實際終點）',towardsEnd:'往 Hua Lamphong / Tha Phra 方向（請核對月台實際終點）',
 source:'https://metro.bemplc.co.th/Line-Maps?Line=1&lang=EN',
 stations:`BL11|Bang Sue|邦蘇;BL12|Kamphaeng Phet|甘烹碧;BL13|Chatuchak Park|恰圖恰公園;BL14|Phahon Yothin|帕宏悠庭;BL15|Lat Phrao|拉拋;BL16|Ratchadaphisek|拉差達披色;BL17|Sutthisan|素堤訕;BL18|Huai Khwang|匯狂;BL19|Thailand Cultural Centre|泰國文化中心;BL20|Phra Ram 9|拉瑪九;BL21|Phetchaburi|碧武里;BL22|Sukhumvit|素坤逸;BL23|Queen Sirikit National Convention Centre|詩麗吉王后會議中心;BL24|Khlong Toei|孔堤;BL25|Lumphini|倫披尼;BL26|Si Lom|是隆;BL27|Sam Yan|三養;BL28|Hua Lamphong|華南蓬;BL29|Wat Mangkon|龍蓮寺;BL30|Sam Yot|三ยอด;BL31|Sanam Chai|沙南猜;BL32|Itsaraphap|伊薩拉帕`.split(';').map(x=>x.split('|'))}
};
const alias={'暹羅':'Siam','阿索克':'Asok','莫奇':'Mo Chit','勝利紀念碑':'Victory Monument','澎蓬':'Phrom Phong','帕亞泰':'Phaya Thai','華南蓬':'Hua Lamphong','是隆':'Si Lom','素坤逸':'Sukhumvit','沙拉當':'Sala Daeng'};
const norm=x=>String(x||'').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'').trim();
const matches=(station,query)=>station.some(value=>norm(value)===norm(query)||norm(alias[query])===norm(value));
const panel=document.getElementById('transportSection');
const result=document.getElementById('v2RouteResults');
const from=document.getElementById('transitFrom'),to=document.getElementById('transitTo');
if(!panel||!result||!from||!to)return;
const region=()=>window.VoyageRegionV4?.countryCode?.(U.current?.());
const active=()=>region()==='TH';
const E=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
const refBox=E('details');refBox.id='voyageThaiStationReference';refBox.className='v5-optional';
refBox.append(E('summary','泰國 BTS／MRT 站序與搭乘資訊來源（展開）'));
refBox.append(E('p','上方 A→B 是唯一主要搜尋入口。已收錄的 BTS／MRT 同線區間會直接列出方向及站數；未完整收錄的區間可試公車或綜合轉乘搜尋，無可靠資料時不編造結果。'));
for(const key of ['suk','sil','mrt']){
 const p=E('p',data[key].title+'：'+data[key].stations[0][1]+' → '+data[key].stations.at(-1)[1]+'（目前只涵蓋這段）');
 const a=E('a','官方路線圖', {href:data[key].source,target:'_blank',rel:'noopener noreferrer'});
 p.append(' · ',a);refBox.append(p);
}
refBox.append(E('p','🚌 曼谷公車：可用上方「公車」模式查 A→B；若來源沒有核實站序，請依 Google Maps、BMTA BUS 或 ViaBus 查詢當日路線。'));
refBox.append(E('a','BMTA BUS 官方說明',{href:'https://www.thailand.go.th/public/issue-focus-detail/--bmta-bus------',target:'_blank',rel:'noopener noreferrer'}));
refBox.append('　');
refBox.append(E('a','ViaBus 官方網站',{href:'https://www.viabus.co/',target:'_blank',rel:'noopener noreferrer'}));
result.after(refBox);
const style=document.createElement('style');style.id='voyage-thai-integrated-search-style';
style.textContent=[
'#voyageThaiStationReference{margin:14px 0;background:var(--card);border:1px solid var(--line);border-radius:15px;padding:12px}',
'#voyageThaiStationReference[hidden]{display:none!important}',
'#voyageThaiStationReference summary{font-weight:700;cursor:pointer;color:var(--ink)}',
'#voyageThaiStationReference p{font-size:13px;line-height:1.6;color:var(--muted);margin:9px 0}',
'#transportSection.th-integrated #v5TransitPanel>h3{display:none}',
'#transportSection.th-integrated #v4TransitRegion{display:none}',
'#transportSection.th-integrated>.eyebrow,#transportSection.th-integrated>.hint,#transportSection.th-integrated>p.v1-sub{display:none!important}',
'#transportSection.th-integrated #v5TransitPanel>p,#transportSection.th-integrated #v5RegionDesc{display:none!important}',
'#transportSection.th-integrated #v5OptionalDepartures,#transportSection.th-integrated #v5ManualProgress,#transportSection.th-integrated #voyageThaiStationReference,#transportSection.th-integrated #v1TransitExtras{display:none!important}',
'#transportSection.th-integrated #rideFields,#transportSection.th-integrated .view-switch{display:none!important}',
'#transportSection.th-integrated #v5ManualTransitAdd{display:none!important}',
'#transportSection.th-integrated #thSimplePlanner{display:block;border:1px solid var(--line);background:var(--card);border-radius:15px;padding:10px 13px;margin:12px 0}',
'#transportSection.th-integrated #thSimplePlanner summary{cursor:pointer;font-weight:750;color:var(--ink)}',
'#transportSection.th-integrated #thSimplePlanner #planFields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:14px}',
'#transportSection.th-integrated #thSimplePlanner #planFields label{min-width:0}',
'#transportSection.th-integrated #thSimplePlanner #planFields input{min-width:0;width:100%}',
'#transportSection.th-integrated #thSimplePlanner .th-save-route{grid-column:1/-1}',
'#transportSection.th-integrated #thBusHint{border-radius:13px;padding:12px 14px;margin:11px 0;background:#fff7e8;border:1px solid #f0dab0;font-size:13px;line-height:1.6}',
'#transportSection.th-integrated #thBusHint a{color:#1254a3;font-weight:750}',
'#transportSection.th-integrated #voyageThaiTransit{display:none!important}'
].join('\n');
document.head.append(style);
const btsCss=document.createElement('style');btsCss.textContent=`
.th-bts-suggestions{max-height:235px;overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--card);margin:5px 0;position:relative;z-index:2}
.th-bts-suggestions[hidden]{display:none!important}
.th-bts-suggestions button{display:block;white-space:normal;min-width:0;width:100%;text-align:left;background:transparent;color:var(--ink);padding:10px 9px;border-radius:0;border-bottom:1px solid var(--line);font-size:13px;overflow-wrap:anywhere}
.th-bts-suggestions button strong,.th-bts-suggestions button span,.th-bts-suggestions button small{display:block;line-height:1.4;overflow-wrap:anywhere;white-space:normal}.th-bts-suggestions button strong{font-size:14px}.th-bts-suggestions button span,.th-bts-suggestions button small{font-size:12px;color:var(--muted)}#transportSection.th-integrated #transitFrom,#transportSection.th-integrated #transitTo{font-size:16px!important;width:100%;min-width:0;max-width:100%}#transportSection.th-integrated .transport-panel{min-width:0;max-width:100%}#transportSection.th-integrated .th-bts-suggestions{min-width:0;max-width:100%;overflow-x:hidden}.th-bts-leg{padding:12px 14px;margin:12px 0;border:1px solid var(--line);border-left:5px solid;border-radius:12px;background:var(--card);overflow-wrap:anywhere}
.th-bts-leg p{margin:7px 0}.th-route-direction{font-weight:800;color:var(--ink)}.th-transfer-label{font-weight:800;padding:8px;background:var(--soft);border-radius:10px}
#transportSection.th-integrated .transport-panel label{min-width:0}#transportSection.th-integrated [data-th-integrated]{min-height:42px;width:100%}
`;document.head.append(btsCss);
/* The lower manual train tracker and duplicate station search are not relevant
   to a simple Thailand A→B query. Preserve their DOM for other countries, and
   keep date/time only under one optional "save this trip" disclosure. */
const planFields=document.getElementById('planFields');
const originalPlanHost=planFields?.parentElement;
const originalPlanNext=planFields?.nextSibling||null;
const compact=E('details',undefined,{id:'thSimplePlanner'});
compact.append(E('summary','＋ 將交通安排到每日行程（選用）'));
const thSave=E('button','儲存這趟交通到行程',{class:'primary th-save-route',type:'button'});
thSave.addEventListener('click',()=>document.getElementById('addTransit')?.click());
const busHint=E('div',undefined,{id:'thBusHint'});
busHint.append(E('strong','🚌 公車路線建議：'));
busHint.append(E('span','先使用上方 A→B 查詢。免費資料如果無法確認公車號碼或停靠站，請改用當天的大眾運輸導航，不會顯示猜測的站數。 '));
const busMap=E('a','Google Maps 查詢公車／大眾運輸',{target:'_blank',rel:'noopener noreferrer'});
busHint.append(busMap,' · ');
busHint.append(E('a','ViaBus',{href:'https://www.viabus.co/',target:'_blank',rel:'noopener noreferrer'}));
function busUrl(){
 return 'https://www.google.com/maps/dir/?api=1&origin='+
 encodeURIComponent((from.value.trim()||'Bangkok')+', Bangkok, Thailand')+
 '&destination='+encodeURIComponent((to.value.trim()||'Bangkok')+', Bangkok, Thailand')+
 '&travelmode=transit';
}
function refreshBus(){
 const mode=window.VoyageTransitUIV5?.mode||'mixed';
 busHint.hidden=!active()||mode!=='bus';busMap.href=busUrl();
}
for(const node of [from,to])node.addEventListener('input',refreshBus);
panel.addEventListener('click',e=>{
 if(e.target.closest('.v5-mode-switch button')){stationPicker.forEach(x=>x.hidden=true);requestAnimationFrame(refreshBus);}
});
function updateCountry(){
 const isThai=active();const railBtn=panel.querySelector('.v5-mode-switch button');if(railBtn)railBtn.textContent=isThai?'🚆 BTS/MRT':'🚇 地鐵';if(!isThai||window.VoyageTransitUIV5?.mode==='bus')stationPicker.forEach(x=>x.hidden=true);refBox.hidden=!isThai;panel.classList.toggle('th-integrated',isThai);
 if(isThai){
  if(planFields && planFields.parentElement!==compact){
   compact.append(planFields);compact.append(thSave);
  }
  if(compact.previousElementSibling!==result||busHint.previousElementSibling!==compact)result.after(compact,busHint);
 }else{
  compact.remove();busHint.remove();
  if(planFields&&originalPlanHost&&planFields.parentElement!==originalPlanHost){
   originalPlanHost.insertBefore(planFields,originalPlanNext);
  }
 }
 refreshBus();
 const oldHeading=panel.querySelector(':scope > h2');
 if(oldHeading&&isThai)oldHeading.textContent='🇹🇭 交通助手';
 else if(oldHeading&&oldHeading.textContent.includes('🇹🇭'))oldHeading.textContent='交通 · 站名／方向／站數查詢';
}
function routeOf(start,end){
 const opts=[];
 for(const [key,line] of Object.entries(data)){
  const a=line.stations.findIndex(s=>matches(s,start)),b=line.stations.findIndex(s=>matches(s,end));
  if(a<0||b<0)continue;
  const sequence=a<=b?line.stations.slice(a,b+1):line.stations.slice(b,a+1).reverse();
  opts.push({key,line,from:a,to:b,stations:sequence,direction:b>a?line.towardsEnd:line.towardsStart});
 }
 return opts.find(x=>x.from!==x.to)||opts[0]||null;
}
function display(route){
 result.replaceChildren();
 if(route.from===route.to){result.append(E('p','起終點是同一站，無須搭車'));return}
 const info=route.stations,first=info[0],last=info[info.length-1];
 result.append(E('h3','🚇 '+route.line.title));
 result.append(E('p','出發：'+first[2]+'（'+first[1]+'／'+first[0]+'）'));
 result.append(E('p','搭乘方向：'+route.direction+'。月台終點顯示須依現場公告再次核對。'));
 result.append(E('p','搭乘 '+(info.length-1)+' 站，不需換線。下車：'+last[2]+'（'+last[1]+'／'+last[0]+'）。'));
 const d=E('details');d.append(E('summary','展開全部 '+info.length+' 個上下車與途經站'));
 const ol=E('ol');for(const s of info)ol.append(E('li',s[0]+' · '+s[2]+' · '+s[1]));
 d.append(ol);result.append(d);
 result.append(E('p','已核對站序，非即時班次或動態到站。請以當天營運公告為準。'));
 result.append(E('a','官方站序來源',{href:route.line.source,target:'_blank',rel:'noopener noreferrer'}));
 const link=E('a','　Google Maps 大眾運輸查詢',{
  href:'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.value+', Bangkok, Thailand')+'&destination='+encodeURIComponent(to.value+', Bangkok, Thailand')+'&travelmode=transit',
  target:'_blank',rel:'noopener noreferrer'
 });
 result.append(link);
}
const network=window.VoyageBTSNetwork;
const stationText=s=>s.id+" · "+s.zh+" · "+s.en+" · "+s.th;
function displayBTS(route){
 result.replaceChildren();
 const count=E('h3',route.stops===0?(route.transfers?'步行轉乘 · 無須搭車':'起終點是同一站'):'搭乘 '+route.stops+' 站 · '+(route.transfers?'轉乘 '+route.transfers+' 次':'不需換線'));
 result.append(count);
 if(!route.stops&&!route.transfers)return;
 for(let i=0;i<route.legs.length;i++){
  const leg=route.legs[i],line=network.lines[leg.line],a=leg.stations[0],b=leg.stations.at(-1);
  if(i){const prior=route.legs[i-1].stations.at(-1);result.append(E('p','↳ '+stationText(prior)+' → '+stationText(a)+' · '+(route.legs[i-1].line===leg.line?'站內換月台':'步行轉乘 '+line.title)+'（依站內指標）',{class:'th-transfer-label'}));} if(!leg.count)continue;
  const card=E('section',undefined,{class:'th-bts-leg'});card.style.borderLeftColor=line.color;
  card.append(E('strong',line.title),E('p','上車：'+stationText(a)),E('p','方向：往 '+leg.direction.zh+' · '+leg.direction.en+' · '+leg.direction.th+(leg.line==='blue'?'（下一站 '+leg.stations[1].zh+' / '+leg.stations[1].th+'）':''),{class:'th-route-direction'}),E('p','搭乘 '+leg.count+' 站'),E('p','下車：'+stationText(b)));
  const details=E('details');details.append(E('summary','查看 '+leg.stations.length+' 個站點（含上下車）'));const ol=E('ol');for(const s of leg.stations)ol.append(E('li',stationText(s)));details.append(ol);card.append(details);result.append(card);
 }
 result.append(E('p','站序規劃，非即時到站。部分列車可能提前折返，請確認月台終點可到目的站。',{class:'v1-sub'}));
 for(const [label,href] of [['BTS','https://www.bts.co.th/routemap.html'],['MRT','https://metro.bemplc.co.th/MRT-System-Map?lang=en'],['SRT','https://www.srtet.co.th/en/route-information']])result.append(E('a',label+' 官方路線圖　',{href,target:'_blank',rel:'noopener noreferrer'}));
 document.getElementById('transitLine').value=route.legs.filter(l=>l.count).map(l=>network.lines[l.line].title+' 往 '+l.direction.en+'（'+l.direction.th+'） · '+l.count+' 站').join('；');
}
const stationPicker=[];
for(const input of [from,to]){
 const list=E('div',undefined,{class:'th-bts-suggestions',role:'listbox'});list.hidden=true;input.after(list);stationPicker.push(list);
 const draw=()=>{list.replaceChildren();const mode=window.VoyageTransitUIV5?.mode||'mixed';if(!active()||mode==='bus'||!network){list.hidden=true;return}const found=network.candidates(selectedCode(input.value));if(!found.length){list.hidden=true;return}for(const s of found){const b=E('button',undefined,{type:'button',role:'option'});b.append(E('strong',s.id+' · '+s.zh),E('span',s.en+' · '+s.th),E('small',network.lines[s.line].title));b.addEventListener('click',()=>{input.value=s.id+' · '+s.zh+' · '+s.en;list.hidden=true;refreshBus()});list.append(b)}list.hidden=false};
 input.addEventListener('input',draw);input.addEventListener('focus',draw);input.addEventListener('blur',()=>setTimeout(()=>{list.hidden=true},200));list.addEventListener('pointerdown',e=>e.preventDefault());
}
const selectedCode=v=>String(v).split(' · ')[0];

function intercept(event){
 if(!active())return;
 const filter=window.VoyageTransitUIV5?.mode||'mixed';
 if(filter==='bus')return; // Let the primary open-data search run; no guessed bus numbers.
 const a=from.value.trim(),b=to.value.trim();
 if(!a||!b)return;
 const aa=selectedCode(a),bb=selectedCode(b);const ambiguous=[aa,bb].find(x=>network?.candidates(x).length>1&&!network.resolve(x).length);if(ambiguous){event.preventDefault();event.stopImmediatePropagation();result.replaceChildren(E('p','「'+ambiguous+'」有多個符合站點，請從候選清單選擇確切站號。'));return;}
 const matchedBTS=network?.route(aa,bb);
 if(matchedBTS){event.preventDefault();event.stopImmediatePropagation();stationPicker.forEach(x=>x.hidden=true);displayBTS(matchedBTS);return;}
 if(filter==='rail'){event.preventDefault();event.stopImmediatePropagation();result.replaceChildren(E('p','未找到這組車站，請選擇候選站名或輸入車站代號。非車站地址可切換綜合轉乘。'));return;}
 const matched=routeOf(a,b);
 if(!matched)return; // Cross-line A→B needs real routing, not a forced single-line answer.
 event.preventDefault();event.stopImmediatePropagation();
 display(matched);
}
function hook(){
 const btn=panel.querySelector('[data-th-integrated]')||[...panel.querySelectorAll('button')].find(x=>/查詢\s*A\s*→\s*B\s*怎麼搭/.test(x.textContent));
 if(btn){btn.textContent='查詢';}
 if(btn&&!btn.dataset.thIntegrated){btn.dataset.thIntegrated='1';btn.addEventListener('click',intercept,true)}
}
function refresh(){hook();updateCountry()}
document.addEventListener('voyage-trip-changed',refresh);
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()})}).observe(panel,{childList:true,subtree:false});
refresh();
window.VoyageThailandTransit={data,routeOf,refresh,sourceType:'fixed-official-station-sequence'};
})();