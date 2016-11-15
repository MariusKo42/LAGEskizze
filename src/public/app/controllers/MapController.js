var app = angular.module("fgis");
var map, drawnItems, drawControl, basemap, dashStyle, newColor;
var lines,
	linesArray = [];
var commentsMap = new Map();
var objectColor = "#f00";

app.controller("MapController", function($scope, $http, $sce, $location){
    // url of the local server
    $scope.localAddress = 'http://localhost:1337/';

    $scope.sideContent = {};
	$scope.sideContent.template = "";
	$scope.sideContent.textvar = "";
	$scope.sideContent.close = function(){
		$scope.sideContent.template = "";
	};
	$scope.sideContent.change = function(template){
		$scope.sideContent.template = template;
	};

    // Emitted every time the ngInclude content is reloaded.
    $scope.$on('$includeContentLoaded', function(event, target){
        // Only when the page is loaded the elements from the database can be displayed.
        if (target.includes('loadMenu')) {
            $scope.showLoadMenu();
        // Only when the page is loaded the color can be set
        } else if (target.includes('_drawnObject')) {
            $scope.setColorPicker();
        }
    });

	/********************************
	********  loading/saving ********
	********************************/

	// object that will contain the current state on save
	$scope.einsatz = {
		id: 0,
		meta: { // filled via ng-model
			einsatzstichwort: '',
			einsatzort: '',
			meldender: '',
			objektNr: '',
			datumUhrzeitGruppe: ''
		},
		// rest will be filled on save()
		drawnObjects: [],
		taktZeichen: [],
		map: {
			zoom: 0,
			center: {},
			tileServer: '' // basemap layer
		}
	};
    /**
     * A new mission is created. The existing lines are removed.
     */
    $scope.newMission = function () {
    	lines.clearLayers();
        linesArray = [];
        window.location.hash = '/';
    };

	/**
	 * The current dataset is removed from the database.
     */
	$scope.deleteEntry = function () {
		if ($scope.einsatz.id) {
			$http.delete($scope.localAddress + 'api/deleteEntry/' + $scope.einsatz.id)
				.then(function successCallback(response) {
					if (response.data.result) {
                        lines.clearLayers();
                        linesArray = [];
						// Initial state
						window.location.hash = '#/map/';
					}
				});
		}
	};

	/**
	* serializes the current state into $scope.einsatz & pushs it to the DB server
	*/
	$scope.saveEinsatz = function() {
		// Mandatory fields
		if (!$scope.einsatz.meta.einsatzstichwort || !$scope.einsatz.meta.einsatzort || !$scope.einsatz.meta.meldender || !$scope.einsatz.meta.objektNr || !$scope.einsatz.meta.datumUhrzeitGruppe) {
			return alert('Die Felder Einsatzstichwort, Einsatzort, Meldender, Objektnr und Uhrzeitgruppe sind erforderlich.');
		}

        // If an id already exists, a current entry is edited
        if (!$scope.einsatz.id) {
            // Date.now() - current timestamp in ms
            $scope.einsatz.id = Date.now();
        }
		// copy field data into $scope.einsatz.fields
		$scope.einsatz.taktZeichen = [];
		for (var i = 0; i < $scope.fields.fieldOrder.properties.length; i++) {
			var kranzPos = $scope.fields.fieldOrder.properties[i].id;
			var line = linesArray[kranzPos];

			$scope.einsatz.taktZeichen.push({
				kranzposition: kranzPos,
				kartenposition: line ? line[0] : '',
				zeichen:    $('#image' + kranzPos).attr('src') || '',
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
		$scope.einsatz.map.tileServer = '';

        /**
         * A new entry is added to the database.
         */
		function postEntry() {
			$http.post($scope.localAddress + 'api/addEntry/', $scope.einsatz)
                .then(function successCallback(response) {
                    if (response.data.result) {
                        // The table is updated
                        $scope.showLoadMenu();
                        window.location.hash = '#/map/' + $scope.einsatz.id;
                    }
                });
		}

        /**
         * An existing entry is updated.
         */
        function updateEntry() {
        	if ($scope.einsatz.id) {
				$http.put($scope.localAddress + 'api/updateEntry/' + $scope.einsatz.id, $scope.einsatz)
					.then(function successCallback(response) {
						if (response.data.result) {
							// The table is updated
							$scope.showLoadMenu();
						}
					});
			}
        }
		if ($scope.einsatz.id) {
			$http.get($scope.localAddress+ 'api/getEntry/' + $scope.einsatz.id)
				.then(function successCallback(response) {
					if (response.data.result) {
						updateEntry();
					} else {
						postEntry();
					}
				});
		}
	};
    /**
     * If "Save / Load" is activated, a new HTML document will be loaded.
     */
	$scope.addLoadMenuHtml = function () {
        $scope.fields.cancel();
        $scope.sideContent.change("app/templates/fgis/loadMenu.html");
        try{$scope.map.editCancel();}catch(e){}
    };
	/**
	* fills the table of available einsätzes from DB
 	*/
	$scope.showLoadMenu = function(){
		$http.get($scope.localAddress + 'api/getAllEntries/')
			.then(function successCallback(response) {
				$('#einsatzTable').empty();
				for (var i = 0; i < response.data.length; i++) {
					var einsatz = response.data[i];
					var tableRow = $('<tr onclick="window.location.hash=\'/#/map/' + einsatz.id + '\'"><td>'
						+ einsatz.meta.einsatzstichwort + '</td><td>'
						+ einsatz.meta.einsatzort + '</td><td>'
						+ einsatz.meta.meldender + '</td><td>'
						+ einsatz.meta.objektNr + '</td><td>'
						+ einsatz.meta.datumUhrzeitGruppe + '</td></tr>');
					$('#einsatzTable').append(tableRow);
				}
				$("#einsatzTable").trigger("update");
			});
	};

    /**
     * Show the current color of the selected object in the colorPicker
     * Function is called when the document is already loaded
     */
	$scope.setColorPicker = function() {
        objectColor = drawnItems.getLayer($scope.map.objectId).options.color;
        dashStyle = drawnItems.getLayer($scope.map.objectId).options.dashArray;
        $("#colorPicker").spectrum({
            color: objectColor,
            change: function(color) {
                newColor = color.toHexString();
            }
        });
        // Checkbox will be checked if the dashStyle is set
        if (dashStyle === null) $('#dashed').prop('checked', false);
        else $('#dashed').prop('checked', true);
    };

	/**
	 * loads a einsatz identified by its ID
	 */
	$scope.loadEinsatz = function(id) {
	    if (!isNaN(parseInt(id))) {
            $http.get($scope.localAddress + 'api/getEntry/' + id)
                .then(function successCallback(response) {
                    if (response.data.result) updateState(response.data.metadata);
                });
        }

		function updateState(einsatz) {
			// store new einsatz data in $scope.einsatz reset from previous state
			$scope.einsatz = einsatz;
			lines.clearLayers();
			linesArray = [];
			drawnItems.clearLayers();

			// insert drawnObjects
			for (var i = 0; i < $scope.einsatz.drawnObjects.length; i++) {
				// convert geojson -> FeatureGroup -> ILayer
				var geojson = $scope.einsatz.drawnObjects[i];
				var featureGroup = L.geoJson(geojson, {
					pointToLayer: function(json, latlng) {
						if(json.properties.circleRadius) {
							return new L.circle(latlng, json.properties.circleRadius, {
								fillColor: json.properties.color,
								color: json.properties.color,
								weight: 5
							});
						} else { return new L.marker(latlng); }
					}
				});
				var layer = featureGroup.getLayers()[0]; // extract the first (and only) layer from the fGroup
				layer.options.style = { color: geojson.properties.color };
				layer.options.color = geojson.properties.color;
				if (geojson.properties.circleRadius) layer.feature.geometry.type = 'circle';
				drawnItems.addLayer(layer);

				// register comment
				var layerID = drawnItems.getLayerId(layer);
				commentsMap.set(layerID, geojson.properties.comment);

				// register click events
				layer.on('click', function(e){
					console.log(e.target);
					$scope.map.objectClicked(e.target.feature.geometry.type, e.target, e.target._leaflet_id);
				});
			}

			// make layers unclickable by default
			drawnItems.eachLayer(function(layer) {
				setClickable(layer, false);
			});

			// upate mapstate
			map.setView($scope.einsatz.map.center, $scope.einsatz.map.zoom);
			// TODO: basemap

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
			$scope.fields.cancel();
			return;
		}

		var _template = "app/templates/fgis/_fieldContent.html";
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
        $scope.map.lastClick = null;
		$('#' + $scope.fields.currentField.id).removeClass("activated");
		$scope.fields.deleteLastLine($scope.fields.currentField.id);
        $scope.fields.currentField.id = undefined;
	}

	$scope.fields.delete = function(){
		$scope.fields.deleteLine();

		var fieldHtml = getFieldHtmlString($scope.fields.currentField.id, '', '', '', '');
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
	* @desc changes symbol of currentField in tz
	* @param string: string for new symbol location
	* Please note that this function is not used and should be deleted 
	* if not used in further development
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
	/*** TODO: adapt to new backend */

	$scope.map.basemaps = [];

	/** click handler for datensätze button */
	$scope.map.showDatasets = function(){
		$scope.fields.cancel();
		if ($scope.sideContent.template == "app/templates/fgis/_datasets.html"){
			$scope.sideContent.change("");
		}
		else {
			$scope.sideContent.change("app/templates/fgis/_datasets.html");
		}
		try{$scope.map.editCancel();}catch(e){}
	}

	$scope.map.initBasemaps = function(){
		// this route does not exist yet in the backend..
		/**$http.get($scope.dbServerAddress + 'basemaps')
			.success(function(response){
                $scope.map.basemaps = response.data;
			});*/

		// DEBUG
        $scope.map.basemaps = [
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk', layer: 'nw_dtk_col', name: 'NRW-Atlas: Topographische Karten (alle Zoomstufen)' },
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dop40', layer: 'nw_dop40', name: 'NRW-Atlas: Luftbild (40 cm) (alle Zoomstufen)' },
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk50', layer: 'nw_dtk50_col', name: 'NRW-Atlas: Topo. Karte 1:50.000 (Zoom 1 km - 500 m)' },
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk25', layer: 'nw_dtk25_col', name: 'NRW-Atlas: Topo. Karte 1:25.000 (Zoom 500 m - 300 m)' },
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk10', layer: 'nw_dtk10_col', name: 'NRW-Atlas: Topo. Karte 1:10.000 (Zoom 300 m - 30 m)' },
            { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dgk5', layer: 'nw_dgk5_grundriss', name: 'NRW-Atlas: Deutsche Grundkarte 1:5.000 (Zoom 100 m - 30 m)' }
        ];

		// show default basemap
		$scope.map.showBasemap($scope.map.basemaps[0].wms, $scope.map.basemaps[0].layer);
	};

	$scope.map.showBasemap = function(wms, layer){
		var wmsLayer = L.tileLayer.wms(wms, {
			layers: layer,
			format: 'image/png',
			transparent: false,
            attribution: '&copy; geobasis.nrw 2016'
		});
		basemap.clearLayers();
		basemap.addLayer(wmsLayer);
	}

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
		drawnItems.eachLayer(function(layer) {
			setClickable(layer, true);
		});

		$scope.map.editActive = true;
		$scope.map.currentEdit = "leaflet-draw-actions leaflet-draw-actions-bottom";
		var _element = document.getElementsByClassName("leaflet-draw-edit-remove");
		_element[0].click();
		$scope.sideContent.textvar = "Die zu löschenden Objekte bitte anklicken";
		$scope.sideContent.change("app/templates/fgis/_editObjects.html");
	}

	$scope.map.editObjects = function(){
		$scope.map.editActive = true;
		$scope.map.currentEdit = "leaflet-draw-actions leaflet-draw-actions-top";
		var _element = document.getElementsByClassName("leaflet-draw-edit-edit");
		_element[0].click();
		$scope.sideContent.textvar = "Objekte bearbeiten";
		$scope.sideContent.change("app/templates/fgis/_editObjects.html");
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
	    if ($scope.sideContent.template.includes('_drawnObject')) $scope.setColorPicker();

		$scope.map.objects.comment = commentsMap.get($scope.map.objectId);
		$scope.sideContent.change("app/templates/fgis/_drawnObject.html");
	}

	$scope.map.editCancel = function(){
		drawnItems.eachLayer(function(layer) {
			setClickable(layer, false);
		});
		$("#map").css('cursor', 'auto');
		$scope.map.editActive = false;
		var _element = document.getElementsByClassName($scope.map.currentEdit);
		_element[0].children[1].children[0].click();
		$scope.map.objectId = "";
		$scope.sideContent.close();
	}

	$scope.map.editSave = function(){
		drawnItems.eachLayer(function(layer) {
			setClickable(layer, false);
		});
		$("#map").css('cursor', 'auto');
		$scope.map.editActive = false;
		var _element = document.getElementsByClassName($scope.map.currentEdit);
		_element[0].children[0].children[0].click();
		$scope.map.objectId = "";
		commentsMap.delete($scope.map.objectId);
		$scope.sideContent.close();
	}

	// change the color of the choosen object
	$scope.map.changeObjectsColor = function() {
		drawnItems.getLayer($scope.map.objectId).setStyle({color: newColor, dashArray: dashStyle});
	}
    /**
     * Once the checkbox is selected the style of the geometry is changed
     */
	$scope.map.changeDashed = function() {
	    var tmpColor = drawnItems.getLayer($scope.map.objectId).options.color;
	    if (dashStyle === null) {
	        dashStyle = [20, 15];
	        drawnItems.getLayer($scope.map.objectId).setStyle({color: tmpColor, dashArray: dashStyle});
        } else {
            dashStyle = null;
            drawnItems.getLayer($scope.map.objectId).setStyle({color: tmpColor, dashArray: null});
        }
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
				_htmlString = "Fläche: " + Math.floor(_area) + "m<sup>2</sup><br> / "
								+ Math.floor(_area/100)/100 + "ha";
			} else {
				_htmlString = "Fläche: " + Math.floor(_area/100)/100 + "ha / "
								+ Math.floor(_area/10000)/100 + "km<sup>2</sup><br>";
			}
		};
		if (_length != null) {
			if (_length < 10000){
				_htmlString = "Länge: " + Math.floor(_length) + "m";
			} else {
				_htmlString = "Länge: " + Math.floor(_length/100)/10 + "km";
			}
		};
		$scope.map.objects.measureString = $sce.trustAsHtml(_htmlString);
		$scope.map.objects.type = _type;
	}


	/********* INIT **********/

	$scope.map.initBasemaps();

	/** load the einsatz which is specified in the URL hash, when the controller is fully initialized */
	$scope.$on('$viewContentLoaded', function(){
	    var einsatzID = decodeURIComponent(window.location.hash).split('map/').pop();
		// var einsatzID = window.location.hash.split('/').pop();
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
	}).setView([51.50, 7.6], 8);
	L.control.scale({
		position: 'bottomright',
		metric: true,
		imperial: false
		}).addTo(map);

	lines = L.layerGroup().addTo(map);
	basemap = L.layerGroup().addTo(map);
	drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);

	var drawOptions = {
		position: 'topright',
		draw: {
			polyline: {
				shapeOptions: { color: '#ff0000', clickable: false }
			},
			polygon: {
				allowIntersection: true,
				shapeOptions: { color: '#ff0000',  clickable: false },
				showArea: true,
			},
			rectangle: {
				shapeOptions: { clickable: false,  color: '#ff0000' }
			},
			marker: {
				shapeOptions: { clickable: false } // doesn´t work, leaflet draw bug
			},
			circle: {
				shapeOptions: { color: '#ff0000', clickable: false }
			}
		},
		edit: {
			featureGroup: drawnItems, //REQUIRED!!
			remove: true
		}
	};

	drawControl = new L.Control.Draw(drawOptions);
	map.addControl(drawControl);
}

/**
* @desc sets option 'clickable' for a leaflet layer to value
*/
function setClickable(target, value) {
	// ignore if marker, because of Leaflet.draw bug
	if (target instanceof L.Marker) return;

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
	if (value) $("#map").css('cursor', 'help');
	else       $("#map").css('cursor', 'auto');
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
}

/**
 * @desc    generates the html string for a field, identified by its kranzposition
 * @returns html string to be placed within the fields div
 * @example $('<div class="field" id="12"</div>').append(getFieldHtmlString('12'));
 */
function getFieldHtmlString(kranzposition, svgPath , comment, textTop, textBottom) {

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
