/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var animate = require('animatify');


exports.show = function (elements) {
  var delay = 0;
  elements.forEach(function (element) {
    animate(element, 'bounceInUp', {
      delay: delay + 's'
    });
    delay += 0.2;
  });
};

exports.hide = function (elements, callback) {
  if (!elements.length) {
    callback();
    return;
  }
  var delay = 0;
  elements.reverse().forEach(function (element, index) {
    animate(element, 'bounceOutDown', {
      delay: delay + 's'
    }, index === elements.length - 1 ? callback : function () {
      element.style.display = 'none';
    });
    delay += 0.2;
  });
};
