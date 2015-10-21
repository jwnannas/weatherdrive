<?php
/**
 * @author John Nannas
 * @version 1.0
 * A file that takes a passed url representing a weatherdrive search as well as 
 * a specified email and sends an email message containing the url. Server uses
 * postfix to send messages.
 */
 
	$url = $_POST['weatherDriveURL'];
	$email = $_POST['email'];
	$message = "Thanks for using WeatherDrive. Your WeatherDrive search can be accessed here:\r\n".$url."\r\nHave a safe trip!\r\n\r\nSincerely,\r\nThe WeatherDrive Team";
	$headers = 'From: weatherdrive@weatherdrive.org';
	mail($email, 'WeatherDrive Results', $message, $headers);
?>