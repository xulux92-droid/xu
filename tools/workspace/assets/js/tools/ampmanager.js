import { $, notify, copyText, slugify, downloadText } from '../core/utils.js';
import { getPublishConfig, publishHtmlToGithub } from '../core/publish.js';

const AMP_THEMES = {
  luxury: { label:'Golden Luxury', css:'body{font-family:Arial,sans-serif;margin:0;background:#090602;color:#fff7df;line-height:1.7}.page{min-height:100vh;padding:22px;background:radial-gradient(circle at 20% 10%,rgba(255,214,102,.30),transparent 30%),linear-gradient(145deg,#090602,#291803 52%,#090602)}.wrap{max-width:920px;margin:0 auto}.glass{background:rgba(35,21,4,.78);border:1px solid rgba(255,220,128,.38);box-shadow:0 24px 80px rgba(255,190,60,.16);border-radius:28px;overflow:hidden}.hero{padding:34px 22px;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,220,128,.38);color:#ffd980;font-size:12px}h1{font-size:clamp(34px,8vw,68px);line-height:.98;margin:14px 0;letter-spacing:-.055em}.lead{color:#ffd980;font-size:18px}.media{margin-bottom:18px}.media amp-img{display:block}.content{padding:22px}.btn{display:inline-block;background:linear-gradient(135deg,#fff1a8,#f6c85f,#b98021);color:#070707;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:900}.shine{position:relative}.shine:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent,rgba(255,255,255,.22),transparent);opacity:.55;pointer-events:none}@media(max-width:720px){.page{padding:12px}.hero{padding:26px 16px}h1{font-size:40px}}' },
  neon: { label:'Neon Cyberpunk', css:'body{font-family:Arial,sans-serif;margin:0;background:#070815;color:#f7fbff;line-height:1.7}.page{min-height:100vh;padding:22px;background:radial-gradient(circle at 18% 10%,rgba(0,245,255,.30),transparent 30%),radial-gradient(circle at 86% 18%,rgba(255,79,216,.26),transparent 30%),linear-gradient(145deg,#070815,#11123a 52%,#05050c)}.wrap{max-width:920px;margin:0 auto}.glass{background:rgba(9,12,40,.78);border:1px solid rgba(145,247,255,.36);box-shadow:0 24px 80px rgba(0,245,255,.16);border-radius:28px;overflow:hidden}.hero{padding:34px 22px;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(145,247,255,.36);color:#91f7ff;font-size:12px}h1{font-size:clamp(34px,8vw,68px);line-height:.98;margin:14px 0;letter-spacing:-.055em;text-shadow:0 0 30px rgba(0,245,255,.35)}.lead{color:#91f7ff;font-size:18px}.media{margin-bottom:18px}.media amp-img{display:block}.content{padding:22px}.btn{display:inline-block;background:linear-gradient(135deg,#00f5ff,#7c5cff,#ff4fd8);color:#070707;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:900}.shine{position:relative}.shine:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent,rgba(255,255,255,.22),transparent);opacity:.55;pointer-events:none}@media(max-width:720px){.page{padding:12px}.hero{padding:26px 16px}h1{font-size:40px}}' },
  casino: { label:'Red Casino Shine', css:'body{font-family:Arial,sans-serif;margin:0;background:#110003;color:#fff3ed;line-height:1.7}.page{min-height:100vh;padding:22px;background:radial-gradient(circle at 20% 0%,rgba(255,45,85,.34),transparent 32%),radial-gradient(circle at 86% 12%,rgba(255,209,102,.22),transparent 28%),linear-gradient(145deg,#110003,#3b0612 55%,#080001)}.wrap{max-width:920px;margin:0 auto}.glass{background:rgba(38,3,12,.78);border:1px solid rgba(255,121,121,.32);box-shadow:0 24px 80px rgba(255,45,85,.16);border-radius:28px;overflow:hidden}.hero{padding:34px 22px;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,121,121,.32);color:#ffb3a1;font-size:12px}h1{font-size:clamp(34px,8vw,68px);line-height:.98;margin:14px 0;letter-spacing:-.055em}.lead{color:#ffb3a1;font-size:18px}.media{margin-bottom:18px}.media amp-img{display:block}.content{padding:22px}.btn{display:inline-block;background:linear-gradient(135deg,#ffd166,#ff2d55,#99111f);color:#070707;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:900}.shine{position:relative}.shine:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent,rgba(255,255,255,.22),transparent);opacity:.55;pointer-events:none}@media(max-width:720px){.page{padding:12px}.hero{padding:26px 16px}h1{font-size:40px}}' },
  iceberg: { label:'Iceberg Clean', css:'body{font-family:Arial,sans-serif;margin:0;background:#06151d;color:#effcff;line-height:1.7}.page{min-height:100vh;padding:22px;background:radial-gradient(circle at 16% 8%,rgba(133,243,255,.32),transparent 33%),linear-gradient(145deg,#06151d,#12364a 55%,#041016)}.wrap{max-width:920px;margin:0 auto}.glass{background:rgba(5,22,32,.76);border:1px solid rgba(169,239,255,.36);box-shadow:0 24px 80px rgba(133,243,255,.16);border-radius:28px;overflow:hidden}.hero{padding:34px 22px;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(169,239,255,.36);color:#a9efff;font-size:12px}h1{font-size:clamp(34px,8vw,68px);line-height:.98;margin:14px 0;letter-spacing:-.055em}.lead{color:#a9efff;font-size:18px}.media{margin-bottom:18px}.media amp-img{display:block}.content{padding:22px}.btn{display:inline-block;background:linear-gradient(135deg,#dffbff,#85f3ff,#2d8fb3);color:#070707;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:900}.shine{position:relative}.shine:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent,rgba(255,255,255,.22),transparent);opacity:.55;pointer-events:none}@media(max-width:720px){.page{padding:12px}.hero{padding:26px 16px}h1{font-size:40px}}' },
  sunset: { label:'Purple Sunset', css:'body{font-family:Arial,sans-serif;margin:0;background:#12051f;color:#fff6ff;line-height:1.7}.page{min-height:100vh;padding:22px;background:radial-gradient(circle at 16% 8%,rgba(255,139,209,.30),transparent 32%),radial-gradient(circle at 80% 16%,rgba(255,196,107,.22),transparent 28%),linear-gradient(145deg,#12051f,#3b1552 54%,#07010d)}.wrap{max-width:920px;margin:0 auto}.glass{background:rgba(32,8,50,.78);border:1px solid rgba(255,201,243,.32);box-shadow:0 24px 80px rgba(255,139,209,.16);border-radius:28px;overflow:hidden}.hero{padding:34px 22px;margin-bottom:18px}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,201,243,.32);color:#ffc9f3;font-size:12px}h1{font-size:clamp(34px,8vw,68px);line-height:.98;margin:14px 0;letter-spacing:-.055em}.lead{color:#ffc9f3;font-size:18px}.media{margin-bottom:18px}.media amp-img{display:block}.content{padding:22px}.btn{display:inline-block;background:linear-gradient(135deg,#ffc46b,#ff8bd1,#8b5cff);color:#070707;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:900}.shine{position:relative}.shine:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent,rgba(255,255,255,.22),transparent);opacity:.55;pointer-events:none}@media(max-width:720px){.page{padding:12px}.hero{padding:26px 16px}h1{font-size:40px}}' }
};

