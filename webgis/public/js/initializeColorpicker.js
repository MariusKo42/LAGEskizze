var newColor; // selected Color

// initialize colorPicker
$(document).ready(function() {
    $("#colorPicker").spectrum({
        color: "#f00",
        change: function(color) {
            newColor = color.toHexString();
        }
    });
    newColor = $("#colorPicker").spectrum("get").toHexString();
});
