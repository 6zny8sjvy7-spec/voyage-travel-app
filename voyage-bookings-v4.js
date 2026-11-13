/* VOYAGE V4 one source of truth for simple flight/hotel reservations and linked daily events.
   The airline's local departure/arrival clocks remain exactly as entered; timezone conversion is only for validation. */
(function(global){
"use strict";
const U=global.VoyageUI,D=global.VoyageDomain,R=global.VoyageRegionV4;
if(!U||!D||!R)return;
const {field,get,openDialog,button,E,pages,toast,current}=U;
const countries={TW:{name:"台灣",tz:"Asia/Taipei",offset:8},KR:{name:"韓國",tz:"Asia/Seoul",offset:9},TH:{name:"泰國",tz:"Asia/Bangkok",offset:7},JP:{name:"日本",tz:"Asia/Tokyo",offset:9},VN:{name:"越南",tz:"Asia/Ho_Chi_Minh",offset:7}};
const opts=Object.entries(countries).map(([code,c])=>[code,c.name]);
function dayIndex(t,date){if(!D.dayISO(t.startDate||"",0)||!D.dayISO(date||"",0))return -1;const a=Date.parse(t.startDate+"T12:00:00Z"),b=Date.parse(date+"T12:00:00Z");const d=Math.round((b-a)/86400000);return d>=0&&d<t.days.length?d:-1}
function utc(t,date,time,code){if(!D.dayISO(date,0)||!D.validTime(time))throw Error("請確認航班日期與時間");const z=countries[code];if(!z)throw Error("目前此功能只支援台灣、韓國、泰國、日本與越南的自動時區換算");return Date.parse(date+"T"+time+":00Z")-z.offset*3600000}
function linkedEvents(t,documentId){return t.days.flat().filter(x=>x.linkedDocumentId===documentId)}
function reconcile(t,doc){
 for(const events of t.days)for(let i=events.length-1;i>=0;i--)if(events[i].linkedDocumentId===doc.id)events.splice(i,1);
 const entry=(date,time,name,phase,duration,notes)=>{const i=dayIndex(t,date);if(i<0)return;const e={id:D.uid(),linkedDocumentId:doc.id,documentPhase:phase,type:doc.type,name,time,duration,notes,from:doc.fromPlace||"",to:doc.toPlace||"",source:"已連動預訂",countryCode:doc.toCountry||R.countryCode(t),url:doc.url||""};if(doc.type==="flight"){e.ticketDepartDate=doc.departDate||doc.date;e.ticketDepartTime=doc.departTime||doc.time;e.ticketArriveDate=doc.arriveDate||doc.endDate;e.ticketArriveTime=doc.arriveTime||doc.endTime;e.ticketStartTZ=doc.startTZ;e.ticketEndTZ=doc.endTZ}t.days[i].push(e)};
 if(doc.type==="flight"){
  const d=doc.departDate||doc.date,dt=doc.departTime||doc.time,a=doc.arriveDate||doc.endDate,at=doc.arriveTime||doc.endTime;
  const label="✈️ "+doc.name;
  entry(d,dt,label+" · "+(countries[doc.fromCountry]?.name||"出發")+"起飛","departure",doc.elapsedMinutes||30,["機票出發："+d+" "+dt+"（"+doc.startTZ+"）","機票抵達："+a+" "+at+"（"+doc.endTZ+"）",doc.fromPlace+" → "+doc.toPlace,doc.note].filter(Boolean).join("\n"));
  if(a!==d||doc.fromCountry!==doc.toCountry)entry(a,at,"🛬 "+doc.name+" · 抵達 "+(doc.toPlace||countries[doc.toCountry]?.name||"目的地"),"arrival",15,["機票標示抵達時間："+a+" "+at+"（"+doc.endTZ+"）",doc.note].filter(Boolean).join("\n"));
 }else if(doc.type==="hotel"){
  entry(doc.date,doc.time,"🏨 入住 · "+doc.name,"checkin",30,[doc.place,doc.note].filter(Boolean).join("\n"));
  entry(doc.endDate,doc.endTime,"🧳 退房 · "+doc.name,"checkout",20,[doc.place,doc.note].filter(Boolean).join("\n"));
 }
 return linkedEvents(t,doc.id).length;
}
function saveDoc(t,doc){t.documents??=[];const idx=t.documents.findIndex(x=>x.id===doc.id);if(idx>=0)t.documents[idx]=doc;else t.documents.push(doc);const linked=reconcile(t,doc);
 if(linked===0)toast("預訂已保存，但日期不在目前旅行期間。請調整旅行開始日期或天數後重新整理預訂。");
 else toast("已同步 "+linked+" 筆機票／住宿時間到行事曆");
}
function editFlight(previous=null){
 const t=current(),origin=previous?.fromCountry||"TW",destination=previous?.toCountry||R.countryCode(t)||"KR";
 const date=D.dayISO(t.startDate||"",day)||t.startDate||"";
 openDialog(previous?"編輯航班與行事曆":"新增航班 · 依機票填寫當地日期與時間",[
  field("vBFlight","航班號／名稱（例 IT662）","text",previous?.name||""),
  field("vBFromCountry","從哪個國家起飛","select",origin,{options:opts}),
  field("vBToCountry","飛往哪個國家","select",destination,{options:opts}),
  field("vBFrom","出發機場／城市","text",previous?.fromPlace||""),
  field("vBTo","抵達機場／城市","text",previous?.toPlace||t.city||""),
  field("vBDepartDate","機票出發日期（出發地當地）","date",previous?.departDate||previous?.date||date),
  field("vBDepartTime","機票出發時間","time",previous?.departTime||previous?.time||""),
  field("vBArriveDate","機票抵達日期（抵達地當地）","date",previous?.arriveDate||previous?.endDate||date),
  field("vBArriveTime","機票抵達時間","time",previous?.arriveTime||previous?.endTime||""),
  field("vBURL","確認／訂票網址（HTTPS，選填）","url",previous?.url||"",{full:true}),
  field("vBNote","備註（請勿輸入護照號碼、確認碼或信用卡資料）","textarea",previous?.note||"",{full:true})
 ],()=>{
  const name=get("vBFlight"),fromCountry=get("vBFromCountry"),toCountry=get("vBToCountry"),departDate=get("vBDepartDate"),departTime=get("vBDepartTime"),arriveDate=get("vBArriveDate"),arriveTime=get("vBArriveTime"),url=get("vBURL");
  if(!name||!get("vBFrom")||!get("vBTo"))throw Error("請填航班名稱、出發機場與抵達機場");
  if(url&&!/^https:\/\//i.test(url))throw Error("確認網址需要 HTTPS");
  const minutes=Math.round((utc(t,arriveDate,arriveTime,toCountry)-utc(t,departDate,departTime,fromCountry))/60000);
  if(minutes<=0||minutes>60*48)throw Error("抵達時間換算時區後不正確，請核對機票上的日期、國家及時間");
  const doc={...previous,id:previous?.id||D.uid(),type:"flight",name,fromCountry,toCountry,fromPlace:get("vBFrom"),toPlace:get("vBTo"),departDate,departTime,arriveDate,arriveTime,date:departDate,time:departTime,endDate:arriveDate,endTime:arriveTime,startTZ:countries[fromCountry].tz,endTZ:countries[toCountry].tz,elapsedMinutes:minutes,url,note:get("vBNote")};
  saveDoc(t,doc);return true
 });
}
function editHotel(previous=null){
 const t=current(),date=D.dayISO(t.startDate||"",day)||t.startDate||"";
 openDialog(previous?"編輯住宿與入住／退房行程":"新增住宿 · 連動入住和退房日期",[
  field("vBHotel","飯店／住宿名稱","text",previous?.name||""),
  field("vBAddress","住宿地址／所在地","text",previous?.place||"",{full:true}),
  field("vBCheckin","入住日期（目的地當地）","date",previous?.date||date),
  field("vBCheckinTime","預計入住時間","time",previous?.time||"15:00"),
  field("vBCheckout","退房日期（目的地當地）","date",previous?.endDate||date),
  field("vBCheckoutTime","退房時間","time",previous?.endTime||"11:00"),
  field("vBHotelURL","官方／訂房網址（HTTPS，選填）","url",previous?.url||"",{full:true}),
  field("vBHotelNote","備註","textarea",previous?.note||"",{full:true})
 ],()=>{
  const name=get("vBHotel"),dateIn=get("vBCheckin"),dateOut=get("vBCheckout"),timeIn=get("vBCheckinTime"),timeOut=get("vBCheckoutTime"),url=get("vBHotelURL");
  if(!name)throw Error("請填寫住宿名稱");
  if(!D.dayISO(dateIn,0)||!D.dayISO(dateOut,0)||dateOut<dateIn)throw Error("入住及退房日期不正確");
  if(!D.validTime(timeIn)||!D.validTime(timeOut))throw Error("請依訂房資訊填入有效時間");
  if(url&&!/^https:\/\//i.test(url))throw Error("確認網址必須使用 HTTPS");
  const doc={...previous,id:previous?.id||D.uid(),type:"hotel",name,date:dateIn,time:timeIn,endDate:dateOut,endTime:timeOut,place:get("vBAddress"),startTZ:t.tz||R.get(t).region,endTZ:t.tz||R.get(t).region,url,note:get("vBHotelNote")};
  saveDoc(t,doc);return true
 })
}
const baseDocuments=pages.documents;
pages.documents=box=>{
 const t=current();t.documents??=[];
 box.append(E("p",{class:"v1-notice",text:"在此輸入機票、住宿所寫的當地日期及時間，系統自動保存原始資訊並連動至旅行日曆；跨國時差會分別計算。"}));
 const row=E("div",{class:"v1-actions"},[button("✈️ ＋ 新增航班",()=>editFlight(),"primary"),button("🏨 ＋ 新增住宿",()=>editHotel(),"secondary")]);box.append(row);
 if(!D.dayISO(t.startDate||"",0))box.append(E("p",{class:"v1-notice",text:"目前旅行尚未設定開始日期。預訂可以先保存，但要設定旅行日期後才能準確連動行事曆。"}));
 for(const doc of t.documents){
  const card=E("div",{class:"v1-item"}),description=doc.type==="flight"?
   [doc.departDate||doc.date,doc.departTime||doc.time,countries[doc.fromCountry]?.name,doc.fromPlace,"→",doc.arriveDate||doc.endDate,doc.arriveTime||doc.endTime,countries[doc.toCountry]?.name,doc.toPlace].filter(Boolean).join(" "):
   [doc.date,doc.time,"入住","→",doc.endDate,doc.endTime,"退房",doc.place].filter(Boolean).join(" ");
  const main=E("div",{class:"v1-item-main"},[E("b",{text:(doc.type==="flight"?"✈️ ":doc.type==="hotel"?"🏨 ":"📎 ")+doc.name}),E("div",{class:"v1-sub",text:description}),E("div",{class:"v1-sub",text:"行事曆已連動 "+linkedEvents(t,doc.id).length+" 筆 · 修改預訂會更新關聯活動"})]);card.append(main);
  if(/^https:\/\//i.test(doc.url||""))card.append(E("a",{href:doc.url,target:"_blank",rel:"noopener noreferrer",text:"確認網址"}));
  card.append(button("編輯",()=>doc.type==="flight"?editFlight(doc):editHotel(doc)));
  card.append(button("移除",()=>{if(!confirm("確定刪除預訂「"+doc.name+"」及其連動行事曆事件？其他活動不會受影響。"))return;t.documents=t.documents.filter(d=>d.id!==doc.id);for(const events of t.days)for(let i=events.length-1;i>=0;i--)if(events[i].linkedDocumentId===doc.id)events.splice(i,1);save();render()},"ghost"));
  box.append(card)
 }
 if(!t.documents.length)box.append(E("p",{class:"v1-sub",text:"尚未新增航班或住宿。兩者都會成為可以編輯的行事曆事件，不用重複填寫。"}));
};
const previousEventEditor=U.eventEditor;
U.eventEditor=(index,isNew=false)=>{
 const e=trip().days[day]?.[index];
 if(!isNew&&e?.linkedDocumentId){
  const doc=current().documents?.find(d=>d.id===e.linkedDocumentId);
  if(doc){if(doc.type==="flight")editFlight(doc);else if(doc.type==="hotel")editHotel(doc);else previousEventEditor(index,false);return}
 }
 return previousEventEditor(index,isNew)
};
const composer=document.querySelector("#v3Composer");
if(composer){
 const add=[...composer.querySelectorAll("button")].find(b=>b.textContent.includes("加入當天時間軸"));
 if(add)add.addEventListener("click",event=>{
  const value=document.getElementById("v3NewType")?.value;
  if(value!=="flight"&&value!=="hotel")return;
  event.preventDefault();event.stopImmediatePropagation();
  value==="flight"?editFlight():editHotel();
 },true);
}
global.VoyageBookingV4={countries,utc,dayIndex,reconcile,editFlight,editHotel,linkedEvents};
})(window);
