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
      displayWeather(response);
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });

  /*display the weather on the map*/
  function displayWeather(response) {
    var directions = response.routes[0].legs[0];
    var timeStep = stepTime(25, directions);
    var locationStep = stepLocation(25, directions);
    getWeather(locationStep, timeStep);

  }

  /*return the time taken to reach specified step 
  in the directions object for this search*/
  function stepTime(step, directions) {
    var stepTime = 0;
    for (i = 0; i <= step; i++) {
      stepTime += directions.steps[i].duration.value;
    }
    return stepTime;
  }

  /*return the location of the specified step
  in the directions object for this search*/
  function stepLocation (step, directions) {
    var stepLocation = directions.steps[step]["end_location"].G + ", " + directions.steps[step]["end_location"].K;
    return stepLocation;
  }

  /*return the predicted weather for the specified location and time */
  function getWeather (location, time) {
    var predictionTime = (Date.now() / 1000 | 0) + time;
    var weatherAPICall = "https://api.forecast.io/forecast/d0b0ba7f5bd34dbacdc9e469a3487298/" + location + ", " + predictionTime;
    console.log(weatherAPICall);

  }
}

/*Add Google Places autocomplete functionality to search boxes*/
var autocompleteOrigin = new google.maps.places.Autocomplete(
document.getElementById('origin'));
var autocompleteDestination = new google.maps.places.Autocomplete(
document.getElementById('destination'));

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);
