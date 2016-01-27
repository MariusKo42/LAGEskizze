# Public API Dokumentation
### API Version: 0.1 (unstable)

Die Server stellen jeweils verschiedene REST-Endpunkte bereit, unter denen die Clients die Daten zum aktuellen Einsatz abrufen und ändern können, sowie die taktischen Zeichen bearbeiten und laden können.

## Datenformate

#### Einsatzdaten-JSON

Die gesamten Daten zu einem Einsatz werden in einem einzelnen Objekt zusammengefasst. Dabei wird folgendes Format verwendet:

```JSON
	{
		"id": "String",
		"meta": {
		    "einsatzstichwort": "String",
		    "einsatzort": "String",
		    "meldender": "String",
		    "objektNr": "String",
		    "datumUhrzeitGruppe": "String"
		},
		"drawnObjects": "Array",
		"map": {
		    "zoom": "Number",
		    "center": "Object",
		    "tileServer": "String"
		},
		"taktZeichen": {
		    "kranzposition": "Number",
		    "kartenposition": "Object",
		    "zeichen": "Object"
		},
		"locked": "Boolean"	
	}
```

#### Taktische Zeichen-JSON

Die Details zu den taktischen Zeichen werden ebenfalls in einem einzelnen Objekt zusammengefasst. Diese beinhalten lediglich die Zeichnung an sich, aber nicht die Verwendung innerhalb der Einsatzdaten (zusätzliche Beschriftung, etc.)

```JSON

    {
        "id": "String",
        "kategorie": "String",
        "titel": "String",
        "svg": "String"
    }
```

## Einsatzdaten
#### GET /api/einsatz/
Übermittelt eine Liste mit verfügbaren Einsatz-IDs als JSON:

```JSON
[
  {
    "id": "String",
    "locked": "Bool",
    "meta": {
      "datumUhrzeitGruppe": "String",
      "einsatzort": "String",
      "einsatzstichwort": "String",
      "meldender": "String",
      "objektNr": "String"
    }
  }, ...
]
```
#### GET /api/einsatz/new
Liefert ein JSON-Objekt mit leeren Einsatzdaten und einer neuen, eindeutigen EinsatzID.
#### GET /api/einsatz/:id
Übermittelt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
#### POST /api/einsatz/:id
Empfängt ein JSON-Objekt mit den gesamten Einsatzdaten zum Einsatz mit der ID :id.
#### POST /api/einsatz/:id/lock
Beim aufrufen wird der Einsatz mit der ID :id gesperrt. Es ist keine weitere Bearbeitung mehr möglich. Nur gesperrte Einsätze werden auf den Server in der Feuerwache synchronisiert.

## Taktische Zeichen
#### GET /api/zeichen/

Übermittelt ein JSON Objekt, in dem die Bezeichnungen und Svg's als Strings für die Zeichen enthalten sind.
```JSON
[
    {
	"id": "String",
        "kategorie": "String",
        "titel": "String",
        "svg": "String"
    }
]

```


#### GET /api/zeichen/:id/
Liefert das Zeichen mit der ID :id als JSON

### GET /api/zeichen/:id/svg/
Liefert den String des Attribut ```svg``` zurück, sodass das Zeichen als <img> eingebunden werden kann. Beispiel: 
```HTML
<img src="http://bob/zeichen/n4l2ia/svg/">
```

#### POST /api/zeichen/
Nimmt ein Zeichen als JSON entgegen, und ersetzt das Zeichen in der Datenbank mit der selben id.

#### PUT /api/zeichen/
Nimmt ein neues Zeichen entgegen, und speichert es in die Datenbank. Dabei wird die mitgelieferte ID ignoriert, und die vom Server zugewiesene ID als Rückmeldung ausgegeben:
```JSON
{
    "kategorie": "String",
    "titel": "String",
    "svg": "String"	

}
```
#### DELETE /api/zeichen/:id/
Löscht ein taktisches Zeichen mit der ID :id aus der Datenbank.



#### POST /api/zeichen/:id/
Nimmt ein das geänderte JSON Objekt entgegen und überschreibt das alte Objekt.
