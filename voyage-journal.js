/* VOYAGE travel diary, daily notes and shopping wishlist; stored with each trip */
(function(){
"use strict";
const U=window.VoyageUI;if(!U)return;
const {E,$v,D,button,field,get,openDialog,toast,current,pages}=U;
function ensure(t){if(!Array.isArray(t.journal))t.journal=[];if(!Array.isArray(t.wishlist))t.wishlist=[]}
function journalEditor(){const t=current();ensure(t);openDialog("新增旅行回憶",[
field("vDiaryDay","第幾天（1–"+t.days.length+"）","number",day+1,{min:1}),field("vDiaryTitle","標題","text",""),
field("vDiaryBody","回憶內容","textarea","",{full:true}),field("vDiaryURL","照片或紀錄的 HTTPS 連結（選填）","url","",{full:true})
],()=>{const d=Number(get("vDiaryDay"))-1,title=get("vDiaryTitle"),url=get("vDiaryURL");if(!Number.isInteger(d)||d<0||d>=t.days.length||!title)throw Error("請填入合法天數及標題");if(url&&!/^https:\/\//i.test(url))throw Error("僅允許 HTTPS 照片或紀錄連結");t.journal.push({id:D.uid(),day:d,title,body:get("vDiaryBody").slice(0,20000),url,createdAt:new Date().toISOString()});return true})}
pages.diary=box=>{const t=current();ensure(t);box.append(E("div",{class:"v1-notice",text:"旅行回憶隨旅行 JSON 備份。可記錄文字與外部 HTTPS 照片連結；尚不支援照片檔案儲存、上傳或封存，外部連結失效時照片可能無法開啟。"}),E("div",{class:"v1-actions"},[button("＋ 新增旅行回憶",journalEditor,"primary")]));
for(const note of t.journal.slice().reverse()){const row=E("div",{class:"v1-item"}),main=E("div",{class:"v1-item-main"});main.append(E("b",{text:"DAY "+(note.day+1)+" · "+note.title}),E("p",{class:"v1-sub",text:note.body||""}),E("div",{class:"v1-sub",text:"記錄於 "+(note.createdAt||"未知時間")}));if(/^https:\/\//i.test(note.url||""))main.append(E("a",{href:note.url,target:"_blank",rel:"noopener noreferrer",text:"開啟照片／紀錄"}));row.append(main,button("刪除",()=>{if(confirm("確定刪除這則回憶？")){t.journal=t.journal.filter(x=>x.id!==note.id);save();render()}},"ghost"));box.append(row)}};
function wishEditor(){const t=current();ensure(t);openDialog("新增購物願望",[
field("vWishTitle","商品／想逛店家","text",""),field("vWishCategory","分類","select","shopping",{options:[["shopping","購物"],["food","伴手禮／食物"],["activity","體驗"],["other","其他"]]}),
field("vWishCost","預估費用（旅行幣別）","number","0",{min:0,step:"0.01"}),field("vWishNotes","位置、尺寸、價格或注意事項","textarea","",{full:true}),
field("vWishURL","參考連結（HTTPS）","url","",{full:true})
],()=>{const name=get("vWishTitle"),url=get("vWishURL"),cost=D.amount(get("vWishCost"));if(!name||cost===null)throw Error("請輸入名稱與有效預算");if(url&&!/^https:\/\//i.test(url))throw Error("連結只接受 HTTPS");t.wishlist.push({id:D.uid(),name,category:get("vWishCategory"),cost,notes:get("vWishNotes"),url,bought:false});return true})}
pages.wishlist=box=>{const t=current();ensure(t);box.append(E("div",{class:"v1-notice",text:"購物願望清單與旅行資料一起備份。勾選已購買不會自動記帳；確認實際花費後可使用右下角「＋ 記帳」。"}),E("div",{class:"v1-actions"},[button("＋ 新增購物願望",wishEditor,"primary")]));
for(const x of t.wishlist){const row=E("div",{class:"v1-item"}),check=E("input",{type:"checkbox",class:"v1-check"}),main=E("div",{class:"v1-item-main"});check.checked=!!x.bought;check.onchange=()=>{x.bought=check.checked;save();U.renderMore()};main.append(E("b",{class:x.bought?"v1-struck":"",text:x.name}),E("div",{class:"v1-sub",text:(x.cost?D.money(x.cost,t.currency||"TWD")+" · ":"")+(x.notes||"")}));if(/^https:\/\//i.test(x.url||""))main.append(E("a",{href:x.url,target:"_blank",rel:"noopener noreferrer",text:"參考連結"}));row.append(check,main,button("移除",()=>{if(confirm("確定移除這筆願望？")){t.wishlist=t.wishlist.filter(a=>a.id!==x.id);save();render()}},"ghost"));box.append(row)}};
const old=U.renderMore;U.renderMore=function(){old();const menu=$v("v1Menu");if(menu){menu.append(button("旅行日記",()=>{U.showPage("diary")},"secondary"),button("購物清單",()=>{U.showPage("wishlist")},"secondary"));for(const b of menu.children){if(b.textContent==="旅行日記"&&pageName()==="diary"||b.textContent==="購物清單"&&pageName()==="wishlist")b.className="active"}}};
function pageName(){return document.getElementById("v1Content")?.querySelector("[data-page]")?.dataset.page||""}
pages.diaryBase=pages.diary;pages.wishlistBase=pages.wishlist;
const diaryRender=pages.diary,wishRender=pages.wishlist;pages.diary=box=>{box.dataset.page="diary";diaryRender(box)};pages.wishlist=box=>{box.dataset.page="wishlist";wishRender(box)};
U.renderMore();
})();
