"use strict";

/**
 *  @desc definition mongodb schemata
 */

module.exports = function(mongoose) {
    var shortid = require('shortid');
    
    var datensatz = new mongoose.Schema({
        basiskarten: String,
        fachkarten: Object,
        daten_ohne_Raumbezug: [Object]
    });
    var einsatz = new mongoose.Schema({
        id: {
            type: String,
            unique: true        },
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
            unique: true
        },
        kategorie: String,
        titel: String,
        svg: String
    });
    var models = {
        datensaetze: mongoose.model('Datensaetze', datensatz),
        einsaetze: mongoose.model('Einsatz', einsatz),
        taktZeichens: mongoose.model('TaktZeichen', taktZeichen)
    };

    return models;
}
