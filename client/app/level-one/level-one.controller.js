'use strict';

angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state, $timeout, update, helper, database, style, bucket, history, aliens) {

  $scope.currentBucket = function(curBucket) {
    // Currently we are using the FIRST highlighting algorithm. Second => 2, Third => 3.
    bucket.currentBucket(curBucket, 1);
    bucket.orderAlienArray();
    update.updateIllegalAlien();
    if (aliens.zoominAliens.length > 0) {
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
    $scope.bucket = bucket;
    $scope.aliens = aliens;
    $scope.history = history;

    $scope.toggleChooseSolutionPopup();
    $scope.dragged = false;  // Disable click event when start dragging
    $scope.checked = false;
    bucket.initColors();
    aliens.initAliens();

    // Get top window's height
    $scope.topWindowHeight = window.innerWidth * 0.095 + 20;
    console.log($scope.topWindowHeight);

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
        var maxAliens = data[i][1].length;    // number of aliens in a model
        for (var j = 0; j < maxAliens; j++){
          var parsed_data = database.parseData(data, i, j);
          aliens.properties[i + "_" + j] = parsed_data.attributes;
          aliens.alienArray[i + "_" + j] = {
            id: i + "_" + j,
            model: "model" + i,
            alien: j,
            url: parsed_data.URL,
            color: "rgba(232,245,252, 1)",
            illegal: "legal-alien",
            similar: "not-simialr",
            in: false};
          aliens.alienData[i].alien.push({alien:j,
            prop: aliens.properties[i + "_" + j]});
        }
      }
      database.shuffleProperties();

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
    $scope.newGroup();
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
        bucket.colorArray.push(bucket.buckets[i].color);
        bucket.num_buckets++;

        if (bucket.predefinedColors[bucket.buckets[i].color] == false) {
          bucket.predefinedColors[bucket.buckets[i].color] = true;
          bucket.predefinedColorCounter++;
        }

        for (var j = 0; j < bucket.buckets[i].alien.length; j++) {
          var alien_id = bucket.buckets[i].alien[j];
          aliens.alienArray[alien_id].color = bucket.buckets[i].color;
          aliens.alienArray[alien_id].in = true;
        }
      }

      // Create a new bucket
      $scope.score = update.getNewScore($scope.maxModels);
      $scope.newGroup();
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
        bucket.colorArray.push(bucket.buckets[i].color);
        bucket.num_buckets++;

        if (bucket.predefinedColors[bucket.buckets[i].color] == false) {
          bucket.predefinedColors[bucket.buckets[i].color] = true;
          bucket.predefinedColorCounter++;
        }

        for (var j = 0; j < bucket.buckets[i].alien.length; j++) {
          var alien_id = bucket.buckets[i].alien[j];
          aliens.alienArray[alien_id].color = bucket.buckets[i].color;
          aliens.alienArray[alien_id].in = true;
        }
      }

      // Set current bucket to index 0
      $scope.score = update.getNewScore($scope.maxModels);
      $scope.newGroup();
    });
  };

  $scope.selectAlien = function (alien_id) {

    $("." + alien_id).addClass('highlight-hover');
    $("." + alien_id).removeClass('highlight-hover');

    // Illegal Aliens
    if (aliens.alienArray[alien_id].illegal == 'illegal') {
      // Find the alien that conflicts with the given alien
      var currentAliens = bucket.buckets[bucket.current_bucket].alien;
      for (var i = 0; i < currentAliens.length; i++) {
        var oldId = currentAliens[i];
        if (helper.get_model(alien_id) == helper.get_model(oldId)) {
          aliens.newId = alien_id;
          aliens.oldId = oldId;
          break;
        }
      }
      var oldAlien = document.getElementsByClassName("alien " + oldId)[0];
      //window.scrollTo(0, oldAlien.offsetTop);
      $scope.toggleIllegalAlert();
    }
    else {
      history.historyBuckets = bucket.buckets;
      history.historyAliensInBucket = aliens.aliensInBucket;
      history.historyAlienId = alien_id;
      history.historyColorArray = bucket.colorArray;

      // Aliens in other buckets, can be switched to current bucket when being clicked
      if (aliens.alienArray[alien_id].in && bucket.buckets[bucket.current_bucket].color != aliens.alienArray[alien_id].color) {
        var bucket_id = bucket.getBucketByAlienId(alien_id);
        bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);
        bucket.buckets[bucket.current_bucket].alien.push(alien_id);

        history.historyBucketId = bucket.current_bucket;
        history.historySwappedBucketId = bucket_id;
        history.historySelectFlag = 2;
        history.historyColor = bucket.buckets[bucket_id].color;

        if (bucket.buckets[bucket_id].alien.length == 0) {
          bucket.removeBucket(bucket_id);
          if (bucket_id < bucket.current_bucket) {
            bucket.current_bucket--;
          }
        }

        aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
        $scope.currentBucket(bucket.current_bucket);
        feedback(alien_id);
        history.userActions.push("Remove alien " + alien_id + " from bucket " + bucket_id);
        history.userActions.push("Add alien " + alien_id + " to bucket " + bucket.current_bucket);
      }

      // Normal aliens
      else {
        if (!$scope.dragged) {
          history.historySelectFlag = false;

          // Alien already in bucket, Deselect aliens
          if (aliens.alienArray[alien_id].color == bucket.buckets[bucket.current_bucket].color) {
            history.historySelectFlag = 1;

            // Remove the alien from the bucket
            var ind = bucket.buckets[bucket.current_bucket].alien.indexOf(alien_id);
            aliens.alienArray[alien_id].in = false;
            bucket.buckets[bucket.current_bucket].alien.splice(ind, 1);

            if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
              $scope.checked = false;
            }

            aliens.alienArray[alien_id].color = "rgba(232,245,252, 1)";
            $scope.currentBucket(bucket.current_bucket);
            feedback(alien_id);
            history.userActions.push("Remove alien " + alien_id + " from bucket " + bucket.current_bucket);
          }

          // Select aliens
          else {
            history.historySelectFlag = 0;
            bucket.buckets[bucket.current_bucket].alien.push(alien_id);

            history.historyBucketId = bucket.current_bucket;

            aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
            aliens.alienArray[alien_id].in = true;
            $scope.currentBucket(bucket.current_bucket);
            feedback(alien_id);
            history.userActions.push("Add alien " + alien_id + " to bucket " + bucket.current_bucket);
          }
        }
      }
    }
    $("." + alien_id).removeClass('highlight-hover');
    $("." + alien_id).addClass('highlight-hover');
    setTimeout(function(){
      $("." + alien_id).removeClass('highlight-hover');
    }, 2000);
  };

  $scope.selectIllegalAlien = function(opt) {
    $scope.toggleIllegalAlert();
    if (!opt) {
      return;
    }
    // Aliens in some other bucket, can be switched to current bucket when being clicked
    if (aliens.alienArray[aliens.newId].in) {
      var bucket_id = bucket.getBucketByAlienId(aliens.newId);
      bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(aliens.newId), 1);
      history.userActions.push("Remove alien " + aliens.newId + " from bucket " + bucket_id);

      if (bucket.buckets[bucket_id].alien.length == 0) {
        bucket.removeBucket(bucket_id);
        if (bucket_id < bucket.current_bucket) {
          bucket.current_bucket--;
        }
      }
    }
    else {
      bucket.buckets[bucket.current_bucket].alien[bucket.buckets[bucket.current_bucket].alien.indexOf(aliens.oldId)] = aliens.newId;
      aliens.alienArray[aliens.oldId].color = "rgba(232,245,252, 1)";
      aliens.alienArray[aliens.oldId].in = false;
      history.userActions.push("Remove alien " + aliens.oldId + " from bucket " + bucket.current_bucket);
    }

    aliens.alienArray[aliens.newId].color = bucket.buckets[bucket.current_bucket].color;
    aliens.alienArray[aliens.newId].in = true;
    $scope.currentBucket(bucket.current_bucket);
    feedback(aliens.newId);

    history.userActions.push("Add alien " + aliens.newId + " to bucket " + bucket.current_bucket);
  };

  $scope.newGroup = function() {
    $scope.checked = false;
    bucket.addBucket();
  }

  $scope.showGroup = function(alien_id) {
    // If alien not in bucket
    if (!aliens.alienArray[alien_id].in) {
      return;
    }
    // If no alien in the current bucket, remove it
    if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
      bucket.removeBucket(bucket.current_bucket);
    }
    var bid = bucket.getBucketByAlienId(alien_id);
    history.userActions.push("Go to bucket " + bid);
    $scope.currentBucket(bid);
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
      $("#" + history.historyAlienId).css("background-color", "rgba(232,245,252,, 1)");
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

  // $scope.showHighlightAlien = function(alien_id, enter) {
  //   var element = document.getElementById(alien_id);
  //
  //   if (enter) {
  //     style.scrollToItem(element);
  //     aliens.alienArray[alien_id].highlightHover = 'highlight-hover';
  //     aliens.alienArray[alien_id].zoomedHighlightHover = 'zoomed-highlight-hover';
  //     setTimeout(function(){
  //       aliens.alienArray[alien_id].highlightHover = '';
  //     }, 2000);
  //   } else {
  //     aliens.alienArray[alien_id].zoomedHighlightHover = '';
  //   }
  // }
  $scope.showHighlightAlien = function(alien_id) {
    var target = document.getElementsByClassName("an-alien " + alien_id)[0];
    window.scrollTo(0, target.offsetTop - $scope.topWindowHeight - 10);

    $(".an-alien." + alien_id).removeClass('highlight-hover');
    $(".an-alien." + alien_id).addClass('highlight-hover');
    setTimeout(function(){
      $(".an-alien." + alien_id).removeClass('highlight-hover');
    }, 2000);

    // if (enter) {
    //   style.scrollToItem(element);
    //   $("." + alien_id).addClass('highlight-hover');
    //   $(".zoomed-alien." + alien_id).addClass('zoomed-highlight-hover');
    //   setTimeout(function(){
    //     $("." + alien_id).removeClass('highlight-hover');
    //   }, 2000);
    // } else {
    //   $(".zoomed-alien." + alien_id).removeClass('zoomed-highlight-hover');
    // }
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

  $scope.toggleIllegalAlert = function() {
    $(".current-alien." + aliens.oldId).toggleClass("replaced");
    $("#clear-overlay").toggle();
    $("#replace-popup").toggle();
  };

  $scope.goToGroup = function () {
    var alien_id = bucket.buckets[bucket.current_bucket].alien[0];
    var element = document.getElementsByClassName(alien_id)[0];
    style.scrollToItem(element);
  };

  window.onresize = function(event) {
    $scope.topWindowHeight = window.innerWidth * 0.095 + 20;
  };

});
