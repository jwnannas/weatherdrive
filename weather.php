<?php
	$array = $_POST['array'];
	$apiKey = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/";
	foreach ($array as $value) {
		$weather[] = getWeatherSummary(file_get_contents($apiKey.$value["locationAPICall"]), $value);
	}
	$weatherResponse = json_encode($weather);
	echo $weatherResponse;

	function getWeatherSummary ($weatherObject, $value) {
		$jsonWeatherSummary = json_decode($weatherObject, true);
		$currentSummary = array(
							"latitude" =>$jsonWeatherSummary["latitude"],
							"longitude"=>$jsonWeatherSummary["longitude"],
							"locationName" =>$value["locationName"],
							"locationTime" =>$value["locationTime"],
							"weatherInfo" => getHourlyWeather($jsonWeatherSummary, $value["locationTime"])
							);
							getHourlyWeather($jsonWeatherSummary, $value["locationTime"]);
		return $currentSummary;
	}
	
	function getHourlyWeather ($jsonWeatherSummary, $time) {
		$i = 1;
		$predictedWeather = $jsonWeatherSummary["hourly"]["data"][0];
		while ($jsonWeatherSummary["hourly"]["data"][$i]["time"] <= $time) {
			if ($i == 24) {
				break;
			} else {
				$predictedWeather = $jsonWeatherSummary["hourly"]["data"][$i];
				$i++;
			}
		}
		return $predictedWeather;
	}
?>