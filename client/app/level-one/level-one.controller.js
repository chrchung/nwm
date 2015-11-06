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
    //alert($scope.alienData[alienId]);
  };

  $scope.putBackAlien = function(model_num, alien_num) {
    for (var k = 0; k <  Object.keys($scope.alienData).length; k++){
      //alert(model_num);
      var alien_id = Object.keys($scope.alienData)[k];
      var bucket_id = $scope.alienData[alien_id][2];
    }
    if (!bucket_id) {
      //alert(bucket_id);
      // remove the alien
      var deletedId = model_num + "_" + alien_num;
      $('.model #' + deletedId).remove();
      // add the alien back
      $('.model #' + model_num).append("<img width='15%' src='app/level-one/backup_aliens/model" + deletedId + ".png'/>");
    }
  };

  $scope.deleteBucket = function($event) {
    //if($scope.num_buckets >= 1){
      var id = $($event.target).parent().attr('id');
      //alert(id);
      var da_modelId, da_alienId;

      $scope.num_buckets--;
      for (var m = 0; m <  Object.keys($scope.alienData).length; m++){
        var alien_id2 = Object.keys($scope.alienData)[m];
        if ($scope.alienData[alien_id2][2] == id){
          da_modelId = alien_id2.split('_')[0];
          da_alienId = alien_id2.split('_')[1];
          delete $scope.alienData[alien_id2][2];
          // remove the alien
          var deletedId2 = da_modelId + "_" + da_alienId;
          $('.model #' + deletedId2).remove();
          // add the alien back
          $('.model #' + da_modelId).append("<img width='15%' src='app/level-one/backup_aliens/model" + deletedId2 + ".png'/>");
        }

      }
      // Remove the bucket
      $('#' + id).remove();
    //} else{
    //  alert("Can't delete bucket!");
    //}

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
