<!DOCTYPE html>
<html>
<head>
	<title>WeatherDrive</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<link rel="stylesheet" href="css/weather-icons-wind.min.css">
	<link rel="stylesheet" href="css/weather-icons.min.css">
	<link rel="icon" 
      type="image/png" 
      href="favicon.ico">
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCs1a-vtgkgXnsIdVGldol_v5IrRJHcpR4&libraries=geometry,places"></script>
 	<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
 	<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
 	<script type="text/javascript" src="libraries/jquery.slimscroll.min.js"></script>
 	<script src="libraries/infobox.js" type="text/javascript"></script>
 	<script src="libraries/spin.min.js" type="text/javascript"></script>
</head>
<body>
	<nav class="navbar navbar-default navbar-fixed-top">
			<div class="navbar-text pull-left">
				<img src="images/logoIcon.png">
			</div>
			<div class="navbar-text pull-right">
					<img src="images/logo.png"></h1>
			</div>
	</nav>
	<div id="actionPanel">
		<div id="actionRow" class="row">
			<div id="infoPane" class="col-md-4 col-lg-4">
				<table class="info">
					<thead>
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
									<div class="form-group">
									<select class= "form-control" name="density" id="density">
										<option selected="selected" disabled="disabled" value="densityLabel" hidden="hidden">Select Weather Point Density</option>
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
						<tr>
							<td id="expectedConditions"></td>
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
