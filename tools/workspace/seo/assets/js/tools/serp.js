function cutByPixel(text='', max=580){
  const ratio = 7.2;
  const limit = Math.floor(max/ratio);
  return text.length > limit ? text.slice(0, limit-1).trim() + '…' : text;
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div><div class="label">Title</div><input id="serpTitle" placeholder="Judul SEO" /></div>
        <div><div class="label">URL</div><input id="serpUrl" placeholder="https://domain.com/slug-halaman" /></div>
        <div><div class="label">Description</div><textarea id="serpDesc" placeholder="Meta description..."></textarea></div>
        <button class="action-btn primary" id="serpPreviewBtn">Preview SERP</button>
      </div>
      <div class="stack">
        <div class="kpi-row">
          <div class="kpi"><strong id="serpTitleLen">0</strong><span>Panjang title</span></div>
          <div class="kpi"><strong id="serpDescLen">0</strong><span>Panjang description</span></div>
        </div>
        <div class="serp-preview">
          <div id="serpTitleOut" class="serp-title">Judul preview akan muncul di sini</div>
          <div id="serpUrlOut" class="serp-url">https://domain.com/slug</div>
          <div id="serpDescOut" class="serp-desc">Description preview akan muncul di sini.</div>
        </div>
      </div>
    </div>
  `;
  const title = mount.querySelector('#serpTitle');
  const url = mount.querySelector('#serpUrl');
  const desc = mount.querySelector('#serpDesc');
  function update(){
    const t = title.value.trim();
    const d = desc.value.trim();
    mount.querySelector('#serpTitleLen').textContent = t.length;
    mount.querySelector('#serpDescLen').textContent = d.length;
    mount.querySelector('#serpTitleOut').textContent = cutByPixel(t || 'Judul preview akan muncul di sini', 580);
    mount.querySelector('#serpUrlOut').textContent = url.value.trim() || 'https://domain.com/slug';
    mount.querySelector('#serpDescOut').textContent = cutByPixel(d || 'Description preview akan muncul di sini.', 920);
  }
  [title,url,desc].forEach(el => el.addEventListener('input', update));
  mount.querySelector('#serpPreviewBtn').addEventListener('click', update);
  update();
}
