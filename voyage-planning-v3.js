/* VOYAGE V3: expandable category-based packing, bulk removal, eat-list and wishlist shortcuts. */
(function(){
"use strict";
const U=window.VoyageUI,D=window.VoyageDomain;if(!U||!D)return;
const {E,button,field,get,openDialog,toast,current,pages}=U;
const selected=new Map(),deleteModes=new Set();
function owned(){const t=current();return selected.get(t.id)||new Set()}
function cleanSelected(t){const valid=new Set(t.packing.map(x=>x.id)),now=owned();for(const x of now)if(!valid.has(x))now.delete(x);selected.set(t.id,now);return now}
const basePacking=pages.packing;
pages.packing=box=>{
const t=current();basePacking(box);
const lib=box.querySelector("#v2PackingLibrary");
if(!lib)return;
const collapsed=!!t.packingCollapsed,detail=E("details",{id:"v3PackLibrary",class:"v3-pack-picker"});
detail.open=!collapsed;
const summary=E("summary",{text:(collapsed?"▶ 展開":"▼ 收合")+"分類清單庫 · 挑選證件／3C／衣物／盥洗／健康等"});
detail.append(summary,lib);box.prepend(detail);
const choose=lib.querySelector("#v2PackChoices"),buttons=[...lib.querySelectorAll("button")],add=buttons.find(x=>x.textContent.includes("加入勾選的物品"));
if(add)lib.querySelector(".v1-actions").prepend(button("加入目前分類所有項目",()=>{const available=choose.querySelectorAll('input[type=checkbox]:not(:disabled)');available.forEach(c=>c.checked=true);if(!available.length){toast("此分類沒有尚未加入的物品");return}add.click()}));
function toggle(){t.packingCollapsed=!detail.open;summary.textContent=(detail.open?"▼ 收合":"▶ 展開")+"分類清單庫 · 挑選證件／3C／衣物／盥洗／健康等";save()}
detail.addEventListener("toggle",toggle);

const oldButton=[...box.querySelectorAll("button")].find(b=>b.textContent.includes("加入出國通用清單"));
if(oldButton){oldButton.textContent="從分類清單加入物品";oldButton.onclick=()=>{detail.open=true;lib.scrollIntoView({behavior:"smooth",block:"start"})}}
const rows=[...box.children].filter(c=>c.classList?.contains("v1-item"));
const toolbar=E("div",{class:"v3-pack-bulk",id:"v3PackBulk"}),count=E("span",{class:"v1-sub",id:"v3PackSelectedCount",text:"尚未選取刪除項目"}),now=cleanSelected(t);
function countUp(){count.textContent="已選取 "+now.size+" / "+t.packing.length+" 件（不影響已打包勾選）";toolbar.querySelector("[data-action=delete]").disabled=now.size===0}
function clearAll(){if(!t.packing.length){toast("清單目前是空的");return}if(!confirm("確定清空目前旅行所有 "+t.packing.length+" 件行李嗎？這個操作無法撤銷，其他行程不會受影響。"))return;t.packing=[];now.clear();save();render()}
function erase(){const count=now.size;if(!count)return;if(!confirm("確定刪除勾選的 "+count+" 件物品？這些項目的所有旅伴打包勾選也會一併刪除。"))return;t.packing=t.packing.filter(x=>!now.has(x.id));now.clear();save();render();toast("已刪除 "+count+" 件物品")}

const removing=deleteModes.has(t.id);
const toggleDelete=button(removing?"取消刪除模式":"勾選要刪的物品",()=>{
 if(removing){deleteModes.delete(t.id);now.clear()}else deleteModes.add(t.id);
 U.renderMore();
},"secondary");
const actions=E("div",{class:"v1-actions"}),title=E("strong",{text:removing?"選擇想刪除的物品":"整理我的清單"});
toolbar.append(title,E("div",{class:"v1-actions"},[toggleDelete]));
if(removing){
 const selectAll=button("全選要刪的物品",()=>{now.clear();t.packing.forEach(x=>now.add(x.id));rows.forEach(row=>{const i=row.querySelector(".v3-remove-check");if(i)i.checked=true});countUp()});
 const clear=button("取消選取",()=>{now.clear();rows.forEach(row=>{const i=row.querySelector(".v3-remove-check");if(i)i.checked=false});countUp()});
 const remove=button("刪除選取項目",erase,"secondary");remove.dataset.action="delete";
 const eraseAll=button("清空全部行李",clearAll,"secondary");eraseAll.className="v3-danger";
 actions.append(selectAll,clear,remove,eraseAll);toolbar.append(count,actions);
}
const place=rows[0]||[...box.children].find(x=>x.classList?.contains("v1-notice"));if(place)box.insertBefore(toolbar,place);else box.append(toolbar);
rows.forEach((row,i)=>{
 const pack=t.packing[i];if(!pack)return;
 const packCheckbox=row.querySelector(".v1-check");
 const removeButton=[...row.querySelectorAll("button")].find(b=>b.textContent.includes("移除"));
 if(packCheckbox)packCheckbox.hidden=removing;
 if(removeButton)removeButton.hidden=true;
 if(removing){
  const input=E("input",{type:"checkbox",class:"v3-remove-check","aria-label":"選取刪除 "+pack.name});
  input.checked=now.has(pack.id);
  input.onchange=()=>{if(input.checked)now.add(pack.id);else now.delete(pack.id);countUp()};
  row.append(input);
 }
 row.dataset.packId=String(pack.id);
});
if(removing)countUp();

};
pages.foods=box=>{
const t=current();if(!Array.isArray(t.foodWishlist))t.foodWishlist=[];
box.append(E("div",{class:"v3-food-header"},[E("span",{class:"v3-food-emoji",text:"🍜"}),E("div",{},[E("h3",{text:"我想吃的美食口袋名單"}),E("p",{class:"v1-sub",text:"先收藏想吃的食物、餐廳或甜點，再依日期安排進真正的行程時間軸。餐廳地址需核對後才能定位。"})])]));
box.append(E("div",{class:"v1-actions"},[button("＋ 收藏想吃的",()=>{
openDialog("新增美食／餐廳收藏",[
field("vFoodName","餐廳名稱或想吃的食物","text",""),
field("vFoodKind","類型","select","restaurant",{options:[["restaurant","餐廳"],["street","小吃／街頭美食"],["dessert","甜點"],["coffee","咖啡"],["market","夜市／市場"],["dish","特定想吃的料理"]]}),
field("vFoodAddress","地址或區域","text","",{full:true}),
field("vFoodCost","預估金額（目的地幣別）","number","0",{min:0,step:"0.01"}),
field("vFoodNotes","想吃的品項、排隊及營業提醒","textarea","",{full:true}),
field("vFoodURL","地圖／官方網址（HTTPS，選填）","url","",{full:true})
],()=>{const name=get("vFoodName"),url=get("vFoodURL"),cost=D.amount(get("vFoodCost"));if(!name||cost===null)throw Error("請輸入名稱與有效預算");if(url&&!/^https:\/\//i.test(url))throw Error("網址必須是 HTTPS");t.foodWishlist.push({id:D.uid(),name,kind:get("vFoodKind"),address:get("vFoodAddress"),cost,notes:get("vFoodNotes"),url,visited:false});return true})},"primary")]));
for(const x of t.foodWishlist){const card=E("div",{class:"v3-food-row"}),main=E("div",{class:"v1-item-main"});main.append(E("strong",{text:(x.visited?"✓ ":"")+x.name}),E("div",{class:"v1-sub",text:[({restaurant:"餐廳",street:"小吃",dessert:"甜點",coffee:"咖啡",market:"市場",dish:"料理"}[x.kind]||"美食"),x.address,x.cost?D.money(x.cost,t.currency):"",x.notes].filter(Boolean).join(" · ")}));card.append(main);
card.append(E("div",{class:"v1-actions"},[button("📅 安排到行程",()=>{const choices=t.days.map((_,i)=>[String(i),"第 "+(i+1)+" 天"+(t.startDate?" · "+D.dayISO(t.startDate,i):"")]);openDialog("把「"+x.name+"」排入行程",[
field("vFoodDay","哪一天","select",String(day),{options:choices}),
field("vFoodTime","用餐開始時間","time","12:00"),
field("vFoodMinutes","用餐分鐘","number","60",{min:1}),
field("vFoodRemark","安排備註","textarea",x.notes||"",{full:true})
],()=>{const d=+get("vFoodDay"),time=get("vFoodTime"),duration=+get("vFoodMinutes");if(!Number.isInteger(d)||!t.days[d]||!D.validTime(time)||!Number.isInteger(duration)||duration<1||duration>1440)throw Error("請填入合法日期、時間與分鐘");const entry={id:D.uid(),type:"food",name:x.name,time,duration,notes:[x.address,get("vFoodRemark")].filter(Boolean).join(" · "),cost:x.cost||0,url:x.url};const conflicts=D.conflicts([...t.days[d],entry]);if(conflicts.length&&!confirm("與現有活動時間重疊，仍要加入嗎？"))return false;t.days[d].push(entry);day=d;return true})}),button(x.visited?"標記未吃":"✓ 已吃過",()=>{x.visited=!x.visited;save();render()}),button("移除收藏",()=>{if(!confirm("移除「"+x.name+"」收藏？已排入行程的紀錄會保留。"))return;t.foodWishlist=t.foodWishlist.filter(v=>v.id!==x.id);save();render()})]));box.append(card)}
if(!t.foodWishlist.length)box.append(E("div",{class:"v1-notice",text:"還沒有想吃的食物。先收藏一間烤肉店、咖啡店或街頭小吃，再安排用餐時間。"}));
};
const originalWishlist=pages.wishlist;
pages.wishlist=box=>{originalWishlist(box);box.prepend(E("p",{class:"v1-notice",text:"購物願望也可以從首頁直接進入。這是待買清單，不會自動記帳；實際購買金額仍由你確認。"}))};
U.renderMore();
})();
