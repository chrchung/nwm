'use strict';

angular.module('nwmApp').controller('game2Controller', function($scope, Restangular, $stateParams, $state, $timeout, update2, helper2, database2, style2, bucket2, history2, aliens2) {

  $scope.currentBucket = function(curBucket) {
    $scope.alienArray = update2.updateIllegalAlien($scope.alienArray, curBucket);
    $scope.zoominAliens = bucket2.currentBucket(curBucket, $scope.alienArray);
  };

  var feedback = function(alienId) {
    $scope.prev_score = $scope.score;
    $scope.score = update2.getNewScore($scope.maxModels);
    update2.showSmallFeedback($scope.prev_score, $scope.score, alienId);
    update2.showBigFeedback($scope.prev_score, $scope.score, $scope.beat, $scope.highest_score);
  };

  /* Start a new game */
  $scope.setUpGame = function(mode) {
    $scope.toggleChooseSolutionPopup();

    $scope.alienArray = {};
    $scope.dragged = false;  // Disable click event when start dragging
    $scope.zoominAliens = {};
    $scope.checked = false;
    $scope.colorArray = [];
    bucket2.initColors();

    // modelsName is a string in the form of 'level4b6_9'
    // Get level
    $scope.cur_level = $stateParams.id;

    // Request data from the server
    Restangular.all('api/levels/level/' + $scope.cur_level).getList().then((function (data) {
      $scope.maxModels = data.length;       // number of models
      // Get game id
      if((data[0][0]).indexOf('a') >= 0){
        $scope.cur_game = 1;
      } else{
        $scope.cur_game = 2;
      }

      for (var i = 0; i < $scope.maxModels; i++){
        aliens2.alienData.push({model: i, alien: []});
        var maxAliens = data[i][1].length;    // number of aliens in a model
        for (var j = 0; j < maxAliens; j++){
          var parsed_data = database2.parseData(data, i, j);
          aliens2.properties[i + "_" + j] = parsed_data.attributes;
          $scope.alienArray[i + "_" + j] = {id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.URL, color: "rgba(255,255,255,0.5)", illegal: "legal"};
          aliens2.alienData[i].alien.push({alien:j,
            prop: aliens2.properties[i + "_" + j]});
        }
      }
      database2.getShuffledArray($scope.alienArray);

      // Set scores
      $scope.get_highest_score();
      $scope.get_greedy();

      // Set buckets
      if (mode == "scratch") {
        $scope.createNewBucket();
      }
      // else if (mode == "saved") {
      //   $scope.restoreSavedBucket();
      // }
      else if (mode == "best") {
        $scope.restoreBestGame();
      }

    }), function (err) {
      alert("Unexpected error occured");
    });
  };

  $scope.createNewBucket = function() {
    aliens2.aliensInBucket = [];
    $scope.score = 0;
    $scope.prev_score = $scope.score;
    $scope.zoominAliens = {};

    // Set current bucket to index 0
    $scope.newGroup();
    $('#new_group').attr('disabled', true);
  }

  // $scope.restoreSavedBucket = function() {
  //   Restangular.all('api/scores/cur_user_solution/' + $scope.cur_level)
  //     .getList().then(function (serverJson) {
  //
  //     if (serverJson.length == 0) {
  //       $scope.createNewBucket();
  //       return;
  //     }
  //
  //     bucket2.buckets = serverJson[0].solution;
  //
  //     // Restore data structures
  //     for (var i = 0; i < bucket2.buckets.length; i++) {
  //       $scope.colorArray.push(bucket2.buckets[i].color);
  //       aliens2.aliensInBucket = aliens2.aliensInBucket.concat(bucket2.buckets[i].alien);
  //       bucket2.num_buckets++;
  //
  //       if (bucket2.predefinedColors[bucket2.buckets[i].color] == false) {
  //         bucket2.predefinedColors[bucket2.buckets[i].color] = true;
  //         bucket2.predefinedColorCounter++;
  //       }
  //     }
  //
  //     // Color aliens in buckets
  //     for (i = 0; i < bucket2.buckets.length; i++) {
  //       for (var j = 0; j < bucket2.buckets[i].alien.length; j++) {
  //         var alien_id = bucket2.buckets[i].alien[j];
  //         $scope.alienArray[alien_id].color = bucket2.buckets[i].color;
  //       }
  //     }
  //
  //     // Set current bucket to index 0
  //     $scope.score = update2.getNewScore($scope.maxModels);
  //     $('#new_group').attr('disabled', true);
  //   });
  // };

  $scope.restoreBestGame = function() {
    Restangular.all('api/scores/best_solution/' + $scope.cur_level)
      .getList().then(function (serverJson) {

      if (serverJson.length == 0) {
        $scope.createNewBucket();
        return;
      }

      bucket2.buckets = serverJson[0].solution;

      // Restore data structures
      for (var i = 0; i < bucket2.buckets.length; i++) {
        $scope.colorArray.push(bucket2.buckets[i].color);
        aliens2.aliensInBucket = aliens2.aliensInBucket.concat(bucket2.buckets[i].alien);
        bucket2.num_buckets++;

        // Assign colors to aliens in buckets
        for (var j = 0; j < bucket2.buckets[i].alien.length; j++) {
          var alien_id = bucket2.buckets[i].alien[j];
          $scope.alienArray[alien_id].color = bucket2.buckets[i].color;
        }

        if (bucket2.predefinedColors[bucket2.buckets[i].color] == false) {
          bucket2.predefinedColors[bucket2.buckets[i].color] = true;
          bucket2.predefinedColorCounter++;
        }
      }

      // Set current bucket to index 0
      $scope.score = update2.getNewScore($scope.maxModels);
      $('#new_group').attr('disabled', true);
      $scope.currentBucket(0);
    });
  };

  $scope.selectAlien = function (alien_id) {
    // Illegal Aliens
    if (bucket2.buckets[bucket2.current_bucket].illegal_alien.indexOf(alien_id) != -1) {
      // Aliens in other buckets, can be switched to current bucket when being clicked
      if (aliens2.aliensInBucket.indexOf(alien_id) != -1 && bucket2.buckets[bucket2.current_bucket].alien.indexOf(alien_id) == -1) {
        var bucket_id = bucket2.getBucketByAlienId(alien_id);
        bucket2.buckets[bucket_id].alien.splice(bucket2.buckets[bucket_id].alien.indexOf(alien_id), 1);
        aliens2.aliensInBucket.splice(aliens2.aliensInBucket.indexOf(alien_id), 1);
      }

      // Identify overlapping model and replace
      var model_num = helper2.get_model(alien_id);
      var bucket_aliens = bucket2.buckets[bucket2.current_bucket].alien;
      for (var i = 0; i < bucket_aliens.length; i++) {
        var temp_alien_id = bucket_aliens[i];
        var temp_model_num =helper2.get_model(temp_alien_id);
        if (temp_model_num == model_num) {
          bucket2.buckets[bucket2.current_bucket].alien[i] = alien_id;
          aliens2.aliensInBucket[aliens2.aliensInBucket.indexOf(temp_alien_id)] = alien_id;
          $scope.alienArray[temp_alien_id].color = "rgba(255,255,255,.5)";
          break;
        }
      }

      for (i = 0; i < bucket2.buckets.length; i++) {
        if (bucket2.buckets[i].alien.length == 0) {
          bucket2.updatePredefinedColor(bucket_id);
          $scope.colorArray.splice($scope.colorArray.indexOf(bucket2.buckets[i].color), 1);
          bucket2.buckets.splice(i, 1);
          bucket2.num_buckets--;
          break;
        }
      }

      $scope.alienArray[alien_id].color = bucket2.buckets[bucket2.current_bucket].color;
      $scope.currentBucket(bucket2.current_bucket);
      feedback(alien_id);
    }
    else {
      history2.historyBuckets = bucket2.buckets;
      history2.historyAliensInBucket = aliens2.aliensInBucket;
      history2.historyAlienId = alien_id;
      history2.historyColorArray = $scope.colorArray;

      // Aliens in other buckets, can be switched to current bucket when being clicked
      if (aliens2.aliensInBucket.indexOf(alien_id) != -1 && bucket2.buckets[bucket2.current_bucket].alien.indexOf(alien_id) == -1) {
        var bucket_id = bucket2.getBucketByAlienId(alien_id);
        bucket2.buckets[bucket_id].alien.splice(bucket2.buckets[bucket_id].alien.indexOf(alien_id), 1);
        bucket2.buckets[bucket2.current_bucket].alien.push(alien_id);

        history2.historyBucketId = bucket2.current_bucket;
        history2.historySwappedBucketId = bucket_id;
        history2.historySelectFlag = 2;
        history2.historyColor = bucket2.buckets[bucket_id].color;

        for (var i = 0; i < bucket2.buckets.length; i++) {
          if (bucket2.buckets[i].alien.length == 0) {
            bucket2.updatePredefinedColor(bucket_id);
            $scope.colorArray.splice($scope.colorArray.indexOf(bucket2.buckets[i].color), 1);
            bucket2.buckets.splice(i, 1);
            bucket2.num_buckets--;
            bucket2.current_bucket = bucket2.num_buckets - 1;
            break;
          }
        }

        $scope.alienArray[alien_id].color = bucket2.buckets[bucket2.current_bucket].color;
        $scope.currentBucket(bucket2.current_bucket);
        feedback(alien_id);
      }

      // Normal aliens
      else {
        if (!$scope.dragged) {
          history2.historySelectFlag = false;
          var ind = bucket2.buckets[bucket2.current_bucket].alien.indexOf(alien_id);

          //Deselect aliens
          if (ind >= 0) {
            history2.historySelectFlag = 1;

            // Remove the alien from the bucket
            aliens2.aliensInBucket.splice(aliens2.aliensInBucket.indexOf(alien_id), 1);
            bucket2.buckets[bucket2.current_bucket].alien.splice(ind, 1);

            if (bucket2.buckets[bucket2.current_bucket].alien.length == 0) {
              bucket2.updatePredefinedColor(bucket2.current_bucket);
              $scope.colorArray.splice(bucket2.current_bucket, 1);
              bucket2.buckets.splice(bucket2.current_bucket, 1);
              bucket2.num_buckets--;
              bucket2.current_bucket = bucket2.num_buckets - 1;
            }

            if (bucket2.buckets.length == 0) {
              $scope.newGroup();
            }
            else {
              $scope.alienArray[alien_id].color = "rgba(255,255,255,.5)";
              $scope.currentBucket(bucket2.current_bucket);
            }
            feedback(alien_id);
          }

          // Select aliens
          else {
            history2.historySelectFlag = 0;
            aliens2.aliensInBucket.push(alien_id);
            bucket2.buckets[bucket2.current_bucket].alien.push(alien_id);

            history2.historyBucketId = bucket2.current_bucket;

            $scope.alienArray[alien_id].color = bucket2.buckets[bucket2.current_bucket].color;

            $scope.currentBucket(bucket2.current_bucket);
            feedback(alien_id);
          }
        }
      }
    }
    if (Object.keys($scope.zoominAliens).length == 0) {
      $scope.newGroup();
    }
  }

  $scope.newGroup = function() {
    $scope.checked = false;
    $scope.colorArray = bucket2.addBucket($scope.colorArray, $scope.alienArray);

    for (var i = 0; i < Object.keys($scope.alienArray).length; i++) {
      var key = Object.keys($scope.alienArray)[i];
      if (bucket2.buckets[bucket2.current_bucket].illegal_alien.indexOf(key) < 0 &&
          aliens2.aliensInBucket.indexOf(key) < 0) {
        $scope.selectAlien(key);
        break;
      }
    }
  }

  $scope.showGroup = function(alien_id) {
    for (var i = 0;i< bucket2.buckets.length; i++) {
      if (bucket2.buckets[i].alien.indexOf(alien_id) != -1) {
        $scope.currentBucket(i);
      }
    }
  }

  $scope.get_highest_score = function (){
    Restangular.all('api/scores/game_scoreboard/' + parseInt($scope.cur_level))
      .getList().then(function (serverJson) {
        $scope.highest_score = serverJson[0].score;
      });
  };
  $scope.get_greedy = function() {
    Restangular.all('api/levels/getBeat/' + parseInt($scope.cur_level))
      .getList().then(function (serverJson) {
        $scope.beat = 1000;
      });
  };

  $scope.onStart = function(event) {
    $scope.dragged = true;
  };

  $scope.undo = function() {
    bucket2.buckets = history2.historyBuckets;
    aliens2.aliensInBucket = history2.historyAliensInBucket;
    $scope.colorArray = history2.historyColorArray;

    // Previously unselected alien, now we want to add it back
    if (history2.historySelectFlag == 1) {
      $("#" + history2.historyAlienId).css("background-color", bucket2.buckets[bucket2.current_bucket].color);
      update2.updateIllegalAlien($scope.alienArray, history2.historyBucketId);
      $scope.currentBucket(history2.historyBucketId);
      feedback(history2.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history2.historyBucketId).triggerHandler('click');
      }, 0);
    }

    // Previously selected alien, now we want remove it
    else if (history2.historySelectFlag == 0) {
      $("#" + history2.historyAlienId).css("background-color", "rgba(255,255,255,.5)");
      update2.updateIllegalAlien($scope.alienArray, history2.historyBucketId);
      $scope.currentBucket(history2.historyBucketId);
      feedback(history2.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history2.historyBucketId).triggerHandler('click');
      }, 0);
    }

    // Previously swapped alien, now we want to move it back to previous bucket
    // This includes change alien's color to previous bucket's color
    // If previous bucket was unfortunately removed, we want to add it back

    else {
      $("#" + history2.historyAlienId).css("background-color", history2.historyColor);
      update2.updateIllegalAlien($scope.alienArray, history2.historySwappedBucketId);
      $scope.currentBucket(history2.historySwappedBucketId);
      feedback(history2.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history2.historySwappedBucketId).triggerHandler('click');
      }, 0);
    }

    if (bucket2.buckets[history2.historyBucketId].alien.length == 0 && bucket2.buckets.length > 1) {
      // Check if removing a predefined color
      bucket2.updatePredefinedColor(history2.historyBucketId);
      bucket2.buckets.splice(history2.historyBucketId, 1);
      $scope.colorArray.splice(bucket2.buckets[history2.historyBucketId].color, 1);
      bucket2.num_buckets--;
    }

    bucket2.num_buckets = bucket2.buckets.length;
  }

  $scope.buttonReq = '';
  $scope.togglePopup = function(msg, req) {
    $("#overlay").toggle();
    $scope.buttonReq = req;
    $(".alert-msg").html(msg);
    $("#popup").toggle();
  }

  $scope.handleButtonRequest = function() {
    if ($scope.buttonReq == 'submit') {
      $scope.submitScore();
    }
    else if ($scope.buttonReq == 'save') {
      $scope.saveScore();
    }
    else if ($scope.buttonReq == 'quit') {
      $scope.quit();
    }
  }

  // Submit the score to the database
  $scope.submitScore = function () {
    Restangular.all('/api/scores/').post(
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level), solution: bucket2.buckets}).then(
      (function (data) {
        $state.go('levelcomplete', {level_id: parseInt($scope.cur_level), game_id: $scope.cur_game, score: $scope.score});
      }), function (err) {
      });
  }

  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/save_for_later').post(
      {level: parseInt($scope.cur_level), solution: bucket2.buckets}).then(
      (function (data) {
      }), function (err) {
        $state.go('levelcomplete', {level_id: parseInt($scope.cur_level), game_id: $scope.cur_game, score: $scope.score});
      });
  }

  $scope.logout = function () {
    Restangular.all('api/auths/logout').post(
    ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
  };

  $scope.quit = function (){
    $state.go('scoreboard');
  };

  $scope.toggleChooseSolutionPopup = function () {
    $("#overlay").toggle();
    $("#popup2").toggle();
  };

  $scope.toggleChooseSolutionPopup();

  // $scope.togglePageslide = function() {
  //   $scope.checked = !$scope.checked
  // }
});
