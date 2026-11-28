/* VOYAGE Thai BTS/MRT + bus guide. Static station order and directions are offline references.
   Exact bus numbers and realtime departures require verified third-party sources and are never invented. */
(()=>{'use strict';
const U=window.VoyageUI,R=window.VoyageRegionV4,host=document.getElementById('transportSection');
if(!U||!R||!host||document.getElementById('thaiTransitGuide'))return;
const style=document.createElement('style');style.textContent="\n#thaiTransitGuide{margin-top:16px;padding:17px;border-radius:19px;border:1px solid #aac6e5;background:linear-gradient(125deg,#f3faff,#e9f3ff)}\n#thaiTransitGuide h3{margin:0 0 8px;color:#1d4e84}#thaiTransitGuide p{line-height:1.5}\n#thaiTransitGuide .thai-tabs{display:flex;gap:8px;margin:11px 0}\n#thaiTransitGuide .thai-tabs button{flex:1;background:#eaf3ff;border:1px solid #7c9aca;padding:11px;border-radius:12px}\n#thaiTransitGuide .thai-tabs button[aria-pressed=true]{background:#246ab1;color:#fff}\n#thaiTransitGuide label{display:block;font-size:13px;font-weight:750;margin-bottom:8px;color:#1b3f6b}\n#thaiTransitGuide input{width:100%;box-sizing:border-box;border-radius:12px;padding:11px;border:1px solid #9ebad6;background:white}\n#thaiTransitGuide .thai-result{margin:12px 0;background:white;border:1px solid #c4d9eb;border-radius:14px;padding:13px;color:#203752}\n#thaiTransitGuide .thai-segment{margin:10px 0;padding:10px;border-left:4px solid #4398bc;background:#eaf8ff;border-radius:8px}\n#thaiTransitGuide .thai-links{display:flex;gap:7px;flex-wrap:wrap;margin:11px 0}\n#thaiTransitGuide .thai-links a{padding:9px 10px;border-radius:12px;background:#e6eefb;color:#174a88;font-weight:750;text-decoration:none}\n#thaiTransitGuide .thai-busbox{padding:12px;background:#fff7e4;border-radius:14px}\n#thaiTransitGuide .thai-action{padding:11px 14px;border-radius:12px;background:#2469ab;color:white;font-weight:850;border:0;cursor:pointer}\n";document.head.append(style);
const lines=[
 {id:'BTS Sukhumvit',mode:'BTS',toward:['Khu Khot','Kheha'],stops:[
 ['N24','Khu Khot'],['N23','Yaek Kor Por Aor'],['N22','Royal Thai Air Force Museum'],['N21','Bhumibol Adulyadej Hospital'],['N20','Saphan Mai'],['N19','Sai Yud'],['N18','Phahon Yothin 59'],['N17','Wat Phra Sri Mahathat'],['N16','11th Infantry Regiment'],['N15','Bang Bua'],['N14','Royal Forest Department'],['N13','Kasetsart University'],['N12','Sena Nikhom'],['N11','Ratchayothin'],['N10','Phahon Yothin 24'],['N9','Ha Yaek Lat Phrao'],['N8','Mo Chit'],['N7','Saphan Khwai'],['N5','Ari'],['N4','Sanam Pao'],['N3','Victory Monument'],['N2','Phaya Thai'],['N1','Ratchathewi'],['CEN','Siam'],['E1','Chit Lom'],['E2','Phloen Chit'],['E3','Nana'],['E4','Asok'],['E5','Phrom Phong'],['E6','Thong Lo'],['E7','Ekkamai'],['E8','Phra Khanong'],['E9','On Nut'],['E10','Bang Chak'],['E11','Punnawithi'],['E12','Udom Suk'],['E13','Bang Na'],['E14','Bearing'],['E15','Samrong'],['E16','Pu Chao'],['E17','Chang Erawan'],['E18','Royal Thai Naval Academy'],['E19','Pak Nam'],['E20','Srinagarindra'],['E21','Phraek Sa'],['E22','Sai Luat'],['E23','Kheha']]},
 {id:'BTS Silom',mode:'BTS',toward:['National Stadium','Bang Wa'],stops:[
 ['W1','National Stadium'],['CEN','Siam'],['S1','Ratchadamri'],['S2','Sala Daeng'],['S3','Chong Nonsi'],['S4','Saint Louis'],['S5','Surasak'],['S6','Saphan Taksin'],['S7','Krung Thon Buri'],['S8','Wongwian Yai'],['S9','Pho Nimit'],['S10','Talat Phlu'],['S11','Wutthakat'],['S12','Bang Wa']]},
 {id:'MRT Blue',mode:'MRT',toward:['Tao Poon（經 Chatuchak Park）','Lak Song（經 Hua Lamphong）'],note:'本站序僅涵蓋藍線可核實的中央路段；藍線環狀行車及支線方向須再依站內電子牌確認。',stops:[
 ['BL12','Kamphaeng Phet'],['BL13','Chatuchak Park'],['BL14','Phahon Yothin'],['BL15','Lat Phrao'],['BL16','Ratchadaphisek'],['BL17','Sutthisan'],['BL18','Huai Khwang'],['BL19','Thailand Cultural Centre'],['BL20','Phra Ram 9'],['BL21','Phetchaburi'],['BL22','Sukhumvit'],['BL23','Queen Sirikit National Convention Centre'],['BL24','Khlong Toei'],['BL25','Lumphini'],['BL26','Si Lom'],['BL27','Sam Yan'],['BL28','Hua Lamphong'],['BL29','Wat Mangkon'],['BL30','Sam Yot']]},
 {id:'MRT Purple',mode:'MRT',toward:['Khlong Bang Phai','Tao Poon'],stops:[
 ['PP01','Khlong Bang Phai'],['PP02','Talad Bang Yai'],['PP03','Sam Yaek Bang Yai'],['PP04','Bang Phlu'],['PP05','Bang Rak Yai'],['PP06','Bang Rak Noi Tha It'],['PP07','Sai Ma'],['PP08','Phra Nangklao Bridge'],['PP09','Yaek Nonthaburi 1'],['PP10','Bang Krasor'],['PP11','Nonthaburi Civic Center'],['PP12','Ministry of Public Health'],['PP13','Yaek Tiwanon'],['PP14','Wong Sawang'],['PP15','Bang Son'],['PP16','Tao Poon']]}
];
const aliases={'暹羅':'Siam','阿索克':'Asok','阿速克':'Asok','素坤逸':'Sukhumvit','帕亞泰':'Phaya Thai','沙拉登':'Sala Daeng','席隆':'Si Lom','莫奇':'Mo Chit','恰圖恰公園':'Chatuchak Park','勝利紀念碑':'Victory Monument','通羅':'Thong Lo','澎蓬':'Phrom Phong','娜娜':'Nana','伊卡邁':'Ekkamai','拉瑪九':'Phra Ram 9','華藍蓬':'Hua Lamphong','邦瓦':'Bang Wa','鄭皇橋':'Saphan Taksin'};
const norm=s=>String(s||'').normalize('NFKC').trim().toLocaleLowerCase().replace(/(?:\s+station|\s+站)$/i,'').replace(/[\s\-_·.]/g,'');
function exact(term,stop){const q=norm(aliases[term.trim()]||term);return q===norm(stop[0])||q===norm(stop[1])}
function plan(a,b,mode){
 const matches=[];
 for(const l of lines.filter(x=>mode!=='rail'||['BTS','MRT'].includes(x.mode))){
  const from=l.stops.findIndex(s=>exact(a,s)),to=l.stops.findIndex(s=>exact(b,s));
  if(from<0||to<0||from===to)continue;
  const forward=to>from,part=forward?l.stops.slice(from,to+1):l.stops.slice(to,from+1).reverse();
  matches.push({line:l,lineName:l.id,count:part.length-1,part,direction:l.toward[forward?1:0]});
 }
 return matches.sort((x,y)=>x.count-y.count)[0]||null;
}
const card=document.createElement('section');card.id='thaiTransitGuide';
card.innerHTML='<h3>🚇 泰國交通｜BTS・MRT・公車</h3><p>輸入出發站與抵達站，已收錄的同線車站可顯示「搭幾站、哪個方向、停靠站序」。其他跨線或公車使用官方／Google Maps 查看，不會猜測站數或到站時間。</p>';
const tabs=document.createElement('div');tabs.className='thai-tabs';
const railBtn=document.createElement('button'),busBtn=document.createElement('button');railBtn.type=busBtn.type='button';railBtn.textContent='🚇 BTS／MRT';busBtn.textContent='🚌 公車';
tabs.append(railBtn,busBtn);
const fields=document.createElement('div');
const a=document.createElement('input'),b=document.createElement('input'),dl=document.createElement('datalist');dl.id='thaiTransitStationHints';
for(const s of [...new Set(lines.flatMap(l=>l.stops.map(x=>x[1])))]){const o=new Option(s,s);dl.append(o)}
a.setAttribute('list',dl.id);b.setAttribute('list',dl.id);a.placeholder='A 出發站：例如 Siam／暹羅';b.placeholder='B 抵達站：例如 Asok／阿索克';
const label=(txt,input)=>{const l=document.createElement('label');l.textContent=txt;l.append(input);return l};
fields.append(label('A 出發站',a),label('B 抵達站',b),dl);
const search=document.createElement('button');search.type='button';search.className='thai-action';search.textContent='查詢怎麼搭／搭幾站';
const result=document.createElement('div');result.className='thai-result';result.textContent='例如輸入 Siam → Asok，就能查看 BTS 站數與終點方向。';
const links=document.createElement('div');links.className='thai-links';
for(const [name,url] of [
 ['BTS 官方路線圖','https://www.bts.co.th/eng/library/system-structuer.html'],
 ['MRT 官方藍線／紫線路線圖','https://metro.bemplc.co.th/MRT-System-Map?lang=en'],
 ['BMTA BUS 公車資訊','https://www.thailand.go.th/public/issue-focus-detail/--bmta-bus------']]){
 const el=document.createElement('a');el.href=url;el.target='_blank';el.rel='noopener noreferrer';el.textContent=name+' ↗';links.append(el)
}
let mode='rail',last=null;
function mapUrl(){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(a.value.trim()+', Bangkok, Thailand')+'&destination='+encodeURIComponent(b.value.trim()+', Bangkok, Thailand')+'&travelmode=transit'}
function change(which){
 mode=which;railBtn.setAttribute('aria-pressed',String(mode==='rail'));busBtn.setAttribute('aria-pressed',String(mode==='bus'));
 result.replaceChildren();result.textContent=which==='bus'?'曼谷公車請輸入 A／B 後點查詢，可開啟 Google Maps 的大眾運輸路線查看車號、上車站、方向與站數。VOYAGE 未取得官方站序前不自行編造公車車號。':'輸入同線 BTS／MRT 車站，可算出站數與列車方向；跨線請使用 Google Maps 或下方公開路線查詢。';
}
function renderResult(){
 const from=a.value.trim(),to=b.value.trim();if(!from||!to){result.textContent='請先輸入 A 出發站和 B 抵達站';return}
 const p=mode==='rail'?plan(from,to,mode):null;last=p;
 result.replaceChildren();
 if(p){
  result.append(Object.assign(document.createElement('h4'),{textContent:p.lineName+' · 搭 '+p.count+' 站'}));
  const head=document.createElement('p');head.textContent='搭車方向：往 '+p.direction+'（請確認月台電子牌）';result.append(head);
  const seq=document.createElement('div');seq.className='thai-segment';seq.textContent=p.part.map(x=>x[1]+' '+x[0]).join(' → ');result.append(seq);
  if(p.line.note){const note=document.createElement('small');note.textContent=p.line.note;result.append(note)}
  const save=document.createElement('button');save.type='button';save.className='thai-action';save.textContent='＋ 加入本日交通行程';
  save.onclick=()=>{const t=U.current();t.days[day].push({type:'transport',name:from+' → '+to,from,to,time:'',duration:null,line:p.lineName,routeGuide:{stationCount:p.count,direction:p.direction,stations:p.part.map(x=>x[1])},notes:'站序參考；班次與月台以現場公告為準'});U.save();render();alert('已新增交通行程，請在每日行程設定出發時間。')};result.append(save);
 }else{const h=document.createElement('h4');h.textContent=mode==='bus'?'🚌 公車路線／站數請核對來源':'跨線路線／非本站序範圍';result.append(h);
  const p=document.createElement('p');p.textContent='目前沒有足以在 VOYAGE 可靠計算這條路線的完整站序。請開啟 Google Maps 查看公車號碼、上車方向、各站與轉乘，或核對官方 BTS／MRT 路線圖。';result.append(p)}
 const go=document.createElement('a');go.textContent='開啟 Google Maps 大眾運輸路線 ↗';go.className='voyage-place-link';go.href=mapUrl();go.target='_blank';go.rel='noopener noreferrer';result.append(go);
}
railBtn.onclick=()=>change('rail');busBtn.onclick=()=>change('bus');search.onclick=renderResult;
card.append(tabs,fields,search,result,links);
const foot=document.createElement('p');foot.textContent='資料為官方公開站序參考，不是即時班次或車票。巴士路線、轉乘與實際行駛方向請以當日官方服務／Google Maps 為準。';card.append(foot);
host.append(card);
function refresh(){
 const code=R.countryCode(U.current());
 card.hidden=code!=='TH';
 if(code==='TH'){const t=U.current(),k=t.id+'|'+t.city;if(card.dataset.trip!==k){card.dataset.trip=k;a.value='';b.value='';change('rail')}}
}
const old=render;render=function(){old();refresh()};document.addEventListener('voyage-trip-changed',refresh);refresh();
window.VoyageThailandTransitV1={lines,plan};
})();