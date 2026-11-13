/* VOYAGE V4 destination resolver. Country is travel metadata; timezones and geocoordinates belong to cities.
   Do not infer availability of real-time transport from the existence of a country label. */
(function(global){
"use strict";
const data={
 KR:{code:"KR",name:"韓國",currency:"KRW",language:"ko",map:"naver",region:"Asia/Seoul",rail:"地鐵／AREX",bus:"公車",sources:[{name:"首爾開放資料",url:"https://data.seoul.go.kr/",type:"official-keyed"},{name:"NAVER 地圖",url:"https://map.naver.com/",type:"navigation"}]},
 TH:{code:"TH",name:"泰國",currency:"THB",language:"th",map:"google",region:"Asia/Bangkok",rail:"BTS／MRT／ARL",bus:"公車",sources:[{name:"泰國國家 GTFS 班表",url:"https://namtang-api.otp.go.th/download/namtang-gtfs.zip",type:"schedule-data"},{name:"BKK Rail 官方路線 App",url:"https://www.drt.go.th/innovation-bkkrail",type:"official-app"}]},
 JP:{code:"JP",name:"日本",currency:"JPY",language:"ja",map:"google",region:"Asia/Tokyo",rail:"鐵道／地鐵",bus:"公車",sources:[{name:"ODPT 交通開放資料",url:"https://www.odpt.org/en/overview/",type:"official-keyed"}]},
 VN:{code:"VN",name:"越南",currency:"VND",language:"vi",map:"google",region:"Asia/Ho_Chi_Minh",rail:"城市軌道（依城市）",bus:"公車",sources:[{name:"BusMap",url:"https://busmap.vn/",type:"external-service"}]}
};
const aliases=[
 ["KR",/(韓國|南韓|대한민국|한국|south korea|republic of korea|korea)/i],
 ["TH",/(泰國|ประเทศไทย|thailand|thai)/i],
 ["JP",/(日本|にほん|japan)/i],
 ["VN",/(越南|việt nam|viet nam|vietnam)/i]
];
const countryCode=t=>{
 const direct=String(t?.countryCode||t?.country_code||"").trim().toUpperCase();
 if(data[direct])return direct;
 const text=String(t?.country||"").trim();
 for(const [code,match] of aliases)if(match.test(text))return code;
 return direct&&/^[A-Z]{2}$/.test(direct)?direct:"";
};
function get(t){const code=countryCode(t);return data[code]||{code:code||"unknown",name:t?.country||"未設定國家",currency:t?.currency||"TWD",language:"",map:"google",region:t?.tz||"UTC",rail:"依城市查詢",bus:"依城市查詢",sources:[]}}
function isSeoul(t){const c=countryCode(t);return c==="KR"&&/(首爾|seoul|서울)/i.test(String(t?.city||""))}
function trustedCoords(t){const lat=Number(t?.lat),lon=Number(t?.lon);return !t?.needsLocation&&t?.lat!==""&&t?.lat!=null&&t?.lon!==""&&t?.lon!=null&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{latitude:lat,longitude:lon}:null}
function countryForCode(code){return data[code]||null}
global.VoyageRegionV4={data,countryCode,get,isSeoul,trustedCoords,countryForCode};
})(window);
