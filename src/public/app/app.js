var jQuery = require('jquery'),
	leaflet = require('leaflet'),
	leafletDraw = require('leaflet-draw'),
	leafletGeometry = require('leaflet-geometryutil');

var $ = jQuery;

var app = angular.module("fgis", ["ngRoute", "jsonFormatter"]);

app.config(function($routeProvider){
	$routeProvider
		.when("/map/:id", {
			templateUrl: "app/templates/fgis/map.html",
			controller: "MapController"
		})
		.when("/map", {
			templateUrl: "app/templates/fgis/map.html",
			controller: "MapController"
		})
		.otherwise({redirectTo: "/map"});
});