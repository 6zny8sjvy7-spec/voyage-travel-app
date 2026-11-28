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
const match=(s,q)=>s.some(v=>norm(v)===norm(q)||norm(alias[q])===norm(v));
const root=document.createElement('section');root.id='voyageThaiTransit';root.className='voyage-th-transit';root.hidden=true;
root.innerHTML=`<h3>🇹🇭 泰國 BTS／MRT／公車搭乘助手</h3>
 <p class="th-note">選擇交通類型，查詢方向、搭幾站與沿途車站。站數僅對已收錄完整站序的區間計算，非即時發車預報。</p>
 <div class="th-row"><label>交通種類<select id="thMode"><option value="suk">BTS 淺綠線</option><option value="sil">BTS 深綠線</option><option value="mrt">MRT 藍線</option><option value="bus">公車</option></select></label></div>
 <div class="th-row"><label>出發車站<input id="thStart" list="thStations" placeholder="例：暹羅 / Siam"></label><label>抵達車站<input id="thEnd" list="thStations" placeholder="例：阿索克 / Asok"></label><datalist id="thStations"></datalist></div>
 <div class="th-actions"><button type="button" id="thFind" class="primary">查詢怎麼搭、方向及站數</button><a id="thExternal" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/">Google Maps 大眾運輸導航</a></div>
 <div id="thResult" class="th-result" role="status" aria-live="polite">請選出發與抵達站。中文、英文或站碼皆可輸入。</div>
 <small class="th-attrib">BTS 站序：BTS SkyTrain 官方路線｜MRT 站序：BEM 官方路線。搭乘當天請再次核對月台終點、異動及票價。公車查詢無官方資料時會引導 BMTA BUS，不會自行編造公車號碼。</small>`;
container.append(root);
const style=document.createElement('style');style.id='thTransitStyle';
style.textContent=`
#voyageThaiTransit{padding:16px;margin:18px 0;border-radius:20px;background:#f2f8ff;border:1px solid #c6dafa;color:#244062}
#voyageThaiTransit h3{margin:0 0 9px;font-size:18px}
#voyageThaiTransit .th-row{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
#voyageThaiTransit label{flex:1 1 180px;display:grid;gap:6px;font-size:13px;font-weight:700}
#voyageThaiTransit input,#voyageThaiTransit select{width:100%;box-sizing:border-box;background:#fff;border:1px solid #b8cdec;border-radius:10px;padding:11px;font-size:15px;color:#233e61}
#voyageThaiTransit .th-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
#voyageThaiTransit .th-actions button,#voyageThaiTransit .th-actions a{padding:10px 12px;border-radius:12px;font-size:14px;text-decoration:none}
#voyageThaiTransit .th-actions a{background:#fff;border:1px solid #b8cdec;color:#2555a2}
#voyageThaiTransit .th-result{margin-top:14px;padding:14px;border-radius:14px;background:#fff;border:1px solid #dbe6f4;font-size:14px;line-height:1.7}
#voyageThaiTransit .th-result strong{font-size:16px;color:#1d4892}
#voyageThaiTransit .th-note,#voyageThaiTransit .th-attrib{color:#657991;line-height:1.55}
#voyageThaiTransit[hidden]{display:none!important}
`;
document.head.append(style);
const $=id=>document.getElementById(id),mode=$('thMode'),a=$('thStart'),b=$('thEnd'),result=$('thResult'),link=$('thExternal');
function showTrip(){const code=window.VoyageRegionV4?.countryCode?.(U.current?.());root.hidden=code!=='TH'}
function fillStops(){const value=mode.value;const list=$('thStations');list.replaceChildren();if(value==='bus'){a.placeholder='搭車地點／車站';b.placeholder='抵達地點／車站';return}
 a.placeholder='輸入中文、英文或站碼';b.placeholder='輸入中文、英文或站碼';
 for(const [id,en,zh] of data[value].stations){for(const label of [id,en,zh]){const option=document.createElement('option');option.value=label;option.label=en+' · '+id;list.append(option)}}
}
function travelLink(){
 const t=U.current?.();const o=a.value.trim(),d=b.value.trim();
 const start=o+(t?.city?', '+t.city+', Thailand':' Thailand'),end=d+(t?.city?', '+t.city+', Thailand':' Thailand');
 link.href='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(start)+'&destination='+encodeURIComponent(end)+'&travelmode=transit';
}
function textNode(parent,tag,label){const el=document.createElement(tag);el.textContent=label;parent.append(el);return el}
function route(){
 travelLink();result.replaceChildren();
 if(!a.value.trim()||!b.value.trim()){textNode(result,'p','請先填寫出發與目的地。');return}
 const key=mode.value;
 if(key==='bus'){
  textNode(result,'strong','🚌 公車路線必須以當日官方或可驗證資料核對');
  textNode(result,'p','各線公車可能變更站牌、方向與停靠站數；本頁不會憑地名猜公車號碼。請開 Google Maps 大眾運輸，或使用 BMTA BUS 官方 App 查詢路線與即時到站。');
  const source=document.createElement('a');source.href='https://www.thailand.go.th/public/issue-focus-detail/--bmta-bus------';source.target='_blank';source.rel='noopener noreferrer';source.textContent='查看 BMTA BUS 官方介紹與下載方式';result.append(source);
  return;
 }
 const line=data[key],p=line.stations,from=p.findIndex(x=>match(x,a.value.trim())),to=p.findIndex(x=>match(x,b.value.trim()));
 if(from<0||to<0){textNode(result,'p','有站名不在目前已核對的 '+line.title+' 區間內。請輸入完整英文、中文或站碼，或使用 Google Maps 查詢其他線路／轉乘。');return}
 if(from===to){textNode(result,'p','起終點是同一站，無須搭車。');return}
 const forward=to>from,list=forward?p.slice(from,to+1):p.slice(to,from+1).reverse(),headsign=forward?line.towardsEnd:line.towardsStart;
 textNode(result,'strong','🚇 '+line.title);
 textNode(result,'p','從 '+p[from][2]+'（'+p[from][1]+' · '+p[from][0]+'）上車');
 textNode(result,'p','方向：'+headsign+'。看月台方向與列車車頭標示；下一站是 '+list[1][2]+'（'+list[1][1]+'）。');
 textNode(result,'p','搭乘 '+(list.length-1)+' 站，不用換線；在 '+p[to][2]+'（'+p[to][1]+' · '+p[to][0]+'）下車。');
 const listBox=document.createElement('details');const summary=document.createElement('summary');summary.textContent='展開全部 '+list.length+' 個上下車與途經站';listBox.append(summary);
 const ol=document.createElement('ol');list.forEach(x=>textNode(ol,'li',x[0]+' '+x[2]+' · '+x[1]));listBox.append(ol);result.append(listBox);
 const src=document.createElement('a');src.href=line.source;src.target='_blank';src.rel='noopener noreferrer';src.textContent='官方線路站序來源';result.append(src);
}
$('thFind').onclick=route;mode.onchange=()=>{fillStops();result.textContent='請輸入這條線的出發及目的地站名。'};
[a,b].forEach(x=>x.addEventListener('change',travelLink));
document.addEventListener('voyage-trip-changed',showTrip);
const prior=render;render=function(){prior();showTrip()};
fillStops();showTrip();travelLink();
window.VoyageThailandTransit={data,route};
})();
