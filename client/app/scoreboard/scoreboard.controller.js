'use strict';

angular.module('nwmApp')
  .controller('ScoreboardCtrl', function ($scope, $state, Restangular, $timeout) {

    $scope.stats = [];
    $scope.chooseMode = false;

    $scope.logout = function (scores) {
      Restangular.all('api/auths/logout').post(
      ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
    };

    $scope.unlockedLevels = function () {
      Restangular.all('api/levels').get('last_unlocked_level').then(function (serverJson) {
        if (serverJson == 'n/a') {
          $scope.lastLevel = 0;
        } else {
          $scope.lastLevel = serverJson;
        };
      });
    };

    $scope.getScores = function (scores) {
      Restangular.all('api/scores/all_overall').getList().then(function (serverJson) {
        $scope.scores = serverJson;
      });
    };

    $scope.getUserRecent = function (scores) {
      Restangular.all('api/scores/cur_user_recent').getList().then(function (serverJson) {
        $scope.userRecent = serverJson.map(function(val) {
          val.createdAt = val.createdAt.substring(0, 10);
          return val;
        });
      });
    };

    $scope.getStats = function () {
      var arr = [1, 2, 3, 4];
      async.each(arr, function(id, callback) {
        Restangular.all('api/levels/getBeat/' + id + '/1').getList().then(function (serverJson) {
          Restangular.all('api/scores/cur_user_game_score/' + id + '/1').getList().then(function (serverJson2) {
            $scope.stats[id - 1] = new Object();
            $scope.stats[id - 1].dominator = serverJson[0].highestScorer || "Bob";
            $scope.stats[id - 1].highScore = serverJson[0].scoreToBeat;
            $scope.stats[id - 1].curPlayerScore = serverJson2[0].score || 'N/A';
          });
        });
      }, function(err){
        callback(null, arr);
      });
    };

    $scope.hideStats = function (id) {
      $('#' + id).removeClass('visible');
    };

    $scope.showStats = function (id) {
      $('#' + id).addClass('visible');

      var i;
      for (i = 0; i < 5; i ++) {
        if (i != id) {
          $('#' + i).removeClass('visible');
        };
      };
    };

    // router.get('/level/:id', controller.getLevelInfo);
    // router.get('/last_unlocked_level', controller.lastUnlockedLevels);
    // router.get('/getBeat/:id/:game', controller.getScoreToBeat);

    //Restangular.all('api/users/').get('current_user').then(function (serverJson) {
    //  $scope.userRecent = serverJson;
    //});

    // $scope.getScores();
    // $scope.getUserRecent();
    // $scope.unlockedLevels();
    // $scope.getStats();

    $scope.startGame = function () {
      Restangular.all('api/users').get('has_seen_tut').then(function (serverJson) {
        if (serverJson.seenTut == false) {
          $state.go('tut', {id: 11});
        } else {
          // Randomly pick a level (model)
          var randLev = Math.random();
          if (randLev < 0.33) {
            $state.go('game4', {id: 10});
          }
          else if (randLev < 0.66) {
            $state.go('game4', {id: 12});
          }
          else {
            $state.go('game4', {id: 13});
          }
        }
      });
    };


    $scope.removeModeSelection = function () {

      $timeout(function () {
        $scope.chooseMode = false;
      }, 4000);


    };

  });
