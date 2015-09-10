<?php
	$url = $_POST['link'];
$weather = file_get_contents($url);
echo $weather;
?>