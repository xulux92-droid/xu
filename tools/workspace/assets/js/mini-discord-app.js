const apiUrl = 'api/mini-discord.php';
const qs = (s, c=document) => c.querySelector(s);
const qsa = (s, c=document) => Array.from(c.querySelectorAll(s));
const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtBytes = (bytes=0) => {
  if (!bytes) return '0 B';
  const units = ['B','KB','MB','GB'];
  const i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** i)).toFixed(i ? 2 : 0)} ${units[i]}`;
};
const fmtTime = (ts='') => {
  try { return new Date(ts).toLocaleString('id-ID', { hour12:false, day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return ts; }
};
const detectDevice = () => {
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'HP';
  return 'Laptop';
};
const me = (() => {
  try {
    const user = JSON.parse(localStorage.getItem('xu-user') || '{}');
    return { username: (user.username || 'Guest').trim() || 'Guest', email: user.email || '' };
  } catch {
    return { username:'Guest', email:'' };
  }
})();

const state = {
  me,
  device: detectDevice(),
  currentChat: { type:'group', other:'', label:'Group Chat', room:'group' },
  users: [],
  messages: [],
  presenceTimer: null,
  chatTimer: null,
  callTimer: null,
  signalTimer: null,
  mediaRecorder: null,
  recordChunks: [],
  inCall: null,
  peers: new Map(),
  localStream: null,
  audioUnlocked: false,
  currentCallList: [],
  lastMessageStamp: '',
};

function notify(message){
  const stack = qs('#mdToastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = 'md-toast';
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 260); }, 2200);
}

function playUiSound(type='message'){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = type === 'call' ? 620 : 880;
    g.gain.value = 0.03;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (type === 'call' ? 0.4 : 0.14));
    o.stop(ctx.currentTime + (type === 'call' ? 0.42 : 0.16));
  } catch {}
}

function unlockAudio(){
  state.audioUnlocked = true;
  playUiSound('message');
}
window.addEventListener('click', unlockAudio, { once:true });
window.addEventListener('touchstart', unlockAudio, { once:true });

function renderShell(){
  qs('#miniDiscordApp').innerHTML = `
    <div class="md-app">
      <aside class="md-sidebar">
        <div class="md-profile">
          <div class="md-avatar">${esc(state.me.username.slice(0,1).toUpperCase())}</div>
          <div class="md-profile-copy">
            <strong>${esc(state.me.username)}</strong>
            <span>${esc(state.device)} • online</span>
          </div>
        </div>
        <button class="md-room active" data-chat="group">
          <div class="md-room-avatar">#</div>
          <div class="md-room-copy"><strong>Group Chat</strong><span>Obrolan umum semua user</span></div>
        </button>
        <div class="md-sidebar-title">User Online</div>
        <div id="mdUserList" class="md-user-list"></div>
      </aside>

      <section class="md-main">
        <header class="md-header">
          <div>
            <h2 id="mdChatTitle">Group Chat</h2>
            <div id="mdChatSub" class="md-sub">Semua user online bisa ngobrol di sini.</div>
          </div>
          <div class="md-head-actions">
            <button class="md-icon-btn" id="mdVoiceCallBtn" title="Voice Call">📞</button>
            <button class="md-icon-btn" id="mdVideoCallBtn" title="Video Call">🎥</button>
            <button class="md-icon-btn" id="mdClearRoomBtn" title="Hapus room ini">🧹</button>
          </div>
        </header>

        <main id="mdMessages" class="md-messages"></main>

        <footer class="md-composer">
          <div class="md-upload-row">
            <label class="md-chip md-file-chip">📎 <input id="mdFileInput" type="file" hidden />Kirim File</label>
            <button class="md-chip" id="mdRecordBtn">🎙️ Rekam Suara</button>
            <span id="mdRecordStatus" class="md-mini-status">Siap</span>
          </div>
          <div class="md-compose-row">
            <textarea id="mdTextInput" rows="1" placeholder="Ketik pesan..."></textarea>
            <button class="md-send-btn" id="mdSendBtn">Kirim</button>
          </div>
        </footer>
      </section>
    </div>

    <div id="mdCallOverlay" class="md-call-overlay hidden">
      <div class="md-call-shell">
        <div class="md-call-top">
          <div>
            <strong id="mdCallTitle">Call</strong>
            <span id="mdCallStatus">Menyambungkan...</span>
          </div>
          <div class="md-call-top-actions">
            <button class="md-icon-btn" id="mdMuteBtn" title="Mute">🎤</button>
            <button class="md-icon-btn" id="mdCamBtn" title="Camera">📷</button>
            <button class="md-end-btn" id="mdEndCallBtn">End</button>
          </div>
        </div>
        <div id="mdCallGrid" class="md-call-grid"></div>
        <div class="md-call-bottom">
          <div id="mdInviteWrap" class="md-invite-wrap hidden">
            <select id="mdInviteSelect"></select>
            <button class="md-chip" id="mdInviteBtn">Invite ke Group Call</button>
          </div>
        </div>
      </div>
    </div>

    <div id="mdIncomingOverlay" class="md-incoming-overlay hidden"></div>
    <div id="mdToastStack" class="md-toast-stack"></div>
  `;

  qs('[data-chat="group"]').addEventListener('click', () => openChat({ type:'group', other:'', label:'Group Chat', room:'group' }));
  qs('#mdSendBtn').addEventListener('click', sendMessage);
  qs('#mdTextInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  qs('#mdFileInput').addEventListener('change', sendMessageWithSelectedFile);
  qs('#mdRecordBtn').addEventListener('click', toggleRecorder);
  qs('#mdVoiceCallBtn').addEventListener('click', () => startCall('audio'));
  qs('#mdVideoCallBtn').addEventListener('click', () => startCall('video'));
  qs('#mdClearRoomBtn').addEventListener('click', clearCurrentRoom);
  qs('#mdEndCallBtn').addEventListener('click', endCurrentCall);
  qs('#mdMuteBtn').addEventListener('click', toggleMute);
  qs('#mdCamBtn').addEventListener('click', toggleCamera);
  qs('#mdInviteBtn').addEventListener('click', inviteIntoCall);
}

async function api(params, method='GET', formData=null){
  if (method === 'POST') {
    const body = formData || new URLSearchParams(params);
    const res = await fetch(apiUrl, { method:'POST', body, cache:'no-store' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Request gagal');
    return data;
  }
  const url = `${apiUrl}?${new URLSearchParams(params).toString()}&_=${Date.now()}`;
  const res = await fetch(url, { cache:'no-store' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Request gagal');
  return data;
}

function openChat(chat){
  state.currentChat = { ...chat };
  qsa('.md-room').forEach(el => el.classList.remove('active'));
  if (chat.type === 'group') {
    qs('[data-chat="group"]').classList.add('active');
    qs('#mdChatSub').textContent = 'Semua user online bisa ngobrol di sini.';
  } else {
    const btn = qs(`.md-user-btn[data-user="${CSS.escape(chat.other)}"]`);
    btn?.classList.add('active');
    const user = state.users.find(u => u.username === chat.other);
    qs('#mdChatSub').textContent = `${chat.other} • ${user?.device || 'User'} • DM pribadi`;
  }
  qs('#mdChatTitle').textContent = chat.label;
  loadMessages(true);
}

function renderUsers(){
  const list = qs('#mdUserList');
  const users = state.users.filter(u => !u.self);
  list.innerHTML = users.length ? users.map(user => `
    <button class="md-user-btn ${state.currentChat.type === 'dm' && state.currentChat.other === user.username ? 'active' : ''}" data-user="${esc(user.username)}">
      <div class="md-room-avatar">${esc(user.username.slice(0,1).toUpperCase())}</div>
      <div class="md-room-copy"><strong>${esc(user.username)}</strong><span>${esc(user.device)} • online</span></div>
    </button>
  `).join('') : '<div class="md-empty-side">Belum ada user online lain.</div>';
  qsa('.md-user-btn', list).forEach(btn => btn.addEventListener('click', () => {
    openChat({ type:'dm', other:btn.dataset.user, label:btn.dataset.user, room:'' });
  }));
  const select = qs('#mdInviteSelect');
  if (select) {
    select.innerHTML = users.map(user => `<option value="${esc(user.username)}">${esc(user.username)} (${esc(user.device)})</option>`).join('');
  }
}

function attachmentHtml(file){
  if (!file?.url) return '';
  const mime = String(file.mime || '').toLowerCase();
  const safe = file.safe_mode ? '<div class="md-attach-meta">safe mode aktif</div>' : '';
  const meta = `<div class="md-attach-meta">${esc(file.original_name || file.filename || 'file')} • ${esc(fmtBytes(Number(file.size || 0)))}</div>${safe}`;
  if (mime.startsWith('image/')) return `<div class="md-attach"><img src="${esc(file.url)}" alt="file" />${meta}</div>`;
  if (mime.startsWith('video/')) return `<div class="md-attach"><video controls playsinline src="${esc(file.url)}"></video>${meta}</div>`;
  if (mime.startsWith('audio/')) return `<div class="md-attach"><audio controls preload="metadata" src="${esc(file.url)}"></audio>${meta}</div>`;
  return `<div class="md-attach"><a href="${esc(file.url)}" target="_blank" rel="noopener">📎 Download file</a>${meta}</div>`;
}

function messageHtml(item){
  const mine = item.username === state.me.username;
  return `
    <article class="md-msg ${mine ? 'mine' : ''}">
      <div class="md-msg-meta">
        <strong>${esc(item.username || 'Guest')}</strong>
        <span>${esc(fmtTime(item.created_at || ''))}</span>
      </div>
      ${item.message ? `<div class="md-msg-body">${esc(item.message)}</div>` : ''}
      ${attachmentHtml(item.file)}
      <div class="md-msg-actions">
        ${mine ? `<button class="md-tiny-btn" data-del="${esc(item.id)}">Hapus</button>` : ''}
      </div>
    </article>
  `;
}

function renderMessages(){
  const box = qs('#mdMessages');
  if (!state.messages.length) {
    box.innerHTML = '<div class="md-empty-chat">Belum ada pesan di room ini.</div>';
    return;
  }
  box.innerHTML = state.messages.map(messageHtml).join('');
  qsa('[data-del]', box).forEach(btn => btn.addEventListener('click', () => deleteMessage(btn.dataset.del)));
  box.scrollTop = box.scrollHeight;
}

async function loadMessages(forceSound=false){
  const params = { action:'list_messages', username:state.me.username, other:state.currentChat.other || '' };
  const data = await api(params);
  state.messages = data.items || [];
  const latest = state.messages.length ? `${state.messages[state.messages.length - 1].id}:${state.messages.length}` : '';
  if (latest && latest !== state.lastMessageStamp && state.lastMessageStamp && forceSound === false) {
    playUiSound('message');
  }
  state.lastMessageStamp = latest;
  renderMessages();
}

async function sendMessage(){
  const text = qs('#mdTextInput').value.trim();
  if (!text) return notify('Tulis pesan dulu.');
  const body = new URLSearchParams({ action:'send_message', username:state.me.username, other:state.currentChat.other || '', message:text, kind:'text' });
  await api({}, 'POST', body);
  qs('#mdTextInput').value = '';
  await loadMessages(true);
}

async function sendMessageWithSelectedFile(){
  const input = qs('#mdFileInput');
  const file = input.files?.[0];
  if (!file) return;
  const form = new FormData();
  form.append('action', 'send_message');
  form.append('username', state.me.username);
  form.append('other', state.currentChat.other || '');
  form.append('message', '');
  form.append('kind', file.type.startsWith('audio/') ? 'voice' : 'file');
  form.append('file', file);
  await api({}, 'POST', form);
  input.value = '';
  notify('File terkirim');
  await loadMessages(true);
}

async function deleteMessage(id){
  const body = new URLSearchParams({ action:'delete_message', username:state.me.username, id });
  await api({}, 'POST', body);
  await loadMessages(true);
}

async function clearCurrentRoom(){
  if (!confirm('Hapus semua isi room ini?')) return;
  const body = new URLSearchParams({ action:'clear_room', username:state.me.username, other:state.currentChat.other || '' });
  await api({}, 'POST', body);
  await loadMessages(true);
}

async function toggleRecorder(){
  if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
    state.mediaRecorder.stop();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    notify('Recorder belum didukung browser ini.');
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
  state.recordChunks = [];
  state.mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined });
  state.mediaRecorder.ondataavailable = e => { if (e.data?.size) state.recordChunks.push(e.data); };
  state.mediaRecorder.onstop = async () => {
    qs('#mdRecordStatus').textContent = 'Mengirim voice note...';
    const blob = new Blob(state.recordChunks, { type: state.mediaRecorder.mimeType || 'audio/webm' });
    const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: blob.type });
    const form = new FormData();
    form.append('action', 'send_message');
    form.append('username', state.me.username);
    form.append('other', state.currentChat.other || '');
    form.append('message', 'Voice note');
    form.append('kind', 'voice');
    form.append('file', file);
    await api({}, 'POST', form);
    stream.getTracks().forEach(t => t.stop());
    qs('#mdRecordStatus').textContent = 'Siap';
    qs('#mdRecordBtn').textContent = '🎙️ Rekam Suara';
    await loadMessages(true);
  };
  state.mediaRecorder.start();
  qs('#mdRecordStatus').textContent = 'Merekam...';
  qs('#mdRecordBtn').textContent = '⏹️ Stop Rekam';
}

async function updatePresence(){
  const data = await api({ action:'presence', username:state.me.username, device:state.device });
  state.users = data.users || [];
  renderUsers();
}

async function pollChats(){
  try { await loadMessages(); } catch {}
}

function createTile(id, label, local=false, voice=false){
  const tile = document.createElement('div');
  tile.className = `md-call-tile ${voice ? 'voice' : ''}`;
  tile.dataset.peer = id;
  tile.innerHTML = `
    <div class="md-call-label">${esc(label)}${local ? ' (You)' : ''}</div>
    ${voice ? `<div class="md-voice-avatar">${esc(label.slice(0,1).toUpperCase())}</div><audio ${local ? 'muted' : ''} autoplay playsinline></audio>` : `<video ${local ? 'muted' : ''} autoplay playsinline></video>`}
  `;
  qs('#mdCallGrid').appendChild(tile);
  return tile;
}

function renderCallShell(call){
  state.inCall = { ...(state.inCall || {}), call };
  qs('#mdCallOverlay').classList.remove('hidden');
  qs('#mdCallTitle').textContent = `${call.mode === 'video' ? 'Video Call' : 'Voice Call'} • ${call.is_group ? 'Group' : 'Private'}`;
  const accepted = (call.members || []).filter(m => m.status === 'accepted').map(m => m.username);
  qs('#mdCallStatus').textContent = accepted.length > 1 ? `Peserta aktif: ${accepted.join(', ')}` : 'Menunggu peserta lain...';
  qs('#mdCallGrid').innerHTML = '';
  const voice = call.mode !== 'video';
  createTile(state.me.username, state.me.username, true, voice);
  accepted.filter(name => name !== state.me.username).forEach(name => createTile(name, name, false, voice));
  const inviteWrap = qs('#mdInviteWrap');
  inviteWrap.classList.toggle('hidden', !(call.host === state.me.username && call.is_group));
}

async function ensureLocalStream(mode='audio'){
  if (state.localStream) {
    const hasVideo = state.localStream.getVideoTracks().length > 0;
    if ((mode === 'video' && hasVideo) || (mode === 'audio' && !hasVideo)) return state.localStream;
    state.localStream.getTracks().forEach(t => t.stop());
    state.localStream = null;
  }
  const constraints = mode === 'video'
    ? { video: { facingMode:'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true } }
    : { video: false, audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true } };
  state.localStream = await navigator.mediaDevices.getUserMedia(constraints);
  const localTile = qs('.md-call-tile[data-peer="' + CSS.escape(state.me.username) + '"]');
  if (localTile) {
    const media = qs('video,audio', localTile);
    if (media) media.srcObject = state.localStream;
  }
  return state.localStream;
}

function peerConfig(){
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
}

async function ensurePeer(peerName, initiator=false){
  if (state.peers.has(peerName)) return state.peers.get(peerName);
  const call = state.inCall?.call;
  if (!call) return null;
  const pc = new RTCPeerConnection(peerConfig());
  const entry = { pc, peerName };
  state.peers.set(peerName, entry);
  const stream = await ensureLocalStream(call.mode);
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pc.ontrack = (event) => {
    let tile = qs(`.md-call-tile[data-peer="${CSS.escape(peerName)}"]`);
    if (!tile) tile = createTile(peerName, peerName, false, call.mode !== 'video');
    const media = qs('video,audio', tile);
    if (media) {
      media.srcObject = event.streams[0];
      media.autoplay = true;
      media.playsInline = true;
      media.muted = false;
      media.play?.().catch(() => {});
    }
  };

  pc.onicecandidate = async (event) => {
    if (!event.candidate) return;
    await api({}, 'POST', new URLSearchParams({
      action:'send_signal',
      from: state.me.username,
      to: peerName,
      call_id: call.id,
      signal_type: 'candidate',
      payload: JSON.stringify(event.candidate),
    }));
  };

  if (initiator) {
    const offer = await pc.createOffer({ offerToReceiveAudio:true, offerToReceiveVideo:call.mode === 'video' });
    await pc.setLocalDescription(offer);
    await api({}, 'POST', new URLSearchParams({
      action:'send_signal',
      from: state.me.username,
      to: peerName,
      call_id: call.id,
      signal_type: 'offer',
      payload: JSON.stringify(offer),
    }));
  }
  return entry;
}

async function syncPeersWithCall(call){
  renderCallShell(call);
  await ensureLocalStream(call.mode);
  const accepted = (call.members || []).filter(m => m.status === 'accepted').map(m => m.username).filter(name => name !== state.me.username);
  for (const peerName of accepted) {
    const initiator = state.me.username.localeCompare(peerName) < 0;
    await ensurePeer(peerName, initiator);
  }
}

async function startCall(mode='audio'){
  const current = state.currentChat;
  let targets = [];
  let isGroup = false;
  if (current.type === 'dm') {
    targets = [current.other];
  } else {
    const online = state.users.filter(u => !u.self).map(u => u.username);
    if (!online.length) return notify('Belum ada user online lain.');
    const pick = prompt('Masukkan username yang diundang. Pisahkan dengan koma untuk group call.', online.join(', '));
    if (!pick) return;
    targets = pick.split(',').map(s => s.trim()).filter(Boolean).filter(name => online.includes(name));
    if (!targets.length) return notify('Target tidak valid.');
    isGroup = targets.length > 1;
  }
  const body = new URLSearchParams({ action:'create_call', username:state.me.username, mode, group:isGroup ? '1' : '0', targets: JSON.stringify(targets) });
  const data = await api({}, 'POST', body);
  state.inCall = { call:data.call, muted:false, camOff:false };
  renderCallShell(data.call);
  await ensureLocalStream(mode);
  notify(`${mode === 'video' ? 'Video' : 'Voice'} call dibuat.`);
  playUiSound('call');
}

function incomingOverlay(call, member){
  const wrap = qs('#mdIncomingOverlay');
  wrap.classList.remove('hidden');
  wrap.innerHTML = `
    <div class="md-incoming-card">
      <h3>${esc(call.mode === 'video' ? 'Incoming Video Call' : 'Incoming Voice Call')}</h3>
      <p>${esc(call.host)} mengundang kamu ke ${call.is_group ? 'group call' : 'private call'}.</p>
      <div class="md-incoming-actions">
        <button class="md-chip accept" id="mdAcceptCall">Accept</button>
        <button class="md-chip reject" id="mdRejectCall">Reject</button>
      </div>
    </div>
  `;
  qs('#mdAcceptCall').addEventListener('click', async () => {
    wrap.classList.add('hidden');
    await api({}, 'POST', new URLSearchParams({ action:'respond_call', username:state.me.username, call_id:call.id, decision:'accept' }));
    state.inCall = { call, muted:false, camOff:false };
    renderCallShell(call);
    await ensureLocalStream(call.mode);
  });
  qs('#mdRejectCall').addEventListener('click', async () => {
    wrap.classList.add('hidden');
    await api({}, 'POST', new URLSearchParams({ action:'respond_call', username:state.me.username, call_id:call.id, decision:'reject' }));
  });
}

async function pollCalls(){
  const data = await api({ action:'list_calls', username:state.me.username });
  state.currentCallList = data.items || [];
  const incoming = state.currentCallList.find(call => (call.members || []).some(m => m.username === state.me.username && m.status === 'invited'));
  if (incoming && (!state.inCall || state.inCall.call.id !== incoming.id)) {
    playUiSound('call');
    if (document.visibilityState !== 'visible' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Incoming call', { body: `${incoming.host} mengundang kamu.` });
    }
    incomingOverlay(incoming);
  }
  if (state.inCall) {
    const active = state.currentCallList.find(call => call.id === state.inCall.call.id);
    if (!active || active.status !== 'active') {
      endCurrentCall(false);
      return;
    }
    state.inCall.call = active;
    await syncPeersWithCall(active);
  }
}

async function handleSignals(){
  if (!state.inCall?.call) return;
  const call = state.inCall.call;
  const data = await api({ action:'poll_signals', username:state.me.username, call_id:call.id });
  for (const signal of (data.items || [])) {
    const peerName = signal.from;
    const entry = await ensurePeer(peerName, false);
    const pc = entry.pc;
    if (signal.signal_type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await api({}, 'POST', new URLSearchParams({
        action:'send_signal', from:state.me.username, to:peerName, call_id:call.id, signal_type:'answer', payload: JSON.stringify(answer)
      }));
    } else if (signal.signal_type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
    } else if (signal.signal_type === 'candidate') {
      try { await pc.addIceCandidate(new RTCIceCandidate(signal.payload)); } catch {}
    }
  }
}

async function endCurrentCall(sendLeave=true){
  if (sendLeave && state.inCall?.call?.id) {
    try {
      await api({}, 'POST', new URLSearchParams({ action:'respond_call', username:state.me.username, call_id:state.inCall.call.id, decision:'leave' }));
    } catch {}
  }
  state.peers.forEach(entry => entry.pc.close());
  state.peers.clear();
  if (state.localStream) {
    state.localStream.getTracks().forEach(t => t.stop());
    state.localStream = null;
  }
  state.inCall = null;
  qs('#mdCallOverlay').classList.add('hidden');
  qs('#mdIncomingOverlay').classList.add('hidden');
  qs('#mdCallGrid').innerHTML = '';
}

function toggleMute(){
  if (!state.localStream) return;
  const track = state.localStream.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  qs('#mdMuteBtn').classList.toggle('off', !track.enabled);
}

function toggleCamera(){
  if (!state.localStream) return;
  const track = state.localStream.getVideoTracks()[0];
  if (!track) return notify('Mode ini tanpa kamera.');
  track.enabled = !track.enabled;
  qs('#mdCamBtn').classList.toggle('off', !track.enabled);
}

async function inviteIntoCall(){
  if (!state.inCall?.call) return;
  const target = qs('#mdInviteSelect').value;
  if (!target) return;
  await api({}, 'POST', new URLSearchParams({ action:'invite_to_call', username:state.me.username, call_id:state.inCall.call.id, target }));
  notify(`Invite dikirim ke ${target}`);
}

async function setupNotifications(){
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch {}
  }
}

async function boot(){
  renderShell();
  await setupNotifications();
  await updatePresence();
  await loadMessages(true);
  state.presenceTimer = setInterval(() => updatePresence().catch(() => {}), 10000);
  state.chatTimer = setInterval(() => pollChats().catch(() => {}), 2500);
  state.callTimer = setInterval(() => pollCalls().catch(() => {}), 2200);
  state.signalTimer = setInterval(() => handleSignals().catch(() => {}), 900);
}

window.addEventListener('beforeunload', () => {
  clearInterval(state.presenceTimer);
  clearInterval(state.chatTimer);
  clearInterval(state.callTimer);
  clearInterval(state.signalTimer);
  endCurrentCall(false);
});

boot().catch(err => {
  console.error(err);
  qs('#miniDiscordApp').innerHTML = `<div style="padding:24px;color:white">Mini Discord gagal dimuat: ${esc(err.message)}</div>`;
});
