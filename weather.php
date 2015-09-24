<?php
	$array = $_POST['array'];
	$apiKey = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/";
	
	$locationTimeArray = adjustLocationTimeArray($array);
	
	foreach ($locationTimeArray as $value) {
		$weather[] = getWeatherSummary(file_get_contents($apiKey.$value["activeLocation"].",".$value["locationTime"]."?exclude=minutely,hourly,flags,daily"), $value);
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
							"convertedLocationTime" =>getTime($value["locationTime"], $jsonWeatherSummary["timezone"]),
							"predictedWeather" => $jsonWeatherSummary["currently"],
							"activeStep" => $value["activeStep"],
							"distance" => $value["distance"]
							);
		return $currentSummary;
	}
	
	function getTime ($unixTime, $timeZone) {
		$date = new DateTime();
		$date->setTimestamp($unixTime);
		$date->setTimeZone(new DateTimeZone($timeZone));
		return $date->format("h:i:s a T D M j Y");
	}
	
	
	function adjustLocationTimeArray ($array) {
	
		for ($j = 1; $j <= count($array)-2; $j++) {
		
			$directionsKey = "AIzaSyCzgguKie1LoZymULr-ZMo_3kRunFimFEg";
			$directionsObject = file_get_contents("https://maps.googleapis.com/maps/api/directions/json?origin=".$array[0]["activeLocation"]."&destination=".$array[$j]["activeLocation"]."&key=".$directionsKey);
			$directionsSummary = json_decode($directionsObject, true);
		
			$locationName = $directionsSummary["routes"][0]["legs"][0]["end_address"];
			$locationTime = time() + $directionsSummary["routes"][0]["legs"][0]["duration"]["value"];
			
			$array[$j]["locationName"] = $locationName;
			$array[$j]["locationTime"] = $locationTime;
		}
		return $array;
	}
	
?>