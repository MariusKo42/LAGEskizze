angular.module('handleSecondWindow').controller('metadataCtrl', function ($scope) {
    // metadata object
    $scope.metadata = {
        acronym: '',
        keyword: '',
        location: '',
        notify: '',
        number: '',
        date: ''
    };
    $scope.editObject  = {};
    // If the tab with the metadata is opened, the current metadata is read out
    var metadata = windowManager.sharedData.fetch('metadataObject');
    // If metadata is present, then the scope variable is filled with the data
    // The html-document is updated automatically
    if (typeof (metadata) != 'undefined') {
        $scope.metadata.acronym = metadata.acronym;
        $scope.metadata.keyword = metadata.keyword;
        $scope.metadata.location = metadata.location;
        $scope.metadata.notify = metadata.notify;
        $scope.metadata.number = metadata.number;
        $scope.metadata.date = metadata.date;
    }
    /*
     * Evaluate the given expression when the user changes the input. The expression is evaluated immediately.
     * As soon as the metadata is changed, the global metadata object is updated
     */
    $scope.metaListener = function () {
        windowManager.sharedData.set('metadataObject', $scope.metadata);
    }
});