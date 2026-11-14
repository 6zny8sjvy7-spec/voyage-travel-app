const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','voyage-region-v4.js'),'utf8');
function reg(){const context={window:{}};vm.createContext(context);vm.runInContext(source,context);return context.window.VoyageRegionV4}
test('four countries resolve from trip metadata, not subway station names',()=>{
 const R=reg();
 for(const pair of [['韓國','KR'],['South Korea','KR'],['泰國','TH'],['Thailand','TH'],['日本','JP'],['Japan','JP'],['越南','VN'],['Vietnam','VN']]){
  assert.equal(R.countryCode({country:pair[0]}),pair[1]);
 }
 assert.equal(R.countryCode({country:'Thailand',city:'Seoul'}),'TH');
});
test('Seoul sample routes are never selected for another country or city',()=>{
 const R=reg();
 assert.equal(R.isSeoul({country:'韓國',city:'首爾'}),true);
 assert.equal(R.isSeoul({country:'泰國',city:'首爾'}),false);
 assert.equal(R.isSeoul({country:'韓國',city:'釜山'}),false);
 assert.equal(R.isSeoul({country:'越南',city:'Hanoi'}),false);
});
test('city weather requires validated coordinates, not false zero locations',()=>{
 const R=reg();
 assert.equal(R.trustedCoords({lat:'',lon:127}),null);
 assert.equal(R.trustedCoords({lat:37,lon:null}),null);
 assert.equal(R.trustedCoords({lat:'abc',lon:127}),null);
 assert.equal(R.trustedCoords({lat:91,lon:127}),null);
 assert.equal(R.trustedCoords({lat:37,lon:181}),null);
 assert.equal(R.trustedCoords({lat:37.55,lon:126.98,needsLocation:true}),null);
 assert.equal(R.trustedCoords({lat:37.55,lon:126.98}).latitude,37.55);
});
test('four pilot region profiles indicate sources without falsely claiming realtime',()=>{
 const R=reg();
 for(const code of ['KR','TH','JP','VN']){
  const v=R.countryForCode(code);
  assert.ok(v.rail&&v.bus&&v.sources.length);
  assert.equal(v.sources.some(s=>s.type==='guaranteed-realtime'),false);
 }
});
