
var levelOne = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game/:id',
        templateUrl: 'app/level-one/level-one.html',
        controller: 'LevelOneController'
      });
  });

levelOne.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event:event});
      });
    });
  };
});

levelOne.service('alienDataService', function() {
  var serviceData = [];
  var shuffledServiceData = [];
  var numOfModels = 0;
  var version = 1;
  var allAliens = []; // Including model, aliens and inside each aliens there are id, prop and url.
  var allIDs = [];

  // Helper function to parse modelsName.
  this.parseData = function(model, alien) {
    for (var i = 0; i < serviceData.length; i++){
      for (var j = 0; j < serviceData[i].length; j++){
        var split_id = serviceData[i][j].modelsName.split(/a|b/)[1];
        if (split_id.split("_")[0] == model && split_id.split("_")[1] == alien){
          return serviceData[i][j];
        }
        else{
          continue;
        }}}}

  // Helper functions to parse alien ID.
  this.get_model = function(ID){
    var modelNum = ID.split("_")[0];
    return modelNum;
  };
  this.get_alien = function(ID){
    var alienNum = ID.split("_")[1];
    return alienNum;
  };


  this.setAliens = function(data) {
    serviceData = data;
    numOfModels = data.length;

    // First get the version code of the this level.
    // modelsName is a string in the form of 'level4b6_9'
    if((data[0][0].modelsName).indexOf('a') >= 0){
      version = 1;
    } else{
      version = 2;
    }

    // Instantiate allAliens.
    for (var i = 0; i < numOfModels; i++) {
      allAliens.push({model: i, aliens: []});
      for (var j = 0; j < data[i].length; j++){
        var parsed_data = this.parseData(i, j);
        allAliens[i].aliens.push({id: i + "_" + j, prop: [], url: parsed_data.Alien.url});
        allAliens[i].aliens[j].prop = parsed_data.attributes;
      }
    }
  }

  this.getVersion = function() {
    return version;
  }

  this.getShuffledArray = function() {
    // Deep copy serviceData.
    shuffledServiceData = JSON.parse(JSON.stringify(serviceData));

    for (var i = numOfModels - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffledServiceData[i];
      shuffledServiceData[i] = shuffledServiceData[j];
      shuffledServiceData[j] = temp;
    }
    return shuffledServiceData;
  }

  this.getAllAlienIDs = function() {
    for (var i = 0; i < numOfModels; i++) {
      for (var j = 0; j < serviceData[i].length; j++){
        allIDs.push(serviceData[i].aliens[j].id);
      }
    }
  }

  this.getPropByAlienID = function(ID) {
    var model = this.get_model(ID);
    var alien = this.get_alien(ID);

    return serviceData[model].aliens[alien].prop;
  }


});
