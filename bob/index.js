/**
* @desc Initial file for Bob-Server
*/
'use strict';

var express = require('express');
var app = express();

require(../mongoose/db.js);
require(../mongoose/models.js);
require(./routes.js);

app.get('/', function (req, res) {
  console.log('Got Request!');	
  res.send('Hello World!');
});


var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log('Example app listening at http://%s:%s', host, port);
});
