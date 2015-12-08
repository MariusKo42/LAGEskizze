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
