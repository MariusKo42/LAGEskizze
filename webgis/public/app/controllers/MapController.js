var app = angular.module("fgis");
var map, drawnItems, drawControl, fachkarten, basemap;
var lines,
	linesArray = new Array();
var commentsMap = new Map();

app.controller("MapController", function($scope, $http, $sce, $location){

	//url of the db-server:
	$scope.dbServerAddress = $location.absUrl().split(":")[0] + ":" + $location.absUrl().split(":")[1] + ":3000/";

	$scope.sideContent = {};
	$scope.sideContent.template = "";
	$scope.sideContent.textvar = "";
	$scope.sideContent.close = function(){
		$scope.sideContent.template = "";
	}
	$scope.sideContent.change = function(template){
		$scope.sideContent.template = template;
	}

	/********************************
	************ Fields *************
	********************************/

	$scope.fields = {};
	$scope.fields.fieldOrder = fieldOrder;
	$scope.fields.symbols = symbolProperties;
	$scope.fields.symbolsFilter = "";
	$scope.fields.currentField = {};
	$scope.fields.currentField.image = "images/symbols/_universal.svg";
	$scope.fields.currentField.topText = "";
	$scope.fields.currentField.bottomText = "";
	$scope.fields.currentField.commentField = "";
	$scope.fields.currentField.active = false;
	$scope.fields.currentField.id = undefined;
	$scope.fields.currentField.fieldTextTop = "";
	$scope.fields.currentField.fieldTextBottom = "";
	$scope.fields.currentField.fieldComment = "";

	//show the field-properies in the side-content
	$scope.fields.register = function(field){
		$('#' + $scope.fields.currentField.id).removeClass("activated");
		$scope.fields.deleteLastLine($scope.fields.currentField.id);

		// when the clicked field is already the active/current one: deselect it
		if ($scope.fields.currentField.id == field) {
			$scope.fields.currentField.id = undefined;
			$scope.fields.cancel();
			return;
		}

		var _template = "/app/templates/fgis/_fieldContent.html";
		try{$scope.map.editCancel();}catch(e){}
		var thisImage = document.getElementById(field).getElementsByTagName('img');
		$scope.fields.currentField.id = field;
		$scope.fields.currentField.active = true;
		$('#' + $scope.fields.currentField.id).addClass("activated");
		if(thisImage.length == 0){
			if ($scope.map.lastClick !=null){
				$scope.fields.addLine();
			}
			$scope.fields.currentField.image = "images/symbols/_universal.svg";
			$scope.fields.currentField.topText = "";
			$scope.fields.currentField.bottomText = "";
			$scope.fields.currentField.commentField = "";
			$scope.fields.currentField.fieldTextTop = "";
			$scope.fields.currentField.fieldTextBottom = "";
			$scope.fields.currentField.fieldComment = "";
		}
		else {
			$scope.fields.currentField.image = thisImage[0].src;
			console.log(thisImage);
			$scope.fields.currentField.topText = "";
			$scope.fields.currentField.bottomText = "";
			$scope.fields.currentField.commentField = "";
			$scope.fields.currentField.fieldTextTop = document.getElementById('fieldTextTop'+field).innerHTML;
			$scope.fields.currentField.fieldTextBottom = document.getElementById('fieldTextBottom'+field).innerHTML;
			$scope.fields.currentField.fieldComment = document.getElementById('fieldComment'+field).innerHTML;
		}
		$scope.sideContent.change(_template);
	}

	//submit the field
	$scope.fields.submit = function(){
		$scope.fields.currentField.active = false;
		$scope.map.lastClick = null;
		if(linesArray[$scope.fields.currentField.id] != null){
			$('#' + $scope.fields.currentField.id).removeClass("activated");
		}
		var _textTop, _textBottom, _comment, _image;
		_textTop = '<div id="fieldTextTop'
					+ $scope.fields.currentField.id
					+ '" class="fieldText fieldTextTop" style="overflow:hidden" title="' +$scope.fields.currentField.fieldTextTop + '" data-toggle="tooltip">'
					+ $scope.fields.currentField.fieldTextTop
					+ '</div>';

		_textBottom = '<div id="fieldTextBottom'
					+ $scope.fields.currentField.id
					+ '" class="fieldText fieldTextBottom" style="overflow:hidden" title="' +$scope.fields.currentField.fieldTextBottom + '" data-toggle="tooltip">'
					+ $scope.fields.currentField.fieldTextBottom
					+ '</div>';
		_comment = '<div id="fieldComment'
					+ $scope.fields.currentField.id
					+ '" class="fieldComment">'
					+ $scope.fields.currentField.fieldComment
					+ '</div>';

		//insert the image:
		_image = '<img id="image'
					+ $scope.fields.currentField.id
					+ '" draggable="true" ondragstart="drag(event)" src="'
					+ $scope.fields.currentField.image
					+ '" style="height:'
					+ fieldOrder.size
					+ '; width:'
					+ fieldOrder.size
					+ '; background-color: white; text-align: center;" />';
		var _htmlString = _textTop + _textBottom + _comment + _image;
		document.getElementById($scope.fields.currentField.id).innerHTML = _htmlString;
		$scope.sideContent.close();
	}

	$scope.fields.cancel = function(){
		$scope.sideContent.close();
		$scope.fields.currentField.active = false;
		$('#' + $scope.fields.currentField.id).removeClass("activated");
		$scope.fields.deleteLastLine($scope.fields.currentField.id);
	}

	$scope.fields.delete = function(){
		$scope.fields.deleteLine();
		var htmlString = '<div id="fieldTextTop'
						+ $scope.fields.currentField.id
						+ '" class="fieldText fieldTextTop"></div>'
						+ '<div id="fieldTextBottom'
						+ $scope.fields.currentField.id
						+ '" class="fieldText fieldTextBottom"></div>'
						+ '<div id="fieldComment'
						+ $scope.fields.currentField.id
						+ '" class="fieldComment"></div>'
						+ '<svg id="image'
						+ $scope.fields.currentField.id
						+ '" style="height:'
						+ fieldOrder.size
						+ '; width:'
						+ fieldOrder.size
						+ ';"><polygon points="2,2 88,2 88,88 2,88 2,2 2,22.5 88,22.5 88,67.5 2,67.5"/></svg>';
		document.getElementById($scope.fields.currentField.id).innerHTML = htmlString;
		$scope.sideContent.close();
		$scope.fields.currentField.active = false;
		$('#' + $scope.fields.currentField.id).removeClass("activated");
	}

	//filter the list of fields
	$scope.fields.fiterSymbols = function(string){
		console.log("filter: " + string);
		$scope.fields.symbolsFilter = string;
	}

	$scope.fields.addSymbol = function(string){
		$scope.fields.currentField.image = "images/symbols/" + string + ".svg";
	}

	/********** Lines ********/

	$scope.fields.deleteLine = function(){
		linesArray[$scope.fields.currentField.id] = null;
		fitAllLines(linesArray);
	}

	$scope.fields.updateLine = function(){
		if ($scope.fields.currentField.active) {
			$scope.fields.deleteLine();
			$scope.fields.addLine();
		} else {
			$scope.fields.addLine();
		}
	}

	$scope.fields.addLine = function(){
		if ($scope.fields.currentField.id) {
			var anchorPoint = getAnchorOfElement($scope.fields.currentField.id);
			var anchor = map.containerPointToLatLng(anchorPoint);
			var latlngs = [$scope.map.lastClick, anchor];
			if(linesArray[$scope.fields.currentField.id] == null){
				linesArray[$scope.fields.currentField.id] = [$scope.map.lastClick, anchorPoint];
				lines.addLayer(L.polyline(latlngs));
				$scope.fields.currentField.active = true;
				$scope.map.lastClick = null;
			}
		}
	}

	$scope.fields.deleteLastLine = function(oldId){
		if (oldId) {
			var _oldField = document.getElementById(oldId).innerHTML;
			var _oldSplitted = _oldField.split("polygon");
			if (_oldSplitted.length > 1){
				linesArray[oldId] = null;
				fitAllLines(linesArray);
			}
		}
	}

	/********************************
	************** Map **************
	********************************/

	initMap();

	map.on('click', function(e){
		$scope.map.lastClick = e.latlng;
		$scope.fields.updateLine();
	});
	map.on('move', function(e){
		fitAllLines(linesArray);
	});
	map.on('draw:drawstop', function(e){});

	map.on('draw:drawstart', function(e){});

	map.on('draw:created', function (e) {
	    var type = e.layerType,
	        layer = e.layer;
		var id = drawnItems.getLayerId(e);
	    layer.on('click', function(e){$scope.map.objectClicked(type, layer, id)});
	    drawnItems.addLayer(layer);
	});

	$scope.map = {};
	$scope.map.frozen = false;
	$scope.map.lastClick = null;
	$scope.map.objectId = null;

	$scope.map.objectClicked = function(type, layer, id){
		if (!$scope.map.editActive){
			$scope.sideContent.change("/app/templates/fgis/_drawnObject.html");
			$scope.map.objects.getMeasurement(type, layer);
			$scope.map.objectId = id;
			$scope.map.showComment();
			$scope.$apply(function() {});
		}
	}

	$scope.map.zoomIn = function(){
		if (!$scope.map.frozen) {map.zoomIn();};
	}
	$scope.map.zoomOut = function(){
		if (!$scope.map.frozen) {map.zoomOut();};
	}
	$scope.map.freeze = function(){
		if($scope.map.frozen){
			$scope.map.frozen = false;
			map.dragging.enable();
			map.scrollWheelZoom.enable();
			map.touchZoom.enable();
			map.doubleClickZoom.enable();
			map.boxZoom.enable();
			map.keyboard.enable();
			$("#map").css('cursor', '');
			$("#freezeMapLock").css('display', 'none');
			$("#freezeMap").css('color', 'black');
			$(".customZoomControl").css('color', 'black');
		}
		else {
			$scope.map.frozen = true;
			map.dragging.disable();
			map.scrollWheelZoom.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.boxZoom.disable();
			map.keyboard.disable();
			$("#map").css('cursor', 'default');
			$("#freezeMapLock").css('display', 'block');
			$("#freezeMap").css('color', 'grey');
			$(".customZoomControl").css('color', '#ddd');
		}
	}

	/************** Map Layers ************/
	$scope.map.datasets = {};
	$scope.map.datasets.basemaps = new Array();
	$scope.map.datasets.fachkarten = new Array();
	$scope.map.datasets.nonspatial = new Array();
	$scope.map.datasets.nonspatial.current = "";
	$scope.map.layers = {};
	$scope.map.layers.fachkartenIds = new Array();
	$scope.map.layers.alleFachkarten = null;

	$scope.map.showDatasets = function(){
		if ($scope.sideContent.template == "/app/templates/fgis/_datasets.html"){
			$scope.sideContent.change("");
		}
		else {
			$scope.sideContent.change("/app/templates/fgis/_datasets.html");
		}
		try{$scope.map.editCancel();}catch(e){}
		//TODO: datasets einblenden
	}

	$scope.map.initDatasets = function(){
		$http.get($scope.dbServerAddress + 'layers')
			.success(function(response){
				for (var i = response.length - 1; i >= 0; i--) {
					if (response[i].type == "WMS"){
						$scope.map.datasets.basemaps.push(response[i]);
					} else if (response[i].type == "GeoJSON") {
						$scope.map.datasets.fachkarten.push(response[i]);
						$scope.map.datasets.fachkarten[$scope.map.datasets.fachkarten.length-1].visible = false;
					} else if (response[i].type == "CSV") {
						$scope.map.datasets.nonspatial.push(response[i]);
						console.log(response[i]);
					}
				};
			}).error(function(response){});
	}

	$scope.map.bufferFachkarten = function(){
		$http.get($scope.dbServerAddress + 'geojson')
			.success(function(response){
				$scope.map.layers.alleFachkarten = response;
			}).error(function(response){});
	}

	$scope.map.showBasemap = function(name){
		console.log("show basemap: " + name);
		var _layerString = $scope.dbServerAddress + name + '/{z}/{x}/{y}.png';
		var _basemap = L.tileLayer(_layerString);
		basemap.clearLayers();
		basemap.addLayer(_basemap);
	}

	$scope.map.showDefaultBasemap = function(){
		basemap.clearLayers();
	}

	$scope.map.showFachkarte = function(id){
		if($scope.map.datasets.fachkarten[id].visible){
			$scope.map.datasets.fachkarten[id].visible = false;
			$scope.map.layers.fachkartenIds[id] = null;
		} else {
			$scope.map.datasets.fachkarten[id].visible = true;
			$scope.map.layers.fachkartenIds[id] = $scope.map.datasets.fachkarten[id].info;
		}
		console.log($scope.map.layers.fachkartenIds);
		redrawFachkarten($scope.map.layers);
	}

	$scope.map.showNonspatial = function(id){
		$scope.map.datasets.nonspatial.current = $scope.map.datasets.nonspatial[id].info;
		var _template = "/app/templates/fgis/_nonspatial.html";
		try{$scope.map.editCancel();}catch(e){}
		$scope.sideContent.change(_template);
	}

	$scope.map.initDatasets();
	$scope.map.bufferFachkarten();

	/************** Map draw ************/

	$scope.map.editActive = false;
	$scope.map.currentEdit = "";

	$scope.map.draw = function(type){
		$scope.fields.cancel();
		var _className = 'leaflet-draw-draw-' + type;
		var _element = document.getElementsByClassName(_className);
		_element[0].click();
	}

	$scope.map.deleteObjects = function(){
		$scope.map.editActive = true;
		$scope.map.currentEdit = "leaflet-draw-actions leaflet-draw-actions-bottom";
		var _element = document.getElementsByClassName("leaflet-draw-edit-remove");
		_element[0].click();
		$scope.sideContent.textvar = "Die zu löschenden Objekte bitte anklicken";
		$scope.sideContent.change("/app/templates/fgis/_editObjects.html");
	}

	$scope.map.editObjects = function(){
		$scope.map.editActive = true;
		$scope.map.currentEdit = "leaflet-draw-actions leaflet-draw-actions-top";
		var _element = document.getElementsByClassName("leaflet-draw-edit-edit");
		_element[0].click();
		$scope.sideContent.textvar = "Objekte bearbeiten";
		$scope.sideContent.change("/app/templates/fgis/_editObjects.html");
		$scope.map.objectId = "";
	}


	$scope.map.objects = {};
	$scope.map.objects.measureString = "";
	$scope.map.objects.type = "";
	$scope.map.objects.comment = "";
	// todo kommentar wird geändert -- alten eintrag erst löschen oder wird in der map überschrieben?

	// save a comment for a drawn object using a map (first value: ObjectId from leafletDraw, second value: commentText)
	$scope.map.saveComment = function(){
		commentsMap.set($scope.map.objectId, $scope.map.objects.comment);
	}

	$scope.map.showComment = function(){
		var _template = "/app/templates/fgis/_drawnObject.html";
		$scope.map.objects.comment = commentsMap.get($scope.map.objectId);
		$scope.sideContent.change(_template);
	}

	$scope.map.editCancel = function(){
		$scope.map.editActive = false;
		var _element = document.getElementsByClassName($scope.map.currentEdit);
		_element[0].children[1].children[0].click();
		$scope.map.objectId = "";
		$scope.sideContent.close();
	}

	$scope.map.editSave = function(){
		$scope.map.editActive = false;
		var _element = document.getElementsByClassName($scope.map.currentEdit);
		_element[0].children[0].children[0].click();
		$scope.map.objectId = "";
		commentsMap.delete($scope.map.objectId);
		$scope.sideContent.close();
	}

	$scope.map.objects.getMeasurement = function(type, layer){
		var _htmlString = "";
		var _area = null;
		var _length = null;
		var _latlng = null;
		var _radius = null;
		var _type = "";

		switch (type){
			case "rectangle":
				_latlng = layer.getLatLngs();
				_type = "Typ: Rechteck";
				_area = L.GeometryUtil.geodesicArea(_latlng);
				break;
			case "polygon":
				_latlng = layer.getLatLngs();
				_type = "Typ: Polygon";
				_area = L.GeometryUtil.geodesicArea(_latlng);
				break;
			case "circle":
				_latlng = layer.getLatLng();
				_radius = layer.getRadius();
				_type = "Typ: Kreis";
				_area = Math.PI * _radius * _radius;
				break;
			case "polyline":
				_latlng = layer.getLatLngs();
				_type = "Typ: Polylinie";
				_length = L.GeometryUtil.accumulatedLengths(_latlng);
				var _length = _length[_length.length-1];
				break;
			case "marker":
				_latlng = layer.getLatLng();
				_type = "Typ: Punkt";
				break;
		}

		if (_area != null) {
			if (_area < 1000000){
				_htmlString = "Fläche: "
								+ (Math.floor(_area))
								+ "m<sup>2</sup><br>"
								+ " / "
								+ (Math.floor(_area/100)/100)
								+ "ha";
			} else {
				_htmlString = "Fläche: "
								+ (Math.floor(_area/100)/100)
								+ "ha"
								+ " / "
								+ (Math.floor(_area/10000)/100)
								+ "km<sup>2</sup><br>";
			}
		};
		if (_length != null) {
			if (_length < 10000){
				_htmlString = "Länge: "
								+ (Math.floor(_length))
								+ "m";
			} else {
				_htmlString = "Länge: "
								+ (Math.floor(_length/100)/10)
								+ "km";
			}
		};
		$scope.map.objects.measureString = $sce.trustAsHtml(_htmlString);
		$scope.map.objects.type = _type;
	}
});

