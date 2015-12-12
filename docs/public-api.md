# Public API Dokumentation
### API Version: 0.1 (unstable)

Die Server stellen jeweils verschiedene REST-Endpunkte bereit, unter denen die Clients die Daten zum aktuellen Einsatz abrufen und ändern können, sowie die taktischen Zeichen bearbeiten und laden können.

## Datenformate

#### Einsatzdaten-JSON

Die gesamten Daten zu einem Einsatz werden in einem einzelnen Objekt zusammengefasst. Dabei wird folgendes Format verwendet:


#### Taktische Zeichen-JSON

Die Details zu den taktischen Zeichen werden ebenfalls in einem einzelnen Objekt zusammengefasst. Diese beinhalten lediglich die Zeichnung an sich, aber nicht die Verwendung innerhalb der Einsatzdaten (zusätzliche Beschriftung, etc.)

```JSON
{
 "taktZeichens":[
   {
     "id": "id",
     "zeichenJSON": "Object"
   }
 ]   
}

```

## Einsatzdaten
#### GET /einsatz/
Übermittelt eine Liste mit verfügbaren Einsatz-IDs als JSON:

```JSON
{
    "Einsaetze":[
    {
        "id":"id",
        "titel":"titel"
    },
    ]
}
```
#### GET /einsatz/new
Liefert ein JSON-Objekt mit leeren Einsatzdaten und einer neuen, eindeutigen EinsatzID.
#### GET /einsatz/:id
Übermittelt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
#### POST /einsatz/:id
Empfängt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
#### POST /einsatz/:id/lock
Beim aufrufen wird der Einsatz mit der ID :id gesperrt. Es ist keine weitere Bearbeitung mehr möglich. Nur gesperrte Einsätze werden auf den Server in der Feuerwache synchronisiert.

## Taktische Zeichen
#### GET /zeichen/
Übermittelt ein JSON Objekt, in dem die Bezeichnungen und Dateinamen für die Zeichen enthalten sind.
```JSON
{
    "Zeichen":[
    {
        "name": "String",
        "category": "String",
        "filename": "String"
    },
    ]
}
```

#### POST /zeichen/
Erstellt ein neues Objekt in der Datenbank, in welchem das JSON Objekt für taktische Zeichen gespeichert wird.
##### Wichtig: Diese Route dient nur zum einmaligen Erstellen des DB-Obekts. Danach nicht mehr verwenden!!

#### POST /zeichen/:id/
Nimmt ein das geänderte JSON Objekt entgegen und überschreibt das alte Objekt.
