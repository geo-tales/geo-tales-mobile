'use strict';

var animate = require('./animate');


exports.create = function (screenElement, text, level, callback) {
  var message = screenElement.querySelector('.message');
  message.innerHTML = text;
  message.classList.add(level);
  animate(message, 'bounceInDown', function () {
    message.classList.add('animated', 'infinite', 'pulse');
    if (callback) {
      callback();
    }
  });

  return {
    destroy: function (callback) {
      message.classList.remove('animated', 'infinite', 'pulse');
      animate(message, 'bounceOutUp', function () {
        message.classList.remove(level);
        if (callback) {
          callback();
        }
      });
    }
  };
};
