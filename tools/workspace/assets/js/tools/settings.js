import { $, notify } from '../core/utils.js';
import { getPublishConfig, setPublishConfig } from '../core/publish.js';

function defaults(){
  const cfg = getPublishConfig();
  return {
    githubToken: cfg.githubToken || '',
    githubOwner: cfg.githubOwner || 'xulux92-droid',
    githubRepo: cfg.githubRepo || 'amp-pages',
    githubBranch: cfg.githubBranch || 'main',
    ampBaseUrl: cfg.ampBaseUrl || 'https://amp.dr-sean.store',
    cloudName: cfg.cloudName || 'dmypzk6lw',
    uploadPreset: cfg.uploadPreset || 'ml_default',
    cdnBaseUrl: cfg.cdnBaseUrl || 'https://cdn.dr-sean.store',
    cdnFolder: cfg.cdnFolder || ''
  };
}

export function render(app){
  const cfg = defaults();
  const canConfig = ['owner','admin'].includes((app.getRole?.() || app.getUser?.().role || '').toLowerCase());
  return `
  <div class="card-grid">
    <section class="card two-col">
      <div class="mini-card">
        <h3>Theme Manager</h3>
        <div class="command-list">${app.themes.map(t=>`<button class="nav-btn ${app.getTheme()===t.id?'active':''}" data-theme="${t.id}"><span class="nav-icon">🎨</span><span class="nav-copy"><strong>${t.name}</strong><small>${t.desc}</small></span></button>`).join('')}</div>
      </div>
      <div class="mini-card">
        <h3>Workspace</h3>
        <div class="action-row"><button class="btn primary" id="toggleFocusBtn">Toggle Focus</button><button class="btn ghost" id="toggleSidebarBtn">Toggle Sidebar Compact</button></div>
        <div class="info-box">Mengatur mode fokus, sidebar compact, theme, dan konfigurasi publish.</div>
      </div>
    </section>

    ${canConfig ? `<section class="card two-col wide-left">
      <div class="mini-card">
        <h3>Publish Config</h3>
        <div class="stack-sm">
          <input id="cfgGithubToken" placeholder="GitHub Token" value="${cfg.githubToken}">
          <input id="cfgGithubOwner" placeholder="GitHub Owner" value="${cfg.githubOwner}">
          <input id="cfgGithubRepo" placeholder="GitHub Repo" value="${cfg.githubRepo}">
          <input id="cfgGithubBranch" placeholder="GitHub Branch" value="${cfg.githubBranch}">
          <input id="cfgAmpBaseUrl" placeholder="AMP Base URL" value="${cfg.ampBaseUrl}">
        </div>
      </div>
      <div class="mini-card">
        <h3>CDN Config</h3>
        <div class="stack-sm">
          <input id="cfgCloudName" placeholder="Cloudinary Cloud Name" value="${cfg.cloudName}">
          <input id="cfgUploadPreset" placeholder="Cloudinary Upload Preset" value="${cfg.uploadPreset}">
          <input id="cfgCdnBaseUrl" placeholder="CDN Base URL" value="${cfg.cdnBaseUrl}">
          <input id="cfgCdnFolder" placeholder="Folder / Prefix (opsional)" value="${cfg.cdnFolder}">
        </div>
      </div>
      <div class="action-row"><button class="btn primary" id="saveConfigBtn">Simpan Config</button><button class="btn ghost" id="clearConfigBtn">Reset Config</button></div>
    </section>` : `<section class="card"><h3>Config</h3><div class="info-box compact-info">Konfigurasi publish hanya tersedia untuk owner dan admin.</div></section>`}
  </div>`;
}

export function init(app){
  document.querySelectorAll('[data-theme]').forEach(btn=>btn.onclick=()=>{ app.setTheme(btn.dataset.theme); document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active', b===btn)); });
  $('#toggleFocusBtn').onclick=()=>document.body.classList.toggle('focus-mode');
  $('#toggleSidebarBtn').onclick=()=>document.body.classList.toggle('sidebar-collapsed');

  if(!$('#saveConfigBtn')) return;
  $('#saveConfigBtn').onclick = () => {
    setPublishConfig({
      githubToken: $('#cfgGithubToken').value.trim(),
      githubOwner: $('#cfgGithubOwner').value.trim(),
      githubRepo: $('#cfgGithubRepo').value.trim(),
      githubBranch: $('#cfgGithubBranch').value.trim() || 'main',
      ampBaseUrl: $('#cfgAmpBaseUrl').value.trim(),
      cloudName: $('#cfgCloudName').value.trim(),
      uploadPreset: $('#cfgUploadPreset').value.trim(),
      cdnBaseUrl: $('#cfgCdnBaseUrl').value.trim(),
      cdnFolder: $('#cfgCdnFolder').value.trim(),
    });
    notify('Config disimpan.');
  };

  $('#clearConfigBtn').onclick = () => {
    setPublishConfig({});
    notify('Config direset. Reload kalau mau lihat default lagi.');
  };
}
