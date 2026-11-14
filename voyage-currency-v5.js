/* Currency labels only; stored keys remain ISO 4217 codes for old data, FX and exports. */
(function(global){
"use strict";
const labels={
 TWD:"台灣・新臺幣（TWD）",KRW:"韓國・韓元（KRW）",JPY:"日本・日圓（JPY）",
 THB:"泰國・泰銖（THB）",VND:"越南・越南盾（VND）",
 USD:"美國等・美元（USD）",EUR:"歐元區・歐元（EUR）",
 SGD:"新加坡・新加坡元（SGD）",HKD:"香港・港幣（HKD）",
 CNY:"中國大陸・人民幣（CNY）",GBP:"英國・英鎊（GBP）",
 AUD:"澳洲・澳幣（AUD）",CAD:"加拿大・加幣（CAD）",
 MYR:"馬來西亞・令吉（MYR）",PHP:"菲律賓・披索（PHP）",
 IDR:"印尼・印尼盾（IDR）"
};
const names=Object.freeze(labels);
const label=code=>names[code]||String(code||"未知幣別");
const options=keys=>keys.map(code=>[code,label(code)]);
global.VoyageCurrencyV5={names,label,options};
})(window);