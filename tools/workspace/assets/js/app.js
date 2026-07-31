import { $, $$, storage } from './core/utils.js';
import { groups, tools, toolMap } from './core/tool-config.js';
import { applyTheme, currentTheme, themes } from './core/theme.js';
import { loadTool } from './core/router.js';

const DEFAULT_USERS = [
  { username:'owner', password:'owner123', role:'owner', email:'' },
  { username:'admin1', password:'123456', role:'admin', email:'' },
  { username:'admin2', password:'123456', role:'admin', email:'' },
];

const SESSION_IDLE_LIMIT = 30 * 60 * 1000;
const SESSION_MAX_LIMIT = 8 * 60 * 60 * 1000;

const app = {
  currentTool: storage.get('xu-last-tool', 'dashboard'),
  tools,
  groups,
  toolMap,
  getUser() { return storage.get('xu-user', { username: 'Guest', email: '', role:'guest' }); },
  getRole() { return this.getUser().role || 'guest'; },
  hasAccess(toolId) { const meta = toolMap[toolId]; const role = this.getRole(); return !meta?.roles || meta.roles.includes(role); },
  userKey(key) { const user = this.getUser().username || 'guest'; return `xu-user-${user}-${key}`; },
  setUser(user) { storage.set('xu-user', user); updateUser(); },
  setTheme: applyTheme,
  getTheme: currentTheme,
  themes,
  storage,
};

window.__XU_APP__ = app;

let workspaceStarted = false;
let sessionWatcher = null;

function showToast(message, type = 'error') {
  const stack = $('#toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 280); }, 2600);
}
window.addEventListener('xu:toast', (e)=> showToast(e.detail?.message || 'Notifikasi', 'success'));

function updateUser() {
  const user = app.getUser();
  const status = $('#userStatus');
  if (status) status.textContent = `${user.username || 'Guest'} · ${user.role || 'guest'}`;
}

function getSession() { try { return JSON.parse(localStorage.getItem('xu-auth') || 'null'); } catch { return null; } }
function setSession(user) { const now = Date.now(); localStorage.setItem('xu-auth', JSON.stringify({ username:user.username, role:user.role, email:user.email || '', loginAt: now, lastActive: now })); }
function touchSession() { const s = getSession(); if (!s) return; s.lastActive = Date.now(); localStorage.setItem('xu-auth', JSON.stringify(s)); }
function clearSession() { localStorage.removeItem('xu-auth'); localStorage.removeItem('xu-user'); }
function isSessionValid(session) { if (!session || !session.username) return false; const now=Date.now(); return (now-session.lastActive)<=SESSION_IDLE_LIMIT && (now-session.loginAt)<=SESSION_MAX_LIMIT; }
function closeMobileSidebar() { $('#sidebar')?.classList.remove('open'); }

function lockApp() {
  workspaceStarted = false;
  document.body.classList.remove('auth-ready','focus-mode','sidebar-collapsed');
  document.body.classList.add('auth-locked');
  closeMobileSidebar();
}
function unlockApp(user) {
  if (typeof user === 'string') user = findManagedUser(user) || { username:user, role:'user', email:'' };
  storage.set('xu-user', { username:user.username, role:user.role || 'user', email:user.email || '' });
  document.body.classList.remove('auth-locked');
  document.body.classList.add('auth-ready');
  $('#loginScreen') && ($('#loginScreen').style.display = 'none');
  $('#appShell') && ($('#appShell').style.display = 'grid');
  updateUser();
}
function logout(reason = '') { clearSession(); lockApp(); if (reason) showToast(reason, 'error'); }

function buildNav() {
  const q = ($('#navSearch')?.value || '').toLowerCase();
  const container = $('#navGroups');
  if (!container) return;
  container.innerHTML = groups.map(group => {
    const items = group.items.map(id => toolMap[id]).filter(Boolean).filter(t => app.hasAccess(t.id)).filter(t => (`${t.title} ${t.desc}`).toLowerCase().includes(q));
    if (!items.length) return '';
    return `
      <section>
        <div class="group-title"><span>${group.label}</span></div>
        <div class="group-list">
          ${items.map(t => `
            <button class="nav-btn ${app.currentTool === t.id ? 'active' : ''}" data-tool="${t.id}">
              <span class="nav-icon">${t.icon}</span>
              <span class="nav-copy"><strong>${t.title}</strong><small>${t.desc}</small></span>
            </button>`).join('')}
        </div>
      </section>`;
  }).join('');

  $$('.nav-btn', container).forEach(btn => btn.addEventListener('click', async () => {
    app.currentTool = btn.dataset.tool;
    storage.set('xu-last-tool', app.currentTool);
    buildNav();
    closeMobileSidebar();
    await loadTool(app.currentTool, app);
  }));
}

function bindShell() {
  $('#navSearch')?.addEventListener('input', buildNav);
  $('#sidebarToggle')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('open'));
  $('#collapseSidebarBtn')?.addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
  $('#focusToggle')?.addEventListener('click', () => document.body.classList.toggle('focus-mode'));
  $('#workspaceExpandBtn')?.addEventListener('click', () => document.body.classList.toggle('focus-mode'));
  const openSettings = async ()=>{ app.currentTool='settings'; storage.set('xu-last-tool', app.currentTool); buildNav(); await loadTool('settings', app); };
  $('#themeQuickBtn')?.addEventListener('click', openSettings);
  $('#quickThemeBtn')?.addEventListener('click', openSettings);
  $('#logoutBtn')?.addEventListener('click', () => logout('Logout berhasil.'));
  document.addEventListener('click', (e) => { if(window.innerWidth<=920 && !$('#sidebar')?.contains(e.target) && e.target.id!=='sidebarToggle'){ closeMobileSidebar(); } });
}

