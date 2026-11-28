/* Bangkok operational rail station network, 2026-11-28. No planned/unopened stops.
   BTS Green network: 47 Sukhumvit + 14 Silom, Siam shared; Gold 3 stops.
   Thai station names per network maps; Traditional Chinese labels are practical translations, not official signage.
   Sources: https://www.bts.co.th/eng/library/system-structuer.html
   https://www.bts.co.th/routemap.html
   https://www.bts.co.th/eng/traintime-frequency/?Line=gold
   https://metro.bemplc.co.th/MRT-System-Map?lang=en
   https://metro.bemplc.co.th/Fare-Calculation?lang=en
   https://www.ebm.co.th/th/areamap/
   https://nbm.co.th/en/traintime-frequency/
   https://www.mrta.co.th/en/pink-line-extension-si-rat---muang-thong-thani
   https://www.srtet.co.th/en/route-information
   https://thailand.go.th/public/useful-information-detail/001_01_107-2
   Route costs are heuristic, not travel-time or live-service estimates. */
(()=>{"use strict";
const parse=s=>s.trim().split("\n").map(x=>{const [id,en,th,zh,aliases=""]=x.split("|");return{id,en,th,zh,aliases:aliases.split(",").filter(Boolean)}});
const lines={
suk:{title:"BTS 淺綠線 · Sukhumvit",color:"#83bd39",stations:parse(`
N24|Khu Khot|คูคต|庫科特|庫口
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
N5|Ari|อารีย์|阿里|阿黎,阿梨
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
E7|Ekkamai|เอกมัย|億甲邁|艾卡邁,伊卡邁
E8|Phra Khanong|พระโขนง|拍崑崙
E9|On Nut|อ่อนนุช|安努|翁努,Onnut
E10|Bang Chak|บางจาก|邦扎克
E11|Punnawithi|ปุณณวิถี|普納威提
E12|Udom Suk|อุดมสุข|烏東素
E13|Bang Na|บางนา|邦納
E14|Bearing|แบริ่ง|貝林
E15|Samrong|สำโรง|三榕|三隆
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
,blue:{title:"MRT 藍線 · Blue Line",color:"#1763a8",stations:parse(`
BL01|Tha Phra|ท่าพระ|塔帕|塔帕站,塔帕
BL02|Charan 13|จรัญฯ 13|查蘭13街
BL03|Fai Chai|ไฟฉาย|發猜
BL04|Bang Khun Non|บางขุนนนท์|曼坤農
BL05|Bang Yi Khan|บางยี่ขัน|曼吉康
BL06|Sirindhorn|สิรินธร|詩琳通
BL07|Bang Phlat|บางพลัด|曼帕
BL08|Bang O|บางอ้อ|曼奧
BL09|Bang Pho|บางโพ|曼坡
BL10|Tao Poon|เตาปูน|島本|陶汶,道本
BL11|Bang Sue|บางซื่อ|邦蘇|曼蘇
BL12|Kamphaeng Phet|กำแพงเพชร|甘烹碧|甘烹佩
BL13|Chatuchak Park|สวนจตุจักร|恰圖恰公園|乍都乍公園,洽圖洽公園
BL14|Phahon Yothin|พหลโยธิน|帕宏悠廷|帕鳳裕庭
BL15|Lat Phrao|ลาดพร้าว|拉拋|叻拋,Lad Phrao
BL16|Ratchadaphisek|รัชดาภิเษก|拉差達披色
BL17|Sutthisan|สุทธิสาร|素堤訕
BL18|Huai Khwang|ห้วยขวาง|匯狂|惠恭
BL19|Thailand Cultural Centre|ศูนย์วัฒนธรรมแห่งประเทศไทย|泰國文化中心|Thailand Cultural Center
BL20|Phra Ram 9|พระราม 9|拉瑪九|拉瑪9,Rama 9
BL21|Phetchaburi|เพชรบุรี|碧武里
BL22|Sukhumvit|สุขุมวิท|素坤逸|素坤威,蘇坤蔚
BL23|Queen Sirikit National Convention Centre|ศูนย์การประชุมแห่งชาติสิริกิติ์|詩麗吉王后會議中心|詩麗吉皇后會議中心,QSNCC
BL24|Khlong Toei|คลองเตย|孔堤
BL25|Lumphini|ลุมพินี|倫披尼|隆比尼,Lumpini
BL26|Si Lom|สีลม|是隆|席隆,Silom
BL27|Sam Yan|สามย่าน|三燕|三養,三养,三央,三陽,Samyan
BL28|Hua Lamphong|หัวลำโพง|華南蓬|華藍蓬
BL29|Wat Mangkon|วัดมังกร|龍蓮寺|龍蓮寺站,唐人街
BL30|Sam Yot|สามยอด|三峰|三ยอด,三座
BL31|Sanam Chai|สนามไชย|沙南猜|沙南柴
BL32|Itsaraphap|อิสรภาพ|伊薩拉帕
BL01|Tha Phra|ท่าพระ|塔帕|塔帕站
BL33|Bang Phai|บางไผ่|曼派
BL34|Bang Wa|บางหว้า|邦瓦|帕瓦
BL35|Phetkasem 48|เพชรเกษม 48|碧甲盛48
BL36|Phasi Charoen|ภาษีเจริญ|帕西乍能
BL37|Bang Khae|บางแค|曼開
BL38|Lak Song|หลักสอง|叻松|朗二
`)},
purple:{title:"MRT 紫線 · Purple Line",color:"#8948a8",stations:parse(`
PP01|Khlong Bang Phai|คลองบางไผ่|空曼派|Klong Bang Phai
PP02|Talad Bang Yai|ตลาดบางใหญ่|曼艾市場|Talat Bang Yai
PP03|Sam Yaek Bang Yai|สามแยกบางใหญ่|邦艾三岔口
PP04|Bang Phlu|บางพลู|曼普
PP05|Bang Rak Yai|บางรักใหญ่|大叻
PP06|Bang Rak Noi Tha It|บางรักน้อยท่าอิฐ|小叻
PP07|Sai Ma|ไทรม้า|賽馬
PP08|Phra Nang Klao Bridge|สะพานพระนั่งเกล้า|帕南告大橋
PP09|Yaek Nonthaburi 1|แยกนนทบุรี 1|暖武里1路口
PP10|Bang Krasor|บางกระสอ|曼克拉梭
PP11|Nonthaburi Civic Center|ศูนย์ราชการนนทบุรี|暖武里行政中心|Nonthaburi Civic Centre
PP12|Ministry of Public Health|กระทรวงสาธารณสุข|公共衛生部
PP13|Yaek Tiwanon|แยกติวานนท์|提瓦農路口
PP14|Wong Sawang|วงศ์สว่าง|翁沙旺
PP15|Bang Son|บางซ่อน|邦頌|曼頌
PP16|Tao Poon|เตาปูน|島本|Taopoon,陶汶
`)},
yellow:{title:"MRT 黃線 · Yellow Line",color:"#d8ab18",stations:parse(`
YL01|Lat Phrao|ลาดพร้าว|拉拋|叻拋
YL02|Phawana|ภาวนา|帕瓦那
YL03|Chok Chai 4|โชคชัย 4|初猜四
YL04|Lat Phrao 71|ลาดพร้าว 71|拉拋71
YL05|Lat Phrao 83|ลาดพร้าว 83|拉拋83
YL06|Mahat Thai|มหาดไทย|瑪哈泰|Mahatthai
YL07|Lat Phrao 101|ลาดพร้าว 101|拉拋101
YL08|Bang Kapi|บางกะปิ|邦卡皮
YL09|Yaek Lam Sali|แยกลำสาลี|藍沙利路口
YL10|Si Kritha|ศรีกรีฑา|斯克里塔
YL11|Hua Mak|หัวหมาก|華麥|華瑪
YL12|Kalantan|กลันตัน|吉蘭丹
YL13|Si Nut|ศรีนุช|斯努
YL14|Srinagarindra 38|ศรีนครินทร์ 38|詩納卡琳38
YL15|Suan Luang Rama IX|สวนหลวง ร.9|拉瑪九世國王公園
YL16|Si Udom|ศรีอุดม|斯烏東
YL17|Si Iam|ศรีเอี่ยม|斯伊安
YL18|Si La Salle|ศรีลาซาล|斯拉薩
YL19|Si Bearing|ศรีแบริ่ง|斯貝林
YL20|Si Dan|ศรีด่าน|斯丹
YL21|Si Thepha|ศรีเทพา|斯提帕
YL22|Thipphawan|ทิพวัล|提帕灣
YL23|Samrong|สำโรง|三榕|三隆
`)},
pink:{title:"MRT 粉紅線 · Pink Line",color:"#db6eab",stations:parse(`
PK01|Nonthaburi Civic Center|ศูนย์ราชการนนทบุรี|暖武里行政中心|Nonthaburi Civic Centre
PK02|Khae Rai|แคราย|開萊
PK03|Sanambin Nam|สนามบินน้ำ|沙南賓南
PK04|Samakkhi|สามัคคี|沙瑪奇
PK05|Royal Irrigation Department|กรมชลประทาน|皇家灌溉局
PK06|Yaek Pak Kret|แยกปากเกร็ด|北革路口
PK07|Pak Kret Bypass|เลี่ยงเมืองปากเกร็ด|北革外環
PK08|Chaeng Watthana-Pak Kret 28|แจ้งวัฒนะ-ปากเกร็ด 28|政哇他那北革28
PK09|Si Rat|ศรีรัช|斯叻
PK10|Muang Thong Thani|เมืองทองธานี|蒙通他尼|Mueang Thong Thani
PK11|Chaeng Watthana 14|แจ้งวัฒนะ 14|政哇他那14
PK12|Government Complex|ศูนย์ราชการเฉลิมพระเกียรติ|政府行政中心
PK13|National Telecom|โทรคมนาคมแห่งชาติ|國家電信
PK14|Lak Si|หลักสี่|叻四
PK15|Rajabhat Phranakhon|ราชภัฏพระนคร|帕那空皇家大學
PK16|Wat Phra Sri Mahathat|วัดพระศรีมหาธาตุ|帕斯里瑪哈泰寺
PK17|Ram Inthra 3|รามอินทรา 3|拉因特拉3
PK18|Lat Pla Khao|ลาดปลาเค้า|叻巴考
PK19|Ram Inthra Kor Mor 4|รามอินทรา กม.4|拉因特拉4公里
PK20|Maiyalap|มัยลาภ|麥亞拉
PK21|Vacharaphol|วัชรพล|瓦查蓬
PK22|Ram Inthra Kor Mor 6|รามอินทรา กม.6|拉因特拉6公里
PK23|Khu Bon|คู้บอน|庫邦
PK24|Ram Inthra Kor Mor 9|รามอินทรา กม.9|拉因特拉9公里
PK25|Outer Ring Road-Ram Inthra|วงแหวนรามอินทรา|拉因特拉外環
PK26|Nopparat|นพรัตน์|諾帕叻
PK27|Bang Chan|บางชัน|邦詹
PK28|Setthabutbamphen|เศรษฐบุตรบำเพ็ญ|塞他布
PK29|Min Buri Market|ตลาดมีนบุรี|民武里市場
PK30|Min Buri|มีนบุรี|民武里
`)},
pinkbranch:{title:"MRT 粉紅線 · 蒙通他尼支線",color:"#db6eab",stations:parse(`
PK10|Muang Thong Thani|เมืองทองธานี|蒙通他尼|Mueang Thong Thani
MT01|Impact Muang Thong Thani|อิมแพ็ค เมืองทองธานี|IMPACT 展覽中心
MT02|Lake Muang Thong Thani|ทะเลสาบเมืองทองธานี|蒙通他尼湖
`)},
rednorth:{title:"SRT 深紅線 · Dark Red",color:"#a52b36",stations:parse(`
RN01|Krung Thep Aphiwat|กรุงเทพอภิวัฒน์|曼谷中央車站|Bang Sue Grand Station,阿披瓦中央車站
RN02|Chatuchak|จตุจักร|恰圖恰|乍都乍
RN03|Wat Samian Nari|วัดเสมียนนารี|沙棉娜麗寺
RN04|Bang Khen|บางเขน|曼坎
RN05|Thung Song Hong|ทุ่งสองห้อง|特松紅
RN06|Lak Si|หลักสี่|叻四|拉四
RN07|Kan Kheha|การเคหะ|房屋管理局|Housing
RN08|Don Mueang|ดอนเมือง|廊曼|廊曼機場,Don Muang,DMK
RN09|Lak Hok|หลักหก|叻六
RN10|Rangsit|รังสิต|蘭實
`)},
redwest:{title:"SRT 淺紅線 · Light Red",color:"#e76d75",stations:parse(`
RW01|Krung Thep Aphiwat|กรุงเทพอภิวัฒน์|曼谷中央車站|Bang Sue Grand Station
RW02|Bang Son|บางซ่อน|邦頌
RW05|Bang Bamru|บางบำหรุ|曼邦魯|Bang Bumru
RW06|Taling Chan|ตลิ่งชัน|大林江|塔林昌
`)},
arl:{title:"ARL 機場快線 · Airport Rail Link",color:"#b24452",stations:parse(`
A1|Suvarnabhumi|สุวรรณภูมิ|素萬那普機場|蘇凡納布,蘇汪納蓬,BKK,Suvarnabhumi Airport
A2|Lat Krabang|ลาดกระบัง|拉甲邦
A3|Ban Thap Chang|บ้านทับช้าง|班塔昌
A4|Hua Mak|หัวหมาก|華麥|華瑪
A5|Ramkhamhaeng|รามคำแหง|蘭甘亨
A6|Makkasan|มักกะสัน|馬卡桑
A7|Ratchaprarop|ราชปรารภ|拉差巴洛
A8|Phaya Thai|พญาไท|帕亞泰|披耶泰
`)}

};
const norm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/^(bts|mrt)\s*/,"").replace(/(station|站)$/,"").replace(/[\s.·・\-／/()（）]/g,"");
const all=Object.entries(lines).flatMap(([line,l])=>l.stations.map((s,index)=>({...s,line,index,key:line+":"+index})));
const unique=[...new Map(all.map(s=>[s.id,s])).values()];
const terms=s=>[s.id,s.en,s.th,s.zh,...s.aliases];
const codeNorm=s=>norm(s).replace(/^([a-z]+)0+(\d+)$/,"$1$2");
function candidates(q){const v=norm(q);if(!v)return unique;const exact=unique.filter(s=>terms(s).some(x=>norm(x)===v)||codeNorm(s.id)===codeNorm(v));if(exact.length)return exact;const prefix=unique.filter(s=>norm(s.id).startsWith(v));if(/^[a-z]{1,3}\d*$/.test(v)&&prefix.length)return prefix;const rest=unique.filter(s=>!prefix.includes(s)&&terms(s).some(x=>norm(x).includes(v)));return [...prefix,...rest]}
function resolve(q){const exact=unique.filter(s=>terms(s).some(x=>norm(x)===norm(q))||codeNorm(s.id)===codeNorm(q));if(exact.length)return exact.length===1?exact:[];const found=candidates(q);return found.length===1?found:[]}
const links=new Set(["G1,S7","BL13,N8","BL14,N9","BL22,E4","BL26,S2","BL34,S12","BL10,PP16","PP11,PK01","PP15,RW02","BL15,YL01","E15,YL23","A4,YL11","N17,PK16","PK14,RN06","A6,BL21","A8,N2","BL11,RN01","BL11,RW01","RN01,RW01"].map(x=>x.split(",").sort().join(",")));
const adjacency=new Map(all.map(s=>[s.key,[]]));const byKey=new Map(all.map(s=>[s.key,s]));for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];let cost=Infinity,change=false;if(a.line===b.line&&Math.abs(a.index-b.index)===1)cost=1;else if(a.id===b.id||links.has([a.id,b.id].sort().join(","))){cost=5;change=true}if(Number.isFinite(cost)){adjacency.get(a.key).push({key:b.key,cost,change});adjacency.get(b.key).push({key:a.key,cost,change})}}
function route(a,b){const starts=resolve(a),ends=resolve(b);if(!starts.length||!ends.length)return null;const startIds=new Set(starts.map(s=>s.id)),endIds=new Set(ends.map(s=>s.id));const dist=new Map(),prev=new Map(),todo=new Set(all.map(s=>s.key));for(const s of all)if(startIds.has(s.id))dist.set(s.key,0);let end=null;while(todo.size){let k=null,min=Infinity;for(const x of todo){const d=dist.get(x)??Infinity;if(d<min){min=d;k=x}}if(k===null)break;todo.delete(k);const u=byKey.get(k);if(endIds.has(u.id)){end=k;break}for(const v of adjacency.get(k)){if(todo.has(v.key)&&min+v.cost<(dist.get(v.key)??Infinity)){dist.set(v.key,min+v.cost);prev.set(v.key,{key:k,change:v.change})}}}if(!end)return null;const seq=[];for(let k=end;k;k=prev.get(k)?.key)seq.unshift({s:byKey.get(k),change:prev.get(k)?.change});const legs=[];for(const {s,change} of seq){const last=legs.at(-1);if(!last||change||last.line!==s.line)legs.push({line:s.line,stations:[s]});else last.stations.push(s)}for(const leg of legs){const f=leg.stations[0],l=leg.stations.at(-1);leg.count=leg.stations.length-1;leg.direction=lines[leg.line].stations[l.index>f.index?lines[leg.line].stations.length-1:0]}return{legs,stops:legs.reduce((n,l)=>n+l.count,0),transfers:legs.length-1}}
window.VoyageBTSNetwork={lines,unique,candidates,resolve,route};
})();