/*global document*/
'use strict';

var animate = require('./animate');


exports.create = function (parent, text, level, callback) {
  var message = document.createElement('div');
  message.innerHTML = text;
  message.classList.add('message', level);
  parent.appendChild(message);
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
        parent.removeChild(message);
        if (callback) {
          callback();
        }
      });
    }
  };
};
