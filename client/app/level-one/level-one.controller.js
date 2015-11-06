angular.module('nwmApp').controller('LevelOneController', ['$scope', function($scope) {
  $scope.models = [];      // array of model numbers
  $scope.aliens = [];      // array of alien numbers in a model
  $scope.num_buckets = 0;  // number of added buckets
  $scope.alienData = {};   // mapping from an alien id to an array of (model#, alien#, bucket#)
  $scope.buckets = [];
  var maxModels = 3;       // number of models
  var maxAliens = 5;       // number of aliens in a model

  for (var i = 1; i <= maxModels; i++) {
    $scope.models.push(i);
    for (var j = 1; j <= maxAliens; j++) {
      $scope.alienData[i + "_" + j] = [i, j, null];
    };
  };

  for (var j = 1; j <= maxAliens; j++) {
    $scope.aliens.push(j);
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

  // Add the droppable bucket id to the alianData of the alien
  $scope.onDrop = function(event, ui) {
    var alienId = ui.draggable.attr('id');
    var bucketId = $(event.target).parent().attr('id');
    $scope.alienData[alienId][2] = bucketId;
    alert($scope.alienData[alienId]);
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
