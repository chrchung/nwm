'use strict';

angular.module('nwmApp').controller('Game4Controller',
  function ($scope, Restangular, $stateParams, $state, $timeout, update, helper, database, style, bucket, history, aliens, $localStorage) {

    // game version where alien seeded
    $scope.scoreToBeat = 0;
    var initAlien;
    var seed;
    $scope.type = null;

    $scope.numImagesLoaded = 0;
    $scope.loaded = false;
    $scope.maxScore = 0;
    $scope.$storage = $localStorage;
    $scope.undo_key_pointer = 0;
    var startTime = (new Date()).getMinutes();

    $scope.doneBucket = function () {
      var old = $scope.score;
      $scope.score = update.getNewScore($scope.maxModels);
      if ($scope.score > $scope.maxScore) {
        $scope.maxScore = $scope.score;
      }

      update.showSmallFeedback(old, $scope.score, 'd_d');

    };

    $scope.currentBucket = function (curBucket) {
      // Currently we are using the FIRST highlighting algorithm. Second => 2, Third => 3.
      bucket.currentBucket(curBucket, 3);
      bucket.updateAlienArray();
      update.updateIllegalAlien();
      if (bucket.buckets[bucket.current_bucket].alien.length > 0) {
        $scope.checked = true;
        $('#aliens').css('width', $(window).width() - $('#section').width());
      }
      else {
        $scope.checked = false;
        $('#aliens').css('width', '97%');
      }

      $("#myDiv").height();
    };

    var feedback = function (alienId) {
      $scope.prev_score = $scope.score;
      $scope.score = update.getNewScore($scope.maxModels);

      if ($scope.score > $scope.maxScore) {
        $scope.maxScore = $scope.score;
      }

      // Avoid score update when seeding
      if (!$scope.doneSeeding) {
        return;
      }

      if ($scope.score - $scope.highest_score > 0) {
        $("#target-reached").fadeIn();
        setTimeout(function(){ $("#target-reached").fadeOut(); }, 4000);
      }

      //if ($scope.prev_score < $scope.score) {
      update.showSmallFeedback($scope.prev_score, $scope.score, alienId);
      //}
      update.showBigFeedback($scope.prev_score, $scope.score, $scope.beat, $scope.highest_score);
    };

    /* Start a new game */
    $scope.setUpGame = function (mode) {
      $scope.bucket = bucket;
      $scope.aliens = aliens;
      $scope.history = history;

      // $scope.toggleChooseSolutionPopup();
      $scope.dragged = false;  // Disable click event when start dragging
      $scope.checked = true;
      $scope.tutorial = false;
      $scope.disableRedo = true;
      $scope.disableUndo = true;
      bucket.initColors();
      aliens.initAliens();
      history.initHistory();

      // Get top window's height
      $scope.topWindowHeight = window.innerWidth * 0.095 + 20;

      // modelsName is a string in the form of 'level4b6_9'
      // Get level
      $scope.cur_level = $stateParams.id;

      // Request data from the server
      Restangular.all('api/levels/level/' + $scope.cur_level).getList().then((function (data) {
        // $(window).on("load", function() {
        //   $scope.loaded = true;
        // });


        $scope.maxModels = data.length;       // number of models
        // Get game id
        if ((data[0][0]).indexOf('a') >= 0) {
          $scope.cur_game = 1;
        } else {
          $scope.cur_game = 2;
        }

        for (var i = 0; i < $scope.maxModels; i++) {
          var maxAliens = data[i][1].length;    // number of aliens in a model
          for (var j = 0; j < maxAliens; j++) {
            var parsed_data = database.parseData(data, i, j);
            aliens.properties[i + "_" + j] = parsed_data.attributes;
            aliens.alienArray[i + "_" + j] = {
              id: i + "_" + j,
              model: "model" + i,
              alien: j,
              url: parsed_data.URL,
              color: "rgba(232, 250, 255, 0)",
              illegal: "legal-alien",
              similar: "dissimilar",
              in: false
            };
          }
        }
        database.shuffleProperties();

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
        $('#log-in').fadeIn();
        $scope.loaded = true;
      });


    };

    $scope.createNewBucket = function () {
      $scope.newGroup(false);
    }

    $scope.restoreSavedBucket = function () {
      Restangular.all('api/scores/cur_user_solution/' + $scope.cur_level)
        .getList().then(function (serverJson) {

        if (serverJson.length == 0) {
          $scope.createNewBucket();
          return;
        }

        bucket.buckets = serverJson[0].solution;
        if (serverJson[0].actions != null) {
          history.userActions = serverJson[0].actions;
        }

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
        // $scope.score = update.getNewScore($scope.maxModels);
        // if ($scope.score > $scope.maxScore) {
        //   $scope.maxScore = $scope.score;
        // }
        $scope.newGroup(false);
      });
    };

    // var getRandomArbitrary = function (min, max) {
    //   return Math.random() * (max - min) + min;
    // };

    var getRandAlien = function () {
      var result;
      var count = 0;
      for (var prop in $scope.aliens.alienArray)
        if (Math.random() < 1/++count)
          result = prop;
      return result;
    };

    $scope.restoreBestGame = function () {
      Restangular.all('api/scores/best_solution/' + $scope.cur_level)
        .getList().then(function (serverJson) {

        if (serverJson.length == 0) {
          // $scope.createNewBucket();
          return;
        }

        $scope.highest_score = serverJson[0].score;

        bucket.buckets = serverJson[0].solution;
        if (serverJson[0].actions != null) {
          history.userActions = serverJson[0].actions;
        }

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
            //console.log(alien_id);
            aliens.alienArray[alien_id].color = bucket.buckets[i].color;
            aliens.alienArray[alien_id].in = true;
            aliens.alienArray[alien_id].illegal = 'legal';
          }
        }
        $scope.score = update.getNewScore($scope.maxModels);
        if ($scope.score > $scope.maxScore) {
          $scope.maxScore = $scope.score;
        }

        $scope.doneSeeding = false;
        bucket.orderAlienArray();
        $scope.seedAliens = {}; // Array of aliens that have already been picked as a seed
        //$scope.seedInitialAlien();

        setTimeout(function(){ $scope.seedInitialAlien(); }, 2000);
      });
    };

    $scope.seedInitialAlien = function() {

      //$scope.seed = $scope.seedByTupleScore();
      //$scope.seed = $scope.seedBySimilarityScore();

      if (Math.random() < 0.4) {
        $scope.seed = $scope.seedRandomly();
      }
      else {
        $scope.seed = $scope.seedBySimilarityScore();
      }

      $scope.seedAliens[seed] = true;

      $scope.showGroup($scope.seed);
      $scope.prev_score = $scope.score;
      $scope.doneSeeding = true;

      $scope.disableRedo = true;
      $scope.disableUndo = true;

      //delete $scope.$storage.buckets;
      //delete $scope.$storage.aliens;
    }

    $scope.$watch('doneSeeding', function (newVal, oldVal) {
      if (newVal == true && oldVal == false) {
        // Delete the garbage storage and only keep the record that saved the seed alien
        var seed_alien_buckets_state = $scope.$storage.buckets[$scope.undo_key_pointer][2];
        // Store the current key as the last possible undo checker
        $scope.last_undo_possible_index = $scope.undo_key_pointer;
        _.each(Object.keys($scope.$storage.buckets), function (key) {
          if (key != seed_alien_buckets_state && key != $scope.undo_key_pointer) {
            delete $scope.$storage.buckets[key];
          }
        });
      }
    });

    $scope.getNextSeed = function() {
      $scope.startOverHide();

      $scope.seed = null;
      $scope.doneSeeding = false;

      while (bucket.buckets[bucket.current_bucket].alien.length > 0) {
        $scope.selectAlien(bucket.buckets[bucket.current_bucket].alien[0]);
      }
      $scope.seedInitialAlien();
    };

    $scope.seedByTupleScore = function() {

      // Array of bucket ids sorted by similarity score
      var orderedBuckets = _.range(bucket.buckets.length);
      orderedBuckets.sort(function(a,b){
        return bucket.buckets[a].similarity - bucket.buckets[b].similarity;
      });

      $scope.highest_score = $scope.score; // highest score
      $scope.createNewBucket();

      for (var i = 0; i < orderedBuckets.length; i++) {
        for (var j = 0; j < bucket.buckets[orderedBuckets[i]].alien.length; j++) {
          seed = bucket.buckets[orderedBuckets[i]].alien[j];

          // This alien has already been picked: find another seed
          if (Object.keys($scope.seedAliens).indexOf(seed) >= 0) {
            continue;
          }

          $scope.selectAlien(seed);
          $scope.initialScore = $scope.score; // initial score

          var targetScore = $scope.highest_score - $scope.initialScore + 1;

          // Seeding improves the score: save solution to DB and seed again
          if (targetScore < 1) {
            $scope.saveSolutionAtSeeding();
            return $scope.seedByTupleScore();
          }

          for (var aid in aliens.alienArray) {
            // Similar alien exists: make this alien the seed
            if (aid != seed && aliens.alienArray[aid].similar == "similar" && aliens.alienArray[aid].illegal != "illegal") {
              return seed;
            }
          }

          // Similar alien not found: undo and pick another alien
          $scope.seedAliens[seed] = true;
          $scope.selectAlien(seed);
        }
      }

      // No possible seed found
      $scope.seedAliens = {};
      return $scope.seedByTupleScore();
    };

    $scope.seedByTupleSize = function() {
      // Array of bucket ids sorted by similarity score
      var orderedBuckets = _.range(bucket.buckets.length);
      orderedBuckets.sort(function(a,b){
        return bucket.buckets[a].alien.length - bucket.buckets[b].alien.length;
      });

      $scope.highest_score = $scope.score; // highest score
      $scope.createNewBucket();

      for (var i = 0; i < orderedBuckets.length; i++) {
        for (var j = 0; j < bucket.buckets[orderedBuckets[i]].alien.length; j++) {
          seed = bucket.buckets[orderedBuckets[i]].alien[j];

          // This alien has already been picked: find another seed
          if (Object.keys($scope.seedAliens).indexOf(seed) >= 0) {
            continue;
          }

          $scope.selectAlien(seed);
          $scope.initialScore = $scope.score; // initial score

          var targetScore = $scope.highest_score - $scope.initialScore + 1;

          // Seeding improves the score: save solution to DB and seed again
          if (targetScore < 1) {
            $scope.saveSolutionAtSeeding();
            return $scope.seedByTupleSize();
          }

          for (var aid in aliens.alienArray) {
            // Similar alien exists: make this alien the seed
            if (aid != seed && aliens.alienArray[aid].similar == "similar" && aliens.alienArray[aid].illegal != "illegal") {
              return seed;
            }
          }

          // Similar alien not found: undo and pick another alien
          $scope.seedAliens[seed] = true;
          console.log(seed);
          $scope.selectAlien(seed);
        }
      }

      // No possible seed found
      $scope.seedAliens = {};
      return $scope.seedByTupleSize();
    };

    $scope.seedBySimilarityScore = function() {

      // Sort aliens by score
      var sortedAlien = Object.keys(aliens.alienArray).sort(function(a,b){
        return aliens.alienArray[a].score - aliens.alienArray[b].score;
      });

      $scope.highest_score = $scope.score; // highest score
      $scope.createNewBucket();
      $scope.$apply();

      for (var i = 0; i < sortedAlien.length; i++) {

        seed = sortedAlien[i];

        // This alien has already been picked: find another seed
        if (Object.keys($scope.seedAliens).indexOf(seed) >= 0) {
          continue;
        }

        $scope.selectAlien(seed);
        $scope.$apply();
        $scope.initialScore = $scope.score; // initial score

        var targetScore = $scope.highest_score - $scope.initialScore + 1;

        // Seeding improves the score: save solution to DB and seed again
        if (targetScore < 1) {
          $scope.saveSolutionAtSeeding();
          return $scope.seedBySimilarityScore();
        }

        for (var aid in aliens.alienArray) {
          // Similar alien exists: make this alien the seed
          if (aid != seed && aliens.alienArray[aid].similar == "similar" && aliens.alienArray[aid].illegal != "illegal") {
            return seed;
          }
        }

        // Similar alien not found: undo and pick another alien
        $scope.seedAliens[seed] = true;
        $scope.selectAlien(seed);
      }

      // No possible seed found
      $scope.seedAliens = {};
      return $scope.seedBySimilarityScore();

      //Restangular.all('api/scores/').get("cur_user_recent_game4").then(function (serverJson) {
      // No game4 data found
      // if (!serverJson) {
      //   //initAlien = sortedAlien[0];
      //   seed = sortedAlien[0];
      //   $scope.highest_score = $scope.score; // highest score
      //   $scope.createNewBucket();
      //   $scope.selectAlien(seed);
      //   $scope.initialScore = $scope.score; // initial score
      //
      //   var targetScore = $scope.highest_score - $scope.initialScore + 1;
      //
      //   // Seeding improves the score: save solution to DB and seed again
      //   if (targetScore < 1) {
      //     $scope.saveSolutionAtSeeding();
      //     $scope.seeding();
      //     return;
      //   }
      //
      //   $scope.seed = seed;
      //   $scope.showGroup(seed);
      //   $scope.doneSeeding = true;
      // }
      // else {
      //   var prevTargetScore = serverJson.targetScore;
      //   $scope.createNewBucket();
      //   for (var i = 0; i < sortedAlien.length; i++) {
      //     var curAlien = sortedAlien[i];
      //     var targetScore = aliens.alienArray[curAlien].score;
      //     if (targetScore > prevTargetScore) {
      //       $scope.highest_score = $scope.score; // highest score
      //       $scope.createNewBucket();
      //       $scope.selectAlien(curAlien);
      //       $scope.initialScore = $scope.score; // initial score
      //       $scope.seed = curAlien;
      //       $scope.doneSeeding = true;
      //       break;
      //     }
      //   }
      // }
      // $scope.disableRedo = true;
      // $scope.disableUndo = true;
      // delete $scope.$storage.buckets;
      // delete $scope.$storage.aliens;
      //});
    };

    // Seeding #4: random
    $scope.seedRandomly = function() {
      $scope.highest_score = $scope.score; // highest score
      $scope.createNewBucket();
      $scope.$apply();

      while(Object.keys($scope.seedAliens).length < Object.keys(aliens.alienArray).length) {
        seed = getRandAlien();

        // This alien has already been picked: find another seed
        if (Object.keys($scope.seedAliens).indexOf(seed) >= 0) {
          continue;
        }

        $scope.selectAlien(seed);
        $scope.$apply();
        $scope.initialScore = $scope.score; // initial score

        var targetScore = $scope.highest_score - $scope.initialScore + 1;

        // Seeding improves the score: save solution to DB and seed again
        if (targetScore < 1) {
          $scope.saveSolutionAtSeeding();
          return $scope.seedRandomly();
        }

        for (var aid in aliens.alienArray) {
          // Similar alien exists: make this alien the seed
          if (aid != seed && aliens.alienArray[aid].similar == "similar" && aliens.alienArray[aid].illegal != "illegal") {
            return seed;
          }
        }

        // Similar alien not found: undo and pick another alien
        $scope.seedAliens[seed] = true;
        $scope.selectAlien(seed);
      }

      // Visited all aliens, clear seed history
      $scope.seedAliens = {};
      return $scope.seedRandomly();
    };

    $scope.saveSolutionAtSeeding = function() {
      Restangular.all('/api/scores/').post(
        {
          user: "nwm",
          score: $scope.score,
          initialScore: $scope.highest_score,
          game: $scope.cur_game,
          level: parseInt($scope.cur_level),
          solution: bucket.buckets,
          actions: history.userActions
        }).then(
        (function (data) {
        }), function (err) {
        });
    };

    $scope.selectAlien = function (alien_id) {

      // No bucket is currently selected
      // game version in which alien is seeded : comment out
      if (bucket.current_bucket == -1) {
        $("#no-buck").fadeIn();
        setTimeout(function(){ $("#no-buck").fadeOut(); }, 2000);
        return;
      }

      if (alien_id == $scope.seed) {
        $("#cant-remove").fadeIn();
        setTimeout(function(){ $("#cant-remove").fadeOut(); }, 4000);
        return;
      }

      // Illegal Aliens
      if (aliens.alienArray[alien_id].illegal == 'illegal') {
        if ($scope.tutState == 4) {
          $scope.tutState = 5;
        }


        // Show tutorial if illegal alien tut not done
        // if (!history.tutorials[2]) {
        //   $('#tutorial').accordion({active: 2});
        //   $scope.tutorial = true;
        //   history.tutorials[2] = true;
        // }

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
        // Aliens in other buckets, can be switched to current bucket when being clicked
        if (aliens.alienArray[alien_id].in && bucket.buckets[bucket.current_bucket].color != aliens.alienArray[alien_id].color) {

          // // Show tutorial if switching aliens tut not done
          // if (!history.tutorials[3]) {
          //   $scope.tutorial = true;
          //   $('#tutorial').accordion({active: 3});
          //   history.tutorials[3] = true;
          // }

          var bucket_id = bucket.getBucketByAlienId(alien_id);
          bucket.buckets[bucket_id].alien.splice(bucket.buckets[bucket_id].alien.indexOf(alien_id), 1);
          bucket.buckets[bucket.current_bucket].alien.push(alien_id);

          history.historyBucketId = bucket.current_bucket;
          history.historySwappedBucketId = bucket_id;
          history.historySelectFlag = 2;
          history.historyColor = bucket.buckets[bucket_id].color;
          history.userActions.push("Remove alien " + alien_id + " from bucket " + bucket_id);

          //if (bucket.buckets[bucket_id].alien.length == 0) {
          //  bucket.removeBucket(bucket_id);
          //  if (bucket_id < bucket.current_bucket) {
          //    bucket.current_bucket--;
          //  }
          //}

          aliens.alienArray[alien_id].color = bucket.buckets[bucket.current_bucket].color;
          $scope.currentBucket(bucket.current_bucket);
          feedback(alien_id);
          history.userActions.push("Add alien " + alien_id + " to bucket " + bucket.current_bucket);
        }

        // Normal aliens
        else {
          if (!$scope.dragged) {
            history.historySelectFlag = false;

            // Alien already in bucket, Deselect aliens
            if (aliens.alienArray[alien_id].color == bucket.buckets[bucket.current_bucket].color) {
              if ($scope.tutState == 6) {
                $scope.tutState = 7;
              }


              // Show tutorial if removing alien tut not done
              // if (!history.tutorials[4]) {
              //   $scope.tutorial = true;
              //   $('#tutorial').accordion({active: 4});
              //   history.tutorials[4] = true;
              // }

              history.historySelectFlag = 1;

              // Retrieve alien's last bucket.
              var cur_undo_index = $scope.undo_key_pointer;
              var cur_bucket_storage = JSON.parse($scope.$storage.buckets[cur_undo_index][0]);
              var cur_bucket_color = cur_bucket_storage[bucket.current_bucket].color;
              var last_key = cur_undo_index;

              // Helper function to retrieve alien's current bucket color.
              var getAlienCurColor = function (undo_snapshot, alien_id) {
                var result_color = null;
                _.each(undo_snapshot, function (b) {
                  if (b.alien.indexOf(alien_id) != -1) {
                    result_color = b.color;
                  }
                });
                return result_color;
              };

              //console.log("COMPARE1", getAlienCurColor(cur_bucket_storage, alien_id));
              //console.log("COMPARE2",cur_bucket_color);
              //console.log("COMPARE3",getAlienCurColor(cur_bucket_storage, alien_id) == cur_bucket_color);

              while (getAlienCurColor(cur_bucket_storage, alien_id) == cur_bucket_color) {
                last_key = $scope.$storage.buckets[last_key][2];
                if (last_key == null) {
                  break;
                }
                cur_bucket_storage = JSON.parse($scope.$storage.buckets[last_key][0]);
              }
              var last_bucket_ind = -1;
              _.each(cur_bucket_storage, function (b) {
                if (b.alien.indexOf(alien_id) != -1) {
                  last_bucket_ind = cur_bucket_storage.indexOf(b);
                }
              });

              var last_bucket_color = cur_bucket_storage[last_bucket_ind].color;

              // Remove the alien from the bucket
              var ind = bucket.buckets[bucket.current_bucket].alien.indexOf(alien_id);
              //aliens.alienArray[alien_id].in = false;
              bucket.buckets[bucket.current_bucket].alien.splice(ind, 1);

              // If the selected alien has no previous bucket, just put it back as non-matched alien.
              if (last_bucket_ind != bucket.current_bucket && last_bucket_ind != -1) {
                bucket.buckets[last_bucket_ind].alien.push(alien_id);
                aliens.alienArray[alien_id].color = last_bucket_color;
              } else {
                aliens.alienArray[alien_id].in = false;
                aliens.alienArray[alien_id].color = "rgba(232, 250, 255, 0)";
              }

              if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
                $scope.checked = false;
              }

              $scope.currentBucket(bucket.current_bucket);
              feedback(alien_id);
              history.userActions.push("Remove alien " + alien_id + " from bucket " + bucket.current_bucket);
            }

            // Select aliens
            else {
              // Show tutorial if adding alien tut not done
              // if (!history.tutorials[0]) {
              //   $scope.tutorial = true;
              //   $('#tutorial').accordion({active: 0});
              //   history.tutorials[0] = true;
              // }

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
        $scope.disableUndo = false;
        $scope.disableRedo = true;
      }
    };

    $scope.selectIllegalAlien = function (opt) {
      $scope.toggleIllegalAlert();
      if (!opt) {
        return;
      }
      // Show alert if the conflicting alien is the seed
      if (aliens.oldId == $scope.seed) {
        $("#cant-remove").fadeIn();
        setTimeout(function(){ $("#cant-remove").fadeOut(); }, 2000);
        return;
      }

      $scope.selectAlien(aliens.oldId);
      $scope.selectAlien(aliens.newId);
    };

    $scope.newGroup = function (tut) {
      $scope.checked = false;
      if (bucket.current_bucket == -1 || bucket.buckets[bucket.current_bucket].alien.length > 0) {
        bucket.addBucket();
        update.updateIllegalAlien();
        $scope.disableUndo = false;
        $scope.disableRedo = true;
      }
    }

    $scope.showGroup = function (alien_id) {
      if ($scope.tutState == 7) {
        $scope.tutState = 8;
      }

      // If alien not in bucket
      if (!aliens.alienArray[alien_id].in) {
        return;
      }

      // If no alien in the current bucket, remove it
      //if (bucket.current_bucket != -1 && bucket.buckets[bucket.current_bucket].alien.length == 0) {
      //  bucket.removeBucket(bucket.current_bucket);
      //}
      var bid = bucket.getBucketByAlienId(alien_id);
      $scope.currentBucket(bid);
      //bucket.orderAlienArray();
      bucket.updateAlienArray();
    }

    // $scope.get_highest_score = function () {
    //   Restangular.all('api/scores/')
    //     .get("game_bestScore/" + parseInt($scope.cur_level)).then(function (serverJson) {
    //     $scope.highest_score = serverJson.score;
    //   });
    // };
    $scope.get_greedy = function () {
      Restangular.all('api/levels/getBeat/' + parseInt($scope.cur_level))
        .getList().then(function (serverJson) {
        $scope.beat = 1000;
      });
    };

    $scope.onStart = function (event) {
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

    $scope.$watch(angular.bind(bucket, function (current_bucket) {
      return bucket.current_bucket;
    }), function (newVal, oldVal) {
      if (newVal == -1) {
        $scope.disableUndo = true;
        $scope.disableRedo = true;
        $scope.checked = true;
      }
    });

    $scope.$watch(angular.bind(bucket, function (buckets) {
      return bucket.buckets;
    }), function (newVal, oldVal) {
      if (!newVal || !oldVal) {
        return;
      }

      //console.log("oldVal (buckets) is =>" + JSON.stringify(oldVal.length));
      //console.log("newVal (buckets) is =>" + JSON.stringify(newVal));
      //if ($scope.last_undo_possible_index != null) {
      //  console.log("last_possible_undo (buckets) is =>" + newVal == $scope.$storage.buckets[$scope.last_undo_possible_index][0]);
      //}

      if (!$scope.$storage.buckets) {
        $scope.$storage.buckets = {};
      }

      if ($scope.last_undo_possible_index != null) {
        // do a full check
        var compare_flag = true;

        var target_bkt = JSON.parse($scope.$storage.buckets[$scope.last_undo_possible_index][0]);
        _.each(newVal, function (bkt) {
          if (bkt.alien.length > 0) {
            var color_comparator = bkt.color;
            var aliens_comparator = bkt.alien;
            _.each(target_bkt, function (target) {
              if (target.color == color_comparator && !_.isEqual(target.alien, aliens_comparator)) {
                compare_flag = false;
              }
            });
          }
        });

        if (compare_flag) {
          $scope.disableUndo = true;
          $scope.disableRedo = true;
          $scope.checked = true;
        }
      }

      // Iterate over storage to see if this newVal is from an UNDO (code 1) or from user's new action (code 0)
      var identical_bucket_flag = 1;
      _.forEach($scope.$storage.buckets, function (b, t) { // Caution: value first, key second!
        //console.log("COMPARE newval", b[0] == JSON.stringify(newVal));
        //console.log("COMPARE undo_key_pointer", Number(t) == $scope.undo_key_pointer);
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
            [JSON.stringify(newVal), bucket.current_bucket, null, null];
        }

        // Not first bucket
        else {
          // bucket storage data structure: {timestampKey: [buckets, current_bucket, lastState, nextState]}
          // Now we want to find the key to lastState
          _.forEach($scope.$storage.buckets, function (b, t) {
            if (b[0] == JSON.stringify(oldVal) && t == $scope.undo_key_pointer) { // Note that the key pointer is still the old one
              // Set lastStep flag for current state and nextStep pointer for last state
              b[3] = newStamp;
              $scope.$storage.buckets[newStamp] =
                [JSON.stringify(newVal), bucket.current_bucket, $scope.undo_key_pointer, null];
            }
          });
        }
        // Finally update the key pointer
        $scope.undo_key_pointer = newStamp;
        //console.log("current index =>" + $scope.undo_key_pointer);
      }
      //console.log("storage.buckets => ", $scope.$storage.buckets);
    }, true);

    $scope.undo = function () {
      var last_key = $scope.$storage.buckets[$scope.undo_key_pointer][2];
      if (!last_key) {
        return;
      }
      var last_buckets = $scope.$storage.buckets[Number(last_key)];

      var compare_current_buckets = _.pluck(JSON.parse($scope.$storage.buckets[$scope.undo_key_pointer][0]), 'alien').join().split(",");
      var compare_last_buckets = _.pluck(JSON.parse($scope.$storage.buckets[Number(last_key)][0]), 'alien').join().split(",");
      var diff_alien = _.difference(compare_current_buckets, compare_last_buckets);
      // console.log("DIFF1 => " + compare_current_buckets);
      // console.log("DIFF2 => " + compare_last_buckets);
      // console.log("DIFF3 => " + diff_alien);

      // Update key pointer
      $scope.undo_key_pointer = last_key;
      //console.log("current index =>" + $scope.undo_key_pointer);

      bucket.restoreBucketsHelper(last_buckets);
      if (bucket.current_bucket != -1) {
        $scope.currentBucket(bucket.current_bucket);
      }
      //bucket.orderAlienArray();
      // feedback(diff_alien);
      feedback(diff_alien);

      $scope.disableRedo = false;

      if (!$scope.$storage.buckets[$scope.undo_key_pointer][2]) {
        $scope.disableUndo = true;
      }
    };

    $scope.redo = function () {
      var next_key = $scope.$storage.buckets[$scope.undo_key_pointer][3];
      if (!next_key) {
        return;
      }
      var next_buckets = $scope.$storage.buckets[Number(next_key)];

      var compare_current_buckets = _.pluck(JSON.parse($scope.$storage.buckets[$scope.undo_key_pointer][0]), 'alien').join().split(",");
      var compare_next_buckets = _.pluck(JSON.parse($scope.$storage.buckets[Number(next_key)][0]), 'alien').join().split(",");
      var diff_alien = _.difference(compare_current_buckets, compare_next_buckets);

      // Update key pointer
      $scope.undo_key_pointer = next_key;
      //console.log("UNDO (buckets) =>" + next_buckets);

      if (!next_buckets) {
        alert("redo error");
      }

      bucket.restoreBucketsHelper(next_buckets);
      if (bucket.current_bucket != -1) {
        $scope.currentBucket(bucket.current_bucket);
      }
      //feedback(diff_alien);
      //bucket.orderAlienArray();
      feedback(diff_alien);

      $scope.disableUndo = false;

      if (!$scope.$storage.buckets[$scope.undo_key_pointer][3]) {
        $scope.disableRedo = true;
      }
    };

    $scope.$on("$destroy", function () {
      //console.log("delete all undo data now...");
      delete $scope.$storage.buckets;
    });

    /*
     * ===========================================
     */

    $scope.buttonReq = '';
    $scope.togglePopup = function (msg, req) {
      $("#overlay").toggle();
      $scope.buttonReq = req;
      $(".alert-msg").html(msg);
      $("#popup").toggle();
    }

    $scope.handleButtonRequest = function () {
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
    $scope.showHighlightAlien = function (alien_id) {
      var target = document.getElementsByClassName("an-alien " + alien_id)[0];
      window.scrollTo(0, target.offsetTop - $scope.topWindowHeight - 10);

      $(".an-alien." + alien_id).removeClass('highlight-hover');
      $(".an-alien." + alien_id).addClass('highlight-hover');
      setTimeout(function () {
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
      var time = (new Date()).getMinutes() - startTime;

      //if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
      //  bucket.removeBucket(bucket.current_bucket);
      //}
      Restangular.all('/api/scores/').post(
        {
          score: $scope.score,
          initialScore: $scope.highest_score,
          targetScore: $scope.highest_score - $scope.initialScore + 1,
          seed: $scope.seed,
          duration: time,
          game: $scope.cur_game,
          level: parseInt($scope.cur_level),
          solution: bucket.buckets,
          actions: history.userActions,
          type: $scope.type
        }).then(
        (function (data) {
          var finalScore = $scope.score - $scope.highest_score;
          if (finalScore < 0) {
            finalScore = 0;
          }
          $state.go('leaderboard', {prevState: 'game', score: finalScore});
        }), function (err) {
        });
    }

    // Save the score to the database
    $scope.saveScore = function () {
      //if (bucket.buckets[bucket.current_bucket].alien.length == 0) {
      //  bucket.removeBucket(bucket.current_bucket);
      //}
      Restangular.all('/api/scores/save_for_later').post(
        {level: parseInt($scope.cur_level), solution: bucket.buckets, actions: history.userActions}).then(
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

    $scope.quit = function () {
      $state.go('scoreboard');
    };

    // $scope.toggleChooseSolutionPopup = function () {
    //   $("#overlay").toggle();
    //   $("#popup2").toggle();
    // };

    $scope.endGame = function () {
      $("#overlay").toggle();
      $("#popup3").toggle();
    };

    $scope.togglePageslide = function () {
      $scope.checked = !$scope.checked;
    }

    // $scope.$watch
    // (
    //   function () {
    //     return $('#section').width();
    //   },
    //   function (newValue, oldValue) {
    //     if (newValue != oldValue) {
    //       $('.sidenav').css('width', newValue);
    //       $('#aliens').css('width',  $(window).width() - newValue - 40);
    //     }
    //   }
    // );

    $scope.toggleIllegalAlert = function () {
      $(".current-alien." + aliens.oldId).toggleClass("replaced");
      $("#clear-overlay").toggle();
      $("#replace-popup").toggle();
    };

    $scope.noBucketAlert = function(opt) {
      $scope.toggleNoBucketAlert();
      if (opt) {
        $scope.newGroup();
      }
    }

    $scope.toggleNoBucketAlert = function () {
      $("#clear-nobucket-alert-overlay").toggle();
      $("#nobucket-popup").toggle();
    };

    $scope.goToGroup = function () {
      var alien_id = bucket.buckets[bucket.current_bucket].alien[0];
      var element = document.getElementsByClassName(alien_id)[0];
      style.scrollToItem(element);
    };


    $scope.startOver = function () {
      $('#start-over').fadeIn();
    };

    $scope.startOverHide = function () {
      $('#start-over').fadeOut();
    }

    window.onresize = function (event) {
      $scope.topWindowHeight = window.innerWidth * 0.095 + 20;
    };

    $scope.imageLoadedIncrementCount = function () {
      $scope.numImagesLoaded ++;

      if ($scope.numImagesLoaded == 220) {
        $scope.loaded = true;
      }
    };

    // var setUpTutorial = function () {
    //   tutorial = true;
    //   $scope.tutState = 0;
    //
    //   /// check whether it's the player's first time playing
    //   // Restangular.all('api/scores/')
    //   //   .get('cur_user_recent').then(function (serverJson) {
    //   //   //alert(serverJson);
    //   //   if (serverJson.score != null) {
    //   //     $scope.tutorialState = 'none';
    //   //   }
    //   // });
    //   ///
    // };

    ///set up game from best solution
    // setUpTutorial();

    // Clear the undo storage
    $(document).ready(function () {
      delete $scope.$storage.buckets;
      delete $scope.$storage.aliens;
      $scope.setUpGame('best');
    });


    $scope.$broadcast('timer-start');


  });
