/**
 * @desc this server delivers the frontend's static files
 *       for the webgis & generator of taktische zeichen
 */

'use strict';

var express = require('express'),
    app = express(),
    server;

app.use('/zeichengenerator', express.static(__dirname + '/zeichengenerator/'));
app.use('/', express.static(__dirname + '/public'));

server = app.listen(1337, function(err) {
    if (!err) console.log('server listening on port %s', server.address().port);
});

app.use(function(req, res, next) {
   console.log('FAILED REQUEST TO %s %s FROM %s', req.method, req.originalUrl, req.ip);
   next();
});
