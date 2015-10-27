<!DOCTYPE html>
<html>
<head>
	<title>WeatherDrive</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" media="screen" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	<link rel="stylesheet" media="screen" type="text/css" href="css/style.css">
	<link rel="stylesheet" media="print" type="text/css" href="css/print.css">
	<link rel="stylesheet" href="css/weather-icons-wind.min.css">
	<link rel="stylesheet" href="css/weather-icons.min.css">
	<link rel="icon" type="image/png" href="favicon.ico">
	<link rel="stylesheet" type="text/css" media="screen" href="css/bootstrap-datetimepicker.css">
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCs1a-vtgkgXnsIdVGldol_v5IrRJHcpR4&libraries=geometry,places"></script>
	<script type="text/javascript" src="https://cdn.aerisjs.com/aeris-gmaps.min.js"></script>
 	<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
 	<script src="http://code.jquery.com/ui/1.9.2/jquery-ui.min.js"></script>
 	<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
 	<script type="text/javascript" src="libraries/jquery.slimscroll.min.js"></script>
 	<script src="libraries/infobox.js" type="text/javascript"></script>
 	<script src="libraries/spin.min.js" type="text/javascript"></script>
    <script type="text/javascript" src="libraries/moment.min.js"></script>
    <script type="text/javascript" src="libraries/bootstrap-datetimepicker.min.js"></script>
    <script type="text/javascript" src="libraries/sonic.js"></script>
    <script type="text/javascript" src="libraries/Encoder/b64.js"></script>
    <script type="text/javascript" src="libraries/Encoder/GIFEncoder.js"></script>
    <script type="text/javascript" src="libraries/Encoder/LZWEncoder.js"></script>
    <script type="text/javascript" src="libraries/Encoder/NeuQuant.js"></script>
</head>
<body>
	<nav class="navbar navbar-default navbar-fixed-top">
			<div class="navbar-text pull-left">
				<img src="images/logoIcon.png">
			</div>
			<div class="navbar-text pull-right">
					<img src="images/logo.png">
			</div>
	</nav>
	<div id="actionPanel">
		<div id="actionRow" class="row">
			<div id="infoPane" class="col-md-4 col-lg-4">
				<table class="info">
					<thead id="searchHeader">
						<tr>
							<td>
								<form>
									<table id="mapSearch">
										<tr>
											<td class="carIcon">
												<img src="images/car_A.png">
											</td>
											<td class="origin">
												<input type="text" name="origin" id="origin" class="form-control" placeholder="Origin">
											</td>
											<td rowspan="2" id="switch">
												<img src="images/switch.png">
											</td>
										</tr>
										<tr>
											<td class="carIcon">
												<img src="images/car_B.png">
											</td>
											<td>
												<input type="text" name="destination" id="destination" class="form-control" placeholder="Destination">
											</td>
										</tr>
									</table>
									<br>
									<div class='input-group date' id='dateTime'>
                    						<input type='text' class="form-control" id="time" readonly="readonly"/>
                    						<span class="input-group-addon">
                        						<span class="glyphicon glyphicon-calendar"></span>
                    						</span>
                					</div>
									<div class="form-group">
									<select class= "form-control" name="density" id="density">
										<option selected="selected" disabled="disabled" value="densityLabel" hidden="hidden">Forecast frequency (higher = more time)</option>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="highest">Highest</option>
									</select>
									</div>
									<button type="button" id="search" class="btn btn-default">Get Directions and Weather</button>
								</form>
							</td>
						</tr>
						<tr id="mobileLoader"></tr>
						<tr id="directionsPrintHeader" class="printWeather"></tr>
						<tr> 
							<td id="routeOptions" class="hideControls"></td>
						</tr>
						<tr>
							<td id="expectedConditions"></td>
						</tr>
						<tr id="controlRow" class="hideControls">
							<td>
								<div>
									<table class="outlook">
										<tr class="outlook"> 
											<td class='directionsResult'><b>Weather / Directions Results</b></td>
											<td id="print"><img src="images/printer.png"></td>
											<td id="email"><img src="images/email.png"></td>
										</tr>
									</table>
								</div>
							</td>
						</tr>
					</thead>
					<tbody id="directionsTbody">
						<tr id ="directionsTr"> 
							<td id="directionsTD">
								<div id="directions"></div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>		
			<div id="mapColumn" class="col-md-8 col-lg-8">
				<div class="map-container">
					<div id="spin"></div>
					<div id="map-canvas" class="map-canvas"></div>
				</div>
			</div>
		</div>
	</div>
	<script src="js/mapScript.js" type="text/javascript"></script>
</body>
</html>
