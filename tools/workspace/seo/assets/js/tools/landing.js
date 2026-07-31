/* SEO Expert - Landing Page Generator FULL MODULE FIX */

const CTA_URL = "https://myredirects.site/mkt05/";

const templates = {
  golden: {
    name: "Golden Luxury",
    bg: "radial-gradient(circle at top,#7a4300 0%,#2b1200 45%,#070200 100%)",
    card: "rgba(92,52,22,.78)",
    border: "rgba(255,211,116,.38)",
    accent: "#ffd166",
    text: "#fff2cf",
    glow: "rgba(255,209,102,.55)"
  },
  neon: {
    name: "Neon Cyber",
    bg: "radial-gradient(circle at top,#063a5a 0%,#090014 52%,#020106 100%)",
    card: "rgba(7,25,45,.82)",
    border: "rgba(0,245,255,.38)",
    accent: "#00f5ff",
    text: "#e8fbff",
    glow: "rgba(0,245,255,.55)"
  },
  red: {
    name: "Red Casino Shine",
    bg: "radial-gradient(circle at top,#720000 0%,#270000 48%,#070000 100%)",
    card: "rgba(80,16,16,.82)",
    border: "rgba(255,80,80,.38)",
    accent: "#ff4d4d",
    text: "#ffecec",
    glow: "rgba(255,77,77,.55)"
  },
  iceberg: {
    name: "Iceberg Clean",
    bg: "radial-gradient(circle at top,#d9f8ff 0%,#24566b 45%,#061219 100%)",
    card: "rgba(6,36,48,.82)",
    border: "rgba(182,243,255,.42)",
    accent: "#b6f3ff",
    text: "#f0fcff",
    glow: "rgba(182,243,255,.55)"
  },
  purple: {
    name: "Purple Sunset",
    bg: "radial-gradient(circle at top,#651b99 0%,#220637 52%,#07020c 100%)",
    card: "rgba(55,21,82,.82)",
    border: "rgba(217,129,255,.38)",
    accent: "#d981ff",
    text: "#fff0ff",
    glow: "rgba(217,129,255,.55)"
  }
};

const $ = (s, r = document) => r.querySelector(s);

