export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">Daftar URL (1 per baris)</div>
        <textarea id="sitemapUrls" class="textarea-tall" placeholder="https://domain.com/\nhttps://domain.com/halaman"></textarea>
        <button class="action-btn primary" id="sitemapRunBtn">Generate sitemap.xml</button>
      </div>
      <div class="code-box"><pre id="sitemapResult">XML sitemap akan muncul di sini.</pre></div>
    </div>
  `;
  mount.querySelector('#sitemapRunBtn').addEventListener('click', () => {
    const urls = mount.querySelector('#sitemapUrls').value.split(/\n+/).map(v=>v.trim()).filter(Boolean);
    if(!urls.length){ ctx.toast('Masukkan URL dulu.', 'error'); return; }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n')}\n</urlset>`;
    mount.querySelector('#sitemapResult').textContent = xml;
  });
}
