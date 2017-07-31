var jQuery = require('jquery');
var leaflet = require('leaflet');
var	leafletDraw = require('leaflet-draw');
var	leafletGeometry = require('leaflet-geometryutil');

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