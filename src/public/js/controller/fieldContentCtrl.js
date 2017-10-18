angular.module('handleSecondWindow').controller('fieldContentCtrl', function($scope) {

    /********************************
     ************ Fields *************
     ********************************/
    $scope.fields = {};
    $scope.fields.fieldOrder = fieldOrder;
    $scope.fields.symbols = symbolProperties;
    $scope.fields.symbolsFilter = "";
    $scope.fields.currentField = {};
    $scope.fields.currentField.image = "images/symbols/_universal.svg";
    $scope.fields.currentField.topText = "";
    $scope.fields.currentField.bottomText = "";
    $scope.fields.currentField.commentField = "";
    $scope.fields.currentField.active = false;
    $scope.fields.currentField.id = undefined;
    $scope.fields.currentField.fieldTextTop = "";
    $scope.fields.currentField.fieldTextBottom = "";
    $scope.fields.currentField.fieldComment = "";

    $('#myAffix').affix();

    var value = windowManager.sharedData.fetch('loadSelectedSymbol');
    if (value) {
        $scope.fields.currentField.image = value.currentField.image;
        $scope.fields.currentField.fieldTextTop = value.currentField.fieldTextTop;
        $scope.fields.currentField.fieldTextBottom = value.currentField.fieldTextBottom;
        $scope.fields.currentField.fieldComment = value.currentField.fieldComment;
        windowManager.sharedData.set('loadSelectedSymbol', null);
        $('#navFieldContent').addClass('active');
    }

    $scope.fields.fiterSymbols = function(string){
        $scope.fields.symbolsFilter = string;
    };

    /**
     * @desc changes symbol of currentField in tz
     * @param name: top label description
     * @param title: string for new symbol location
     * Please note that this function is not used and should be deleted
     * if not used in further development
     **/
    $scope.fields.selectSymbol = function(name, title) {
        $scope.fields.currentField.fieldTextTop = title;
        $scope.fields.currentField.image = "images/symbols/" + name + ".svg";
    };

    $scope.fields.submit = function() {
        var tmpObj = {
            imageSrc: $scope.fields.currentField.image,
            fieldTop: document.getElementById('fieldTextTop').value,
            fieldBottom: document.getElementById('fieldTextBottom').value,
            fieldComment: document.getElementById('fieldComment').value
        };
        windowManager.bridge.emit('submitField', tmpObj);
    };

    $scope.fields.delete = function () {
        $scope.fields.currentField.image = "images/symbols/_universal.svg";
        $scope.fields.currentField.fieldTextTop = '';
        $scope.fields.currentField.fieldTextBottom = '';
        $scope.fields.currentField.fieldComment = '';
        windowManager.bridge.emit('delete', 'deleteSymbol');
    };

    $scope.fields.deleteLine = function () {
        windowManager.bridge.emit('delete', 'deleteLine');
    };
});