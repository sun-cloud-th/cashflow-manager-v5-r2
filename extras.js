'use strict';
const extraLabels={
 ja:{connect:'Googleに接続／再接続',cloudSync:'クラウド同期',retrySave:'保存を再試行',logout:'ログアウト',backup:'JSONバックアップ',budget:'月次支出予算',budgetDetails:'予算・内訳差額',scan:'レシート・請求書を撮影',scanReview:'読み取り結果を確認',ocrHint:'読み取りには誤りがあります。日付・通貨・合計を確認してから支出を登録してください。画像は専用台帳と同じGoogleアカウントに保存します。',useScan:'画像を保存して支出入力へ',difference:'予算残額',actual:'実支出',connected:'接続済み',offline:'未接続',save:'保存',done:'完了',cancel:'キャンセル'},
 en:{connect:'Connect / reconnect Google',cloudSync:'Cloud sync',retrySave:'Retry save',logout:'Sign out',backup:'JSON backup',budget:'Monthly expense budget',budgetDetails:'Budget details',scan:'Scan receipt / invoice',scanReview:'Review scanned text',ocrHint:'OCR can be wrong. Check date, currency and total before saving the expense. The image is saved to the same Google account as your ledger.',useScan:'Save image and enter expense',difference:'Budget remaining',actual:'Actual expense',connected:'Connected',offline:'Not connected',save:'Save',done:'Done',cancel:'Cancel'},
 th:{connect:'เชื่อมต่อ Google อีกครั้ง',cloudSync:'ซิงค์ข้อมูล',retrySave:'ลองบันทึกอีกครั้ง',logout:'ออกจากระบบ',backup:'สำรองข้อมูล JSON',budget:'งบรายจ่ายรายเดือน',budgetDetails:'รายละเอียดงบประมาณ',scan:'สแกนใบเสร็จ / ใบแจ้งหนี้',scanReview:'ตรวจสอบข้อความ',ocrHint:'OCR อาจผิดพลาด โปรดตรวจสอบวันที่ สกุลเงิน และยอดรวมก่อนบันทึก รูปภาพจะบันทึกในบัญชี Google เดียวกับสมุดบัญชี',useScan:'บันทึกรูปและกรอกรายจ่าย',difference:'งบคงเหลือ',actual:'รายจ่ายจริง',connected:'เชื่อมต่อแล้ว',offline:'ยังไม่เชื่อมต่อ',save:'บันทึก',done:'เสร็จสิ้น',cancel:'ยกเลิก'}
};
Object.assign(extraLabels.ja,{clearWarning:'必要なら先にJSONバックアップを保存してください。変更履歴と画像はDriveに残ります。',driveLauncher:'Google Driveの台帳',openLauncher:'台帳を開く（Launchタブからアプリへ）',recreateLauncher:'リンクを更新',launcherCreated:'リンクを更新しました',confirmClear:'現在の収支・口座・予算・設定をクリアしますか？変更履歴と画像はDriveに残ります。完全削除はDriveから行ってください。'});
Object.assign(extraLabels.en,{clearWarning:'Export a JSON backup first if needed. History and images remain in Drive.',driveLauncher:'Google Drive ledger',openLauncher:'Open ledger (Launch tab opens app)',recreateLauncher:'Refresh link',launcherCreated:'Link refreshed',confirmClear:'Reset current transactions, accounts, budgets and settings? History and images remain in Drive. Delete them from Drive for permanent removal.'});
Object.assign(extraLabels.th,{clearWarning:'สำรองข้อมูล JSON ก่อนหากจำเป็น ประวัติและรูปภาพยังอยู่ใน Drive',driveLauncher:'สมุดบัญชี Google Drive',openLauncher:'เปิดสมุดบัญชี (แท็บ Launch)',recreateLauncher:'อัปเดตลิงก์',launcherCreated:'อัปเดตลิงก์แล้ว',confirmClear:'ล้างรายการ บัญชี งบประมาณ และการตั้งค่าปัจจุบันหรือไม่? ประวัติและรูปภาพยังอยู่ใน Drive หากต้องการลบถาวรให้ลบใน Drive'});
for(const lang of Object.keys(extraLabels))Object.assign(i18n[lang],extraLabels[lang]);
const authLabels={
 ja:{connect:'Googleでログイン／再試行',authIntro:'Googleアカウントで始める',rememberHint:'この端末で30日間ログインを維持します。共有端末では使用後にログアウトしてください。',accountConnection:'アカウント・データ管理',logoutAll:'全端末ログアウト',restoring:'接続を確認しています…',reconnectHint:'ログインの有効期限が切れました。もう一度接続してください。',offlineConsent:'継続利用の許可が必要です。Googleアカウントの連携を解除し、再度ログインしてください。',discardLogout:'未保存の変更を破棄してログアウトしますか？',confirmLogoutAll:'このアプリに接続した全端末をログアウトしますか？',storageUnavailable:'端末の保存機能が使えないため、次回はログインが必要です。'},
 en:{connect:'Sign in with Google / retry',authIntro:'Continue with your Google account',rememberHint:'Stay signed in for 30 days on this device. Sign out after using a shared device.',accountConnection:'Account and data',logoutAll:'Sign out all devices',restoring:'Restoring connection…',reconnectHint:'Your session expired. Please sign in again.',offlineConsent:'Offline consent is required. Remove this app from your Google connections and sign in again.',discardLogout:'Discard unsaved changes and sign out?',confirmLogoutAll:'Sign out all devices connected to this app?',storageUnavailable:'Browser storage is unavailable. Sign-in will be required next time.'},
 th:{connect:'เข้าสู่ระบบ Google / ลองอีกครั้ง',authIntro:'เริ่มต้นด้วยบัญชี Google',rememberHint:'คงการเข้าสู่ระบบ 30 วันบนอุปกรณ์นี้ โปรดออกจากระบบเมื่อใช้เครื่องร่วมกัน',accountConnection:'บัญชีและข้อมูล',logoutAll:'ออกจากระบบทุกอุปกรณ์',restoring:'กำลังกู้คืนการเชื่อมต่อ…',reconnectHint:'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',offlineConsent:'ต้องอนุญาตการใช้งานต่อเนื่อง ยกเลิกการเชื่อมต่อแอปในบัญชี Google แล้วเข้าสู่ระบบใหม่',discardLogout:'ละทิ้งการเปลี่ยนแปลงที่ยังไม่บันทึกและออกจากระบบหรือไม่?',confirmLogoutAll:'ออกจากระบบทุกอุปกรณ์ที่เชื่อมต่อแอปนี้หรือไม่?',storageUnavailable:'ไม่สามารถบันทึกในเบราว์เซอร์ได้ ครั้งหน้าต้องเข้าสู่ระบบใหม่'}
};
for(const lang of Object.keys(authLabels))Object.assign(I[lang],authLabels[lang]);
let pendingReceipt=null,scanBlob=null,connecting=false;
function newId(){return Date.now()*1000+crypto.getRandomValues(new Uint16Array(1))[0]%1000;}
function renderBudget(){
 const rows=(D.budgets||[]).filter(b=>b.month===selected());const total=rows.reduce((n,b)=>n+Number(b.amount),0),expense=monthSummary(selected()).expense,diff=total-expense;
 $('budgetSummary').textContent=`${compactMonth(selected())} · ${fmt(total)} / ${tr('actual')}: ${fmt(expense)} / ${tr('difference')}: ${fmt(diff)} (${total?(diff/total*100).toFixed(1)+'%':'—'})`;
 const used={};for(const t of D.transactions)if(t.kind==='expense'&&t.date.slice(0,7)===selected())used[t.detail]=(used[t.detail]||0)+t.baseAmount;
 const names=[...new Set([...rows.map(b=>b.detail),...Object.keys(used)])];
 $('budgetRows').innerHTML=names.map(name=>{const b=rows.find(b=>b.detail===name),a=b?.amount||0,e=used[name]||0;return `<div class="account"><div><strong>${esc(name)}</strong><small>${fmt(a)} / ${tr('actual')}: ${fmt(e)}<br>${tr('difference')}: ${fmt(a-e)} (${a?((a-e)/a*100).toFixed(1)+'%':'—'})</small></div><div><button class="btn" data-budget-edit="${esc(name)}">✎</button>${b?`<button class="btn" data-budget-delete="${esc(b.id)}">×</button>`:''}</div></div>`;}).join('')||tr('noData');
 $('budgetNames').innerHTML=[...new Set(D.details.filter(d=>d.kind==='expense').map(d=>d.label))].map(n=>`<option value="${esc(n)}">`).join('');
}
$('budgetOpen').onclick=()=>{renderBudget();$('budgetDialog').showModal();};
$('budgetSave').onclick=()=>{const detail=$('budgetDetail').value.trim(),amount=Number($('budgetAmount').value);if(!detail||!Number.isFinite(amount)||amount<0)return toast(tr('inputError'));const id=JSON.stringify([selected(),detail]);const b={id,month:selected(),detail,amount,currency:D.settings.baseCurrency};D.budgets=(D.budgets||[]).filter(x=>x.id!==id);D.budgets.push(b);sync();};
$('budgetRows').onclick=e=>{const edit=e.target.closest('[data-budget-edit]'),del=e.target.closest('[data-budget-delete]');if(edit){$('budgetDetail').value=edit.dataset.budgetEdit;$('budgetAmount').value=D.budgets.find(b=>b.month===selected()&&b.detail===edit.dataset.budgetEdit)?.amount||0;}if(del&&confirm(tr('confirmDelete'))){D.budgets=D.budgets.filter(b=>b.id!==del.dataset.budgetDelete);sync();}};
function lock(value){document.querySelector('main').inert=value;$('settingsBtn').disabled=value;for(const id of ['pull','retry','backup','scan'])$(id).disabled=value;}
async function enter() {
 busy(true);$('connect').disabled=true;$('authMessage').textContent=tr('restoring');
 try{
  const r=await Auth.token();
  if(U?.sub&&U.sub!==r.user.sub)throw Error('別のアカウントです。ログアウトしてから接続してください。');
  const previous=D,data=await Cloud.connect(r,dirty);D=dirty?previous:data;
  U={sub:r.user.sub,displayName:r.user.name,email:r.user.email};L={ready:true,driveFileUrl:Cloud.url};
  lock(false);document.querySelector('main').hidden=false;$('authGate').hidden=true;$('syncBar').hidden=false;
  render();$('accountIdentity').textContent=U.email;$('cloudStatus').textContent=tr('connected');$('retry').hidden=!dirty;
 }catch(e){$('authGate').hidden=false;$('authMessage').textContent=authError(e);fail(e);}finally{busy(false);$('connect').disabled=false;}
}
function authError(e){
 if(e.message==='REAUTH_REQUIRED')return tr('reconnectHint');
 if(e.message==='OFFLINE_CONSENT_REQUIRED')return tr('offlineConsent');
 return e.message;
}
$('connect').onclick=()=>{
 if(Auth.saved)return enter();
 if(connecting)return;
 if(!window.google?.accounts?.oauth2)return toast('Google Identity Servicesを読み込めません。ネット接続を確認してください。');
 if(!CASHFLOW_CONFIG.clientId||CASHFLOW_CONFIG.clientId.startsWith('YOUR_'))return toast('config.js に OAuth クライアントIDを設定してください。');
 connecting=true;$('connect').disabled=true;
 google.accounts.oauth2.initCodeClient({client_id:CASHFLOW_CONFIG.clientId,scope:Cloud.scope+' openid email profile',ux_mode:'popup',select_account:true,
 error_callback:e=>{connecting=false;$('connect').disabled=false;$('authMessage').textContent=e.type;},
 callback:async r=>{
  connecting=false;$('connect').disabled=false;if(r.error){$('authMessage').textContent=r.error;return;}
  busy(true);try{await Auth.login(r.code);await enter();}catch(e){$('authMessage').textContent=authError(e);fail(e);}finally{busy(false);}
 }}).requestCode();
};
async function pull(){if(!Cloud.ready||dirty||document.querySelector('dialog[open]')||$('busy').style.display==='grid')return;busy(true);try{D=await Cloud.refresh();render();$('cloudStatus').textContent=tr('connected')+' '+new Date().toLocaleTimeString();}catch(e){$('cloudStatus').textContent=authError(e);}finally{busy(false);}}
$('pull').onclick=pull;$('retry').onclick=()=>sync();
async function leave(all){if(dirty&&!confirm(tr('discardLogout')))return;if(all&&!confirm(tr('confirmLogoutAll')))return;busy(true);try{await Auth.logout(all);dirty=false;location.reload();}catch(e){if(e.status===401){dirty=false;location.reload();return;}fail(e);}finally{busy(false);}}
$('logout').onclick=()=>leave(false);$('logoutAll').onclick=()=>leave(true);
window.addEventListener('auth-required',()=>{$('authGate').hidden=false;$('authMessage').textContent=tr('reconnectHint');$('cloudStatus').textContent=tr('offline');});
window.addEventListener('auth-storage-unavailable',()=>toast(tr('storageUnavailable')));
$('backup').onclick=()=>{const blob=new Blob([JSON.stringify(D,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cashflow-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('focus',pull);setInterval(pull,60000);
$('scan').onclick=()=>{$('scanFile').value='';$('scanFile').click();};
async function loadOCR(){if(window.Tesseract)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(Error('OCRライブラリを取得できません'));document.head.append(s);});}
$('scanFile').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;if(file.size>15*1024*1024)return fail('画像は15MB以下にしてください。');scanBlob=file;$('ocrText').value='';$('ocrUse').disabled=true;$('ocrDialog').showModal();let worker;
 try{await loadOCR();worker=await Tesseract.createWorker(({ja:'jpn+eng',en:'eng',th:'tha+eng'})[language()],1,{logger:m=>{$('ocrProgress').textContent=`${m.status} ${Math.round((m.progress||0)*100)}%`;}});const r=await worker.recognize(file);$('ocrText').value=r.data.text;$('ocrProgress').textContent='✓';$('ocrUse').disabled=false;}catch(e){fail(e);$('ocrProgress').textContent=e.message;}finally{if(worker)await worker.terminate();}
};
$('ocrUse').onclick=async()=>{
 busy(true);try{const receiptId=await Cloud.upload(scanBlob);const text=$('ocrText').value;$('ocrDialog').close();openTx('expense');pendingReceipt=receiptId;$('txMemo').value=text.slice(0,6000);const date=text.match(/(20\d{2})[\/年.\-](\d{1,2})[\/月.\-](\d{1,2})/);if(date)$('txDate').value=`${date[1]}-${date[2].padStart(2,'0')}-${date[3].padStart(2,'0')}`;
 const totalLine=text.split('\n').filter(l=>/合計|総額|grand total|amount due|ยอดรวม|total/i.test(l)&&!/subtotal|小計/i.test(l)).pop();if(totalLine){const n=totalLine.match(/\d[\d,]*(?:\.\d{1,2})?/g);if(n)$('txAmount').value=n.at(-1).replaceAll(',','');}
 const cur=/฿|THB/.test(text)?'THB':/Rp\b|IDR/.test(text)?'IDR':/USD|\$/.test(text)?'USD':/JPY|円|¥|￥/.test(text)?'JPY':D.settings.baseCurrency;$('txCurrency').value=cur;fetchRate();}catch(e){fail(e);}finally{busy(false);}
};
init();lock(true);$('cloudStatus').textContent=tr('offline');if(Auth.saved)enter();
