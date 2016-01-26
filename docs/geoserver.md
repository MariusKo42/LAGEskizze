# GeoServer
Auf Alice und Bob läuft der GeoServer um etwa Basemaps auf beiden Systemen stets synchron zu halten.

### Einrichtung

#### Openstreetmap Daten
Openstreetmap Daten können als Shapefiles von der [Geofabrik Download Seite](http://download.geofabrik.de/) heruntergeladen werden.

#### Import in den GeoServer
Die Shapefiles müssen in den GeoServer in einen Datenspeicher eingeladen und publiziert werden. Als Gruppenlayer können mehrere Shapefiles gleichzeitign angezeigt werden.

#### Styling der Karte
Um die Karte sinnvoll nutzen zu können müssen die Layer angemessen gestylt werden. Dazu werden die im __styles__ Ordner vorhandenen .sld styles genutzt. Die default styles müssen mit unseren ersetzt werden. Der _roads_ Layer wird etwa mit dem _feuerGIS-road.sld_ angepasst.

### Zugriff auf Basemap
Die Installation, der Import der Daten sowie das styling ist im Auslieferungszustand bereits erledigt. Die Basemap wird mittels WMS zur verfügung gestellt.

WMS: http://localhost:9000/geoserver/feuerGIS/wms?  
layer: feuerGIS:basemap
