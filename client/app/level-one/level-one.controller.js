angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state, $timeout, update, helper, database, style, bucket, history, aliens) {
  $scope.alienArray = [];
  $scope.score = 0;
  $scope.prev_score = $scope.score;
  $scope.dragged = false;  // Disable click event when start dragging
  $scope.pageslide = false;
  $scope.zoominAliens = [];
  $scope.checked = false;
  $scope.colorArray = [];
  $scope.initStateBuckets = null;

  $scope.currentBucket = function(curBucket) {
    bucket.currentBucket(curBucket, $scope.alienArray);
    update.updateIllegalAlien($scope.alienArray, curBucket);
  };

  var feedback = function(alienId) {
    $scope.prev_score = $scope.score;
    $scope.score = update.getNewScore(alienId, $scope.score, $scope.maxModels);
    update.showSmallFeedback($scope.prev_score, $scope.score, alienId);
    update.showBigFeedback($scope.prev_score, $scope.score, $scope.beat, $scope.highest_score);
  };

  /* Parse data for the game */
  $(document).ready(function() {
    // Add the first bucket
    var init_color = bucket.getRandomColor();
    bucket.buckets.push({alien:[], illegal_alien:[], color:init_color});
    $scope.colorArray.push({color:init_color});
    bucket.num_buckets++;

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
          $scope.alienArray.push({id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.Alien.url});
          aliens.alienData[i].alien.push({alien:j,
            prop: aliens.properties[i + "_" + j]});
        }
      }
      database.getShuffledArray($scope.alienArray);

      // Set scores
      $scope.get_highest_score();
      $scope.get_greedy();

      // Set current bucket to index 0
      $scope.currentBucket(0);
      $('#new_group').attr('disabled', true);

    }), function (err) {
      alert("Unexpected error occured");
    });
  });

  // $scope.selectedAlien = function (alien_id) {
  //   var url = $scope.getUrl($scope.get_model(alien_id), $scope.get_alien(alien_id));
  //   $("#img-container").html("<img width='300px' src='" + url + "' />");
  // };

  $scope.selectAlien = function (alien_id) {
    // Illegal Aliens
    if (bucket.buckets[bucket.current_bucket].illegal_alien.indexOf(alien_id) != -1) {
      return;
    }
    else {
      history.historyBuckets = bucket.buckets;
      history.historySelectedAliens = aliens.selectedAliens;
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

        $("#" + alien_id).css( "background-color", bucket.buckets[bucket.current_bucket].color);
        // $("#" + alien_id).css( "border", "3px solid" + bucket.buckets[bucket.current_bucket].color);
        // $("#" + alien_id).css( "border-radius", "15px");

        if (bucket.buckets[bucket_id].alien.length == 0 && bucket.buckets.length > 1) {
          bucket.updatePredefinedColor(bucket_id);
          bucket.buckets.splice(bucket_id, 1);
          $scope.colorArray.splice(bucket_id, 1);
          bucket.num_buckets--;
          bucket.current_bucket = bucket.num_buckets - 1;
        }
      }

      // Normal aliens
      else {
        //Deselect aliens
        if (!$scope.dragged) {
          history.historySelectFlag = false;
          var ind = aliens.selectedAliens.indexOf(alien_id);
          if (ind >= 0) {
            history.historySelectFlag = 1;

            $("#" + alien_id).css("background-color", "rgba(255,255,255,.5)");
            // $("#" + alien_id).css( "border", "0px");

            aliens.selectedAliens.splice(ind, 1);

            // Remove the alien from the bucket
            var bucket_id = bucket.getBucketByAlienId(alien_id);
            aliens.aliensInBucket.splice(aliens.aliensInBucket.indexOf(alien_id), 1);
            bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);

            if (bucket.buckets[bucket_id].alien.length == 0 && bucket.buckets.length > 1) {
              bucket.updatePredefinedColor(bucket_id);
              bucket.buckets.splice(bucket_id, 1);
              $scope.colorArray.splice(bucket_id, 1);
              bucket.num_buckets--;
              bucket.current_bucket = bucket.num_buckets - 1;
            }
          }

          // Select aliens
          else {
            history.historySelectFlag = 0;
            aliens.selectedAliens.push(alien_id);
            aliens.aliensInBucket.push(alien_id);
            bucket.buckets[bucket.current_bucket].alien.push(alien_id);

            history.historyBucketId = bucket.current_bucket;

            $("#" + alien_id).css("background-color", bucket.buckets[bucket.current_bucket].color);
            // $("#" + alien_id).css( "border", "3px solid" + bucket.buckets[bucket.current_bucket].color);
            // $("#" + alien_id).css( "border-radius", "15px");
          }
        }
      }
      update.updateIllegalAlien($scope.alienArray, bucket.current_bucket);
      $scope.currentBucket(bucket.current_bucket);
      feedback(alien_id);
    }

    //if (bucket.buckets.length == 0 || bucket.buckets[bucket.num_buckets - 1].alien.length == 0) {
    //  $('#new_group').attr('disabled', true);
    //} else {
    //  $('#new_group').attr('disabled', false);
    //}

  }

  $scope.newGroup = function() {
    $scope.colorArray = bucket.addBucket($scope.colorArray, $scope.alienArray);
    $('#new_group').attr('disabled', true);
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

  // ZOOMING

  // TODO: Add zoomin icon
  // $scope.onDropZoom = function(event, ui) {
  //   var alien_id = ui.draggable.attr('id');
  //   var id = $scope.get_alien(alien_id);
  //   var model = $scope.get_model(alien_id);
  //
  //   var ind = $scope.zoominAliens.indexOf(alien_id);
  //
  //   // Already in the zoom-in list
  //   if (ind < 0) {
  //     $scope.zoominAliens.push(alien_id);
  //     $("#" + alien_id).css('box-shadow', 'rgb(178,34,34) 0 0 10px');
  //     $("#" + alien_id).css('border-radius', '10px');
  //     //$("#" + alien_id).css('outline-width', '1px');
  //     //$("#" + alien_id).css('outline-color', 'red');
  //     //$("#" + alien_id)overlay;
  //   }
  //
  //   $scope.dragged = false;
  // };

  $scope.onStart = function(event) {
    $scope.dragged = true;
  };

  $scope.togglePageslide = function() {
    $scope.checked = !$scope.checked
  }

  $scope.unzoomAlien = function(id) {
    var ind = $scope.zoominAliens.indexOf(id);
    $scope.zoominAliens.splice(ind, 1);
    $("#" + id).css('box-shadow', 'none');
    //$("#" + id).removeClass("zoomin-small-alien");
  }


  //
  //$scope.$watch('buckets', function() {
  //  $scope.$digest();
  //});

  $scope.undo = function() {
    bucket.buckets = history.historyBuckets;
    aliens.selectedAliens = history.historySelectedAliens;
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
      $scope.colorArray.splice(history.historyBucketId, 1);
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
      $scope.saveScore();
    }
    else if ($scope.buttonReq == 'quit') {
      $scope.quit();
    }
  }

  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/').post(
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level), solution: bucket.buckets}).then(
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
  };

  $scope.quit = function (){
    $state.go('scoreboard');
  };

  $scope.setBuckets = function(type) {
    if (type == 'best') {
      Restangular.all('api/scores/best_solution/' + $stateParams.id).post(
      ).then((function (data) {
        $scope.initStateBuckets = data;
      }), function (err) {

      });
    } else if (type == 'saved') {
      Restangular.all('api/scores/cur_user_solution/' + $stateParams.id).post(
      ).then((function (data) {
        $scope.initStateBuckets = data;
      }), function (err) {

      });
    }
  };

});
