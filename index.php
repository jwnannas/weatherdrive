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
	<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCs1a-vtgkgXnsIdVGldol_v5IrRJHcpR4&libraries=geometry,places">
    </script>
 	<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
 	  <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
</head>
<body>
	<header><h1>WeatherDrive</h1></header>
	<div id="actionPanel">
		<div id="actionRow" class="row">
			<div id="infoPane" class="col-md-3">
				<table>
					<thead>
						<tr>
							<td>
								<form>
									<label for="origin">Origin</label>
									<input type="text" name="origin" id="origin" class="form-control">
									<label for="destination">Destination</label>
									<input type="text" name="destination" id="destination" class="form-control">
									<br>
									<button type="button" id="search" class="btn btn-default">Search</button>
								</form>
							</td>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
									<div id="directions"></div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>		
			<div id="mapColumn" class="col-md-9">
				<div class="map-container">
					<div id="map-canvas" class="map-canvas"></div>
				</div>
			</div>
		</div>
	</div>
 <script src="js/mapScript.js" type="text/javascript"></script>
</body>
</html>
