export function render(mount, ctx) {
  const toolCount = Object.keys(ctx.toolRegistry).length;
  mount.innerHTML = `
    <div class="kpi-row">
      <div class="kpi"><strong>${toolCount}</strong><span>Total tools SEO aktif</span></div>
      <div class="kpi"><strong>1-4</strong><span>N-gram keyword analyzer</span></div>
      <div class="kpi"><strong>∞</strong><span>Tanpa limit artificial di textarea dan input</span></div>
      <div class="kpi"><strong>Modular</strong><span>Satu tool satu modul. Biar waras.</span></div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3>Yang paling worth it dulu</h3>
        <p>Mulai dari Content Generator, Keyword Density Advanced, SERP Preview, sama SEO Score Checker. Empat ini paling cepat ngangkat kerja harian lo.</p>
      </div>
      <div class="card">
        <h3>Kenapa modular</h3>
        <p>Karena file JS ditumpuk jadi satu itu cara tercepat bikin proyek bagus berubah jadi gudang kabel kusut.</p>
      </div>
      <div class="card">
        <h3>Shiny Glass UI</h3>
        <p>Semua tombol, action, copy, dan nav sudah pakai efek shiny glass. Biar klik terasa sedikit lebih mewah dari realita.</p>
      </div>
      <div class="card">
        <h3>Workspace luas</h3>
        <p>Konten tool dibikin dominan, padding efisien, dan ruang kosong gak dibiarkan jadi lahan terlantar.</p>
      </div>
    </div>

    <div class="tool-grid">
      ${Object.entries(ctx.toolRegistry).filter(([id]) => id !== 'dashboard').map(([id, tool]) => `
        <div class="card">
          <h3>${tool.icon} ${tool.title}</h3>
          <p>${tool.desc}</p>
          <div class="inline-actions" style="margin-top:14px">
            <button class="action-btn primary" data-open="${id}">Buka Tool</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  mount.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => ctx.loadTool(btn.dataset.open)));
}