function getManagedUsers(){
  try {
    const rows = JSON.parse(localStorage.getItem('xu-managed-users') || 'null');
    if(Array.isArray(rows) && rows.length){
      return rows.map(u => ({ username:u.username, password:u.password, role:u.role || (u.username === 'owner' ? 'owner' : 'user'), email:u.email || '' })).filter(u=>u.username && u.password);
    }
  } catch {}
  localStorage.setItem('xu-managed-users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}
function findManagedUser(username){ return getManagedUsers().find(u => u.username.toLowerCase() === String(username||'').toLowerCase()); }

function bindLogin() {
  const form = $('#loginForm');
  const usernameEl = $('#username');
  const passwordEl = $('#password');
  const loginBtn = $('#loginBtn');
  if (!form || !usernameEl || !passwordEl) return;

  let busy = false;
  const doLogin = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    busy = true;
    try {
      const username = usernameEl.value.trim();
      const password = passwordEl.value.trim();
      if (!username || !password) { showToast('Isi username dan password dulu.', 'error'); return; }
      const user = findManagedUser(username);
      if (!user || user.password !== password) { showToast('Login gagal. Cek username atau password.', 'error'); return; }
      setSession(user);
      unlockApp(user);
      showToast('Login berhasil. Dashboard dibuka.', 'success');
      await startWorkspace(true);
    } finally {
      setTimeout(()=> busy=false, 150);
    }
  };

  form.addEventListener('submit', doLogin, { passive:false });
  loginBtn?.addEventListener('click', doLogin, { passive:false });
  loginBtn?.addEventListener('touchend', doLogin, { passive:false });
}

async function startWorkspace(force = false) {
  if (workspaceStarted && !force) return;
  workspaceStarted = true;
  applyTheme(currentTheme());
  updateUser();
  buildNav();
  try {
    if (!app.hasAccess(app.currentTool)) app.currentTool = 'dashboard';
    await loadTool(app.currentTool || 'dashboard', app);
  } catch {
    app.currentTool = 'dashboard';
    await loadTool('dashboard', app);
  }
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

function bindSessionActivity() {
  const events = ['click', 'keydown', 'touchstart'];
  events.forEach(evt => document.addEventListener(evt, () => {
    if (document.body.classList.contains('auth-ready')) touchSession();
  }, { passive:true }));
}

function watchSession() {
  if (sessionWatcher) clearInterval(sessionWatcher);
  sessionWatcher = setInterval(() => {
    if (!document.body.classList.contains('auth-ready')) return;
    const session = getSession();
    if (!isSessionValid(session)) logout('Sesi habis. Login lagi ya.');
  }, 15000);
}

async function initAuth() {
  const session = getSession();
  if (isSessionValid(session)) {
    unlockApp(session.username);
    touchSession();
    await startWorkspace(true);
  } else {
    clearSession();
    lockApp();
  }
  bindSessionActivity();
  watchSession();
}

bindShell();
bindLogin();
initAuth();
