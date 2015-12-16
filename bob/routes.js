/*

	Here comes the API.

*/


app.get('/api/getBasemaps', function(req, res) {
  // Hier müsste man die Basemaps holen

  res.send('Hello World!');
});


// GET /api/einsatz
//   Route um alle Einsätze abzurufen.
app.get('/api/einsatz', function(req, res) {
  models.einsaetze.find({}, function(error, values) {
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


// GET /api/einsatz/new
//   Route um einen neuen Einsatz in der Datenbank anzulegen.
//	 Benötigt (valides) JSON nach Notation in der Dokumentation
app.get('/api/einsatz/new', function(req, res) {
  // Einsatz hier validieren?
  var myEinsatz = new models.einsaetze({});

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


// POST /api/einsatz/:EinsatzID
//   Route um einen existierenden Einsatz zu editieren.
//	 Nimmt einen neuen Einsatz entgegen und überschreibt den Existenten.
app.post('/api/einsatz/:EinsatzID/', function(req, res) {
  var einsatzid = req.params.EinsatzID;

  models.einsaetze.findById(einsatzid, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {

      if(value.locked){

	      res.status(400).send("Einsatz ist abgeschlossen (locked)").

      }

      value = req.body;
      // POST-Body = Einsatz JSON
      value.save(function(err) {
        if (err) return handleError(err);
        //res.status(200); //Boost Performance if needed
        res.send(value);
      });
    }
  });
});


// POST /api/einsatz/:EinsatzID/lock
//   Route um einen existierenden Einsatz zu sperren.
//	 Eine weitere Editierung des Einsatzes ist nicht möglich.
app.post('/api/einsatz/:EinsatzID/lock', function(req, res) {

  models.einsaetze.update({ _id: req.params.EinsatzID }, { $set: { locked: 'true' }}, function(){

	  res.send("Einsatz mit ID " + req.params.EinsatzID + " wurde gesperrt.");

  });

});
