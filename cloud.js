/* GIS token stays in memory; only app-created Drive files are requested. */
const Cloud = (() => {
 let token='', expires=0, book='', baseline=null, writing=false;
 const scope='https://www.googleapis.com/auth/drive.file';
 const empty=()=>({version:'5-R2',settings:{title:'Cashflow Manager',subtitle:'',language:'ja',baseCurrency:'JPY',theme:'light',iconColor:'#176da1'},accounts:[],transactions:[],details:[],budgets:[]});
 async function api(url,method='GET',body) {
  if(!token||Date.now()>expires) throw Error('Google接続の有効期限です。再接続してください。');
  const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  if(!r.ok) throw Error(`Google API ${r.status}: ${(await r.text()).slice(0,250)}`);
  return r.status===204?{}:r.json();
 }
 const sheet=(path)=>`https://sheets.googleapis.com/v4/spreadsheets/${book}${path}`;
 function key(v){return String(v.id??JSON.stringify([v.kind,v.label]));}
 function diff(old,next){const ops=[]; for(const table of ['accounts','transactions','details','budgets']){const a=new Map((old[table]||[]).map(v=>[key(v),v])),b=new Map((next[table]||[]).map(v=>[key(v),v])); for(const [id,v] of b)if(JSON.stringify(a.get(id))!==JSON.stringify(v))ops.push({table,id,value:v}); for(const id of a.keys())if(!b.has(id))ops.push({table,id,value:null});}for(const [id,value] of Object.entries(next.settings))if(old.settings[id]!==value)ops.push({table:'settings',id,value});return ops;}
 function replay(rows){const d=empty(),seen=new Set();for(const row of rows){if(!row[0]||seen.has(row[0]))continue;seen.add(row[0]);const op=JSON.parse(row[2]);if(op.table==='settings')d.settings[op.id]=op.value;else if(['accounts','transactions','details','budgets'].includes(op.table)){d[op.table]=d[op.table].filter(v=>key(v)!==op.id);if(op.value!==null)d[op.table].push(op.value);}}return d;}
 async function read(){const r=await api(sheet('/values/Events!A2:C'));return replay(r.values||[]);}
 async function load(){const d=await read();
 for(const t of d.transactions)if(t.baseCurrency!==d.settings.baseCurrency){const r=await rate(t.date,t.currency,d.settings.baseCurrency);Object.assign(t,{rate:r.rate,rateDate:r.date,rateSource:r.source,baseCurrency:d.settings.baseCurrency,baseAmount:Math.round(t.amount*r.rate*100)/100});}
 for(const a of d.accounts)if(a.baseCurrency!==d.settings.baseCurrency){const r=await rate(a.openingDate,a.currency,d.settings.baseCurrency);Object.assign(a,{openingRate:r.rate,openingRateDate:r.date,baseCurrency:d.settings.baseCurrency,openingBase:Math.round(a.openingAmount*r.rate*100)/100});}
 for(const b of d.budgets)if(b.currency!==d.settings.baseCurrency){const r=await rate(b.month+'-01',b.currency,d.settings.baseCurrency);b.amount=Math.round(b.amount*r.rate*100)/100;b.currency=d.settings.baseCurrency;}
 baseline=structuredClone(d);return d;}
 async function refresh(){if(writing)throw Error('保存中');return load();}
 async function upload(blob){
 const boundary='cf_'+crypto.randomUUID();
 const metadata=JSON.stringify({name:'Receipt-'+new Date().toISOString(),appProperties:{cashflowReceipt:book}});
 const body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+metadata+'\r\n--'+boundary+'\r\nContent-Type: '+(blob.type||'application/octet-stream')+'\r\n\r\n',blob,'\r\n--'+boundary+'--']);
 if(!token||Date.now()>expires)throw Error('Googleに再接続してください');
 const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body});if(!r.ok)throw Error('画像の保存に失敗しました');return (await r.json()).id;
 }

 async function save(d){if(writing)throw Error('保存処理中です。');writing=true;try{const ops=diff(baseline||empty(),d), rows=ops.map(op=>[crypto.randomUUID(),new Date().toISOString(),JSON.stringify(op)]);if(rows.some(r=>r[2].length>45000))throw Error('1件のデータが大きすぎます。');if(rows.length)await api(sheet('/values/Events!A:C:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS'),'POST',{values:rows});return {data:await load()};}finally{writing=false;}}
 async function connect(response,preserve=false){const oldBaseline=baseline,oldBook=book;token=response.access_token;expires=Date.now()+(Number(response.expires_in)-60)*1000; const q="trashed=false and mimeType='application/vnd.google-apps.spreadsheet' and appProperties has { key='cashflow' and value='5-R2' }";const list=await api('https://www.googleapis.com/drive/v3/files?fields=files(id,name)&q='+encodeURIComponent(q));if(list.files.length>1)throw Error('専用台帳が複数あります。Driveで不要な空台帳を整理してください。');book=list.files[0]?.id||'';
 if(!book){const f=await api('https://www.googleapis.com/drive/v3/files','POST',{name:'Cashflow Manager Ver.5-R2',mimeType:'application/vnd.google-apps.spreadsheet',appProperties:{cashflow:'5-R2'}});book=f.id;}
 const meta=await api(sheet('?fields=sheets.properties'));if(!meta.sheets.some(s=>s.properties.title==='Events'))await api(sheet(':batchUpdate'),'POST',{requests:[{addSheet:{properties:{title:'Events'}}}]});await api(sheet('/values/Events!A1:C1?valueInputOption=RAW'),'PUT',{values:[['EventID','SavedAt','ChangeJSON']]});
 if(!meta.sheets.some(s=>s.properties.title==='Launch')){await api(sheet(':batchUpdate'),'POST',{requests:[{addSheet:{properties:{title:'Launch'}}}]});}
 await api(sheet('/values/Launch!A1:B2?valueInputOption=RAW'),'PUT',{values:[['Cashflow Manager Ver.5-R2',location.href.split('?')[0].split('#')[0]],['Open app / アプリを開く','B1 の URL をクリックしてください']]});
 const fresh=await load();if(oldBook&&oldBook!==book){token="";book=oldBook;baseline=oldBaseline;throw Error("別のGoogleアカウントです。ログアウト後に接続してください。");}if(oldBaseline&&preserve)baseline=oldBaseline;return fresh;}
 async function rate(date,from,to){if(from===to)return {rate:1,date,source:'Same currency'};const r=await fetch(`https://api.frankfurter.dev/v2/rate/${from}/${to}?date=${date}`);if(!r.ok)throw Error('為替取得に失敗しました。');const d=await r.json();if(!(d.rate>0))throw Error('為替データ不正');return {...d,source:'Frankfurter'};}
 async function rebase(data,to){const d=structuredClone(data);for(const t of d.transactions){const r=await rate(t.date,t.currency,to);Object.assign(t,{rate:r.rate,rateDate:r.date,rateSource:r.source,baseCurrency:to,baseAmount:Math.round(t.amount*r.rate*100)/100});}for(const a of d.accounts){const r=await rate(a.openingDate,a.currency,to);a.baseCurrency=to;a.openingRate=r.rate;a.openingRateDate=r.date;a.openingBase=Math.round(a.openingAmount*r.rate*100)/100;}for(const b of d.budgets||[]){const r=await rate(b.month+'-01',b.currency||d.settings.baseCurrency,to);b.amount=Math.round(b.amount*r.rate*100)/100;b.currency=to;}d.settings.baseCurrency=to;return (await save(d)).data;}
 return {scope,empty,diff,replay,connect,load,refresh,upload,save,rate,rebase,get ready(){return !!token;},get url(){return `https://docs.google.com/spreadsheets/d/${book}/edit`;},async call(name,args){if(name==='saveAppData')return save(args[0]);if(name==='fetchHistoricalRate')return rate(...args);if(name==='rebaseAppData')return rebase(...args);if(name==='clearAllData'){if(args[0]!=='CLEAR')throw Error('Confirmation required');return (await save(empty())).data;}if(name==='createDriveLauncher')return {ready:true,driveFileUrl:this.url};throw Error(name);}};
})();
