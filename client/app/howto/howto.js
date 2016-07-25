'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('howto', {
        url: '/howto',
        templateUrl: 'app/howto/howto.html',
        controller: 'HowtoCtrl'
      });
  });