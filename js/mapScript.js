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
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);
