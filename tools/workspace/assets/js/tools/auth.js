import { $, notify, escapeHtml } from '../core/utils.js';

const DEFAULT_USERS = [
  { username:'owner', password:'owner123', role:'owner', email:'' },
  { username:'admin1', password:'123456', role:'admin', email:'' },
  { username:'admin2', password:'123456', role:'admin', email:'' },
];

function getManagedUsers(){
  try{
    const raw = JSON.parse(localStorage.getItem('xu-managed-users') || 'null');
    if(Array.isArray(raw) && raw.length) return raw;
  }catch{}
  localStorage.setItem('xu-managed-users', JSON.stringify(DEFAULT_USERS));
  return [...DEFAULT_USERS];
}

function saveManagedUsers(users){
  localStorage.setItem('xu-managed-users', JSON.stringify(users));
}

function renderRows(users){
  return users.map((user, index) => `
    <div class="user-row">
      <div class="user-row-copy">
        <strong>${escapeHtml(user.username)}</strong>
        <small>${escapeHtml(user.role || 'user')} · ${escapeHtml(user.email || '-')}</small>
      </div>
      <div class="user-row-meta">
        <code>••••••</code>
        ${user.username === 'owner' ? '<span class="badge">locked</span>' : `<button class="btn ghost danger-soft" data-remove-user="${index}">Hapus</button>`}
      </div>
    </div>
  `).join('');
}

export function render(app){
  const current = app.getUser();
  const users = getManagedUsers();
  const isOwner = (current.role || '').toLowerCase() === 'owner';

  return `
    <div class="card-grid">
      <section class="card two-col wide-left">
        <div class="mini-card">
          <h3>Status User</h3>
          <div class="output-box" id="authStatusBox">Username: ${current.username || 'Guest'}\nEmail: ${current.email || '-'}\nMode: Local storage only\nRole: ${current.role || 'user'}</div>
          <div class="helper-text" style="margin-top:10px">Owner dapat menambah dan menghapus pengguna. Admin dan user hanya melihat status akses.</div>
        </div>

        <div class="mini-card">
          <h3>Manajemen Pengguna</h3>
          ${isOwner ? `
            <div class="stack-sm">
              <input id="newUserUsername" placeholder="Username baru" />
              <input id="newUserPassword" placeholder="Password baru" />
              <input id="newUserEmail" placeholder="Email (opsional)" />
              <select id="newUserRole">
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
              <div class="action-row">
                <button class="btn primary" id="addUserBtn">Tambah Pengguna</button>
              </div>
            </div>
          ` : `
            <div class="info-box compact-info">Akses tambah pengguna hanya tersedia untuk owner.</div>
          `}
        </div>
      </section>

      <section class="card">
        <div class="section-head">
          <div>
            <h3>Daftar Pengguna</h3>
            <p class="helper-text">Daftar pengguna lokal untuk workspace ini.</p>
          </div>
        </div>
        <div class="user-list" id="managedUsersList">${renderRows(users)}</div>
      </section>
    </div>
  `;
}

export function init(app){
  const current = app.getUser();
  const isOwner = (current.role || '').toLowerCase() === 'owner';

  function refreshList(){
    const box = $('#managedUsersList');
    if(box) box.innerHTML = renderRows(getManagedUsers());

    document.querySelectorAll('[data-remove-user]').forEach(btn => {
      btn.onclick = () => {
        if(!isOwner) return notify('Hanya owner yang bisa menghapus pengguna.');
        const users = getManagedUsers();
        const index = Number(btn.dataset.removeUser);
        const target = users[index];
        if(!target || target.username === 'owner') return;
        users.splice(index, 1);
        saveManagedUsers(users);
        refreshList();
        notify('Pengguna dihapus.');
      };
    });
  }

  if($('#addUserBtn')){
    $('#addUserBtn').onclick = () => {
      if(!isOwner) return notify('Hanya owner yang bisa menambah pengguna.');

      const username = $('#newUserUsername').value.trim();
      const password = $('#newUserPassword').value.trim();
      const email = $('#newUserEmail').value.trim();
      const role = $('#newUserRole').value;

      if(!username || !password) return notify('Username dan password wajib diisi.');

      const users = getManagedUsers();
      if(users.some(user => user.username.toLowerCase() === username.toLowerCase())){
        return notify('Username sudah ada.');
      }

      users.push({ username, password, email, role });
      saveManagedUsers(users);

      $('#newUserUsername').value = '';
      $('#newUserPassword').value = '';
      $('#newUserEmail').value = '';
      $('#newUserRole').value = 'admin';

      refreshList();
      notify('Pengguna baru ditambahkan.');
    };
  }

  refreshList();
}
