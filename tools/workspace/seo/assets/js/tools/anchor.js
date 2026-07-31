export function render(mount, ctx){
  mount.innerHTML = `
    <div class="tool-grid">
      <div class="card stack">
        <div class="label">Brand / keyword</div>
        <input id="anchorBase" placeholder="contoh: WAHANABET" />
        <button class="action-btn primary" id="anchorRunBtn">Generate Anchor Variants</button>
      </div>
      <div class="result-box"><pre id="anchorResult">Anchor variants akan muncul di sini.</pre></div>
    </div>
  `;
  mount.querySelector('#anchorRunBtn').addEventListener('click', () => {
    const base = mount.querySelector('#anchorBase').value.trim();
    if(!base){ ctx.toast('Isi brand atau keyword dulu.', 'error'); return; }
    const rows = [
      `Exact: ${base}`,
      `Partial: link ${base}`,
      `Branded: situs resmi ${base}`,
      `Natural: cek informasi ${base}`,
      `CTA: daftar di ${base}`,
      `Naked: https://domain.com/${ctx.slugify(base)}`,
    ];
    mount.querySelector('#anchorResult').textContent = rows.join('\n');
  });
}
