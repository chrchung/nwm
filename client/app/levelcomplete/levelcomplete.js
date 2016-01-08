'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('levelcomplete', {
        url: '/levelcomplete/:level_id/:game_id/:score',
        templateUrl: 'app/levelcomplete/levelcomplete.html',
        controller: 'LevelcompleteCtrl'
      });
  });
