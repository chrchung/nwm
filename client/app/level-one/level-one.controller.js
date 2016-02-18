angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state) {
  $scope.alienData = [];
  $scope.buckets = [];
  $scope.num_buckets = 0;  // number of added buckets
  $scope.alienArray = [];
  $scope.aliensInBucket = []; //ids of aliens in buckets
  $scope.score = 0;
  $scope.prev_score = $scope.score;
  $scope.current_bucket = 0;
  $scope.properties = {};
  $scope.selectedAliens = [];


  // Add the first bucket
  $scope.buckets.push({alien:[], illegal_alien:[]});
  $scope.num_buckets++;
  $scope.currentBkt = 0; // This is actually the index of the current clicked bucket


  // Current level
  $scope.cur_level = $stateParams.id;

  // Request data from the server
  Restangular.all('api/levels/level/' + $scope.cur_level).getList().then((function (data) {
    $scope.maxModels = data.length;       // number of models
    $scope.maxAliens = data[0].length;       // number of aliens in a model
    var parseData = function(model, alien){
      for (var i = 0; i < $scope.maxModels; i++){
        for (var j = 0; j < $scope.maxAliens; j++){
          // modelsName is a string in the form of 'level4b6_9'
          if((data[i][j].modelsName).indexOf('a') >= 0){
            $scope.cur_game = 1;
          } else{
            $scope.cur_game = 2;
          }

          var split_id = data[i][j].modelsName.split(/a|b/)[1];
          if (split_id.split("_")[0] == model && split_id.split("_")[1] == alien){
            return data[i][j];
          }
          else{
            continue;
          }}}}
    for (var i = 0; i < $scope.maxModels; i++){
      $scope.alienData.push({model: i, alien: []});
      for (var j = 0; j < $scope.maxAliens; j++){
        var parsed_data = parseData(i, j);
        $scope.properties[i + "_" + j] = parsed_data.attributes;
        $scope.alienArray.push({id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.Alien.url});
        $scope.alienData[i].alien.push({alien:j,
          prop: $scope.properties[i + "_" + j]});
      }
      $scope.get_highest_score();
      $scope.get_greedy();
      shuffleArray($scope.alienArray);
    }

    $scope.getUrl = function(model, alien){
      return parseData(model, alien).Alien.url;
    }
    //alert($scope.properties);
  }), function (err) {
    alert("Unexpected error occured");
  });



  // Score calculator
  var calculateScore = function() {
    // Calculate points for each bucket
    var total_score = 0;
    for (var i = 0; i < $scope.buckets.length; i++) {
      total_score += calculateScoreByBucket($scope.buckets[i].alien);
    }
    $scope.prev_score = $scope.score;
    $scope.score = total_score;
  }

  // Calculate the score of the bucket that contains the
  // aliens in alien_list
  // alien_list: [{model, alien} ...]
  var calculateScoreByBucket = function (alien_list) {
    var num_dup  = {};   // a map from j -> number of properties that appear in j aliens in the bucket
    var prop_list = [];  // a list of unique properties in the bucket
    for (var i = 0; i < alien_list.length; i++) {
      // a list of properties of the current alien
      var cur_properties = $scope.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
      for (var k = 0; k < cur_properties.length; k++) {
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
      score += Math.ceil((Math.pow(j, 2) * num_dup[j])/(Math.pow($scope.maxModels, 2)*prop_list.length) * 10000);
    }

    return score;
  };


  // Returns the number of aliens in the given bucket
  // that have the given attribute
  var compare = function(prop_id, alien_list) {
    var num_occurrence = 0;
    for (var i = 0; i < alien_list.length; i++) {
      var cur_properties = $scope.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
      if (cur_properties.indexOf(prop_id) != -1) {
        num_occurrence++;
      }
    }
    return num_occurrence;
  };


  var updateIllegalAlien = function(bucket){

    $scope.buckets[bucket].illegal_alien = [];

    // Array of models that are already in bucket
    var models_in_bucket = [];
    for (var i = 0; i < $scope.buckets[bucket].alien.length; i++) {
      var model_num = $scope.get_model($scope.buckets[bucket].alien[i]);
      if (models_in_bucket.indexOf(model_num) == -1) {
        models_in_bucket.push(model_num);
      }
    }

    for (var i = 0; i < $scope.alienArray.length; i++) {
      var alien_id = $scope.alienArray[i].id;
      model_num = $scope.get_model(alien_id);
      if ($scope.aliensInBucket.indexOf(alien_id) != -1 ||
        models_in_bucket.indexOf(model_num) != -1) {
        $("#" + alien_id).attr('class', 'illegal_alien');
        $("#" + alien_id).draggable('disable');
        $scope.buckets[bucket].illegal_alien.push(alien_id);
      }
      else {
        $("#" + alien_id).attr('class', "model" + model_num);
        $("#" + alien_id).draggable('enable');
      }
    }
  };

  $scope.get_model = function(id){
    var modelNum = id.split("_")[0];
    return modelNum;
  };
  $scope.get_alien = function(id){
    var alienNum = id.split("_")[1];
    return alienNum;
  };


  $scope.ifNotLast = function(id){
    if(id == $scope.num_buckets - 1){
      return false;
    } else{
      return true;
    }
  };

  $scope.currentBucket = function(bucket) {
    updateIllegalAlien(bucket);
    $scope.current_bucket = bucket;
    $("#bucket_" + bucket).addClass("current_bucket");

    for (var i = 0; i < $scope.buckets.length; i++) {
      if (i != bucket) {
        $("#bucket_" + i).removeClass("current_bucket");
      }
    }
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
  };

  $scope.selectedAlien = function (alien_id) {
    var url = $scope.getUrl($scope.get_model(alien_id), $scope.get_alien(alien_id));
    $("#img-container").html("<img width='300px' src='" + url + "' />");
  };

  $scope.addBucket = function() {
    $scope.buckets.push({alien:[], illegal_alien:[]});
    $scope.num_buckets++;
  };


  //Add the droppable bucket id to the alienData of the alien
  $scope.onDrop = function(event, ui) {
    var alienId = ui.draggable.attr('id');
    var bucketId = $(event.target).attr('id');
    var bucket = bucketId.split("_")[1];

    if ($scope.buckets[bucket].illegal_alien.indexOf(alienId) != -1) {
      alert("Illegal movement!");
      return false;
    }

    $scope.aliensInBucket.push(alienId);

    $scope.buckets[bucket].alien.push(alienId);
    if(bucket == $scope.num_buckets - 1){
      $scope.addBucket();
    }

    //// remove the added alien id from alienArray
    //for (i in $scope.alienArray) {
    //  if ($scope.alienArray[i].id == alienId) {
    //    $scope.alienArray.splice(i, 1); // remove it
    //  }
    //}

    updateIllegalAlien(bucket);
    $scope.currentBucket(bucket);
    calculateScore();
  };

  $scope.putBackAlien = function($event, alienId) {

    var id = $($event.target).parent().parent().attr('id');
    var bucket = id.split("_")[1];
    var modelNum = $scope.get_model(alienId);

    $scope.aliensInBucket.splice($scope.aliensInBucket.indexOf(alienId), 1);
    $scope.buckets[bucket].alien.splice($scope.buckets[bucket].alien.indexOf(alienId), 1);

    if($scope.buckets[bucket].alien.length == 0) {
      $scope.num_buckets--;
      $scope.buckets.splice(bucket, 1);
    }

    updateIllegalAlien(bucket);
    calculateScore();
  };

  $scope.deleteBucket = function($event) {
    var id = $($event.target).parent().attr('id');
    var bucket = id.split("_")[1];

    if($scope.buckets[bucket].alien.length>0){
      for (var m = 0; m <  $scope.buckets[bucket].alien.length; m++){
        var alienId = $scope.buckets[bucket].alien[m];
        var modelNum = $scope.get_model(alienId);

        $scope.aliensInBucket.splice($scope.aliensInBucket.indexOf(alienId), 1);
        //$scope.alienArray.push({id: modelNum + "_" + alienNum, model: "model" + modelNum, alien: alienNum});
        $("#" + alienId).attr('class', "model" + modelNum);
      }
    }
    // Remove the bucket
    $scope.buckets.splice(id.substring(id.length-1, id.length),1);
    $scope.num_buckets--;

    calculateScore();
  };

  $("#menu").hide();
  $("#overlay").hide();
  $scope.toggleMenu = function() {
    $("#overlay").toggle();
    $("#menu").toggle("200");
  }

  $("#selection-screen").hide();
  $("#overlay").hide();
  $("#close-selection-screen").hide();
  $scope.toggleSelectionScreen = function() {
    $("#overlay").toggle();
    $("#selection-screen").toggle("200");
    $("#close-selection-screen").toggle();
  }


  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/').post(
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level)}).then(
      (function (data) {
        $state.go('levelcomplete', {level_id: parseInt($scope.cur_level), game_id: $scope.cur_game, score: $scope.score});
      }), function (err) {

      });
  }

  $scope.logout = function () {
    Restangular.all('api/auths/logout').post(
    ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
  }

  $scope.quit = function (){
    $state.go('scoreboard');
  }

  $scope.dragged = false;
  $scope.selectAlien = function (alien_id) {
    if (!$scope.dragged) {
      var ind = $scope.selectedAliens.indexOf(alien_id);
      if (ind >= 0) {
        $("#" + alien_id).removeClass('selectedAlien');
        $scope.selectedAliens.splice(ind, 1);
      }
      else {
        if ($scope.selectedAliens.length == 8) {
          alert("Can only select 8 aliens!");
          return 0;
        }
        $scope.selectedAliens.push(alien_id);
        $("#" + alien_id).addClass('selectedAlien');
      }
    }
    $scope.dragged = false;
  }

  $scope.startDragging = function() {
    $scope.dragged = true;
  };

  $scope.get_highest_score = function (){
    Restangular.all('api/scores/game_scoreboard/' + parseInt($scope.cur_level) + '/' + $scope.cur_game)
      .getList().then(function (serverJson) {
        $scope.highest_score = serverJson[0].score;
      });
  }
  $scope.get_greedy = function() {
    Restangular.all('api/levels/getBeat/' + parseInt($scope.cur_level) + '/' + parseInt($scope.cur_game))
      .getList().then(function (serverJson) {
        $scope.beat = serverJson[0].scoreToBeat;
      });
  }

});
