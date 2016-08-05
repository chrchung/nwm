
var levelOne = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('tut', {
        url: '/tut/:id',
        templateUrl: 'app/tut/tut.html',
        controller: 'TutController'
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

levelOne.filter('toArray', function() { return function(obj) {
  if (!(obj instanceof Object)) return obj;
  return _.map(obj, function(val, key) {
    return Object.defineProperty(val, '$key', {__proto__: null, value: key});
  });
}});
