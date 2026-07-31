export function render(mount, ctx){
  mount.innerHTML = `
    <div class="tool-grid">
      <div class="card stack">
        <div class="label">Keyword</div>
        <input id="linkKeyword" placeholder="contoh: sbobet terpercaya" />
        <div class="label">Target URL</div>
        <input id="linkTarget" placeholder="https://domain.com/sbobet-terpercaya" />
        <button class="action-btn primary" id="linkRunBtn">Generate Internal Link</button>
      </div>
      <div class="card"><p>Output berisi anchor exact, partial, branded, natural, dan CTA style. Biar linking internal lo gak monoton kayak alarm pagi.</p></div>
    </div>
    <div class="result-box"><pre id="linkResult">Anchor dan HTML link akan muncul di sini.</pre></div>
  `;
  mount.querySelector('#linkRunBtn').addEventListener('click', () => {
    const kw = mount.querySelector('#linkKeyword').value.trim();
    const url = mount.querySelector('#linkTarget').value.trim() || '#';
    if(!kw){ ctx.toast('Isi keyword anchor dulu.', 'error'); return; }
    const variants = [
      kw,
      `${kw} terbaik`,
      `panduan ${kw}`,
      `cek ${kw}`,
      `informasi lengkap ${kw}`,
      `lihat detail ${kw}`,
    ];
    mount.querySelector('#linkResult').textContent = variants.map(v => `<a href="${url}">${v}</a>`).join('\n');
  });
}
