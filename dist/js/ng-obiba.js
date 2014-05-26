'use strict';

angular.module('obiba.form')

  // http://codetunes.com/2013/server-form-validation-with-angular
  .directive('formServerError', [function () {
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
      templateUrl: 'src/form/form-input-template.tpl.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model === null) {
          $scope.model = '';
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
      templateUrl: 'src/form/form-checkbox-template.tpl.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model === null) {
          $scope.model = false;
        }
        $scope.form = ctrl;
      }
    };
  }]);;'use strict';

angular.module('obiba.form')

  .service('FormServerValidation', ['$rootScope', '$log', 'StringUtils', 'NOTIFICATION_EVENTS',
    function ($rootScope, $log, StringUtils, NOTIFICATION_EVENTS) {
      this.error = function (response, form, languages) {
//        $log.debug('FormServerValidation response', response);
//        $log.debug('FormServerValidation form', form);
//        $log.debug('FormServerValidation languages', languages);

        if (response.data instanceof Array) {

          var setFieldError = function (field, error) {
            form[field].$dirty = true;
            form[field].$setValidity('server', false);
            if (form[field].errors === null) {
              form[field].errors = [];
            }
            form[field].errors.push(StringUtils.capitaliseFirstLetter(error.message));
          };

          response.data.forEach(function (error) {
            var fieldPrefix = error.path.split('.').slice(-2).join('.');
            if (languages && languages.length) {
              languages.forEach(function (lang) {
                setFieldError(fieldPrefix + '-' + lang, error);
              });
            } else {
              setFieldError(fieldPrefix, error);
            }
          });
          $log.debug(form);
        } else {
          $rootScope.$broadcast(NOTIFICATION_EVENTS.showNotificationDialog, {
            titleKey: 'form-server-error',
            message: response.data ? response.data : angular.fromJson(response)
          });
        }

      };
    }]);;'use strict';

angular.module('obiba.form', ['obiba.utils', 'obiba.notification']);
;'use strict';

angular.module('ngObiba', [
  'obiba.form',
  'obiba.notification',
  'obiba.rest',
  'obiba.utils'
]);
;'use strict';

angular.module('obiba.notification')

  .constant('NOTIFICATION_EVENTS', {
    showNotificationDialog: 'event-show-notification-dialog',
    showConfirmDialog: 'event-show-confirmation-dialog',
    confirmDialogAccepted: 'event-confirmation-accepted',
    confirmDialogRejected: 'event-confirmation-rejected'
  })

  .controller('NotificationController', ['$rootScope', '$scope', '$modal', 'NOTIFICATION_EVENTS',
    function ($rootScope, $scope, $modal, NOTIFICATION_EVENTS) {

      $scope.$on(NOTIFICATION_EVENTS.showNotificationDialog, function (event, notification) {
        $modal.open({
          templateUrl: 'src/notification/notification-modal.tpl.html',
          controller: 'NotificationModalController',
          resolve: {
            notification: function () {
              return notification;
            }
          }
        });
      });

      $scope.$on(NOTIFICATION_EVENTS.showConfirmDialog, function (event, confirm, args) {
        $modal.open({
          templateUrl: 'src/notification/notification-confirm-modal.tpl.html',
          controller: 'NotificationConfirmationController',
          resolve: {
            confirm: function () {
              return confirm;
            }
          }
        }).result.then(function () {
            $rootScope.$broadcast(NOTIFICATION_EVENTS.confirmDialogAccepted, args);
          }, function () {
            $rootScope.$broadcast(NOTIFICATION_EVENTS.confirmDialogRejected, args);
          });
      });

    }])
  .controller('NotificationModalController', ['$scope', '$modalInstance', 'notification',
    function ($scope, $modalInstance, notification) {

      $scope.notification = notification;
      if (!$scope.notification.iconClass) {
        $scope.notification.iconClass = 'fa-exclamation-triangle';
      }
      if (!$scope.notification.title && !$scope.notification.titleKey) {
        $scope.notification.titleKey = 'error';
      }

      $scope.close = function () {
        $modalInstance.dismiss('close');
      };

    }])
  .controller('NotificationConfirmationController', ['$scope', '$modalInstance', 'confirm',
    function ($scope, $modalInstance, confirm) {

      $scope.confirm = confirm;

      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

    }]);

;'use strict';

angular.module('obiba.notification', ['pascalprecht.translate', 'ui.bootstrap']);
;'use strict';

angular.module('obiba.rest', ['obiba.notification'])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push('httpErrorsInterceptor');
  }])

  .factory('httpErrorsInterceptor', ['$q', '$rootScope', 'NOTIFICATION_EVENTS',
    function ($q, $rootScope, NOTIFICATION_EVENTS) {
      return function (promise) {
        return promise.then(
          function (response) {
            // $log.debug('httpErrorsInterceptor success', response);
            return response;
          },
          function (response) {
            // $log.debug('httpErrorsInterceptor error', response);
            var config = response.config;
            if (config.errorHandler) {
              return $q.reject(response);
            }
            $rootScope.$broadcast(NOTIFICATION_EVENTS.showNotificationDialog, {
              message: response.data ? response.data : angular.fromJson(response)
            });
            return $q.reject(response);
          });
      };

    }]);
