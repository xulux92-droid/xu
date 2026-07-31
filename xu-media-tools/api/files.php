<?php
require dirname(__DIR__) . '/config.php';
require_login(true);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

if ($method === 'GET' && $action === 'serve') {
    $category = clean_category((string)($_GET['category'] ?? ''));
    $name = basename((string)($_GET['name'] ?? ''));
    if (!$category || $name === '') { http_response_code(404); exit; }
    $path = storage_dir($category) . '/' . $name;
    if (!is_file($path)) { http_response_code(404); exit; }
    $mime = mime_content_type($path) ?: 'application/octet-stream';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: private, max-age=3600');
    if (!empty($_GET['download'])) header('Content-Disposition: attachment; filename="' . rawurlencode($name) . '"');
    readfile($path); exit;
}

if ($method === 'GET' && $action === 'list') {
    $category = clean_category((string)($_GET['category'] ?? ''));
    if (!$category) json_response(['ok'=>false,'error'=>'Kategori tidak valid.'], 400);
    $items = [];
    foreach (glob(storage_dir($category).'/*') ?: [] as $path) {
        if (!is_file($path)) continue;
        $items[] = [
            'name'=>basename($path),
            'size'=>filesize($path),
            'modified'=>date(DATE_ATOM, filemtime($path)),
            'mime'=>mime_content_type($path) ?: 'application/octet-stream',
            'category'=>$category
        ];
    }
    usort($items, fn($a,$b)=>strcmp($b['modified'],$a['modified']));
    json_response(['ok'=>true,'items'=>$items]);
}

require_csrf();

if ($method === 'POST' && $action === 'upload') {
    $category = clean_category((string)($_POST['category'] ?? ''));
    if (!$category || empty($_FILES['file'])) json_response(['ok'=>false,'error'=>'Upload tidak valid.'],400);
    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) json_response(['ok'=>false,'error'=>'Upload error code '.($file['error']??'unknown')],400);
    if (($file['size'] ?? 0) > MAX_UPLOAD_BYTES) json_response(['ok'=>false,'error'=>'File terlalu besar.'],413);
    $name = date('Ymd-His').'-'.bin2hex(random_bytes(3)).'-'.safe_filename($file['name']);
    if (!move_uploaded_file($file['tmp_name'], storage_dir($category).'/'.$name)) json_response(['ok'=>false,'error'=>'Gagal menyimpan file.'],500);
    json_response(['ok'=>true,'name'=>$name]);
}

$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$category = clean_category((string)($payload['category'] ?? ''));
$name = basename((string)($payload['name'] ?? ''));
if (!$category || $name === '') json_response(['ok'=>false,'error'=>'Data file tidak valid.'],400);
$path = storage_dir($category).'/'.$name;

if ($method === 'DELETE' && $action === 'delete') {
    if (is_file($path)) unlink($path);
    json_response(['ok'=>true]);
}
if ($method === 'POST' && $action === 'rename') {
    $new = safe_filename((string)($payload['newName'] ?? ''));
    if (!is_file($path) || $new==='') json_response(['ok'=>false,'error'=>'Rename tidak valid.'],400);
    $ext = pathinfo($name, PATHINFO_EXTENSION);
    if ($ext && strtolower(pathinfo($new,PATHINFO_EXTENSION)) !== strtolower($ext)) $new .= '.'.$ext;
    $target = storage_dir($category).'/'.date('Ymd-His').'-'.$new;
    if (!rename($path,$target)) json_response(['ok'=>false,'error'=>'Gagal rename.'],500);
    json_response(['ok'=>true,'name'=>basename($target)]);
}
json_response(['ok'=>false,'error'=>'Action tidak dikenal.'],400);
