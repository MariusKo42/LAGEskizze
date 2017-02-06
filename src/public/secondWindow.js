var app = angular.module("handleSecondWindow", ["ngRoute"]);
var windowManager = require('electron').remote.require('electron-window-manager');

app.config(function ($routeProvider) {
    $routeProvider
        .when('/loadMenu', {
            templateUrl: './app/templates/fgis/loadMenu_2.html',
            controller: 'loadMenuCtrl'
        })
        .when('/fieldContent', {
            templateUrl: './app/templates/fgis/fieldContent_2.html',
            controller: 'fieldContentCtrl'
        })
        .when('/layer', {
            templateUrl: './app/templates/fgis/_datasets.html',
            controller: 'layerCtrl'
        })
        .when('/editObject', {
            templateUrl: './app/templates/fgis/_drawnObject.html',
            controller: 'editObjectCtrl'
        })
        .otherwise({
            templateUrl: './app/templates/fgis/fieldContent_2.html',
            controller: 'fieldContentCtrl'
        })
});

windowManager.bridge.on('loadFieldContent', function (value) {
    $('li').each(function() {
        $(this).removeClass('active');
    });
    windowManager.sharedData.set('loadSelectedSymbol', value);
    window.location.hash = 'fieldContent';
});

windowManager.bridge.on('loadEditObject', function () {
    $('li').each(function() {
        $(this).removeClass('active');
    });
    window.location.hash = 'editObject';
});

windowManager.bridge.on('reloadSecWin', function () {
    window.location.hash = 'loadMenu';
});

app.controller('editObjectCtrl', function ($scope, $sce) {
    $scope.metadata = "";
    $scope.comment = "";
    $scope.hideColorPicker = true;
    var modalClosedByBtn = false;
    var btnDeleteObj = $('#btnDeleteObject');
    var geomAttrDiv = $('#geomAttr');
    var commentTextarea = $('#commentGeom');
    var colourElem = $('#cp2');
    var dashCheckbox = $('#dashed');
    colourElem.colorpicker();
    geomAttrDiv.hide();
    btnDeleteObj.tooltip();
    var geomData = windowManager.sharedData.fetch('editObject');
    if (geomData) {
        $scope.metadata = $sce.trustAsHtml(geomData.objectData);
        $scope.comment = geomData.comment;
        if (!geomData.hideColorPicker) {
            geomAttrDiv.show();
            colourElem.colorpicker('setValue', geomData.colour);
        }
        if (geomData.dashed === null) dashCheckbox.prop('checked', false);
        else dashCheckbox.prop('checked', true);
        windowManager.sharedData.set('editObject', null);
    }

    $scope.changeGeomStyle = function () {
        var dashStyle = null;
        if (dashCheckbox.prop('checked')) dashStyle = [20, 15];
        windowManager.bridge.emit('changeColour', {colour: colourElem.colorpicker('getValue'), dash: dashStyle, comment: commentTextarea[0].value});
    };

    $scope.editObjects = function () {
        windowManager.bridge.emit('handleObject', 'edit');
    };

    $scope.deleteObjects = function () {
        windowManager.bridge.emit('handleObject', 'delete');
    };

    $scope.editSave = function () {
        modalClosedByBtn = true;
        windowManager.bridge.emit('handleObject', 'save');
        $('#myModal').modal('hide');
    };

    $scope.editCancel = function () {
        modalClosedByBtn = true;
        windowManager.bridge.emit('handleObject', 'cancel');
        $('#myModal').modal('hide');
    };

    $('#myModal').on('hidden.bs.modal', function () {
        if (!modalClosedByBtn) {
            windowManager.bridge.emit('handleObject', 'cancel');
            modalClosedByBtn = false;
        }
    });
});

app.controller('fieldContentCtrl', function($scope) {

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

    $('#myAffix').affix();

    var value = windowManager.sharedData.fetch('loadSelectedSymbol');
    if (value) {
        $scope.fields.currentField.image = value.currentField.image;
        $scope.fields.currentField.fieldTextTop = value.currentField.fieldTextTop;
        $scope.fields.currentField.fieldTextBottom = value.currentField.fieldTextBottom;
        $scope.fields.currentField.fieldComment = value.currentField.fieldComment;
        windowManager.sharedData.set('loadSelectedSymbol', null);
        $('#navFieldContent').addClass('active');
    }

    $scope.fields.fiterSymbols = function(string){
        $scope.fields.symbolsFilter = string;
    };

    /**
     * @desc changes symbol of currentField in tz
     * @param string: string for new symbol location
     * Please note that this function is not used and should be deleted
     * if not used in further development
     **/
    $scope.fields.selectSymbol = function(name, title) {
        $scope.fields.currentField.fieldTextTop = title;
        $scope.fields.currentField.image = "images/symbols/" + name + ".svg";
    };

    $scope.fields.submit = function() {
        var tmpObj = {
            imageSrc: document.getElementById('ImageSrc').src,
            fieldTop: document.getElementById('fieldTextTop').value,
            fieldBottom: document.getElementById('fieldTextBottom').value,
            fieldComment: document.getElementById('fieldComment').value
        };
        windowManager.bridge.emit('submitField', tmpObj);
    };

    $scope.fields.delete = function () {
        $scope.fields.currentField.image = "images/symbols/_universal.svg";
        $scope.fields.currentField.fieldTextTop = '';
        $scope.fields.currentField.fieldTextBottom = '';
        $scope.fields.currentField.fieldComment = '';
        windowManager.bridge.emit('delete', 'deleteSymbol');
    };

    $scope.fields.deleteLine = function () {
        windowManager.bridge.emit('delete', 'deleteLine');
    };
});

app.controller('loadMenuCtrl', function ($scope, $http) {

    $http.get('../fireDatabase.json').then(function (databaseResponse) {
        $scope.fireDB = databaseResponse.data.fireDoc;
    });

    $scope.loadMission = function (value) {
        windowManager.bridge.emit('dbEntry', value);
    };

    $scope.newMission = function () {
        windowManager.bridge.emit('newMission', true);
    };

    $scope.saveMission = function () {
        windowManager.bridge.emit('saveMission', 'saveEntry');
    };

    $scope.deleteEntry = function () {
        windowManager.bridge.emit('deleteEntry', true);
    };
});

app.controller('layerCtrl', function ($scope) {
    $scope.basemaps = [
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk', layer: 'nw_dtk_col', name: 'NRW-Atlas: Topographische Karten (alle Zoomstufen)' },
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dop20', layer: 'nw_dop20', name: 'NRW-Atlas: Luftbild (20 cm) (alle Zoomstufen)' },
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk50', layer: 'nw_dtk50_col', name: 'NRW-Atlas: Topo. Karte 1:50.000 (Zoom 1 km - 500 m)' },
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk25', layer: 'nw_dtk25_col', name: 'NRW-Atlas: Topo. Karte 1:25.000 (Zoom 500 m - 300 m)' },
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk10', layer: 'nw_dtk10_col', name: 'NRW-Atlas: Topo. Karte 1:10.000 (Zoom 300 m - 30 m)' },
        { wms: 'http://www.wms.nrw.de/geobasis/wms_nw_dgk5', layer: 'nw_dgk5_grundriss', name: 'NRW-Atlas: Deutsche Grundkarte 1:5.000 (Zoom 100 m - 30 m)' },
        { wms: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', layer: 'OpenStreetMap', name: 'OpenStreetMap' }
    ];

    $scope.showBasemap = function(wms, layer) {
        windowManager.bridge.emit('showBasemap', {wms: wms, layer: layer});
    };
});