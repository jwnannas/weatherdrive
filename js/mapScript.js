/**
 * @name mapScript.js
 * @version 1.0
 * @author John Nannas 
 * @fileoverview a script that uses Google maps javascript api, Dark Sky Forecast api, and Aeris weather api
 * to generate weather and directions for user searches
 */

/*global variables*/
var markers = []; //array to hold map markers along route
var map; //the google map
var colors = ['#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#09132e','#F99E28','#F99E28','#F99E28','#09132e','#09132e']; //color array for spinner, each array item corresponds to an individual line
var toggleRad = false; //variable to track the toggle of the radar, do not show radar initially
var toggleTraf = false; //variable to track the toggle of the traffic, do not show traffic initially
var trafficOverlay; //variable to hold the traffic overlay
var openBox; //variable to keep track of which weather infoBox is open
var passedTime = ""; //variable to keep track of a time passed from the URL, assume not set until checkURL function
var route = 0; //keep track of what route option is selected, default to the first option

/*options passed to the spinner, listed here with comments from the spin.js documentation*/
var options = {
  lines: 15 // The number of lines to draw
  , length: 20 // The length of each line
  , width: 14 // The line thickness
  , radius: 30 // The radius of the inner circle
  , scale: 1 // Scales overall size of the spinner
  , corners: 1 // Corner roundness (0..1)
  , color: colors  // #rgb or #rrggbb or array of colors
  , opacity: .25 // Opacity of the lines
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

/*options passed to the bar loader on initial window load*/
var barWidth = $('#barLoader').width();
if (barWidth == 0) {
  barWidth = 1;
}
var loader = new Sonic({
  width: barWidth,
  height: 10,
  stepsPerFrame: 1,
  trailLength: .2,
  pointDistance: .02,
  fps: 25,
  padding: 0,
  fillColor: '#F99E28',
  setup: function() {
    this._.lineWidth = 20;
  },
  path: [
    ['line', 5, 5, barWidth-5, 5],
    ['line', barWidth-5, 5, 5, 5]
  ],
  convert: true,
  background:"#09132e"
});

/*add event listener to the bar loader to resize the width when the window is resized*/
window.addEventListener("resize", function () {
var barWidth = $('#barLoader').width();
if (barWidth == 0) {
  barWidth = 1;
}
loader = new Sonic({
  width: barWidth,
  height: 10,
  stepsPerFrame: 1,
  trailLength: .2,
  pointDistance: .02,
  fps: 25,
  padding: 0,
  fillColor: '#F99E28',
  setup: function() {
    this._.lineWidth = 20;
  },
  path: [
    ['line', 5, 5, barWidth-5, 5],
    ['line', barWidth-5, 5, 5, 5]
  ],
  convert: true,
  background:"#09132e"
});
});

/*initialize the date and time picker to allow date/time selection on the site*/
$(function () {
  var dateLimit = moment.unix((Date.now() / 1000 | 0) + 2592000);//set the maximum date selection to 30 days from the current date/time
    var currentDate = Date.now(); // set the current date to the current date/time
  $('#dateTime').datetimepicker({
      defaultDate: currentDate, //initialize the calendar with the current date
        maxDate: dateLimit, // set the maximum date
        minDate: currentDate, //set the minimum date to current date, do not allow past date/time selections
        ignoreReadonly:true //allow the datetimepicker to function via button click even if the input tag it is associated with is readonly
    });
});

/*initialize the custom scrollbar for the info pane, from slimscroll.js*/
$('.info').slimScroll({
  color: '#6C6C6C', //set the color of the scroll to a shade of gray
  size: '5px', //set the scrollbar width to 10px
  height: '100%', //set the scrollbar height to the height of the info pane
  alwaysVisible: true
});

/*hide print button on Android devices, because they do not currently support window.print()*/
if (navigator.appVersion.indexOf("Android")!=-1) {
  $('#print').addClass('hideControls');
}

/*add event listener to the print button to bring up the browser's default print window when clicked*/
document.getElementById('print').addEventListener('click', function () {
  window.print();
});

/*run switchBoxes every time switchClick is called */
var switchClick = function() {
  switchBoxes($('#origin'), $('#destination')); //pass the origin and destination elements to switch boxes 
}

/**
 *function to swap the values inside the origin and destination elements
 *@return void
 */
function switchBoxes (a, b) {
  var holder = a.val();
  a.val(b.val());
  b.val(holder);
}

document.getElementById('switch').addEventListener('click', switchClick); //add event listener to the switch button to switch the values of origin and destination when clicked


/*add event listener to send email with pertinent information when email button is clicked*/
document.getElementById('email').addEventListener('click', function () {
	  $('#emailModal').modal();//prompt the user to enter the desired send-to email address
	  document.getElementById('emailAddressButton').addEventListener('click', function () {
      var email = $('#emailAddress').val();
      if (email != '') { //if an email has been entered
      origin = document.getElementById('origin').value.replace(/ /g,""); //remove spaces from the origin entered in the form and save that value here
      destination = document.getElementById('destination').value.replace(/ /g,""); //remove spaces from the destination entered in the form save that value here
      density = document.getElementById('density').value; //save the value of the weather point density selection here
      time = new Date($('#dateTime input').val()).getTime()/1000; //save the value of the time selection in the form as a unix timestamp
      var url = "http://www.weatherdrive.org/"; //the beginning of the weatherdrive url
      emailURL =  url + '?origin=' + origin + '&destination=' + destination + '&density=' + density + '&time=' + time; //construct a url from variables above which represents the currently searched route
      /*send the saved emailURL to the server to be sent out via mail.php*/
      $.ajax({
        type: "POST",
          url:"php/mail.php",
        data: {email: email, weatherDriveURL: emailURL},
        success: function(data) {
        	  $('#emailModal').hide();
        	  $('#emailSent').text(email);
        	  $('#sentModal').modal();//confirm the message was sent if mail.php successfully completes
          }
      });
  }
  });
});

/**
 *convert the string descriptions of weather point density to numbers for use in other functions
 * @param {string} densitySelection - selected density from user
 * @param {number} duration - number of hours for selected trip
 * @return {number} the number of weather points to be populated for this trip
 */
function getDensity (densitySelection, duration) {
  switch (densitySelection) {
      case 'Forecast frequency (higher = more time)'://if no option selected default to medium density
          $('#density').val("medium");
          return 5;
      case 'Low':
          return 3;
      case 'Medium':
          return 5;
      case 'High':
          return 7;
      case 'Highest':
          if ( duration > 9) {//if the trip is more than 9 hours long
            if (duration < 30) {//and less than 30 hours long
              return duration;//return one weather point per hour traveled
            } else {
              return 30;//do not exceed 30 weather points on a trip
            }
          } else {
            return 9;//if trip is less than nine hours return 9 weather points
          }
    }
}
 
 

/**Initialize the Google Map and associated actions*/
function initialize() {
  /*instantiate variables to load direction capability to the map*/
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true, //do not show default goole markers
      hideRouteList: true, //do not show default route options returned from Google
    }
    );
    var mapOptions = {
      center: { lat: 42.37469, lng: -71.12085},//center the map on Cambridge, MA
      zoom: 12,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    
    /*create radar and traffic buttons and add them to Google Map*/
    var radarButton = document.createElement('div');
    toggleRadar(radarButton, map);
    
    var trafficButton = document.createElement('div');
    toggleTraffic(trafficButton);
    
    var buttonContainer = document.createElement('div'); //container to hold traffic and radar buttons so they can be added in a styled fashion
    buttonContainer.setAttribute('id', 'buttonContainer');
    buttonContainer.appendChild(trafficButton);
    buttonContainer.appendChild(radarButton);
    
    
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttonContainer);//add radar and traffic buttons to top right corner of map
    
  /*add event listener to search to display directions and weather when destinations are entered*/
    var onClick = function() {
      route = 0;
      calculateAndDisplayRoute(directionsService, directionsDisplay, buttonContainer, map);
    };
    
    document.getElementById('search').addEventListener('click', onClick);//add event listener to search button 
    
  
    checkURL();//check whether or not a search has been entered in the URL

  /**
   *check URL for a valid route search
   */
    function checkURL () {
    query = document.URL;
    if (query.indexOf('origin')>0&&query.indexOf('destination')>0&&query.indexOf('density')>0&&query.indexOf('time')>0) {//if origin, destination, density, and time are all included in URL
      //get the value of each searched parameter and fill the search form with those values
      var origin = /origin=(.*)&destination/g.exec(query)[1];
      var destination = /destination=(.*)&density/g.exec(query)[1];
      var density = /density=(.*)&time/g.exec(query)[1];
      var dateTime = getDateTime(new Date(/time=(.*)/g.exec(query)[1]*1000));
      passedTime = /time=(.*)/g.exec(query)[1];
      fillForm(origin, destination, density, dateTime);
    }

  /**
   *get a date/time that is readable by the weatherdrive functions
   *param {object} timestamp - a unix timestamp
   *@return {string} preppedDateTime - a date/time formatted to be accepted by other weatherdrive functions
   */
    function getDateTime (timestamp) {
        var date = timestamp.toLocaleDateString();
        var time = timestamp.toLocaleTimeString();
        var dateTime = date + " " + time;
        var preppedDateTime = dateTime.replace(/:00 /g," ");
        return preppedDateTime;
    }
  }

  /**
   *fill the site search fields with passed values and run a search
   *@param {string} a - the origin of the search
   *@param {string} b - the destination of the search
   *@param {string} c - the density of weather points for the search
   *@param {string} d - the time of the search
   *@return void
   */
  function fillForm (a, b, c, d) {
    document.getElementById('origin').value = a;
    document.getElementById('destination').value = b;
    document.getElementById('density').value = c;
    document.getElementById('time').value = d;
    document.getElementById('search').click();//run the search once values are filled
  }
}

  /**
   *create a button and event listener to toggle the traffic layer on and off
   *@param {object} trafficDiv - the html element to hold the traffic button
   */
  function toggleTraffic(trafficDiv) {
      var trafficText = document.createTextNode("Traffic");
        trafficDiv.setAttribute('id', 'traffic');
        trafficDiv.setAttribute('class', 'btn btn-default');
      trafficDiv.appendChild(trafficText);
  
    var trafficClick = function() {
      toggleTraffic();
      }
  
  /**
   *add the traffic layer to the map and change styling of button to reflect click
   */
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


  /**
   *create a button and event listener to toggle the radar layer on and off
   *@param {object} radarDiv - the html element to hold the radar button
   *@return void
   */
function toggleRadar (radarDiv, map) {
  /*prep the API ids for aeris weather radar layer call*/
  aeris.config.setApiId('Uep0dHDwAmi19YagNO9Xd');
  aeris.config.setApiSecret('F5AhwLaQeumUnDYqqgAZbA0HvGnVzcS3EKWDQart');
  var myAerisMap = new aeris.maps.Map(this.map); //convert the google map to an aeris map to display radar
    var radar = new aeris.maps.layers.Radar();
    var precip = new aeris.maps.layers.Precip();
    precip.setMap(myAerisMap);//add precipitation to map
    radar.setMap(myAerisMap);//add basic radar to map
    precip.setOpacity(0);//make the precipitation layer invisible by default by setting opacity to zero
    radar.setOpacity(0); //make the radar layer invisible by default by setting opacity to zero
    precip.setZIndex(-1); //put the precipitation layer behind the radar layer

  /*add Radar text to radar buton*/
  	$(radarDiv).empty();
  	radarDiv.removeEventListener('click', radarClick);
    var radarText = document.createTextNode("Radar");
      radarDiv.setAttribute('id', 'radar');
      radarDiv.setAttribute('class', 'btn btn-default');
    radarDiv.appendChild(radarText);
    
    var radarClick = function() {
      toggleRadar();
    }
    
   radarDiv.addEventListener('click', radarClick);
   
  /**toggle the visibility of the radar layer when radar button is clicked*/ 
  function toggleRadar () {
    /*if radar is currently on and button was pressed make radar layer invisible*/
    if (toggleRad == true) {
      toggleRad = false;
        radar.setOpacity(0);
        precip.setOpacity(0);
      $('#radar').removeClass('buttonClicked');
  /*otherwise make radar layer visible by increasing opacity of layer*/
    } else {
      toggleRad = true;
        radar.setOpacity(.6);
        precip.setOpacity(.6);
      $('#radar').addClass('buttonClicked');
    }
    }
}

/**
 *calculate and display the route and associated weather data
 *@param {object} directionsService - the object to handle the Google directions service request
 *@param {object} directionsDisplay - the object to handle the display of the google directions service response
 *@return void
 */
function calculateAndDisplayRoute(directionsService, directionsDisplay, buttonContainer) {
  /*use the Google directions service to calculate from a route from origin to destination*/
  directionsService.route({
      origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        travelMode: google.maps.TravelMode.DRIVING,//set mode to driving
        provideRouteAlternatives: true //request alternative routes
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            setRouteOptions(response, directionsDisplay);//add the route options to the page
            runWeather(response, directionsDisplay, buttonContainer, map); //get the weather information for this route
        } else {
        	$('#myModal').modal();//prompt user with custom modal if invalid place was searched
        }
    });

/**
 *get the weather associated with this route
 *@param {object} response - the Google directions response
 *@param {object} directionsDisplay - the object to handle the display of the google directions service response
 *@return void
 */
function runWeather (response, directionsDisplay, buttonContainer, map) {
    /*close any open infoBoxes*/
    if (openBox != null) {
        openBox.close();
      } 
  
  $('#directions').html("");

  /*add a spinner at beginning of search to visually cue user of activity*/
    var spinner = new Spinner(options).spin();
    document.getElementById('spin').appendChild(spinner.el);
  /*add a bar loader at beginning of search to visually cue user of activity*/
    loader.play();
    $('#barLoader').append(loader.canvas);
    
      var numWeatherPoints = getDensity(document.getElementById('density').options[document.getElementById('density').selectedIndex].text,  Math.round(response.routes[route].legs[0]["duration"].value/3600));//get the number of weather points for this request
        setPrintInformation(response);//add directions information for this search specifically for print styles
        weatherLocations = buildLocationsArray(response, numWeatherPoints);//get the locations associated with the number of weather points along route
        getWeather(weatherLocations, spinner, directionsDisplay, response, buttonContainer);//get the weather associated with each point on route
}

 /**
  *add origin/destination information from the directions for this search as a header specifically for print styles
  *@param {object} response - the Google directions response
  *@return void
  */
  function setPrintInformation (response) {
    var directions = response.routes[route].legs[0];//get the specific directions for the passed route index
    var directionsPrintHeader = "<table><tr><td><img src='images/car_A.png'></td><td>"+directions["start_address"]+"</td><td><small><i><span id='depart'> Departing:</span></i></small></td></tr><tr><td><img src='images/car_B.png'></td><td>"+directions["end_address"]+"</td><td><small><i><span id='arrive'> Arriving: </span></i></small></td></tr></table>";
    $('#directionsPrintHeader').empty();//clear any previous search information from the directions print header
    $('#directionsPrintHeader').append('<td>'+directionsPrintHeader+'</td>');
  }
  
  /**
   *parse the directions to build an array of locations specific to number of preferred points along route
   *@param {object} response - the Google directions response
   *@param {number} numWeatherPoints - the number of weather points selected for this search
   *@return {object} weatherLocations - an array of locations along the requested route that correspond to the requested number of weather points
   */
    function buildLocationsArray(response, numWeatherPoints){
      var requestedTime = getRequestedTime();//get the time for this search
      var weatherLocations = []; //an array to hold the locations of each point along the route to receive weather information
      var directions = response.routes[route].legs[0]; //directions specific to the selected route index for this search
      var distance = directions.distance["value"]; //the distance for this trip
      var steps = directions.steps.length; //how many steps in this set of directions
      var start = directions.steps[0]["start_point"].toString(); //get the geolocation of the start point for this search from the google directions response
      var end = directions.steps[steps-1]["end_point"].toString(); //get the geolocation of the end point for this search from the google directions response
      weatherLocations[0] = {activeLocation: (start.substring(1, start.indexOf(')'))).replace(/ /g, ""), activeStep: 0, locationName: directions["start_address"], locationTime: Number(requestedTime), distance: 0}; //set the first weather location in the weather location array to the route starting point along with associated location information
      weatherLocations[numWeatherPoints-1] = {activeLocation: (end.substring(1, end.indexOf(')'))).replace(/ /g, "") , activeStep: steps-1, locationName: directions["end_address"], locationTime: Number(requestedTime)+Number(directions["duration"].value), distance: (directions["distance"].value * 0.000621371).toFixed()}; //set the last weather location in the weather location array to the route starting point along with associated location information
      /*get location information for the requested number of weather points*/
      for (i = 1; i < numWeatherPoints-1; i++) {
          searchDistance = distance*(i/(numWeatherPoints-1));     
          locationPoint = getLocationPoint(searchDistance, directions, requestedTime);
          weatherLocations[i] = locationPoint;
        }
        return weatherLocations;
    }
    
    /**
     *add the route options for this directions search to the page and associated event handlers to display specific route information on page when clicked
     *@param {object} response - the Google directions response
     *@param {object} directionsDisplay - the object to handle the display of the google directions service response
     *@return void
     */
    function setRouteOptions (response, directionsDisplay) {
    
    /*add a table with the routes from the directions response to the page*/
    var routes = "<br><table id='routeSelections' class='outlook'>";
    for (a = 0; a < response.routes.length; a ++){
      if (a == 0) {
        //set the ID of each route option to a number associated with where it occurs in the route option list
        routes += "<tr id='"+a+"'class='selectedRoute'><td><b>"+response.routes[a].summary + "</b> " + response.routes[a].legs[0].distance["text"] + " - about " + response.routes[a].legs[0].duration["text"]+"</td></tr>"
      } else {
        routes += "<tr id='"+a+"'><td><b>"+response.routes[a].summary + "</b> " + response.routes[a].legs[0].distance["text"] + " - about " + response.routes[a].legs[0].duration["text"]+"</td></tr>" 
    }
  }
      routes += "</table>";
  $('#routeOptions').empty();//clear any previous route information form the page
    $('#routeOptions').append(routes);
    
     /*set the actions to run every time selectAndIlluminate is called*/
      var selectAndIlluminate = function () {
        $('.outlook tr.selectedRoute').removeClass('selectedRoute');//remove the highlight class from the previously selected route
        route = getRouteNumber(this);//set the route index to the selected route
        $(this).addClass('selectedRoute');//highlight the currently selected route
        runWeather(response, directionsDisplay);//get and display the weather information for this route
        
        /**
         *get the string id of the selected route
         *@param {object} element - an html element that represents a route option
         *@return {string} routeSelection - an id representing the currently selected route
         */
        function getRouteNumber (element) {
          var routeSelection = $(element).attr('id');
          return routeSelection;
        }
   
      }
    
    /*add an event listener to each route option*/
    for (b=0; b < response.routes.length; b++) {
      document.getElementById(b).addEventListener('click', selectAndIlluminate);
    }
    
    }
    
    /**
     *get a unix timestamp for a time passed in the URL, if none is set return a blank string
     *@return {string} passedTime - the global variable holder for whether a time was passed via URL, returned if nothing was passed
     *@return {number} stamp - a unix timestamp corresponding to the time passed via URL
     */
    function getRequestedTime () {
      if (passedTime != '') {
        return passedTime;
      } else {
        var stamp = new Date($('#dateTime input').val()).getTime()/1000;
        return stamp;
      }
    }
    
    /**
     *parse over the directions for this route and find the geolocation associated with a given distance along the route
     *@param {number} searchDistance - a number representing the distance along the route for this point
     *@param {object} directions - the google object representing specific directions for this search
     *@param {number} timeReference - the unix timestamp associated with the start of this trip
     *@return {object} - an array containing the geolocation, step this location occurs in in the Google directions step array, name, time, and distance to the appropriate point along the route 
     */
    function getLocationPoint (searchDistance, directions, timeReference) {
        var activeStep = 0;//the step in which this location occurs initially set to zero
        var cumulativeDistance = 0;//the total distance along the route through all steps parsed
        var locationArray = [];
  
        for (j = 0; cumulativeDistance <= searchDistance; j++) { //as long as the total distance of all steps parsed is less than or equal to the target search distance
            string = directions.steps[j]["polyline"].points;
            polyline = google.maps.geometry.encoding.decodePath(string);

          /*parse through the polyline values within the step and add the distance to the cumulative distance*/
            for (k = 1; k <= polyline.length-1; k++) {
            /*if still less than or equal to the target distance add this polyline distance to the cumulative distance*/
              if (cumulativeDistance <= searchDistance) { 
                  locationArray[0] = polyline[k-1];
                  locationArray[1] = polyline[k];
                  currentDistance = google.maps.geometry.spherical.computeLength(locationArray);
                  cumulativeDistance += currentDistance;

                  activeLocation = (polyline[k].toString().substring(1, polyline[k].toString().indexOf(')')).replace(/ /g, ""));
                  
              } else {
                break;
              }
            }
            activeStep = j;
        }
        return {activeLocation: activeLocation, activeStep: activeStep, locationName: "", locationTime: "", distance: (cumulativeDistance * 0.000621371).toFixed(), timeReference: timeReference};
    }

  /**
   *call to the server to get the weather API information for this route
   *@param {object} array - an array of the weather locations along this route
   *@param {object} spinner - a spin.js object that is currently spinning on the page
   *@param {object} directionsDisplay - the object to handle the display of the google directions service response
   *@param {object} response - the Google directions response
   *@return void
   */
  function getWeather (array, spinner, directionsDisplay, response, buttonContainer) {
      $.ajax({
          type: "POST",
          url:"php/weather.php",
          data: {array: array},
          success: function(data) {
            var weather = data;
            plotWeather(weather, directionsDisplay, response, spinner, buttonContainer);
          }
      });
    }

  /**
   *populate the page with weather information
   *@param {object} weatherData - a json object response from the server containing weather information for this route
   *@param {object} directionsDisplay - the object to handle the display of the google directions service response
   *@param {object} response - the Google directions response
   *@param {object} spinner - a spin.js object that is currently spinning on the page
   *@return void
   */
    function plotWeather(weatherData, directionsDisplay, response, spinner, buttonContainer) {
      var mapOptions = {
      center: { lat: 42.37469, lng: -71.12085},//center the map on Cambridge, MA
      zoom: 12,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var directionsDisplay = new google.maps.DirectionsRenderer({
      map: map, 
      suppressMarkers: true, //do not show default goole markers
      hideRouteList: true, //do not show default route options returned from Google
    }
    );
    $('#routeOptions').removeClass('hideControls');//show the route options
    directionsDisplay.setPanel(document.getElementById('directions'));
    directionsDisplay.setDirections(response);//set the directions display to show the directions
    directionsDisplay.setRouteIndex(Number(route));//set the directions to show the selected route index
    
      /*wait for 1 millisecond to ensure that directions are populated on page before parsing them to include corresponding weather information*/
      setTimeout(function(){
	var radarButton = document.createElement('div');
    toggleRadar(radarButton, map);
    
    var trafficButton = document.createElement('div');
    toggleTraffic(trafficButton);
    
    var buttonContainer = document.createElement('div'); //container to hold traffic and radar buttons so they can be added in a styled fashion
    buttonContainer.setAttribute('id', 'buttonContainer');
    buttonContainer.appendChild(trafficButton);
    buttonContainer.appendChild(radarButton);
map.controls[google.maps.ControlPosition.TOP_RIGHT].push(buttonContainer);
      //add markers to the map
      function addMarkers(map) {
          for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
          }
      }

      // deletes markers from map and clear the marker array
      function deleteMarkers() {
          addMarkers(null);
          markers = [];
      }  
    
      /**
       *create a window populated with detailed weather information
       *@param {object} weatherObject - an object with specific weather information for a given location
       *@return {string} weatherWindow - an html formatted string that represents the information to be populated into a weather window
       */
      function makeWeatherWindow(weatherObject) {
      
        var boxItems = ["icon", "temperature", "windBearing", "summary", "apparentTemperature", "windSpeed", "precipProbability", "humidity", "visibility", "precipIntensity", "dewPoint", "cloudCover"];//an array containing the values that will be populated into the weather window
        checkUndefinedWeather(weatherObject, boxItems);//check that the weatherObject contains all the values in the boxItems array
        
          var weatherWindow = "<div class='weatherBox'><div class='weatherInfoContainer'><div class='weatherBoxTitle'><span class='screenWeather'><b>"+weatherObject["locationName"]+
                            '</b><br></span>'+'<small><span class="screenWeather">ETA: </span><span class="printWeather">Weather @ </span><i>'+weatherObject["convertedLocationTime"]+
                            '<span class="weatherBoxTitleSpace"></span><i class="screenWeather">'+weatherObject["distance"]+'mi</i></small>'+ 
                            '</div><table><tr class="prominentWeather">'+ 
                        '<td><i class="wi wi-forecast-io-' + weatherObject["predictedWeather"]["icon"] + '"></i></td>'+
                        '<td><b>' + formatWeatherNumber(weatherObject["predictedWeather"]["temperature"], 1, 0, '&deg;')+ '</b></td>'+
                        '<td><i class="wi wi-wind from-' + weatherObject["predictedWeather"]["windBearing"] + '-deg"></i></td><tr><td>'+
                        weatherObject["predictedWeather"]["summary"]+'</td>'+
                        '<td>App. Temp: '+formatWeatherNumber(weatherObject["predictedWeather"]["apparentTemperature"], 1, 0, '&deg; F')+'</td><td>'+
                        formatWeatherNumber(weatherObject["predictedWeather"]["windSpeed"], 1, 0, 'mph')+'</td></tr>'+
                        '<tr class="bottom detailWeather"><td>Precip Prob: '+ formatWeatherNumber(weatherObject["predictedWeather"]["precipProbability"], 100, 0, '&#37;')+'</td>'+
                        '<td>Humidity: '+formatWeatherNumber(weatherObject["predictedWeather"]["humidity"], 100, 0, '&#37;')+'</td>'+
                        '<td>Visibility: '+weatherObject["predictedWeather"]["visibility"]+'</td></tr>'+
                        '<tr class="detailWeather"><td>Precip Int: '+formatWeatherNumber(weatherObject["predictedWeather"]["precipIntensity"], 1, 2, 'in/hr')+'</td>'+
                        '<td>Dew Pt: '+formatWeatherNumber(weatherObject["predictedWeather"]["dewPoint"], 1, 0, '&deg;')+'</td>'+
                        '<td>Cloud Cvr: '+formatWeatherNumber(weatherObject["predictedWeather"]["cloudCover"], 100, 0, '&#37;')+'</td></tr>'+
                        '<tr class="bottom alert"><td>Alerts:</td> '+ weatherObject["preppedAlerts"] +
                        '</table></div></div>';

    /**
     *format a weather associated number for presentation on the page
     *@param {number} number - the weather data number
     *@param {number} multiplier - a number to multiply the weather number by
     *@param {number} decimals - a number of decimals to display for the weather number 
     *@param {string} label - a label for the weather number
     *@return {string} formattedNumber - the weather number formatted for presentation
     */
        function formatWeatherNumber (number, multiplier, decimals, label) {
         /*if the passed value is a string return that string, accounts for 'N/A' values set in checkUndefinedWeather()*/
          if (typeof number != 'number') {
            return number;
          } else {
            var formattedNumber = (number * multiplier).toFixed(decimals);
            return formattedNumber + label;
          }
        }
        
        /**
         *check to see if any of the requested weather information has not been provided
         *@param {object} object - the weather information for the request
         *@param {object} items - an array containing those weather values that will be requested
         *@return void
         */
        function checkUndefinedWeather(object, items) {
          for (p=0; p < items.length; p++) {
            /*if any of the requested weather values are not in the weatherObject fill add that value to the object and set it to "N/A"*/
            if (!(items[p] in object["predictedWeather"])) {
              object["predictedWeather"][items[p]] = "N/A";
            } 
          }
        }
  
        return weatherWindow
      }
  
      deleteMarkers(); //remove markers from any previous searches
        var weatherPoints = JSON.parse(weatherData); //parse the weatherData returned from the server to an array
        var weatherOutlook = weatherPoints.pop(); //set the weatherOutlook to the last value in the weatherPoints array and remove that value from the array to streamline parsing of the array below
        passedTime = ''; //clear the passedTime value to allow for future searches
        $("#depart").append(weatherPoints[0]["convertedLocationTime"]); //add the departing time to the printed style header
        $("#arrive").append(weatherPoints[weatherPoints.length-1]["convertedLocationTime"]); //add the arrival time to the printed style header
        $("#controlRow").removeClass('hideControls');//show the print and email buttons in the control row
        $(".adp-marker").eq(0).replaceWith("<img src='images/car_A.png'>"); //replace the default google step-by-step directions origin marker with a custom marker
        $(".adp-marker").eq(0).replaceWith("<img src='images/car_B.png'>"); //replace the default google step-by-step directions destination marker with a custom marker
        $("#expectedConditions").html("<table class='outlook'><thead><tr><td>Expected Trip Conditions</td></tr></thead>" + weatherOutlook + "</table>"); //add the weather outlook summary to the info pane
        $("table .adp-directions").before('<div data-toggle="collapse" data-target=".nonWeatherStep" class="toggleSteps">Toggle all steps</div>'); //add the step toggle to the page
        addCollapseClass(weatherPoints[weatherPoints.length-1]["activeStep"]); //add the ability to collapse the step-by-step directions list
        removeCollapseClass(weatherPoints); //remove the ability to collapse those steps that contain weather information
        $(".adp-directions tr").eq(0).after(getWeatherRow(weatherPoints[0])); //add a weather row for the first weather location on the route
        $(".adp-directions > tbody > tr").eq(Number(weatherPoints[weatherPoints.length-1]["activeStep"])+1).after(getWeatherRow(weatherPoints[weatherPoints.length-1])); //add a weather row for the last weather location on the route
        for (m = 0; m < weatherPoints.length; m++) { 
          /*add a weather row for this weather point after the corresponding step in the Google step-by-step directions*/
          if (m > 0 && m < weatherPoints.length-1) {
            $(".adp-directions > tbody > tr").eq(Number(weatherPoints[m]["activeStep"])+m).after(getWeatherRow(weatherPoints[m]));
            $(".adp-directions > tbody > tr").eq(Number(weatherPoints[m]["activeStep"])+m).append();
          }
          
          /*get the latitude and longitude for this point and combine them*/
          var lat = Number(weatherPoints[m]["latitude"]);
          var lng = Number(weatherPoints[m]["longitude"]);
          var myLatlng = {lat: lat, lng: lng};
          
          var weatherIcon = "images/weatherIconSet/" + weatherPoints[m]["predictedWeather"]["icon"] + ".png"; //get the weatherIcon associated with the weather at this point
          
          /*create a Google icon that is anchored directly over the corresponding point on the map*/
          var anchoredIcon = {
            url: weatherIcon,
            anchor: new google.maps.Point(20,20)
          };
          
          /*create a new marker for this point at the current lat/lng with the custom anchoredIcon specified*/
          var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              icon: anchoredIcon,
              title: weatherPoints[m]["locationName"]
          });
          
          markers.push(marker); //add this marker to the marker array
          
          marker.html = makeWeatherWindow(weatherPoints[m]); //set the html of the marker to contain the corresponding weatherWindow for this point
          
          /*options passed to the infoBox, listed here per the infoBox.js documentation*/
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
          var ib = new InfoBox(myOptions); //create a new infoBox for this point
          openBox = ib;
    
       /*add an event listener to populate and display an infoBox relevant to this marker when clicked*/
          google.maps.event.addListener(marker, 'click', function() {
              ib.setContent(this.html);
              ib.open(map, this);
          });
          
          
          /*add an event listener to populate and display an infoBox relevant to a weather row in the step by step directions when that row is clicked*/
          (function() {
          var markerHolder = markers[m];
          $(".weatherRow").eq(m).on({
          	mouseenter: function () {
            	ib.setContent(markerHolder.html);
            	ib.open(map, markerHolder);
        	},
        	mouseleave: function () {
        		ib.close();
        	}
          });
          }())
          
      }
         addMarkers(map);//add this marker to the map
         
         
       /**
        *get a table row populated with weather information
        *@param {object} weather - an object containing weather information for a given point
        *@return {string} weatherRow - an html formatted string that represents the information to be populated as a weather row
        */
        function getWeatherRow(weather) {
          var trimmedDate = weather["convertedLocationTime"];
          trimmedDate = trimmedDate.substring(0, trimmedDate.indexOf('T')+1);
          var weatherRow = "<tr class='weatherRow'><td></td><td>"+'<i class="wi wi-forecast-io-' + weather["predictedWeather"]["icon"] + ' screenWeather"></i></td>'+
                         '<td><b class="screenWeather">'+(weather["predictedWeather"]["temperature"]).toFixed() + '&deg; F</b>'+
                         ' <i class="screenWeather">'+weather["predictedWeather"]["summary"]+'</i> <span class="screenWeather">&#64; ' + trimmedDate + "</span>" +
                         '<table class="printWeather"><tr><td>'+makeWeatherWindow(weather)+'</td></tr></table>'+   
                         '</td><td></td></tr>';
                  
          return weatherRow;  
        }
      
        /**
         *add the collapse class to the passed step
         *@param {number} step - a number representing the number of steps in the directions step array
         *@return void
         */
        function addCollapseClass (step) {
          /*for every step in the step array add the collapse classes*/
          for (n=0; n <= step; n++) {
              $(".adp-directions tr").eq(n).addClass("nonWeatherStep collapse");
          }
        }
      
       /**
         *remove the collapse class from the passed step
         *@param {object} weather - an array containing weather points for this route
         */
        function removeCollapseClass (weather) {
          /*for all the weather points in the array remove the collapse classes*/
          for (o=0; o <= weather.length-1; o++) {
              $(".adp-directions > tbody > tr").eq(weather[o]["activeStep"]).removeClass("nonWeatherStep collapse");
          }
        } 
        document.getElementById('spin').removeChild(spinner.el);//remove the spinner to cue user that search is complete
        $('#barLoader').empty();//remove the bar loader to cue user that search is complete
        }, 1);
    }
}

/*Add Google Places autocomplete functionality to search boxes*/
var autocompleteOrigin = new google.maps.places.Autocomplete(document.getElementById('origin'));
var autocompleteDestination = new google.maps.places.Autocomplete(document.getElementById('destination'));

/*add the map to the page*/
google.maps.event.addDomListener(window, 'load', initialize);