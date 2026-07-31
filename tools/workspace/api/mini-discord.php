<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__;
$dataDir = $baseDir . '/mini-discord-data';
$uploadDir = dirname(__DIR__) . '/uploads/mini-discord';
$messagesStore = $dataDir . '/messages.json';
$presenceStore = $dataDir . '/presence.json';
$callsStore = $dataDir . '/calls.json';
$signalsStore = $dataDir . '/signals.json';

@mkdir($dataDir, 0775, true);
@mkdir($uploadDir, 0775, true);
foreach ([$messagesStore, $presenceStore, $callsStore, $signalsStore] as $file) {
  if (!file_exists($file)) {
    file_put_contents($file, json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
  }
}

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function read_json($file) {
  $raw = @file_get_contents($file);
  $data = json_decode($raw ?: '[]', true);
  return is_array($data) ? $data : [];
}
function save_json($file, $data) {
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
  return file_put_contents($file, $json, LOCK_EX) !== false;
}
function now_iso() { return date('c'); }
function now_unix() { return time(); }
function req($key, $default = '') { return $_POST[$key] ?? $_GET[$key] ?? $default; }
function sanitize_user($name) {
  $name = trim((string)$name);
  $name = preg_replace('/\s+/', ' ', $name);
  return mb_substr($name !== '' ? $name : 'Guest', 0, 60);
}
function room_key($me, $other = '') {
  $me = sanitize_user($me);
  $other = sanitize_user($other);
  if ($other === '' || $other === $me) return 'group';
  $pair = [$me, $other];
  natcasesort($pair);
  return 'dm:' . implode('|', $pair);
}
function is_dangerous_ext($ext) {
  static $danger = ['php','phtml','phar','php3','php4','php5','php7','php8','cgi','pl','py','sh','bash','zsh','fish','exe','bat','cmd','com','msi','scr','dll','so','bin','run','asp','aspx','jsp','jspx','war'];
  return in_array(strtolower($ext), $danger, true);
}
function normalize_name($name) {
  $name = preg_replace('/[^A-Za-z0-9._-]/', '-', $name);
  $name = preg_replace('/-+/', '-', $name);
  return trim($name, '-.') ?: 'file';
}
function public_url($filename) {
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $basePath = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/\\');
  return $scheme . '://' . $host . $basePath . '/uploads/mini-discord/' . rawurlencode($filename);
}
function handle_upload($uploadDir, $field = 'file') {
  if (!isset($_FILES[$field]) || !is_uploaded_file($_FILES[$field]['tmp_name'])) return null;
  $error = $_FILES[$field]['error'] ?? UPLOAD_ERR_OK;
  if ($error !== UPLOAD_ERR_OK) {
    respond(['ok' => false, 'error' => 'Upload gagal.'], 400);
  }
  $originalName = $_FILES[$field]['name'] ?? 'file.bin';
  $clean = normalize_name($originalName);
  $ext = strtolower(pathinfo($clean, PATHINFO_EXTENSION));
  $base = pathinfo($clean, PATHINFO_FILENAME);
  $safeMode = false;
  if (is_dangerous_ext($ext)) {
    $safeMode = true;
    $finalName = $base . '--' . $ext . '-source-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.txt';
  } else {
    $finalName = $base . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . ($ext ? '.' . $ext : '');
  }
  $target = rtrim($uploadDir, '/\\') . '/' . $finalName;
  if (!move_uploaded_file($_FILES[$field]['tmp_name'], $target)) {
    respond(['ok' => false, 'error' => 'Gagal menyimpan file.'], 500);
  }
  $mime = @mime_content_type($target) ?: ($_FILES[$field]['type'] ?? 'application/octet-stream');
  return [
    'url' => public_url($finalName),
    'filename' => $finalName,
    'original_name' => $originalName,
    'size' => @filesize($target) ?: 0,
    'mime' => $mime,
    'safe_mode' => $safeMode,
  ];
}
function purge_presence($items) {
  $now = now_unix();
  return array_values(array_filter($items, function($row) use ($now) {
    return is_array($row) && ($row['last_seen_unix'] ?? 0) >= ($now - 45);
  }));
}
function purge_calls($calls, $signalsStore) {
  $now = now_unix();
  $activeIds = [];
  $calls = array_values(array_filter($calls, function($call) use ($now, &$activeIds) {
    if (!is_array($call)) return false;
    $status = $call['status'] ?? 'active';
    $updated = strtotime($call['updated_at'] ?? '') ?: 0;
    $keep = ($status === 'active' && $updated >= ($now - 3600)) || ($status !== 'active' && $updated >= ($now - 300));
    if ($keep) $activeIds[$call['id']] = true;
    return $keep;
  }));
  $signals = read_json($signalsStore);
  $signals = array_values(array_filter($signals, function($sig) use ($activeIds, $now) {
    return isset($activeIds[$sig['call_id'] ?? '']) && (($sig['created_unix'] ?? 0) >= ($now - 3600));
  }));
  save_json($signalsStore, $signals);
  return $calls;
}
function call_member_index(&$call, $username) {
  foreach ($call['members'] as $i => $member) {
    if (($member['username'] ?? '') === $username) return $i;
  }
  return -1;
}

$action = req('action', 'bootstrap');

if ($action === 'bootstrap') {
  $username = sanitize_user(req('username', 'Guest'));
  $presence = purge_presence(read_json($presenceStore));
  save_json($presenceStore, $presence);
  $users = array_values(array_map(function($row) use ($username) {
    return [
      'username' => $row['username'],
      'device' => $row['device'] ?? 'Desktop',
      'last_seen' => $row['last_seen'] ?? now_iso(),
      'self' => $row['username'] === $username,
    ];
  }, $presence));
  usort($users, function($a, $b) { return strcasecmp($a['username'], $b['username']); });
  respond(['ok' => true, 'users' => $users]);
}

if ($action === 'presence') {
  $username = sanitize_user(req('username', 'Guest'));
  $device = trim((string)req('device', 'Desktop')) ?: 'Desktop';
  $items = purge_presence(read_json($presenceStore));
  $found = false;
  foreach ($items as &$row) {
    if (($row['username'] ?? '') === $username) {
      $row['device'] = $device;
      $row['last_seen'] = now_iso();
      $row['last_seen_unix'] = now_unix();
      $found = true;
      break;
    }
  }
  unset($row);
  if (!$found) {
    $items[] = [
      'username' => $username,
      'device' => $device,
      'last_seen' => now_iso(),
      'last_seen_unix' => now_unix(),
    ];
  }
  save_json($presenceStore, $items);
  $users = array_values(array_map(function($row) use ($username) {
    return [
      'username' => $row['username'],
      'device' => $row['device'] ?? 'Desktop',
      'last_seen' => $row['last_seen'] ?? now_iso(),
      'self' => $row['username'] === $username,
    ];
  }, $items));
  usort($users, function($a, $b) { return strcasecmp($a['username'], $b['username']); });
  respond(['ok' => true, 'users' => $users]);
}

if ($action === 'list_messages') {
  $me = sanitize_user(req('username', 'Guest'));
  $other = sanitize_user(req('other', ''));
  $room = room_key($me, $other);
  $items = read_json($messagesStore);
  $items = array_values(array_filter($items, function($item) use ($room) {
    return ($item['room'] ?? 'group') === $room;
  }));
  if (count($items) > 200) $items = array_slice($items, -200);
  respond(['ok' => true, 'room' => $room, 'items' => array_values($items)]);
}

if ($action === 'send_message') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $username = sanitize_user(req('username', 'Guest'));
  $other = sanitize_user(req('other', ''));
  $room = room_key($username, $other);
  $message = trim((string)req('message', ''));
  $kind = trim((string)req('kind', 'text')) ?: 'text';
  if (mb_strlen($message) > 6000) respond(['ok' => false, 'error' => 'Pesan terlalu panjang.'], 400);
  $fileInfo = handle_upload($uploadDir, 'file');
  if ($message === '' && !$fileInfo) respond(['ok' => false, 'error' => 'Pesan kosong.'], 400);
  $items = read_json($messagesStore);
  $item = [
    'id' => bin2hex(random_bytes(8)),
    'room' => $room,
    'username' => $username,
    'other' => $other,
    'message' => $message,
    'kind' => $kind,
    'created_at' => now_iso(),
    'file' => $fileInfo,
  ];
  $items[] = $item;
  if (count($items) > 1500) $items = array_slice($items, -1500);
  save_json($messagesStore, $items);
  respond(['ok' => true, 'item' => $item]);
}

