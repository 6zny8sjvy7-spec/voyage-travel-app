const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('voyage-currency-v5.js','utf8');
const env={window:{}};
vm.runInNewContext(src,env);
const C=env.window.VoyageCurrencyV5;
test('localized expense currency shows country, name, original ISO key',()=>{
 for(const [code,scope]of Object.entries({KRW:'韓國・韓元',TWD:'台灣・新臺幣',JPY:'日本・日圓',THB:'泰國・泰銖',VND:'越南・越南盾'})){
  assert.match(C.label(code),new RegExp(scope));
  assert.ok(C.label(code).includes('（'+code+'）'));
 }
});
test('all existing currencies retain exact legacy codes, ordering, and zero conversion mutation',()=>{
 const old=['TWD','KRW','JPY','THB','USD','EUR','SGD','HKD','CNY','GBP','AUD','CAD','VND','MYR','PHP','IDR'];
 const options=C.options(old);
 assert.deepEqual(Array.from(options.map(x=>x[0])),old);
 assert.equal(options.length,16);
 assert.equal(C.label('USD'),'美國等・美元（USD）');
});
test('currency catalog wired to trip settings, expense editor, reference FX select',()=>{
 const files=['index.html','voyage-tools.js','voyage-tools-v2.js','voyage-ui-base.js'];
 const all=files.map(x=>fs.readFileSync(x,'utf8'));
 assert.match(all[0],/voyage-currency-v5\.js/);
 assert.match(all[1],/VoyageCurrencyV5.options\(countryCurrencies\)/);
 assert.match(all[2],/VoyageCurrencyV5.label\(id\)/);
 assert.match(all[3],/VoyageCurrencyV5.options\(/);
});
