'use strict';

angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state, $timeout, update, helper, database, style, bucket, history, aliens) {
  $scope.alienArray = {};
  $scope.dragged = false;  // Disable click event when start dragging
  $scope.zoominAliens = {};
  $scope.checked = false;
  $scope.colorArray = [];

  $scope.bucket = bucket;

  $scope.currentBucket = function(curBucket) {
    update.updateIllegalAlien($scope.alienArray, curBucket);
    $scope.zoominAliens = bucket.currentBucket(curBucket, $scope.alienArray);
    if (Object.keys($scope.zoominAliens).length > 0) {
      $scope.checked = true;
      $('#aliens').css('width',  $(window).width() - $('#section').width());
    }
    else {
      $scope.checked = false;
      $('#aliens').css('width', '97%');
    }
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
        aliens.alienData.push({model: i + 1, alien: []});
        $scope.maxAliens = data[i][1].length;    // number of aliens in a model
        for (var j = 0; j < $scope.maxAliens; j++){
          //var parsed_data = database.parseData(i + 1, j, data, $scope.maxModels + 1, $scope.maxAliens);
          var parsed_data = _.find(data[i][1], function (alien) {
            var m = alien.modelsName.split(/a|b/)[1].split("_")[0];
            var a = alien.modelsName.split(/a|b/)[1].split("_")[1];
            return (m == (i + 1)) && (a == j);
          });
          aliens.properties[i + "_" + j] = parsed_data.attributes;
          $scope.alienArray[i + "_" + j] = {id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.URL, color: "rgba(218,245,255, 1)"};
          aliens.alienData[i].alien.push({alien:j,
            prop: aliens.properties[i + "_" + j]});
        }
      }
      $scope.alienArray = database.shuffleProperties($scope.alienArray);

      // Set scores
      $scope.get_highest_score();
      $scope.get_greedy();

      // Set buckets
      if (mode == "scratch") {
        $scope.createNewBucket();
      }
      else if (mode == "saved") {
        $scope.restoreSavedBucket();
      }
      else if (mode == "best") {
        $scope.restoreBestGame();
      }

    }), function (err) {
      alert("Unexpected error occured");
    });
  };

  $scope.createNewBucket = function() {
    var init_color = bucket.getRandomColor();
    bucket.buckets = [{alien:[], illegal_alien:[], color:init_color}];
    $scope.colorArray = [init_color];
    bucket.num_buckets = 1;
    aliens.aliensInBucket = [];
    $scope.score = 0;
    $scope.prev_score = $scope.score;
    $scope.zoominAliens = {};
    $scope.colorArray = [];

    // Set current bucket to index 0
    $scope.currentBucket(0);
    $('#new_group').attr('disabled', true);
  }

  $scope.restoreSavedBucket = function() {
    Restangular.all('api/scores/cur_user_solution/' + $scope.cur_level)
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
      console.log(update.getNewScore($scope.maxModels));
      $scope.score = update.getNewScore($scope.maxModels);
      $('#new_group').attr('disabled', true);
    });
  };

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
      console.log(update.getNewScore($scope.maxModels));
      $scope.score = update.getNewScore($scope.maxModels);
      $('#new_group').attr('disabled', true);
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

        if (bucket.buckets[bucket_id].alien.length == 0 && bucket.buckets.length > 1) {
          bucket.updatePredefinedColor(bucket_id);
          bucket.buckets.splice(bucket_id, 1);
          $scope.colorArray.splice($scope.colorArray.indexOf(bucket.buckets[bucket_id].color), 1);
          bucket.num_buckets--;
          bucket.current_bucket = bucket.num_buckets - 1;
        }
        $scope.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;

        update.updateIllegalAlien($scope.alienArray, bucket.current_bucket);
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

            if (bucket.buckets[bucket.current_bucket].alien.length == 0 && bucket.buckets.length > 1) {
              bucket.updatePredefinedColor(bucket.current_bucket);
              bucket.buckets.splice(bucket.current_bucket, 1);
              $scope.colorArray.splice(bucket.current_bucket, 1);
              bucket.num_buckets--;
              bucket.current_bucket = bucket.num_buckets - 1;
            }

            $scope.alienArray[alien_id].color = "rgba(218,245,255, 1)";

            $scope.currentBucket(bucket.current_bucket);
            update.updateIllegalAlien($scope.alienArray, bucket.current_bucket);
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
            update.updateIllegalAlien($scope.alienArray, bucket.current_bucket);
            feedback(alien_id);
          }
        }
      }
    }
  }

  $scope.newGroup = function() {
    $scope.zoominAliens = {};
    $scope.checked = false;
    $scope.colorArray = bucket.addBucket($scope.colorArray, $scope.alienArray);
    $('#new_group').attr('disabled', true);
    update.updateIllegalAlien($scope.alienArray, bucket.current_bucket);
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
        // $scope.highest_score = serverJson[0].score;
        $scope.highest_score = 1000;
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
      $("#" + history.historyAlienId).css("background-color", "rgba(255,255,255,1)");
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

  $scope.showHighlightAlien = function(alien_id, enter) {
    var element = document.getElementById(alien_id);

    if (enter) {
      style.scrollToItem(element);
      $("#" + alien_id).addClass('highlight-hover');
      $("#zoomed" + alien_id).addClass('zoomed-highlight-hover');
      setTimeout(function(){
        $("#" + alien_id).removeClass('highlight-hover');
      }, 2000);
    } else {
      $("#zoomed" + alien_id).removeClass('zoomed-highlight-hover');
    }
  }

  // Submit the score to the database
  $scope.submitScore = function () {
    Restangular.all('/api/scores/').post(
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level), solution: bucket.buckets}).then(
      (function (data) {
        $state.go('leaderboard', {prevState: 'game'});
      }), function (err) {
      });
  }

  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/save_for_later').post(
      {level: parseInt($scope.cur_level), solution: bucket.buckets}).then(
      (function (data) {
      }), function (err) {
        $state.go('leaderboard', {prevState: 'game'});
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

  $scope.endGame = function () {
    $("#overlay").toggle();
    $("#popup3").toggle();
  };

  $scope.toggleChooseSolutionPopup();

  $scope.togglePageslide = function() {
    $scope.checked = !$scope.checked;
  }

  $scope.$watch
  (
    function () {
      return $('#section').width();
    },
    function (newValue, oldValue) {
      if (newValue != oldValue) {
        $('.sidenav').css('width', newValue);
        $('#aliens').css('width',  $(window).width() - newValue - 40);
      }
    }
  );
});
