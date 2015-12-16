"use strict";

var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var db = require('./mongoose/db.js');

app.get('/', function (req, res) {
  console.log('Got Request!');	
  res.send('Hello World!');
});

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
app.get('/zeichen/:id/', function(req, res){
	var zeichenId = req.params.id;

	db.models.taktZeichens.findOne({id: zeichenId}, function(err, result){
		if (err) {
			return console.err(err);
			res.status(500).send('Konnte taktisches Zeichen mit der ID: '+ zeichenId +' nicht finden.');
		}
		res.send(result);
	});
});

/* liefert den String des Attributs Svg zurück */
app.get('/zeichen/:id/svg/', function(req, res){
	var zeichenId = req.params.id;

	db.models.taktZeichens.findOne({id: zeichenId}, {Svg: 1}, function(err, result){
		if (err) {
			return console.err(err);
			res.status(500).send('Konnte Svg des taktischen Zeichens mit der ID: ' + zeichenId + 'nicht finden.');
		}
		
		res.send(result.Svg);
	});
});



var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log('Example app listening at http://%s:%s', host, port);
});
