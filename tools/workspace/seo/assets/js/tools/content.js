function sentenceCase(text=''){return text.charAt(0).toUpperCase()+text.slice(1)}
function buildParagraph(kw, sub, angle, count = 4){
  let out = [];
  for(let i=0;i<count;i++){
    out.push(`${sentenceCase(kw)} ${angle} ${sub} dengan pendekatan yang lebih jelas, terstruktur, dan enak dibaca. Paragraf ini sengaja dibuat cukup natural supaya konten tetap terasa manusiawi, bukan hasil tempelan kata kunci yang bikin pembaca ingin kabur.`)
  }
  return out.join('\n\n')
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="stack">
        <div class="card stack">
          <div>
            <div class="label">Keyword utama</div>
            <input id="cgKeyword" placeholder="contoh: sbobet mix parlay" />
          </div>
          <div>
            <div class="label">Keyword pendukung (pisahkan dengan koma)</div>
            <input id="cgSupport" placeholder="contoh: agen bola, mix parlay, judi bola online" />
          </div>
          <div>
            <div class="label">Target kata</div>
            <input id="cgWords" type="number" value="1000" />
          </div>
          <div>
            <div class="label">Gaya artikel</div>
            <select id="cgTone">
              <option value="edukatif">Edukatif</option>
              <option value="promosi">Promosi</option>
              <option value="soft selling">Soft Selling</option>
              <option value="agresif">Agresif</option>
            </select>
          </div>
          <div class="toolbar">
            <button class="action-btn primary" id="cgGenerateBtn">Generate Artikel</button>
            <button class="copy-btn" id="cgCopyBtn">Copy Result</button>
          </div>
        </div>
      </div>
      <div class="stack">
        <div class="card">
          <h3>Isi generator</h3>
          <p>Tool ini bikin artikel panjang dengan H1-H3, intro, body, FAQ, meta description, dan CTA. Bukan AI cloud sakti, tapi cukup buat draf kerja cepat tanpa batas artificial yang nyebelin.</p>
        </div>
        <div class="kpi-row">
          <div class="kpi"><strong>H1-H3</strong><span>Struktur heading lengkap</span></div>
          <div class="kpi"><strong>Meta</strong><span>Judul dan deskripsi ikut dibuat</span></div>
        </div>
      </div>
    </div>
    <div class="result-box"><pre id="cgResult">Hasil generator akan muncul di sini.</pre></div>
  `;

  const result = mount.querySelector('#cgResult');
  mount.querySelector('#cgGenerateBtn').addEventListener('click', () => {
    const kw = mount.querySelector('#cgKeyword').value.trim();
    const support = mount.querySelector('#cgSupport').value.trim();
    const tone = mount.querySelector('#cgTone').value;
    const targetWords = Math.max(300, Number(mount.querySelector('#cgWords').value || 1000));
    if(!kw){ ctx.toast('Isi keyword utama dulu. Mesin bukan cenayang.', 'error'); return; }
    const supports = support ? support.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const title = `${kw} ${tone === 'promosi' ? 'Terbaik' : 'Lengkap'} untuk Strategi Konten SEO yang Lebih Terarah`;
    const meta = `Pelajari ${kw} dengan struktur konten yang lebih rapi, keyword pendukung yang relevan, dan pendekatan ${tone} untuk optimasi SEO yang lebih kuat.`;
    const h2s = [
      `Kenapa ${kw} penting untuk target pencarian`,
      `Strategi konten ${kw} yang lebih efektif`,
      `Cara mengoptimalkan ${kw} dengan keyword pendukung`,
      `Kesimpulan dan CTA ${kw}`,
    ];
    const body = [
      `# ${title}`,
      '',
      `Meta Description: ${meta}`,
      '',
      `Pendahuluan`,
      '',
      buildParagraph(kw, 'sebagai fondasi artikel', `dibahas dengan gaya ${tone}`, 3),
      '',
      `## ${h2s[0]}`,
      '',
      buildParagraph(kw, 'pada perilaku pencarian pengguna', 'perlu dipahami lebih dalam', 4),
      '',
      `## ${h2s[1]}`,
      '',
      buildParagraph(kw, 'ke dalam struktur heading, meta, dan paragraf', 'bisa dibangun lebih strategis', 4),
      '',
      `### Memadukan intent dan keyword turunan`,
      '',
      buildParagraph(kw, 'ke intent informasional dan komersial', 'harus dilakukan secara seimbang', 3),
      '',
      `## ${h2s[2]}`,
      '',
      buildParagraph(kw, 'dengan dukungan keyword sekunder', 'akan membantu cakupan topik lebih luas', 4),
      '',
      supports.length ? `Keyword pendukung: ${supports.join(', ')}` : 'Keyword pendukung: belum diisi.',
      '',
      `## FAQ singkat`,
      '',
      `Q: Apakah ${kw} perlu diulang terus?`,
      `A: Tidak. Yang dicari mesin pencari sekarang adalah relevansi, struktur, dan kualitas konteks.`,
      '',
      `Q: Berapa kali ${kw} harus muncul?`,
      `A: Secukupnya. Density sehat lebih penting daripada spam kata kunci.`,
      '',
      `## ${h2s[3]}`,
      '',
      `Kesimpulannya, ${kw} akan jauh lebih efektif bila dibangun dengan struktur yang jelas, distribusi keyword yang natural, dan CTA yang relevan. Gunakan draf ini sebagai dasar, lalu poles sesuai niche dan tujuan halaman.`
    ].join('\n');

    const words = body.split(/\s+/).filter(Boolean).length;
    let expanded = body;
    while (expanded.split(/\s+/).filter(Boolean).length < targetWords) {
      expanded += `\n\nParagraf tambahan untuk memperkaya konteks ${kw}, memperluas semantik topik, dan menjaga kedalaman konten tanpa harus jatuh ke pola repetitif yang bikin pembaca dan mesin pencari sama-sama lelah.`;
    }
    result.textContent = expanded;
    ctx.toast(`Artikel dibuat. Panjang akhir sekitar ${expanded.split(/\s+/).filter(Boolean).length} kata.`, 'success');
  });
  mount.querySelector('#cgCopyBtn').addEventListener('click', (e) => ctx.copyText(result.textContent, e.currentTarget));
}
