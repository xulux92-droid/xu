function scoreContent(text=''){
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const headings = [...text.matchAll(/<h([1-4])[^>]*>/gi)].length;
  let score = 0;
  if(words >= 600) score += 25; else if(words >= 300) score += 15; else score += 5;
  if(headings >= 4) score += 20; else if(headings >= 2) score += 12;
  if(/meta name="description"/i.test(text)) score += 15;
  if(/<title>/i.test(text)) score += 15;
  if(/faq|q:/i.test(text)) score += 10;
  if(/cta|daftar|mulai|cek/i.test(text)) score += 15;
  return Math.min(100, score);
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">Konten / HTML</div>
        <textarea id="scoreInput" class="textarea-tall"></textarea>
        <button class="action-btn primary" id="scoreRunBtn">Check SEO Score</button>
      </div>
      <div id="scoreResult" class="card"><p>Score akan muncul di sini.</p></div>
    </div>
  `;
  mount.querySelector('#scoreRunBtn').addEventListener('click', () => {
    const text = mount.querySelector('#scoreInput').value;
    if(!text.trim()){ ctx.toast('Isi konten dulu.', 'error'); return; }
    const score = scoreContent(text);
    mount.querySelector('#scoreResult').innerHTML = `<div class="kpi-row"><div class="kpi"><strong>${score}/100</strong><span>SEO Score</span></div><div class="kpi"><strong>${text.trim().split(/\s+/).filter(Boolean).length}</strong><span>Total kata</span></div></div><p style="margin-top:14px;color:var(--muted)">Score ini dasar, bukan kitab suci. Tapi cukup berguna buat audit cepat sebelum publish.</p>`;
  });
}
