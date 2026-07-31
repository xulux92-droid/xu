export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">URL list (1 per baris)</div>
        <textarea id="indexerUrls" class="textarea-tall" placeholder="https://domain.com/halaman-1"></textarea>
        <button class="action-btn primary" id="indexerRunBtn">Prepare Submit List</button>
      </div>
      <div class="stack">
        <div class="card"><p>Tool ini bantu siapin list submit, endpoint ping dasar, dan batch payload. Bukan submit otomatis sakti, tapi ngurangin kerja manual yang bikin malas hidup.</p></div>
        <div class="result-box"><pre id="indexerResult">Payload helper akan muncul di sini.</pre></div>
      </div>
    </div>
  `;
  mount.querySelector('#indexerRunBtn').addEventListener('click', () => {
    const urls = mount.querySelector('#indexerUrls').value.split(/\n+/).map(v=>v.trim()).filter(Boolean);
    if(!urls.length){ ctx.toast('Masukkan URL dulu.', 'error'); return; }
    mount.querySelector('#indexerResult').textContent = JSON.stringify({
      google_ping_hint: urls.map(url => `https://www.google.com/ping?sitemap=${encodeURIComponent(url.replace(/\/[^/]*$/, '/sitemap.xml'))}`),
      bing_ping_hint: urls.map(url => `https://www.bing.com/ping?sitemap=${encodeURIComponent(url.replace(/\/[^/]*$/, '/sitemap.xml'))}`),
      url_batch: urls,
    }, null, 2);
  });
}
