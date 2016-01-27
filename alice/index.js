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
var shortid = require('shortid');
var app = express();

app.use('/', express.static(__dirname));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  next();
});

//use the extended request body
app.use(bodyParser.urlencoded({
  extended: true
}));


app.get('/ping', function(req, res) {
    res.send('pong');
});

// GET /api/einsatz
//   Route um alle Einsätze abzurufen.
app.get('/api/einsatz', function(req, res) {
  db.models.einsaetze.find({}, function(error, values) {
    if (error) {
      var message = "DB error: " + error;
      console.log(message);
      res.status(400).send(message);
    } else {

	  // Hier wird noch ein ziemlich mächtiges JSON übergeben. Eventuell andere Struktur überlegen, wie in Dokumentation beschrieben? *Nico
      res.json(values);
      res.end();
    }
  });
});

/**
* @desc Liefere einen Einsatz, der mittles ID identifieziert wird.
*/
app.get('/einsatz/:id', function(req, res) {

  //speichere die ID des Einsatzes
  var id = req.params.id;

  //suche den Einsatz in der Datenbank
  db.models.einsaetze.findOne({id: id}, function(err, doc) {
    if(err) {
      res.status(400).send(err);
    }
    else {
      //sende den in der DB gefundenen Einsatz an den Client
      res.send(doc);
    }
  })
});

/**
* @desc Update ein Zeichen mit den uebergebenen Informationen
*/
app.post('/zeichen/:id/', function(req, res) {

	var id = req.params.id;
	var query = {id: req.params.id};
	db.models.taktZeichens.update(query, {$set: {kategorie: req.body.kategorie, titel: req.body.titel, svg: req.body.svg}}, function(err) {
		if(err) {
			console.log('Error updating the file: ' + err);
			res.status(500).send('Fehler beim update des Zeichens.');
		};
		res.send(id);
	});
});

/**
* @desc Speichere ein uebergebenes TZ in der DB
*/
app.put('/zeichen/', function(req, res) {

	//erzeuge neues Zeichen, das in der DB abgelegt werden soll.
	var zeichen = new db.models.taktZeichens({
		kategorie: req.body.kategorie,
		titel: req.body.titel,
		svg: req.body.svg,
		id: shortid.generate()
	});

	//speichere das Zeichen in der DB
	zeichen.save(function(error) {
		var message = error ? 'failed to save TZ:' + error
							: 'saved TZ:' + zeichen.id;
		console.log(message);
		//und gib die ID an den Client zurück
		res.send('{"id": "' + zeichen.id + '"}'); 
	});
});


/**
* @desc Loescht ein Taktisches Zeichen aus der Datenbank.
* @param :id ID des TZ, das aus der DB geloescht werden soll
*/
app.delete('/zeichen/:id/', function(req, res) {

	var id = req.params.id;
	//durch richtigen Namen für TZ ersetzen
	db.models.taktZeichens.remove({id: id}, function(error) {
		var message = error ? 'failed to remove from DB' + error
							: 'successfully deleted';
		console.log(message);
		res.send(message);
	});
});

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


// posts data about taktische zeichen sent from bob into db
// receives an array of objects of type taktZeichen
//[{taktZeichen1}, {taktZeichen2}, ...]
app.post('/private/zeichen/', function(req, res){
	var same = true;
	var body = JSON.stringify(req.body);
	var json = JSON.parse(body);
	var h = JSON.parse(json.taktZeichens);
	json.taktZeichens = h;
	function checkDB(data, callback){
		async.each(data.taktZeichens, function(file){
			db.models.taktZeichens.findOne({id: file.id}, function(err, result){
				if(result == null){

					var neuerEinsatz = new db.models.taktZeichens({
						id: file.id,
						Kategorie: file.Kategorie,
						Titel: file.Titel,
						Svg: file.Svg
					});

					neuerEinsatz.save();
					console.log(neuerEinsatz);
					same = false;
				}
			});
		});
		setTimeout(function(){
			if (same) callback(1);
			else callback(0);
		}, 1500);
	}
	checkDB(json, function(status){
		if (status == 0) res.send('Datenbank wurde synchronisiert.');
		else if (status == 1) res.send('Datenbank war synchron.');
	});
});


// sendet alle Zeichen in DB
app.get('/zeichen/', function(req, res){
	db.models.taktZeichens.find(function(err, result){
		if(err) console.log(err);
		else res.send(result);
	});
});

//start the server on Port 3000
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
