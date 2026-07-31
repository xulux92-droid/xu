function formatPercent(part, total){ return total ? ((part/total)*100).toFixed(2)+'%' : '0.00%' }
function buildTable(title, list){
  if(!list.length) return `<div class="card"><h4>${title}</h4><p>Tidak ada data.</p></div>`;
  return `<div class="card"><h4>${title}</h4><div class="list-box"><table class="table"><thead><tr><th>Keyword</th><th>Count</th><th>Density</th></tr></thead><tbody>${list.map(item => `<tr><td>${item.term}</td><td>${item.count}</td><td>${item.percent}</td></tr>`).join('')}</tbody></table></div></div>`;
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="card stack">
      <div class="label">Konten untuk dianalisa</div>
      <textarea id="densityInput" class="textarea-tall" placeholder="Tempel artikel panjang di sini..."></textarea>
      <div class="toolbar">
        <button class="action-btn primary" id="densityRunBtn">Analyze 1-4 Kata</button>
      </div>
    </div>
    <div id="densityStats" class="kpi-row"></div>
    <div id="densityTables" class="stack"></div>
  `;
  mount.querySelector('#densityRunBtn').addEventListener('click', () => {
    const text = mount.querySelector('#densityInput').value;
    const tokens = ctx.tokenize(text);
    if(!tokens.length){ ctx.toast('Konten kosong. Analyzer bukan tukang ramal.', 'error'); return; }
    const maps = [1,2,3,4].map(n => {
      const map = new Map();
      for(let i=0;i<=tokens.length-n;i++){
        const term = tokens.slice(i,i+n).join(' ');
        map.set(term, (map.get(term)||0)+1);
      }
      return [...map.entries()]
        .filter(([,count]) => count > 1)
        .sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))
        .slice(0, 40)
        .map(([term,count]) => ({ term, count, percent: formatPercent(count, tokens.length) }));
    });
    mount.querySelector('#densityStats').innerHTML = `
      <div class="kpi"><strong>${tokens.length}</strong><span>Total kata</span></div>
      <div class="kpi"><strong>${maps[0].length}</strong><span>Keyword 1 kata</span></div>
      <div class="kpi"><strong>${maps[1].length}</strong><span>Keyword 2 kata</span></div>
      <div class="kpi"><strong>${maps[2].length}</strong><span>Keyword 3 kata</span></div>
      <div class="kpi"><strong>${maps[3].length}</strong><span>Keyword 4 kata</span></div>
    `;
    mount.querySelector('#densityTables').innerHTML = [
      buildTable('Keyword 1 Kata', maps[0]),
      buildTable('Keyword 2 Kata', maps[1]),
      buildTable('Keyword 3 Kata', maps[2]),
      buildTable('Keyword 4 Kata', maps[3]),
    ].join('');
    ctx.toast('Density selesai dihitung sampai 4 kata.', 'success');
  });
}
