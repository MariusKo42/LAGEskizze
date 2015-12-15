/*

	Here comes the API.	
	
*/

/**
* @desc Routes provided for the API
*/
'use strict';

var db = require(../mongoose/db.js);
var models = require(../mongoose/models.js);
var express = require('express');
var body-parser = require('body-parser');
var shortid = require('shortid');
var app = express();

app.get('/api/getBasemaps', function (req, res) {
	// Hier müsste man die Basemaps holen	

  res.send('Hello World!');
});



app.get('/api/getEinsatz/:EinsatzID/', function(req, res){
	
	// Beispiel wie das mit den Parametern läuft ;-)
	
	var einsatzid = req.params.EinsatzID;

	
	
});


/**
* @desc Update ein Zeichen mit den uebergebenen Informationen
*/
app.post('/zeichen/:id/', function(req, res) {

	var id = req.params.id;
	var query = {id: req.params.id};
	var taktZeichens.update(query, {id: req.params.id; Kategorie: req.body.Kategorie; Titel: req.body.Titel; Svg: req.body.Svg}, function(err) {
		if(err) {
			console.log('Error updating the file: ' + err);
			res.status(500).send('Fehler beim update des Zeichens.');
		};
		res.send(req.params.id);
	});
});

/**
* @desc Speichere ein uebergebenes TZ in der DB
*/
app.put('/zeichen/', function(req, res) {

	//erzeuge neues Zeichen, das in der DB abgelegt werden soll.
	var zeichen = new db.models.taktZeichens({
		//id: shortid.generate(); Muss das angegeben werden (wegen default im model?)
		Kategorie: req.body.Kategorie;
		Titel: req.body.Titel;
		Svg: req.body.Svg
	});

	//speichere das Zeichen in der DB
	zeichen.save(function(error) {
		var message = error ? 'failed to save TZ:' + error
							: 'saved TZ:' zeichen.id;
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