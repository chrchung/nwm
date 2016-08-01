'use strict';

angular.module('nwmApp')
  .controller('LevelOneController',
  function($scope, Restangular, $stateParams, $state, $timeout, $localStorage, update, helper, database,
           style, bucket, aliens) {

    $scope.$storage = $localStorage;
    $scope.undo_key_pointer = 0;

    // Clear the undo storage
    $( document ).ready(function() {
      delete $scope.$storage.buckets;
      delete $scope.$storage.aliens;
    });

    $scope.currentBucket = function(curBucket) {
    // Currently we are using the FIRST highlighting algorithm. Second => 2, Third => 3.
    bucket.currentBucket(curBucket, 1);
    //bucket.orderAlienArray();
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

      $scope.toggleChooseSolutionPopup();
      $scope.dragged = false;  // Disable click event when start dragging
      $scope.checked = false;
      bucket.initColors();
      aliens.initAliens();

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
              color: "rgba(255,255,255, 0)",
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
      // Illegal Aliens
      if (aliens.alienArray[alien_id].illegal == 'illegal') {
         // Aliens in other buckets, can be switched to current bucket when being clicked
         if (aliens.alienArray[alien_id].in) {
           var bucket_id = bucket.getBucketByAlienId(alien_id);
           bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);
         }

         // Identify overlapping model and replace
         var model_num = helper.get_model(alien_id);
         var bucket_aliens = bucket.buckets[bucket.current_bucket].alien;
         for (var i = 0; i < bucket_aliens.length; i++) {
           var temp_alien_id = bucket_aliens[i];
           var temp_model_num =helper.get_model(temp_alien_id);
           if (temp_model_num == model_num) {
             bucket.buckets[bucket.current_bucket].alien[i] = alien_id;
             aliens.alienArray[temp_alien_id].color = "rgba(255,255,255,0)";
             aliens.alienArray[temp_alien_id].in = false;
             break;
           }
         }

         aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
         aliens.alienArray[alien_id].in = true;
         $scope.currentBucket(bucket.current_bucket);
         feedback(alien_id);
      }
      else {
        // Aliens in other buckets, can be switched to current bucket when being clicked
        if (aliens.alienArray[alien_id].in && bucket.buckets[bucket.current_bucket].color != aliens.alienArray[alien_id].color) {
          var bucket_id = bucket.getBucketByAlienId(alien_id);
          bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);
          bucket.buckets[bucket.current_bucket].alien.push(alien_id);

          if (bucket.buckets[bucket_id].alien.length == 0) {
            bucket.removeBucket(bucket_id);
            if (bucket_id < bucket.current_bucket) {
              bucket.current_bucket--;
            }
          }

          aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
          $scope.currentBucket(bucket.current_bucket);
          feedback(alien_id);
        }

        // Normal aliens
        else {
          if (!$scope.dragged) {

            // Alien already in bucket, Deselect aliens
            if (aliens.alienArray[alien_id].color == bucket.buckets[bucket.current_bucket].color) {

              // Remove the alien from the bucket
              var ind = bucket.buckets[bucket.current_bucket].alien.indexOf(alien_id);
              aliens.alienArray[alien_id].in = false;
              bucket.buckets[bucket.current_bucket].alien.splice(ind, 1);

              if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
                $scope.checked = false;
              }

              aliens.alienArray[alien_id].color = "rgba(255,255,255, 0)";
              $scope.currentBucket(bucket.current_bucket);
              feedback(alien_id);
            }

            // Select aliens
            else {
              bucket.buckets[bucket.current_bucket].alien.push(alien_id);

              aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
              aliens.alienArray[alien_id].in = true;
              $scope.currentBucket(bucket.current_bucket);
              feedback(alien_id);
            }
          }
        }
      }
    }

    $scope.newGroup = function() {
      bucket.addBucket();
      bucket.orderAlienArray();
      update.updateIllegalAlien();
      $scope.checked = false;
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
      $scope.currentBucket(bucket.getBucketByAlienId(alien_id));
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


    /*
     * ==========================================
     * ||             UNDO / REDO              ||
     * ==========================================
     */

    // Undo structure: [NEW, OLD, OLD, OLD...]
    //                   ↑ current pointer

    // SCENARIO 1:
    // User clicks UNDO => [NEW, OLD, OLD, OLD...] and update view to current pointer
    //                            ↑ moves pointer backward
    // User clicks REDO => [NEW, OLD, OLD, OLD...] and update view to current pointer
    //                      ↑ moves pointer forward

    // SCENARIO 2:
    // User clicks UNDO  => [NEW, OLD, OLD, OLD...] and update view to current pointer
    //                             ↑ moves pointer backward
    // User makes change => [NEW', OLD, OLD, OLD...] and update view to current pointer
    //                        ↑ moves pointer forward, 'NEW' gets overwritten

    $scope.$watch(angular.bind(bucket, function (buckets) {
      return bucket.buckets;
    }), function (newVal, oldVal) {
      if (!newVal || !oldVal) {
        return;
      }
      console.log("oldVal (buckets) is =>" + JSON.stringify(oldVal));
      console.log("newVal (buckets) is =>" + JSON.stringify(newVal));
      if (!$scope.$storage.buckets) {
        $scope.$storage.buckets = {};
      }

      // Iterate over storage to see if this newVal is from an UNDO (code 1) or from user's new action (code 0)
      var identical_bucket_flag = 1;
      _.forEach($scope.$storage.buckets, function(b, t) { // Caution: value first, key second!
        console.log("COMPARE newval", b[0] == JSON.stringify(newVal));
        console.log("COMPARE undo_key_pointer", Number(t) == $scope.undo_key_pointer);
        if (b[0] == JSON.stringify(newVal) && Number(t) == $scope.undo_key_pointer) {
          identical_bucket_flag = 0;
          return false;
        } else if (b[0] == JSON.stringify(newVal) && Number(t) != $scope.undo_key_pointer) {
          identical_bucket_flag = 1;
        }
      });
      // If it is a new action, simply add it to the storage
      if (identical_bucket_flag == 1) {
        var newStamp = new Date().valueOf(); // current timestamp as an integer

        // First bucket
        if (_.keys($scope.$storage.buckets).length == 0) {
            $scope.$storage.buckets[newStamp] =
              [JSON.stringify(newVal), bucket.current_bucket, null,  null];
        }

        // Not first bucket
        else {
          // bucket storage data structure: {timestampKey: [buckets, current_bucket, lastState, nextState]}
          // Now we want to find the key to lastState
          _.forEach($scope.$storage.buckets, function(b, t) {
            if (b[0] == JSON.stringify(oldVal) && t == $scope.undo_key_pointer) { // Note that the key pointer is still the old one
              // Set lastStep flag for current state and nextStep pointer for last state
              b[3] = newStamp;
              $scope.$storage.buckets[newStamp] =
                [JSON.stringify(newVal), bucket.current_bucket, $scope.undo_key_pointer,  null];
            }
          });
        }
        // Finally update the key pointer
        $scope.undo_key_pointer = newStamp;
        console.log("current index =>" + $scope.undo_key_pointer);
      }
      console.log("storage.buckets => ", $scope.$storage.buckets);
    }, true);


    $scope.undo = function() {
      var last_key = $scope.$storage.buckets[$scope.undo_key_pointer][2];
      if (!last_key) {
          alert("No more UNDOs, man :/");
          return;
      }
      var last_buckets = $scope.$storage.buckets[Number(last_key)];

      // Update key pointer
      $scope.undo_key_pointer = last_key;
      console.log("current index =>" + $scope.undo_key_pointer);

      if (!last_buckets) {
        alert("undo error");
      }

      bucket.restoreBucketsHelper(last_buckets);
      $scope.currentBucket(bucket.current_bucket);
    };

    $scope.redo = function() {
      var next_key = $scope.$storage.buckets[$scope.undo_key_pointer][3];
      if (!next_key) {
        alert("No more REDOs, man :/");
        return;
      }
      var next_buckets = $scope.$storage.buckets[Number(next_key)];

      // Update key pointer
      $scope.undo_key_pointer = next_key;
      console.log("UNDO (buckets) =>" + next_buckets);

      if (!next_buckets) {
        alert("redo error");
      }

      bucket.restoreBucketsHelper(next_buckets);
      $scope.currentBucket(bucket.current_bucket);
    };

    $scope.$on("$destroy", function () {
      console.log("delete all undo data now...");
      delete $scope.$storage.buckets;
    });

    /*
     * ===========================================
     */


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
    };


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
    $scope.showHighlightAlien = function(alien_id, enter) {
    var element = document.getElementsByClassName("alien " + alien_id)[0];
    console.log(element);

    if (enter) {
      style.scrollToItem(element);
      $("." + alien_id).addClass('highlight-hover');
      $(".zoomed-alien." + alien_id).addClass('zoomed-highlight-hover');
      setTimeout(function(){
        $("." + alien_id).removeClass('highlight-hover');
      }, 2000);
    } else {
      $(".zoomed-alien." + alien_id).removeClass('zoomed-highlight-hover');
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
