'use strict';
(function() {

  function MainController($scope, $state, $window) {
    var self = this;
    this.awesomeThings = [];

    //$http.get('/api/levels').then(function(response) {
    //  self.awesomeThings = response.data;
    //});


    $state.go('auth');


  }

  angular.module('nwmApp')
    .controller('MainController', MainController);

})();
