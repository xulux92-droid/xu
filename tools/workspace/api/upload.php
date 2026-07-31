<?php
header('Content-Type: application/json; charset=utf-8');

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
  $phpError = $_FILES['file']['error'] ?? null;
  $map = [
    UPLOAD_ERR_INI_SIZE => 'File melebihi batas upload_max_filesize server.',
    UPLOAD_ERR_FORM_SIZE => 'File melebihi batas form upload.',
    UPLOAD_ERR_PARTIAL => 'File hanya terupload sebagian.',
    UPLOAD_ERR_NO_FILE => 'File tidak ditemukan.',
    UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary server tidak tersedia.',
    UPLOAD_ERR_CANT_WRITE => 'Server gagal menulis file upload.',
    UPLOAD_ERR_EXTENSION => 'Upload dihentikan oleh extension server.'
  ];
  $msg = $map[$phpError] ?? 'File tidak ditemukan.';
  respond(400, ['ok' => false, 'error' => $msg]);
}

$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
  respond(500, ['ok' => false, 'error' => 'Folder uploads gagal dibuat.']);
}
if (!is_writable($uploadDir)) {
  respond(500, ['ok' => false, 'error' => 'Folder uploads tidak writable.']);
}

$originalName = $_FILES['file']['name'] ?? 'file.bin';
$originalName = trim(str_replace(["\0", '/', '\\'], '', $originalName));
if ($originalName === '') $originalName = 'file.bin';

$cleanName = preg_replace('/[^A-Za-z0-9._-]/', '-', $originalName);
$cleanName = preg_replace('/-+/', '-', $cleanName);
$cleanName = trim($cleanName, '-.');
if ($cleanName === '') $cleanName = 'file';

$dangerousExt = ['php','php3','php4','php5','php7','php8','phtml','phar','cgi','pl','py','sh','bash','zsh','exe','dll','bat','cmd','com','msi','asp','aspx','jsp','jspx','jar'];
$ext = strtolower(pathinfo($cleanName, PATHINFO_EXTENSION));
$base = pathinfo($cleanName, PATHINFO_FILENAME);
$base = $base !== '' ? $base : 'file';

$safeRenamed = false;
$storedExt = $ext;
if (in_array($ext, $dangerousExt, true)) {
  $safeRenamed = true;
  $base .= '--' . $ext . '-source';
  $storedExt = 'txt';
}

$finalName = $base . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . ($storedExt ? '.' . $storedExt : '');
$target = $uploadDir . '/' . $finalName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
  respond(500, ['ok' => false, 'error' => 'Gagal menyimpan file upload.']);
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$basePath = preg_replace('#/api$#', '', $basePath);
$url = $scheme . '://' . $host . $basePath . '/uploads/' . rawurlencode($finalName);

respond(200, [
  'ok' => true,
  'filename' => $finalName,
  'original_name' => $originalName,
  'size' => filesize($target),
  'url' => $url,
  'safe_renamed' => $safeRenamed,
  'note' => $safeRenamed ? 'File disimpan dalam mode aman/non-executable.' : ''
]);
