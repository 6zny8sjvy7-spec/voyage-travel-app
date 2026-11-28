/* BTS Green network: BTS official 47 Sukhumvit + 14 Silom, Siam shared; Gold 3 stops.
   Thai station names per network maps; Traditional Chinese labels are practical translations, not official signage.
   Sources: https://www.bts.co.th/eng/library/system-structuer.html
   https://www.bts.co.th/routemap.html
   https://www.bts.co.th/eng/traintime-frequency/?Line=gold */
(()=>{"use strict";
const parse=s=>s.trim().split("\n").map(x=>{const [id,en,th,zh,aliases=""]=x.split("|");return{id,en,th,zh,aliases:aliases.split(",").filter(Boolean)}});
const lines={
suk:{title:"BTS 淺綠線 · Sukhumvit",color:"#83bd39",stations:parse(`
N24|Khu Khot|คูคต|庫科特
N23|Yaek Kor Por Aor|แยก คปอ.|空軍交叉口
N22|Royal Thai Air Force Museum|พิพิธภัณฑ์กองทัพอากาศ|皇家空軍博物館
N21|Bhumibol Adulyadej Hospital|โรงพยาบาลภูมิพลอดุลยเดช|普密蓬醫院
N20|Saphan Mai|สะพานใหม่|新橋
N19|Sai Yud|สายหยุด|賽育
N18|Phahon Yothin 59|พหลโยธิน 59|帕宏悠廷59
N17|Wat Phra Sri Mahathat|วัดพระศรีมหาธาตุ|帕斯里瑪哈泰寺
N16|11th Infantry Regiment|กรมทหารราบที่ 11|第11步兵團
N15|Bang Bua|บางบัว|邦布阿
N14|Royal Forest Department|กรมป่าไม้|皇家林業局
N13|Kasetsart University|มหาวิทยาลัยเกษตรศาสตร์|農業大學|泰國農業大學
N12|Sena Nikhom|เสนานิคม|塞納尼空
N11|Ratchayothin|รัชโยธิน|拉差約廷
N10|Phahon Yothin 24|พหลโยธิน 24|帕宏悠廷24
N9|Ha Yaek Lat Phrao|ห้าแยกลาดพร้าว|拉拋五岔路口
N8|Mo Chit|หมอชิต|莫奇|蒙奇,恰圖恰
N7|Saphan Khwai|สะพานควาย|水牛橋
N5|Ari|อารีย์|阿里|阿黎
N4|Sanam Pao|สนามเป้า|沙南拋
N3|Victory Monument|อนุสาวรีย์ชัยสมรภูมิ|勝利紀念碑
N2|Phaya Thai|พญาไท|帕亞泰|披耶泰
N1|Ratchathewi|ราชเทวี|拉差貼威
CEN|Siam|สยาม|暹羅|暹罗,暹邏
E1|Chit Lom|ชิดลม|奇隆|七隆,Chidlom
E2|Phloen Chit|เพลินจิต|奔集|菲隆奇,Phloenchit
E3|Nana|นานา|娜娜
E4|Asok|อโศก|阿索克|阿速,Asoke
E5|Phrom Phong|พร้อมพงษ์|澎蓬|鵬蓬,Phromphong
E6|Thong Lo|ทองหล่อ|通羅|通羅站,Thonglor
E7|Ekkamai|เอกมัย|億甲邁|艾卡邁
E8|Phra Khanong|พระโขนง|拍崑崙
E9|On Nut|อ่อนนุช|安努|翁努,Onnut
E10|Bang Chak|บางจาก|邦扎克
E11|Punnawithi|ปุณณวิถี|普納威提
E12|Udom Suk|อุดมสุข|烏東素
E13|Bang Na|บางนา|邦納
E14|Bearing|แบริ่ง|貝林
E15|Samrong|สำโรง|三榕
E16|Pu Chao|ปู่เจ้า|普昭
E17|Chang Erawan|ช้างเอราวัณ|三頭象
E18|Royal Thai Naval Academy|โรงเรียนนายเรือ|皇家海軍學院
E19|Pak Nam|ปากน้ำ|北欖
E20|Srinagarindra|ศรีนครินทร์|詩納卡琳
E21|Phraek Sa|แพรกษา|帕叻沙
E22|Sai Luat|สายลวด|賽洛
E23|Kheha|เคหะฯ|克哈|Kheha Samut Prakan,เคหะ
`)},
sil:{title:"BTS 深綠線 · Silom",color:"#187a54",stations:parse(`
W1|National Stadium|สนามกีฬาแห่งชาติ|國家體育館|國家運動場
CEN|Siam|สยาม|暹羅|暹罗,暹邏
S1|Ratchadamri|ราชดำริ|拉差丹利
S2|Sala Daeng|ศาลาแดง|沙拉當|沙拉鈴
S3|Chong Nonsi|ช่องนนทรี|衝暖詩
S4|Saint Louis|เซนต์หลุยส์|聖路易|St Louis
S5|Surasak|สุรศักดิ์|蘇拉沙
S6|Saphan Taksin|สะพานตากสิน|沙潘塔克辛|鄭王橋
S7|Krung Thon Buri|กรุงธนบุรี|吞武里|Krungthonburi
S8|Wongwian Yai|วงเวียนใหญ่|大羅圈
S9|Pho Nimit|โพธิ์นิมิตร|波尼密
S10|Talat Phlu|ตลาดพลู|達叻普
S11|Wutthakat|วุฒากาศ|武他卡
S12|Bang Wa|บางหว้า|邦瓦
`)},
gold:{title:"金線 · Gold Line",color:"#bf8d27",stations:parse(`
G1|Krung Thon Buri|กรุงธนบุรี|吞武里
G2|Charoen Nakhon|เจริญนคร|乍倫納空|ICONSIAM,暹羅天地
G3|Khlong San|คลองสาน|空訕
`)}
};
const norm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/^(bts|mrt)\s*/,"").replace(/(station|站)$/,"").replace(/[\s.·・\-／/()（）]/g,"");
const all=Object.entries(lines).flatMap(([line,l])=>l.stations.map((s,index)=>({...s,line,index,key:line+":"+s.id})));
const unique=[...new Map(all.map(s=>[s.id,s])).values()];
const terms=s=>[s.id,s.en,s.th,s.zh,...s.aliases];
function candidates(q){const v=norm(q);if(!v)return unique;const exact=unique.filter(s=>terms(s).some(x=>norm(x)===v));return exact.length?exact:unique.filter(s=>terms(s).some(x=>norm(x).includes(v)))}
function resolve(q){const exact=unique.filter(s=>terms(s).some(x=>norm(x)===norm(q)));return exact.length?exact:candidates(q).length===1?candidates(q):[]}
function transfer(a,b){return a.line!==b.line&&(a.id==="CEN"&&b.id==="CEN"||[a.id,b.id].sort().join(",")==="G1,S7")}
function route(a,b){const starts=resolve(a),ends=resolve(b);if(!starts.length||!ends.length)return null;const startIds=new Set(starts.map(s=>s.id)),endIds=new Set(ends.map(s=>s.id));const dist=new Map(),prev=new Map(),todo=new Set(all.map(s=>s.key));const byKey=new Map(all.map(s=>[s.key,s]));for(const s of all)if(startIds.has(s.id))dist.set(s.key,0);let end=null;while(todo.size){let k=null,min=Infinity;for(const x of todo){const d=dist.get(x)??Infinity;if(d<min){min=d;k=x}}if(k===null)break;todo.delete(k);const u=byKey.get(k);if(endIds.has(u.id)){end=k;break}for(const v of all){if(!todo.has(v.key))continue;const cost=u.line===v.line&&Math.abs(u.index-v.index)===1?1:transfer(u,v)?5:Infinity;if(min+cost<(dist.get(v.key)??Infinity)){dist.set(v.key,min+cost);prev.set(v.key,k)}}}if(!end)return null;const seq=[];for(let k=end;k;k=prev.get(k))seq.unshift(byKey.get(k));const legs=[];for(const s of seq){const last=legs.at(-1);if(!last||last.line!==s.line)legs.push({line:s.line,stations:[s]});else last.stations.push(s)}for(const leg of legs){const f=leg.stations[0],l=leg.stations.at(-1);leg.count=leg.stations.length-1;leg.direction=lines[leg.line].stations[l.index>f.index?lines[leg.line].stations.length-1:0]}return{legs,stops:legs.reduce((n,l)=>n+l.count,0),transfers:legs.length-1}}
window.VoyageBTSNetwork={lines,unique,candidates,resolve,route};
})();