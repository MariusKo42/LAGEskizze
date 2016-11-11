"use strict"

$(document).ready(function() {
    
    // Variablen um die Dropdowmenüs aus der generator.html anzusprechen
    var dropKategorie = $('#dropdownKategorie');
    var kategorie = $();
    
    // erster Eintrag leer --> .change() wird ausgelöst
    dropKategorie.append('<option>' + ' ' + '</option>');

    // auslesen der Kategorien aus der categories.json
    $.getJSON("./categories.json", function(json) {
        kategorie = json;
        console.log('Kategorie: ' + kategorie);
        // alle Kategorien werden als Auswahl-Option an das Element dropKategorie angehängt
        $.each(kategorie, function(index, value) {
           dropKategorie.append('<option>' + value.name + '</option>'); 
        });
    });
    
});

// Fkt. die die Symbole filtert
function selectSymbol() {
    // Variable in der die gewählte Kategorie steht
    var gewaehlteKategorie = $('#dropdownKategorie').val();
    //console.log(gewaehlteKategorie);                              // debugging
    
    var symbole = $();
    // Variable die auf das zweite Dropdown-Menp referenziert
    var dropSymbole = $('#dropdownSymbol');
    // Liste wird geleert, falls sich schon Einträge in ihr befinden
    dropSymbole.empty();
    var gleich = '';
    
    // erster Eintrag leer --> .change() wird ausgelöst
    dropSymbole.append('<option>' + ' ' + '</option>');
    
    // auslesen der symbols.json Datei
    $.getJSON("./symbols.json", function(json) {
        symbole = json;
        // console.log('Symbole: ' + symbole + 'Anzahl Symbole: ' + symbole.length);        // debugging um zu sehen ob alle Symbole eingeladen wurden
        // für jedes Symbol wird eine Vergleichsfunktion aufgerufen
        $.each(symbole, function(index, value) {
            // gleich speichert die Kategorie des aktuell betrachteten Symbols
            gleich = value.category;
            //console.log(gleich);
            // wenn Symbol-Kategorie und gewählte Kategorie übereinstimmen --> Symbol wird in Dropdown angehängt
            if (gleich === gewaehlteKategorie) {
                dropSymbole.append('<option data-zeichenid="' + value.id + '">' + value.name + '</option>');
            }
        });
    });
}

// Fkt. die alle Symbole nach dem übergebenen Keyword durchsucht
function searchKeyword() {
    // eingegbene Keywords werden in kleinbuchstaben gespeichert
    var searchString = $('#inputKeywords').val();
    console.log(searchString);
    var symbole = $();

    // Dropdownmenü in das die zu den gefundenen Keywords passenden Zeichen geschrieben werden
    var dropdownKeywords = $('#dropdownKeywords');
    dropdownKeywords.empty();   // Variable leeren, falls noch Reste drin sind
    
    // auslesen der symbols.json Datei
    $.getJSON("./symbols.json", function(json) {
        symbole = json;
        // regEx erstellen um nickt auf case-sensitive achten zu müssen
        var regexp = new RegExp(searchString, 'ig');
        //cycle through all symbols
        $.each(symbole, function(index, value) {
            //check for each keyword in the keywords array
            value.keywords.map(function(keyword){
                
                //match against previously created regexp
                if(keyword.match(regexp)) {
                    dropdownKeywords.append('<option data-zeichenid="' + value.id + '">' + value.name + '</option>');
                }
            });
        });
    });
}

// Fkt. die das gewählte Symbol an das Canvas-Element übergibt
function loadSymbol() {
    
    var gewaehltesSymbol = $('#dropdownSymbol option:selected').attr('data-zeichenid');
    $.getJSON("./symbols.json", function(json) {
       $.each(json, function(index, value) {
          if ( value.id === gewaehltesSymbol)  {
            zeichenGlobal.loadSVG("img/" + value.filename);
            console.log(zeichenGlobal.saveSVG());
          }
       });
    });
}

// Fkt. die das gewählte Symbol, das per Keyword Suche gewählt wurde, an das Canvas-Element übergibt
function loadSymbolKeyword() {
    
    var gewaehltesSymbol = $('#dropdownKeywords option:selected').attr('data-zeichenid');
    $.getJSON("./symbols.json", function(json) {
       $.each(json, function(index, value) {
          if ( value.id === gewaehltesSymbol)  {
            zeichenGlobal.loadSVG("img/" + value.filename);
            console.log(zeichenGlobal.saveSVG());
          }
       });
    });
}


// Fkt. um das neue Symbol zu speichern
function saveSymbol() {
    var svgstring = zeichenGlobal.saveSVG();
    var keyword = $();
    keyword = $('#inputKeywords').val();
    console.log(keyword);
    
    // das Zeichen, das gepostet werden soll als JSON verpackt um es anschließend per POST-Request wegzuschicken
    var zeichen = {
        id  : "neues Zeichen",
        category : $('#inputKategorie').val(),
        name : $('#inputName').val(),
        // keywords wird nicht ordentlich eingelesen -.-
        keywords : keyword,
        filename: $('#inputKategorie').val() + '_' +  $('#inputName').val().toLowerCase() + '.svg',
        svg : svgstring  
    };
    
    console.log(zeichen);
    // hier wird das Zeichen das weggeschickt an den Server...
    $.post('/img/', zeichen, function(data) {
    });
}

// wenn auf das Dropdown-Menü für die Kategorie ein change-Ereignis stattfindet, dann wird die Funktion selectKategorie aufgerufen
$('#dropdownKategorie').change(selectSymbol);
$('#dropdownSymbol').change(loadSymbol);
$('#buttonKeyword').click(searchKeyword);
$('#dropdownKeywords').change(loadSymbolKeyword);