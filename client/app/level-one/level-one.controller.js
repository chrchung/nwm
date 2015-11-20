angular.module('nwmApp').controller('LevelOneController', ['$scope', function($scope) {
  $scope.alienData = [];   // mapping from an alien id to an array of (model#, alien#, bucket#)
  $scope.buckets = [];
  $scope.num_buckets = 0;  // number of added buckets
  $scope.presentAliens = {}; // mapping from model_num -> array of present alien ids in the model
  $scope.currentAliens = []; // mapping from model_num -> current alien's id for the model
  var maxModels = 4;       // number of models
  var maxAliens = 5;       // number of aliens in a model
  $scope.quantity_model = 3;
  $scope.quantity_alien = 1;

  // Add the first bucket
  $scope.buckets.push({bucket:0, alien:[]});
  $scope.num_buckets++;

  $scope.modelClass = function(m){
    return "model" + m.model;
  };

  $scope.getNextAlien = function (model_num) {
    if($scope.presentAliens[model_num].length > $scope.quantity_alien){
      // Generate a random id
      var rand_ind = $scope.single_random_generator(model_num);
      for(var i = 0; i < $scope.currentAliens.length; i++){
        if($scope.currentAliens[i].model == model_num){
          $scope.currentAliens[i].alien.shift();
          $scope.currentAliens[i].alien.push($scope.presentAliens[model_num][rand_ind]);
          break;
        }
      }
    }//else{
    //  for(var j = 0; j < $scope.currentAliens.length; j++){
    //    if($scope.currentAliens[j].model == model_num){
    //      $scope.currentAliens[j].alien[$scope.quantity_alien - 1] = maxAliens;
    //      break;
    //    }
    //  }
    //}
  };

  // Another version of getNextAlien when the user drag a alien out of the window
  $scope.dropNextAlien = function (model_num, alien_num) {
    if($scope.presentAliens[model_num].length > $scope.quantity_alien){
      // Generate a random id
      var rand_ind = $scope.single_random_generator(model_num);
      for(var i = 0; i < $scope.currentAliens.length; i++){
        if($scope.currentAliens[i].model == model_num){
          for(var x = 0; x < $scope.currentAliens[i].alien.length; x++){
            if($scope.currentAliens[i].alien[x] == alien_num){
              $scope.currentAliens[i].alien[x] = $scope.presentAliens[model_num][rand_ind];
            }
          }
        }
      }
    }else{
      for(var j = 0; j < $scope.currentAliens.length; j++){
        if($scope.currentAliens[j].model == model_num){
          $scope.currentAliens[j].alien[alien_num] = maxAliens;
          break;
        }
      }
    }
  };

  for (var i = 0; i < maxModels; i++) {
    $scope.presentAliens[i] = [];
    $scope.alienData.push({model: i, alien: []});
    $scope.currentAliens.push({model: i, alien: []});
    for (var j = 0; j < maxAliens * 2; j++) {
      $scope.alienData[i].alien.push({alien:j, img: "app/level-one/backup_aliens/model" + i + "_" + j + ".png"});
    };
    for (var j = 0; j < maxAliens; j++) {
      $scope.presentAliens[i].push(j);
    };

    // Generate a initial alien id for each model
    for (var k = 0; k < $scope.quantity_alien; k++){
      var rand_ind = Math.floor(Math.random() * ($scope.presentAliens[i].length - 1));
      $scope.currentAliens[i].alien.push($scope.presentAliens[i][rand_ind]);
    }
  };

  $scope.resize = function () {
    for (var i = 0; i < maxModels; i++) {
      $scope.currentAliens[i].alien = [];
      var ran_arr = $scope.random_generator(i, $scope.quantity_alien);
      for (var k = 0; k < $scope.quantity_alien; k++){
        $scope.currentAliens[i].alien.push(ran_arr[k]);
      }
    }
  };

  // Randomly generate num distinct random numbers
  $scope.random_generator = function (model, num){
    var arr = [];
    while(arr.length < num){
      var randomnumber=Math.floor(Math.random() * ($scope.presentAliens[model].length - 1));
      var found=false;
      for(var i=0;i<arr.length;i++){
        if(arr[i]==randomnumber){found=true;break}
      }
      if(!found)arr[arr.length]=randomnumber;
    }
    return arr;
  }


  $scope.single_random_generator = function (model){
    var found=false;
    //alert($scope.currentAliens[model].alien);
    while(!found){
      var randomnumber=Math.floor(Math.random() * ($scope.presentAliens[model].length - 1));
      //alert("rand" + rand_ind);
      if($scope.currentAliens[model].alien.indexOf($scope.presentAliens[model][randomnumber]) == -1){
        found=true;
        break;
      }
    }
    return randomnumber;
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

  $scope.selectedAlien = function (model_num, alien_num) {
    var alien_id = 'model' + model_num + '_' + alien_num;
    $("#img-container").html("<img width='300px' src='app/level-one/backup_aliens/" + alien_id + ".png' />");
  };


  $scope.addBucket = function() {
    //var newBucket = $("#bucket" + $scope.num_buckets).clone();
    //newBucket.attr('id', 'bucket' + $scope.num_buckets);
    //alert(newBucket.data('id'));
    //newBucket.droppable($('.actual-bucket').droppable());
    //newBucket.droppable($("#bucket" + $scope.num_buckets + " .actual-bucket").droppable('option'));
    //$(newBucket).insertBefore("#add-bucket");
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
    $scope.buckets[bucket].alien.push({model: model, alien: alien});

    // remove the added alien id from presentAlien array
    for(var x = 0; x < $scope.presentAliens[model].length; x++){
      if($scope.presentAliens[model][x] == alien){
        $scope.presentAliens[model].splice(x, 1); // remove it
      }
    }
    //alert($scope.presentAliens[model]);
    $scope.dropNextAlien(model, alien);
  };

  $scope.putBackAlien = function(model_num, alien_num) {
    // Add the alien id into presentAliens array
    //var alien_num = $scope.currentAliens[model_num];
    //alert(model_num);
    $scope.presentAliens[model_num].push(alien_num);

    for(var m = 0; m < $scope.num_buckets; m++){
      //alert($scope.buckets[m].alien);
      for(var n = 0; n < ($scope.buckets[m].alien).length; n++){
        if($scope.buckets[m].alien[n].model == model_num && $scope.buckets[m].alien[n].alien == alien_num){
          $scope.buckets[m].alien.splice(n, 1);
          //// Now loop over alienData to find the index of the alien we want to delete.
          //for(var p = 0; p < $scope.alienData[model_num].alien.length; p++){
          //  if($scope.alienData[model_num].alien[p].alien == alien_num){
          //    $scope.alienData[model_num].alien.splice(p, 1);
          //    $scope.alienData[model_num].alien.push({alien:alien_num,
          //      img: "app/level-one/backup_aliens/model" + model_num + "_" + alien_num + ".png"})
          //  }
          //}
        }
      }
    }
  };

  $scope.deleteBucket = function($event) {
    var id = $($event.target).parent().attr('id');
    var bucket = id.substring(id.length-1, id.length);
    //alert($scope.num_buckets);
    if($scope.buckets[bucket].alien.length>0){
      for (var m = 0; m <  $scope.buckets[bucket].alien.length; m++){
        var model = $scope.buckets[bucket].alien[m].model;
        var alien = $scope.buckets[bucket].alien[m].alien;
        //alert("model: " + model + "alien: " + alien);
        //for (var n = 0; n < $scope.alienData[model].alien.length; n++){
        //  if($scope.alienData[model].alien[n].alien == alien){
        //    $scope.alienData[model].alien.splice(n, 1);
        //    $scope.alienData[model].alien.push({alien:alien, img: "app/level-one/backup_aliens/model" + model + "_" + alien + ".png"})
        //  }
        //}
        $scope.presentAliens[model].push(alien);
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
