/*

	Here comes the API.

*/


app.get('/api/getBasemaps', function(req, res) {
  // Hier müsste man die Basemaps holen

  res.send('Hello World!');
});


app.get('/api/einsatz', function(req, res) {
  models.einsaetze.find({}, function(error, values) {
    if (error) {
      var message = "DB error: " + error;
      console.log(message);
      res.status(400).send(message);
    } else {
      res.json(values);
      res.end();
    }
  });
});

app.get('/api/einsatz/new', function(req, res) {
	var myEinsatz = new models.einsaetze({});

	myEinsatz.save(function(error) {
    if (error) {
      res.status(400).json({
        status: "Fail creating paper DB entry for " + req.body.title + ": " + error
      });
    }
  });
});

app.get('/api/einsatz/:EinsatzID/', function(req, res) {
  var einsatzid = req.params.EinsatzID;

	models.einsaetze.findById(einsatzid, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(value);
      res.end();
    }
  });
});

app.get('/api/einsatz/:EinsatzID/lock', function(req, res) {
  var einsatzid = req.params.EinsatzID;
	//TODO: implememnt
});
