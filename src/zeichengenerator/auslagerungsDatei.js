$.getJSON("./symbols.json", function(json) {
        symbole = json;
        // aktueller BUG das jedes Zeichen so oft in Dropdown Keywords eingefügt wird, wie es Einträge im Kennzeichen-Array hat
        // Duplikate entfernen!
        $.each(symbole, function(index, value) {
            console.log('innerhalb for-each');
            $.grep(value.keywords, function(element, index) {
                console.log('keywords');
                dropdownKeywords.append('<option data-zeichenid="' + value.id + '">' + value.name + '</option>');
            });
        });
    });