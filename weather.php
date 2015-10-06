<?php
	$array = $_POST['array'];
	$apiKey = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/";
	$locationTimeArray = adjustLocationTimeArray($array);
	foreach ($locationTimeArray as $value) {
		$weather[] = getWeatherSummary(file_get_contents($apiKey.$value["activeLocation"].",".$value["locationTime"]."?exclude=minutely,hourly,flags,daily"), $value);
	}
	$weather[] = getWeatherOutlook($weather);
	$weatherResponse = json_encode($weather);
	echo $weatherResponse;

	function getWeatherSummary ($weatherObject, $value) {
		$jsonWeatherSummary = json_decode($weatherObject, true);
		$currentSummary = array(
			"latitude" => $jsonWeatherSummary["latitude"],
			"longitude" => $jsonWeatherSummary["longitude"],
			"locationName" => $value["locationName"],
			"locationTime" => $value["locationTime"],
			"convertedLocationTime" => getTime($value["locationTime"], $jsonWeatherSummary["timezone"]),
			"predictedWeather" => $jsonWeatherSummary["currently"],
			"preppedAlerts" => prepAlerts($jsonWeatherSummary, $jsonWeatherSummary["timezone"]),
			"alerts" => getAlerts($jsonWeatherSummary),
			"activeStep" => $value["activeStep"],
			"distance" => $value["distance"]
		);
		return $currentSummary;
	}
	
	function getTime ($unixTime, $timeZone) {
		$date = new DateTime();
		$date -> setTimestamp($unixTime);
		$date -> setTimeZone(new DateTimeZone($timeZone));
		return $date -> format("h:i:s a T D M j Y");
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

	function getAlerts ($alerts) {
		$retrievedAlerts = [];
		if (array_key_exists("alerts", $alerts)) {
			$retrievedAlerts = $alerts["alerts"][0];
		}
		return $retrievedAlerts;
	}
	
	function prepAlerts ($alerts, $timeZone) {
		if (array_key_exists("alerts", $alerts)) {
			$preppedAlerts = "<td colspan=\"2\"><a href=\"".$alerts["alerts"][0]["uri"]."\" target=\"_blank\">".$alerts["alerts"][0]["title"]."</a></td></tr><tr class=\"alert\"><td></td><td colspan=\"2\">Begins: ".getTime($alerts["alerts"][0]["time"], $timeZone)."</td></tr><tr class=\"alert\"><td></td><td colspan=\"2\">Ends: ".getTime($alerts["alerts"][0]["expires"], $timeZone)."</td></tr>";
		} else {
			$preppedAlerts = "<td colspan=\"2\">None</td></tr>";
		}
		return $preppedAlerts;
	}
	
	function getWeatherOutlook ($array) {
		$outlook = [];
		$summary = [];
		$outlookSummary = "<tbody><tr class=\"outlook\">";
		$alertsNotice = "</tr></tbody></table><div id=\"alerts\"><table class='outlook'><tr class=\"outlook\"><td>Alerts</td></tr>";
		foreach ($array as $value) {
			if (in_array($value["predictedWeather"]["icon"], $outlook)) {
			} else {
				$outlook[] = $value["predictedWeather"]["icon"];
				$summary[] = $value["predictedWeather"]["summary"];
			}
		}
		
		for ($k = 0; $k < count($outlook); $k++) {
			$outlookSummary .= "<td><i class=\"wi wi-forecast-io-".$outlook[$k]."\"></i><div class=\"summary\">".$summary[$k]."</div></td>";
		}
		
		foreach ($array as $value) {
			if ($value["preppedAlerts"] == "<td colspan=\"2\">None</td></tr>"){
			} else {
				if (strpos($alertsNotice, $value["alerts"]["title"]) !== false){
				} else {
			 		$alertsNotice .= "<tr class=\"outlook\"><td><a href=\"".$value["alerts"]["uri"]."\" target=\"_blank\">".$value["alerts"]["title"]."</a></td></tr>";
				}
			}
		}

		if ($alertsNotice == "</tr></tbody></table><div id=\"alerts\"><table class='outlook'><tr class=\"outlook\"><td>Alerts</td></tr>") {
			$outlookSummary .= "</tr></tbody></table><div id=\"alerts\"><table class='outlook'><tr class=\"outlook\"><td>Alerts</td><td>None</td></tr>";
		} else {
			$outlookSummary .= $alertsNotice;
		}
		$outlookSummary .= "</table></div>";
		return $outlookSummary;
	}
?>