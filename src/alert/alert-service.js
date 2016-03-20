'use strict';

angular.module('obiba.alert')

  .constant('ALERT_EVENTS', {
    showAlert: 'event:show-alert'
  })

  .service('AlertService', ['$rootScope', '$log', 'LocaleStringUtils', 'ALERT_EVENTS',
    function ($rootScope, $log, LocaleStringUtils, ALERT_EVENTS) {

      function getValidMessage(options) {
        var value = LocaleStringUtils.translate(options.msgKey, options.msgArgs);
        if (value === options.msgKey) {
          if (options.msg) {
            return options.msg;
          }

          $log.error('No message was provided for the alert!');
          return '';
        }

        return value;
      }

      function broadcast(options, growl) {
        $rootScope.$broadcast(ALERT_EVENTS.showAlert, {
          uid: new Date().getTime(), // useful for delay closing and cleanup
          message: getValidMessage(options),
          type: options.type ? options.type : 'info',
          growl: growl,
          timeoutDelay: options.delay ? Math.max(0, options.delay) : 0
        }, options.id);
      }

      this.alert = function (options) {
        broadcast(options);
      };

      this.growl = function(options) {
        broadcast(options, true);
      };
    }]);
