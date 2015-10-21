<?php
/**
 * @author John Nannas
 * @version 1.0
 * server side file that receives an array of locations and times and returns a json
 * object with weather information specific to those locations
 */
 
	$array = $_POST['array']; //an array of locations and times for a route
	$apiKey = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/";
	$locationTimeArray = adjustLocationTimeArray($array);
	foreach ($locationTimeArray as $value) { // for each location in the route get the weather from Dark Sky Forecast API
		$weather[] = getWeatherSummary(file_get_contents($apiKey.$value["activeLocation"].",".$value["locationTime"]."?exclude=minutely,hourly,flags,daily"), $value);
	}
	$weather[] = getWeatherOutlook($weather);
	$weatherResponse = json_encode($weather);
	echo $weatherResponse;


	/**
  	 * get the weather and other relevant location data for a location and time
  	 *
  	 * @param object $weatherObject - a json object containing weather information
  	 * @param object $value - an object containing descriptive information for an individual location
  	 *
  	 * @return array $currentSummary - an array containing weather and other data associated with a location and time
  	 */
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
	
	
	/**
  	 * get a formatted date and time from a unix timestamp and time zone
  	 *
  	 * @param string $unixTime - a unix timestamp
  	 * @param string $timeZone - a timezone for this timestamp
  	 *
  	 * @return string $date - a formatted date and time with associated time zone
  	 */
	function getTime ($unixTime, $timeZone) {
		$date = new DateTime();
		$date -> setTimestamp($unixTime);
		$date -> setTimeZone(new DateTimeZone($timeZone));
		return $date -> format("h:i:s a T D M j Y");
	}
	
	/**
  	 * adjust an array of locations and times to contain directions information specific 
  	 * to this location and time by making a call to Google directions API
  	 *
  	 * @param array $array - an array of locations and times
  	 *
  	 * @return array $array - an array complete with directions information to each location and time
  	 */
	function adjustLocationTimeArray ($array) {
		for ($j = 1; $j <= count($array)-2; $j++) {
			$directionsKey = "AIzaSyCzgguKie1LoZymULr-ZMo_3kRunFimFEg";
			$directionsObject = file_get_contents("https://maps.googleapis.com/maps/api/directions/json?origin=".$array[0]["activeLocation"]."&destination=".$array[$j]["activeLocation"]."&key=".$directionsKey);
			$directionsSummary = json_decode($directionsObject, true);
			$locationName = $directionsSummary["routes"][0]["legs"][0]["end_address"];
			$locationTime = $array[$j]["timeReference"] + $directionsSummary["routes"][0]["legs"][0]["duration"]["value"];
			$array[$j]["locationName"] = $locationName;
			$array[$j]["locationTime"] = $locationTime;
		}
		return $array;
	}

	/**
  	 * get alerts for a given location and time
  	 *
  	 * @param array $alerts - an array containing weather information for a given location and time
  	 *
  	 * @return array $array - an array complete with directions information to each location and time
  	 */
	function getAlerts ($alerts) {
		$retrievedAlerts = [];
		if (array_key_exists("alerts", $alerts)) {
			$retrievedAlerts = $alerts["alerts"][0];
		}
		return $retrievedAlerts;
	}
	
	/**
  	 * format alerts for inclusion on the page when returned to the client
  	 *
  	 * @param array $alerts - an array containing weather information for a given location and time
  	 * @param string $timeZone - a timezone associated with the location for this array of alerts
  	 *
  	 * @return string $alerts - a string of alerts formatted for inclusion as HTML on the client side
  	 */
	function prepAlerts ($alerts, $timeZone) {
		if (array_key_exists("alerts", $alerts)) {
			$preppedAlerts = "<td colspan=\"2\"><a href=\"".$alerts["alerts"][0]["uri"]."\" target=\"_blank\">".$alerts["alerts"][0]["title"]."</a></td></tr><tr class=\"alert\"><td></td><td colspan=\"2\">Begins: ".getTime($alerts["alerts"][0]["time"], $timeZone)."</td></tr><tr class=\"alert\"><td></td><td colspan=\"2\">Ends: ".getTime($alerts["alerts"][0]["expires"], $timeZone)."</td></tr>";
		} else {
			$preppedAlerts = "<td colspan=\"2\">None</td></tr>";
		}
		return $preppedAlerts;
	}
	
	/**
  	 * get the weather outlook for this trip
  	 *
  	 * @param array $array- an array containing weather information for a full trip
  	 *
  	 * @return string $outlookSummary - a string representation summarizing unique weather events along a given route formatted for inclusion as HTML on the client side
  	 */
	function getWeatherOutlook ($array) {
		$outlook = [];
		$summary = [];
		$outlookSummary = "<tbody><tr class=\"outlook\">";
		$alertsNotice = "</tr></tbody></table><div id=\"alerts\"><table class='outlook'><tr class=\"outlook\"><td>Alerts</td></tr>";
		foreach ($array as $value) {
			if (in_array($value["predictedWeather"]["icon"], $outlook)) {//if the current icon is already in the outlook array do not add
			} else {
				$outlook[] = $value["predictedWeather"]["icon"];
				$summary[] = $value["predictedWeather"]["summary"];
			}
		}
		
		for ($k = 0; $k < count($outlook); $k++) {
			$outlookSummary .= "<td><i class=\"wi wi-forecast-io-".$outlook[$k]."\"></i><div class=\"summary\">".$summary[$k]."</div></td>";
		}
		
		foreach ($array as $value) {
			if ($value["preppedAlerts"] == "<td colspan=\"2\">None</td></tr>"){//if there are no alerts add none to alerts row
			} else {
				if (strpos($alertsNotice, $value["alerts"]["title"]) !== false){//if this alert title is already in the alert list do not add
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