Alle Befehle nehmen an, dass das current directory im Terminal der geclonte Hauptordner `feuerwehrGIS` ist.

# fireGIS installieren

- mongoDB installieren
- nodejs und npm installieren
- bower installieren: `sudo npm install -g bower`
- repository clonen
- npm und bower Pakete für webgis, adminclient & db-server installieren:

        cd webgis
        sudo npm install
        bower install
        cd ../administrationsserver/db-server
        sudo npm install
        cd ../admin-client
        sudo npm install
        bower install

## Besonderheiten unter Windows
Nicht getestet unter Windows, aber:

- Auf Windows ist es recht hilfreich node, npm und mongod [in den PATH einzufügen](http://patheditor2.codeplex.com/), sodass es möglich die ist die Programme im Terminal direkt aufzurufen, und nicht den vollständigen Pfad angeben zu müssen.
Alle Befehle nehmen an, dass die `mongod` etc im PATH sind, falls nicht also zB `mongod` durch `<Pfad zu MongoDB installation>/bin/mongod` ersetzen.
- Überall wo `sudo` steht, muss das `sudo` weggelassen werden, und stattdessen das Terminal als Administrator geöffnet sein.
- u.U. muss bei allen Pfaden `/` durch `\` ersetzt werden (?)

# fireGIS starten
- MongoDB starten
    - unter Ubuntu14 läuft die per default, falls nicht `sudo service mongod start`
    - unter Windows: `mongod --path=...` (ebenfalls nicht getestet)
- db-server starten: `node administrationsserver/db-server/app.js`
- admin-client starten: `node administrationsserver/admin-client/index.js`
- webgis starten: `node webgis/index.js`

Das WebGIS ist dann unter [`localhost:1337`](http://localhost:1337/) aufrufbar.

Der Adminclient ist dann unter [`localhost:7777`](http://localhost:7777/) aufrufbar.

Um nur grundlegende Funktionen des GUIs zu testen, reicht es, nur das WebGIS zu starten.
