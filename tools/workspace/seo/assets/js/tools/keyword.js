function uniq(arr){return [...new Set(arr.filter(Boolean))]}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">Keyword dasar</div>
        <input id="kgBase" placeholder="contoh: sbobet" />
        <div class="label">Modifier tambahan (opsional, pisah koma)</div>
        <input id="kgMods" placeholder="online, terpercaya, resmi, bonus besar" />
        <button class="action-btn primary" id="kgRunBtn">Generate Massal</button>
      </div>
      <div class="card">
        <h3>Output</h3>
        <p>Tool ini bikin variasi 1-4 kata. Gak ada limit artificial, jadi kalau lo mau modifier seabrek, silakan. Manusia kadang memang suka berlebihan.</p>
      </div>
    </div>
    <div class="result-box"><pre id="kgResult">Daftar keyword akan muncul di sini.</pre></div>
  `;
  mount.querySelector('#kgRunBtn').addEventListener('click', () => {
    const base = mount.querySelector('#kgBase').value.trim().toLowerCase();
    if(!base){ ctx.toast('Isi keyword dasar dulu.', 'error'); return; }
    const customMods = mount.querySelector('#kgMods').value.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
    const mods = uniq(['online','terpercaya','terbaik','resmi','gacor','hari ini','bonus besar','deposit cepat','link alternatif','server thailand', ...customMods]);
    const phrases = uniq([
      base,
      ...mods.map(m => `${base} ${m}`),
      ...mods.flatMap(a => mods.map(b => a !== b ? `${base} ${a} ${b}` : '')),
      ...mods.slice(0,8).flatMap(a => mods.slice(0,8).flatMap(b => mods.slice(0,8).map(c => (new Set([a,b,c]).size === 3 ? `${base} ${a} ${b} ${c}` : '')))),
    ]).sort((a,b) => a.split(' ').length - b.split(' ').length || a.localeCompare(b));
    mount.querySelector('#kgResult').textContent = phrases.join('\n');
    ctx.toast(`Generated ${phrases.length} keyword. Semoga cukup buat ambisi lo hari ini.`, 'success');
  });
}
