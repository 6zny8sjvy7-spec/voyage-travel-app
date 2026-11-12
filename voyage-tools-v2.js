/* VOYAGE V2 useful packing presets, visible live-fetch FX reference and friend-first collaboration. */
(function(){
"use strict";
const U=window.VoyageUI,D=window.VoyageDomain;if(!U||!D)return;
const E=U.E,button=U.button,pages=U.pages,toast=U.toast,current=U.current;
const catalogue={
"證件與付款":["護照","身分證","簽證／電子簽證確認","入境申報資料","機票／登機證","住宿確認單","旅遊保險證明","國際駕照","駕照","現金（目的地幣別）","信用卡","提款卡","交通卡／T-money","交通／活動電子票券"],
"電子與攝影":["手機","充電線","充電頭","行動電源（隨身不可託運）","旅行轉接插頭","萬用插座","耳機","智慧手錶與充電器","相機","相機電池","記憶卡","自拍棒","藍牙快門","平板／筆電","隨身 Wi-Fi／eSIM"],
"衣物與穿搭":["上衣","外套","長褲","短褲／裙子","內衣褲","襪子","睡衣","發熱衣","雨衣","帽子","太陽眼鏡","舒適好走的鞋","拖鞋","泳衣","皮帶","飾品","洗衣袋"],
"盥洗與保養":["牙刷","牙膏","牙線","洗面乳","卸妝用品","保濕乳液","防曬乳","化妝品","梳子","髮圈","護唇膏","隱形眼鏡","眼鏡／眼鏡盒","生理用品","衛生紙","酒精乾洗手","口罩","刮鬍刀"],
"健康與急用":["個人處方藥","處方箋／英文藥袋","常備藥","暈車藥","腸胃藥","OK 繃","防蚊用品","保暖貼","水壺","摺疊雨傘","小急救包"],
"旅途與購物":["行李箱","行李吊牌","行李鎖","折疊購物袋","隨身小包","頸枕","耳塞","眼罩","濕紙巾","夾鏈袋","收納袋","密封袋","洗衣袋","旅遊攻略／離線地圖","緊急聯絡資訊"]
};
let category=Object.keys(catalogue)[0];
const oldPacking=pages.packing;
pages.packing=box=>{
const t=current();oldPacking(box);
const lib=E("section",{class:"v1-box",id:"v2PackingLibrary"});
lib.append(E("h3",{text:"🧳 行李準備清單庫（依類別挑選）"}),E("p",{class:"v1-sub",text:"挑選需要的項目才加入；不會一次塞滿清單，已新增的物品不會重複加入。"}));
const controls=E("div",{class:"v1-fields"}),select=E("select",{id:"v2PackCategory"});
for(const name of Object.keys(catalogue))select.append(E("option",{value:name,text:name+" · "+catalogue[name].length+" 項"}));
select.value=category;
controls.append(E("label",{},[E("span",{text:"選擇分類"}),select]));
const search=E("input",{id:"v2PackSearch",type:"search",placeholder:"搜尋物品，例如：護照、行動電源、充電"});
controls.append(E("label",{},[E("span",{text:"快速搜尋"}),search]));lib.append(controls);
const list=E("div",{id:"v2PackChoices",class:"v1-stack"}),add=button("加入勾選的物品",()=>{},"primary");lib.append(list,E("div",{class:"v1-actions"},[add]));
function draw(){list.replaceChildren();const term=search.value.trim(),names=term?Object.values(catalogue).flat().filter(x=>x.includes(term)):catalogue[select.value]||[];const existing=new Set(t.packing.map(p=>p.name));for(const name of [...new Set(names)]){const label=E("label",{class:"v1-item"}),input=E("input",{type:"checkbox",class:"v1-check"});input.value=name;input.disabled=existing.has(name);label.append(input,E("span",{text:name+(existing.has(name)?"（已加入）":"")}));list.append(label)}if(!names.length)list.append(E("p",{class:"v1-sub",text:"沒有符合的項目，可以使用上方『＋ 新增物品』自訂。"}))}
add.onclick=()=>{const names=[...list.querySelectorAll('input:checked')].map(n=>n.value);if(!names.length){toast("請先勾選要加入的物品");return}const existing=new Set(t.packing.map(x=>x.name));let added=0;for(const name of names){if(existing.has(name))continue;t.packing.push({id:D.uid(),name,owner:t.people[0],type:"personal",checkedBy:{}});existing.add(name);added++}save();render();toast("已加入 "+added+" 項物品")};
select.onchange=()=>{category=select.value;draw()};
search.oninput=draw;draw();
box.replaceChildren(lib,...Array.from(box.children));
};
const oldExpenses=pages.expenses;
pages.expenses=box=>{
const t=current();oldExpenses(box);
const area=E("section",{class:"v1-box",id:"v2FXConverter"});area.append(E("h3",{text:"💱 最新公開參考匯率／換算"}),E("p",{class:"v1-sub",text:"打開功能時向 Frankfurter 查詢最新已公布的參考匯率（非即時外匯成交價，刷卡匯率及手續費可能不同）。"}));
const row=E("div",{class:"v1-fields"}),amount=E("input",{type:"number",min:"0",step:"0.01",value:"1000",id:"v2FXAmount"}),cur=E("select",{id:"v2FXCurrency"}),out=E("div",{class:"v1-notice",id:"v2FXResult",text:"尚未取得匯率"});
for(const id of ["KRW","JPY","TWD","USD","EUR","THB","SGD","HKD","GBP","VND"])cur.append(E("option",{value:id,text:id}));
cur.value=t.currency||"TWD";if(cur.value!==t.currency)cur.value="TWD";
row.append(E("label",{},[E("span",{text:"金額"}),amount]),E("label",{},[E("span",{text:"原始幣別"}),cur]));
area.append(row,out);
let rate=null,atDate="";
const update=()=>{if(rate===null){out.textContent="尚未取得最新參考匯率";return}const n=Number(amount.value);out.textContent="1 "+cur.value+" ≈ "+rate.toFixed(6)+" TWD；"+(Number.isFinite(n)?n+" "+cur.value+" ≈ "+D.money(n*rate,"TWD"):"請填數量")+"\n資料日："+atDate+"；來源：Frankfurter（非即時成交匯價）"};
const refresh=async()=>{rate=null;if(cur.value==="TWD"){rate=1;atDate=new Date().toISOString().slice(0,10);update();return}out.textContent="正在取得公開參考匯率…";try{const res=await fetch("https://api.frankfurter.dev/v2/rate/"+encodeURIComponent(cur.value)+"/TWD",{credentials:"omit"});if(!res.ok)throw Error("HTTP "+res.status);const data=await res.json();if(!Number.isFinite(Number(data.rate))||Number(data.rate)<=0)throw Error("沒有有效匯率");rate=Number(data.rate);atDate=data.date||"資料日未提供";update()}catch(e){out.textContent="目前無法取得參考匯率："+e.message+"。可在新增費用時手動填寫，不會使用假匯率。"}};
cur.onchange=refresh;amount.oninput=update;
area.append(E("div",{class:"v1-actions"},[button("↻ 重新取得最新參考匯率",refresh),E("a",{href:"https://frankfurter.dev/zh-tw/",target:"_blank",rel:"noopener noreferrer",text:"查看匯率服務來源"})]));
box.replaceChildren(area,...Array.from(box.children));refresh();
};
const oldCollab=pages.collab;
pages.collab=box=>{
oldCollab(box);
const url=box.querySelector("#vCloudURL");
if(!url)return;
const all=Array.from(box.children),intro=E("div",{class:"v1-box"});
intro.append(E("h3",{text:"👥 邀請朋友一起規劃旅行"}),E("p",{class:"v1-sub",text:"這個功能目前尚未啟用雲端。啟用後才會提供一鍵邀請、角色權限及共同編輯。不能用純瀏覽器資料冒充同步。"}));
intro.append(E("div",{class:"v1-actions"},[button("📤 先分享旅行備份",()=>U.backup()),button("查看目前可用的分享方式",()=>{alert("目前只能匯出旅行 JSON 分享給朋友後各自匯入；這不是同步共編。真正的邀請連結需要雲端服務先設定完成。")})]));
const details=E("details"),summary=E("summary",{text:"進階：雲端服務擁有者第一次設定"});details.append(summary,...all);
box.replaceChildren(intro,details);
};
U.renderMore();
})();
