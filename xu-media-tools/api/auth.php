<?php
require dirname(__DIR__) . '/config.php';
require_login(true);
json_response(['ok'=>true,'user'=>$_SESSION['xmf_user'],'csrf'=>csrf_token()]);
