# Netzwerk

Für einen reibungsfreien Betrieb wird folgende Netzstruktur benötigt:

### Einsatzwagen (Bob):

In den Einsatzwagen wird optimalerweise ein WLAN Access Point verwendet, der DHCP
 und DNS übernimmt. Der Bob-Server wird per Ethernet mit dem Access Point
verbunden und bezieht seine Netzwerkkonfiguration per DHCP.

Daraufhin ist der Server unter http://(hostname)/ erreichbar.

Der Access Point stellt ein WLAN Netzwerk bereit, dass für die mobilen
Einsatzkräfte und Endgeräte zur Verfügung steht. Dabei ist darauf zu achten,
dass die Verbindung mit z.B. WPA2 gesichert ist, sodass der Zugriff für Fremde
unterbunden wird.

#### DHCP:

Um Konflikte mit mehreren Netzwerken zu vermeiden, sollten die Addressräume
pro Einsatzwagen unterschiedlich sein. So hat z.B. die Leitstelle den 
Addressraum `192.168.1.0/24`, der erste Einsatzwagen `192.168.2.0/24`, usw.

#### Verbindung zur Leitstelle:

Der Bob-Server muss zusätzlich zur Ethernetverbindung eine WLAN-Verbindung zur
Leitstelle aufbauen. Dafür wird ein WLAN Adapter (z.B. per USB) zusätzlich
angeschlossen. 

### Leitstelle (Alice):

In der gesamten Leitstelle sollte ein WLAN bereitstellen, mit dem sich die
Bob-Server beim eintreffen über ihre eigenen WLAN Netzwerkadapter verbinden.

In diesem Netzwerk befindet sich ebenfalls der Alice Server, der von den
in Reichweite befindlichen Bob Servern erreichbar sein muss. Beispielhaft
werden per DHCP Addressen im Bereich `192.168.1.0/24` vergeben, der Alice Server
ist unter der IP `192.168.1.2` zu erreichen.

Die IP vom Alice-Server muss in den Bob-Servern konfiguriert werden, damit diese
sich zum automatischen Datenabgleich verbinden können.

Dazu wird in der Datei `bob/config.json` der folgende Eintrag bearbeitet:

```JSON
{
    "network": {
        "alice":  {
            "ip": "192.168.1.2",
            "port": "8080"
    }
}
```
