var app = angular.module("handleSecondWindow", ["ngRoute"]);
//noinspection JSUnresolvedVariable
var windowManager = require('electron').remote.require('electron-window-manager');

app.config(function ($routeProvider) {
    $routeProvider
        .when('/loadMenu', {
            templateUrl: '../public/app/templates/fgis/loadMenu_2.html',
            controller: 'loadMenuCtrl'
        })
        .when('/fieldContent', {
            templateUrl: '../public/app/templates/fgis/fieldContent_2.html',
            controller: 'fieldContentCtrl'
        })
        .when('/layer', {
            templateUrl: '../public/app/templates/fgis/_datasets.html',
            controller: 'layerCtrl'
        })
        .when('/editObject', {
            templateUrl: '../public/app/templates/fgis/_drawnObject.html',
            controller: 'editObjectCtrl'
        })
        .when('/metadata', {
            templateUrl: '../public/app/templates/fgis/metadata.html',
            controller: 'metadataCtrl'
        })
        .otherwise({
            templateUrl: '../public/app/templates/fgis/fieldContent_2.html',
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

    $scope.exportMission = function () {
        windowManager.bridge.emit('exportMission', 'exportEntry');
    };

    $scope.importMission = function () {
        windowManager.bridge.emit('importMission', 'importEntry');
    };

    $scope.deleteEntry = function (value) {
        windowManager.bridge.emit('deleteEntry', value);
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
        { wms: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', layer: 'OpenStreetMap', name: 'OpenStreetMap' },
        { wms: '', layer: 'Lageplan', name: 'Lageplan' }
    ];

    $scope.showBasemap = function(wms, layer) {
        windowManager.bridge.emit('showBasemap', {wms: wms, layer: layer});
    };
});