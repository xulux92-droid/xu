
import { $, notify } from './utils.js';
import { toolMap } from './tool-config.js';
const moduleCache = new Map();
export async function loadTool(id, app){
  const mount = $('#viewMount');
  if(!mount) return;
  const meta = toolMap[id] || toolMap.dashboard;
  if (app?.hasAccess && !app.hasAccess(id)) {
    $('#viewTitle').textContent = 'Akses dibatasi';
    $('#viewDescription').textContent = 'Tool ini tidak tersedia untuk role akun saat ini.';
    mount.innerHTML = `<div class="card"><h3>Akses dibatasi</h3><div class="info-box compact-info">Role akun saat ini tidak memiliki akses ke tool ini.</div></div>`;
    return;
  }
  $('#viewTitle').textContent = meta.title;
  $('#viewDescription').textContent = meta.desc;
  mount.innerHTML = `<div class="card"><div class="loader">Memuat ${meta.title}...</div></div>`;
  let mod = moduleCache.get(id);
  if(!mod){
    try{ mod = await import(`../tools/${id}.js`); moduleCache.set(id, mod); }
    catch(err){
      mount.innerHTML = `<div class="card"><h3>Gagal memuat tool</h3><div class="output-box">${err.message}</div></div>`;
      console.error(err); return;
    }
  }
  try {
    mount.innerHTML = mod.render(app);
  } catch(err) {
    console.error(err);
    mount.innerHTML = `<div class="card"><h3>Tool tidak bisa dirender</h3><div class="output-box">${err.message}</div></div>`;
    return;
  }
  try{ mod.init?.(app); }
  catch(err){ console.error(err); notify(`Init tool gagal: ${meta.title}`); }
}
