/* VOYAGE import V6: pasted Apple Notes text, date-first preview, unscheduled-place inbox.
   This additive module replaces only pages.import; all historic data and existing import file formats remain intact. */
(function(){
"use strict";
const U=window.VoyageUI,D=window.VoyageDomain;
if(!U||!D)return;
const {E,button,current,toast}=U;
const make=(tag,attributes={},children=[])=>E(tag,attributes,children);
const label=(text,child)=>make("label",{class:"v6-import-label"},[make("span",{text}),child]);
const absDate=s=>/^\d{4}-\d\d-\d\d$/.test(s)&&D.dayISO(s,0)===s;
const clone=v=>JSON.parse(JSON.stringify(v));
const timeValid=s=>s===""||D.validTime(s);
const tidy=s=>String(s||"").trim().replace(/^[•●\-*]\s*/, "").replace(/^\d+[.)、]\s*(?=\S)/,"").trim().slice(0,300);
function dateFromMonthDay(mm,dd,t){
 const yr=Number(String(t.startDate||"").slice(0,4))||new Date().getFullYear();
 let date=String(yr)+"-"+String(mm).padStart(2,"0")+"-"+String(dd).padStart(2,"0");
 if(!absDate(date))return "";
 if(t.startDate&&date<t.startDate){
  const rollover=String(yr+1)+"-"+String(mm).padStart(2,"0")+"-"+String(dd).padStart(2,"0");
  const diff=(Date.parse(t.startDate+"T12:00:00Z")-Date.parse(date+"T12:00:00Z"))/86400000;
  if(diff>120&&absDate(rollover))date=rollover;
 }
 return date;
}
function notesLines(raw,t){
 const result=[];let currentDate="";
 for(const original of String(raw||"").split(/\r?\n/)){
  let s=tidy(original);if(!s)continue;
  if(/^https?:\/\/\S+$/i.test(s))continue;
  let date="",match=s.match(/(?:^|\s)(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})(?:\s|$)/);
  if(match){
   const candidate=match[1]+"-"+match[2].padStart(2,"0")+"-"+match[3].padStart(2,"0");
   if(absDate(candidate))date=candidate;
   s=s.replace(match[0]," ").trim();
  }else{
   match=s.match(/(?:^|\s)(\d{1,2})[\/.-](\d{1,2})(?:\s|$)/);
   if(match){date=dateFromMonthDay(match[1],match[2],t);s=s.replace(match[0]," ").trim()}
  }
  const tm=s.match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?=\s|$)/);
  const time=tm?String(tm[1]).padStart(2,"0")+":"+tm[2]:"";
  if(tm)s=s.replace(tm[0]," ").trim();
  // A date on its own is a heading for subsequent lines, not an empty event.
  if(date&&!s){currentDate=date;continue}
  if(!s)continue;
  result.push({name:tidy(s),date:date||currentDate,time,origin:"Apple 備忘錄／貼上文字"});
 }
 return result.slice(0,150);
}
function importedRows(parsed,t){
 if(parsed.kind==="trips")return parsed;
 const rows=(parsed.rows||[]).slice(0,150).map(x=>{
  let date=x.date||"",time=D.validTime(x.time)?x.time:"";
  if(x.isoUTC){
   const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:t.tz||"UTC",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(x.isoUTC)).map(p=>[p.type,p.value]));
   date=parts.year+"-"+parts.month+"-"+parts.day;time=parts.hour+":"+parts.minute;
  }else if(!date&&Number.isInteger(x.day)&&x.origin!=="TXT"&&t.startDate){
   date=D.dayISO(t.startDate,x.day);
  }
  return {...x,date:absDate(date)?date:"",time};
 });
 return{kind:"events",rows};
}
function dayIndex(t,date){
 if(!absDate(date)||!absDate(t.startDate||""))return-1;
 const n=(Date.parse(date+"T12:00:00Z")-Date.parse(t.startDate+"T12:00:00Z"))/86400000;
 return Number.isInteger(n)&&n>=0&&n<t.days.length?n:-1;
}
function schedule(t,row){
 const i=dayIndex(t,row.date);
 if(i<0)throw Error("「"+row.name+"」的日期 "+row.date+" 不在本趟旅行期間；請先調整旅行開始日期與天數，再排入。");
 const entry={id:D.uid(),name:row.name,time:row.time,duration:Number(row.duration)||0,type:row.type||"place",notes:row.notes||"",source:row.origin||"import"};
 const exists=t.days[i].some(e=>e.name===entry.name&&e.time===entry.time);
 if(!exists)t.days[i].push(entry);
 return!exists;
}
function savedDrafts(box){
 const t=current();if(!Array.isArray(t.unplannedEvents))t.unplannedEvents=[];
 if(!t.unplannedEvents.length)return;
 const section=make("section",{class:"v1-box",id:"v6UnplannedBox"});
 section.append(make("h3",{text:"📌 未安排的地點 · "+t.unplannedEvents.length+" 筆"}),make("p",{class:"v1-sub",text:"未填日期或時間不會被系統安排到第一天。之後可以在此補上日期、時間再加入每日行程。"}));
 t.unplannedEvents.forEach(draft=>{
  const card=make("div",{class:"v6-import-card"});
  const name=make("input",{type:"text",value:draft.name||"",placeholder:"地點名稱",maxlength:"300"});
  const date=make("input",{type:"date",value:draft.date||""});
  const time=make("input",{type:"time",value:draft.time||""});
  const grid=make("div",{class:"v6-import-grid"},[label("地點",name),label("日期（可稍後選）",date),label("時間（可稍後選）",time)]);
  const saveDraft=()=>{draft.name=name.value.trim();draft.date=date.value;draft.time=time.value;save();toast("未安排地點已儲存")};
  const assign=()=>{try{
   if(!name.value.trim())throw Error("請輸入地點名稱");
   if(!date.value||!time.value)throw Error("請先選擇這個地點的日期與時間");
   if(!timeValid(time.value))throw Error("時間無效");
   const next={...draft,name:name.value.trim(),date:date.value,time:time.value};
   const added=schedule(t,next);
   t.unplannedEvents=t.unplannedEvents.filter(x=>x!==draft);
   save();render();U.showPage("import");toast(added?"已排入指定日期":"原行程已有相同項目，未重複加入");
  }catch(e){toast(e.message)}};
  const remove=()=>{if(!confirm("刪除未安排地點「"+draft.name+"」嗎？"))return;t.unplannedEvents=t.unplannedEvents.filter(x=>x!==draft);save();U.showPage("import")};
  card.append(grid,make("div",{class:"v1-actions"},[button("儲存待安排內容",saveDraft),button("排入指定日期",assign,"primary"),button("刪除此地點",remove)]));
  section.append(card)
 });
 box.append(section);
}
function showPreview(parent,parsed){
 const t=current(),items=parsed.rows.slice(0,150);
 parent.replaceChildren(make("h3",{text:"匯入預覽 · "+items.length+" 筆"}));
 if(parsed.kind==="trips"){
  parent.append(make("p",{class:"v1-sub",text:"旅行備份將新增為另一趟旅行，不會覆蓋原本的資料。"}));
  const checks=items.map(x=>{const c=make("input",{type:"checkbox"});c.checked=true;parent.append(make("div",{class:"v1-item"},[c,make("span",{text:x.name+" · "+x.city+" · "+x.days.length+" 天"})]));return c});
  parent.append(button("確認加入勾選旅行",()=>{
   const selected=items.filter((_,i)=>checks[i].checked);
   if(!selected.length){toast("請先勾選旅行");return}
   if(!confirm("新增 "+selected.length+" 趟旅行？既有資料不會覆蓋。"))return;
   const known=new Set(trips.map(x=>x.id));
   selected.forEach(src=>{const item=D.normaliseTrip(clone(src));if(known.has(item.id))item.id=D.uid();known.add(item.id);trips.push(item)});
   save();render();U.showPage("history");toast("已新增 "+selected.length+" 趟旅行")
  },"primary"));
  return;
 }
 parent.append(make("p",{class:"v1-sub",text:"逐筆修改地點、實際日期、開始時間。沒有日期或時間的項目會保存到「未安排」，不會強制排入 Day 1。"}));
 const previewCards=items.map((item,i)=>{
  const check=make("input",{type:"checkbox"});check.checked=true;
  const name=make("input",{type:"text",value:item.name||"",maxlength:"300"});
  const date=make("input",{type:"date",value:item.date||""});
  const time=make("input",{type:"time",value:item.time||""});
  const card=make("div",{class:"v6-import-card"});
  card.append(make("div",{class:"v6-import-heading"},[check,make("strong",{text:"第 "+(i+1)+" 筆 · "+(item.origin||"匯入行程")})]),make("div",{class:"v6-import-grid"},[label("想去的地點",name),label("日期（未安排可留空）",date),label("時間（未安排可留空）",time)]));
  parent.append(card);return{check,name,date,time,item};
 });
 parent.append(button("儲存勾選項目",()=>{
  const selected=previewCards.filter(x=>x.check.checked);
  if(!selected.length){toast("請先勾選至少一筆項目");return}
  const pending=[],drafts=[];
  for(const x of selected){
   const name=x.name.value.trim(),date=x.date.value,time=x.time.value;
   if(!name){toast("有項目的名稱空白，請先修正");return}
   if(date&&!absDate(date)){toast("「"+name+"」的日期無效");return}
   if(!timeValid(time)){toast("「"+name+"」的時間無效");return}
   const row={...x.item,name,date,time};
   if(date&&time){
    if(dayIndex(t,date)<0){toast("「"+name+"」日期 "+date+" 不在旅行期間。請先到旅行設定修改開始日期或新增旅行天數。");return}
    pending.push(row);
   }else drafts.push({...row,id:D.uid()});
  }
  t.unplannedEvents??=[];
  const added=pending.reduce((n,x)=>n+(schedule(t,x)?1:0),0);
  const existing=new Set(t.unplannedEvents.map(x=>[x.name,x.date||"",x.time||""].join("|")));
  let preserved=0;
  drafts.forEach(x=>{const k=[x.name,x.date||"",x.time||""].join("|");if(!existing.has(k)){t.unplannedEvents.push(x);existing.add(k);preserved++}});
  save();render();U.showPage("import");toast("已排入 "+added+" 筆；另保存 "+preserved+" 筆未安排地點");
 },"primary"));
}
U.pages.import=box=>{
 const t=current();
 box.append(make("p",{class:"v1-notice",text:"不用先把 Apple 備忘錄另存檔案：直接複製文字貼進來，預覽後再選日期、時間。也支援 JSON／CSV／ICS／TXT 檔案；既有旅行不會被覆寫。"}));
 const notes=make("textarea",{id:"v6NotesPaste",rows:"7",placeholder:"從備忘錄複製貼上，例如：\n明洞逛街\n聖水洞\n11/20 14:00 景福宮\n弘大烤肉"});
 const section=make("section",{class:"v1-box"});
 section.append(make("h3",{text:"📋 貼上備忘錄文字"}),label("想去的地點／原始備忘錄內容",notes));
 const preview=make("div",{id:"v6ImportPreview"});
 section.append(button("預覽貼上的地點",()=>{
  const input=notes.value.trim();
  if(!input){toast("請先貼上備忘錄文字");return}
  const rows=notesLines(input,t);
  if(!rows.length){toast("沒有找到可匯入的地點");return}
  showPreview(preview,{kind:"events",rows});
 },"primary"));
 box.append(section);
 const file=make("input",{type:"file",accept:".json,.csv,.ics,.txt,application/json,text/plain,text/csv,text/calendar",id:"vImportFile"});
 const files=make("details",{class:"v6-import-files"});
 files.append(make("summary",{text:"📂 其他方式：選擇 JSON／CSV／ICS／TXT 檔案"}),file);
 file.onchange=async()=>{
  const f=file.files?.[0];if(!f)return;
  try{
   if(f.size>1500000)throw Error("檔案大小上限 1.5 MB");
   const text=await f.text();
   const parsed=f.name.toLowerCase().endsWith(".txt")?{kind:"events",rows:notesLines(text,t)}:importedRows(D.parseImport(f.name,text),t);
   if(!parsed.rows.length)throw Error("沒有可匯入的資料");
   showPreview(preview,parsed);
  }catch(e){preview.replaceChildren(make("p",{class:"v1-warning",text:"讀取檔案失敗："+e.message}))}
 };
 box.append(files,preview);
 savedDrafts(box);
};
const css=make("style",{text:".v6-import-card{padding:12px;margin:11px 0;border:1px solid var(--line);border-radius:15px;background:var(--card)}.v6-import-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.v6-import-label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted)}.v6-import-label input{width:100%;min-width:0;font-size:15px;padding:9px}.v6-import-heading{display:flex;align-items:center;gap:8px;margin-bottom:9px}.v6-import-files{margin:14px 0;padding:12px;border:1px solid var(--line);border-radius:12px}.v6-import-files summary{cursor:pointer}#v6NotesPaste{width:100%;min-height:120px;font-size:15px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--ink)}@media(max-width:600px){.v6-import-grid{grid-template-columns:1fr 1fr}.v6-import-grid label:first-child{grid-column:1/-1}}"});
document.head.append(css);
})();
