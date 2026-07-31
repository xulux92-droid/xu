import { $, notify, copyText, downloadText, slugify, escapeHtml } from '../core/utils.js';
import { getPublishConfig, publishHtmlToGithub } from '../core/publish.js';

const templateMap = {
  konten: {
    tokped: 'assets/templates/konten/tokped.html',
    ubuy: 'assets/templates/konten/ubuy.html',
    istudio: 'assets/templates/konten/istudio.html',
    'tee-gen': 'assets/templates/konten/tee-gen.html'
  },
  amp: {
    'yugi-oh': 'assets/templates/amp/yugi-oh.html',
    pokemon: 'assets/templates/amp/pokemon.html',
    'old-liga': 'assets/templates/amp/old-liga.html',
    'pg-boss': 'assets/templates/amp/pg-boss.html',
    cubik: 'assets/templates/amp/cubik.html'
  }
};

let currentSource = '';

function extractPlaceholders(html=''){
  const found = [...html.matchAll(/##([a-zA-Z0-9_-]+)##/g)].map(m=>m[1]);
  return [...new Set(found)];
}

async function loadTemplate(category, name){
  const path = templateMap[category]?.[name];
  if(!path) throw new Error('Template tidak ditemukan.');
  const res = await fetch(path);
  if(!res.ok) throw new Error('Gagal load template.');
  return await res.text();
}

function buildFields(keys){
  return keys.map(key => {
    const isLong = ['konten','content','desc','deskripsi','faq'].includes(key.toLowerCase());
    return `
      <label class="field-label" for="tpl-${key}">##${escapeHtml(key)}##</label>
      ${isLong ? `<textarea id="tpl-${key}" data-placeholder="${escapeHtml(key)}" placeholder="Isi ${escapeHtml(key)}"></textarea>` : `<input id="tpl-${key}" data-placeholder="${escapeHtml(key)}" placeholder="Isi ${escapeHtml(key)}">`}
    `;
  }).join('');
}

function applyValues(source){
  let out = source;
  document.querySelectorAll('[data-placeholder]').forEach(el => {
    const key = el.dataset.placeholder;
    out = out.replaceAll(`##${key}##`, el.value || '');
  });
  return out;
}

function renderPreview(html){
  const frame = $('#templatePreviewFrame');
  if(frame) frame.srcdoc = html;
}

export function render(){
  return `
    <div class="card-grid">
      <section class="card two-col wide-left">
        <div class="mini-card">
          <h3>Template Engine Pro</h3>
          <div class="stack-sm">
            <select id="templateCategory">
              <option value="konten">LP Konten</option>
              <option value="amp">LP AMP</option>
            </select>
            <select id="templateName"></select>
          </div>
          <div id="templateFields" class="template-fields"></div>
          <div class="action-row wrap-actions">
            <button class="btn primary" id="loadTemplateBtn">Load Template</button>
            <button class="btn ghost" id="generateTemplateBtn">Generate</button>
            <button class="btn ghost" id="copyTemplateBtn">Copy</button>
            <button class="btn ghost" id="downloadTemplateBtn">Download</button>
            <button class="btn primary" id="publishTemplateBtn">Publish AMP</button>
          </div>
          <div class="helper-text">Source template tetap editable untuk penyesuaian manual.</div>
        </div>
        <div class="mini-card">
          <h3>Source Template</h3>
          <textarea id="templateSource" placeholder="Source template"></textarea>
          <h3 style="margin-top:16px">Generated Output</h3>
          <textarea id="templateOutput" placeholder="Hasil generate"></textarea>
          <input id="templateLiveUrl" placeholder="URL publish AMP" readonly>
        </div>
      </section>
      <section class="card">
        <div class="section-head"><div><h3>Preview</h3><p class="helper-text">Preview cepat hasil template sebelum publish.</p></div></div>
        <iframe id="templatePreviewFrame" class="amp-preview-frame"></iframe>
      </section>
    </div>`;
}

export function init(){
  const categoryEl = $('#templateCategory');
  const nameEl = $('#templateName');
  const sourceEl = $('#templateSource');
  const outputEl = $('#templateOutput');

  function fillNames(){
    const category = categoryEl.value;
    nameEl.innerHTML = Object.keys(templateMap[category] || {}).map(name => `<option value="${name}">${name}</option>`).join('');
  }

  async function doLoad(){
    try{
      currentSource = await loadTemplate(categoryEl.value, nameEl.value);
      sourceEl.value = currentSource;
      const placeholders = extractPlaceholders(currentSource);
      $('#templateFields').innerHTML = buildFields(placeholders);
      outputEl.value = '';
      $('#templateLiveUrl').value = '';
      renderPreview('');
      notify('Template dimuat.');
    }catch(err){
      notify(err.message || 'Gagal load template.');
    }
  }

  function generate(){
    const src = sourceEl.value || currentSource;
    const html = applyValues(src);
    outputEl.value = html;
    renderPreview(html);
    if(categoryEl.value === 'amp'){
      const titleVal = document.querySelector('[data-placeholder="judul"], [data-placeholder="tittle"], [data-placeholder="title"]')?.value || nameEl.value;
      const slug = slugify(titleVal || nameEl.value);
      const cfg = getPublishConfig();
      $('#templateLiveUrl').value = `${(cfg.ampBaseUrl || 'https://amp.dr-sean.store').replace(/\/$/,'')}/${slug}.html`;
    }
    return html;
  }

  fillNames();
  doLoad();

  categoryEl.onchange = () => { fillNames(); doLoad(); $('#publishTemplateBtn').style.display = categoryEl.value === 'amp' ? 'inline-flex':'none'; };
  nameEl.onchange = doLoad;
  $('#loadTemplateBtn').onclick = doLoad;
  $('#generateTemplateBtn').onclick = ()=>{ generate(); notify('Template digenerate.'); };
  $('#copyTemplateBtn').onclick = async ()=>{ const html = outputEl.value || generate(); await copyText(html); notify('Output dicopy.'); };
  $('#downloadTemplateBtn').onclick = ()=>{ const html = outputEl.value || generate(); const base = slugify(nameEl.value || 'template-output'); downloadText(`${base}.html`, html, 'text/html;charset=utf-8'); };
  $('#publishTemplateBtn').onclick = async ()=>{
    if(categoryEl.value !== 'amp') return notify('Publish cuma untuk template AMP.');
    try{
      const cfg = getPublishConfig();
      const html = outputEl.value || generate();
      const titleVal = document.querySelector('[data-placeholder="judul"], [data-placeholder="tittle"], [data-placeholder="title"]')?.value || nameEl.value;
      const slug = slugify(titleVal || nameEl.value);
      await publishHtmlToGithub({ token: cfg.githubToken, owner: cfg.githubOwner, repo: cfg.githubRepo, branch: cfg.githubBranch || 'main', slug, html });
      $('#templateLiveUrl').value = `${(cfg.ampBaseUrl || 'https://amp.dr-sean.store').replace(/\/$/,'')}/${slug}.html`;
      notify('Template AMP berhasil dipublish.');
    }catch(err){
      notify(err.message || 'Gagal publish template AMP.');
    }
  };
  $('#publishTemplateBtn').style.display = categoryEl.value === 'amp' ? 'inline-flex':'none';
}
