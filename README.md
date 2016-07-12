# feuerwehrGIS

WebGIS zur Unterstützung von Feuerwehrleitkräften bei der Einsatzleitung.
Das System verwendet nodejs, angular und leaflet & MongoDB und GeoServer.

Das in einem Studienprojekt am *ifgi* entwickelte System basiert auf der [Arbeit von S. Niklasch](https://github.com/sNiklasch/feuerwehrGIS)
und ist an das *Taktische Lagedarstellungssytem (TLS)* des *IfV* angelehnt.

### Systemkomponenten

Das System besteht im aktuellen Zustand (27.01.2016) aus mehreren Komponenten:

1. Ordner `webgis/`: Das Frontend. Der Server läuft auf Port `1337`.
2. [Ordner `webgis/zeichengenerator/`](https://github.com/k1gva/geo_it): Ein Generator für taktische Zeichen. Ist in das Webgis integriert.
3. [neues Backend: `bob/`](https://github.com/jansule/feuerGISBackend): Neues Backend, ersetzt das alte Backend `dbserver/`. Läuft auf Port `8080`.
4. [neues Backend: GeoServer](https://github.com/jansule/feuerGISBackend): Bietet lokale WMS Layer für das Webgis. Läuft auf Port `9000`.
5. [neues Backend: `alice/`](https://github.com/jansule/feuerGISBackend): Synchronisationsserver, synchronisiert die Datenbanken meherer Instanzen von Bob.

Das Frontend (1, 2) bezieht seine Daten ausschließlich aus dem lokalen Backendserver (3), sodass das System mobil und offline verwendet werden kann.
Mehrere dieser Systeme können über einen zB in der Feuerwehrwache stehenden Synchronisationsserver (5) abgeglichen werden.

##### TODO zur Integration der Komponenten:

- Im Webgis & Zeichengenerator die taktischen Zeichen vom DB-Server (3) laden/speichern.
	- Im Webgis die taktischen Zeichen & deren Filter auf das neue Schema anpassen
- Im Webgis die Liste von verfügbaren Basemaps vom neuen DB-Server Bob (3) laden (Route fehlt)

## Installationsanleitung

siehe [INSTALL.md](./INSTALL.md)

Die taktischen Zeichen sind nicht im Repo enthalten.
Für das webgis müssen diese in den Ordner `webgis/public/images/symbols/` kopiert werden.
Für den Zeichengenerator müssen die Zeichen im Ordner `webgis/zeichengenerator/img/` liegen.

## Startanleitung

* [Starte das Backend](https://github.com/jansule/feuerGISBackend)
* Starte das WebGIS (Befehl 'node index.js' im Ordner webgis/)

## License
MIT
