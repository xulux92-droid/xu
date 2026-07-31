function respond(q=''){
  const text = q.toLowerCase();
  if(text.includes('judul')) return 'Coba pakai formula: [keyword utama] + [benefit] + [angle pencarian]. Judul bagus itu tajam, bukan ramai doang.';
  if(text.includes('meta')) return 'Meta description idealnya padat, natural, dan bikin orang mau klik. Fokus ke intent, bukan tumpukan keyword.';
  if(text.includes('cta')) return 'CTA yang bagus itu jelas, aktif, dan gak muter. Contoh: Cek detail sekarang, Mulai dari sini, Bandingkan opsinya.';
  if(text.includes('artikel')) return 'Mulai dari intent, baru heading, baru body. Jangan kebalik. Orang sering keburu nulis sebelum tahu mau jawab apa.';
  if(text.includes('keyword')) return 'Kelompokkan keyword jadi: utama, pendukung, intent informasional, intent komersial, dan anchor variation.';
  return 'Pertanyaan diterima. Jawaban singkatnya: rapikan intent, struktur heading, distribusi keyword, lalu poles CTR. Mesin pencari suka kejelasan, bukan drama.';
}
export function render(mount, ctx){
  mount.innerHTML = `
    <div class="two-col">
      <div class="card stack">
        <div class="label">Tanya sesuatu soal SEO</div>
        <textarea id="seoAsk" class="textarea-tall" placeholder="contoh: bantu bikin ide judul untuk keyword sbobet mix parlay"></textarea>
        <button class="action-btn primary" id="seoAskBtn">Tanya Assistant</button>
      </div>
      <div class="card stack">
        <h3>Catatan</h3>
        <p>Ini assistant lokal rule-based. Bukan AI cloud sakti, tapi cukup buat brainstorming cepat tanpa keluar halaman.</p>
      </div>
    </div>
    <div class="result-box"><pre id="seoAssistantResult">Jawaban assistant akan muncul di sini.</pre></div>
  `;
  mount.querySelector('#seoAskBtn').addEventListener('click', () => {
    const q = mount.querySelector('#seoAsk').value.trim();
    if(!q){ ctx.toast('Tanya dulu. Assistant bukan cenayang beku.', 'error'); return; }
    mount.querySelector('#seoAssistantResult').textContent = respond(q);
  });
}
