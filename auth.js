/* Long-lived Google refresh tokens never enter the browser. */
const Auth=(()=>{
 const storageKey='cashflow-session:'+CASHFLOW_CONFIG.clientId+':'+CASHFLOW_CONFIG.authServer;
 let saved=null,cached=null,inflight=null,user=null,force=false;
 try{saved=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{}
 function clear(){saved=null;cached=null;user=null;try{localStorage.removeItem(storageKey);}catch{}}
 async function request(path,data={},attempt=0){
  const base=CASHFLOW_CONFIG.authServer;
  if(!base||!/^https:\/\//.test(base)&&!/^http:\/\/localhost:\d+$/.test(base))throw Error('認証サーバーのURLをconfig.jsに設定してください。');
  const r=await fetch(base.replace(/\/$/,'')+path,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest',...(saved?{Authorization:'Bearer '+saved.token}:{})},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(20000)});
  const d=await r.json().catch(()=>({error:"認証サーバーを利用できません。しばらく待って再試行してください。"}));if(d.error==='TOKEN_REFRESH_BUSY'&&attempt<3){await new Promise(resolve=>setTimeout(resolve,1000));return request(path,data,attempt+1);}if(!r.ok){if(r.status===401){clear();window.dispatchEvent(new Event('auth-required'));}throw Object.assign(Error(d.error||'AUTH_SERVER_ERROR'),{status:r.status});}return d;
 }
 async function token(){
  if(!saved)throw Object.assign(Error('REAUTH_REQUIRED'),{status:401});
  if(cached&&cached.until>Date.now()+60000&&cached.checked>Date.now()-60000)return cached.response;
  if(inflight)return inflight;
  inflight=request('/auth/token',{force}).then(d=>{force=false;user=d.user;cached={checked:Date.now(),until:Date.now()+d.expires_in*1000,response:d};return d;}).finally(()=>inflight=null);return inflight;
 }
 async function login(code){const d=await request('/auth/code',{code});saved={token:d.session,expires:d.sessionExpires};cached=null;try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{window.dispatchEvent(new Event('auth-storage-unavailable'));}return token();}
 async function logout(all=false){if(saved)await request(all?'/auth/logout-all':'/auth/logout');clear();}
 window.addEventListener('storage',e=>{if(e.key===storageKey)location.reload();});
 return {login,token,logout,clear,get saved(){return !!saved;},get user(){return user;},invalidate(){cached=null;force=true;}};
})();
