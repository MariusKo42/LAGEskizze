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

/* liefert JSON Objekt mit Metadaten(Name, Category, Filename) zu taktischen Zeichen*/
app.get('/zeichen/', function(req, res){

	taktZeichens.find(function(err, result){
		if (err) return console.err(err);
		res.send(result.zeichenJSON);
	})
});



/* nimmt geändertes JSON Objekt entgegen */
app.post('/zeichen/:id/', function(req, res){
  var zeichenID = req.params.id;

  
  taktZeichens.findByIdAndUpdate(zeichenID, {zeichenJSON: req.body.content}, function(err){
    if (err) return console.err(err);
    res.send("Updated JSON Object.  Content: \n" + req.body.content);
   
  });
});

/* erstellt neues Objekt für Datenbank, in welchem das JSON Objekt für taktische Zeichen gespeichert wird */
app.post('/zeichen/', function(req, res){
	var newZeichen = new taktZeichens({
		zeichenID : req.body.content
	});

	newZeichen.save(function(err){
		if (err) return console.err(err);
	});
	res.end();
});