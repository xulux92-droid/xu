<?php
require __DIR__ . '/config.php';
if (is_logged_in()) {
    header('Location: index.php');
    exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim((string)($_POST['user_id'] ?? ''));
    $pass = (string)($_POST['password'] ?? '');
    if (hash_equals(APP_USER, $user) && hash_equals(APP_PASSWORD, $pass)) {
        session_regenerate_id(true);
        $_SESSION['xmf_logged_in'] = true;
        $_SESSION['xmf_user'] = APP_USER;
        csrf_token();
        header('Location: index.php');
        exit;
    }
    usleep(500000);
    $error = 'User ID atau password salah.';
}
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login — <?= htmlspecialchars(APP_NAME) ?></title>
<link rel="stylesheet" href="assets/css/login.css">
</head>
<body>
<canvas id="rainCanvas"></canvas>
<div class="storm-flash"></div>
<div class="electric-orb orb-a"></div>
<div class="electric-orb orb-b"></div>

<main class="login-stage">
  <section class="hero-copy">
    <div class="mini-label">CLOUD MEDIA AUTOMATION</div>
    <h1>XU <span>MEDIA</span><br>FACTORY</h1>
    <p>Storage, project builder, composer, voice, batch dan output dalam satu dashboard.</p>
    <div class="feature-row">
      <span>⚡ Fast Workflow</span>
      <span>☁ Media Storage</span>
      <span>🎬 Project Composer</span>
    </div>
  </section>

  <form method="post" class="login-card" autocomplete="off">
    <div class="card-glow"></div>
    <div class="logo-bolt">XU</div>
    <div class="card-title">
      <h2>Welcome Back</h2>
      <p>Masuk ke control center.</p>
    </div>

    <?php if ($error): ?>
      <div class="login-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <label>
      <span>User ID</span>
      <div class="input-wrap"><i>👤</i><input name="user_id" required autofocus placeholder="Masukkan User ID"></div>
    </label>
    <label>
      <span>Password</span>
      <div class="input-wrap"><i>🔒</i><input id="password" name="password" type="password" required placeholder="Masukkan Password"><button type="button" id="togglePass">👁</button></div>
    </label>

    <button class="login-button" type="submit">
      <span>MASUK DASHBOARD</span>
      <b>⚡</b>
    </button>
    <div class="secure-note">Protected private workspace</div>
  </form>
</main>
<script src="assets/js/login.js"></script>
</body>
</html>
