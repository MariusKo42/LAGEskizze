
/**
* @desc Initial script for Bob-Server with routing information
*/

'use strict';

var db = require('./mongoose/db.js');
var models = require('./mongoose/models.js');
var config = require('./config.json');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var exec = require('child_process').exec;
var shortid = require('shortid');
var async = require('async');
var app = express();

var mutex = {
    rsyncto : false,
    rsyncfrom : false,
};


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

app.use(bodyParser.json())


app.get('/', function (req, res) {
  console.log('Got Request!');	
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
	
	//frontend group just wants metadata, id and locked status
	var dataToSend = [];
	var i = 0;
	while(i < values.length){
		
			
		var myObject = {	id: values[i].id,
							meta: values[i].meta,
							locked: values[i].locked
		}			
			
		dataToSend.push(myObject);	
		
		i++;
	}
	
	res.json(dataToSend);

    }
  });
});


// GET /api/einsatz/new
//   Route um einen neuen Einsatz in der Datenbank anzulegen.
//	 Benötigt (valides) JSON nach Notation in der Dokumentation
app.get('/api/einsatz/new', function(req, res) {
  // Einsatz hier validieren?
  var myEinsatz = new db.models.einsaetze({
    id: shortid.generate()
  });

  myEinsatz.locked = false;

  myEinsatz.save(function(error) {
    if (error) {
      res.status(400).json({
        status: "Fehler beim Abspeichern des Einsatzes " + req.body.title + ": " + error
      });
    } else {
      res.json(myEinsatz);
      res.end();
    }
  });
});

