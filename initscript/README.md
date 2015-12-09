# init.d scripts

Die init.d scripts setzen `forever` vorraus. Dies muss vorher mit npm global isntalliert werden:

```
# npm install forever -g 
```

Dann muss das jeweilige Script für die Bob oder Alice Version in das init.d Verzeichnis kopiert werden:

```
# cp feuergis-bob /etc/init.d/feuergis-bob
# chmod 755 /etc/init.d/feuergis-bob
```

Mit folgendem Befehl kann das autmatische Starten aktiviert werden:
```
# update-rc.d feuergis-bob defaults
```
und wieder deaktivieren:
```
update-rc.de -f feuergis-bob remove
```