/**
 * @desc calculates coordinates for the anchor point (centered to the TZ slot) of the lines to be drawn correctly on map
 * @param elementID: ID of html element for which anchor point will get calculated.
 * @return calculated coordinates
 */
function getAnchorOfElement(elementId){
	var _this = $("#"+elementId);
	var _map = $("#map");
	var _titleRow = $("#titleRow");
	var _mapTop = parseInt(_map.css('top'), 10) + parseInt(_titleRow.css('height'), 10);
	var _mapLeft = parseInt(_map.css('left'), 10);
	var _mapWidth = parseInt(_map.css('width'), 10);
	var _mapHeight = parseInt(_map.css('height'), 10);
	var offset = _this.offset();
	var width = _this.width();
	var height = _this.height();
	var centerX = offset.left + width / 2;
	var centerY = offset.top + height / 2;

	//left column:
	if(centerX < _mapLeft){return [2, centerY - _mapTop]}
	//right column:
	else if (centerX > _mapLeft + _mapWidth - 1) {return [offset.left - _mapLeft, centerY - _mapTop]}
	//top row:
	else if (centerY < _mapTop + 1 ) {return [centerX - _mapLeft, 2]}
	// bottom row:
	else if (centerY > _mapTop + _mapHeight - 1) {return [centerX - _mapLeft, offset.top - _mapTop]}

}

