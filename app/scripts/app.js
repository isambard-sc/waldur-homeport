'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'satellizer',
    'ui.router',
    'ngCookies',
    'ngResource',
    'duScroll'])
  // urls
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        resolve: {
          authenticated: notLoggedCheck
        }
      })

      .state('login', {
        url: '/login/',
        templateUrl: 'views/login.html',
        controller: 'AuthController',
        resolve: {
          authenticated: notLoggedCheck
        }
      })

      .state('initialdata', {
        url: '/initial-data/',
        templateUrl: 'views/initial-data.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('dashboard', {
        url: '/dashboard/',
        templateUrl: 'views/dashboard.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('projects', {
        url: '/projects/',
        templateUrl: 'views/projects.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('projects-add', {
        url: '/projects/add/',
        templateUrl: 'views/add-project.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('project', {
        url: '/projects/:uuid/',
        templateUrl: 'views/project.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('project-edit', {
        url: '/projects/:uuid/edit/',
        templateUrl: 'views/project-edit.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('services', {
        url: '/services/',
        templateUrl: 'views/services.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('profile', {
        url: '/profile/',
        templateUrl: 'views/profile.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('customers', {
        url: '/customers/',
        templateUrl: 'views/customers.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('customer', {
        url: '/customers/:uuid/',
        templateUrl: 'views/customer.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('customer-edit', {
        url: '/customers/:uuid/edit/',
        templateUrl: 'views/customer-edit.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('customer-plans', {
        url: '/customers/:uuid/plans/',
        templateUrl: 'views/customer-plans.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('users', {
        url: '/users/',
        templateUrl: 'views/users.html',
        auth: true,
        resolve: {
          authenticated: authCheck
        }
      })

      .state('user', {
        url: '/users/:uuid/',
        templateUrl: 'views/user.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('resources', {
        url: '/resources/',
        abstract: true,
        templateUrl: 'views/resource/base.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('resources.list', {
        url: '',
        views: {
          'appContent': {
            templateUrl: 'views/resource/list.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('resources.add', {
        url: '/resources/add/',
        views: {
          'appContent': {
            templateUrl: 'views/resource/create.html',
          },
          'appHeader': {
            templateUrl: 'views/partials/app-header.html',
          },
          'appFooter': {
            templateUrl: 'views/partials/app-footer.html',
          }
        },
        resolve: {
          authenticated: authCheck
        }
      })

      .state('payment', {
        url: '/payment/',
        templateUrl: 'views/payment-start.html',
        resolve: {
          authenticated: authCheck
        }
      })

      .state('payment-finish', {
        url: '/payment/finish/',
        templateUrl: 'views/payment-finish.html',
        resolve: {
          authenticated: authCheck
        }
      });

    function authCheck($q, $location, $auth) {
      var deferred = $q.defer();

      if (!$auth.isAuthenticated()) {
        // can't use $state because its will throw recursion error
        $location.path('/login/');
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    function notLoggedCheck($q, $location, $auth) {
      var deferred = $q.defer();

      if ($auth.isAuthenticated()) {
        // can't use $state because its will throw recursion error
        $location.path('/dashboard/');
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }
  });

(function() {
  angular.module('ncsaas')
    .config(['ENV', 'CUSTOMENV', overrideBaseSettings]);

    function overrideBaseSettings(ENV, CUSTOMENV) {
      for (var property in CUSTOMENV) {
        if (CUSTOMENV.hasOwnProperty(property)) {
            ENV[property] = CUSTOMENV[property];
        }
      }
    }

})();
