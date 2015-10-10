var markers = [];
var map;
var colors = ['#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#F99E28','#F99E28','#F99E28','#09132e','#09132e'];
var toggleRad = false;
var toggleTraf = false;
var trafficOverlay;
var openBox;

var options = {
  lines: 15 // The number of lines to draw
  , length: 20 // The length of each line
  , width: 14 // The line thickness
  , radius: 30 // The radius of the inner circle
  , scale: 1 // Scales overall size of the spinner
  , corners: 1 // Corner roundness (0..1)
  , color: colors  // #rgb or #rrggbb or array of colors
  , opacity: 0 // Opacity of the lines
  , rotate: 5 // The rotation offset
  , direction: 1 // 1: clockwise, -1: counterclockwise
  , speed: 1 // Rounds per second
  , trail: 50 // Afterglow percentage
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

if (navigator.appVersion.indexOf("Android")!=-1) {
	$('#print').addClass('hideControls');
}

var switchClick = function() {
  switchBoxes($('#origin'), $('#destination'));   
}

document.getElementById('switch').addEventListener('click', switchClick);

document.getElementById('print').addEventListener('click', function () {
	window.print();
});

document.getElementById('email').addEventListener('click', function () {
	var email = prompt("Enter email to send to", "");
	if (email != null) {
		origin = document.getElementById('origin').value;
		destination = document.getElementById('destination').value;
		density = document.getElementById('density').value;
		var url = /http(.*)weatherdrive\//g.exec(document.URL)[0];
		emailURL =  url + '?origin=' + origin + '&destination=' + destination + '&density=' + density;
	 	$.ajax({
          	type: "POST",
          	url:"mail.php",
         	data: {email: email, weatherDriveURL: emailURL},
          	success: function(data) {
            	window.alert('Your searched route has been sent');
          	}
        });
    }
});


function switchBoxes (a, b) {
  var holder = a.val();
  a.val(b.val());
  b.val(holder);
}

function getDensity (densitySelection, duration) {
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
          if ( duration > 9) {
            if (duration < 30) {
              return duration;
            } else {
              return 30;
            }
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
    
    directionsDisplay.setMap(map);
  /*add event listener to search to display directions when destinations are entered*/
  var onClick = function() {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
      if (openBox != null) {
        openBox.close();
      } 
    };
    document.getElementById('search').addEventListener('click', onClick);
    directionsDisplay.setPanel(document.getElementById('directions'));
    
    var radarButton = document.createElement('div');
    toggleRadar(radarButton);
    var trafficButton = document.createElement('div');
    toggleTraffic(trafficButton);
    var buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('id', 'buttonContainer');
    buttonContainer.appendChild(trafficButton);
    buttonContainer.appendChild(radarButton);
    
    
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttonContainer);
  
  checkURL();

	function checkURL () {
		query = document.URL;
		if (query.indexOf('origin')>0&&query.indexOf('destination')>0&&query.indexOf('density')>0) {
			var origin = /origin=(.*)&destination/g.exec(query)[1];
			var destination = /destination=(.*)&density/g.exec(query)[1];
			var density = /density=(.*)/g.exec(query)[1];
			fillForm(origin, destination, density);
		}
	}

	function fillForm (a, b, c) {
		document.getElementById('origin').value = a;
		document.getElementById('destination').value = b;
		document.getElementById('density').value = c;
		document.getElementById('search').click();
	}
}


function toggleTraffic(trafficDiv) {
  var trafficText = document.createTextNode("Traffic");
      trafficDiv.setAttribute('id', 'traffic');
      trafficDiv.setAttribute('class', 'btn btn-default');
    trafficDiv.appendChild(trafficText);
  
   var trafficClick = function() {
    toggleTraffic();
    }
  
  function toggleTraffic () {
    if (toggleTraf == true) {
      toggleTraf = false;
        trafficOverlay.setMap(null);
      $('#traffic').removeClass('buttonClicked');
    } else {
      toggleTraf = true;
      trafficOverlay = new google.maps.TrafficLayer();
        trafficOverlay.setMap(map);
      $('#traffic').addClass('buttonClicked');
    }
    }

    trafficDiv.addEventListener('click', trafficClick);

} 

function toggleRadar (radarDiv) {
  aeris.config.setApiId('Uep0dHDwAmi19YagNO9Xd');
  aeris.config.setApiSecret('F5AhwLaQeumUnDYqqgAZbA0HvGnVzcS3EKWDQart');
  var myAerisMap = new aeris.maps.Map(map);
    var radar = new aeris.maps.layers.Radar();
    var precip = new aeris.maps.layers.Precip();
    precip.setMap(myAerisMap);
    radar.setMap(myAerisMap);
    radar.setOpacity(0);
    precip.setOpacity(0);
    radar.setZIndex(-1);

    var radarText = document.createTextNode("Radar");
      radarDiv.setAttribute('id', 'radar');
      radarDiv.setAttribute('class', 'btn btn-default');
    radarDiv.appendChild(radarText);
    
    var radarClick = function() {
    toggleRadar();
    }
    
   radarDiv.addEventListener('click', radarClick);
   
  function toggleRadar () {
    if (toggleRad == true) {
      toggleRad = false;
        radar.setOpacity(0);
        precip.setOpacity(0);
      $('#radar').removeClass('buttonClicked');
    } else {
      toggleRad = true;
        radar.setOpacity(.6);
        precip.setOpacity(.6);
      $('#radar').addClass('buttonClicked');
    }
    }
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
            var spinner = new Spinner(options).spin();
            document.getElementById('spin').appendChild(spinner.el);
            var numWeatherPoints = getDensity(document.getElementById('density').options[document.getElementById('density').selectedIndex].text,  Math.round(response.routes[0].legs[0]["duration"].value/3600));
            setPrintInformation(response);
            weatherLocations = buildLocationsArray(response, numWeatherPoints);
            getWeather(weatherLocations, spinner, directionsDisplay, response);
        } else {
            window.alert('Please search for a valid location');
        }
    });


  function setPrintInformation (response) {
    var directions = response.routes[0].legs[0];
    var directionsPrintHeader = "<table><tr><td><img src='images/car_A.png'></td><td>"+directions["start_address"]+"</td><td><small><i><span id='depart'> Departing:</span></i></small></td></tr><tr><td><img src='images/car_B.png'></td><td>"+directions["end_address"]+"</td><td><small><i><span id='arrive'> Arriving: </span></i></small></td></tr></table>";
    $('#directionsPrintHeader').append('<td>'+directionsPrintHeader+'</td>');
  }
  
  /*parse the directions to build an array of API weather requests*/
    function buildLocationsArray(response, numWeatherPoints){
		var weatherLocations = [];
      var directions = response.routes[0].legs[0];
      var lat = getKeys(directions)["lat"];
    	var lng = getKeys(directions)["lng"];
      var distance = directions.distance["value"];
      var steps = directions.steps.length;
      weatherLocations[0] = {activeLocation: directions.steps[0]["start_point"][lat]+","+directions.steps[0]["start_point"][lng], activeStep: 0, locationName: directions["start_address"], locationTime: (Date.now() / 1000 | 0), distance: 0};
      weatherLocations[numWeatherPoints-1] = {activeLocation: directions.steps[steps-1]["end_point"][lat]+","+directions.steps[steps-1]["end_point"][lng], activeStep: steps-1, locationName: directions["end_address"], locationTime: ((Date.now() / 1000 | 0)+directions["duration"].value), distance: (directions["distance"].value * 0.000621371).toFixed()};
      for (i = 1; i < numWeatherPoints-1; i++) {
          searchDistance = distance*(i/(numWeatherPoints-1));     
          locationPoint = getLocationPoint(searchDistance, directions);
          weatherLocations[i] = locationPoint;
        }
        return weatherLocations;
    }
    
    function getKeys (object) {
    	var lat;
        var lng;
        counter = 0;
        polyline = google.maps.geometry.encoding.decodePath(object.steps[0]["polyline"].points);
    	      for (var key in polyline[0]) {
                  	if (counter == 0) {
                  		lat = key;
                  		counter++;
                  	} else if (counter == 1) {
                  		lng = key;
                  		counter++;
                  	}
              }
             return {lat: lat, lng: lng}
    }

    /*find the geolocation associated with a given distance along the route and return the step associated
    with with that geolocation*/
    function getLocationPoint (searchDistance, directions) {
        var activeStep = 0;
        var cumulativeDistance = 0;
        var locationArray = [];
       	var lat = getKeys(directions)["lat"];
        var lng = getKeys(directions)["lng"];
  
        for (j = 0; cumulativeDistance <= searchDistance; j++) {
            string = directions.steps[j]["polyline"].points;
            polyline = google.maps.geometry.encoding.decodePath(string);
            
       
            for (k = 1; k <= polyline.length-1; k++) {
              if (cumulativeDistance <= searchDistance) {
                  locationArray[0] = polyline[k-1];
                  locationArray[1] = polyline[k];
                  currentDistance = google.maps.geometry.spherical.computeLength(locationArray);
                  cumulativeDistance += currentDistance;
                  activeLocation = polyline[k][lat]+","+polyline[k][lng];
              }
              activeStep = j;
            }
        }
        return {activeLocation: activeLocation, activeStep: activeStep, locationName: "", locationTime: "", distance: (cumulativeDistance * 0.000621371).toFixed()};
    }

  /*return an array of predicted weather for the specified array of locations and times */
  function getWeather (array, spinner, directionsDisplay, response) {
      $.ajax({
          type: "POST",
          url:"weather.php",
          data: {array: array},
          success: function(data) {
            var weather = data;
            plotWeather(weather, directionsDisplay, response, spinner);
          }
      });
    }

    function plotWeather(weatherData, directionsDisplay, response, spinner) {
    directionsDisplay.setDirections(response)
      setTimeout(function(){
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
          var weatherWindow = "<div class='weatherBox'><div class='weatherInfoContainer'><div class='weatherBoxTitle'><span class='screenWeather'><b>"+weatherObject["locationName"]+
                            '</b><br></span>'+'<small><span class="screenWeather">ETA: </span><span class="printWeather">Weather @ </span><i>'+weatherObject["convertedLocationTime"]+
                            '<span class="weatherBoxTitleSpace"></span><i class="screenWeather">'+weatherObject["distance"]+'mi</i></small>'+ 
                            '</div><table><tr class="prominentWeather">'+ 
                        '<td><i class="wi wi-forecast-io-' + weatherObject["predictedWeather"]["icon"] + '"></i></td>'+
                        '<td><b>' + (weatherObject["predictedWeather"]["temperature"]).toFixed() + '&deg;</b></td>'+
                        '<td><i class="wi wi-wind from-' + weatherObject["predictedWeather"]["windBearing"] + '-deg"></i></td><tr><td>'+
                        weatherObject["predictedWeather"]["summary"]+'</td>'+
                        '<td>App. Temp: '+(weatherObject["predictedWeather"]["apparentTemperature"]).toFixed()+'&deg; F</td><td>'+
                        (weatherObject["predictedWeather"]["windSpeed"]).toFixed()+'mph</td></tr>'+
                        '<tr class="bottom detailWeather"><td>Precip Prob: '+ ((weatherObject["predictedWeather"]["precipProbability"])*100).toFixed()+'&#37;</td>'+
                        '<td>Humidity: '+(weatherObject["predictedWeather"]["humidity"]*100).toFixed()+'&#37;</td>'+
                        '<td>Visibility: '+weatherObject["predictedWeather"]["visibility"]+'</td></tr>'+
                        '<tr class="detailWeather"><td>Precip Intensity: '+(weatherObject["predictedWeather"]["precipIntensity"]).toFixed(2)+'in/hr</td>'+
                        '<td>Dew Point: '+(weatherObject["predictedWeather"]["dewPoint"]).toFixed()+'&deg;</td>'+
                        '<td>Cloud Cover: '+(weatherObject["predictedWeather"]["cloudCover"]*100).toFixed()+'&#37;</td></tr>'+
                        '<tr class="bottom alert"><td>Alerts:</td> '+ weatherObject["preppedAlerts"] +
                        '</table></div></div>';

        return weatherWindow
      }
  
      deleteMarkers();
        var weatherPoints = JSON.parse(weatherData);
        var weatherOutlook = weatherPoints.pop();
        $("#depart").append(weatherPoints[0]["convertedLocationTime"]);
        $("#arrive").append(weatherPoints[weatherPoints.length-1]["convertedLocationTime"]);
        $("#controlRow").removeClass('hideControls');
        $(".adp-marker").eq(0).replaceWith("<img src='images/car_A.png'>");
        $(".adp-marker").eq(0).replaceWith("<img src='images/car_B.png'>");
        $("#expectedConditions").html("<table class='outlook'><thead><tr><td>Expected Trip Conditions</td></tr></thead>" + weatherOutlook + "</table>");
        $("table .adp-directions").before('<div data-toggle="collapse" data-target=".nonWeatherStep" class="toggleSteps">Toggle all steps</div>');
        addCollapseClass(weatherPoints[weatherPoints.length-1]["activeStep"]);
        removeCollapseClass(weatherPoints);
        $(".adp-directions tr").eq(0).after(getWeatherRow(weatherPoints[0]));
        for (m = 0; m < weatherPoints.length; m++) {
          if (m > 0 && m < weatherPoints.length-1) {
            $(".adp-directions > tbody > tr").eq(Number(weatherPoints[m]["activeStep"])+m).after(getWeatherRow(weatherPoints[m]));
            $(".adp-directions > tbody > tr").eq(Number(weatherPoints[m]["activeStep"])+m).append();
          }
          var lat = Number(weatherPoints[m]["latitude"]);
          var lng = Number(weatherPoints[m]["longitude"]);
          var myLatlng = {lat: lat, lng: lng};
          var weatherIcon = "images/weatherIconSet/" + weatherPoints[m]["predictedWeather"]["icon"] + ".png";
          
          var anchoredIcon = {
            url: weatherIcon,
            anchor: new google.maps.Point(20,20)
          };
          
          var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              icon: anchoredIcon,
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
          openBox = ib;
    
          google.maps.event.addListener(marker, 'click', function() {
              ib.setContent(this.html);
              ib.open(map, this);
          });
      }
        $(".adp-directions > tbody > tr").eq(Number(weatherPoints[weatherPoints.length-1]["activeStep"])+weatherPoints.length-1).after(getWeatherRow(weatherPoints[weatherPoints.length-1]));
        showMarkers();
      
        function getWeatherRow(weather) {
          var trimmedDate = weather["convertedLocationTime"];
          trimmedDate = trimmedDate.substring(0, trimmedDate.indexOf('T')+1);
          var weatherRow = "<tr><td></td><td>"+'<i class="wi wi-forecast-io-' + weather["predictedWeather"]["icon"] + ' screenWeather"></i></td>'+
                         '<td><b class="screenWeather">'+(weather["predictedWeather"]["temperature"]).toFixed() + '&deg; F</b>'+
                         ' <i class="screenWeather">'+weather["predictedWeather"]["summary"]+'</i> <span class="screenWeather">&#64; ' + trimmedDate + "</span>" +
                         '<table class="printWeather"><tr><td>'+makeWeatherWindow(weather)+'</td></tr></table>'+   
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
              $(".adp-directions > tbody > tr").eq(weather[o]["activeStep"]).removeClass("nonWeatherStep collapse");
          }
        }  
        document.getElementById('spin').removeChild(spinner.el);
        
        }, 1);
    }
}

/*Add Google Places autocomplete functionality to search boxes*/
var autocompleteOrigin = new google.maps.places.Autocomplete(document.getElementById('origin'));
var autocompleteDestination = new google.maps.places.Autocomplete(document.getElementById('destination'));

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);