function template(themeKey='luxury'){
  const theme = AMP_THEMES[themeKey] || AMP_THEMES.luxury;
  return `<!doctype html>
<html amp lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>##judul##</title>
  <meta name="description" content="##deskripsi##">
  <link rel="canonical" href="##url##">
  <meta property="og:title" content="##judul##">
  <meta property="og:description" content="##deskripsi##">
  <meta property="og:image" content="##gambar##">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>${theme.css}</style>
</head>
<body>
  <main class="page">
    <div class="wrap">
      <section class="hero glass shine">
        <div class="pill">${theme.label} • SEO Ready • Mobile First</div>
        <h1>##judul##</h1>
        <p class="lead">##deskripsi##</p>
        <p><a class="btn" href="##url##">Kunjungi Sekarang</a></p>
      </section>
      <section class="media glass shine">
        <amp-img src="##gambar##" width="1200" height="630" layout="responsive" alt="##judul##"></amp-img>
      </section>
      <article class="content glass">##konten##</article>
    </div>
  </main>
</body>
</html>`;
}

function renderPreview(html){
  const frame = $('#ampPreviewFrame');
  if(frame) frame.srcdoc = html;
}

export function render(){
  const cfg = getPublishConfig();
  return `
  <div class="card-grid">
    <section class="card two-col wide-left">
      <div class="mini-card">
        <h3>AMP Builder Pro</h3>
        <div class="stack-sm">
          <select id="ampTheme">
            <option value="luxury">Golden Luxury</option>
            <option value="neon">Neon Cyberpunk</option>
            <option value="casino">Red Casino Shine</option>
            <option value="iceberg">Iceberg Clean</option>
            <option value="sunset">Purple Sunset</option>
          </select>
          <input id="ampTitle" placeholder="Judul AMP">
          <input id="ampDesc" placeholder="Deskripsi AMP">
          <input id="ampSlug" placeholder="Slug halaman (contoh: promo-hari-ini)">
          <input id="ampUrl" placeholder="Target URL / canonical">
          <input id="ampImage" placeholder="URL gambar">
          <textarea id="ampContent" placeholder="Konten HTML / paragraf"></textarea>
        </div>
        <div class="action-row wrap-actions">
          <button class="btn primary" id="generateAmpBtn">Generate</button>
          <button class="btn ghost" id="copyAmpBtn">Copy HTML</button>
          <button class="btn ghost" id="downloadAmpBtn">Download</button>
          <button class="btn primary" id="publishAmpBtn">Publish</button>
        </div>
        <div class="helper-text">Publish target: <strong>${cfg.githubOwner || 'xulux92-droid'}/${cfg.githubRepo || 'amp-pages'}</strong> → <strong>${cfg.ampBaseUrl || 'https://amp.dr-sean.store'}</strong></div>
      </div>
      <div class="mini-card">
        <h3>AMP Output</h3>
        <textarea id="ampOutput" placeholder="Hasil AMP HTML muncul di sini"></textarea>
        <div class="stack-sm">
          <input id="ampLiveUrl" placeholder="URL live akan muncul di sini" readonly>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="section-head"><div><h3>Preview</h3><p class="helper-text">Preview cepat sebelum publish ke Pages.</p></div></div>
      <iframe id="ampPreviewFrame" class="amp-preview-frame"></iframe>
    </section>
  </div>`;
}

