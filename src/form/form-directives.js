'use strict';

mica.form

  // http://codetunes.com/2013/server-form-validation-with-angular
  .directive('serverError', [function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function (scope, element, attrs, ctrl) {
        return element.on('change', function () {
          return scope.$apply(function () {
            return ctrl.$setValidity('server', true);
          });
        });
      }
    };
  }])

  .directive('formInput', [function () {
    return {
      restrict: 'AE',
      require: '^form',
      scope: {
        name: '@',
        model: '=',
        label: '@',
        required: '@',
        help: '@'
      },
      templateUrl: 'app/commons/form/form-input-template.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model == null) {
          $scope.model = "";
        }
        $scope.form = ctrl;
      }
    };
  }])

  .directive('formCheckbox', [function () {
    return {
      restrict: 'AE',
      require: '^form',
      scope: {
        name: '@',
        model: '=',
        label: '@',
        help: '@'
      },
      templateUrl: 'app/commons/form/form-checkbox-template.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model == null) {
          $scope.model = false;
        }
        $scope.form = ctrl;
      }
    };
  }]);