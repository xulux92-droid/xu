export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div><div class="label">Title</div><input id="metaTitle" /></div>
        <div><div class="label">Description</div><textarea id="metaDesc"></textarea></div>
        <div><div class="label">Canonical URL</div><input id="metaCanonical" placeholder="https://domain.com/slug" /></div>
        <button class="action-btn primary" id="metaGenerateBtn">Generate Meta Tags</button>
      </div>
      <div class="card"><p>Hasil akan berisi title, description, canonical, Open Graph, dan Twitter Card. Lumayan buat ngurangin kerja copy-paste manual yang bikin umur terasa lebih panjang dari seharusnya.</p></div>
    </div>
    <div class="code-box"><pre id="metaResult">Meta tags akan muncul di sini.</pre></div>
  `;
  const result = mount.querySelector('#metaResult');
  mount.querySelector('#metaGenerateBtn').addEventListener('click', () => {
    const title = mount.querySelector('#metaTitle').value.trim();
    const desc = mount.querySelector('#metaDesc').value.trim();
    const canonical = mount.querySelector('#metaCanonical').value.trim();
    result.textContent = `<title>${title}</title>\n<meta name="description" content="${desc}">\n<link rel="canonical" href="${canonical}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:url" content="${canonical}">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${desc}">`;
  });
}
