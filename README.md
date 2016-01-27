# feuerGISBackend

## Willkommen

Dieses Repository stellt das Backend des im WS 15/16 auf Basis der [Bachelorarbeit von Sebastian Niklasch](https://github.com/sNiklasch/feuerwehrGIS) stattgefundenen Projektkurses "GeoIT im Katastrophenschutz" an der Westfälischen Wilhelms-Universität Münster dar.


## Beschreibung

Das hier dargestelle System stellt das Backend des FeuerwehrGIS zur Synchronisation und Datenerhaltung dar. Des Weiteren ermöglicht es das Einladen von lokal verfügbaren Daten und stellt es dem Frontend im Rahmen der Public API zur Verfügung. Die verschiedenen API-Endpunkte sind in der Dokumentation (im docs Verzeichnis dieses Repositorys) einzusehen. Die Private-API ist lediglich für die Synchronisation von Einsatzdaten & taktischen Zeichen zwischen Bob & Alice erforderlich.

Das System basiert auf zwei kollaborierenden Serversystemen. Server 1 (nachfolgend Alice genannt) ist stationär bspw. in der Feuerwache aufzustellen. Server 2 (nachfolgend Bob genannt) wird mobil (bspw. in einem Einsatzleitwagen) angebracht und kann theoretisch auf einem Notebook ausgeführt werden. Unter Einhaltung der nachfolgend genannten Voraussetzungen ist eine Synchronisation zwischen Alice und Bob möglich. 


## Voraussetzungen
  - node.js > v4.0
  - Alice: mongoDB > v3.0
  - Java 8+ (bedingt durch GeoServer)

## Installation

Das System arbeitet mit einer Instanz des GPL-lizensierten [GeoServers](https://github.com/geoserver/geoserver). Dieser ist wie in der Dokumentation des Geoservers spezifiziert zu installieren. Gegebenenfalls müssen nach einer Installation des GeoServers mit nicht-standard Port (9000) die URL's im Frontend angepasst werden.

Nach erfolgreicher Installation von node.js & mongoDB kann der Synchronisationservice mit den folgenden Befehlen installiert werden:

### Bob:
```{r, engine='bash', count_lines}
cd bob
npm install
```
### Alice:
```{r, engine='bash', count_lines}
cd alice
npm install
```

Abschließend startet man die MongoDB Instanz via 
```{r, engine='bash', count_lines}
mongod
```

Gegebenenfalls können hierfür besondere Berechtigungen von Nöten sein.

Danach können die Services per init.d Script bei Systemstart ausgeführt werden. Die Vorgehensweise ist im /initscript Ordner dargestellt. Alternativ können die einzelnen Instanzen per 
```{r, engine='bash', count_lines}
node index.js
```
im jeweiligen Ordner ausgeführt werden. Dabei ist zu beachten, dass der Server beim Schließen des Terminals beendet wird.

## Lizenz
Das System wird unter MIT-Lizenz veröffentlicht. 


## Abschluss

Diese Software wurde von [Felix Erdmann](https://github.com/FelixErdmann), [Jan Suleiman](https://github.com/jansule), [Jan Koppe](https://github.com/JanKoppe), [Lasse Einfeldt](https://github.com/LEinfeldt) und [Nico Steffens](https://github.com/nsteffens) für den Kurs 'GeoIT im Katastrophenschutz' im Wintersemester 2015 / 2016 am [Institut für Geoinformatik der Universität Münster](https://www.uni-muenster.de/Geoinformatics/) entwickelt.
