<?php
header("Content-type: text/plain;charset=UTF-8");

$arr = array();
foreach ($_POST as $param_name => $param_val) {
  $arr[$param_name] = $param_val;
}

$url ='http://itfds-prod03.uio.no/es/post.php';


echo(loadURL($url,$arr));

function loadURL($urlToFetch,$data){
   $ch = curl_init();
   curl_setopt($ch, CURLOPT_URL, $urlToFetch);
   curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
   curl_setopt($ch, CURLOPT_POSTFIELDS,$data);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $output  = curl_exec($ch);
   curl_close($ch);
   return $output;
}

?>