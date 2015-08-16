<!DOCTYPE html>
<html>
<head>
	<title>WeatherDrive</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCs1a-vtgkgXnsIdVGldol_v5IrRJHcpR4">
    </script>
    <script type="text/javascript">
    	function initialize() {
        	var mapOptions = {
          		center: { lat: 42.37469, lng: -71.12085},
          		zoom: 18
        	};
        	var map = new google.maps.Map(document.getElementById('map-canvas'),
            	mapOptions);
      	}
     	google.maps.event.addDomListener(window, 'load', initialize);
    </script>
</head>
<body>
	<header><h1>WeatherDrive Header</h1></header>
	<div class="navbar">Navigation</div>
	<div id="actionPanel">
		<div id="actionRow" class="row">
			<div id="infoPane" class="col-md-2">
				<p  class="lead">INFO PANE</p>
			</div>
			<div id="mapColumn" class="col-md-10">
				<div class="map-container">
					<div id="map-canvas" class="map-canvas"></div>
				</div>
			</div>
		</div>
	</div>
	<footer> WeatherDrive Footer</footer>
</body>
</html>

