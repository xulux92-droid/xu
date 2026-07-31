export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">HTML atau teks heading</div>
        <textarea id="headingInput" class="textarea-tall" placeholder="<h1>Judul</h1>\n<h2>Sub</h2>\n<h3>Bagian</h3>"></textarea>
        <button class="action-btn primary" id="headingAnalyzeBtn">Analyze Heading</button>
      </div>
      <div class="result-box"><div id="headingResult">Hasil analisa heading akan muncul di sini.</div></div>
    </div>
  `;
  mount.querySelector('#headingAnalyzeBtn').addEventListener('click', () => {
    const text = mount.querySelector('#headingInput').value;
    const matches = [...text.matchAll(/<h([1-4])[^>]*>(.*?)<\/h\1>/gis)];
    if(!matches.length){ ctx.toast('Heading HTML tidak ditemukan. Tempel format heading yang benar.', 'error'); return; }
    const counts = {1:0,2:0,3:0,4:0};
    matches.forEach(m => counts[m[1]]++);
    mount.querySelector('#headingResult').innerHTML = `
      <div class="kpi-row">
        <div class="kpi"><strong>${counts[1]}</strong><span>H1</span></div>
        <div class="kpi"><strong>${counts[2]}</strong><span>H2</span></div>
        <div class="kpi"><strong>${counts[3]}</strong><span>H3</span></div>
        <div class="kpi"><strong>${counts[4]}</strong><span>H4</span></div>
      </div>
      <div class="list-box" style="margin-top:12px"><table class="table"><thead><tr><th>Level</th><th>Isi</th></tr></thead><tbody>${matches.map(m => `<tr><td>H${m[1]}</td><td>${m[2].replace(/<[^>]+>/g,'').trim()}</td></tr>`).join('')}</tbody></table></div>
    `;
  });
}
