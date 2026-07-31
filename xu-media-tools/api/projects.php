<?php
require dirname(__DIR__) . '/config.php';
require_login(true);
$method=$_SERVER['REQUEST_METHOD'];
$action=$_GET['action']??'list';
$dir=STORAGE_PATH.'/projects';

if($method==='GET'&&$action==='list'){
 $projects=[];
 foreach(glob($dir.'/*.json')?:[] as $f){$d=json_decode(file_get_contents($f),true);if($d)$projects[]=$d;}
 usort($projects,fn($a,$b)=>strcmp($b['updatedAt']??'',$a['updatedAt']??''));
 json_response(['ok'=>true,'projects'=>$projects]);
}
if($method==='GET'&&$action==='get'){
 $id=preg_replace('/[^a-zA-Z0-9-]/','',(string)($_GET['id']??''));
 $f=$dir.'/'.$id.'.json'; if(!is_file($f))json_response(['ok'=>false,'error'=>'Project tidak ditemukan.'],404);
 json_response(['ok'=>true,'project'=>json_decode(file_get_contents($f),true)]);
}
require_csrf();
$data=json_decode(file_get_contents('php://input'),true)?:[];
if($method==='POST'&&$action==='save'){
 if(empty($data['name']))json_response(['ok'=>false,'error'=>'Nama project wajib.'],400);
 $data['id']=$data['id']??bin2hex(random_bytes(8));$data['createdAt']=$data['createdAt']??date(DATE_ATOM);$data['updatedAt']=date(DATE_ATOM);
 file_put_contents($dir.'/'.$data['id'].'.json',json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX);
 json_response(['ok'=>true,'project'=>$data]);
}
if($method==='DELETE'&&$action==='delete'){
 $id=preg_replace('/[^a-zA-Z0-9-]/','',(string)($data['id']??''));$f=$dir.'/'.$id.'.json';if(is_file($f))unlink($f);json_response(['ok'=>true]);
}
json_response(['ok'=>false,'error'=>'Action tidak dikenal.'],400);
