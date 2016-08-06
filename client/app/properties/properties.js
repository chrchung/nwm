'use strict';

angular.module('nwmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('properties', {
        url: '/properties',
        templateUrl: 'app/properties/properties.html',
        controller: 'PropertiesCtrl'
      });
  });