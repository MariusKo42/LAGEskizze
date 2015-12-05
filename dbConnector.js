"use strict";

/**
 * @desc definition DB schemata & connection to mongoDB
 */

var mongoose = require('mongoose');


/*definition of schema for "Datensätze*/
var datensaetzeSchema = new mongoose.Schema({
	Basiskarten: String,
	Fachkarten: Object,
	Daten_ohne_Raumbezug: [Object]
});

/*definition of schema for "Einsatz"*/
var einsatzSchema = new mongoose.Schema({
	Einsatzstichwort: String,
	Einsatzort: String,
	Meldender: String,
	Objektnummer: int,
	Datum_Uhrzeitgruppe: Date,
	Datensaetze: Object,
	Zeichnungen: Object,
	Kranzposition: int,
	Kartenposition: Object,
	Zeichen: Object 
});

var datensaetzeModel = mongoose.model('Datensaetze', datensaetzeSchema);
var einsatzModel = mongoose.model('Einsatz', einsatzSchema);