if ($action === 'delete_message') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $username = sanitize_user(req('username', 'Guest'));
  $id = trim((string)req('id', ''));
  $items = read_json($messagesStore);
  $before = count($items);
  $items = array_values(array_filter($items, function($item) use ($username, $id) {
    return !(($item['id'] ?? '') === $id && ($item['username'] ?? '') === $username);
  }));
  save_json($messagesStore, $items);
  respond(['ok' => true, 'deleted' => $before !== count($items)]);
}

if ($action === 'clear_room') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $username = sanitize_user(req('username', 'Guest'));
  $other = sanitize_user(req('other', ''));
  $room = room_key($username, $other);
  $items = read_json($messagesStore);
  $items = array_values(array_filter($items, function($item) use ($room) {
    return ($item['room'] ?? 'group') !== $room;
  }));
  save_json($messagesStore, $items);
  respond(['ok' => true]);
}

if ($action === 'create_call') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $host = sanitize_user(req('username', 'Guest'));
  $mode = req('mode', 'audio') === 'video' ? 'video' : 'audio';
  $isGroup = req('group', '0') === '1';
  $rawTargets = req('targets', '[]');
  $targets = json_decode($rawTargets, true);
  $targets = is_array($targets) ? $targets : [];
  $targets = array_values(array_unique(array_filter(array_map('sanitize_user', $targets), function($u) use ($host) { return $u !== '' && $u !== $host; })));
  if (!$targets) respond(['ok' => false, 'error' => 'Pilih user tujuan dulu.'], 400);
  $calls = purge_calls(read_json($callsStore), $signalsStore);
  foreach ($calls as $call) {
    if (($call['status'] ?? '') !== 'active') continue;
    foreach (($call['members'] ?? []) as $member) {
      if (($member['username'] ?? '') === $host && (($member['status'] ?? '') !== 'left')) {
        respond(['ok' => false, 'error' => 'Kamu masih ada di sesi panggilan lain.'], 400);
      }
    }
  }
  $callId = bin2hex(random_bytes(8));
  $members = [[
    'username' => $host,
    'status' => 'accepted',
    'role' => 'host',
    'joined_at' => now_iso(),
  ]];
  foreach ($targets as $user) {
    $members[] = [
      'username' => $user,
      'status' => 'invited',
      'role' => 'member',
      'joined_at' => null,
    ];
  }
  $call = [
    'id' => $callId,
    'mode' => $mode,
    'is_group' => $isGroup || count($targets) > 1,
    'status' => 'active',
    'host' => $host,
    'members' => $members,
    'created_at' => now_iso(),
    'updated_at' => now_iso(),
  ];
  $calls[] = $call;
  save_json($callsStore, $calls);
  respond(['ok' => true, 'call' => $call]);
}

