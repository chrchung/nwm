angular.module('nwmApp').controller('LevelOneController', ['$scope', function($scope) {
  $scope.models = [];
  $scope.aliens = [];
  $scope.num_buckets = 0;
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
    $("#img-container").html("<img width='300px' src='app/level-one/backup_aliens/" + alien_id + ".png' />");
  };

  $scope.addBucket = function() {
    var newBucket = $("#bucket" + $scope.num_buckets).clone();
    $scope.num_buckets++;
    newBucket.attr('id', 'bucket' + $scope.num_buckets);
    newBucket.droppable($('.actual-bucket').droppable());
    //newBucket.droppable($("#bucket" + $scope.num_buckets + " .actual-bucket").droppable('option'));
    $(newBucket).insertBefore("#add-bucket");
  };
}]);
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