/****************************************
************** Map Stuff ****************
*****************************************/

function initMap(){
	map = L.map('map', {
		zoomControl: true
	}).setView([51.95, 7.6], 13);
	L.control.scale({
		position: 'bottomright',
		metric: true,
		imperial: false
		}).addTo(map);

	var _osmmap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
	var _wmsLayer = L.tileLayer.wms("http://www.wms.nrw.de/geobasis/wms_nw_dtk", {
	    layers: "nw_dtk_pan",
	    format: 'image/png',
	    transparent: false
	});
	_wmsLayer.addTo(map);

	lines = L.layerGroup().addTo(map);
	fachkarten = L.layerGroup().addTo(map);
	basemap = L.layerGroup().addTo(map);

	drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);


		var options = {
		    position: 'topright',
		    draw: {
		      polyline: {
		        shapeOptions: {
		          color: '#ff0000',
		          clickable: true
		        }
		      },
		      polygon: {
		        allowIntersection: true,
		        shapeOptions: {
		          color: '#ff0000',
		          clickable: true
		        },
		        showArea: true,
		      },
		      rectangle: {
		        shapeOptions: {
		          clickable: false,
		          color: '#ff0000'
		        }
		      },
		      marker: {
		        shapeOptions: {
							clickable: false //doesn´t work, why?!
						}
		      },
		      circle: {
		        shapeOptions: {
		          color: '#ff0000',
		          clickable: false
		        }
		      }
		    },
		    edit: {
		      featureGroup: drawnItems, //REQUIRED!!
		      remove: true
		    }
		  };


	var drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);

}