if ($action === 'list_calls') {
  $username = sanitize_user(req('username', 'Guest'));
  $calls = purge_calls(read_json($callsStore), $signalsStore);
  save_json($callsStore, $calls);
  $items = array_values(array_filter($calls, function($call) use ($username) {
    if (($call['status'] ?? '') !== 'active') return false;
    foreach (($call['members'] ?? []) as $member) {
      if (($member['username'] ?? '') === $username && (($member['status'] ?? '') !== 'left')) return true;
    }
    return false;
  }));
  respond(['ok' => true, 'items' => $items]);
}

if ($action === 'respond_call') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $username = sanitize_user(req('username', 'Guest'));
  $callId = trim((string)req('call_id', ''));
  $decision = req('decision', 'reject');
  $calls = purge_calls(read_json($callsStore), $signalsStore);
  foreach ($calls as &$call) {
    if (($call['id'] ?? '') !== $callId) continue;
    $idx = call_member_index($call, $username);
    if ($idx < 0) respond(['ok' => false, 'error' => 'Kamu bukan anggota panggilan ini.'], 403);
    if ($decision === 'accept') {
      $call['members'][$idx]['status'] = 'accepted';
      $call['members'][$idx]['joined_at'] = now_iso();
    } elseif ($decision === 'leave') {
      $call['members'][$idx]['status'] = 'left';
    } else {
      $call['members'][$idx]['status'] = 'rejected';
    }
    $call['updated_at'] = now_iso();
    $accepted = 0;
    $alive = 0;
    foreach ($call['members'] as $member) {
      if (($member['status'] ?? '') === 'accepted') $accepted++;
      if (in_array($member['status'] ?? '', ['accepted', 'invited'], true)) $alive++;
    }
    if ($accepted < 1 || $alive < 2) {
      $call['status'] = 'ended';
    }
    save_json($callsStore, $calls);
    respond(['ok' => true, 'call' => $call]);
  }
  unset($call);
  respond(['ok' => false, 'error' => 'Call tidak ditemukan.'], 404);
}

