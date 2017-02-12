'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('trailer', {
        url: '/trailer',
        templateUrl: 'app/trailer/trailer.html',
        controller: 'TrailerCtrl'
      });
  });