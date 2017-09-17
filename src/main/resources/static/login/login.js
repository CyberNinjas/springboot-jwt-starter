angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', '$httpParamSerializerJQLike', '$interval',
  function($scope, $rootScope, $http, $location, $httpParamSerializerJQLike, $interval) {
  $scope.error = false;
  $rootScope.selectedTab = $location.path() || '/';

  $scope.credentials = {};
  $scope.login = function() {
    // We are using formLogin in our backend, so here we need to serialize our form data
    $http({
      url: 'auth/login',
      method: 'POST',
      data: $httpParamSerializerJQLike($scope.credentials),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function(res) {
      $rootScope.authenticated = true;
      $rootScope.access_token = res.data.access_token;
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.access_token;
      $location.path("#/");
      $rootScope.selectedTab = "/";
      $scope.error = false;
      $interval(function(){
        $http({method: 'GET', url: 'auth/refresh'})
            .success(function(data) {
                    $rootScope.access_token = data.access_token;
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.access_token;
            });
        }, 10000);
    })
    .catch(function() {
      $rootScope.authenticated = false;
      $location.path("auth/login");
      $rootScope.selectedTab = "/login";
      $scope.error = true;
    });
  };
}]);
