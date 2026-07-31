<?php
require dirname(__DIR__) . '/config.php';
require_login(true);
$type=$_GET['type']??'settings';
$file=STORAGE_PATH.'/'.($type==='jobs'?'jobs/jobs.json':'settings/app.json');
if($_SERVER['REQUEST_METHOD']==='GET'){
 $data=is_file($file)?json_decode(file_get_contents($file),true):[];
 json_response(['ok'=>true,'data'=>$data?:[]]);
}
require_csrf();
$data=json_decode(file_get_contents('php://input'),true)?:[];
file_put_contents($file,json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX);
json_response(['ok'=>true]);