function esc(v = "") {
  return String(v).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function clean(v = "") {
  return String(v || "").trim();
}

function keywords(v = "") {
  return clean(v).split(",").map(x => x.trim()).filter(Boolean);
}

function mainKW(v = "") {
  return keywords(v)[0] || "layanan online";
}

function paragraphs(v = "") {
  const raw = clean(v);
  if (!raw) {
    return `<p>Informasi utama disusun secara jelas untuk membantu pengguna memahami layanan dengan cepat, nyaman, dan mudah diakses.</p>`;
  }

  return raw
    .split(/\n{2,}/)
    .map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function buildFaqs(brand, kw) {
  const k = mainKW(kw);
  return [
    {
      q: `Apa itu ${brand}?`,
      a: `${brand} adalah platform yang menyediakan informasi ${k} dengan struktur halaman yang rapi, mudah dipahami, dan cepat diakses.`
    },
    {
      q: `Kenapa memilih ${brand} untuk ${k}?`,
      a: `${brand} menghadirkan tampilan yang jelas, navigasi sederhana, serta informasi utama yang disusun untuk pengalaman pengguna yang lebih nyaman.`
    },
    {
      q: `Bagaimana cara mengakses ${brand}?`,
      a: `Pengguna dapat mengakses ${brand} melalui tombol daftar, login akun VIP, atau klaim promo yang tersedia pada halaman ini.`
    }
  ];
}

function buildTestimonials(brand, kw) {
  const k = mainKW(kw);
  return [
    `${brand} tampil rapi dan mudah digunakan untuk menemukan informasi ${k}.`,
    `Navigasi ${brand} cepat, jelas, dan nyaman diakses dari berbagai perangkat.`,
    `Informasi ${k} di ${brand} terasa lebih mudah dipahami karena tampilannya sederhana dan terstruktur.`
  ];
}

function schemaJSON(data, faqs) {
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image,
    "publisher": {
      "@type": "Organization",
      "name": data.brand,
      "logo": {
        "@type": "ImageObject",
        "url": data.logo
      }
    }
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return `
<script type="application/ld+json">${JSON.stringify(page)}</script>
<script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

function generateHTML(form = {}) {
  const theme = templates[form.template] || templates.golden;

  const brand = clean(form.brand) || "WAHANABET";
  const title = clean(form.title) || `${brand} • 🔥Xu_SEO🔥`;
  const description = clean(form.description) || `${brand} menghadirkan halaman informasi resmi dengan struktur SEO yang rapi dan mudah diakses.`;
  const kw = clean(form.keywords) || brand;
  const contentUrl = clean(form.contentUrl) || clean(form.url) || "";
  const ampUrl = clean(form.ampUrl) || "";
  const imageUrl = clean(form.imageUrl) || "";
  const iconUrl = clean(form.iconUrl) || "";
  const logoUrl = clean(form.logoUrl) || imageUrl || iconUrl || "";

  const faq = buildFaqs(brand, kw);
  const testi = buildTestimonials(brand, kw);
  const kwList = keywords(kw);

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(kw)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="googlebot" content="index, follow">
${contentUrl ? `<link rel="canonical" href="${esc(contentUrl)}">` : ""}
${ampUrl ? `<link rel="amphtml" href="${esc(ampUrl)}">` : ""}
${iconUrl ? `<link rel="icon" href="${esc(iconUrl)}">` : ""}
${contentUrl ? `<link rel="alternate" hreflang="id" href="${esc(contentUrl)}">` : ""}
${contentUrl ? `<link rel="alternate" hreflang="x-default" href="${esc(contentUrl)}">` : ""}

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${contentUrl ? `<meta property="og:url" content="${esc(contentUrl)}">` : ""}
${imageUrl ? `<meta property="og:image" content="${esc(imageUrl)}">` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
${imageUrl ? `<meta name="twitter:image" content="${esc(imageUrl)}">` : ""}

${schemaJSON({ title, description, url: contentUrl, image: imageUrl, logo: logoUrl, brand }, faq)}

<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:Arial,Helvetica,sans-serif;
  color:${theme.text};
  background:${theme.bg};
  overflow-x:hidden;
}
body:before{
  content:"";
  position:fixed;
  inset:0;
  background:
    radial-gradient(circle at 18% 12%, ${theme.glow}, transparent 28%),
    radial-gradient(circle at 85% 18%, rgba(255,255,255,.12), transparent 25%),
    linear-gradient(120deg, transparent 0%, rgba(255,255,255,.08) 45%, transparent 60%);
  animation:shine 7s linear infinite;
  pointer-events:none;
  z-index:0;
}
body:after{
  content:"";
  position:fixed;
  inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size:42px 42px;
  mask-image:linear-gradient(to bottom, rgba(0,0,0,.7), transparent);
  pointer-events:none;
  z-index:0;
}
@keyframes shine{
  0%{filter:hue-rotate(0deg);opacity:.75}
  50%{filter:hue-rotate(40deg);opacity:1}
  100%{filter:hue-rotate(0deg);opacity:.75}
}
.page{
  position:relative;
  z-index:1;
  width:min(1120px,94%);
  margin:auto;
  padding:28px 0 22px;
}
.top-logo{
  display:flex;
  justify-content:center;
  align-items:center;
  padding:18px 0 10px;
}
.top-logo img{
  max-width:230px;
  max-height:100px;
  object-fit:contain;
  filter:drop-shadow(0 0 22px ${theme.glow});
}
.logo-fallback{
  color:${theme.accent};
  font-size:34px;
  font-weight:900;
  text-shadow:0 0 22px ${theme.glow};
}
.hero{
  border:1px solid ${theme.border};
  background:${theme.card};
  border-radius:28px;
  padding:32px;
  box-shadow:0 0 34px rgba(0,0,0,.42), inset 0 0 24px rgba(255,255,255,.06);
  backdrop-filter:blur(10px);
}
.brand-title{
  text-align:center;
  font-size:clamp(28px,5vw,54px);
  margin:8px 0 22px;
  color:${theme.accent};
  text-shadow:0 0 26px ${theme.glow};
  letter-spacing:.5px;
  font-weight:900;
}
h1,h2,h3{color:${theme.accent}}
h1{font-size:clamp(28px,4vw,46px);margin:0 0 14px}
p{line-height:1.75;font-size:16px}
.hero-img{
  width:100%;
  max-height:430px;
  object-fit:cover;
  border-radius:24px;
  margin:22px 0;
  border:1px solid ${theme.border};
  box-shadow:0 0 30px ${theme.glow};
}
.kw-wrap{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin:20px 0 26px;
}
.kw{
  padding:9px 13px;
  border-radius:999px;
  border:1px solid ${theme.border};
  background:rgba(255,255,255,.09);
  font-weight:800;
  font-size:13px;
}
.info-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:18px;
  margin:28px 0;
}
.box{
  border:1px solid ${theme.border};
  background:rgba(255,255,255,.075);
  border-radius:22px;
  padding:22px;
  box-shadow:inset 0 0 16px rgba(255,255,255,.05);
}
.item{
  padding:14px 0;
  border-bottom:1px solid rgba(255,255,255,.1);
}
.item:last-child{border-bottom:0}
.item h3{margin:0 0 8px;font-size:17px}
.item p{margin:0}
.cta-section{
  margin:30px 0 6px;
  padding:30px;
  border-radius:28px;
  border:1px solid ${theme.border};
  background:
    radial-gradient(circle at top, ${theme.glow}, transparent 38%),
    rgba(0,0,0,.28);
  box-shadow:0 0 34px ${theme.glow};
}
.cta-stack{
  display:flex;
  flex-direction:column;
  gap:14px;
  max-width:440px;
  margin:auto;
}
.cta{
  display:block;
  text-align:center;
  padding:16px 18px;
  border-radius:16px;
  text-decoration:none;
  color:#180b00;
  font-weight:900;
  letter-spacing:.4px;
  background:linear-gradient(135deg,#fff7c2,#ffd166,#ff9f1c);
  box-shadow:0 0 24px ${theme.glow};
  transition:.25s ease;
}
.cta:hover{
  transform:scale(1.035);
  box-shadow:0 0 38px ${theme.glow};
}
.footer{
  text-align:center;
  padding:22px 10px 8px;
  font-size:14px;
  opacity:.95;
}
@media(max-width:760px){
  .hero{padding:20px}
  .info-grid{grid-template-columns:1fr}
  .top-logo img{max-width:180px}
}
</style>
</head>
<body>
<div class="page">
  <div class="top-logo">
    ${logoUrl ? `<img src="${esc(logoUrl)}" alt="${esc(brand)} Logo">` : `<div class="logo-fallback">${esc(brand)}</div>`}
  </div>

  <main class="hero">
    <div class="brand-title">${esc(brand)} • 🔥Xu_SEO🔥</div>

    <h1>${esc(title)}</h1>
    <p>${esc(description)}</p>

    ${imageUrl ? `<img class="hero-img" src="${esc(imageUrl)}" alt="${esc(title)}">` : ""}

    <div class="kw-wrap">
      ${kwList.map(item => `<span class="kw">${esc(item)}</span>`).join("")}
    </div>

    <section>
      <h2>Informasi Utama</h2>
      ${paragraphs(form.content)}
    </section>

    <section class="info-grid">
      <div class="box">
        <h2>FAQ</h2>
        ${faq.map(item => `
          <div class="item">
            <h3>${esc(item.q)}</h3>
            <p>${esc(item.a)}</p>
          </div>
        `).join("")}
      </div>

      <div class="box">
        <h2>Testimoni</h2>
        ${testi.map((item, i) => `
          <div class="item">
            <h3>Testimoni ${i + 1}</h3>
            <p>“${esc(item)}”</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-stack">
        <a class="cta" href="${CTA_URL}" rel="nofollow sponsored">DAFTAR SEKARANG</a>
        <a class="cta" href="${CTA_URL}" rel="nofollow sponsored">LOGIN AKUN VIP</a>
        <a class="cta" href="${CTA_URL}" rel="nofollow sponsored">CLAIM PROMO</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    © 2026 ${esc(brand)} • 🔥Xu_SEO🔥 Rights Reserved • 21+ • Situs Judi Online Resmi Terpercaya No.1 di Indonesia •
  </footer>
</div>
</body>
</html>`;
}

function readForm(root) {
  return {
    template: $("#lp-template", root)?.value || "golden",
    title: $("#lp-title", root)?.value || "",
    description: $("#lp-description", root)?.value || "",
    content: $("#lp-content", root)?.value || "",
    contentUrl: $("#lp-url", root)?.value || "",
    ampUrl: $("#lp-amp", root)?.value || "",
    imageUrl: $("#lp-image", root)?.value || "",
    keywords: $("#lp-keywords", root)?.value || "",
    iconUrl: $("#lp-icon", root)?.value || "",
    logoUrl: $("#lp-logo", root)?.value || "",
    brand: $("#lp-brand", root)?.value || "WAHANABET"
  };
}

function render(container) {
  container.innerHTML = `
    <section class="seo-tool-panel">
      <div class="tool-head">
        <h2>Landing Page Generator</h2>
        <p>Membuat landing page HTML SEO-ready dengan meta, schema, canonical, FAQ, testimoni, CTA, dan preview.</p>
      </div>

      <div class="lp-grid">
        <div class="lp-form">
          <label>Template</label>
          <select id="lp-template">
            ${Object.entries(templates).map(([key, val]) => `<option value="${key}">${val.name}</option>`).join("")}
          </select>

          <label>Judul</label>
          <input id="lp-title" placeholder="Judul landing page">

          <label>Deskripsi</label>
          <textarea id="lp-description" rows="3" placeholder="Meta description"></textarea>

          <label>Konten</label>
          <textarea id="lp-content" rows="8" placeholder="Isi konten utama"></textarea>

          <label>URL Konten</label>
          <input id="lp-url" placeholder="https://domain.com/konten/">

          <label>URL AMP</label>
          <input id="lp-amp" placeholder="https://domain.com/amp/">

          <label>URL Gambar</label>
          <input id="lp-image" placeholder="https://domain.com/image.webp">

          <label>KW</label>
          <input id="lp-keywords" placeholder="kw utama, kw turunan, brand keyword">

          <label>Icon</label>
          <input id="lp-icon" placeholder="https://domain.com/favicon.png">

          <label>Logo</label>
          <input id="lp-logo" placeholder="https://domain.com/logo.webp">

          <label>Brand</label>
          <input id="lp-brand" value="WAHANABET">

          <div class="lp-actions">
            <button id="lp-generate" type="button">Generate HTML</button>
            <button id="lp-copy" type="button">Copy HTML</button>
            <button id="lp-download" type="button">Download HTML</button>
          </div>
        </div>

        <div class="lp-output-wrap">
          <label>Output HTML</label>
          <textarea id="lp-output" rows="24" spellcheck="false"></textarea>
        </div>
      </div>

      <div class="lp-preview-wrap">
        <h3>Preview</h3>
        <iframe id="lp-preview" title="Landing Page Preview"></iframe>
      </div>
    </section>

    <style>
      .seo-tool-panel{width:100%;display:block}
      .tool-head{margin-bottom:18px}
      .tool-head h2{margin:0 0 6px;font-size:26px}
      .tool-head p{margin:0;opacity:.85}
      .lp-grid{
        display:grid;
        grid-template-columns:minmax(280px,420px) minmax(300px,1fr);
        gap:18px;
        align-items:start;
      }
      .lp-form,.lp-output-wrap,.lp-preview-wrap{
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.14);
        border-radius:18px;
        padding:16px;
        box-shadow:0 0 24px rgba(0,0,0,.18);
      }
      .lp-form label,.lp-output-wrap label{
        display:block;
        margin:10px 0 6px;
        font-weight:700;
      }
      .lp-form input,.lp-form textarea,.lp-form select,.lp-output-wrap textarea{
        width:100%;
        border:1px solid rgba(255,255,255,.18);
        border-radius:12px;
        background:rgba(0,0,0,.32);
        color:#fff;
        padding:11px 12px;
        outline:none;
      }
      .lp-actions{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
        margin-top:14px;
      }
      .lp-actions button{
        border:0;
        border-radius:12px;
        padding:12px 14px;
        font-weight:900;
        cursor:pointer;
        background:linear-gradient(135deg,#ffd166,#ff9f1c);
        color:#180900;
        box-shadow:0 0 16px rgba(255,209,102,.35);
      }
      #lp-output{
        min-height:690px;
        font-family:Consolas,Monaco,monospace;
        font-size:13px;
        resize:vertical;
      }
      .lp-preview-wrap{margin-top:18px}
      .lp-preview-wrap h3{margin:0 0 12px}
      #lp-preview{
        width:100%;
        min-height:720px;
        border:1px solid rgba(255,255,255,.16);
        border-radius:16px;
        background:#fff;
      }
      @media(max-width:900px){
        .lp-grid{grid-template-columns:1fr}
        #lp-output{min-height:420px}
        #lp-preview{min-height:620px}
      }
    </style>
  `;

  const output = $("#lp-output", container);
  const preview = $("#lp-preview", container);

  function update() {
    const html = generateHTML(readForm(container));
    output.value = html;
    preview.srcdoc = html;
  }

  $("#lp-generate", container).addEventListener("click", update);

  $("#lp-copy", container).addEventListener("click", async () => {
    const html = output.value || generateHTML(readForm(container));
    output.value = html;
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      output.select();
      document.execCommand("copy");
    }
  });

  $("#lp-download", container).addEventListener("click", () => {
    const html = output.value || generateHTML(readForm(container));
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "landing-page.html";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  });

  container.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  update();
}

window.SEOExpertLandingGenerator = { render, generateHTML };
window.renderLandingPageGenerator = render;

export { render, generateHTML };