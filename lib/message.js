'use strict';

var animate = require('./animate');


exports.create = function (screen, text, callback) {
  screen.classList.add('warning');
  var message = screen.querySelector('.message');
  message.innerHTML = text;
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
        screen.classList.remove('warning');
        if (callback) {
          callback();
        }
      });
    }
  };
};
