/* Run with node --test tests/voyage.test.cjs */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
function domain(){const g={window:{},Date,Intl};vm.createContext(g);vm.runInContext(read("voyage-domain.js"),g);return g.window.VoyageDomain}
test("CSV handles quoted comma and quote",()=>{const D=domain();assert.equal(D.parseCSV('name,time,day\n"市場,美食",09:30,2')[0].name,"市場,美食");assert.equal(D.parseCSV('name\n"He said ""hi"""')[0].name,'He said "hi"')});
test("ICS events parse real local timestamps",()=>{const D=domain();const rows=D.parseICS("BEGIN:VEVENT\nSUMMARY:Check-in\nDTSTART:20261220T150000\nDTEND:20261220T163000\nEND:VEVENT");assert.equal(rows[0].date,"2026-12-20");assert.equal(rows[0].duration,90)});
test("time collision does not change source",()=>{const D=domain(),arr=[{time:"10:00",duration:90},{time:"11:00",duration:20}];assert.equal(D.conflicts(arr).length,1);assert.equal(arr[0].time,"10:00")});
test("splitting exact cents",()=>{const D=domain(),r=D.shareBalances([{amount:100.01,paidBy:"A",sharedWith:["A","B","C"]}],["A","B","C"]);assert.equal(r.transfers.length,2);assert.equal(Math.round(r.transfers.reduce((a,x)=>a+x.amount,0)*100),6667)});
test("reject invalid backup and date turnover",()=>{const D=domain();assert.throws(()=>D.parseImport("bad.json",'{"trips":[{"days":"invalid"}]}'));assert.equal(D.dayISO("2026-12-31",1),"2027-01-01")});
class FakeElement{
 constructor(tag="div",ids){this.tagName=tag;this.ids=ids;this.children=[];this.style={};this.dataset={};this.className="";this.value="";this.textContent="";this.checked=false;this.classList={add(){},remove(){},toggle(){return false},contains(){return false}};this.innerHTML=""}
 setAttribute(k,v){if(k==="id")this.ids.set(String(v),this);this[k]=v}
 append(...children){this.children.push(...children)}
 replaceChildren(...children){this.children=children}
 querySelectorAll(){return []}
 querySelector(){return null}
 scrollIntoView(){}
 after(x){this.children.push(x)}
 showModal(){this.open=true}
 close(){this.open=false}
 remove(){}
 click(){if(this.onclick)this.onclick({preventDefault(){}})}
}
function uiEnv(){
 const ids=new Map(),createElement=tag=>new FakeElement(tag,ids);
 const preIds=["itinerary","mapSection","transportSection","events","week","moreSection","settingsToggle","transitFrom","transitTo","transitTime","transitDuration","transitLine","addTransit","v1Menu","v1Content","v1DialogTitle","v1DialogClose","v1DialogWarning","v1DialogForm","v1DialogFields","v1Cancel","vWalkMin","vWaitMin","vTransfers","vTransitRoute","transitStops"];
 preIds.forEach(id=>{const n=createElement("div");n.id=id;ids.set(id,n)});
 const document={head:createElement("head"),body:createElement("body"),createElement,getElementById(id){if(!ids.has(id)){const n=createElement("div");n.id=id;ids.set(id,n)}return ids.get(id)},querySelector(){return this.getElementById("main-shell")}};
 const storage=()=>{const values=new Map();return{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}};
 const location={href:"https://example.test/voyage/",origin:"https://example.test",pathname:"/voyage/",search:"",hash:""};
 const ctx={document,console,Date,Intl,Math,JSON,URL,TextEncoder,Set,Map,Number,String,Array,Error,RegExp,setTimeout(fn){/* timers are not required for smoke tests */},navigator:{clipboard:{writeText:async()=>{}}},location,history:{replaceState(){}},localStorage:storage(),sessionStorage:storage(),confirm(){return true},prompt(_m,defaultVal){return defaultVal||""},fetch:async()=>{throw Error("network unavailable")},crypto:{randomUUID:()=>"mock-"+Math.random()}};
 ctx.window=ctx;
 vm.createContext(ctx);
 vm.runInContext('let trips=[{id:"seed",name:"Test",city:"Seoul",country:"韓國",tz:"Asia/Seoul",days:[[{name:"Start",time:"09:00",duration:30}],[{name:"Next",time:"11:00"}]]}],active=0,day=0,weekMode=false;const trip=()=>trips[active];let saveCount=0;function save(){saveCount++}function render(){}function renderWeek(){}function setTab(){}function syncView(){}',ctx);
 ["voyage-domain.js","voyage-ui-base.js","voyage-tools.js","voyage-import-translate.js","voyage-cloud.js"].forEach(filename=>vm.runInContext(read(filename),ctx,{filename}));
 return {ctx,ids,expression:s=>vm.runInContext(s,ctx)};
}
test("UI modules load and each more page renders without crash",()=>{
 const {ctx}=uiEnv(),U=ctx.VoyageUI;
 for(const n of ["overview","expenses","packing","documents","translation","import","history","collab"]){assert.equal(typeof U.pages[n],"function",n);assert.doesNotThrow(()=>U.pages[n](ctx.document.createElement("section")),n)}
 assert.equal(typeof U.addExpense,"function");
});
test("add an expense through the actual modal submit",()=>{
 const {ctx,ids,expression}=uiEnv();ctx.VoyageUI.addExpense();
 for(const [id,value] of Object.entries({vExTitle:"晚餐",vExAmount:"120",vExRate:"0.025",vExPaid:"我",vExShare:"我",vExCurrency:"KRW"}))ids.get(id).value=value;
 ids.get("v1DialogForm").onsubmit({preventDefault(){}});
 assert.equal(expression("trips[0].expenses.length"),1);
 assert.equal(expression("trips[0].expenses[0].twd"),3);
});
test("create an itinerary event without replacing previous events",()=>{
 const {ctx,ids,expression}=uiEnv();ctx.VoyageUI.eventEditor(0,true);
 for(const [id,value] of Object.entries({vEvName:"Museum",vEvTime:"13:00",vEvDuration:"60",vEvURL:"",vEvType:"place",vEvNotes:"note",vEvCost:"0",vEvFrom:"",vEvTo:"",vEvLine:""}))ids.get(id).value=value;
 ids.get("v1DialogForm").onsubmit({preventDefault(){}});
 assert.equal(expression("trips[0].days[0].length"),2);
 assert.equal(expression("trips[0].days[0][0].name"),"Start");
});
test("cloud upload must not be active without explicit project config",()=>{const {ctx}=uiEnv();assert.equal(ctx.localStorage.getItem("voyage-cloud-settings-v1"),null);assert.ok(ctx.VoyageUI.pages.collab)});
