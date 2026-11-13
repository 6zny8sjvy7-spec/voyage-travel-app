/* VOYAGE V2-forward: approved category fields, protected saved trips, no duplicate UI. */
(function(){
 "use strict";
 const $=id=>document.getElementById(id),U=window.VoyageUI,D=window.VoyageDomain;
 if(!U||!D)return;
 const root=$("v3Composer"),type=$("v3NewType"),fields=root?.querySelector(".v3-composer-fields");
 if(!root||!type||!fields)return;
 const make=(label,control)=>{
  const row=document.createElement("label"),caption=document.createElement("span");
  caption.textContent=label;row.append(caption,control);return row;
 };
 const select=document.createElement("select");select.id="v3TransportMode";
 for(const [v,label] of [["walk","🚶 步行"],["rail","🚇 地鐵／BTS／鐵道"],["taxi","🚕 Uber／計程車"],["bus","🚌 公車"],["flight","✈️ 航班"]]){
  const option=document.createElement("option");option.value=v;option.textContent=label;select.append(option);
 }
 const departure=document.createElement("input");departure.id="v3NewFrom";departure.placeholder="A 站／出發地";departure.autocomplete="off";
 const arrival=document.createElement("input");arrival.id="v3NewTo";arrival.placeholder="B 站／目的地";arrival.autocomplete="off";
 const modeField=make("交通種類",select),fromField=make("出發站 A／地點",departure),toField=make("抵達站 B／地點",arrival);
 const time=$("v3NewTime"),duration=$("v3NewDuration"),name=$("v3NewName");
 const saveBtn=[...root.querySelectorAll("button")].find(b=>b.textContent.includes("加入當天時間軸"));
 fields.insertBefore(modeField,fields.children[1]||null);
 fields.insertBefore(fromField,fields.children[2]||null);
 fields.insertBefore(toField,fields.children[3]||null);
 const routeRow=document.createElement("div");routeRow.className="v2-approved-route-row";
 const checkRoute=document.createElement("button");checkRoute.type="button";checkRoute.className="secondary";
 checkRoute.textContent="🚇 查詢 A→B 的站名／方向／站數／可能的下一班";
 const explanation=document.createElement("span");explanation.textContent="沒有完整交通資料就不會顯示確定站數或假即時倒數。";
 routeRow.append(checkRoute,explanation);root.insertBefore(routeRow,saveBtn);
 checkRoute.onclick=()=>{
  if(!departure.value.trim()||!arrival.value.trim()){U.toast("請輸入出發 A 站與抵達 B 站");return}
  $("transitFrom").value=departure.value.trim();$("transitTo").value=arrival.value.trim();$("transitTime").value=time.value;
  setTab("transport");setTransitMode("plan");
  window.VoyageRouteV2?.search();
 };
 const bookingPanel=document.createElement("div");bookingPanel.id="v2ApprovedBookingPanel";
 root.insertBefore(bookingPanel,saveBtn);
 const show=()=>{
  const v=type.value,transport=v==="transport",sub=select.value;
  const booking=v==="flight"||v==="hotel"||(transport&&sub==="flight");
  for(const el of [modeField,fromField,toField])el.hidden=!transport||booking;
  const nonType=[...fields.querySelectorAll("label")].filter(n=>![type.parentElement,modeField,fromField,toField].includes(n));
  for(const el of nonType)el.hidden=booking;
  bookingPanel.replaceChildren();
  bookingPanel.hidden=!booking;
  routeRow.hidden=!(transport&&sub==="rail");
  if(booking){
   const isFlight=v==="flight"||(transport&&sub==="flight");
   const notice=document.createElement("p");notice.className="v1-notice";
   notice.textContent=isFlight?"航班須記錄起飛與抵達地的當地日期、時間，並連動行事曆。":"住宿須記錄入住與退房日期、時間，並連動行事曆。";
   const start=document.createElement("button");start.type="button";start.className="primary";
   start.textContent=isFlight?"✈️ 輸入航班號／起飛及抵達日期時間":"🏨 輸入入住與退房日期時間";
   start.onclick=()=>{
    if(isFlight)window.VoyageBookingV4?.editFlight();
    else window.VoyageBookingV4?.editHotel();
   };
   bookingPanel.append(notice,start);
  }
  if(saveBtn)saveBtn.hidden=booking;
  name.placeholder=transport?"可留空，將以 A→B 命名":v==="food"?"餐廳／咖啡店":v==="shop"?"商店／市集":"景點／活動名稱";
 };
 type.addEventListener("change",show);select.addEventListener("change",show);
 // Ensure add isn't silently accepted as a fake rail route or an unlinked flight.
 root.addEventListener("click",e=>{
  if(e.target!==saveBtn)return;
  if(type.value==="transport"){
   if(select.value==="flight"){e.stopImmediatePropagation();window.VoyageBookingV4?.editFlight();return}
   if(!departure.value.trim()||!arrival.value.trim()){e.stopImmediatePropagation();U.toast("請填出發 A 站與抵達 B 站");return}
   if(!name.value.trim())name.value=departure.value.trim()+" → "+arrival.value.trim();
   // This is a manually scheduled transfer, NOT a verified transport route.
   const raw=( $("v3NewNotes")?.value||"" );
   if(!raw.includes("交通安排（非已驗證）"))$("v3NewNotes").value=(raw?raw+"；":"")+"交通安排（非已驗證）："+departure.value.trim()+" → "+arrival.value.trim()+" · "+
    ({walk:"步行",rail:"地鐵／BTS",taxi:"Uber／計程車",bus:"公車"}[select.value]||"交通")+
    "；方向與站序請使用 A→B 正式查詢";
  }
 },true);
 show();
 // Restore preserved city landmarks: real weather remains in the separate weather glass.
 const art=document.querySelector(".hero-art");
 if(art)art.style.display="flex";
 // Date switches get a small visual acknowledgement; keep icons otherwise calm.
 document.addEventListener("click",e=>{
  if(!e.target.closest(".date,#v2DayBar button"))return;
  const icons=document.querySelectorAll(".hero-art span,#v2Home .v2-big-icon");
  for(const node of icons){node.classList.remove("v2-date-bounce");void node.offsetWidth;node.classList.add("v2-date-bounce")}
 },true);
 // Obsolete ride tracking stays disabled. Do not request foreground/background GPS.
 const ride=$("rideMode"),rideArea=$("rideFields");
 if(ride)ride.remove();
 if(rideArea)rideArea.remove();
 const oldGps=$("v2GpsAssist");if(oldGps)oldGps.remove();
})();
