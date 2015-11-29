# public API Dokumentation
### api-version: 0.1 (unstable)

Die Server stellen jeweils verschiedene REST-Endpunkte bereit, unter denen die Clients die Daten zum aktuellen Einsatz abrufen und ändern können, sowie die taktischen Zeichen bearbeiten und laden können.

## Datenformate

### Einsatzdaten-JSON

Die gesamten Daten zu einem Einsatz werden in einem einzelnen Objekt zusammengefasst. Dabei wird folgendes Format verwendet:


### Taktische Zeichen-JSON

Die Details zu den taktischen Zeichen werden ebenfalls in einem einzelnen Objekt zusammengefasst. Diese beinhalten lediglich die Zeichnung an sich, aber nicht die Verwendung innerhalb der Einsatzdaten (zusätzliche Beschriftung, etc.)

```JSON
{
    
}

```

## Einsatzdaten
### GET /einsatz/
Übermittelt eine Liste mit verfügbaren Einsatz-IDs als JSON:

```JSON
{
    "Einsaetze":[{id, titel},{...}]
}
```
### GET /einsatz/new
Liefert ein JSON-Objekt mit leeren Einsatzdaten und einer neuen, eindeutigen EinsatzID.
### GET /einsatz/:id
Übermittelt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
### POST /einsatz/:id
Empfängt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
### POST /einsatz/:id/lock
Beim aufrufen wird der Einsatz mit der ID :id gesperrt. Es ist keine weitere Bearbeitung mehr möglich. Nur gesperrte Einsätze werden auf den Server in der Feuerwache synchronisiert.

## Taktische Zeichen
### GET /zeichen/
Übermittelt eine Liste mit den IDs der verfügbaren taktischen Zeichen als JSON:
```JSON
{
    "Zeichen":[{id, titel},{...}]
}
```

### GET /zeichen/:id/
Liefert das Zeichen mit der ID :id nach dem o.g. Schema.
### POST /zeichen/:id/
Nimmt ein geändertes Zeichen entgegen
### PUT /zeichen/
Nimmt ein neues Zeichen entgegen und liefert die zugehörige ZeichenID wie folgt:
```JSON
{"id":id}
```
### DELETE /zeichen/:id/
Löscht ein taktisches Zeichen mit der ID :id


