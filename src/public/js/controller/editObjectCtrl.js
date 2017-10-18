angular.module('handleSecondWindow').controller('editObjectCtrl', function ($scope, $sce) {
    // The elements (colopicker, textarea etc.) are filled with the data of the selected feature.
    $scope.metadata = "";
    $scope.comment = "";
    var modalClosedByBtn = false;
    var btnDeleteObj = $('#btnDeleteObject');
    var geomAttrDiv = $('#geomAttr');
    // comment - textarea
    var commentTextarea = $('#commentGeom');
    // colorpicker
    var colourElem = $('#cp2');
    // dashed - checkbox
    var dashCheckbox = $('#dashed');
    // tooltip - checkbox
    var tooltipCheckbox = $('#tooltipCheckbox');
    colourElem.colorpicker();
    geomAttrDiv.hide();
    btnDeleteObj.tooltip();
    // The global object can be read from both windows.
    var geomData = windowManager.sharedData.fetch('editObject');
    if (geomData) {
        $scope.editObject = geomData;
        $scope.metadata = $sce.trustAsHtml(geomData.objectData);
        $scope.comment = geomData.comment;

        if (geomData.hideColorPicker) colourElem.hide();
        else colourElem.colorpicker('setValue', geomData.colour);

        if (geomData.hideChangeStyle) dashCheckbox.hide();
        else {
            // If the geometry is displayed in dashed lines, the checkbox must be set
            if (typeof (geomData.dashed) == 'undefined' || geomData.dashed == null) dashCheckbox.prop('checked', false);
            else dashCheckbox.prop('checked', true);
        }
        // If the geometry has a label, then the checkbox must be set
        if (typeof (geomData.showTooltip) == 'undefined' || geomData.showTooltip == null || !geomData.showTooltip) tooltipCheckbox.prop('checked', false);
        else tooltipCheckbox.prop('checked', true);

        geomAttrDiv.show();
        windowManager.sharedData.set('editObject', null);
    }

    /**
     * The properties of the geometry are changed.
     */
    $scope.changeGeomStyle = function () {
        var changeGeomStyleObj = {
            "colour": '',
            "dash": '',
            "comment": '',
            "showTooltip": '',
            "type": $scope.editObject.type
        };
        var dashStyle = null;
        var tooltip = false;
        // The geometry is shown by dashed lines
        if (dashCheckbox.prop('checked')) dashStyle = [20, 15];
        if (tooltipCheckbox.prop('checked')) tooltip = true;

        changeGeomStyleObj.colour = colourElem.colorpicker('getValue');
        changeGeomStyleObj.dash = dashStyle;

        changeGeomStyleObj.comment = commentTextarea[0].value;
        changeGeomStyleObj.showTooltip = tooltip;
        windowManager.bridge.emit('changeStyle', changeGeomStyleObj);
    };

    $scope.editObjects = function () {
        windowManager.bridge.emit('handleObject', 'edit');
    };

    $scope.deleteObjects = function () {
        windowManager.bridge.emit('handleObject', 'delete');
    };

    $scope.editSave = function () {
        modalClosedByBtn = true;
        windowManager.bridge.emit('handleObject', 'save');
        $('#myModal').modal('hide');
    };

    $scope.editCancel = function () {
        modalClosedByBtn = true;
        windowManager.bridge.emit('handleObject', 'cancel');
        $('#myModal').modal('hide');
    };

    $('#myModal').on('hidden.bs.modal', function () {
        if (!modalClosedByBtn) {
            windowManager.bridge.emit('handleObject', 'cancel');
            modalClosedByBtn = false;
        }
    });
});