const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const crypto=require('node:crypto').webcrypto;
const ctx=vm.createContext({crypto,structuredClone,Date,URL,console});vm.runInContext(fs.readFileSync(__dirname+'/cloud.js','utf8')+';globalThis.C=Cloud;',ctx);const C=ctx.C;
let count=0;function test(name,f){f();count++;console.log('PASS',name);}
const event=(op,n)=>[String(n),'2026-09-05T00:00:00Z',JSON.stringify(op)];
test('unchanged state has no writes',()=>assert.equal(C.diff(C.empty(),C.empty()).length,0));
test('independent device inserts survive merge',()=>{const a=C.empty(),b=C.empty();a.transactions.push({id:1,detail:'A'});b.transactions.push({id:2,detail:'B'});const ops=[...C.diff(C.empty(),a),...C.diff(C.empty(),b)];const d=C.replay(ops.map(event));assert.equal(d.transactions.length,2);});
test('same record last append wins; duplicated event is ignored',()=>{const op={table:'transactions',id:'1',value:{id:1,amount:10}},later={...op,value:{id:1,amount:20}};const d=C.replay([event(op,1),event(later,2),event(op,1)]);assert.equal(d.transactions.length,1);assert.equal(d.transactions[0].amount,20);});
test('deleting a known record does not delete another device record',()=>{const before=C.empty();before.transactions=[{id:1}];const deletion=C.diff(before,C.empty());const d=C.replay([event({table:'transactions',id:'1',value:{id:1}},1),event({table:'transactions',id:'2',value:{id:2}},2),...deletion.map((x,i)=>event(x,i+3))]);assert.equal(d.transactions.length,1);assert.equal(d.transactions[0].id,2);});
test('budgets and individual settings survive replay',()=>{const d=C.empty();d.budgets=[{id:'b',amount:100,month:'2026-09'}];d.settings.language='th';const out=C.replay(C.diff(C.empty(),d).map(event));assert.equal(out.settings.language,'th');assert.equal(out.budgets[0].amount,100);});
const html=fs.readFileSync(__dirname+'/index.html','utf8');
test('all inline JavaScript parses',()=>{for(const [,code] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(code);new vm.Script(fs.readFileSync(__dirname+'/extras.js','utf8'));});
console.log(`${count} tests passed`);
const chartSource=html.slice(html.indexOf('    function renderChart('),html.indexOf('    function accountAt('));
const elements={};const dom=id=>elements[id]||(elements[id]={style:{},classes:{},classList:{toggle(k,v){elements[id].classes[k]=v;}}});
const chartContext=vm.createContext({$:dom,P:1,fmt:String,compactMonth:String});vm.runInContext(chartSource,chartContext);
test('monthly keeps cashflow frame and removes balance frame; wider class applies only monthly',()=>{const rows=[{key:'2026-09',income:100,expense:80,closing:10000}];for(const period of [1,6,12,60,1]){chartContext.P=period;chartContext.renderChart(rows);assert.equal(dom('cashflowPanel').hidden,false);assert.equal(dom('balancePanel').hidden,period===1);assert.equal(dom('cashflowChart').classes['single-month'],period===1);assert.equal(dom('balanceChart').innerHTML==='',period===1);}});
console.log(`${count} total tests passed`);