/**
* @desc Liefere einen Einsatz, der mittles ID identifieziert wird.
*/
app.get('/api/einsatz/:id', function(req, res) {

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

// POST /api/einsatz/:EinsatzID
//   Route um einen existierenden Einsatz zu editieren.
//	 Nimmt einen neuen Einsatz entgegen und überschreibt den Existenten.
app.post('/api/einsatz/:EinsatzID/', function(req, res) {
  
    var einsatzid = req.params.EinsatzID;
  
    var query = { id: einsatzid };
    db.models.einsaetze.update(query, {   meta: {
                            einsatzstichwort:   req.body.meta.einsatzstichwort,
                            einsatzort:     req.body.meta.einsatzort,
                            meldender:      req.body.meta.meldender,
                            objektNr:     req.body.meta.objektNr,
                            datumUhrzeitGruppe: req.body.meta.datumUhrzeitGruppe
                          },
                        drawnObjects: req.body.drawnObjects,
                        map: {
                            zoom:         req.body.map.zoom,
                            center:       req.body.map.center,
                            tileServer:     req.body.map.tileServer
                        },
                        taktZeichen: req.body.taktZeichen
                      }, function(error, result){
                        console.log(result);
                        res.send(result);
                      });
});


// POST /api/einsatz/:EinsatzID/lock
//   Route um einen existierenden Einsatz zu sperren.
//	 Eine weitere Editierung des Einsatzes ist nicht möglich.
app.post('/api/einsatz/:EinsatzID/lock', function(req, res) {

  db.models.einsaetze.update({ id: req.params.EinsatzID }, { $set: { locked: 'true' }}, function(){

	  res.send("Einsatz mit ID " + req.params.EinsatzID + " wurde gesperrt.");

  });

});


/**
* @desc Update ein Zeichen mit den uebergebenen Informationen
*/
app.post('/zeichen/:id/', function(req, res) {

	var id = req.params.id;
	var query = {id: req.params.id};
	db.models.taktZeichens.update(query, {$set: {Kategorie: req.body.Kategorie, Titel: req.body.Titel, Svg: req.body.Svg}}, function(err) {
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
		Kategorie: req.body.Kategorie,
		Titel: req.body.Titel,
		Svg: req.body.Svg,
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





var formData = {
  einsaetze: Array
};


/**
* @desc Versucht jede Minute eine Verbindung zu Alice herzustellen
*/
setInterval(function () {
    request({url: 'http://' + config.network.alice.ip + ':' + config.network.alice.port + '/ping', timeout: 5000}, function (error, response, body) {
        if (!error) {
            console.log('Alice ist erreichbar! Starte Synchronisation.');
            
            //Starte Synchronisation der Einsätze
            syncEinsaetze(config.network.alice);

            //Starte Synchronisation der Zeichen von Bob zu Alice
            syncZeichenTo(config.network.alice);

            //Starte Synchronisation der Zeichen von Alice zu Bob
            syncZeichenFrom(config.network.alice);

            //Starte rsync Synchronisation der GeoServer Daten
            syncGeoTo(config.network.alice);
            syncGeoFrom(config.network.alice);
        }
    });

}, 60000);



var syncGeoTo = function(alice) {
    if(!mutex.rsyncto) {
        mutex.rsyncto = true;
        exec('rsync -aAXzve ssh /var/lib/tomcat7/webapps/geoserver/data/workspaces bob@' + alice.ip + ':/var/lib/tomcat7/webapps/geoserver/data/workspaces', function(error, stdout, stderr) {
            console.log(stderr);
            mutex.rsyncto = false;
        });
    }
}

var syncGeoFrom = function(alice) {
    if(!mutex.rsyncfrom) {
        mutex.rsyncfrom = true;
        exec('rsync -aAXzve ssh bob@' + alice.ip + ':/var/lib/tomcat7/webapps/geoserver/data/workspaces /var/lib/tomcat7/webapps/geoserver/data/workspaces', function(error, stdout, stderr) {
            console.log(stderr);
            mutex.rsyncfrom = false;
        });
    }
}



/**
* @desc Sendet die Eintraege aus der DB an Alice via post request.
*/
var syncEinsaetze = function (alice) {

    //finde Einsaetze in der DB
    db.models.einsaetze.find(function(err, docs) {
      if(err) {
        console.error(err);
      }
      else {
        formData.einsaetze = JSON.stringify(docs);

        /**
        * @desc Sendet einen Einsatz an den stationaeren Server (Alice) in der Wache.
        */
        request.post({url: 'http://' + alice.ip + ':' + alice.port + '/private/einsatz', form: formData}, function (error, response, body) {
            
            if (error) {
              return console.error('Synchronisation fehlgeschlagen:', error);
            }
            console.log('Synchronisation erfolgreich!  Server antwortet mit:', body);
        });
      }
  });
};

// posts data about taktische zeichen sent from alice into db
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



/*
* @Desc loads all taktZeichen and sends them to alice
*
*/
var zeichenData = {
  taktZeichens: Array
};

//var syncZeichenTo = function(alice){
  function syncZeichenTo(){
  // contains all taktZeichen
  var zeichen;

  //load all taktZeichen
  db.models.taktZeichens.find(function(err, result){
    if (err){
      console.log(err);
    } else {
      zeichenData.taktZeichens = JSON.stringify(result);


      //send request
      //request.post({url: 'http://' + alice.ip + ':' + alice.port + '/private/zeichen', form: zeichenData}, function(error, response, body){
        request.post({url: 'http://localhost:3000/private/zeichen', form: zeichenData}, function(error, response, body){
        if (error) return console.error('Synchronisation fehlgeschlagen: ', error);
        else console.log('Synchronisation erfolgreich! Server antwortet mit: ', body);
      });
    }

  });

};

//var syncZeichenFrom = function(alice){
  function syncZeichenFrom(){
  //request.get('http://' + alice.ip + ':' + alice.port + '/zeichen/').on('response', function(response){
    request({
      method: 'GET',
      uri: 'http://localhost:3000/zeichen/'
    }, function(error, response, body){
      
    
    //save values into db
    
    var same = true;
    var body = JSON.stringify(body);
    var json= {};
    json.taktZeichens = JSON.parse(body);
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
      if (status == 0) response.send('Datenbank wurde synchronisiert.');
      else if (status == 1) response.send('Datenbank war synchron.');
    });
});


}
//};

//syncZeichenTo();
syncZeichenFrom();


//start the server on Port 8080
var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
