<?php
	$url = $_POST['weatherDriveURL'];
	$email = $_POST['email'];
	mail($email, 'WeatherDrive Results', $url);
?>