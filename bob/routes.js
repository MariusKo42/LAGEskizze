/*

	Here comes the API.	
	
*/

/**
* @desc Routes provided for the API
*/

var db = require(../mongoose/db.js);
var models = require(../mongoose/models.js);
var express = require('express');

app.get('/api/getBasemaps', function (req, res) {
	// Hier müsste man die Basemaps holen	

  res.send('Hello World!');
});



app.get('/api/getEinsatz/:EinsatzID/', function(req, res){
	
	// Beispiel wie das mit den Parametern läuft ;-)
	
	var einsatzid = req.params.EinsatzID;

	
	
});

/**
* @desc Speichere ein uebergebenes TZ in der DB
*/
app.put('/zeichen', function(req, res) {

	var zeichen = new models.taktischeZeichen({
		_id: ....;
		datei: ...;
		// Hier müsste gespeichert werden
	});

	zeichen.save(function(error) {
		var message = error ? 'failed to save TZ:' + error
							: 'saved TZ:' zeichen._id;
		console.log(message);
		res.send('{"id": "' + zeichen._id + '"}'); 
	});
});


/**
* @desc Loescht ein Taktisches Zeichen aus der Datenbank.
* @param :id ID des TZ, das aus der DB geloescht werden soll
*/
app.delete('/zeichen/:id', function(req, res) {

	var id = req.params.id;
	models.taktischeZeichen.remove({_id: id}, function(error) {
		var message = error ? 'failed to remove from DB' + error
							: 'successfully deleted';
		console.log(message);
		res.send(message);
	});
});
