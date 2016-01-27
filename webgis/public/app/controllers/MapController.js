var app = angular.module("fgis");
var map, drawnItems, drawControl, fachkarten, basemap;
var lines,
	linesArray = new Array();
var commentsMap = new Map();
var options;
var drawControl;
var objectColor = "#f00";

app.controller("MapController", function($scope, $http, $sce, $location){

	//url of the db-server:
	$scope.dbServerAddress = $location.absUrl().split(":")[0] + ":" 
        + $location.absUrl().split(":")[1] + ":8080/";

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
	********  loading/saving ********
	********************************/
    
    // object that will contain the current state on save
    $scope.einsatz = {
        _id: '',
        meta: { // filled via ng-model
            einsatzstichwort: '',
            einsatzort: '',
            meldender: '',
            objektNr: '',
            datumUhrzeitGruppe: '',
        },
        // rest will be filled on save()
        drawnObjects: [],
        taktZeichen: [],
        map: {
            zoom: 12,
            center: {},
            tileServer: ''
        }
    };
    
    /* serializes the current state into $scope.einsatz & pushs it to the DB server */
    $scope.saveEinsatz = function() {
        if (!$scope.einsatz.meta.objektNr) return alert('Vor dem Speichern bitte die Objektnummer angeben!'); 
        // copy field data into $scope.einsatz.fields
        $scope.einsatz.taktZeichen = [];
        for (var i = 0; i < $scope.fields.fieldOrder.properties.length; i++) {
            var kranzPos = $scope.fields.fieldOrder.properties[i].id;
            var line = linesArray[kranzPos];
            
            $scope.einsatz.taktZeichen.push({
                kranzposition: kranzPos,
                kartenposition: line ? line[0] : '',
                zeichen:    $('#image' + kranzPos).attr('src') || '', // TODO: use zeichenID from DB instead of filename? 
                comment:    $('#fieldComment' + kranzPos).text() || '',
                textTop:    $('#fieldTextTop' + kranzPos).text() || '',
                textBottom: $('#fieldTextBottom' + kranzPos).text() || ''
            });
        }
        
        // push drawn object data into $scope.einsatz.drawnObjects
        $scope.einsatz.drawnObjects = [];
        drawnItems.eachLayer(function(layer) {
            var geojson = layer.toGeoJSON();
            geojson.properties.comment = commentsMap.get(drawnItems.getLayerId(layer)) || '';
            geojson.properties.color = layer.options.color || '';
            // as leaflet draw serializes a circle as a point, we need to store the radius manually.
            if (layer._mRadius) geojson.properties.circleRadius = layer._mRadius;
            $scope.einsatz.drawnObjects.push(geojson); 
        });
        
        // save map state
        $scope.einsatz.map.zoom = map.getZoom();
        $scope.einsatz.map.center = map.getCenter();
        $scope.einsatz.map.tileServer = ''; // TODO: basemap functionality needs to be reworked first
        
        // submit einsatz object to server
        function pushEinsatz() {
			$http.post($scope.dbServerAddress + 'api/einsatz/' + $scope.einsatz.id, $scope.einsatz)
            .then(function success(res) {
                console.log('einsatz was saved in database!');
                window.location.hash = '#/map/' + $scope.einsatz.id;
            }, function error(res) {
                console.error('einsatz could not be stored in database: ' + res);
            });
        };
        
		// push einsatz to database
		if (!$scope.einsatz.id) {
            // if no ID is present, request a new einsatz from the DB first
			$http.get($scope.dbServerAddress + 'api/einsatz/new')
                .then(function successCallback(response) {			
                    $scope.einsatz.id = response.data.id;
                    console.log("Einsatz angelegt mit der ID: " + $scope.einsatz.id);
                    //submit einsatz object to server
                    pushEinsatz();
                }, function errorCallback(response) {
                    console.log("FEHLER: Neuer Einsatz konnte nicht angelegt werden");
                });
		} else {
            pushEinsatz();
        }
    };
	
    /* fills the table of available einsätzes from DB */
	$scope.showLoadMenu = function(){
        $scope.sideContent.change("/app/templates/fgis/loadMenu.html");
		try{$scope.map.editCancel();}catch(e){}
        
        // get all available einsätze from DB & show them in the table
        $http.get($scope.dbServerAddress + 'api/einsatz')
            .then(function successCallback(response) {                
                $('#einsatzTable').empty();
                for (var i = 0; i < response.data.length; i++) {
                    var einsatz = response.data[i];
                    var tableRow = $('<tr onclick="window.location=\'/#/map/' + einsatz.id + '\'"><td>'
                        + einsatz.meta.einsatzstichwort + '</td><td>'
                        + einsatz.meta.einsatzort + '</td><td>'
                        + einsatz.meta.meldender + '</td><td>'
                        + einsatz.meta.objektNr + '</td><td>'
                        + einsatz.meta.datumUhrzeitGruppe + '</td></tr>');

                    $('#einsatzTable').append(tableRow);
                }
                $("#einsatzTable").trigger("update");
            }, function errorCallback(response) {
                console.log("misserfolg: " + response);
            });
	}
    
    /* loads a einsatz identified by its ID */
    $scope.loadEinsatz = function(id) {
        $http.get($scope.dbServerAddress + 'api/einsatz/' + id)
            .then(function successCallback(response) {
                updateState(response.data);
            }, function errorCallback(response) {
                console.error('Einsatz konnte nicht geladen werden: ' + response);
            });
            
        function updateState(einsatz) {
            $scope.einsatz = einsatz;
            
            // insert drawnObjects
            for (var i = 0; i < $scope.einsatz.drawnObjects.length; i++) {
                // convert geojson -> FeatureGroup -> ILayer
			    var geojson = $scope.einsatz.drawnObjects[i];
			    var featureGroup = L.geoJson(geojson);
                var layer = featureGroup.getLayers()[0]; // extract the first (and only) layer from the fGroup
                layer.options.style = { color: geojson.properties.color };
                layer.options.color = geojson.properties.color;
                drawnItems.addLayer(layer);
				
                // register comment
                var layerID = drawnItems.getLayerId(layer);
                commentsMap.set(layerID, geojson.properties.comment);
                
                // register click events
                layer.on('click', function(e){
                    $scope.map.objectClicked(e.target.feature.geometry.type, e.target, e.target._leaflet_id);
                });
            }

            // make layers unclickable by default
            drawnItems.eachLayer(function(layer) {
                setClickable(layer, false);
            });
            
            // upate mapstate
            map.setView($scope.einsatz.map.center, $scope.einsatz.map.zoom);
            // TODO: tileserver?
            
            // setze taktische zeichen in karte
            for (var i = 0; i < $scope.einsatz.taktZeichen.length; i++) {
                var field = $scope.einsatz.taktZeichen[i];
               
				var fieldHtml = getFieldHtmlString(field.kranzposition, field.zeichen,
                    field.comment, field.textTop, field.textBottom);
                
				$('#' + field.kranzposition).html(fieldHtml);
				
                // field line / kartenposition
                if (field.kartenposition == '') continue; // field has no kartenposition
                var anchorPoint = getAnchorOfElement('image' + field.kranzposition);
                var anchor = map.containerPointToLatLng(anchorPoint);
                var latlngs = [field.kartenposition, anchor];
                linesArray[field.kranzposition] = [field.kartenposition, anchorPoint];
                lines.addLayer(L.polyline(latlngs));
            }
        }
    };

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


	/**
	* @desc activates a tz slot, shows the field-properties in the side-content
	*/
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
		$('#' + $scope.fields.currentField.id).addClass("activated"); //highlight

		drawnItems.eachLayer(function(layer) {
			setClickable(layer, false);
		});

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
			$scope.fields.currentField.topText = "";
			$scope.fields.currentField.bottomText = "";
			$scope.fields.currentField.commentField = "";
			$scope.fields.currentField.fieldTextTop = document.getElementById('fieldTextTop'+field).innerHTML;
			$scope.fields.currentField.fieldTextBottom = document.getElementById('fieldTextBottom'+field).innerHTML;
			$scope.fields.currentField.fieldComment = document.getElementById('fieldComment'+field).innerHTML;
		}
		$scope.sideContent.change(_template);
	}

	//submit the field ('bestaetigen')
	$scope.fields.submit = function(){
		$scope.fields.currentField.active = false;
		$scope.map.lastClick = null;
		if(linesArray[$scope.fields.currentField.id] != null){
			$('#' + $scope.fields.currentField.id).removeClass("activated");
		}
        
        var fieldHtml = getFieldHtmlString(
            $scope.fields.currentField.id,
            $scope.fields.currentField.image,
            $scope.fields.currentField.fieldComment,
            $scope.fields.currentField.fieldTextTop,
            $scope.fields.currentField.fieldTextBottom
        );
		
		document.getElementById($scope.fields.currentField.id).innerHTML = fieldHtml;
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
        
        var fieldHtml = getFieldHtmlString($scope.fields.currentField.id);
		document.getElementById($scope.fields.currentField.id).innerHTML = fieldHtml;
        
		$scope.sideContent.close();
		$scope.fields.currentField.active = false;
		$('#' + $scope.fields.currentField.id).removeClass("activated");
		$scope.fields.currentField.id = null;
	}

	//filter the list of fields
	$scope.fields.fiterSymbols = function(string){
		console.log("filter: " + string);
		$scope.fields.symbolsFilter = string;
	}
    
	/**
	* @desc changes symbol in tz
	* @param string: string for new symbol location
	**/
	$scope.fields.addSymbol = function(string){
		$scope.fields.currentField.image = "images/symbols/" + string + ".svg";
		document.getElementById('image'+ $scope.fields.currentField.id).src = $scope.fields.currentField.image;
	}

	/********** Lines ********/

	$scope.fields.deleteLine = function() {
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
	var itemDrawed = false; //ignore setting last click for tz line if last click was for drawing
	map.on('click', function(e){
		if(!itemDrawed){
			$scope.map.lastClick = e.latlng;
			$scope.fields.updateLine();
		}
		else{
			$scope.map.lastClick = null;
			itemDrawed = false;
		}
	});
	map.on('move', function(e){
		fitAllLines(linesArray);
	});
	map.on('draw:drawstop', function(e){});

	map.on('draw:drawstart', function(e){});

	map.on('draw:created', function (e) {
	    var type = e.layerType,
	        layer = e.layer;
		var id = drawnItems.getLayerId(layer);
	    layer.on('click', function(e){$scope.map.objectClicked(type, layer, id)});
		$scope.map.lastClick = null;
		itemDrawed = true;
		drawnItems.addLayer(layer);
	});

	$scope.map = {};
	$scope.map.frozen = false;
	$scope.map.lastClick = null;
	$scope.map.objectId = null;
	$scope.hideColorPicker = false;		
	
	$scope.map.objectClicked = function(type, layer, id){		
		if (!$scope.map.editActive){
			drawnItems.eachLayer(function(layer) {
				setClickable(layer, false);
			});

			// hide colorPicker if the selected object is a marker
			if(type == "marker" || type.toLowerCase() == "point") {
				$scope.hideColorPicker = true;
			} else {
				$scope.hideColorPicker = false;
			}

			$scope.map.objects.getMeasurement(type, layer);
			$scope.map.objectId = id;

			// show the current color of the selected object in the colorPicker
			objectColor = drawnItems.getLayer($scope.map.objectId).options.color;
			$("#colorPicker").spectrum({
				color: objectColor,
				change: function(color) {
					newColor = color.toHexString();
				}
			});

			$scope.sideContent.change("/app/templates/fgis/_drawnObject.html");
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
		$scope.fields.currentField.id = undefined;
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

	$scope.map.activateDrawInformation = function(){
		drawnItems.eachLayer(function(layer) {
			setClickable(layer, true);
		});
	}
    
	$scope.map.objects = {};
	$scope.map.objects.measureString = "";
	$scope.map.objects.type = "";
	$scope.map.objects.comment = "";

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

	// change the color of the choosen object
	$scope.map.changeObjectsColor = function() {
		drawnItems.getLayer($scope.map.objectId).setStyle({color: newColor});
	}

		$scope.map.objects.getMeasurement = function(type, layer){
		var _htmlString = "";
		var _area = null;
		var _length = null;
		var _latlng = null;
		var _radius = null;
		var _type = "";

        // type can be a leaflet type, or a GeoJSON type, so we have to catch both
		switch (type.toLowerCase()) {
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
			case "linestring":
				_latlng = layer.getLatLngs();
				_type = "Typ: Polylinie";
				_length = L.GeometryUtil.accumulatedLengths(_latlng);
				var _length = _length[_length.length-1];
				break;
			case "marker":
			case "point":
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
    
    $scope.$on('$viewContentLoaded', function(){
        var einsatzID = window.location.hash.split('/').pop();
        if (['', 'map'].indexOf(einsatzID) == -1) $scope.loadEinsatz(einsatzID);
    });
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


		options = {
		    position: 'topright',
		    draw: {
		      polyline: {
		        shapeOptions: {
		          color: '#ff0000',
		          clickable: false
		        }
		      },
		      polygon: {
		        allowIntersection: true,
		        shapeOptions: {
		          color: '#ff0000',
		          clickable: false
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


	drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);	
}

/**
* @desc sets option 'clickable' for a leaflet layer to value
*/
function setClickable(target, value) {
	// ignore if marker
	if (target instanceof L.Marker){
        return;
    }

	if(value && !target.options.clickable) {
		target.options.clickable = true;
		L.Path.prototype._initEvents.call(target);
		target._path.removeAttribute('pointer-events');
	} else if(!value && target.options.clickable) {
		target.options.clickable = false;
		// undoing actions done in L.Path.prototype._initEvents
		L.DomUtil.removeClass(target._path, 'leaflet-clickable');
		L.DomEvent.off(target._container, 'click', target._onMouseClick);
    	['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'].forEach(function(evt) {
		L.DomEvent.off(target._container, evt, target._fireMouseEvent);
		});
			target._path.setAttribute('pointer-events', target.options.pointerEvents || 'none');
	}

	//change cursor icon to 'help' if clickable is true
	if(value){
		$("#map").css('cursor', 'help');
	}
	else{
		$("#map").css('cursor', 'auto');
	}
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
	var _imageTarget      = $('#image' + targetId).attr('src');
	var _textTopTarget    = $('#fieldTextTop' + targetId).html();
	var _textBottomTarget = $('#fieldTextBottom' + targetId).html();
	var _commentTarget    = $('#fieldComment' + targetId).html();
	var _imageStart       = $('#image' + startId).attr('src');
	var _textTopStart     = $('#fieldTextTop' + startId).html();
	var _textBottomStart  = $('#fieldTextBottom' + startId).html();
	var _commentStart     = $('#fieldComment' + startId).html();

	//swap the images and texts
	startElement.innerHTML = getFieldHtmlString(
        startId, _imageTarget, _commentTarget,
        _textTopTarget, _textBottomTarget
    );

    targetElement.innerHTML = getFieldHtmlString(
        targetId, _imageStart, _commentStart,
        _textTopStart, _textBottomStart
    );
    
	//swap the lines:
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

/**
 * @desc    generates the html string for a field, identified by its kranzposition
 * @returns html string to be placed within the fields div
 * @example $('<div class="field" id="12"</div>').append(getFieldHtmlString('12'));
 */
function getFieldHtmlString(kranzposition, svgPath = '', comment = '', textTop = '', textBottom = '') {

    var _textTop = '<div id="fieldTextTop' + kranzposition
        + '" class="fieldText fieldTextTop" style="overflow:hidden" title="'
        + textTop + '" data-toggle="tooltip">' + textTop + '</div>';
        
    var _textBottom = '<div id="fieldTextBottom' + kranzposition
        + '" class="fieldText fieldTextBottom" style="overflow:hidden" title="'
        + textBottom + '" data-toggle="tooltip">' + textBottom + '</div>';
        
    var _comment = '<div id="fieldComment' + kranzposition + '" class="fieldComment">'
        + comment + '</div>';

    // insert TZ if a path is given, else create a "NA" polygon
    if (svgPath) {
        var _image = '<img id="image' + kranzposition + '" draggable="true" ondragstart="drag(event)" src="'
            + svgPath + '" style="height:' + fieldOrder.size + '; width:' + fieldOrder.size
            + '; background-color: white; text-align: center;" />';
    } else {
        var _image = '<svg id="image' +  kranzposition + '" viewBox="0 0 89 89" preserveAspectRatio="none" style="height:'
            + fieldOrder.size + '; width:' + fieldOrder.size
            + ';"><polygon points="2,2 88,2 88,88 2,88 2,2 2,22.5 88,22.5 88,67.5 2,67.5"/></svg>';
    }
   
    return _textTop + _textBottom + _comment + _image;		
}
