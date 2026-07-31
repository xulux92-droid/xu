export function render(mount, ctx){
  mount.innerHTML = `
    <div class="tool-grid">
      <div class="card stack">
        <div class="label">Nama file / keyword gambar</div>
        <input id="imgKeyword" placeholder="contoh: banner sbobet mix parlay" />
        <button class="action-btn primary" id="imgRunBtn">Generate Asset SEO</button>
      </div>
      <div class="card stack">
        <div class="label">Hasil</div>
        <div class="result-box"><pre id="imgResult">Nama file, alt, title, dan caption akan muncul di sini.</pre></div>
      </div>
    </div>
  `;
  mount.querySelector('#imgRunBtn').addEventListener('click', () => {
    const kw = mount.querySelector('#imgKeyword').value.trim();
    if(!kw){ ctx.toast('Isi nama file atau keyword gambar dulu.', 'error'); return; }
    const slug = ctx.slugify(kw);
    mount.querySelector('#imgResult').textContent = `filename: ${slug}.jpg\nalt: ${kw}\ntitle: ${kw}\ncaption: Ilustrasi ${kw}`;
  });
}
