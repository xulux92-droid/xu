export function render() {
  return `
    <section class="card">
      <div class="action-row" style="justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap">
        <div>
          <h3 style="margin:0 0 6px">🚀 SEO Expert</h3>
          <div class="helper-text">Workspace SEO lanjutan untuk riset, audit, dan optimasi.</div>
        </div>
      </div>

      <div class="tool-grid single-mobile" style="margin-top:14px">
        <article class="tool-card">
          <div>
            <div class="badge">🧠 SEO Workspace</div>
            <p style="margin-top:10px">Membuka halaman SEO Expert terpisah untuk content generator, keyword tools, density, SERP, link builder, dan audit SEO.</p>
          </div>
          <div class="action-row" style="margin-top:12px">
            <button class="btn primary" id="seoExpertOpenSameTab">Buka SEO Expert</button>
            <button class="btn ghost" id="seoExpertOpenNewTab">Tab Baru</button>
          </div>
        </article>

        <article class="tool-card">
          <div>
            <div class="badge">📍 Path</div>
            <p style="margin-top:10px">Target path:</p>
            <div class="output-box" style="margin-top:8px">seo/</div>
          </div>
          <div class="helper-text" style="margin-top:12px">Path relatif untuk deployment subfolder.</div>
        </article>
      </div>
    </section>
  `;
}

export function init() {
  const basePath = location.pathname.endsWith('/') ? location.pathname : location.pathname.replace(/[^/]*$/, '');
  const targetUrl = `${location.origin}${basePath}seo/`;

  document.getElementById('seoExpertOpenSameTab')?.addEventListener('click', () => {
    window.location.href = targetUrl;
  });

  document.getElementById('seoExpertOpenNewTab')?.addEventListener('click', () => {
    window.open(targetUrl, '_blank');
  });
}
