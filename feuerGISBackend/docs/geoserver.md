# GeoServer
Auf Alice und Bob läuft der GeoServer um etwa Basemaps auf beiden Systemen stets synchron zu halten.

### Einrichtung

#### Installation
Der Geoserver kann von [http://geoserver.org/download/](http://geoserver.org/download/) heruntergeladen werden. Während der Installation wird der Port auf `9000` gesetzt.

#### Openstreetmap Daten
Openstreetmap Daten können als Shapefiles von der [Geofabrik Download Seite](http://download.geofabrik.de/) heruntergeladen werden.

#### Import in den GeoServer
Nach der Installation muss der GeoServer gestartet werden (unter Windows mit dem Programm Start GeoServer, unter Ubuntu muss die `start.jar` Datei gestartet werden).    
Die Weboberfläche des GeoServers ist daraufhin unter `localhost:9000/geoserver/web/` erreichbar. Benutzer: `admin`, Passwort: `geoserver`.   
Zuerst wird ein neuer Arbeitsbereich mit dem Namen und der URI `feuerGIS` erstellt.    
Danach wird ein neuer Datenspeicher als Directory of spatial files angelegt. Der Name ist `basemap`.    Außerdem muss das Verzeichnis der Shapefiles angegeben werden. Dazu wird durch Klick auf den Durchsuchen Button zum Ordner der OpenStreetMap Shapefiles navigiert.    
Nun müssen alle gewünschten Layer (in diesem Fall: `natural`, `buildings`, `railways`, `waterways`, `roads`, `places`) publiziert werden. Als Referenzsystem wird jeweils WGS84 (EPSG: 4326) angegeben.       
Sind alle Layer publiziert kann ein neuer Gruppenlayer erstellt werden. Als Name wird `basemap` gewählt und der Arbeitsbereich ist `feuerGIS`. Nun werden alle zuvor publizierten Layer jeweils durch einen Klick auf `Layer hinzufügen...` hinzugefügt. Die Reihenfolge sollte wie folgt von oben nach unten sein: `natural`, `buildings`, `railways`, `waterways`, `roads`, `places`.    
Danach den Gruppenlayer Speichern.

#### Styling der Karte
Um die Karte sinnvoll nutzen zu können müssen die Layer angemessen gestylt werden. Dazu werden die im __styles__ Ordner vorhandenen .sld styles genutzt.    
Dazu werden neue Stile hinzugefügt. Die Stile sollten `feuerGIS_building`, `feuerGIS_natural`, etc... genannt werden. Zu jedem Stil wird beim erstellen die jeweilige .sld Datei importiert.    
Wurden alle Styles erstellt werden im Gruppenlayer `basemap` die default styles durch die neuen ersetzt. Der _roads_ Layer wird etwa mit dem zuvor erstellten `feuerGIS_road` Stil angepasst.

### Zugriff auf Basemap
Die Basemap wird mittels WMS zur verfügung gestellt.

WMS: `http://localhost:9000/geoserver/feuerGIS/wms?`  
layer: `feuerGIS:basemap`
