import { $, copyText, notify, escapeHtml } from '../core/utils.js';

const stop = new Set([
  'dan','di','ke','dari','yang','untuk','dengan','atau','ini','itu','the','a','an','of','to','in','is','are','on','for',
  'sebagai','pada','karena','agar','lebih','jadi','juga','akan','bisa','dalam','saat','oleh','para','kami','kamu','gue'
]);

function tokenize(text=''){
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.replace(/^-+|-+$/g,''))
    .filter(w => w && !stop.has(w) && w.length > 2);
}

function countNgrams(words, size){
  const total = Math.max(words.length - size + 1, 0);
  const freq = new Map();

  for(let i=0; i<=words.length - size; i++){
    const slice = words.slice(i, i + size);
    if(slice.some(word => stop.has(word) || word.length < 3)) continue;
    const key = slice.join(' ');
    freq.set(key, (freq.get(key) || 0) + 1);
  }

  return {
    total,
    rows: [...freq.entries()]
      .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 20)
      .map(([phrase, count]) => ({
        phrase,
        count,
        percent: total ? ((count / total) * 100).toFixed(2) : '0.00'
      }))
  };
}

function renderSection(title, rows){
  if(!rows.length){
    return `
      <div class="mini-card density-card">
        <div class="density-head"><h4>${title}</h4></div>
        <div class="info-box compact-info">Belum ada data yang layak dihitung.</div>
      </div>
    `;
  }

  return `
    <div class="mini-card density-card">
      <div class="density-head"><h4>${title}</h4></div>
      <div class="density-list">
        ${rows.map((row, index) => `
          <div class="density-row">
            <div class="density-rank">${index + 1}</div>
            <div class="density-copy">
              <strong>${escapeHtml(row.phrase)}</strong>
              <small>${row.count}x · ${row.percent}%</small>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buildPlainText(result){
  return [
    ['Keyword 1 Kata', result.one],
    ['Keyword 2 Kata', result.two],
    ['Keyword 3 Kata', result.three],
    ['Keyword 4 Kata', result.four],
  ].map(([title, rows]) => {
    const body = rows.length
      ? rows.map((row, index) => `${index + 1}. ${row.phrase} — ${row.count}x (${row.percent}%)`).join('\n')
      : 'Belum ada data.';
    return `${title}\n${body}`;
  }).join('\n\n');
}

function analyze(text=''){
  const words = tokenize(text);
  return {
    one: countNgrams(words, 1).rows,
    two: countNgrams(words, 2).rows,
    three: countNgrams(words, 3).rows,
    four: countNgrams(words, 4).rows,
  };
}

export function render(){
  return `
    <div class="card-grid">
      <section class="card">
        <div class="section-head">
          <div>
            <h3>Keyword Density</h3>
            <p class="helper-text">Menghitung keyword 1 kata sampai 4 kata untuk analisis SEO.</p>
          </div>
        </div>

        <div class="density-shell">
          <div class="mini-card density-input-card">
            <textarea id="kdInput" class="density-input" placeholder="Paste teks di sini..."></textarea>
            <div class="action-row">
              <button class="btn primary" id="kdRun">Analyze</button>
              <button class="btn ghost" id="kdClear">Clear</button>
              <button class="btn ghost" id="kdCopy">Copy Semua</button>
            </div>
          </div>

          <div id="kdOutput" class="density-grid">
            <div class="info-box">Belum ada hasil analisa.</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function init(){
  let latest = null;

  $('#kdRun').onclick = () => {
    const input = $('#kdInput').value;
    if(!input.trim()) return notify('Paste teks dulu.');

    latest = analyze(input);
    $('#kdOutput').innerHTML = [
      renderSection('Keyword 1 Kata', latest.one),
      renderSection('Keyword 2 Kata', latest.two),
      renderSection('Keyword 3 Kata', latest.three),
      renderSection('Keyword 4 Kata', latest.four),
    ].join('');
  };

  $('#kdClear').onclick = () => {
    latest = null;
    $('#kdInput').value = '';
    $('#kdOutput').innerHTML = '<div class="info-box">Belum ada hasil analisa.</div>';
  };

  $('#kdCopy').onclick = async () => {
    if(!latest) return notify('Belum ada hasil buat dicopy.');
    await copyText(buildPlainText(latest));
    notify('Semua hasil keyword dicopy.');
  };
}
