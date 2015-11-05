angular.module('nwmApp').controller('LevelOneController', ['$scope', function($scope) {
  $scope.modelnum = 1;
  $scope.aliennum = 1;
  $scope.models = [];
  $scope.aliens = [];
  var maxModels = 3;
  var maxAliens = 5;
  for (var i = 0; i < maxModels; i++) {
    $scope.models.push(i + 1);
  };
  for (var j = 0; j < maxAliens; j++) {
    $scope.aliens.push(j + 1);
  };

  $scope.selectedAlien = function (model_num, alien_num) {
    var alien_id = 'model' + model_num + '_' + alien_num;
    $("#img-container").html("<img width='200px' src='app/level-one/backup_aliens/" + alien_id + ".png' />");
  };
}])
$scope.bucket = {};
$scope.alien = {alien_id: 'model' + $scope.modelnum + '_' + $scope.aliennum };
//
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
