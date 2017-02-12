'use strict';

angular.module('nwmApp')
  .controller('TrailerCtrl', function ($scope, $state, Restangular) {


    $scope.startGame = function () {
      Restangular.all('api/users').get('has_seen_tut').then(function (serverJson) {
        if (serverJson.seenTut == false) {
          $state.go('tut');
        } else {
          // Randomly pick a level (model)
          var randLev = Math.random();
          if (randLev < 0.20) {
            $state.go('game4', {id: 10});
          } else {
            $state.go('game4', {id: 13});
          }
        }
      });
    };


  });
