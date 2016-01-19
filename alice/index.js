/**
* @desc Server script fuer Alice
*/

'use strict';

var db = require('./mongoose/db.js');
var models = require('./mongoose/models.js');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var async = require('async');
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
	function checkDB(data, callback) {
		async.each(data.einsaetze, function(file) {

			db.models.einsaetze.findOne({id: file.id}, function(err, result) {
				if(result == null) {
					//erzeige neuen Einsatz in der DB, falls er noch nicht drin war.
					var neuerEinsatz = new db.models.einsaetze({
						id: file.id,
						meta: {
							einsatzstichwort: file.meta.einsatzstichwort,
							einsatzort: file.meta.einsatzort,
							meldender: file.meta.meldender,
							objektNr: file.meta.objektNr,
							datumUhrzeitGruppe: file.meta.datumUhrzeitGruppe
						},
						drawnObjects: file.drawnObjects,
						map: file.map,
						taktZeichen: file.taktZeichen,
						locked: file.locked		
					});
					//speichere neunen Einsatz
					neuerEinsatz.save();
					console.log(neuerEinsatz);
					//speichere Wert, der die Synchronitaet verneint
					same = false;
				}
			});
		});
		setTimeout(function() {	
			if(same) {
				callback(1);
			}
			else callback(0);
		}, 1500);
	}
	checkDB(json, function(status) {
		if(status == 0) res.send('Datenbank wurde synchronisiert.');
		else if(status == 1) res.send('Datenbank war synchron.');
	});

});

//start the server on Port 3000
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});