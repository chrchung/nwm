/**
 * Created by elsieyang on 2015-11-04.
 */
'use strict';

angular.module('levelOne')
  .config(function($stateProvider) {
    $stateProvider
      .state('level-one', {
        url: '/level-one',
        templateUrl: 'app/level-one/level-one.html',
        controller: 'LevelOneController',
        controllerAs: 'level-one'
      });
  });
