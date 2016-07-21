angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state, $timeout, update, helper, database, style, bucket, history, aliens) {

  $scope.currentBucket = function(curBucket) {
    $scope.alienArray = update.updateIllegalAlien($scope.alienArray, curBucket);
    $scope.zoominAliens = bucket.currentBucket(curBucket, $scope.alienArray);
  };

  var feedback = function(alienId) {
    $scope.prev_score = $scope.score;
    $scope.score = update.getNewScore($scope.maxModels);
    update.showSmallFeedback($scope.prev_score, $scope.score, alienId);
    update.showBigFeedback($scope.prev_score, $scope.score, $scope.beat, $scope.highest_score);
  };

  /* Start a new game */
  $scope.setUpGame = function(mode) {
    $scope.toggleChooseSolutionPopup();

    $scope.alienArray = {};
    $scope.dragged = false;  // Disable click event when start dragging
    $scope.zoominAliens = {};
    $scope.checked = false;
    $scope.colorArray = [];
    bucket.initColors();

    // modelsName is a string in the form of 'level4b6_9'
    // Get level
    $scope.cur_level = $stateParams.id;

    // Request data from the server
    Restangular.all('api/levels/level/' + $scope.cur_level).getList().then((function (data) {

      $scope.maxModels = data.length;       // number of models
      $scope.maxAliens = data[0].length;    // number of aliens in a model
      // Get game id
      if((data[0][0].modelsName).indexOf('a') >= 0){
        $scope.cur_game = 1;
      } else{
        $scope.cur_game = 2;
      }

      for (var i = 0; i < $scope.maxModels; i++){
        aliens.alienData.push({model: i, alien: []});
        for (var j = 0; j < $scope.maxAliens; j++){
          var parsed_data = database.parseData(i, j, data, $scope.maxModels, $scope.maxAliens);
          aliens.properties[i + "_" + j] = parsed_data.attributes;
          $scope.alienArray[i + "_" + j] = {id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.Alien.url, color: "rgba(255,255,255,0.5)", illegal: "legal-alien"};
          aliens.alienData[i].alien.push({alien:j,
            prop: aliens.properties[i + "_" + j]});
        }
      }
      database.getShuffledArray($scope.alienArray);

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
    aliens.aliensInBucket = [];
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
  //     bucket.buckets = serverJson[0].solution;
  //
  //     // Restore data structures
  //     for (var i = 0; i < bucket.buckets.length; i++) {
  //       $scope.colorArray.push(bucket.buckets[i].color);
  //       aliens.aliensInBucket = aliens.aliensInBucket.concat(bucket.buckets[i].alien);
  //       bucket.num_buckets++;
  //
  //       if (bucket.predefinedColors[bucket.buckets[i].color] == false) {
  //         bucket.predefinedColors[bucket.buckets[i].color] = true;
  //         bucket.predefinedColorCounter++;
  //       }
  //     }
  //
  //     // Color aliens in buckets
  //     for (i = 0; i < bucket.buckets.length; i++) {
  //       for (var j = 0; j < bucket.buckets[i].alien.length; j++) {
  //         var alien_id = bucket.buckets[i].alien[j];
  //         $scope.alienArray[alien_id].color = bucket.buckets[i].color;
  //       }
  //     }
  //
  //     // Set current bucket to index 0
  //     $scope.score = update.getNewScore($scope.maxModels);
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

      bucket.buckets = serverJson[0].solution;

      // Restore data structures
      for (var i = 0; i < bucket.buckets.length; i++) {
        $scope.colorArray.push(bucket.buckets[i].color);
        aliens.aliensInBucket = aliens.aliensInBucket.concat(bucket.buckets[i].alien);
        bucket.num_buckets++;

        if (bucket.predefinedColors[bucket.buckets[i].color] == false) {
          bucket.predefinedColors[bucket.buckets[i].color] = true;
          bucket.predefinedColorCounter++;
        }
      }

      // Color aliens in buckets
      for (i = 0; i < bucket.buckets.length; i++) {
        for (var j = 0; j < bucket.buckets[i].alien.length; j++) {
          var alien_id = bucket.buckets[i].alien[j];
          $scope.alienArray[alien_id].color = bucket.buckets[i].color;
        }
      }

      // Set current bucket to index 0
      $scope.score = update.getNewScore($scope.maxModels);
      $('#new_group').attr('disabled', true);
      $scope.currentBucket(0);
    });
  };

  $scope.selectAlien = function (alien_id) {
    // Illegal Aliens
    if (bucket.buckets[bucket.current_bucket].illegal_alien.indexOf(alien_id) != -1) {
      return;
    }
    else {
      history.historyBuckets = bucket.buckets;
      history.historyAliensInBucket = aliens.aliensInBucket;
      history.historyAlienId = alien_id;
      history.historyColorArray = $scope.colorArray;

      // Aliens in other buckets, can be switched to current bucket when being clicked
      if (aliens.aliensInBucket.indexOf(alien_id) != -1 && bucket.buckets[bucket.current_bucket].alien.indexOf(alien_id) == -1) {
        var bucket_id = bucket.getBucketByAlienId(alien_id);
        bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);
        bucket.buckets[bucket.current_bucket].alien.push(alien_id);

        history.historyBucketId = bucket.current_bucket;
        history.historySwappedBucketId = bucket_id;
        history.historySelectFlag = 2;
        history.historyColor = bucket.buckets[bucket_id].color;

        for (var i = 0; i < bucket.buckets.length; i++) {
          if (bucket.buckets[i].alien.length == 0) {
            bucket.updatePredefinedColor(bucket_id);
            bucket.buckets.splice(i, 1);
            $scope.colorArray.splice($scope.colorArray.indexOf(bucket.buckets[i].color), 1);
            bucket.num_buckets--;
            bucket.current_bucket = bucket.num_buckets - 1;
            break;
          }
        }

        $scope.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
        $scope.currentBucket(bucket.current_bucket);
        feedback(alien_id);
      }

      // Normal aliens
      else {
        if (!$scope.dragged) {
          history.historySelectFlag = false;
          var ind = bucket.buckets[bucket.current_bucket].alien.indexOf(alien_id);

          //Deselect aliens
          if (ind >= 0) {
            history.historySelectFlag = 1;

            // Remove the alien from the bucket
            aliens.aliensInBucket.splice(aliens.aliensInBucket.indexOf(alien_id), 1);
            bucket.buckets[bucket.current_bucket].alien.splice(ind, 1);

            if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
              bucket.updatePredefinedColor(bucket.current_bucket);
              bucket.buckets.splice(bucket.current_bucket, 1);
              $scope.colorArray.splice(bucket.current_bucket, 1);
              bucket.num_buckets--;
              bucket.current_bucket = bucket.num_buckets - 1;
            }

            if (bucket.buckets.length == 0) {
              $scope.newGroup();
            }
            else {
              $scope.alienArray[alien_id].color = "rgba(255,255,255,.5)";
              $scope.currentBucket(bucket.current_bucket);
            }
            feedback(alien_id);
          }

          // Select aliens
          else {
            history.historySelectFlag = 0;
            aliens.aliensInBucket.push(alien_id);
            bucket.buckets[bucket.current_bucket].alien.push(alien_id);

            history.historyBucketId = bucket.current_bucket;

            $scope.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;

            $scope.currentBucket(bucket.current_bucket);
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
    $scope.colorArray = bucket.addBucket($scope.colorArray, $scope.alienArray);

    for (var i = 0; i < Object.keys($scope.alienArray).length; i++) {
      var key = Object.keys($scope.alienArray)[i];
      if (bucket.buckets[bucket.current_bucket].illegal_alien.indexOf(key) < 0 &&
          aliens.aliensInBucket.indexOf(key) < 0) {
        $scope.selectAlien(key);
        break;
      }
    }
  }

  $scope.showGroup = function(alien_id) {
    for (var i = 0;i< bucket.buckets.length; i++) {
      if (bucket.buckets[i].alien.indexOf(alien_id) != -1) {
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
    bucket.buckets = history.historyBuckets;
    aliens.aliensInBucket = history.historyAliensInBucket;
    $scope.colorArray = history.historyColorArray;

    // Previously unselected alien, now we want to add it back
    if (history.historySelectFlag == 1) {
      $("#" + history.historyAlienId).css("background-color", bucket.buckets[bucket.current_bucket].color);
      update.updateIllegalAlien($scope.alienArray, history.historyBucketId);
      $scope.currentBucket(history.historyBucketId);
      feedback(history.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history.historyBucketId).triggerHandler('click');
      }, 0);
    }

    // Previously selected alien, now we want remove it
    else if (history.historySelectFlag == 0) {
      $("#" + history.historyAlienId).css("background-color", "rgba(255,255,255,.5)");
      update.updateIllegalAlien($scope.alienArray, history.historyBucketId);
      $scope.currentBucket(history.historyBucketId);
      feedback(history.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history.historyBucketId).triggerHandler('click');
      }, 0);
    }

    // Previously swapped alien, now we want to move it back to previous bucket
    // This includes change alien's color to previous bucket's color
    // If previous bucket was unfortunately removed, we want to add it back

    else {
      $("#" + history.historyAlienId).css("background-color", history.historyColor);
      update.updateIllegalAlien($scope.alienArray, history.historySwappedBucketId);
      $scope.currentBucket(history.historySwappedBucketId);
      feedback(history.historyAlienId);

      $timeout(function() {
        angular.element('#color_block_' + history.historySwappedBucketId).triggerHandler('click');
      }, 0);
    }

    if (bucket.buckets[history.historyBucketId].alien.length == 0 && bucket.buckets.length > 1) {
      // Check if removing a predefined color
      bucket.updatePredefinedColor(history.historyBucketId);
      bucket.buckets.splice(history.historyBucketId, 1);
      $scope.colorArray.splice(bucket.buckets[history.historyBucketId].color, 1);
      bucket.num_buckets--;
    }

    bucket.num_buckets = bucket.buckets.length;
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
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level), solution: bucket.buckets}).then(
      (function (data) {
        $state.go('levelcomplete', {level_id: parseInt($scope.cur_level), game_id: $scope.cur_game, score: $scope.score});
      }), function (err) {
      });
  }

  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/save_for_later').post(
      {level: parseInt($scope.cur_level), solution: bucket.buckets}).then(
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
