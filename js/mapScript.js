var markers = [];
var map;
var colors = ['#000','#000','#000','#000','#F99E28'];

var options = {
	lines: 15 // The number of lines to draw
	, length: 20 // The length of each line
	, width: 14 // The line thickness
	, radius: 30 // The radius of the inner circle
	, scale: 1 // Scales overall size of the spinner
	, corners: 1 // Corner roundness (0..1)
	, color: colors  // #rgb or #rrggbb or array of colors
	, opacity: 0.1 // Opacity of the lines
	, rotate: 0 // The rotation offset
	, direction: 1 // 1: clockwise, -1: counterclockwise
	, speed: 1 // Rounds per second
	, trail: 60 // Afterglow percentage
	, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
	, zIndex: 2e9 // The z-index (defaults to 2000000000)
	, className: 'spinner' // The CSS class to assign to the spinner
	, top: '50%' // Top position relative to parent
	, left: '50%' // Left position relative to parent
	, shadow: false // Whether to render a shadow
	, hwaccel: false // Whether to use hardware acceleration
	, position: 'absolute' // Element positioning
}

$('.info').slimScroll({
	color: '#6C6C6C',
	size: '10px',
	height: '100%',
});

var switchClick = function() {
	switchBoxes($('#origin'), $('#destination'));   
}

document.getElementById('switch').addEventListener('click', switchClick);

function switchBoxes (a, b) {
	var holder = a.val();
	a.val(b.val());
	b.val(holder);
}

function getDensity (densitySelection, distance) {
	switch (densitySelection) {
    	case 'Select Weather Point Density':
      		$('#density').val("medium");
      		return 5;
    	case 'Low':
      		return 3;
   		case 'Medium':
      		return 5;
    	case 'High':
      		return 7;
    	case 'Highest':
      		if ((distance/60) > 9) {
        		return Math.round(distance/60);
      		} else {
        		return 9;
      		}
  	}
}


