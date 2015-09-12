/*Create the Google Map*/
function initialize() {
	/*instantiate variables to load direction capability to the map*/
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer({
	draggable: true,
	map: map});
    var mapOptions = {
    	center: { lat: 42.37469, lng: -71.12085},//center the map on Cambridge, MA
        	zoom: 12
        };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
    	mapOptions);
	
	/*add event listener to search to display directions when destinations are entered*/
	var onClick = function() {
    	calculateAndDisplayRoute(directionsService, directionsDisplay);
  	};
	document.getElementById('search').addEventListener('click', onClick);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directions'));
}

/*display the route when searched*/
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('origin').value,
    destination: document.getElementById('destination').value,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      var numWeatherPoints = 5;//Preset now but will pull from search when built
      buildDirectionsArray(response, numWeatherPoints, document.getElementById('origin').value);
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });

  /*parse the directions to build an array of API weather requests*/
  function buildDirectionsArray(response, numWeatherPoints, origin){
  	var weatherRequests = [];
    var directions = response.routes[0].legs[0];
    var distance = directions.distance["value"];
    startLocation = directions["start_location"].G+","+directions["start_location"].K;
    endLocation = directions["end_location"].G+","+directions["end_location"].K;
    weatherRequests[0] = getWeatherURL(startLocation, 0);
    for (i = 1; i <= numWeatherPoints - 2; i++) { //"-2" to account for begin/end points
    	searchDistance = distance*(i/(numWeatherPoints-1));    	
    	locationPoint = getLocationPoint(searchDistance, directions);
    	locationTime = getLocationTime(locationPoint.activeLocation, origin, weatherRequests, i);//need to pass array and loop iteration because timing function is asynchronous
    }
    weatherRequests[numWeatherPoints-1] = getWeatherURL(endLocation, directions["duration"].value);
	console.log(weatherRequests);
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
			activeLocation = polyline[k].G+","+polyline[k].K;
  		}
  		activeStep = j;
  		}
    }
    return {activeLocation, activeStep};
  }

  /*return the time taken to reach specified step 
  in the directions object for this search*/
  function getLocationTime(location, origin, array, i) {
  	var pointDirectionsService = new google.maps.DirectionsService;
  	pointDirectionsService.route({
  		origin: origin,
    	destination: location,
    	travelMode: google.maps.TravelMode.DRIVING
    }, function(pointResponse, status) {
    if (status === google.maps.DirectionsStatus.OK) {
    	locationTime = pointResponse.routes[0].legs[0]["duration"].value;
    	console.log(i);
    	array[i] = getWeatherURL(location, locationTime);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
  }

  /*build an API url to call weather for a specific point*/
  function getWeatherURL (location, time) {
  	var predictionTime = (Date.now() / 1000 | 0) + time;
    var weatherAPICall = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/" + location + "," + predictionTime;
  	return weatherAPICall;
  }
  
  /*return the predicted weather for the specified location and time */
  function getWeather (url) {
    $.ajax({
      type: "POST",
      url:"weather.php",
      data: {link: url},
      success: function(data) {
        var weather = data;
        plotWeather(weather);
      }
    });

  function plotWeather(array) {
    console.log(array);
  }

  }
}

/*Add Google Places autocomplete functionality to search boxes*/
var autocompleteOrigin = new google.maps.places.Autocomplete(
document.getElementById('origin'));
var autocompleteDestination = new google.maps.places.Autocomplete(
document.getElementById('destination'));

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);
