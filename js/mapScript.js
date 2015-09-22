var infoWindow = new google.maps.InfoWindow;
var markers = [];
var map;

/*Create the Google Map*/
function initialize() {
  /*instantiate variables to load direction capability to the map*/
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({
    //polylineOptions: {strokeColor: "#FFA500"},
    map: map, suppressMarkers: true }
    );
  var mapOptions = {
    center: { lat: 42.37469, lng: -71.12085},//center the map on Cambridge, MA
    zoom: 12,
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
      //provideRouteAlternatives: true
  }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
          var numWeatherPoints = 3;//Preset now but will pull from search when built
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
    weatherLocations[0] = {activeLocation: directions.steps[0]["start_point"].H+","+directions.steps[0]["start_point"].L, activeStep: 0, locationName: directions["start_address"], locationTime: (Date.now() / 1000 | 0)};
    weatherLocations[numWeatherPoints-1] = {activeLocation: directions.steps[steps-1]["end_point"].H+","+directions.steps[steps-1]["end_point"].L, activeStep: steps-1, locationName: directions["end_address"], locationTime: ((Date.now() / 1000 | 0)+directions["duration"].value)};
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
      return {activeLocation: activeLocation, activeStep: activeStep, locationName: "", locationTime: ""};
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
    
    function makeWeatherWindow(weatherObject) {
    var weatherWindow = "<h6>"+weatherObject["locationName"]+"</h6>"+
                "Estimated Arrival Time to this point: "+weatherObject["convertedLocationTime"]+
                '<ul>Predicted:'
    for (i in weatherObject["predictedWeather"]) {
    if (i == "icon") {
      weatherIcon = '<i class="wi wi-forecast-io-' + weatherObject["predictedWeather"][i] + '"></i>';
      weatherWindow += "<li>" + weatherObject["predictedWeather"][i] + weatherIcon + "</li>";
    } else if (i == "windBearing") {
      var bearingIcon = '<i class="wi wi-wind from-' + weatherObject["predictedWeather"][i] + '-deg"></i>';
      weatherWindow += "<li>" + weatherObject["predictedWeather"][i] + bearingIcon + "</li>";
    } else {
          weatherWindow += "<li>"+i + ": " + weatherObject["predictedWeather"][i]+"</li>";
    }
    }
    weatherWindow += "</ul>"

    return weatherWindow
    }
  
    deleteMarkers();
      var weatherPoints = JSON.parse(weatherData);
      $(".adp-directions tr").eq(0).append("<td>"+'<i class="wi wi-forecast-io-' + weatherPoints[0]["predictedWeather"]["icon"] + '"></i>'+"</td>");
      for (m = 0; m < weatherPoints.length; m++) {
        if (m > 0 && m < weatherPoints.length-1) {
          addCollapse(weatherPoints[m-1]["activeStep"], weatherPoints[m]["activeStep"], m, '<i class="wi wi-forecast-io-' + weatherPoints[m]["predictedWeather"]["icon"] + '"></i>');
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
        ;
        
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.setContent(this.html);
          infoWindow.open(map, this);
        });
      }
      $(".adp-directions tr").eq(Number(weatherPoints[weatherPoints.length-1]["activeStep"])).append("<td>"+'<i class="wi wi-forecast-io-' + weatherPoints[weatherPoints.length-1]["predictedWeather"]["icon"] + '"></i>'+"</td>");
      showMarkers();

      function addCollapse (step1, step2, counter, weather) {
        //$(".adp-directions tr").eq(Number(step1)+counter-1).attr({'data-toggle':'collapse', 'data-target':'#routeTo'+step2});
        $(".adp-directions tr").eq(Number(step2)-1).append("<td>"+weather+"</td>");
        //for (n=Number(step1)+counter; n < Number(step2)+counter-1; n++) {
          //$(".adp-directions tr").eq(n).addClass("step"+step2);
       //}
        //$(".step"+step2).wrapAll("<td id='td"+step2+"' />");
        //$("#td"+step2).wrap("<tr id='routeTo"+step2+"' class='collapse' />");
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