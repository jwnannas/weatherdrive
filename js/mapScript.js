var markers = [];
var map;

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
    map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
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
  }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
          var numWeatherPoints = 3;//Preset now but will pull from search when built
          weatherLocations = buildLocationsArray(response, numWeatherPoints);
        buildTimeArray(weatherLocations).then(function(response) {
            getWeather(addWeatherURLs(weatherLocations, response));
        });
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
    for (i = 0; i < numWeatherPoints ; i++) {
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
      return {activeLocation: activeLocation, activeStep: activeStep};
    }

    /*return the time taken to reach specified step 
    in the directions object for this search*/
  function buildTimeArray(locationArray) {
      return new Promise (function(resolve, reject) {
        var timePromise = new Promise (function(resolve, reject){
          var arraySize = 0;
          var timeArray = [];
          function timePromise (timeMethod, locationArray, arraySize, array) {
              timeMethod.then(function(response) {
                if (arraySize < locationArray.length-1) {
                  array.push(response);
                  arraySize ++;
                  timePromise(getTime(locationArray, arraySize), locationArray, arraySize, array);
                } else {
                  array.push(response);
                  resolve(array);
                }
            });
          }
        timePromise(getTime(locationArray, arraySize), locationArray, arraySize, timeArray);
      });
    
        timePromise.then(function(response) {
            resolve (response);
        });
      });
  }
    
  function getTime (locationArray, l) {
    return new Promise (function(resolve, reject) {
          var pointDirectionsService = new google.maps.DirectionsService;
          var geoPoint = locationArray[l]["activeLocation"].split(",");
          var lt = Number(geoPoint[0]);
          var lg = Number(geoPoint[1]);
          pointDirectionsService.route({
            origin: document.getElementById('origin').value,
            destination: {lat: lt, lng: lg},
            travelMode: google.maps.TravelMode.DRIVING
          }, function(pointResponse, status, locationTime) {
            if (status === google.maps.DirectionsStatus.OK) {
              locationInfo = {locationName: pointResponse.routes[0].legs[0]["end_address"], locationTime: Number(pointResponse.routes[0].legs[0]["duration"].value)};                 
              resolve (locationInfo);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
          });
      });  
    }

    /*build an API url to call weather for a specific point*/
  function addWeatherURLs (locations, times) {
    var weatherArray = [];
    for (l = 0; l < times.length; l++) {
      var predictionTime = (Date.now() / 1000 | 0) + times[l]["locationTime"];
      var weatherAPICall = locations[l]["activeLocation"] + "," + predictionTime;
      weatherArray[l] = {location: locations[l]["activeLocation"], locationName: times[l]["locationName"], locationTime: predictionTime, locationAPICall: weatherAPICall};
      }
      return weatherArray;
    }
  
    /*return an array of predicted weather for the specified array of locations and times */
  function getWeather (array) {
    $.ajax({
      type: "POST",
      url:"weather.php",
      data: {array: array},
      success: function(data) {
        var weather = data;
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
  
    deleteMarkers();
      var weatherPoints = JSON.parse(weatherData);
      console.log(weatherPoints);
      for (m = 0; m < weatherPoints.length; m++) {
        var lat = Number(weatherPoints[m]["latitude"]);
        var lng = Number(weatherPoints[m]["longitude"]);
        var myLatlng = {lat: lat, lng: lng};
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: weatherPoints[m]["locationName"]
        });
        markers.push(marker);
        showMarkers();
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