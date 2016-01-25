"use strict";

/**
 *  @desc definition mongodb schemata
 */
var shortid = require('shortid');

module.exports = function(mongoose) {
    var datensatz = new mongoose.Schema({
        Basiskarten: String,
        Fachkarten: Object,
        Daten_ohne_Raumbezug: [Object]
    });
    var einsatz = new mongoose.Schema({
        id: {
            type: String,
            unique: true,
            default: shortid.generate
        },
        meta: {
            einsatzstichwort: String,
            einsatzort: String,
            meldender: String,
            objektNr: String,
            datumUhrzeitGruppe: String
        },
        drawnObjects: Array,
        map: {
            zoom: Number,
            center: Object,
            tileServer: String
        },
        taktZeichen: {
            kranzposition: Number,
            kartenposition: Object,
            zeichen: Object
        },
        locked: Boolean	
    });
    var taktZeichen = new mongoose.Schema({
        id: {
            type: String,
            unique: true,
            default: shortid.generate()
        },
        Kategorie: String,
        Titel: String,
        Svg: String
    });
    var models = {
        datensaetze: mongoose.model('Datensaetze', datensatz),
        einsaetze: mongoose.model('Einsatz', einsatz),
        taktZeichens: mongoose.model('TaktZeichen', taktZeichen)
    };

    return models;
}
