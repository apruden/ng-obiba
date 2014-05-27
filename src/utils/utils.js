'use strict';

angular.module('obiba.utils', [])

  .service('StringUtils', function () {
    this.capitaliseFirstLetter = function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
  });
