<?php
	$links = $_POST['links'];
	foreach ($links as $value) {
		$weather[] = parseWeather(file_get_contents($value));
	}
	$weatherResponse = json_encode($weather);
	echo $weatherResponse;

	function parseWeather ($weatherObject) {
		$jsonWeatherSummary = json_decode($weatherObject, true);
		$currentSummary = $jsonWeatherSummary["latitude"].",".$jsonWeatherSummary["longitude"];

		return $currentSummary;
	}

?>