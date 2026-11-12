/* VOYAGE V2 foreground GPS proximity notices, never claim exact train location. */
(function(){
"use strict";
const U=window.VoyageUI,R=window.VoyageRouteV2;if(!U||!R)return;
const $=id=>document.getElementById(id),E=U.E,button=U.button;
const actions=$("rideFields").querySelector(".transport-actions"),area=E("div",{class:"v1-box",id:"v2GpsAssist"});
const title=E("h3",{text:"📍 GPS 接近車站提醒（實驗功能）"}),notice=E("p",{class:"v1-sub",text:"瀏覽器保持前景、定位授權且 GPS 精度足夠時，提示可能接近下一站。地鐵地下訊號可能不可靠，不能當作列車即時追蹤或官方到站資料。"});
const status=E("div",{class:"v1-notice",id:"v2GpsStatus",text:"尚未開啟 GPS。你仍可按「我已抵達下一站」手動追蹤。"});
const buttons=E("div",{class:"v1-actions"}),start=button("啟用 GPS 接近提醒",toggle),confirm=button("確認抵達此站",confirmNext);
confirm.disabled=true;buttons.append(start,confirm);area.append(title,notice,status,buttons);
actions.after(area);
let watchId=null,candidate=null,consecutive=0;
function haversine(lat1,lon1,lat2,lon2){const rad=Math.PI/180,a=(lat2-lat1)*rad,b=(lat2-lat1)*rad,c=(lon2-lon1)*rad;const h=Math.sin(a/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(b/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}
function resetCandidate(){candidate=null;consecutive=0;confirm.disabled=true}
function onPosition(pos){const route=R.getActiveRoute();if(!route){status.textContent="先搜尋路線，按『搭乘這條路線』，才能將站點與 GPS 位置比較。";return}const accuracy=Number(pos.coords.accuracy),lat=Number(pos.coords.latitude),lon=Number(pos.coords.longitude);if(!Number.isFinite(accuracy)||accuracy>110){resetCandidate();status.textContent="目前定位誤差約 "+Math.round(accuracy)+" 公尺，精度不足，無法確認車站。";return}
const stops=R.routeStops(route).filter(s=>Number.isFinite(Number(s.lat))&&Number.isFinite(Number(s.lon)));if(!stops.length){resetCandidate();status.textContent="此路線尚未包含可靠的車站座標，請手動確認進度。";return}
const next=R.routeStops(route)[Math.min(rideIndex+1,R.routeStops(route).length-1)];if(!next||!Number.isFinite(Number(next.lat))||!Number.isFinite(Number(next.lon))){resetCandidate();status.textContent="下一站座標尚未確認。";return}
const distance=haversine(lat,lon,Number(next.lat),Number(next.lon));if(distance<=140){consecutive++;candidate=next;if(consecutive>=2){confirm.disabled=false;status.textContent="📍 可能接近 "+(next.zh||next.en||next.local)+"（估計 "+Math.round(distance)+" 公尺）。請自行核對站名，再按確認；不會自動標記到站。"}else status.textContent="GPS 顯示接近 "+(next.zh||next.en||next.local)+"，再確認一次定位…"}else{resetCandidate();status.textContent="距離下一站（僅 GPS 直線距離）約 "+Math.round(distance)+" 公尺；僅在地面有定位訊號時可參考。"}}
function stop(){if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}start.textContent="啟用 GPS 接近提醒";resetCandidate()}
function toggle(){if(watchId!==null){stop();status.textContent="GPS 已停止，仍可使用手動追蹤。";return}if(!navigator.geolocation){status.textContent="此瀏覽器無法取得定位功能，請使用手動追蹤。";return}if(!R.getActiveRoute()){status.textContent="請先查詢並選擇路線，按『搭乘這條路線』。";return}
status.textContent="正在要求定位授權…";watchId=navigator.geolocation.watchPosition(onPosition,err=>{status.textContent="定位無法使用："+err.message+"。請手動確認車站。";stop()},{enableHighAccuracy:true,maximumAge:5000,timeout:14000});start.textContent="停止 GPS"}
function confirmNext(){if(!candidate)return;$("nextStation").click();status.textContent="已手動確認抵達 "+(candidate.zh||candidate.en||candidate.local);resetCandidate()}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&watchId!==null){stop();status.textContent="已離開頁面，定位追蹤暫停。iPhone Safari 無法保證背景持續定位。"}});
window.VoyageGpsV2={haversine,stop};
})();
