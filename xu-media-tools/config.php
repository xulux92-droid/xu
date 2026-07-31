<?php
declare(strict_types=1);

const APP_NAME = 'XU Media Factory';
const APP_USER = 'kopihitam12';

/*
 * Password default sesuai permintaan.
 * Setelah berhasil login pertama kali, sebaiknya ganti nilai ini.
 */
const APP_PASSWORD = 'kopihitam12';

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const STORAGE_PATH = __DIR__ . '/storage';

const CATEGORIES = [
    'models', 'templates', 'backgrounds', 'backsounds',
    'logos', 'overlays', 'voices', 'fonts', 'outputs'
];

session_name('XMFSESSID');
session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true,
]);

function is_logged_in(): bool {
    return !empty($_SESSION['xmf_logged_in']);
}

function require_login(bool $json = false): void {
    if (is_logged_in()) return;
    if ($json) {
        json_response(['ok' => false, 'error' => 'Unauthorized'], 401);
    }
    header('Location: login.php');
    exit;
}

function json_response(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function require_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf'] ?? '');
    if (!hash_equals(csrf_token(), (string)$token)) {
        json_response(['ok' => false, 'error' => 'CSRF token tidak valid.'], 419);
    }
}

function clean_category(string $category): ?string {
    return in_array($category, CATEGORIES, true) ? $category : null;
}

function safe_filename(string $name): string {
    $name = preg_replace('/[^\pL\pN._-]+/u', '-', $name) ?? 'file';
    $name = trim($name, '.-_');
    return mb_substr($name !== '' ? $name : 'file', 0, 180);
}

function storage_dir(string $category): string {
    return STORAGE_PATH . '/' . $category;
}

function ensure_storage(): void {
    foreach (array_merge(CATEGORIES, ['projects','settings','jobs']) as $dir) {
        $path = STORAGE_PATH . '/' . $dir;
        if (!is_dir($path)) @mkdir($path, 0755, true);
    }
}
ensure_storage();
