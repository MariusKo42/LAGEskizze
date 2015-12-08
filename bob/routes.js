/*

	Here comes the API.

*/


app.get('/api/getBasemaps', function (req, res) {
	// Hier müsste man die Basemaps holen

  res.send('Hello World!');
});



app.get('/api/getEinsatz/:EinsatzID/', function(req, res){

	// Beispiel wie das mit den Parametern läuft ;-)

	var einsatzid = req.params.EinsatzID;



});

/* liefert liste mit den ids und titeln der taktischen zeichen*/
app.get('/zeichen/', function(req, res){
	//'Schema' durch entsprechendes mongoose schema für taktische zeichen ersetzen
	Schema.find(function(err, result){
		if (err) return console.err(err);
		res.send(result);
	})
});

/* liefert das zeichen mit der ID :id */
app.get('/zeichen/:id/', function(req, res){
	var zeichenID = req.params.id;

	//'Schema' durch entsprechendes mongoose schema für taktsiche zeichen ersetzen
	Schema.findOne({_id: zeichenID}, function(err, callback){
			if (err) return console.log(err);
			res.send(callback);
	});
});

/* nimmt ein geändertes Zeichen entgegen */
app.post('/zeichen/:id/', function(req, res){
  var zeichenID = req.params.id;

  //'Schema' durch entsprechendes mongoose schema für taktsiche zeichen ersetzen
  Schema.findByIdAndUpdate(zeichenID, {$set: {/* hier die json elemente einfügen */}}, function(err, schema){
    if (err) return handelError(err);
    res.send(schema);
  });
});
