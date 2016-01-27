var myPath;
var tool = new Tool();
var firstPoint, secondPoint;

var paths = [];

// Hilfsfunktion um die tool-events von etwaiger Funktionen zu befreien 
function toolReset() {
  tool.onMouseDown = null;
  tool.onMouseUp = null;
  tool.onMouseDrag = null;  
}

// Funktion für die Eingabe von Textfeldern in das Zeichen
function textEingeben() {
    toolReset();
    //console.log('test');
    var text = prompt('Was wollen Sie in das Textfeld schreiben?');
    //console.log(text);
    // wenn die Maus geklickt wurde, wird Funktion aufgerufen
    tool.onMouseDown = function(event) {
        if(text != "") {
            // in Konsole wird die Position geloggt
            //console.log(event.point);
            // Eingabe als Variable, es wird ein PointText-Element angehangen, das an die Position des Klicks gehangen wird
            var eingabe = new PointText(new Point(event.point.x, event.point.y));
            // Farbe des Textes wird aus dem 1.-Farbdropdown gezogen
            eingabe.fillColor = $('#farbe').val();
            eingabe.fontSize = '24px';
            eingabe.content = text;
            // Text-Variable wieder leeren
            text =""; 
            // Eingabe wird in path-Array eingefügt
            paths.push(eingabe);
        }
    };
}

// Funktion um Freihand zu zeichnen
function freihandZeichnen() {
    toolReset();
    
    // wenn Maus geklickt wird
    tool.onMouseDown = function(event) {
    // Path wird zurückgesetzt, wenn Nutzer auf einen neuen Punkt geklickt wird, verhindert das eine Linie zwischen zwei unabhängigen Pfaden gezeichnet wird
    myPath = new Path();
        // Eingabe wird in path-Array eingefügt
        paths.push(myPath);
    };
    
    // wenn Maus gezogen wird, wird eine Linie mit der Farbe aus dem ersten Farb-Dropdown gezeichnet
    tool.onMouseDrag = function(event) {
        myPath.strokeColor = $('#farbe').val();   
        myPath.add(event.point);
    };
}

// Funktion um Linien einzufügen
function linienSegmentZeichnen() {
    toolReset();
    // Path wird zurückgesetzt, wenn Nutzer auf einen neuen Punkt geklickt wird, verhindert das eine Linie zwischen zwei unabhängigen Pfaden gezeichnet wird
    myPath = new Path();
    
    // Maus-Klick
    tool.onMouseDown = function(event) {
        myPath.strokeColor = $('#farbe').val();
        myPath.add(event.point);
    };
    // Maus wird losgelassen
    tool.onMouseUp = function(event) {
       myPath.add(event.point);
    };
    
    // Eingabe wird in path-Array eingefügt
    paths.push(myPath);
}

function curvedLineZeichnen() {
    toolReset();
    var from, to;
    console.log("Hallo es klappt");
    var handleIn = new Point(-80, -100);
    var handleOut = new Point(80, 100);
    
    tool.onMouseDown = function(event) {
        firstPoint = new Point(event.point.x, event.point.y);
        console.log(firstPoint);        
    };

    from = new Segment(firstPoint , null , handleOut);
    
    tool.onMouseUp = function(event){
        secondPoint = new Point(event.point.x, event.point.y);
        console.log(secondPoint);
    };
    
    to = new Segment(secondPoint, handleIn, null);
    console.log(to);
    
    var curvedLine = new Curve(from, to);
    curvedLine.strokeColor = 'black';
    
    
/**    
var handleIn = new Point(-80, -100);
var handleOut = new Point(80, 100);

var firstPoint = new Point(100, 50);
var firstSegment = new Segment(firstPoint, null, handleOut);

var secondPoint = new Point(300, 50);
var secondSegment = new Segment(secondPoint, handleIn, null);

var path = new Path(firstSegment, secondSegment);*/
}
    


// Fkt. um Rechteck zu zeichnen
function zeichneRechteck() {
    toolReset();
    var from, to;
    
    tool.onMouseDown = function(event) {
        // Startpunkt für das Rechteck
        from = new Point(event.point.x, event.point.y);
    };
    
    tool.onMouseUp = function(event) {
        // Endpunkt für das Rechteck
        to = new Point(event.point.x, event.point.y);
        // myPath wird ein Rechteck mit den Start-und Endpunkten from, to
        myPath = new Path.Rectangle(from,to);
        // Farbe für Rand/Füllung festlegen
        myPath.strokeColor = $('#farbe').val();
        myPath.fillColor = $('#farbe2').val();
        // Eingabe wird in path-Array eingefügt
        paths.push(myPath);    
    };
}

// Fkt. um das zuletzt gezeichnete Element zu verschieben
function elementVerschieben() {
    toolReset();
    // letztes Element (letzte Position im Array) wird an Punkt verschoben, an den geklickt wird
    tool.onMouseDown = function(event) {
        paths[paths.length - 1].position = event.point;
    };
}

// Fkt. um den letzten Schritt Rückgängig zu machen  BUGGY --> bisher wird es nur ausgeführt, wenn die Maus sich in den Canvas-Bereich bewegt
function rueckgaengig() {
    if(paths.length > 0) {
        paths.pop().remove();
        // Canvas wird neu gerendert
        paper.view.update();
    // console.log('innerhalb rueckgaengig');
    }
}

// Fkt. um Canvas-Element komplett zu leeren
function loeschen() {
    var length = paths.length;
    for(i = 0; i <= length; i++) {
        paths.pop().remove();
        // Canvas wird neu gerendert
        paper.view.update();
    }
}

// Fkt. um das Zeichen als SVG herunterzuladen
function exportSVG() {
    // Prompt um dem Zeichen einen Namen zu geben
    var name = prompt('Unter welchem Namen soll das Zeichen lokal gespeichert werden?');
    //
    var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString: true}));
    var link = document.createElement("a");
    link.download = name;
    link.href = url;
    link.click();
}


// Fkt. um das Zeichen als PDF herunterzuladen, aktuell nicht funktionsfähig
function exportPDF() {
    
}

// zeichenGlobal ist globales Objekt in das alle globalen Variablen/Funktionen geschoben werden sollen
zeichenGlobal.loadSVG = function(svgstring) {
    project.clear();
    project.importSVG(svgstring, function() {});
};

zeichenGlobal.saveSVG = function() {
    return project.exportSVG({asString : true, matchShapes: true});
};


$('#buttonLoeschen').click(loeschen);
$('#buttonRueckgaengig').click(rueckgaengig);
$('#buttonFreihandZeichnen').click(freihandZeichnen);
$('#buttonLinienSegment').click(linienSegmentZeichnen);
$('#buttonText').click(textEingeben);
$('#buttonRectangle').click(zeichneRechteck);
$('#buttonCurvedLinienSegment').click(curvedLineZeichnen);
$('#buttonExportSVG').click(exportSVG);
$('#buttonExportPDF').click(exportPDF);
$('#buttonVerschieben').click(elementVerschieben);