
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