;'use strict';

angular.module('obiba.utils', [])

    .service('StringUtils', function () {
      this.capitaliseFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
    });
;angular.module('templates-main', ['form/form-checkbox-template.tpl.html', 'form/form-input-template.tpl.html', 'notification/notification-confirm-modal.tpl.html', 'notification/notification-modal.tpl.html']);

angular.module("form/form-checkbox-template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("form/form-checkbox-template.tpl.html",
    "<div class=\"checkbox\" ng-class=\"{'has-error': (form[fieldName].$dirty || form.saveAttempted) && form[name].$invalid}\">\n" +
    "\n" +
    "  <label for=\"{{name}}\" class=\"control-label\">\n" +
    "    {{label | translate}}\n" +
    "    <span ng-show=\"required\">*</span>\n" +
    "  </label>\n" +
    "\n" +
    "  <input\n" +
    "      ng-model=\"model\"\n" +
    "      type=\"checkbox\"\n" +
    "      id=\"{{name}}\"\n" +
    "      name=\"{{name}}\"\n" +
    "      server-error>\n" +
    "\n" +
    "  <ul class=\"input-error list-unstyled\" ng-show=\"form[name].$dirty && form[name].$invalid\">\n" +
    "    <li ng-show=\"form[name].$error.required\" translate>required</li>\n" +
    "    <li ng-repeat=\"error in form[name].errors\">{{error}}</li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <p ng-show=\"help\" class=\"help-block\">{{help | translate}}</p>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("form/form-input-template.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("form/form-input-template.tpl.html",
    "<div class=\"form-group\" ng-class=\"{'has-error': (form[name].$dirty || form.saveAttempted) && form[name].$invalid}\">\n" +
    "\n" +
    "  <label for=\"{{name}}\" class=\"control-label\">\n" +
    "    {{label | translate}}\n" +
    "    <span ng-show=\"required\">*</span>\n" +
    "  </label>\n" +
    "\n" +
    "  <input\n" +
    "      ng-model=\"model\"\n" +
    "      type=\"text\"\n" +
    "      class=\"form-control\"\n" +
    "      id=\"{{name}}\"\n" +
    "      name=\"{{name}}\"\n" +
    "      server-error\n" +
    "      ng-required=\"required\">\n" +
    "\n" +
    "  <ul class=\"input-error list-unstyled\" ng-show=\"form[name].$dirty && form[name].$invalid\">\n" +
    "    <li ng-show=\"form[name].$error.required\" translate>required</li>\n" +
    "    <li ng-repeat=\"error in form[name].errors\">{{error}}</li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <p ng-show=\"help\" class=\"help-block\">{{help | translate}}</p>\n" +
    "\n" +
    "</div>");
}]);

angular.module("notification/notification-confirm-modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notification/notification-confirm-modal.tpl.html",
    "<div class=\"modal-content\">\n" +
    "\n" +
    "  <div class=\"modal-header\">\n" +
    "    <button type=\"button\" class=\"close\" aria-hidden=\"true\" ng-click=\"cancel()\">&times;</button>\n" +
    "    <h4 class=\"modal-title\">\n" +
    "      <i class=\"fa fa-exclamation-triangle\"></i>\n" +
    "      <span ng-hide=\"confirm.title\" translate>confirmation</span>\n" +
    "      {{confirm.title}}\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-body\">\n" +
    "    <p>{{confirm.message}}</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-click=\"cancel()\">\n" +
    "      <span ng-hide=\"confirm.cancel\" translate>cancel</span>\n" +
    "      {{confirm.cancel}}\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-primary\" ng-click=\"ok()\">\n" +
    "      <span ng-hide=\"confirm.ok\" translate>ok</span>\n" +
    "      {{confirm.ok}}\n" +
    "    </button>\n" +
    "  </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("notification/notification-modal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notification/notification-modal.tpl.html",
    "<div class=\"modal-content\">\n" +
    "\n" +
    "  <div class=\"modal-header\">\n" +
    "    <button type=\"button\" class=\"close\" aria-hidden=\"true\" ng-click=\"close()\">&times;</button>\n" +
    "    <h4 class=\"modal-title\">\n" +
    "      <i ng-hide=\"notification.iconClass\" class=\"fa fa-info-circle\"></i>\n" +
    "      <i ng-show=\"notification.iconClass\" class=\"fa {{notification.iconClass}}\"></i>\n" +
    "      <span ng-hide=\"notification.title\" translate>{{notification.titleKey || 'notification'}}</span>\n" +
    "      {{notification.title}}\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-body\">\n" +
    "    <p>{{notification.message}}</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"modal-footer\">\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-click=\"close()\">\n" +
    "      <span translate>close</span>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "\n" +
    "</div>");
}]);
