const toolRegistry = {
  dashboard: { title: 'SEO Expert Dashboard', desc: 'Pusat kontrol tools SEO.', module: './tools/dashboard.js', icon: '🧊', group: 'overview', groupLabel: 'Overview' },
  content: { title: 'Auto Content Generator', desc: 'Membuat draft artikel SEO dengan heading, meta, CTA, dan FAQ.', module: './tools/content.js', icon: '📝', group: 'content', groupLabel: 'Content Engine' },
  spinner: { title: 'Content Spinner', desc: 'Menulis ulang konten menjadi versi baru yang tetap natural.', module: './tools/spinner.js', icon: '🔁', group: 'content', groupLabel: 'Content Engine' },
  landing: { title: 'Landing Page Generator', desc: 'Membuat landing page HTML AMP-ready dengan meta, schema, canonical, dan preview.', module: './tools/landing.js', icon: '🧱', group: 'content', groupLabel: 'Content Engine' },
  assistant: { title: 'AI SEO Assistant', desc: 'Membantu ide judul, CTA, outline, meta, dan struktur konten.', module: './tools/assistant.js', icon: '🤖', group: 'content', groupLabel: 'Content Engine' },
  keyword: { title: 'Bulk Keyword Generator', desc: 'Membuat keyword turunan dari keyword utama.', module: './tools/keyword.js', icon: '🔑', group: 'keyword', groupLabel: 'Keyword Tools' },
  density: { title: 'Keyword Density Advanced', desc: 'Menganalisis kepadatan keyword 1 sampai 4 kata.', module: './tools/density.js', icon: '📊', group: 'keyword', groupLabel: 'Keyword Tools' },
  cluster: { title: 'Keyword Clustering', desc: 'Mengelompokkan keyword berdasarkan intent dan tema.', module: './tools/cluster.js', icon: '🧩', group: 'keyword', groupLabel: 'Keyword Tools' },
  serp: { title: 'SERP Snippet Preview', desc: 'Menampilkan preview title, URL, dan meta description di hasil pencarian.', module: './tools/serp.js', icon: '🔎', group: 'onpage', groupLabel: 'On Page SEO' },
  meta: { title: 'Meta Tag Generator', desc: 'Membuat meta title, description, Open Graph, dan Twitter Card.', module: './tools/meta.js', icon: '🏷️', group: 'onpage', groupLabel: 'On Page SEO' },
  heading: { title: 'Heading Analyzer', desc: 'Memeriksa struktur heading H1 sampai H4.', module: './tools/heading.js', icon: '🧱', group: 'onpage', groupLabel: 'On Page SEO' },
  score: { title: 'SEO Score Checker', desc: 'Menilai dasar optimasi konten berdasarkan meta, heading, dan keyword.', module: './tools/score.js', icon: '✅', group: 'onpage', groupLabel: 'On Page SEO' },
  link: { title: 'Internal Link Builder', desc: 'Membuat variasi internal link dan anchor text.', module: './tools/link.js', icon: '🔗', group: 'linking', groupLabel: 'Linking' },
  anchor: { title: 'Anchor Generator', desc: 'Membuat anchor exact, partial, branded, natural, dan naked URL.', module: './tools/anchor.js', icon: '⚓', group: 'linking', groupLabel: 'Linking' },
  sitemap: { title: 'Sitemap Generator', desc: 'Membuat file sitemap.xml dari daftar URL.', module: './tools/sitemap.js', icon: '🗺️', group: 'technical', groupLabel: 'Technical SEO' },
  robots: { title: 'Robots.txt Generator', desc: 'Membuat file robots.txt untuk crawl rule dan sitemap.', module: './tools/robots.js', icon: '🤖', group: 'technical', groupLabel: 'Technical SEO' },
  indexer: { title: 'Indexing Helper', desc: 'Membuat daftar URL untuk proses submit dan ping indexing.', module: './tools/indexer.js', icon: '📡', group: 'technical', groupLabel: 'Technical SEO' },
  image: { title: 'Image SEO Rename', desc: 'Membuat nama file, alt text, title, dan caption gambar.', module: './tools/image.js', icon: '🖼️', group: 'media', groupLabel: 'Media SEO' },
};


