/* VOYAGE V1 safe import preview and integrated translation */
(function(){
"use strict";
const U=window.VoyageUI;if(!U)return;
const {E,$v,D,button,field,get,toast,current,pages}=U;
let preview=null;
pages.import=box=>{
 box.append(E("div",{class:"v1-notice",text:"先預覽、逐筆勾選，再明確確認加入；不會自動取代既有旅行。支援 VOYAGE JSON、CSV、ICS、TXT。CSV 欄位需含 name 或 名稱。"}));
 const file=E("input",{type:"file",accept:".json,.csv,.ics,.txt,application/json,text/plain,text/csv,text/calendar",id:"vImportFile"});box.append(E("div",{class:"v1-fields"},[E("label",{},[E("span",{text:"選擇匯入檔案"}),file])]));
 const result=E("div",{id:"vImportPreview"});box.append(result);
 file.onchange=async()=>{const f=file.files&&file.files[0];if(!f)return;try{if(f.size>1500000)throw Error("檔案大小不得超過 1.5 MB");preview=D.parseImport(f.name,await f.text());if(!preview.rows.length)throw Error("沒有可匯入的行程");showPreview(result)}catch(e){preview=null;result.replaceChildren(E("div",{class:"v1-warning",text:"解析失敗："+e.message}))}}
};
function showPreview(box){if(!preview)return;box.replaceChildren(E("h3",{text:"匯入預覽 · "+preview.rows.length+" 筆"}));if(preview.kind==="trips"){box.append(E("p",{class:"v1-sub",text:"JSON 旅行資料會以新旅行加入。ID 重複會產生新 ID；資料會再驗證。"}));preview.rows.slice(0,100).forEach((t,i)=>{const row=E("div",{class:"v1-item"}),check=E("input",{type:"checkbox",class:"v1-check"});check.checked=true;check.dataset.idx=i;row.append(check,E("div",{text:t.name+" · "+t.city+" · "+t.days.length+" 天"}));box.append(row)});box.append(button("確認加入勾選旅行",()=>{const selected=[...box.querySelectorAll("input[type=checkbox]:checked")].map(x=>preview.rows[+x.dataset.idx]);if(!selected.length){toast("請勾選旅行");return}if(!confirm("要新增 "+selected.length+" 趟旅行嗎？既有行程不會覆蓋。"))return;const known=new Set(trips.map(x=>x.id));selected.forEach(x=>{const t=D.clone(x);if(known.has(t.id))t.id=D.uid();known.add(t.id);trips.push(t)});save();render();toast("已新增 "+selected.length+" 趟旅行");preview=null;U.showPage("history")},"primary"));return}
box.append(E("p",{class:"v1-sub",text:"可直接修改名稱、時間與目的日期。若 ICS 日期不在旅行期間，預設對應目前日期，不會默默延長旅行。最多預覽前 100 筆；超過者請先切分檔案。"}));
const t=current(),items=preview.rows.slice(0,100),table=E("div",{class:"v1-tablewrap"}),inner=E("table",{class:"v1-table"});
inner.append(E("thead",{},[E("tr",{},["加入","第幾天","時間","內容"].map(text=>E("th",{text})))]));
const body=E("tbody");items.forEach((x,i)=>{let d=Number.isInteger(x.day)?x.day:day;let importDate=x.date||"",importTime=x.time||"10:00";if(x.isoUTC){const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:t.tz||"UTC",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(x.isoUTC)).map(p=>[p.type,p.value]));importDate=parts.year+"-"+parts.month+"-"+parts.day;importTime=parts.hour+":"+parts.minute}if(importDate&&t.startDate){const delta=(Date.parse(importDate+"T12:00:00Z")-Date.parse(t.startDate+"T12:00:00Z"))/86400000;if(Number.isInteger(delta)&&delta>=0&&delta<t.days.length)d=delta}d=Math.min(t.days.length-1,Math.max(0,d));const check=E("input",{type:"checkbox",class:"v1-check"});check.checked=true;check.dataset.i=i;const dayInput=E("input",{type:"number",min:"1",max:String(t.days.length),value:String(d+1)}),tm=E("input",{type:"time",value:importTime}),name=E("input",{type:"text",value:x.name||""});check.dataset.row=i;dayInput.dataset.role="day";tm.dataset.role="time";name.dataset.role="name";const row=E("tr");row.append(E("td",{},[check]),E("td",{},[dayInput]),E("td",{},[tm]),E("td",{},[name]));row.dataset.index=i;body.append(row)});
inner.append(body);table.append(inner);box.append(table);
box.append(button("確認附加勾選活動",()=>{const pending=[];for(const row of body.querySelectorAll("tr")){if(!row.querySelector("input[type=checkbox]").checked)continue;const i=+row.dataset.index,x=items[i],n=row.querySelector('[data-role="name"]').value.trim(),tm=row.querySelector('[data-role="time"]').value,idx=Number(row.querySelector('[data-role="day"]').value)-1;if(!n||!D.validTime(tm)||!Number.isInteger(idx)||idx<0||idx>=t.days.length){toast("有活動的名稱、時間或日期不合法，請修正");return}pending.push({day:idx,event:{name:n,time:tm,notes:(x.notes||"")+(x.timezone&&x.timezone!==t.tz?"\n原始 ICS 時區："+x.timezone+"（請核對時間）":""),duration:x.duration||0,type:"other",source:x.origin||"import"}})}if(!pending.length){toast("沒有勾選項目");return}const existing=new Set(t.days.flatMap((events,i)=>events.map(e=>i+"|"+e.name+"|"+e.time)));const unique=pending.filter(x=>!existing.has(x.day+"|"+x.event.name+"|"+x.event.time));if(!confirm("預計附加 "+unique.length+" 筆新活動（"+(pending.length-unique.length)+" 筆重複略過），確定嗎？"))return;unique.forEach(x=>{t.days[x.day].push(x.event);existing.add(x.day+"|"+x.event.name+"|"+x.event.time)});save();render();toast("匯入 "+unique.length+" 筆活動，既有行程未覆蓋");preview=null;U.showPage("overview")},"primary"))
}
const phrases=[
["請問這個多少錢？","이거 얼마예요?","これはいくらですか？","อันนี้ราคาเท่าไหร่คะ/ครับ","How much is this?"],
["請問洗手間在哪裡？","화장실이 어디예요?","お手洗いはどこですか？","ห้องน้ำอยู่ที่ไหนคะ/ครับ","Where is the restroom?"],
["請問可以刷卡嗎？","카드로 결제할 수 있나요?","カードは使えますか？","ใช้บัตรเครดิตได้ไหมคะ/ครับ","Can I pay by card?"],
["我想去這個地址。","이 주소로 가고 싶어요.","この住所に行きたいです。","อยากไปที่อยู่นี้ค่ะ/ครับ","I would like to go to this address."],
["請問要在哪一站下車？","어느 역에서 내려야 하나요?","どの駅で降りればいいですか？","ต้องลงสถานีไหนคะ/ครับ","Which station should I get off at?"],
["請問需要轉車嗎？","환승해야 하나요?","乗り換えが必要ですか？","ต้องเปลี่ยนสายไหมคะ/ครับ","Do I need to transfer?"],
["我對這個食物過敏。","저는 이 음식에 알레르기가 있어요.","この食べ物にアレルギーがあります。","ฉันแพ้อาหารชนิดนี้ค่ะ/ครับ","I am allergic to this food."],
["可以不要辣嗎？","맵지 않게 해 주세요.","辛くしないでください。","ไม่เผ็ดได้ไหมคะ/ครับ","Could you make it not spicy?"],
["可以幫我拍照嗎？","사진 좀 찍어 주실 수 있나요?","写真を撮っていただけますか？","ช่วยถ่ายรูปให้หน่อยได้ไหมคะ/ครับ","Could you take a photo for us?"],
["請稍等一下。","잠시만 기다려 주세요.","少々お待ちください。","กรุณารอสักครู่นะคะ/ครับ","Please wait a moment."],
["我有訂房。","예약했어요.","予約しています。","ฉันจองห้องพักไว้ค่ะ/ครับ","I have a reservation."],
["非常感謝。","정말 감사합니다.","本当にありがとうございます。","ขอบคุณมากค่ะ/ครับ","Thank you very much."]
];
let translateLang="";
function targetLanguage(t){const s=t.country+" "+t.city;return /韓國|Korea/i.test(s)?"ko":/日本|Japan/i.test(s)?"ja":/泰國|Thailand/i.test(s)?"th":"en"}
const languageNames={ko:"韓文",ja:"日文",th:"泰文",en:"英文",fr:"法文",es:"西班牙文",de:"德文",vi:"越南文",zh:"繁體中文"};
const speak=(text,lang)=>{if(!("speechSynthesis" in window)){toast("此瀏覽器不支援語音朗讀");return}const utter=new SpeechSynthesisUtterance(text);utter.lang={ko:"ko-KR",ja:"ja-JP",th:"th-TH",en:"en-US",fr:"fr-FR",es:"es-ES",de:"de-DE",vi:"vi-VN",zh:"zh-TW"}[lang]||"en-US";speechSynthesis.cancel();speechSynthesis.speak(utter)};
async function apiTranslate(text,source,target){if(new TextEncoder().encode(text).length>500)throw Error("此翻譯服務每次上限 500 bytes，請縮短文字");const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(text)+"&langpair="+encodeURIComponent(source+"|"+target);const response=await fetch(url);if(!response.ok)throw Error("翻譯服務回傳 HTTP "+response.status);const data=await response.json();if(data.responseStatus!==200||!data.responseData||!data.responseData.translatedText)throw Error(data.responseDetails||"翻譯失敗");return String(data.responseData.translatedText)}
pages.translation=box=>{const t=current();if(!translateLang)translateLang=targetLanguage(t);box.append(E("div",{class:"v1-notice",text:"內建旅行常用語可離線查看和朗讀。自由翻譯使用 MyMemory 第三方公開翻譯服務；點擊「送出翻譯」才傳送文字。請勿輸入護照、住址、帳號或私人資料。免費服務有限額，翻譯不保證正確；自由翻譯不支援指定敬語或語氣，請用常用句型或自行核對。"}));
const languageSelect=field("vLanguage","目的地語言","select",translateLang,{options:Object.entries(languageNames).filter(x=>x[0]!=="zh").map(([k,v])=>[k,v])});
box.append(E("div",{class:"v1-fields"},[languageSelect]));$v("vLanguage").onchange=e=>{translateLang=e.target.value;U.renderMore()};
const phraseCol={ko:1,ja:2,th:3,en:4}[translateLang];if(phraseCol){box.append(E("h3",{text:"常用旅行句型 · 可點擊朗讀"}));for(const p of phrases){const row=E("div",{class:"v1-phrase"});row.append(E("b",{text:p[0]}),E("div",{text:p[phraseCol]}),button("▶ 朗讀",()=>speak(p[phraseCol],translateLang)));box.append(row)}}
const area=E("div",{class:"v1-box"}),fields=E("div",{class:"v1-fields"});fields.append(field("vTransSource","翻譯來源","select","zh",{options:[["zh","繁體中文"],[translateLang,languageNames[translateLang]]]}),field("vTransText","輸入短句（不含私人資料）","textarea","",{full:true}));area.append(E("h3",{text:"自由翻譯與回譯檢查"}),fields);const output=E("div",{id:"vTransOutput",class:"v1-notice",text:"尚未送出文字"});area.append(E("div",{class:"v1-actions"},[button("送出翻譯並回譯",async()=>{const source=get("vTransSource"),target=source==="zh"?translateLang:"zh",input=get("vTransText");if(!input){toast("先輸入文字");return}output.textContent="正在聯繫第三方翻譯服務…";try{const translated=await apiTranslate(input,source==="zh"?"zh-TW":source,target==="zh"?"zh-TW":target);output.replaceChildren(E("b",{text:"翻譯："+translated}),E("p",{class:"v1-sub",text:"回譯僅用來檢查可能的語意差異，不能證明數字、否定、敬語或過敏資訊完全正確。"}));try{const reverse=await apiTranslate(translated,target==="zh"?"zh-TW":target,source==="zh"?"zh-TW":source);output.append(E("p",{text:"回譯："+reverse}))}catch(e){output.append(E("p",{class:"v1-warning",text:"回譯未取得："+e.message}))}output.append(button("▶ 朗讀翻譯",()=>speak(translated,target)))}catch(e){output.textContent="翻譯無法使用："+e.message}}, "primary")]));area.append(output);box.append(area)}
$v("importBtn").onclick=()=>U.showPage("import");
U.renderMore();
})();