if ($action === 'invite_to_call') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $username = sanitize_user(req('username', 'Guest'));
  $callId = trim((string)req('call_id', ''));
  $target = sanitize_user(req('target', ''));
  if ($target === '' || $target === $username) respond(['ok' => false, 'error' => 'Target tidak valid.'], 400);
  $calls = purge_calls(read_json($callsStore), $signalsStore);
  foreach ($calls as &$call) {
    if (($call['id'] ?? '') !== $callId) continue;
    if (($call['host'] ?? '') !== $username) respond(['ok' => false, 'error' => 'Hanya host yang bisa invite.'], 403);
    if (($call['status'] ?? '') !== 'active') respond(['ok' => false, 'error' => 'Call sudah berakhir.'], 400);
    if (!$call['is_group']) $call['is_group'] = true;
    $idx = call_member_index($call, $target);
    if ($idx >= 0 && in_array($call['members'][$idx]['status'] ?? '', ['accepted', 'invited'], true)) {
      respond(['ok' => false, 'error' => 'User itu sudah ada di sesi ini.'], 400);
    }
    if ($idx >= 0) {
      $call['members'][$idx]['status'] = 'invited';
      $call['members'][$idx]['joined_at'] = null;
    } else {
      $call['members'][] = [
        'username' => $target,
        'status' => 'invited',
        'role' => 'member',
        'joined_at' => null,
      ];
    }
    $call['updated_at'] = now_iso();
    save_json($callsStore, $calls);
    respond(['ok' => true, 'call' => $call]);
  }
  unset($call);
  respond(['ok' => false, 'error' => 'Call tidak ditemukan.'], 404);
}

if ($action === 'send_signal') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  $from = sanitize_user(req('from', 'Guest'));
  $to = sanitize_user(req('to', ''));
  $callId = trim((string)req('call_id', ''));
  $type = trim((string)req('signal_type', 'signal'));
  $payload = json_decode((string)req('payload', '{}'), true);
  if ($to === '' || $callId === '') respond(['ok' => false, 'error' => 'Signal tidak lengkap.'], 400);
  $signals = read_json($signalsStore);
  $signals[] = [
    'id' => bin2hex(random_bytes(8)),
    'call_id' => $callId,
    'from' => $from,
    'to' => $to,
    'signal_type' => $type,
    'payload' => is_array($payload) ? $payload : [],
    'created_at' => now_iso(),
    'created_unix' => now_unix(),
  ];
  if (count($signals) > 3000) $signals = array_slice($signals, -3000);
  save_json($signalsStore, $signals);
  respond(['ok' => true]);
}

if ($action === 'poll_signals') {
  $username = sanitize_user(req('username', 'Guest'));
  $callId = trim((string)req('call_id', ''));
  $signals = read_json($signalsStore);
  $out = [];
  $keep = [];
  foreach ($signals as $sig) {
    $match = ($sig['to'] ?? '') === $username && ($callId === '' || ($sig['call_id'] ?? '') === $callId);
    if ($match) {
      $out[] = $sig;
    } else {
      $keep[] = $sig;
    }
  }
  save_json($signalsStore, $keep);
  respond(['ok' => true, 'items' => $out]);
}

respond(['ok' => false, 'error' => 'Action tidak valid.'], 400);
