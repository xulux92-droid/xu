import { $, escapeHtml, formatBytes, copyText, notify } from '../core/utils.js';

function buildOutputRows(data){
  const safeName = (data.filename || 'file').replace(/[^a-zA-Z0-9._-]+/g,'-');
  const rows = [
    { label:'Public URL', value:data.url, note:'Link publik file hasil upload.' },
    { label:'HTML', value:`<a href="${data.url}">${data.filename}</a>`, note:'Snippet HTML siap tempel.' },
    { label:'Markdown', value:`[${data.filename}](${data.url})`, note:'Format Markdown siap tempel.' },
    { label:'wget', value:`wget -O "${safeName}" "${data.url}"`, note:'Command download Linux dengan wget.' },
    { label:'curl', value:`curl -L "${data.url}" -o "${safeName}"`, note:'Command download Linux dengan curl.' },
    { label:'Linux check', value:`file "${safeName}" && ls -lh "${safeName}"`, note:'Command cek file setelah download.' },
  ];
  return rows.map(row => `
    <article class="result-box">
      <div class="result-box-head"><div><strong>${row.label}</strong><small>${row.note}</small></div><button class="btn ghost copy-btn" data-copy="${escapeHtml(row.value)}">Copy</button></div>
      <div class="code-box result-code">${escapeHtml(row.value)}</div>
    </article>`).join('');
}
function renderMeta(file){
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  $('#uploadMeta').innerHTML = `
    <div class="upload-meta-grid">
      <div class="meta-pill"><span>File</span><strong>${escapeHtml(file.name)}</strong></div>
      <div class="meta-pill"><span>Ukuran</span><strong>${formatBytes(file.size)}</strong></div>
      <div class="meta-pill"><span>Tipe</span><strong>${escapeHtml(file.type || 'unknown')}</strong></div>
      <div class="meta-pill"><span>Ext</span><strong>${escapeHtml(ext || '-')}</strong></div>
    </div>`;
}
function bindCopies(){ document.querySelectorAll('.copy-btn').forEach(btn => { btn.onclick = async () => { const text = (btn.dataset.copy || '').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); await copyText(text); notify('Berhasil dicopy.'); }; }); }

export function render(){ return `
  <div class="card-grid">
    <section class="card">
      <div class="section-head"><div><h3>Uploader</h3><p class="helper-text">Upload file, buat public URL, HTML snippet, Markdown, wget, curl, dan command Linux.</p></div></div>
      <div class="upload-shell">
        <div class="mini-card upload-pane">
          <h4>Pilih file</h4>
          <div id="uploadDrop" class="dropzone tall-dropzone"><strong>Drop file di sini</strong><span>atau klik tombol pilih file manual</span></div>
          <input id="uploadFile" type="file" hidden />
          <div class="action-row"><button class="btn primary" id="pickUploadBtn">Pilih File</button><button class="btn ghost" id="sendUploadBtn">Proses</button><button class="btn ghost" id="resetUploadBtn">Reset</button></div>
          <div id="uploadMeta" class="info-box compact-info">Mode upload dengan fallback browser URL untuk preview lokal.</div>
          <div class="progress large-progress"><span id="uploadBar"></span></div>
        </div>
        <div class="mini-card upload-pane"><h4>Hasil</h4><div id="uploadResult" class="result-stack"><div class="info-box">Belum ada hasil upload.</div></div></div>
      </div>
    </section>
  </div>`; }

export function init(){
  const input = $('#uploadFile'); const drop = $('#uploadDrop'); let file = null;
  $('#pickUploadBtn').onclick = () => input.click();
  input.onchange = e => { file = e.target.files?.[0] || null; if(file) renderMeta(file); };
  ['dragenter','dragover'].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.remove('dragover'); }));
  drop.addEventListener('drop', e => { file = e.dataTransfer.files?.[0] || null; if(file){ input.files = e.dataTransfer.files; renderMeta(file);} });

  async function fallback(){
    const url = URL.createObjectURL(file);
    const data = { ok:true, filename:file.name, size:file.size, url };
    $('#uploadBar').style.width = '100%';
    $('#uploadResult').innerHTML = `<div class="result-alert"><strong>Fallback mode aktif</strong><span>URL hanya berlaku di browser saat ini untuk preview lokal.</span></div>${buildOutputRows(data)}`;
    bindCopies();
    notify('Fallback URL dibuat.');
  }

  $('#sendUploadBtn').onclick = async () => {
    if(!file) return notify('Pilih file dulu.');
    $('#uploadBar').style.width = '18%';
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('api/upload.php', { method:'POST', body:fd });
      if(!res.ok) throw new Error('Backend upload tidak tersedia.');
      const data = await res.json();
      if(!data.ok) throw new Error(data.error || 'Upload gagal');
      $('#uploadBar').style.width = '100%';
      $('#uploadResult').innerHTML = `${buildOutputRows(data)}`;
      bindCopies();
      notify('Upload selesai.');
    } catch(err){
      await fallback();
    }
  };
  $('#resetUploadBtn').onclick = () => { file = null; input.value = ''; $('#uploadBar').style.width = '0%'; $('#uploadResult').innerHTML = '<div class="info-box">Belum ada hasil upload.</div>'; $('#uploadMeta').innerHTML = 'Mode upload dengan fallback browser URL untuk preview lokal.'; };
}
