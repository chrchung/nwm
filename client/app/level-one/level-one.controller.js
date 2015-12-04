angular.module('nwmApp').controller('LevelOneController', ['$scope', function($scope) {
  $scope.alienData = [];   // mapping from an alien id to an array of (model#, alien#, bucket#)
  $scope.buckets = [];
  $scope.num_buckets = 0;  // number of added buckets
  $scope.alienArray = [];
  var maxModels = 4;       // number of models
  var maxAliens = 5;       // number of aliens in a model
  $scope.score = 0;

  // Attribute ids: mapping from alien id to
  var properties = {
    "0_0": ["_0", 45, 91, 11],
    "0_1": ["_1", 45, 91, 41],
    "0_2": ["_2", 14, 72, 12],
    "0_3": ["_3", 14, 73, 41],
    "0_4": ["_4", 1, 15, 11],

    "1_0": ["_0", 45, 91, 11],
    "1_1": ["_1", 45, 160, 41],
    "1_2": ["_2", 45, 1, 12],
    "1_3": ["_3", 14, 45, 41],
    "1_4": ["_4", 16, 45, 11],

    "2_0": ["_0", 64, 83, 41, 121, 103],
    "2_1": ["_1", 14, 83, 41, 121, 103],
    "2_2": ["_2", 14, 73, 12, 121, 103],
    "2_3": ["_3", 14, 73, 41, 1, 130],
    "2_4": ["_4", 91, 45, 11, 5, 162],

    "3_0": ["_0", 39, 137, 13, 141, 67],
    "3_1": ["_1", 39, 137, 13, 141, 33],
    "3_2": ["_2", 39, 137, 13, 29, 31],
    "3_3": ["_3", 39, 137, 113, 43, 6],
    "3_4": ["_4", 39, 137, 13, 139, 110]
  }

  // Score calculator
  var calculateScore = function() {
    // Calculate points for each bucket
    var total_score = 0;
    for (var i = 0; i < $scope.buckets.length; i++) {
      total_score += calculateScoreByBucket($scope.buckets[i].alien);
    }
    $scope.score = total_score;
  }

  // Calculate the score of the bucket that contains the
  // aliens in alien_list
  // alien_list: [{model, alien} ...]
  var calculateScoreByBucket = function (alien_list) {
    var num_dup  = {};   // a map from j -> number of properties that appear in j aliens in the bucket
    var prop_list = [];  // a list of unique properties in the bucket
    for (var i in alien_list) {
      // a list of properties of the current alien
      var cur_properties = $scope.alienData[alien_list[i].model].alien[alien_list[i].alien].prop;
      for (var k in cur_properties) {
        if (prop_list.indexOf(cur_properties[k]) == -1) {
          // the property is not in prop_list yet
          var compare_result = compare(cur_properties[k], alien_list);
          if (compare_result >= 2) {
            // the property appears in more than one alien in the bucket
            if (num_dup[compare_result] == null) {
              // value of 'j' is not in num_dup yet
              num_dup[compare_result] = 1;
            } else {
              num_dup[compare_result]++;
            }
          }
          prop_list.push(cur_properties[k]);
        }
      }
    }

    var score = 0;
    for (var j in num_dup) {
      score += Math.ceil((Math.pow(j, 2) * num_dup[j])/(Math.pow(maxModels, 2)*prop_list.length) * 10000);
    }

    return score;
  }

  // Returns the number of aliens in the given bucket
  // that have the given attribute
  var compare = function(prop_id, alien_list) {
    var num_occurrence = 0;
    for (var i in alien_list) {
      var cur_properties = $scope.alienData[alien_list[i].model].alien[alien_list[i].alien].prop;
      if (cur_properties.indexOf(prop_id) != -1) {
        num_occurrence++;
      }
    }
    return num_occurrence;
  }

  // Add the first bucket
  $scope.buckets.push({bucket:0, alien:[]});
  $scope.num_buckets++;

  for (var i = 0; i < maxModels; i++) {
    $scope.alienData.push({model: i, alien: []});
    for (var j = 0; j < maxAliens; j++) {
      $scope.alienData[i].alien.push({alien:j,
                                      prop: properties[i + "_" + j]});
      $scope.alienArray.push({id: i + "_" + j, model: "model" + i, alien: j});
    };

    shuffleArray($scope.alienArray);
  };

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  $scope.shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    // While there remain elements to shuffle
    while (0 !== currentIndex) {

      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  }

  $scope.selectedAlien = function (alien_id) {
    $("#img-container").html("<img width='300px' src='app/level-one/backup_aliens/model" + alien_id + ".png' />");
  };

  $scope.addBucket = function() {
    $scope.buckets.push({bucket:$scope.num_buckets, alien:[]});
    $scope.num_buckets++;
  };


  //Add the droppable bucket id to the alienData of the alien
  $scope.onDrop = function(event, ui) {
    var alienId = ui.draggable.attr('id');
    var bucketId = $(event.target).attr('id');
    var bucket = bucketId.substring(bucketId.length-1, bucketId.length);
    var model = alienId.substring(0, 1); // fix
    var alien = alienId.substring(2, 3); // fix
    $scope.buckets[bucket].alien.push({id: alienId, model: model, alien: alien});

    // remove the added alien id from presentAlien array
    for (i in $scope.alienArray) {
      if ($scope.alienArray[i].id == alienId) {
        $scope.alienArray.splice(i, 1); // remove it
      }
    }

    calculateScore();
  };

  $scope.putBackAlien = function(alienId, modelNum, alienNum) {
    // Add the alien id into presentAliens array
    //var alien_num = $scope.currentAliens[model_num];
    //alert(model_num);
    var modelNum = alienId.split("_")[0];
    var alienNum = alienId.split("_")[1];

    $scope.alienArray.push({id: alienId, model: "model" + modelNum, alien: alienNum});

    for(var m = 0; m < $scope.num_buckets; m++){
      //alert($scope.buckets[m].alien);
      for(var n = 0; n < ($scope.buckets[m].alien).length; n++){
        if($scope.buckets[m].alien[n].model == modelNum && $scope.buckets[m].alien[n].alien == alienNum){
          $scope.buckets[m].alien.splice(n, 1);
        }
      }
    }
    calculateScore();
  };

  $scope.deleteBucket = function($event) {
    var id = $($event.target).parent().attr('id');
    var bucket = id.substring(id.length-1, id.length);
    //alert($scope.num_buckets);
    if($scope.buckets[bucket].alien.length>0){
      for (var m = 0; m <  $scope.buckets[bucket].alien.length; m++){
        var modelNum = $scope.buckets[bucket].alien[m].model;
        var alienNum = $scope.buckets[bucket].alien[m].alien;
        $scope.alienArray.push({id: modelNum + "_" + alienNum, model: "model" + modelNum, alien: alienNum});
      }
      // Set alien list in buckets[bucket] back to empty.
      $scope.buckets[bucket].alien = [];
    }
    // Remove the bucket
    for (var l = 0; l < $scope.num_buckets; l++){
      if ($scope.buckets[l].bucket == id.substring(id.length-1, id.length)){
        $scope.num_buckets--;
        $scope.buckets.splice(l,1);
      }
    }
    calculateScore();
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
