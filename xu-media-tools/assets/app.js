const $=s=>document.querySelector(s);
const navItems=[
  ["dashboard","🏠","Dashboard"],["storage","📁","Media Storage"],["projects","🧩","Projects"],
  ["composer","🎨","Composer"],["voice","🎙️","Voice Studio"],["batch","📊","Batch CSV"],
  ["render","⚙️","Render Queue"],["output","📦","Output"],["settings","🔧","Settings"]
];
const cats=[
  ["models","Model","image/*"],["templates","Template Video","video/*"],["backgrounds","Background","image/*,video/*"],
  ["backsounds","Backsound","audio/*"],["logos","Logo","image/*"],["overlays","Overlay","image/*,video/*"],
  ["voices","Voice","audio/*"],["fonts","Font",".ttf,.otf,.woff,.woff2"],["outputs","Output","video/*,audio/*,image/*"]
];
const state={
  view:"dashboard",category:"models",assets:{},projects:[],jobs:[],settings:{},currentProject:null,uploadCategory:null
};
const token=()=>localStorage.getItem("xmf_token")||"";
const authHeaders=(x={})=>({Authorization:`Bearer ${token()}`,...x});
const fn=k=>k?.split("/").pop()||"";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const bytes=n=>{let i=0,u=["B","KB","MB","GB"];n=Number(n||0);while(n>=1024&&i<u.length-1){n/=1024;i++}return`${i&&n<10?n.toFixed(1):Math.round(n)} ${u[i]}`};
const fmt=d=>d?new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(d)):"-";
function status(msg,type="success"){const e=$("#globalStatus");e.textContent=msg;e.className=`alert ${type}`;e.hidden=false;clearTimeout(status.t);status.t=setTimeout(()=>e.hidden=true,5000)}
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:authHeaders(opt.headers||{})});if(r.status===401){logout();throw Error("Sesi berakhir.")}let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.error||`Error ${r.status}`);return d}
function assetUrl(key,download=false){return`/api/files/get?key=${encodeURIComponent(key)}${download?"&download=1":""}`}
function renderNav(){ $("#mainNav").innerHTML=navItems.map(([k,i,l])=>`<button class="nav-btn ${state.view===k?"active":""}" data-v="${k}"><span>${i}</span>${l}</button>`).join("");document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>showView(b.dataset.v))}
function showView(v){state.view=v;document.querySelectorAll(".view").forEach(e=>e.hidden=true);$(`#view-${v}`).hidden=false;$("#pageTitle").textContent=navItems.find(x=>x[0]===v)?.[2]||v;renderNav();renderCurrent()}
async function bootstrap(){await Promise.all([loadAllAssets(),loadProjects(),loadJobs(),loadSettings()]);showView("dashboard")}
async function loadAllAssets(){for(const [k] of cats){try{state.assets[k]=(await api(`/api/files/list?category=${k}`)).objects||[]}catch{state.assets[k]=[]}}}
async function loadProjects(){state.projects=(await api("/api/projects/list")).projects||[]}
async function loadJobs(){state.jobs=(await api("/api/jobs/list")).jobs||[]}
async function loadSettings(){state.settings=(await api("/api/settings/get")).settings||{}}
function renderCurrent(){({dashboard:renderDashboard,storage:renderStorage,projects:renderProjects,composer:renderComposer,voice:renderVoice,batch:renderBatch,render:renderJobs,output:renderOutput,settings:renderSettings}[state.view]||(()=>{}))()}
function renderDashboard(){
  const total=Object.values(state.assets).flat(), size=total.reduce((a,b)=>a+b.size,0), outputs=state.assets.outputs||[];
  $("#view-dashboard").innerHTML=`
  <div class="grid cols-4">
    ${[["Total Asset",total.length],["Total Storage",bytes(size)],["Projects",state.projects.length],["Output",outputs.length]].map(x=>`<article class="card stat"><span class="muted small">${x[0]}</span><strong>${x[1]}</strong></article>`).join("")}
  </div>
  <div class="grid cols-2" style="margin-top:14px">
    <article class="card"><div class="section-head"><div><h3>Workflow</h3><p class="muted small">Alur produksi utama.</p></div></div>
      <div class="grid cols-3">
        <button class="btn secondary" onclick="showView('storage')">1. Upload Asset</button>
        <button class="btn secondary" onclick="showView('projects')">2. Buat Project</button>
        <button class="btn primary" onclick="showView('composer')">3. Compose & Render</button>
      </div>
    </article>
    <article class="card"><h3>Status Sistem</h3>
      <p class="small muted">R2 Storage: aktif</p><p class="small muted">Browser Quick Render: tersedia</p>
      <p class="small muted">External Render API: ${state.settings.renderApiUrl?"terhubung":"belum diisi"}</p>
      <p class="small muted">Face Swap API: ${state.settings.faceSwapApiUrl?"terhubung":"belum diisi"}</p>
    </article>
  </div>`;
}
function renderStorage(){
 const cat=cats.find(x=>x[0]===state.category), arr=state.assets[state.category]||[];
 $("#view-storage").innerHTML=`
 <div class="tabs">${cats.map(([k,l])=>`<button class="tab ${k===state.category?"active":""}" data-cat="${k}">${l}</button>`).join("")}</div>
 <div class="section-head"><div><h2>${cat[1]}</h2><p class="muted small">${arr.length} file · ${bytes(arr.reduce((a,b)=>a+b.size,0))}</p></div>
 <div class="actions"><input id="assetSearch" placeholder="Cari file..." style="width:220px"><button id="uploadBtn" class="btn primary">Upload</button></div></div>
 <div id="dropZone" class="drop-zone"><h3>Drag & drop file</h3><p class="muted small">Disimpan langsung ke R2 kategori ${cat[1]}.</p></div>
 <div id="assetGrid" class="asset-grid" style="margin-top:14px"></div>`;
 document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;renderStorage()});
 $("#uploadBtn").onclick=()=>pickFiles(state.category);
 $("#dropZone").ondragover=e=>{e.preventDefault();e.currentTarget.classList.add("drag")};
 $("#dropZone").ondragleave=e=>e.currentTarget.classList.remove("drag");
 $("#dropZone").ondrop=e=>{e.preventDefault();e.currentTarget.classList.remove("drag");uploadFiles(e.dataTransfer.files,state.category)};
 $("#assetSearch").oninput=renderAssetCards;renderAssetCards();
}
function preview(a){const t=a.httpMetadata?.contentType||"",u=assetUrl(a.key);if(t.startsWith("image/"))return`<img src="${u}" loading="lazy">`;if(t.startsWith("video/"))return`<video src="${u}" muted preload="metadata"></video>`;if(t.startsWith("audio/"))return`<audio src="${u}" controls preload="none"></audio>`;return`<div style="font-size:42px">📄</div>`}
function renderAssetCards(){
 const q=$("#assetSearch")?.value.toLowerCase()||"",arr=(state.assets[state.category]||[]).filter(a=>fn(a.key).toLowerCase().includes(q));
 $("#assetGrid").innerHTML=arr.map(a=>`<article class="asset"><div class="preview">${preview(a)}</div><div class="asset-body"><div class="asset-name">${esc(fn(a.key))}</div><div class="asset-meta">${bytes(a.size)} · ${fmt(a.uploaded)}</div><div class="asset-actions"><a class="btn secondary" href="${assetUrl(a.key,true)}">Download</a><button class="btn secondary" data-copy="${esc(a.key)}">Copy URL</button><button class="btn secondary" data-ren="${esc(a.key)}">Rename</button><button class="btn danger" data-del="${esc(a.key)}">Hapus</button></div></div></article>`).join("")||`<div class="card muted">Belum ada file.</div>`;
 document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(location.origin+assetUrl(b.dataset.copy));status("URL disalin.")});
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteFile(b.dataset.del));
 document.querySelectorAll("[data-ren]").forEach(b=>b.onclick=()=>renameFile(b.dataset.ren));
}
function pickFiles(cat){state.uploadCategory=cat;const i=$("#hiddenFileInput"),c=cats.find(x=>x[0]===cat);i.accept=c[2];i.click()}
$("#hiddenFileInput").onchange=e=>uploadFiles(e.target.files,state.uploadCategory);
async function uploadFiles(files,cat){for(const file of [...files]){const f=new FormData();f.append("file",file);f.append("category",cat);status(`Upload ${file.name}...`,"warning");await api("/api/files/upload",{method:"POST",body:f})}await loadAllAssets();status("Upload selesai.");renderCurrent();$("#hiddenFileInput").value=""}
async function deleteFile(key){if(!confirm(`Hapus ${fn(key)}?`))return;await api("/api/files/delete",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({key})});await loadAllAssets();status("File dihapus.");renderCurrent()}
async function renameFile(key){const n=prompt("Nama baru:",fn(key));if(!n)return;await api("/api/files/rename",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key,newName:n})});await loadAllAssets();status("Nama diubah.");renderCurrent()}
function renderProjects(){
 $("#view-projects").innerHTML=`
 <div class="section-head"><div><h2>Project Builder</h2><p class="muted small">Semua konfigurasi produksi disimpan sebagai project.</p></div><button id="newProject" class="btn primary">+ New Project</button></div>
 <div id="projectEditor"></div>
 <div class="project-list" style="margin-top:14px">${state.projects.map(p=>`<article class="project-row"><div><h4>${esc(p.name)}</h4><p>${esc(p.brand||"-")} · ${esc(p.keyword||"-")} · ${esc(p.resolution||"1080x1920")} · ${fmt(p.updatedAt)}</p></div><div class="actions"><button class="btn secondary" data-open="${p.id}">Buka</button><button class="btn danger" data-pdel="${p.id}">Hapus</button></div></article>`).join("")||`<div class="card muted">Belum ada project.</div>`}</div>`;
 $("#newProject").onclick=()=>editProject({name:"",brand:"",keyword:"",resolution:"1080x1920",platform:"TikTok",assets:{},text:{title:"",subtitle:"",cta:""},options:{faceSwap:false,subtitles:true,ttsMode:"offline"}});
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=async()=>editProject((await api(`/api/projects/get?id=${b.dataset.open}`)).project));
 document.querySelectorAll("[data-pdel]").forEach(b=>b.onclick=()=>deleteProject(b.dataset.pdel));
}
function editProject(p){state.currentProject=p;$("#projectEditor").innerHTML=`<article class="card"><h3>${p.id?"Edit Project":"Project Baru"}</h3><div class="form-grid" style="margin-top:14px">
<label>Nama Project<input id="pName" value="${esc(p.name||"")}"></label><label>Brand<input id="pBrand" value="${esc(p.brand||"")}"></label>
<label>Keyword<input id="pKeyword" value="${esc(p.keyword||"")}"></label><label>Platform<select id="pPlatform">${["TikTok","Instagram Reels","YouTube Shorts","Facebook"].map(x=>`<option ${p.platform===x?"selected":""}>${x}</option>`).join("")}</select></label>
<label>Resolution<select id="pResolution">${["1080x1920","1080x1080","1920x1080"].map(x=>`<option ${p.resolution===x?"selected":""}>${x}</option>`).join("")}</select></label>
<label>Durasi (detik)<input id="pDuration" type="number" min="3" max="300" value="${p.duration||15}"></label>
<div class="wide actions"><button id="saveProject" class="btn primary">Save Project</button><button id="openComposer" class="btn secondary">Buka di Composer</button></div></div></article>`;
 $("#saveProject").onclick=saveProjectForm;$("#openComposer").onclick=async()=>{await saveProjectForm();showView("composer")};
}
async function saveProjectForm(){
 const p={...state.currentProject,name:$("#pName").value.trim(),brand:$("#pBrand").value.trim(),keyword:$("#pKeyword").value.trim(),platform:$("#pPlatform").value,resolution:$("#pResolution").value,duration:Number($("#pDuration").value)||15,assets:state.currentProject.assets||{},text:state.currentProject.text||{},options:state.currentProject.options||{}};
 const r=await api("/api/projects/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(p)});state.currentProject=r.project;await loadProjects();status("Project tersimpan.");renderProjects()
}
async function deleteProject(id){if(!confirm("Hapus project?"))return;await api("/api/projects/delete",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id})});await loadProjects();status("Project dihapus.");renderProjects()}
function optionsFor(cat,val){return`<option value="">-- pilih --</option>${(state.assets[cat]||[]).map(a=>`<option value="${esc(a.key)}" ${val===a.key?"selected":""}>${esc(fn(a.key))}</option>`).join("")}`}
function renderComposer(){
 const p=state.currentProject||state.projects[0];
 if(!p){$("#view-composer").innerHTML=`<div class="card"><h3>Belum ada project</h3><button class="btn primary" onclick="showView('projects')">Buat Project</button></div>`;return}
 state.currentProject=JSON.parse(JSON.stringify(p)); const a=p.assets||{},t=p.text||{},o=p.options||{};
 $("#view-composer").innerHTML=`<div class="composer-layout">
 <article class="card"><div class="section-head"><div><h3>${esc(p.name)}</h3><p class="muted small">Project Composer</p></div><button id="saveCompose" class="btn primary">Save</button></div>
 <div class="form-grid">
 <label>Model<select id="cModel">${optionsFor("models",a.model)}</select></label><label>Template Video<select id="cTemplate">${optionsFor("templates",a.template)}</select></label>
 <label>Background<select id="cBackground">${optionsFor("backgrounds",a.background)}</select></label><label>Logo<select id="cLogo">${optionsFor("logos",a.logo)}</select></label>
 <label>Backsound<select id="cMusic">${optionsFor("backsounds",a.music)}</select></label><label>Overlay<select id="cOverlay">${optionsFor("overlays",a.overlay)}</select></label>
 <label class="wide">Judul<textarea id="cTitle">${esc(t.title||p.keyword||"")}</textarea></label>
 <label class="wide">Subtitle<textarea id="cSubtitle">${esc(t.subtitle||"")}</textarea></label>
 <label class="wide">CTA<input id="cCta" value="${esc(t.cta||"")}"></label>
 <label><input id="cFace" type="checkbox" ${o.faceSwap?"checked":""}> Aktifkan Face Swap</label>
 <label><input id="cSubs" type="checkbox" ${o.subtitles!==false?"checked":""}> Burn Subtitle</label>
 </div><div class="actions" style="margin-top:14px"><button id="previewBtn" class="btn secondary">Refresh Preview</button><button id="quickRender" class="btn success">Quick Render Browser</button><button id="prodRender" class="btn primary">Production Render</button></div></article>
 <div class="canvas-wrap"><div id="stage" class="canvas-stage"></div></div></div>`;
 $("#saveCompose").onclick=saveComposer;$("#previewBtn").onclick=updatePreview;$("#prodRender").onclick=queueRender;$("#quickRender").onclick=quickRender;updatePreview();
}
function composeData(){const p=state.currentProject;return{...p,assets:{model:$("#cModel").value,template:$("#cTemplate").value,background:$("#cBackground").value,logo:$("#cLogo").value,music:$("#cMusic").value,overlay:$("#cOverlay").value},text:{title:$("#cTitle").value,subtitle:$("#cSubtitle").value,cta:$("#cCta").value},options:{...(p.options||{}),faceSwap:$("#cFace").checked,subtitles:$("#cSubs").checked}}}
async function saveComposer(){const r=await api("/api/projects/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(composeData())});state.currentProject=r.project;await loadProjects();status("Composer tersimpan.")}
function updatePreview(){const d=composeData(),s=$("#stage"),bg=d.assets.background||d.assets.template,logo=d.assets.logo;let media="";if(bg){const type=(Object.values(state.assets).flat().find(a=>a.key===bg)?.httpMetadata?.contentType)||"";media=type.startsWith("video/")?`<video autoplay muted loop src="${assetUrl(bg)}"></video>`:`<img src="${assetUrl(bg)}">`}s.innerHTML=`${media}${logo?`<img class="logo" src="${assetUrl(logo)}">`:""}<div class="canvas-text">${esc(d.text.title)}</div>${d.text.cta?`<div class="canvas-cta">${esc(d.text.cta)}</div>`:""}`}
async function queueRender(){await saveComposer();const d=state.currentProject,ep=state.settings.renderApiUrl||"";const payload={project:d,assets:Object.fromEntries(Object.entries(d.assets||{}).map(([k,v])=>[k,v?location.origin+assetUrl(v):""])),options:d.options||{},endpoint:ep,apiKey:state.settings.apiKey||"",callbackUrl:location.origin+"/api/jobs/callback",mode:"external"};const r=await api("/api/jobs/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});await loadJobs();status(ep?`Render dikirim: ${r.job.status}`:"Job dibuat, tetapi Render API belum diisi.","warning");showView("render")}
async function quickRender(){
 const d=composeData(),bg=d.assets.background||d.assets.template;if(!bg){status("Pilih background atau template.","error");return}
 const asset=Object.values(state.assets).flat().find(a=>a.key===bg),isVideo=(asset?.httpMetadata?.contentType||"").startsWith("video/");
 const canvas=document.createElement("canvas");canvas.width=d.resolution?.startsWith("1080x1080")?1080:1080;canvas.height=d.resolution?.startsWith("1920x1080")?1080:(d.resolution?.startsWith("1080x1080")?1080:1920);const ctx=canvas.getContext("2d");
 const media=document.createElement(isVideo?"video":"img");media.crossOrigin="anonymous";media.src=assetUrl(bg);if(isVideo){media.muted=true;media.loop=true;await media.play().catch(()=>{});await new Promise(r=>media.onloadeddata=r)}else await new Promise((r,j)=>{media.onload=r;media.onerror=j});
 let logo=null;if(d.assets.logo){logo=new Image();logo.crossOrigin="anonymous";logo.src=assetUrl(d.assets.logo);await new Promise(r=>{logo.onload=r;logo.onerror=r})}
 const stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"}),chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 const dur=Math.min(Number(d.duration)||15,30),start=performance.now();rec.start();
 await new Promise(resolve=>{function frame(now){const elapsed=(now-start)/1000;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(media,0,0,canvas.width,canvas.height);if(logo)ctx.drawImage(logo,60,60,canvas.width*.25,canvas.width*.12);ctx.fillStyle="white";ctx.textAlign="center";ctx.font=`900 ${Math.round(canvas.width*.065)}px sans-serif`;ctx.shadowColor="black";ctx.shadowBlur=18;wrapText(ctx,d.text.title||"",canvas.width/2,canvas.height*.78,canvas.width*.86,Math.round(canvas.width*.075));if(d.text.cta){ctx.shadowBlur=0;ctx.fillStyle="#7258ff";ctx.fillRect(canvas.width*.18,canvas.height*.88,canvas.width*.64,canvas.height*.055);ctx.fillStyle="white";ctx.font=`900 ${Math.round(canvas.width*.038)}px sans-serif`;ctx.fillText(d.text.cta,canvas.width/2,canvas.height*.915)}if(elapsed<dur)requestAnimationFrame(frame);else{rec.stop();resolve()}}requestAnimationFrame(frame)});
 await new Promise(r=>rec.onstop=r);const blob=new Blob(chunks,{type:"video/webm"}),file=new File([blob],`${(d.name||"output").replace(/\s+/g,"-")}-${Date.now()}.webm`,{type:"video/webm"}),f=new FormData();f.append("file",file);f.append("category","outputs");await api("/api/files/upload",{method:"POST",body:f});await loadAllAssets();status("Quick Render selesai dan disimpan ke Output.");showView("output")
}
function wrapText(ctx,text,x,y,max,line){const words=text.split(/\s+/);let l="",lines=[];for(const w of words){const test=l?l+" "+w:w;if(ctx.measureText(test).width>max&&l){lines.push(l);l=w}else l=test}if(l)lines.push(l);lines.slice(0,5).forEach((z,i)=>ctx.fillText(z,x,y+i*line))}
function renderVoice(){
 $("#view-voice").innerHTML=`<div class="grid cols-2"><article class="card"><h3>Voice Studio</h3><div class="form-grid" style="margin-top:14px"><label class="wide">Text<textarea id="vText" placeholder="Masukkan script suara..."></textarea></label><label>Voice<select id="vVoice"></select></label><label>Speed<input id="vSpeed" type="range" min=".5" max="2" step=".1" value="1"></label></div><div class="actions" style="margin-top:14px"><button id="testVoice" class="btn secondary">Test Browser Voice</button><button id="genOffline" class="btn success">Generate Offline</button><button id="genOnline" class="btn primary">Generate Online</button></div></article><article class="card"><h3>Status TTS</h3><p class="muted small">Browser test memakai SpeechSynthesis dan tidak mengekspor audio.</p><p class="muted small">Generate Online mengirim payload ke TTS API dari Settings.</p><p class="muted small">Generate Offline produksi membutuhkan local engine/VPS; tombol membuat job siap diproses adapter.</p></article></div>`;
 const voices=speechSynthesis.getVoices();$("#vVoice").innerHTML=voices.map((v,i)=>`<option value="${i}">${esc(v.name)} — ${v.lang}</option>`).join("");
 $("#testVoice").onclick=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($("#vText").value);u.rate=Number($("#vSpeed").value);u.voice=voices[Number($("#vVoice").value)]||null;speechSynthesis.speak(u)};
 $("#genOnline").onclick=()=>ttsJob("online");$("#genOffline").onclick=()=>ttsJob("offline");
}
async function ttsJob(mode){const text=$("#vText").value.trim();if(!text){status("Text kosong.","error");return}const ep=mode==="online"?state.settings.ttsApiUrl:"";const project=state.currentProject||{id:"voice-studio",name:"Voice Studio"};await api("/api/jobs/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({project,mode:`tts-${mode}`,endpoint:ep,apiKey:state.settings.apiKey||"",tts:{text,voice:$("#vVoice").value,speed:Number($("#vSpeed").value)}})});await loadJobs();status(ep||mode==="offline"?"Job TTS dibuat.":"TTS API belum diisi.","warning");showView("render")}
function renderBatch(){
 $("#view-batch").innerHTML=`<article class="card"><div class="section-head"><div><h3>Batch CSV</h3><p class="muted small">Satu baris menjadi satu project/job.</p></div><button id="downloadCsv" class="btn secondary">Download Contoh CSV</button></div>
 <textarea id="csvText" style="min-height:260px" placeholder="name,brand,keyword,title,subtitle,cta,resolution,duration&#10;Project 1,BRAND,Keyword,Judul,Subtitle,Daftar,1080x1920,15"></textarea>
 <div class="actions" style="margin-top:14px"><button id="parseCsv" class="btn primary">Create Projects from CSV</button></div><div id="csvPreview" style="margin-top:14px"></div></article>`;
 $("#downloadCsv").onclick=()=>{const s="name,brand,keyword,title,subtitle,cta,resolution,duration\nContoh Project,WAHANABET,Mahjong Ways,Judul Utama,Subtitle,DAFTAR,1080x1920,15";downloadBlob(new Blob([s],{type:"text/csv"}),"batch-example.csv")};
 $("#parseCsv").onclick=parseCsv;
}
async function parseCsv(){const rows=$("#csvText").value.trim().split(/\r?\n/).filter(Boolean);if(rows.length<2){status("CSV belum lengkap.","error");return}const h=splitCsv(rows[0]);let n=0;for(const row of rows.slice(1)){const v=splitCsv(row),o=Object.fromEntries(h.map((k,i)=>[k,v[i]||""]));const p={name:o.name,brand:o.brand,keyword:o.keyword,resolution:o.resolution||"1080x1920",duration:Number(o.duration)||15,platform:"TikTok",assets:{},text:{title:o.title,subtitle:o.subtitle,cta:o.cta},options:{subtitles:true,faceSwap:false}};if(!p.name)continue;await api("/api/projects/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(p)});n++}await loadProjects();status(`${n} project dibuat.`);showView("projects")}
function splitCsv(line){const out=[];let cur="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'){cur+='"';i++}else if(c==='"')q=!q;else if(c===","&&!q){out.push(cur.trim());cur=""}else cur+=c}out.push(cur.trim());return out}
function renderJobs(){
 $("#view-render").innerHTML=`<div class="section-head"><div><h2>Render Queue</h2><p class="muted small">Job lokal dan external processing.</p></div><button id="refreshJobs" class="btn secondary">Refresh Queue</button></div><div class="queue">${state.jobs.map(j=>`<article class="job"><div><b>${esc(j.projectName||j.mode||j.id)}</b><div class="small muted">${esc(j.status)} · ${esc(j.message||"")} · ${fmt(j.updatedAt)}</div><div class="progress"><span style="width:${Number(j.progress||0)}%"></span></div></div><span class="badge">${esc(j.mode||"render")}</span></article>`).join("")||`<div class="card muted">Belum ada job.</div>`}</div>`;
 $("#refreshJobs").onclick=async()=>{await loadJobs();renderJobs();status("Queue diperbarui.")};
}
function renderOutput(){const arr=state.assets.outputs||[];$("#view-output").innerHTML=`<div class="section-head"><div><h2>Output Manager</h2><p class="muted small">${arr.length} hasil render.</p></div><button class="btn secondary" onclick="pickFiles('outputs')">Upload Output</button></div><div class="output-grid">${arr.map(a=>`<article class="output-card">${preview(a)}<div class="body"><b class="small">${esc(fn(a.key))}</b><p class="muted small">${bytes(a.size)} · ${fmt(a.uploaded)}</p><div class="actions"><a class="btn secondary" href="${assetUrl(a.key,true)}">Download</a><button class="btn danger" data-del="${esc(a.key)}">Hapus</button></div></div></article>`).join("")||`<div class="card muted">Belum ada output.</div>`}</div>`;document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteFile(b.dataset.del))}
function renderSettings(){
 const s=state.settings;
 $("#view-settings").innerHTML=`<article class="card"><h3>API & Processing Settings</h3><div class="form-grid" style="margin-top:14px">
 <label class="wide">Render API URL<input id="sRender" value="${esc(s.renderApiUrl||"")}" placeholder="https://api.example.com/render"></label>
 <label class="wide">Face Swap API URL<input id="sFace" value="${esc(s.faceSwapApiUrl||"")}" placeholder="https://api.example.com/faceswap"></label>
 <label class="wide">TTS API URL<input id="sTts" value="${esc(s.ttsApiUrl||"")}" placeholder="https://api.example.com/tts"></label>
 <label class="wide">API Key<input id="sKey" type="password" value="${esc(s.apiKey||"")}"></label>
 <label>Default Resolution<select id="sResolution">${["1080x1920","1080x1080","1920x1080"].map(x=>`<option ${s.defaultResolution===x?"selected":""}>${x}</option>`).join("")}</select></label>
 <label>Default Duration<input id="sDuration" type="number" value="${s.defaultDuration||15}"></label>
 <div class="wide actions"><button id="saveSettings" class="btn primary">Save Settings</button></div></div></article>
 <div class="alert warning" style="margin-top:14px">Cloudflare Pages/R2 menyimpan dashboard dan file. AI face swap, FFmpeg, serta TTS produksi tetap membutuhkan API/VPS/GPU eksternal.</div>`;
 $("#saveSettings").onclick=async()=>{state.settings={renderApiUrl:$("#sRender").value.trim(),faceSwapApiUrl:$("#sFace").value.trim(),ttsApiUrl:$("#sTts").value.trim(),apiKey:$("#sKey").value.trim(),defaultResolution:$("#sResolution").value,defaultDuration:Number($("#sDuration").value)||15};await api("/api/settings/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(state.settings)});status("Settings tersimpan.")}
}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function logout(){localStorage.removeItem("xmf_token");$("#appView").hidden=true;$("#loginView").hidden=false}
$("#loginForm").onsubmit=async e=>{e.preventDefault();$("#loginError").hidden=true;const user=$("#userInput").value.trim(),pass=$("#tokenInput").value.trim();if(user!=="kopihitam12"||pass!=="kopihitam12"){$("#loginError").textContent="User ID atau password salah.";$("#loginError").hidden=false;return}localStorage.setItem("xmf_token",pass);try{await api("/api/auth");$("#loginView").hidden=true;$("#appView").hidden=false;bootstrap()}catch(err){localStorage.removeItem("xmf_token");$("#loginError").textContent=err.message;$("#loginError").hidden=false}}
$("#logoutBtn").onclick=logout;$("#globalRefresh").onclick=async()=>{await bootstrap();status("Semua data diperbarui.")};renderNav();if(token()){$("#loginView").hidden=true;$("#appView").hidden=false;bootstrap().catch(()=>logout())}
window.showView=showView;window.pickFiles=pickFiles;


function initRain(){const c=$("#rainCanvas");if(!c)return;const ctx=c.getContext("2d");let drops=[];function resize(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;c.style.width=innerWidth+"px";c.style.height=innerHeight+"px";ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);drops=Array.from({length:Math.min(260,Math.floor(innerWidth/5))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,l:8+Math.random()*28,s:6+Math.random()*12,o:.08+Math.random()*.3}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const d of drops){ctx.strokeStyle=`rgba(112,195,255,${d.o})`;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-3,d.y+d.l);ctx.stroke();d.y+=d.s;d.x-=.8;if(d.y>innerHeight+30){d.y=-30;d.x=Math.random()*innerWidth}}requestAnimationFrame(draw)}addEventListener("resize",resize);resize();draw()}initRain();
