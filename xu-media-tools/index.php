<?php
require __DIR__ . '/config.php';
require_login();
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="csrf-token" content="<?= htmlspecialchars(csrf_token()) ?>">
<title><?= htmlspecialchars(APP_NAME) ?></title>
<link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="brand"><div class="brand-logo">XU</div><div><b>XU Media Factory</b><span>PHP Complete</span></div></div>
  <nav id="nav">
    <button class="active" data-view="dashboard">🏠 Dashboard</button>
    <button data-view="storage">📁 Media Storage</button>
    <button data-view="projects">🧩 Projects</button>
    <button data-view="composer">🎨 Composer</button>
    <button data-view="voice">🎙️ Voice Studio</button>
    <button data-view="batch">📊 Batch CSV</button>
    <button data-view="jobs">⚙️ Jobs</button>
    <button data-view="output">📦 Output</button>
    <button data-view="settings">🔧 Settings</button>
  </nav>
  <a class="logout" href="logout.php">Keluar</a>
</aside>
<main>
<header><div><small>XU MEDIA FACTORY</small><h1 id="pageTitle">Dashboard</h1></div><button id="refresh" class="btn secondary">Refresh</button></header>
<div id="status" hidden></div>
<section id="content"></section>
</main>
</div>
<input id="fileInput" type="file" multiple hidden>
<script>window.XMF={csrf:"<?= htmlspecialchars(csrf_token()) ?>"};</script>
<script src="assets/js/app.js"></script>
</body>
</html>