/*Create the Google Map*/
function initialize() {
  /*instantiate variables to load direction capability to the map*/
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer({
    	map: map, suppressMarkers: true }
    );
  	var mapOptions = {
    	center: { lat: 42.37469, lng: -71.12085},//center the map on Cambridge, MA
    	zoom: 12,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    
    //var radarLayer = new google.maps.KmlLayer({
    //url: '',
   // map: map
 // });

    directionsDisplay.setMap(map);
	/*add event listener to search to display directions when destinations are entered*/
	var onClick = function() {
    	calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
  	document.getElementById('search').addEventListener('click', onClick);
  	directionsDisplay.setPanel(document.getElementById('directions'));
}

/*display the route when searched*/
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
	directionsService.route({
     	origin: document.getElementById('origin').value,
      	destination: document.getElementById('destination').value,
      	travelMode: google.maps.TravelMode.DRIVING
      	//provideRouteAlternatives: true
  	}, function(response, status) {
      	if (status === google.maps.DirectionsStatus.OK) {
          	var numWeatherPoints = getDensity(document.getElementById('density').options[document.getElementById('density').selectedIndex].text, response.routes[0].legs[0]["distance"].value * 0.000621371);//Preset now but will pull from search when built
          	weatherLocations = buildLocationsArray(response, numWeatherPoints);
          	getWeather(weatherLocations);
          	directionsDisplay.setDirections(response);
      	} else {
          	window.alert('Directions request failed due to ' + status);
      	}
  	});

	/*parse the directions to build an array of API weather requests*/
  	function buildLocationsArray(response, numWeatherPoints){
    	var weatherLocations = [];
    	var directions = response.routes[0].legs[0];
    	var distance = directions.distance["value"];
    	var steps = directions.steps.length;
    	weatherLocations[0] = {activeLocation: directions.steps[0]["start_point"].H+","+directions.steps[0]["start_point"].L, activeStep: 0, locationName: directions["start_address"], locationTime: (Date.now() / 1000 | 0), distance: 0};
    	weatherLocations[numWeatherPoints-1] = {activeLocation: directions.steps[steps-1]["end_point"].H+","+directions.steps[steps-1]["end_point"].L, activeStep: steps-1, locationName: directions["end_address"], locationTime: ((Date.now() / 1000 | 0)+directions["duration"].value), distance: (directions["distance"].value * 0.000621371).toFixed()};
    	for (i = 1; i < numWeatherPoints-1; i++) {
      		searchDistance = distance*(i/(numWeatherPoints-1));     
      		locationPoint = getLocationPoint(searchDistance, directions);
      		weatherLocations[i] = locationPoint;
      	}
      	return weatherLocations;
    }
    
    /*find the geolocation associated with a given distance along the route and return the step associated
    with with that geolocation*/
  	function getLocationPoint (searchDistance, directions) {
      	var activeStep = 0;
      	var cumulativeDistance = 0;
      	var locationArray = [];
      	for (j = 0; cumulativeDistance <= searchDistance; j++) {
          	string = directions.steps[j]["polyline"].points;
          	polyline = google.maps.geometry.encoding.decodePath(string);
          	for (k = 1; k <= polyline.length-1; k++) {
            	if (cumulativeDistance <= searchDistance) {
              		locationArray[0] = polyline[k-1];
              		locationArray[1] = polyline[k];
              		currentDistance = google.maps.geometry.spherical.computeLength(locationArray);
              		cumulativeDistance += currentDistance;
              		activeLocation = polyline[k].H+","+polyline[k].L;
            	}
            	activeStep = j;
          	}
      	}
      	return {activeLocation: activeLocation, activeStep: activeStep, locationName: "", locationTime: "", distance: (cumulativeDistance * 0.000621371).toFixed()};
    }

	/*return an array of predicted weather for the specified array of locations and times */
 	function getWeather (array) {
    	var spinner = new Spinner(options).spin();
  		document.getElementById('spin').appendChild(spinner.el);
    	$.ajax({
      		type: "POST",
      		url:"weather.php",
      		data: {array: array},
      		success: function(data) {
        		var weather = data;
        		document.getElementById('spin').removeChild(spinner.el);
        		plotWeather(weather);
      		}
    	});
  	}

  	function plotWeather(weatherData) {
   		function setMapOnAll(map) {
      		for (var i = 0; i < markers.length; i++) {
        		markers[i].setMap(map);
      		}
    	}

    	// Removes the markers from the map, but keeps them in the array.
    	function clearMarkers() {
      		setMapOnAll(null);
    	}

      	// Shows any markers currently in the array.
    	function showMarkers() {
      		setMapOnAll(map);
    	}

    	// Deletes all markers in the array by removing references to them.
    	function deleteMarkers() {
      		clearMarkers();
      		markers = [];
    	}  
    
    	function makeWeatherWindow(weatherObject) {
      		var weatherWindow = "<div class='weatherBox'><div class='weatherInfoContainer'><div class='weatherBoxTitle'><b>"+weatherObject["locationName"]+
                      			'</b><br>'+'<small>ETA: <i>'+weatherObject["convertedLocationTime"]+
                      			'<span class="weatherBoxTitleSpace"></span><i>'+weatherObject["distance"]+'mi</i></small>'+ 
                      			'</div><table><tr class="prominentWeather">'+ 
              					'<td><i class="wi wi-forecast-io-' + weatherObject["predictedWeather"]["icon"] + '"></i></td>'+
              					'<td><b>' + (weatherObject["predictedWeather"]["temperature"]).toFixed() + '&deg;</b></td>'+
              					'<td><i class="wi wi-wind from-' + weatherObject["predictedWeather"]["windBearing"] + '-deg"></i></td><tr><td>'+
              					weatherObject["predictedWeather"]["summary"]+'</td>'+
              					'<td>App. Temp: '+(weatherObject["predictedWeather"]["apparentTemperature"]).toFixed()+'&deg; F</td><td>'+
              					(weatherObject["predictedWeather"]["windSpeed"]).toFixed()+'mph</td></tr>'+
              					'<tr class="bottom detailWeather"><td>Precip Prob: '+ (weatherObject["predictedWeather"]["precipProbability"]).toFixed()+'&#37;</td>'+
              					'<td>Humidity: '+(weatherObject["predictedWeather"]["humidity"]*100).toFixed()+'&#37;</td>'+
              					'<td>Visibility: '+weatherObject["predictedWeather"]["visibility"]+'</td></tr>'+
              					'<tr class="detailWeather"><td>Precip Intensity: '+(weatherObject["predictedWeather"]["precipIntensity"]).toFixed(1)+'in/hr</td>'+
              					'<td>Dew Point: '+(weatherObject["predictedWeather"]["dewPoint"]).toFixed()+'&deg;</td>'+
              					'<td>Cloud Cover: '+(weatherObject["predictedWeather"]["cloudCover"]*100).toFixed()+'&#37;</td></tr>'+
              					'<tr class="bottom alert"><td>Alerts:</td> '+ weatherObject["preppedAlerts"] +
              					'</table></div></div>';

    		return weatherWindow
    	}
  
    	deleteMarkers();
      	var weatherPoints = JSON.parse(weatherData);
      	var weatherOutlook = weatherPoints.pop();
    	$("#expectedConditions").html("<div>Expected Trip Conditions: " + weatherOutlook + "</div>");
      	$("table .adp-directions").before('<div data-toggle="collapse" data-target=".nonWeatherStep" class="toggleSteps">Toggle all steps</div>');
      	addCollapseClass(weatherPoints[weatherPoints.length-1]["activeStep"]);
      	removeCollapseClass(weatherPoints);
      	$(".adp-directions tr").eq(0).after(getWeatherRow(weatherPoints[0]));
      	for (m = 0; m < weatherPoints.length; m++) {
        	if (m > 0 && m < weatherPoints.length-1) {
        		$(".adp-directions tr").eq(Number(weatherPoints[m]["activeStep"])+m).after(getWeatherRow(weatherPoints[m]));
       		}
        	var lat = Number(weatherPoints[m]["latitude"]);
        	var lng = Number(weatherPoints[m]["longitude"]);
        	var myLatlng = {lat: lat, lng: lng};
        	var weatherIcon = "images/" + weatherPoints[m]["predictedWeather"]["icon"] + ".png";
        	var marker = new google.maps.Marker({
          		position: myLatlng,
          		map: map,
          		icon: weatherIcon,
          		title: weatherPoints[m]["locationName"]
        	});
        	markers.push(marker);
      		marker.html = makeWeatherWindow(weatherPoints[m]);
     		var myOptions = {
        		disableAutoPan: false
        		,maxWidth: 0
        		,pixelOffset: new google.maps.Size(-140, 0)
        		,zIndex: null
        		,closeBoxMargin: "2px 2px 2px 2px"
        		,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
        		,infoBoxClearance: new google.maps.Size(1, 1)
        		,isHidden: false
        		,pane: "floatPane"
        		,enableEventPropagation: false
    		};
      		var ib = new InfoBox(myOptions);
    
        	google.maps.event.addListener(marker, 'click', function() {
          		ib.setContent(this.html);
            	ib.open(map, this);
        	});
     	}
      	$(".adp-directions tr").eq(Number(weatherPoints[weatherPoints.length-1]["activeStep"])+weatherPoints.length-1).after(getWeatherRow(weatherPoints[weatherPoints.length-1]));
      	showMarkers();
      
      	function getWeatherRow(weather) {
        	var trimmedDate = weather["convertedLocationTime"];
        	trimmedDate = trimmedDate.substring(0, trimmedDate.indexOf('T')+1);
       		var weatherRow = "<tr><td></td><td>"+'<i class="wi wi-forecast-io-' + weather["predictedWeather"]["icon"] + '"></i></td>'+
                  			 '<td><b>'+(weather["predictedWeather"]["temperature"]).toFixed() + '&deg; F</b>'+
                  			 ' <i>'+weather["predictedWeather"]["summary"]+'</i> &#64; ' + trimmedDate +
                  			 '</td></tr>';
                  
        	return weatherRow;  
      	}
      
      	function addCollapseClass (step) {
        	for (n=0; n <= step; n++) {
          		$(".adp-directions tr").eq(n).addClass("nonWeatherStep collapse");
       		}
      	}
      
      	function removeCollapseClass (weather) {
        	for (o=0; o <= weather.length-1; o++) {
          		$(".adp-directions tr").eq(weather[o]["activeStep"]).removeClass("nonWeatherStep collapse");
        	}
      	}  
    }
}

/*Add Google Places autocomplete functionality to search boxes*/
var autocompleteOrigin = new google.maps.places.Autocomplete(document.getElementById('origin'));
var autocompleteDestination = new google.maps.places.Autocomplete(document.getElementById('destination'));

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);