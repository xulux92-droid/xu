import { toolMap, groups } from '../core/tool-config.js';

export function render(app){
  const visibleGroups = groups
    .filter(g => g.key !== 'home')
    .map(group => ({ ...group, items: group.items.map(id => toolMap[id]).filter(Boolean).filter(t => app.hasAccess?.(t.id) ?? true) }))
    .filter(group => group.items.length);

  const cards = visibleGroups.map(group => `
    <section class="card dashboard-section">
      <div class="section-head">
        <div>
          <h3>${group.label}</h3>
          <p class="helper-text">${group.items.length} tools tersedia.</p>
        </div>
      </div>
      <div class="tool-grid single-mobile dashboard-tools">
        ${group.items.map(t => `
          <article class="tool-card dashboard-tool-card">
            <div>
              <div class="badge">${t.icon} ${t.title}</div>
              <p>${t.desc}</p>
            </div>
            <button class="btn primary" data-open="${t.id}">Buka Tool</button>
          </article>`).join('')}
      </div>
    </section>`).join('');

  const user = app.getUser();
  const totalVisible = visibleGroups.reduce((sum,g)=>sum+g.items.length,0);

  return `
    <div class="card-grid dashboard-grid">
      <section class="card dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="badge">${user.role || 'guest'} · ${user.username || 'Guest'}</span>
          <h2>Xu_Seo Workspace</h2>
          <p class="helper-text">Dashboard tools untuk SEO, AMP, CDN, template, konten, file, utility, dan komunikasi.</p>
        </div>
        <div class="stat-grid dashboard-stats">
          <div class="stat-card"><span>Tools Aktif</span><strong>${totalVisible}</strong></div>
          <div class="stat-card"><span>Group</span><strong>${visibleGroups.length}</strong></div>
          <div class="stat-card"><span>Role</span><strong>${user.role || 'guest'}</strong></div>
          <div class="stat-card"><span>Mode</span><strong>Ready</strong></div>
        </div>
      </section>
      ${cards}
    </div>`;
}

export function init(){
  document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', ()=>{
    const target = document.querySelector(`.nav-btn[data-tool="${btn.dataset.open}"]`);
    if (target) target.click();
  }));
}
