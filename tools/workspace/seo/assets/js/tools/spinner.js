const synonymMap = {
  terbaik:['unggulan','paling bagus','berkualitas'],
  cepat:['sigap','kilat','lebih cepat'],
  lengkap:['menyeluruh','penuh','komplet'],
  mudah:['praktis','gampang','lebih sederhana'],
  strategi:['pendekatan','cara','skema'],
  pengguna:['user','pemakai','pengunjung'],
  konten:['artikel','materi','isi'],
  optimasi:['pengoptimalan','peningkatan','penyempurnaan'],
};
function spinText(text=''){
  return text.split(/\b/).map(token => {
    const low = token.toLowerCase();
    if(!synonymMap[low]) return token;
    const pick = synonymMap[low][Math.floor(Math.random()*synonymMap[low].length)];
    return token[0] === token[0]?.toUpperCase() ? pick.charAt(0).toUpperCase()+pick.slice(1) : pick;
  }).join('');
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div>
          <div class="label">Teks asli</div>
          <textarea id="spinInput" class="textarea-tall" placeholder="Tempel artikel di sini..."></textarea>
        </div>
        <div class="toolbar">
          <button class="action-btn primary" id="spinBtn">Spin Natural</button>
          <button class="copy-btn" id="spinCopyBtn">Copy Result</button>
        </div>
      </div>
      <div class="card stack">
        <h3>Catatan</h3>
        <p>Spinner lokal ini fokus ke rewrite ringan dan variasi phrasing, bukan sulap linguistik tingkat dewa. Tapi cukup berguna buat bikin versi awal tanpa bikin teks rusak total.</p>
        <div class="badge">Tanpa batas input artificial</div>
      </div>
    </div>
    <div class="result-box"><pre id="spinResult">Hasil rewrite akan muncul di sini.</pre></div>
  `;
  const input = mount.querySelector('#spinInput');
  const result = mount.querySelector('#spinResult');
  mount.querySelector('#spinBtn').addEventListener('click', () => {
    if(!input.value.trim()){ ctx.toast('Tempel teks dulu, baru minta diputar.', 'error'); return; }
    result.textContent = spinText(input.value)
      .replace(/\bdan\b/gi, 'serta')
      .replace(/\buntuk\b/gi, 'guna');
    ctx.toast('Versi spin selesai dibuat.', 'success');
  });
  mount.querySelector('#spinCopyBtn').addEventListener('click', (e) => ctx.copyText(result.textContent, e.currentTarget));
}