export function init(){
  const lastCdn = localStorage.getItem('xu-last-cdn-url') || '';
  if(lastCdn) $('#ampImage').value = lastCdn;
  $('#ampTheme')?.addEventListener('change', () => { if($('#ampOutput').value) generate(); });

  function generate(){
    const title = $('#ampTitle').value.trim();
    const desc = $('#ampDesc').value.trim();
    const slug = slugify($('#ampSlug').value.trim() || title);
    const url = $('#ampUrl').value.trim() || `${(getPublishConfig().ampBaseUrl || 'https://amp.dr-sean.store').replace(/\/$/,'')}/${slug}.html`;
    const image = $('#ampImage').value.trim();
    const contentRaw = $('#ampContent').value.trim();
    const content = contentRaw ? (contentRaw.includes('<') ? contentRaw : contentRaw.split(/\n{2,}/).map(p => `<p>${p.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</p>`).join('\n')) : '<p>Konten belum diisi.</p>';
    $('#ampSlug').value = slug;
    const theme = $('#ampTheme')?.value || 'luxury';
    const html = template(theme)
      .replaceAll('##judul##', title || 'Judul AMP')
      .replaceAll('##deskripsi##', desc || 'Deskripsi AMP')
      .replaceAll('##url##', url)
      .replaceAll('##gambar##', image || '')
      .replaceAll('##konten##', content);
    $('#ampOutput').value = html;
    $('#ampLiveUrl').value = url;
    renderPreview(html);
    return { slug, html, url };
  }

  $('#generateAmpBtn').onclick = () => { generate(); notify('AMP digenerate.'); };
  $('#copyAmpBtn').onclick = async ()=>{ if(!$('#ampOutput').value) generate(); await copyText($('#ampOutput').value); notify('AMP HTML dicopy.'); };
  $('#downloadAmpBtn').onclick = ()=>{ const {slug, html} = generate(); downloadText(`${slug}.html`, html, 'text/html;charset=utf-8'); };
  $('#publishAmpBtn').onclick = async ()=>{
    try {
      const cfg = getPublishConfig();
      const { slug, html } = generate();
      await publishHtmlToGithub({ token: cfg.githubToken, owner: cfg.githubOwner, repo: cfg.githubRepo, branch: cfg.githubBranch || 'main', slug, html });
      const live = `${(cfg.ampBaseUrl || 'https://amp.dr-sean.store').replace(/\/$/,'')}/${slug}.html`;
      $('#ampLiveUrl').value = live;
      notify('AMP berhasil dipublish.');
    } catch(err){
      notify(err.message || 'Gagal publish AMP.');
    }
  };
}
