<?php
header('Content-Type: application/json; charset=utf-8');

$store = __DIR__ . '/chat-data.json';
$uploadDir = dirname(__DIR__) . '/uploads';

if (!file_exists($store)) {
  file_put_contents($store, json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}
if (!is_dir($uploadDir)) {
  @mkdir($uploadDir, 0775, true);
}

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function read_items($store) {
  $raw = @file_get_contents($store);
  $data = json_decode($raw ?: '[]', true);
  return is_array($data) ? $data : [];
}
function save_items($store, $items) {
  $json = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
  return file_put_contents($store, $json, LOCK_EX) !== false;
}
function normalize_name($name) {
  $name = preg_replace('/[^A-Za-z0-9._-]/', '-', $name);
  $name = preg_replace('/-+/', '-', $name);
  return trim($name, '-.') ?: 'file';
}
function is_dangerous_ext($ext) {
  static $danger = ['php','phtml','phar','php3','php4','php5','php7','php8','cgi','pl','py','sh','bash','zsh','fish','exe','bat','cmd','com','msi','scr','dll','so','bin','run','asp','aspx','jsp','jspx','war'];
  return in_array(strtolower($ext), $danger, true);
}
function build_public_url($filename) {
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $basePath = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/\\');
  return $scheme . '://' . $host . $basePath . '/uploads/' . rawurlencode($filename);
}
function handle_file_upload($uploadDir) {
  if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
    return null;
  }

  $error = $_FILES['file']['error'] ?? UPLOAD_ERR_OK;
  if ($error !== UPLOAD_ERR_OK) {
    $map = [
      UPLOAD_ERR_INI_SIZE => 'File melebihi limit server.',
      UPLOAD_ERR_FORM_SIZE => 'File melebihi limit form.',
      UPLOAD_ERR_PARTIAL => 'File terupload sebagian.',
      UPLOAD_ERR_NO_FILE => 'Tidak ada file.',
      UPLOAD_ERR_NO_TMP_DIR => 'Temp directory tidak ada.',
      UPLOAD_ERR_CANT_WRITE => 'Server gagal menulis file.',
      UPLOAD_ERR_EXTENSION => 'Upload dihentikan ekstensi/server.'
    ];
    respond(['ok' => false, 'error' => $map[$error] ?? 'Upload file gagal.'], 400);
  }

  $originalName = $_FILES['file']['name'] ?? 'file.bin';
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
  if (!is_writable($uploadDir)) {
    respond(['ok' => false, 'error' => 'Folder uploads tidak writable.'], 500);
  }
  if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
    respond(['ok' => false, 'error' => 'Gagal menyimpan file chat.'], 500);
  }

  $mime = @mime_content_type($target) ?: ($_FILES['file']['type'] ?? 'application/octet-stream');
  return [
    'url' => build_public_url($finalName),
    'filename' => $finalName,
    'original_name' => $originalName,
    'size' => @filesize($target) ?: 0,
    'mime' => $mime,
    'safe_mode' => $safeMode
  ];
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'list') {
  $items = read_items($store);
  if (count($items) > 150) $items = array_slice($items, -150);
  respond(['ok' => true, 'items' => array_values($items)]);
}

if ($action === 'clear') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);
  if (!save_items($store, [])) respond(['ok' => false, 'error' => 'Gagal clear chat.'], 500);
  respond(['ok' => true]);
}

if ($action === 'send') {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);

  $username = trim((string)($_POST['username'] ?? 'Guest'));
  $email = trim((string)($_POST['email'] ?? ''));
  $message = trim((string)($_POST['message'] ?? ''));
  if ($username === '') $username = 'Guest';
  if (mb_strlen($message) > 4000) respond(['ok' => false, 'error' => 'Pesan terlalu panjang.'], 400);

  $fileInfo = handle_file_upload($uploadDir);
  if ($message === '' && !$fileInfo) respond(['ok' => false, 'error' => 'Pesan kosong.'], 400);

  $items = read_items($store);
  $item = [
    'id' => bin2hex(random_bytes(8)),
    'username' => preg_replace('/\s+/', ' ', $username),
    'email' => $email,
    'message' => $message,
    'created_at' => date('c'),
    'file' => $fileInfo
  ];
  $items[] = $item;
  if (count($items) > 300) $items = array_slice($items, -300);
  if (!save_items($store, $items)) respond(['ok' => false, 'error' => 'Gagal menyimpan chat.'], 500);
  respond(['ok' => true, 'item' => $item]);
}

respond(['ok' => false, 'error' => 'Action tidak valid.'], 400);