function getMainSession(){
  try { return JSON.parse(localStorage.getItem('xu-auth') || 'null'); } catch { return null; }
}
function isSessionValid(session){
  if(!session || !session.username) return false;
  const now = Date.now();
  const idleLimit = 30 * 60 * 1000;
  const maxLimit = 8 * 60 * 60 * 1000;
  return (now - (session.lastActive || 0)) <= idleLimit && (now - (session.loginAt || 0)) <= maxLimit;
}
function requireLogin(){
  const session = getMainSession();
  if(isSessionValid(session)){
    session.lastActive = Date.now();
    localStorage.setItem('xu-auth', JSON.stringify(session));
    return session;
  }
  window.location.replace('../?redirect=seo%2F');
  return null;
}
const activeSession = requireLogin();
if(!activeSession) throw new Error('Login required');

const state = { activeTool: 'dashboard', loadedModules: new Map() };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

function copyText(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    if (button) {
      const old = button.textContent;
      button.textContent = 'Copied';
      button.classList.add('copied');
      setTimeout(() => { button.textContent = old; button.classList.remove('copied'); }, 1200);
    }
    toast('Berhasil dicopy.', 'success');
  }).catch(() => toast('Gagal copy.', 'error'));
}

function toast(message, type = 'success') {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 260);
  }, 2600);
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function buildNav(filter = '') {
  const q = filter.toLowerCase();
  const nav = $('#sidebarNav');
  const groups = {};
  for (const [id, tool] of Object.entries(toolRegistry)) {
    const hay = `${tool.title} ${tool.desc} ${tool.groupLabel}`.toLowerCase();
    if (q && !hay.includes(q)) continue;
    if (!groups[tool.group]) groups[tool.group] = { label: tool.groupLabel, items: [] };
    groups[tool.group].items.push({ id, ...tool });
  }
  nav.innerHTML = Object.values(groups).map(group => `
    <section class="nav-group">
      <div class="nav-title">${group.label}</div>
      ${group.items.map(tool => `
        <button class="nav-btn ${state.activeTool === tool.id ? 'active' : ''}" data-tool="${tool.id}">
          <span class="nav-icon">${tool.icon}</span>
          <span class="nav-copy">
            <strong>${tool.title}</strong>
            <small>${tool.desc}</small>
          </span>
        </button>
      `).join('')}
    </section>
  `).join('');

  $$('.nav-btn', nav).forEach(btn => btn.addEventListener('click', async () => {
    await loadTool(btn.dataset.tool);
    if (window.innerWidth <= 1080) $('.sidebar')?.classList.remove('open');
  }));
}

async function loadTool(id) {
  const config = toolRegistry[id];
  if (!config) return;
  state.activeTool = id;
  buildNav($('#toolSearch')?.value || '');
  $('#toolTitle').textContent = config.title;
  $('#toolDesc').textContent = config.desc;
  const mount = $('#workspaceMount');
  mount.innerHTML = '<div class="card"><h3>Loading...</h3><p>Modul sedang dimuat.</p></div>';
  try {
    let mod = state.loadedModules.get(id);
    if (!mod) {
      mod = await import(config.module);
      state.loadedModules.set(id, mod);
    }
    mod.render(mount, { toast, copyText, escapeHtml, slugify, tokenize, toolRegistry, loadTool });
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="card"><h3>Tool error</h3><p>Modul <strong>${escapeHtml(id)}</strong> gagal dimuat. Detail: ${escapeHtml(String(err.message || err))}</p></div>`;
    toast('Modul gagal dimuat.', 'error');
  }
}

$('#toolSearch').addEventListener('input', (e) => buildNav(e.target.value));
$('#toggleSidebarBtn').addEventListener('click', () => $('.sidebar')?.classList.toggle('open'));
$('#backDashboardBtn').addEventListener('click', () => { window.location.href = '../'; });
$('#seoLogoutBtn')?.addEventListener('click', () => { localStorage.removeItem('xu-auth'); localStorage.removeItem('xu-user'); window.location.href = '../'; });

window.SEOX = { toast, copyText, escapeHtml, slugify, tokenize, loadTool, toolRegistry };

buildNav();
loadTool('dashboard');
