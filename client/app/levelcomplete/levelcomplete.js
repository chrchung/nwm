'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('levelcomplete', {
        url: '/results/:level_id/:game_id/:score',
        templateUrl: 'app/levelcomplete/levelcomplete.html',
        controller: 'LevelcompleteCtrl'
      });
  });
