import { $, notify, copyText, slugify } from '../core/utils.js';
import { getPublishConfig } from '../core/publish.js';

function getCfg(){
  return getPublishConfig();
}

function buildFinalUrl(data, cfg){
  const base = (cfg.cdnBaseUrl || 'https://cdn.dr-sean.store').replace(/\/$/, '');
  return `${base}/${data.public_id}.${data.format}`;
}

export function render(){
  const cfg = getCfg();
  return `
    <div class="card-grid">
      <section class="card two-col wide-left">
        <div class="mini-card">
          <h3>Upload asset ke Cloudinary</h3>
          <div id="cdnDrop" class="dropzone tall-dropzone">
            <strong>Drop gambar di sini</strong>
            <span>atau pilih file manual. Yang penting kerja jalan, bukan drama form upload.</span>
          </div>
          <input id="cdnFile" type="file" accept="image/*" hidden>
          <div class="stack-sm">
            <input id="cdnFilename" placeholder="Nama file / slug (opsional)">
            <div class="helper-text">Cloud Name: <strong>${cfg.cloudName || 'dmypzk6lw'}</strong> · Preset: <strong>${cfg.uploadPreset || 'ml_default'}</strong></div>
          </div>
          <div class="action-row">
            <button class="btn primary" id="pickCdnBtn">Pilih File</button>
            <button class="btn ghost" id="uploadCdnBtn">Upload</button>
          </div>
        </div>
        <div class="mini-card">
          <h3>Hasil upload</h3>
          <div class="stack-sm">
            <input id="cdnWrapperUrl" placeholder="Wrapper CDN URL" readonly>
            <div class="action-row"><button class="btn primary" id="copyCdnBtn">Copy CDN URL</button><button class="btn ghost" id="copyRawBtn">Copy Raw URL</button></div>
            <textarea id="cdnEmbedHtml" placeholder="HTML akan muncul di sini" readonly></textarea>
            <div class="action-row"><button class="btn ghost" id="copyHtmlBtn">Copy HTML</button><button class="btn ghost" id="copyMdBtn">Copy Markdown</button></div>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="section-head"><div><h3>Preview</h3><p class="helper-text">Preview cepat untuk memastikan file tampil dengan benar.</p></div></div>
        <div class="preview-box image-preview-box"><img id="cdnPreview" style="max-width:100%;display:none" alt="CDN preview"><div id="cdnEmptyState" class="muted">Belum ada file diupload.</div></div>
      </section>
    </div>`;
}

export function init(){
  const cfg = getCfg();
  const input = $('#cdnFile');
  const drop = $('#cdnDrop');
  let file = null;
  let rawUrl = '';

  $('#pickCdnBtn').onclick = () => input.click();
  input.onchange = e => { file = e.target.files?.[0] || null; if(file && !$('#cdnFilename').value.trim()){ $('#cdnFilename').value = slugify(file.name.replace(/\.[^.]+$/, '')); } };

  ['dragenter','dragover'].forEach(evt => drop.addEventListener(evt, e=>{e.preventDefault(); drop.classList.add('dragover');}));
  ['dragleave','drop'].forEach(evt => drop.addEventListener(evt, e=>{e.preventDefault(); drop.classList.remove('dragover');}));
  drop.addEventListener('drop', e=>{ file = e.dataTransfer.files?.[0] || null; if(file){ input.files = e.dataTransfer.files; if(!$('#cdnFilename').value.trim()) $('#cdnFilename').value = slugify(file.name.replace(/\.[^.]+$/, '')); }});

  async function doUpload(){
    if(!file) return notify('Pilih file dulu.');
    const cloud = cfg.cloudName || 'dmypzk6lw';
    const preset = cfg.uploadPreset || 'ml_default';
    const folder = (cfg.cdnFolder || '').trim();
    const customName = slugify($('#cdnFilename').value.trim() || file.name.replace(/\.[^.]+$/, ''));
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);
    if(folder) fd.append('folder', folder);
    fd.append('public_id', customName);

    try{
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:'POST', body:fd });
      const data = await res.json();
      if(!res.ok || data.error) throw new Error(data.error?.message || 'Upload Cloudinary gagal.');
      rawUrl = data.secure_url;
      const finalUrl = buildFinalUrl(data, cfg);
      $('#cdnWrapperUrl').value = finalUrl;
      $('#cdnEmbedHtml').value = `<img src="${finalUrl}" alt="${customName}">`;
      $('#cdnPreview').src = rawUrl;
      $('#cdnPreview').style.display = 'block';
      $('#cdnEmptyState').style.display = 'none';
      localStorage.setItem('xu-last-cdn-url', finalUrl);
      localStorage.setItem('xu-last-cdn-raw', rawUrl);
      notify('Upload asset berhasil.');
    }catch(err){
      notify(err.message || 'Upload gagal.');
    }
  }

  $('#uploadCdnBtn').onclick = doUpload;
  $('#copyCdnBtn').onclick = async ()=>{ if($('#cdnWrapperUrl').value){ await copyText($('#cdnWrapperUrl').value); notify('CDN URL dicopy.'); } };
  $('#copyRawBtn').onclick = async ()=>{ if(rawUrl){ await copyText(rawUrl); notify('Raw URL dicopy.'); } };
  $('#copyHtmlBtn').onclick = async ()=>{ if($('#cdnEmbedHtml').value){ await copyText($('#cdnEmbedHtml').value); notify('HTML dicopy.'); } };
  $('#copyMdBtn').onclick = async ()=>{ if($('#cdnWrapperUrl').value){ await copyText(`![](${$('#cdnWrapperUrl').value})`); notify('Markdown dicopy.'); } };
}
