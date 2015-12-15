"use strict";

var db = require(../mongoose/db.js);
var models = require(../mongoose/models.js);
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


/* liefert alle taktischen zeichen inkl. Attribute */
app.get('/zeichen/', function(req, res){

	db.models.taktZeichens.find(function(err, result){
		if (err) {
			return console.err(err);
			res.status(500).send('Keine taktischen Zeichen gefunden.');
		}

		res.send(result);
	});
});

/* liefert das Zeichen mit der ID :id als JSON */
app.get('/zeichen/:id/' function(req, res){
	var id = req.params.id;

	db.models.taktZeichens.findOne({'id': id, function(err, result){
		if (err) {
			return console.err(err);
			res.status(500).send('Konnte taktisches Zeichen mit der ID: '+ id +' nicht finden.');
		}
		res.send(result);
	});
});

/* liefert den String des Attributs Svg zurück */
app.get('/zeichen/:id/svg/', function(req, res){
	var id = req.params.id;

	db.models.taktZeichens.findOne({'id': id}, 'Svg', function(err, result){
		if (err) {
			return console.err(err);
			res.status(500).send('Konnte Svg des taktischen Zeichens mit der ID: ' + id + 'nicht finden.');
		}
		//res.send(result);
		res.send(result.Svg);
	});
});