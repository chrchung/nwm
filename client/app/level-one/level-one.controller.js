levelOne.controller('LevelOneController', ['$scope', function($scope) {
    $scope.modelnum = 1;
    $scope.aliennum = 1;
    $scope.models = [];
    $scope.aliens = [];
    var maxModels = 3;
    var maxAliens = 5;
    for( var i = 0 ; i < maxModels; i++) {
      $scope.models.push(i + 1);
    };
    for( var j = 0 ; j < maxAliens; j++){
      $scope.aliens.push(j + 1);
    };
}]);


///**
// * Created by elsieyang on 2015-11-04.
// */
//
//'use strict';
//(function() {
//
//  function LevelOneController($scope, $http) {
//    var self = this;
//    this.awesomeThings = [];
//
//    //$http.get('/api/levels').then(function(response) {
//    //  self.awesomeThings = response.data;
//    //});
//
//    $scope.modelnum = 1;
//    $scope.aliennum = 1;
//    $scope.models = [];
//    $scope.aliens = [];
//    var maxModels = 3;
//    var maxAliens = 5;
//    for( var i = 0 ; i <= maxModels; i++) {
//      $scope.models.push(i + 1);
//    }
//    for( var j = 0 ; j <= maxAliens; j++){
//      $scope.aliens.push(j + 1);
//    }
//
//  }
//
//  angular.module('levelOne')
//    .controller('LevelOneController', LevelOneController);
//
//})();
