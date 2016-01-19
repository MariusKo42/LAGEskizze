/**
* @desc Server script fuer Alice
*/

'use strict';

var db = require('./mongoose/db.js');
var models = require('./mongoose/models.js');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var app = express();

app.use('/', express.static(__dirname));

//use the extended request body
app.use(bodyParser.urlencoded({
  extended: true
}));


/**
* @desc Empfaengt ein JSON-Objekt, das Einsaetze enthaelt und gleicht diese
* 		mit der Datenbank ab. Neue Einsaetze werden gespeichert.
*/
app.post('/private/einsatz/', function(req, res) {

	var same = true;
	var body = JSON.stringify(req.body);
	var json = JSON.parse(body);
	var h =  JSON.parse(json.einsaetze);
	json.einsaetze = h;
	console.log(json.einsaetze);
	for(var i = 0; i < json.einsaetze.length; i++) {
		
		var elem = json.einsaetze[i];
		console.log(elem.meta);
		db.models.einsaetze.find({id: elem.id}, function(err, result) {
			console.log('gesucht');
			console.log(result);
			if(result != []) {
				//erzeige neuen Einsatz in der DB, falls er noch nicht drin war.
				var neuerEinsatz = new db.models.einsaetze({
					id: elem.id,
					meta: {
						einsatzstichwort: elem.meta.einsatzstichwort,
						einsatzort: elem.meta.einsatzort,
						meldender: elem.meta.meldender,
						objektNr: elem.meta.objektNr,
						datumUhrzeitGruppe: elem.meta.datumUhrzeitGruppe
					},
					drawnObjects: elem.drawnObjects,
					map: elem.map,
					taktZeichen: elem.taktZeichen,
					locked: elem.locked		
				});
				//speichere neunen Einsatz
				neuerEinsatz.save();
				//speichere Wert, der die Synchronitaet verneint
				same = false;
			}
			else {console.log('gefunden')};
		});
	}
	if(!same) {
		res.send('Datenbank auf Alice wurde aktualisiert.');
	}
	else {
		res.send('Datenbank auf Alice war synchron.');
	}
});

//start the server on Port 3000
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
