<?php
/* Xu Manager Pro v2 - Ultra Compat Safe Edition (PHP 5.3+) */
error_reporting(E_ALL);
ini_set('display_errors','0');
ini_set('log_errors','1');

session_start();
header('Content-Type: text/html; charset=UTF-8');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');

define('APP_NAME','Xu Manager Pro v2 Ultra Compat');
define('SESSION_TIMEOUT',1800);

/* ===== CONFIG ===== */
$SAFE_ROOT = realpath(dirname(__FILE__)); // locked to this folder
$USERS = array(
  'owner' => array(
    // default password: ChangeMeNow123!
    // old-compatible sha256. Replace this value after login.
    'password_sha256' => '0c785d0f79df7e8bc6b89fa6d904681e99e284779396d44b0ee0ece918f66f6d',
    'role' => 'Owner'
  )
);
$ALLOWED_UPLOAD = array('html','css','js','png','jpg','jpeg','webp','gif','svg','ico','txt','json','xml','md','csv','pdf','zip');
$ALLOWED_EDIT = array('html','css','js','txt','json','xml','svg','md','csv','ini','conf','log');
$ALLOWED_CHMOD = array('0644','0600','0755','0700');

$msg=''; $msgType='info';

/* ===== HELPERS ===== */
function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function norm($p){ return str_replace('\\','/',(string)$p); }
function root_path(){ global $SAFE_ROOT; return norm(realpath($SAFE_ROOT) ? realpath($SAFE_ROOT) : $SAFE_ROOT); }
function timing_safe_eq($a,$b){
  $a=(string)$a; $b=(string)$b; if(strlen($a)!==strlen($b)) return false; $r=0;
  for($i=0;$i<strlen($a);$i++){ $r |= ord($a[$i]) ^ ord($b[$i]); }
  return $r===0;
}
function check_password_compat($plain,$stored){ return timing_safe_eq(hash('sha256',$plain), $stored); }
function make_token(){ return sha1(uniqid(mt_rand(), true).microtime(true)); }
function csrf_token(){ if(empty($_SESSION['csrf'])) $_SESSION['csrf']=make_token(); return $_SESSION['csrf']; }
function check_csrf(){
  if($_SERVER['REQUEST_METHOD']==='POST'){
    $tok = isset($_POST['csrf']) ? $_POST['csrf'] : '';
    if(empty($_SESSION['csrf']) || !timing_safe_eq($_SESSION['csrf'],$tok)){ http_response_code(403); die('CSRF blocked'); }
  }
}
function safe_path($path){
  $root = root_path(); $real = realpath($path);
  if(!$real) return $root;
  $real = norm($real);
  if(strpos($real,$root)!==0) return $root;
  return $real;
}
function safe_name($n){ $n = basename((string)$n); return str_replace(array("\0",'/','\\'),'',$n); }
function safe_join($base,$name){ $base=safe_path($base); return $base.'/'.safe_name($name); }
function ext_allowed($file,$allowed){
  $base = basename((string)$file);
  if($base==='.htaccess' && in_array('htaccess',$allowed,true)) return true;
  if(strlen($base)>0 && $base[0]==='.' && $base!=='.htaccess') return false;
  $ext = strtolower(pathinfo($base, PATHINFO_EXTENSION));
  return in_array($ext,$allowed,true);
}
function size_fmt($b){
  $b=(int)$b; if($b>=1073741824) return round($b/1073741824,2).' GB';
  if($b>=1048576) return round($b/1048576,2).' MB'; if($b>=1024) return round($b/1024,1).' KB'; return $b.' B';
}
function current_url_file($file){
  $doc = isset($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : '';
  $real = realpath($file); if(!$doc || !$real) return '';
  $doc=norm($doc); $real=norm($real); if(strpos($real,$doc)!==0) return '';
  $rel = substr($real, strlen($doc));
  $sch = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off') ? 'https' : 'http';
  return $sch.'://'.$_SERVER['HTTP_HOST'].$rel;
}
function delete_item_safe($target){
  $target=safe_path($target); if(!file_exists($target)) return array(false,'Target tidak ditemukan.');
  if(is_file($target)) return @unlink($target) ? array(true,'File dihapus.') : array(false,'File gagal dihapus.');
  if(is_dir($target)){
    $items=@scandir($target); if($items && count($items)<=2) return @rmdir($target) ? array(true,'Folder dihapus.') : array(false,'Folder gagal dihapus.');
    return array(false,'Folder tidak kosong. Kosongkan dulu sebelum hapus.');
  }
  return array(false,'Target tidak valid.');
}
function touch_recursive_safe($dir){
  $dir=safe_path($dir); $count=0;
  if(!is_dir($dir)) return 0;
  $items=@scandir($dir); if(!$items) return 0;
  foreach($items as $it){ if($it==='.'||$it==='..') continue; $p=$dir.'/'.$it; if(is_dir($p)) $count+=touch_recursive_safe($p); @touch($p); $count++; }
  return $count;
}

/* ===== AUTH ===== */
if(isset($_GET['logout'])){ session_destroy(); header('Location: '.$_SERVER['PHP_SELF']); exit; }
if(isset($_POST['login'])){
  $u = isset($_POST['user']) ? $_POST['user'] : ''; $p = isset($_POST['pass']) ? $_POST['pass'] : '';
  if(isset($USERS[$u]) && check_password_compat($p,$USERS[$u]['password_sha256'])){
    $_SESSION['login']=true; $_SESSION['user']=$u; $_SESSION['role']=$USERS[$u]['role']; $_SESSION['last_active']=time();
    header('Location: '.$_SERVER['PHP_SELF']); exit;
  } else { $msg='Login salah.'; $msgType='danger'; }
}
if(empty($_SESSION['login'])){
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?php echo h(APP_NAME); ?></title>
<style>body{margin:0;background:#07111f;color:#eaf6ff;font-family:Arial;display:grid;place-items:center;min-height:100vh}.card{width:380px;max-width:92vw;background:rgba(0,20,40,.9);border:1px solid #16c8ff;border-radius:22px;padding:28px;box-shadow:0 0 45px rgba(22,200,255,.3)}h1{font-size:24px;margin:0 0 18px;color:#7de7ff}input{width:100%;padding:14px;margin:8px 0;border-radius:10px;border:1px solid #245272;background:#020912;color:#fff;box-sizing:border-box}button{width:100%;padding:14px;border:0;border-radius:10px;background:linear-gradient(135deg,#7de7ff,#186bff);font-weight:900;color:#001020;cursor:pointer}.msg{padding:10px;border-radius:8px;background:#5b1111;color:#ffcaca;margin-bottom:10px}</style></head><body><form class="card" method="post"><h1>⚡ <?php echo h(APP_NAME); ?></h1><?php if($msg){ ?><div class="msg"><?php echo h($msg); ?></div><?php } ?><input name="user" placeholder="Username" required><input name="pass" type="password" placeholder="Password" required><button name="login">LOGIN</button><p style="font-size:12px;color:#9db4c9">Default: owner / ChangeMeNow123!</p></form></body></html>
<?php exit; }
if(isset($_SESSION['last_active']) && time()-$_SESSION['last_active']>SESSION_TIMEOUT){ session_destroy(); header('Location: '.$_SERVER['PHP_SELF']); exit; }
$_SESSION['last_active']=time();
check_csrf();

$path = isset($_GET['p']) ? safe_path($_GET['p']) : root_path();

/* ===== ACTIONS ===== */
if(isset($_POST['upload']) && isset($_FILES['file'])){
  $ok=0; $fail=0; $files=$_FILES['file']; $count=is_array($files['name']) ? count($files['name']) : 1;
  for($i=0;$i<$count;$i++){
    $name=is_array($files['name'])?$files['name'][$i]:$files['name']; $tmp=is_array($files['tmp_name'])?$files['tmp_name'][$i]:$files['tmp_name']; $err=is_array($files['error'])?$files['error'][$i]:$files['error'];
    $name=safe_name($name); if($err!==UPLOAD_ERR_OK || !ext_allowed($name,$GLOBALS['ALLOWED_UPLOAD'])){ $fail++; continue; }
    if(@move_uploaded_file($tmp,$path.'/'.$name)) $ok++; else $fail++;
  }
  $msg='Upload selesai. Sukses: '.$ok.', gagal: '.$fail.'.'; $msgType=$fail?'warn':'success';
}
if(isset($_POST['create_folder'])){ $n=safe_name($_POST['folder_name']); if($n && !file_exists($path.'/'.$n) && @mkdir($path.'/'.$n,0755)){$msg='Folder dibuat.';$msgType='success';}else{$msg='Gagal membuat folder / sudah ada.';$msgType='danger';} }
if(isset($_POST['create_file'])){ $n=safe_name($_POST['file_name']); if($n && ext_allowed($n,$ALLOWED_EDIT) && !file_exists($path.'/'.$n) && @file_put_contents($path.'/'.$n,'')!==false){$msg='File dibuat.';$msgType='success';}else{$msg='Gagal membuat file / ekstensi ditolak.';$msgType='danger';} }
if(isset($_POST['save_file'])){ $f=safe_path($_POST['edit_path']); if(is_file($f) && ext_allowed($f,$ALLOWED_EDIT) && @file_put_contents($f,isset($_POST['content'])?$_POST['content']:'')!==false){$msg='File disimpan.';$msgType='success';$path=safe_path(dirname($f));}else{$msg='Gagal simpan / file ditolak.';$msgType='danger';} }
if(isset($_POST['rename'])){ $old=safe_join($path,$_POST['old_name']); $new=safe_name($_POST['new_name']); if(file_exists($old) && $new && !file_exists($path.'/'.$new) && @rename($old,$path.'/'.$new)){$msg='Rename berhasil.';$msgType='success';}else{$msg='Rename gagal.';$msgType='danger';} }
if(isset($_POST['chmod'])){ $target=safe_join($path,$_POST['chmod_file']); $perm=preg_replace('/[^0-7]/','',$_POST['chmod_val']); if(strlen($perm)==3)$perm='0'.$perm; if(file_exists($target) && in_array($perm,$ALLOWED_CHMOD,true) && @chmod($target,octdec($perm))){$msg='CHMOD berhasil: '.$perm;$msgType='success';}else{$msg='CHMOD ditolak/gagal. Pakai 0644,0600,0755,0700.';$msgType='danger';} }
if(isset($_GET['del'])){ $r=delete_item_safe(safe_join($path,$_GET['del'])); $msg=$r[1]; $msgType=$r[0]?'success':'danger'; }
if(isset($_POST['touch_one'])){ $target=safe_join($path,$_POST['touch_file']); if(file_exists($target) && @touch($target)){ $msg='Timestamp diperbarui.';$msgType='success'; } else {$msg='Touch gagal.';$msgType='danger';} }
if(isset($_POST['touch_recursive'])){ $count=touch_recursive_safe($path); $msg='Timestamp recursive selesai: '.$count.' item.'; $msgType='success'; }

$editFile=''; if(isset($_GET['edit']) && $_GET['edit']!==''){ $editFile=(strpos($_GET['edit'],'/')!==false||strpos($_GET['edit'],'\\')!==false)?safe_path($_GET['edit']):safe_join($path,$_GET['edit']); }
$openFile=''; if(isset($_GET['open']) && $_GET['open']!==''){ $openFile=safe_join($path,$_GET['open']); }
$items=@scandir($path); if(!$items) $items=array(); $dirs=array(); $files=array();
foreach($items as $it){ if($it==='.'||$it==='..') continue; if(is_dir($path.'/'.$it)) $dirs[]=$it; else $files[]=$it; }
natcasesort($dirs); natcasesort($files); $ordered=array_merge($dirs,$files);
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?php echo h(APP_NAME); ?></title>
<style>body{margin:0;background:#07111f;color:#eaf6ff;font-family:Arial}.wrap{max-width:1220px;margin:auto;padding:18px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#091a2f;border:1px solid #164a73;border-radius:16px;padding:14px 18px;margin-bottom:14px}a{color:#7de7ff;text-decoration:none}.card{background:#091a2f;border:1px solid #164a73;border-radius:16px;padding:16px;margin-bottom:14px}.msg{padding:12px;border-radius:12px;margin-bottom:14px;background:#102b43;border:1px solid #286b9c}.success{color:#bfffd0}.danger{color:#ffcaca}.warn{color:#ffe49c}input,textarea,select{background:#020912;color:#fff;border:1px solid #245272;border-radius:9px;padding:9px}button,.btn{background:linear-gradient(135deg,#7de7ff,#186bff);border:0;border-radius:9px;padding:9px 12px;color:#001020;font-weight:900;cursor:pointer;display:inline-block}button.red,.btn.red{background:linear-gradient(135deg,#ff9a9a,#b70000);color:#fff}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #143c5e;padding:9px;text-align:left;vertical-align:middle}th{color:#7de7ff}.grid{display:grid;grid-template-columns:1fr 320px;gap:14px}.actions{display:flex;gap:6px;flex-wrap:wrap}.small{font-size:12px;padding:6px 8px}.path{word-break:break-all;color:#b9d8ff}.editor{width:100%;height:520px;font-family:Consolas,monospace}.preview{width:100%;height:360px;font-family:Consolas,monospace}@media(max-width:850px){.grid{grid-template-columns:1fr}.top{display:block}}</style></head><body><div class="wrap">
<div class="top"><div><b>⚡ <?php echo h(APP_NAME); ?></b><br><span class="path">Root locked: <?php echo h(root_path()); ?></span></div><div>Hi, <?php echo h($_SESSION['user']); ?> · <a href="?logout=1">Logout</a></div></div>
<?php if($msg){ ?><div class="msg <?php echo h($msgType); ?>"><?php echo h($msg); ?></div><?php } ?>
<div class="grid"><div class="card"><h3>📁 File Manager</h3><p class="path">Current: <?php echo h($path); ?></p><p><a class="btn" href="?p=<?php echo urlencode(root_path()); ?>">ROOT</a> <?php if($path!==root_path()){ ?><a class="btn" href="?p=<?php echo urlencode(dirname($path)); ?>">⬆ Parent</a><?php } ?></p>
<form method="post" enctype="multipart/form-data"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input type="file" name="file[]" multiple><button name="upload">Upload</button></form><br>
<form method="post" class="actions"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input name="file_name" placeholder="new-file.txt"><button name="create_file">New File</button><input name="folder_name" placeholder="new-folder"><button name="create_folder">New Folder</button><button name="touch_recursive" onclick="return confirm('Refresh timestamp semua item di folder ini?')">Touch Recursive</button></form><br>
<table><thead><tr><th>Name</th><th>Size</th><th>Modified</th><th>Perm</th><th>Tools</th></tr></thead><tbody>
<?php foreach($ordered as $it){ $fp=$path.'/'.$it; $isDir=is_dir($fp); $perm=substr(sprintf('%o',@fileperms($fp)),-4); ?>
<tr><td><?php echo $isDir?'📁':'📄'; ?> <?php if($isDir){ ?><a href="?p=<?php echo urlencode($fp); ?>"><?php echo h($it); ?></a><?php } else { echo h($it); } ?></td><td><?php echo $isDir?'-':h(size_fmt(@filesize($fp))); ?></td><td><?php echo h(date('Y-m-d H:i',@filemtime($fp))); ?></td><td><?php echo h($perm); ?></td><td><div class="actions">
<?php if(!$isDir){ ?><a class="btn small" href="?p=<?php echo urlencode($path); ?>&open=<?php echo urlencode($it); ?>">View</a><?php } ?>
<?php if(!$isDir && ext_allowed($fp,$ALLOWED_EDIT)){ ?><a class="btn small" href="?p=<?php echo urlencode($path); ?>&edit=<?php echo urlencode($fp); ?>">Edit</a><?php } ?>
<form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input type="hidden" name="old_name" value="<?php echo h($it); ?>"><input name="new_name" placeholder="rename" style="width:90px"><button class="small" name="rename">OK</button></form>
<form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input type="hidden" name="chmod_file" value="<?php echo h($it); ?>"><input name="chmod_val" placeholder="0644" style="width:58px"><button class="small" name="chmod">CHMOD</button></form>
<form method="post" style="display:inline"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input type="hidden" name="touch_file" value="<?php echo h($it); ?>"><button class="small" name="touch_one">Touch</button></form>
<a class="btn red small" onclick="return confirm('Hapus item ini?')" href="?p=<?php echo urlencode($path); ?>&del=<?php echo urlencode($it); ?>">Delete</a></div></td></tr>
<?php } ?></tbody></table></div><div class="card"><h3>🛡 Notes</h3><p>PHP 5.3+ compatible, locked ke folder script, tanpa shell command, tanpa remote fetch.</p><p>Edit PHP sengaja nonaktif. Upload PHP juga ditolak.</p><p>Untuk ganti password: buat sha256 baru lalu ubah config.</p><code><?php echo h("php -r \"echo hash('sha256','PASSWORD_BARU');\""); ?></code></div></div>
<?php if($openFile && is_file($openFile)){ ?><div class="card"><h3>👁 Preview: <?php echo h(basename($openFile)); ?></h3><?php $ext=strtolower(pathinfo($openFile,PATHINFO_EXTENSION)); if(in_array($ext,array('png','jpg','jpeg','gif','webp','svg','ico'),true) && current_url_file($openFile)){ ?><img style="max-width:100%;border-radius:12px" src="<?php echo h(current_url_file($openFile)); ?>"><?php } else { ?><textarea class="preview" readonly><?php echo h(@file_get_contents($openFile)); ?></textarea><?php } ?></div><?php } ?>
<?php if($editFile){ ?><div class="card"><h3>✎ Edit: <?php echo h($editFile); ?></h3><?php if(is_file($editFile) && ext_allowed($editFile,$ALLOWED_EDIT)){ ?><form method="post"><input type="hidden" name="csrf" value="<?php echo h(csrf_token()); ?>"><input type="hidden" name="edit_path" value="<?php echo h($editFile); ?>"><textarea class="editor" name="content"><?php echo h(@file_get_contents($editFile)); ?></textarea><br><button name="save_file">Save File</button></form><?php } else { ?><p class="danger">File tidak bisa diedit / ekstensi ditolak.</p><?php } ?></div><?php } ?>
</div></body></html>