function redrawFachkarten(karten){
	var _alle = karten.alleFachkarten;
	var _selected = karten.fachkartenIds;
	fachkarten.clearLayers();
	for (var i = _selected.length - 1; i >= 0; i--) {
		try {
			for (var j = _alle.length - 1; j >= 0; j--) {
				if (_alle[j]._id == _selected[i]){
					L.geoJson(_alle[j]).addTo(fachkarten);
				}
			};
			//fachkarten.addLayer(L.polyline(latlngs));
		} catch(e){
			// do nothing, because the kartenarray will have holes
		}
	};
}

//fuction to relocate all lines to their anchor-points
function fitAllLines(linesArray){
	lines.clearLayers();
	for (var i = linesArray.length - 1; i >= 0; i--) {
		try {
			var p1 = linesArray[i][0];
			var p2 = map.containerPointToLatLng(linesArray[i][1]);
			var latlngs = [p1, p2];
			lines.addLayer(L.polyline(latlngs));
		} catch(e){
			// do nothing, because the linesArray will have holes
		}
	};
}

/****************************************
************ Drag and Drop **************
*****************************************/

function drag(ev){
	var startId = ev.target.id.split("e");
	ev.dataTransfer.setData("text", startId[1]);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev){
	if(ev.preventDefault)  ev.preventDefault();
	if(ev.stopPropagation) ev.stopPropagation();

	var startId = ev.dataTransfer.getData("text");
	var movingElement = document.getElementById("image" + startId);
	var startElement = document.getElementById(startId);

	// we drop onto the fieldText or svg, so we need to access the parent field-div
	var targetElement = ev.target.parentNode;
	// if we drop onto the svg polygon element, we need to go one level higher
	if (!$(targetElement).hasClass('fields'))
		targetElement = targetElement.parentNode;
	var targetId = targetElement.id;

	//save the texts:
	console.log('element dropped: ' + startId + " -> " + targetElement.id)
	var _textTopTarget = document.getElementById('fieldTextTop'+targetId).innerHTML;
	var _textBottomTarget = document.getElementById('fieldTextBottom'+targetId).innerHTML;
	var _commentTarget = document.getElementById('fieldComment'+targetId).innerHTML;
	var _textTopStart = document.getElementById('fieldTextTop'+startId).innerHTML;
	var _textBottomStart = document.getElementById('fieldTextBottom'+startId).innerHTML;
	var _commentStart = document.getElementById('fieldComment'+startId).innerHTML;

	//change the images and texts:
	var movingBackElement = document.getElementById("image" + targetId);
	startElement.innerHTML = '<div id="fieldTextTop'
		+ startId
		+ '" class="fieldText fieldTextTop" style="overflow:hidden" title="'
		+ _textTopTarget + '" data-toggle="tooltip">'
		+ _textTopTarget
		+ '</div><div id="fieldTextBottom'
		+ startId
		+ '" class="fieldText fieldTextBottom" style="overflow:hidden" title="'
		+ _textBottomTarget + '" data-toggle="tooltip">'
		+ _textBottomTarget
		+ '</div><div id="fieldComment'
		+ startId
		+ '" class="fieldComment">'
		+ _commentTarget
		+ '</div>';
	startElement.appendChild(movingBackElement);
	targetElement.innerHTML = '<div id="fieldTextTop'
		+ targetId
		+ '" class="fieldText fieldTextTop" style="overflow:hidden" title="'
		+ _textTopStart + '" data-toggle="tooltip">'
		+ _textTopStart
		+ '</div><div id="fieldTextBottom'
		+ targetId
		+ '" class="fieldText fieldTextBottom" style="overflow:hidden" title="'
		+ _textBottomStart + '" data-toggle="tooltip">'
		+ _textBottomStart
		+ '</div><div id="fieldComment'
		+ targetId
		+ '" class="fieldComment">'
		+ _commentStart
		+ '</div>';
	targetElement.appendChild(movingElement);
	movingElement.setAttribute("id", "image" + targetId);
	if (movingBackElement != null) {movingBackElement.setAttribute("id", "image" + startId)};

	//change the lines:
	var newTargetLine = linesArray[startId];
	if (newTargetLine != null) {newTargetLine[1] = getAnchorOfElement(targetId)};

	var newStartLine = linesArray[targetId];
	if (newStartLine != null) {newStartLine[1] = getAnchorOfElement(startId)};

	linesArray[startId] = newStartLine;
	linesArray[targetId] = newTargetLine;
	fitAllLines(linesArray);

	// update the active highlight, if the dragged field was active
	// TODO: update $scope.fields.currentField.id somehow
	//       or: call submit before dropping!
	/*if ($('#' + startId).hasClass("activated")) {
		$('#' + startId).removeClass("activated");
		$('#' + targetId).addClass("activated");
	}*/
}
