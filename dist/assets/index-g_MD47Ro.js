(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const Y="modulepreload",X=function(e){return"/"+e},z={},Z=function(t,n,s){let r=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),i=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));r=Promise.allSettled(n.map(d=>{if(d=X(d),d in z)return;z[d]=!0;const u=d.endsWith(".css"),l=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const c=document.createElement("link");if(c.rel=u?"stylesheet":Y,u||(c.as="script"),c.crossOrigin="",c.href=d,i&&c.setAttribute("nonce",i),document.head.appendChild(c),u)return new Promise((f,L)=>{c.addEventListener("load",f),c.addEventListener("error",()=>L(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=o,window.dispatchEvent(i),!i.defaultPrevented)throw o}return r.then(o=>{for(const i of o||[])i.status==="rejected"&&a(i.reason);return t().catch(a)})};function ee(e={}){const{immediate:t=!1,onNeedRefresh:n,onOfflineReady:s,onRegistered:r,onRegisteredSW:a,onRegisterError:o}=e;let i,d;const u=async(c=!0)=>{await d};async function l(){if("serviceWorker"in navigator){if(i=await Z(async()=>{const{Workbox:c}=await import("./workbox-window.prod.es5-BqEJf4Xk.js");return{Workbox:c}},[]).then(({Workbox:c})=>new c("/sw.js",{scope:"/",type:"classic"})).catch(c=>{o==null||o(c)}),!i)return;i.addEventListener("activated",c=>{(c.isUpdate||c.isExternal)&&window.location.reload()}),i.addEventListener("installed",c=>{c.isUpdate||s==null||s()}),i.register({immediate:t}).then(c=>{a?a("/sw.js",c):r==null||r(c)}).catch(c=>{o==null||o(c)})}}return d=l(),u}const E=(e,t)=>t.some(n=>e instanceof n);let B,T;function te(){return B||(B=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ne(){return T||(T=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const C=new WeakMap,$=new WeakMap,q=new WeakMap;function se(e){const t=new Promise((n,s)=>{const r=()=>{e.removeEventListener("success",a),e.removeEventListener("error",o)},a=()=>{n(h(e.result)),r()},o=()=>{s(e.error),r()};e.addEventListener("success",a),e.addEventListener("error",o)});return q.set(t,e),t}function re(e){if(C.has(e))return;const t=new Promise((n,s)=>{const r=()=>{e.removeEventListener("complete",a),e.removeEventListener("error",o),e.removeEventListener("abort",o)},a=()=>{n(),r()},o=()=>{s(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",a),e.addEventListener("error",o),e.addEventListener("abort",o)});C.set(e,t)}let k={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return C.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return h(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function U(e){k=e(k)}function ae(e){return ne().includes(e)?function(...t){return e.apply(I(this),t),h(this.request)}:function(...t){return h(e.apply(I(this),t))}}function ce(e){return typeof e=="function"?ae(e):(e instanceof IDBTransaction&&re(e),E(e,te())?new Proxy(e,k):e)}function h(e){if(e instanceof IDBRequest)return se(e);if($.has(e))return $.get(e);const t=ce(e);return t!==e&&($.set(e,t),q.set(t,e)),t}const I=e=>q.get(e);function oe(e,t,{blocked:n,upgrade:s,blocking:r,terminated:a}={}){const o=indexedDB.open(e,t),i=h(o);return s&&o.addEventListener("upgradeneeded",d=>{s(h(o.result),d.oldVersion,d.newVersion,h(o.transaction),d)}),n&&o.addEventListener("blocked",d=>n(d.oldVersion,d.newVersion,d)),i.then(d=>{a&&d.addEventListener("close",()=>a()),r&&d.addEventListener("versionchange",u=>r(u.oldVersion,u.newVersion,u))}).catch(()=>{}),i}const ie=["get","getKey","getAll","getAllKeys","count"],de=["put","add","delete","clear"],S=new Map;function j(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(S.get(t))return S.get(t);const n=t.replace(/FromIndex$/,""),s=t!==n,r=de.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||ie.includes(n)))return;const a=async function(o,...i){const d=this.transaction(o,r?"readwrite":"readonly");let u=d.store;return s&&(u=u.index(i.shift())),(await Promise.all([u[n](...i),r&&d.done]))[0]};return S.set(t,a),a}U(e=>({...e,get:(t,n,s)=>j(t,n)||e.get(t,n,s),has:(t,n)=>!!j(t,n)||e.has(t,n)}));const le=["continue","continuePrimaryKey","advance"],O={},M=new WeakMap,Q=new WeakMap,ue={get(e,t){if(!le.includes(t))return e[t];let n=O[t];return n||(n=O[t]=function(...s){M.set(this,Q.get(this)[t](...s))}),n}};async function*fe(...e){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...e)),!t)return;t=t;const n=new Proxy(t,ue);for(Q.set(n,t),q.set(n,I(t));t;)yield n,t=await(M.get(n)||t.continue()),M.delete(n)}function H(e,t){return t===Symbol.asyncIterator&&E(e,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&E(e,[IDBIndex,IDBObjectStore])}U(e=>({...e,get(t,n,s){return H(t,n)?fe:e.get(t,n,s)},has(t,n){return H(t,n)||e.has(t,n)}}));const pe="quiz-app-secret-v1-abac";let y=null;async function K(){if(y)return y;const e=new TextEncoder().encode(pe),t=await crypto.subtle.digest("SHA-256",e);return y=await crypto.subtle.importKey("raw",t,{name:"AES-GCM"},!1,["encrypt","decrypt"]),y}async function he(e){const t=await K(),n=crypto.getRandomValues(new Uint8Array(12)),s=new TextEncoder().encode(e),r=await crypto.subtle.encrypt({name:"AES-GCM",iv:n},t,s),a=new Uint8Array(12+r.byteLength);return a.set(n,0),a.set(new Uint8Array(r),12),a.buffer}async function be(e){const t=await K(),n=new Uint8Array(e),s=n.slice(0,12),r=n.slice(12),a=await crypto.subtle.decrypt({name:"AES-GCM",iv:s},t,r);return new TextDecoder().decode(a)}let w=null;async function p(){return w||(w=await oe("quiz-app-v1",1,{upgrade(e){e.createObjectStore("quizsets",{keyPath:"id"}),e.createObjectStore("progress",{keyPath:"key"}).createIndex("by-set","setId"),e.createObjectStore("catalog")}}),w)}async function ye(e,t,n){const s=await he(t);await(await p()).put("quizsets",{id:e,data:s,version:n})}async function we(e){const n=await(await p()).get("quizsets",e);return n?be(n.data):null}async function N(e){const n=await(await p()).get("quizsets",e);return(n==null?void 0:n.version)??-1}async function me(e){await(await p()).put("progress",{...e,key:`${e.setId}:${e.questionId}`})}async function P(e){return(await p()).getAllFromIndex("progress","by-set",e)}async function ve(e,t){return(await p()).get("progress",`${e}:${t}`)}async function ge(e){await(await p()).put("catalog",{sets:e,fetchedAt:Date.now()},"local")}async function qe(){const t=await(await p()).get("catalog","local");return(t==null?void 0:t.sets)??null}async function Le(e){const t=new DecompressionStream("gzip"),n=new Blob([e]).stream().pipeThrough(t);return new Response(n).text()}const $e="/quizsets/catalog.json";async function Se(){let e;try{const t=await fetch($e);if(!t.ok)throw new Error(`catalog fetch failed: ${t.status}`);const n=await t.json();await ge(n.sets),e=n.sets}catch(t){console.warn("[quiz] catalog fetch failed, using local cache:",t),e=await qe()??[]}for(const t of e)if(!(await N(t.id)>=t.version))try{await Ee(t)}catch(s){console.error(`[quiz] failed to download set "${t.id}":`,s)}return e}async function Ee(e){const t=await fetch(`/quizsets/${e.file}`);if(!t.ok)throw new Error(`fetch failed: ${t.status}`);const n=await t.arrayBuffer(),s=await Le(n);await ye(e.id,s,e.version)}async function R(e){const t=await we(e);return t?JSON.parse(t):null}async function Ce(e){return await N(e)>=0}async function ke(e,t,n){e.innerHTML=`
    <div class="screen home-screen">
      <header class="app-header">
        <h1 class="app-title">学習クイズ</h1>
        <p class="app-subtitle">問題セットを選んで学習しよう</p>
      </header>
      <main class="sets-list" id="sets-list">
        <div class="loading"><div class="spinner"></div></div>
      </main>
    </div>
  `;const s=e.querySelector("#sets-list");if(t.length===0){s.innerHTML=`
      <div class="empty-state">
        <p>問題セットが見つかりません。</p>
        <p class="text-muted">ネットワークに接続して再読み込みしてください。</p>
      </div>
    `;return}const r=await Promise.all(t.map(a=>Ie(a)));s.innerHTML=r.join(""),t.forEach(a=>{var o,i,d;(o=e.querySelector(`[data-action="random"][data-set="${a.id}"]`))==null||o.addEventListener("click",()=>n({name:"quiz",setId:a.id,mode:"random"})),(i=e.querySelector(`[data-action="weighted"][data-set="${a.id}"]`))==null||i.addEventListener("click",()=>n({name:"quiz",setId:a.id,mode:"weighted"})),(d=e.querySelector(`[data-action="stats"][data-set="${a.id}"]`))==null||d.addEventListener("click",()=>n({name:"stats",setId:a.id}))})}async function Ie(e,t){const n=await Ce(e.id),s=n?await P(e.id):[],r=s.filter(u=>u.correctCount+u.incorrectCount>0).length,a=s.reduce((u,l)=>u+l.correctCount,0),o=s.reduce((u,l)=>u+l.correctCount+l.incorrectCount,0),i=o>0?Math.round(a/o*100):null,d=i!==null?`<div class="set-stats">
        <span class="stat-badge">${r}/${e.count}問回答済み</span>
        <span class="stat-badge stat-accuracy">正解率 ${i}%</span>
       </div>`:'<div class="set-stats"><span class="stat-badge">未回答</span></div>';return n?`
    <div class="set-card">
      <div class="set-card__header">
        <h2 class="set-title">${_(e.title)}</h2>
        <span class="set-count">${e.count}問</span>
      </div>
      ${d}
      <div class="set-actions">
        <button class="btn btn--primary" data-action="random" data-set="${e.id}">
          ランダム出題
        </button>
        <button class="btn btn--secondary" data-action="weighted" data-set="${e.id}">
          苦手優先
        </button>
      </div>
      <button class="btn-link" data-action="stats" data-set="${e.id}">
        統計を見る →
      </button>
    </div>
  `:`
      <div class="set-card set-card--unavailable">
        <div class="set-card__header">
          <h2 class="set-title">${_(e.title)}</h2>
          <span class="set-count">${e.count}問</span>
        </div>
        <p class="text-muted">ネットワークに接続してダウンロードしてください。</p>
      </div>
    `}function _(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Me(e,t){const n=new Map(t.map(s=>[s.questionId,s]));return e.map(s=>{const r=n.get(s.id);if(!r||r.correctCount+r.incorrectCount===0)return{question:s,weight:1.5};const a=r.correctCount+r.incorrectCount,i=.2+(1-r.correctCount/a)*2.8;return{question:s,weight:i}})}function xe(e){const t=e.map(s=>({...s})),n=[];for(;t.length>0;){const s=t.reduce((a,o)=>a+o.weight,0);let r=Math.random()*s;for(let a=0;a<t.length;a++)if(r-=t[a].weight,r<=0){n.push(t[a].question),t.splice(a,1);break}}return n}function Ae(e,t,n){let s;if(n==="weighted"){const r=Me(e,t);s=xe(r)}else s=[...e].sort(()=>Math.random()-.5);return{questions:s,currentIndex:0,results:[]}}function D(e){return e.questions[e.currentIndex]??null}function Pe(e,t){const n=D(e);return n?{...e,currentIndex:e.currentIndex+1,results:[...e.results,{questionId:n.id,isCorrect:t}]}:e}function De(e){return e.currentIndex>=e.questions.length}function ze(e){const t=e.results.filter(s=>s.isCorrect).length,n=e.results.length;return{correct:t,total:n,accuracy:n>0?Math.round(t/n*100):0}}async function Be(e,t,n,s){G(e);const r=await R(t);if(!r){e.innerHTML='<div class="screen"><p class="error">問題セットを読み込めませんでした。</p></div>';return}const a=await P(t),i={session:Ae(r.questions,a,n),phase:"question",selectedChoice:null,mode:n,answeredQuestion:null};x(e,i,t,s,d);async function d(u){const l=D(i.session);if(!l||i.phase!=="question")return;const c=u===l.answer;i.selectedChoice=u,i.phase="feedback",i.answeredQuestion=l,i.session=Pe(i.session,c),x(e,i,t,s,d);const f=await ve(t,l.id);await me({setId:t,questionId:l.id,correctCount:((f==null?void 0:f.correctCount)??0)+(c?1:0),incorrectCount:((f==null?void 0:f.incorrectCount)??0)+(c?0:1),lastAnsweredAt:Date.now()})}}function x(e,t,n,s,r){var u;if(t.phase==="loading"){G(e);return}if(t.phase==="summary"){V(e,t.session,n,t.mode,s);return}const a=t.session.questions.length,o=t.phase==="feedback",i=o?t.answeredQuestion:D(t.session),d=o?t.session.currentIndex:t.session.currentIndex+1;e.innerHTML=`
    <div class="screen quiz-screen">
      <header class="quiz-header">
        <button class="btn-icon back-btn" id="back-btn" aria-label="ホームへ戻る">←</button>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${(d-1)/a*100}%"></div>
        </div>
        <span class="progress-label">${d} / ${a}</span>
      </header>

      <div class="quiz-body">
        <div class="question-card">
          <p class="question-number">問 ${d}</p>
          <p class="question-text">${g(i.question)}</p>
        </div>

        <div class="choices" id="choices">
          ${Te(i,t)}
        </div>

        ${t.phase==="feedback"?je(i,t):""}
      </div>
    </div>
  `,e.querySelector("#back-btn").addEventListener("click",()=>s({name:"home"})),t.phase==="question"&&e.querySelectorAll(".choice-btn").forEach(l=>{l.addEventListener("click",()=>r(l.dataset.choice))}),t.phase==="feedback"&&((u=e.querySelector("#next-btn"))==null||u.addEventListener("click",()=>{De(t.session)?V(e,t.session,n,t.mode,s):(t.phase="question",t.selectedChoice=null,x(e,t,n,s,r))}))}function Te(e,t){return e.choices.map(n=>{let s="choice-btn";return t.phase==="feedback"&&(n===e.answer?s+=" choice-btn--correct":n===t.selectedChoice?s+=" choice-btn--incorrect":s+=" choice-btn--disabled"),`<button class="${s}" data-choice="${Oe(n)}">${g(n)}</button>`}).join("")}function je(e,t){const n=t.selectedChoice===e.answer;return`
    <div class="feedback-card ${n?"feedback-card--correct":"feedback-card--incorrect"}">
      <p class="feedback-label">${n?"✓ 正解！":"✗ 不正解"}</p>
      ${n?"":`<p class="feedback-answer">正解：${g(e.answer)}</p>`}
      <div class="explanation">
        <p class="explanation-label">解説</p>
        <p class="explanation-text">${g(e.explanation)}</p>
      </div>
      <button class="btn btn--primary" id="next-btn">次の問題 →</button>
    </div>
  `}function V(e,t,n,s,r){const{correct:a,total:o,accuracy:i}=ze(t);e.innerHTML=`
    <div class="screen summary-screen">
      <div class="summary-card">
        <h2 class="summary-title">セッション完了！</h2>
        <div class="summary-score">
          <span class="score-number">${a}</span>
          <span class="score-sep"> / </span>
          <span class="score-total">${o}</span>
          <span class="score-unit">問正解</span>
        </div>
        <div class="accuracy-ring">
          <span class="accuracy-pct">${i}%</span>
        </div>
        <div class="summary-actions">
          <button class="btn btn--primary" id="retry-btn">もう一度</button>
          <button class="btn btn--secondary" id="home-btn">ホームへ</button>
          <button class="btn-link" id="stats-btn">統計を見る →</button>
        </div>
      </div>
    </div>
  `,e.querySelector("#home-btn").addEventListener("click",()=>r({name:"home"})),e.querySelector("#stats-btn").addEventListener("click",()=>r({name:"stats",setId:n})),e.querySelector("#retry-btn").addEventListener("click",()=>r({name:"quiz",setId:n,mode:s}))}function G(e){e.innerHTML='<div class="screen loading-screen"><div class="spinner"></div></div>'}function g(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Oe(e){return e.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function He(e,t,n){e.innerHTML='<div class="screen loading-screen"><div class="spinner"></div></div>';const[s,r]=await Promise.all([R(t),P(t)]);if(!s){e.innerHTML='<div class="screen"><p class="error">データを読み込めませんでした。</p></div>';return}const a=new Map(r.map(l=>[l.questionId,l])),o=r.reduce((l,c)=>l+c.correctCount,0),i=r.reduce((l,c)=>l+c.correctCount+c.incorrectCount,0),d=i>0?Math.round(o/i*100):null,u=s.questions.map(l=>{const c=a.get(l.id),f=((c==null?void 0:c.correctCount)??0)+((c==null?void 0:c.incorrectCount)??0),L=f>0?Math.round(((c==null?void 0:c.correctCount)??0)/f*100):null;return{q:l,p:c,attempts:f,acc:L}}).sort((l,c)=>l.acc===null&&c.acc===null?l.q.id-c.q.id:l.acc===null?1:c.acc===null?-1:l.acc-c.acc);e.innerHTML=`
    <div class="screen stats-screen">
      <header class="stats-header">
        <button class="btn-icon back-btn" id="back-btn" aria-label="ホームへ戻る">←</button>
        <h2 class="stats-title">統計</h2>
      </header>

      <div class="stats-overview">
        <p class="stats-set-name">${W(s.title)}</p>
        ${d!==null?`<div class="overall-accuracy">
               <span class="overall-pct">${d}%</span>
               <span class="overall-label">総合正解率（${o}/${i}回）</span>
             </div>`:'<p class="text-muted">まだ回答していません。</p>'}
      </div>

      <div class="question-stats-list">
        ${u.map(({q:l,acc:c,attempts:f})=>`
          <div class="qstat-row ${c!==null&&c<50?"qstat-row--weak":""}">
            <div class="qstat-meta">
              <span class="qstat-num">問${l.id}</span>
              <span class="qstat-pct ${c===null?"text-muted":""}">
                ${c!==null?`${c}%`:"未"}
              </span>
            </div>
            <div class="qstat-bar-wrap">
              <div class="qstat-bar" style="width:${c??0}%"></div>
            </div>
            <p class="qstat-q">${W(l.question)}</p>
            ${f>0?`<p class="qstat-detail text-muted">${f}回回答</p>`:""}
          </div>
        `).join("")}
      </div>
    </div>
  `,e.querySelector("#back-btn").addEventListener("click",()=>n({name:"home"}))}function W(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}let A=!1;const b=()=>document.getElementById("ad-banner");function _e(){if(navigator.onLine){try{window.adsbygoogle=window.adsbygoogle||[],window.adsbygoogle.push({}),A=!0}catch(e){console.warn("[ad] init failed:",e)}window.addEventListener("offline",()=>{var e;return(e=b())==null?void 0:e.classList.add("ad-banner--hidden")}),window.addEventListener("online",()=>{var e,t;A&&!((e=b())!=null&&e.classList.contains("ad-banner--quiz"))&&((t=b())==null||t.classList.remove("ad-banner--hidden"))})}}function F(){const e=b();e&&(e.classList.remove("ad-banner--quiz"),navigator.onLine&&A&&e.classList.remove("ad-banner--hidden"))}function Ve(){const e=b();e&&e.classList.add("ad-banner--quiz","ad-banner--hidden")}let J=[];const m=document.getElementById("app");function v(e){switch(e.name){case"home":F(),ke(m,J,v);break;case"quiz":Ve(),Be(m,e.setId,e.mode,v);break;case"stats":F(),He(m,e.setId,v);break}}async function We(){m.innerHTML='<div class="screen loading-screen"><div class="spinner"></div></div>',_e(),J=await Se(),v({name:"home"})}ee({immediate:!0});We();
