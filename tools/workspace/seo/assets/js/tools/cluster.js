function classify(term=''){
  const t = term.toLowerCase();
  if(/cara|panduan|tips|apa|kenapa|review/.test(t)) return 'Informasional';
  if(/harga|bonus|terbaik|terpercaya|resmi|beli|daftar/.test(t)) return 'Komersial';
  if(/login|masuk|link alternatif|download/.test(t)) return 'Navigasional';
  return 'Umum';
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">Daftar keyword (1 per baris)</div>
        <textarea id="clusterInput" class="textarea-tall" placeholder="sbobet terpercaya\ncara main sbobet\nlogin sbobet"></textarea>
        <button class="action-btn primary" id="clusterRunBtn">Cluster Keyword</button>
      </div>
      <div class="card"><p>Tool sederhana buat ngelompokkan keyword berdasarkan intent. Bukan NLP super canggih, tapi cukup buat bikin list lebih waras.</p></div>
    </div>
    <div class="result-box"><div id="clusterResult"></div></div>
  `;
  mount.querySelector('#clusterRunBtn').addEventListener('click', () => {
    const lines = mount.querySelector('#clusterInput').value.split(/\n+/).map(v=>v.trim()).filter(Boolean);
    if(!lines.length){ ctx.toast('Masukkan keyword dulu.', 'error'); return; }
    const grouped = {};
    lines.forEach(line => {
      const type = classify(line);
      (grouped[type] ||= []).push(line);
    });
    mount.querySelector('#clusterResult').innerHTML = Object.entries(grouped).map(([type, items]) => `
      <div class="card" style="margin-bottom:12px">
        <h4>${type}</h4>
        <div class="list-box"><pre>${items.join('\n')}</pre></div>
      </div>
    `).join('');
  });
}
