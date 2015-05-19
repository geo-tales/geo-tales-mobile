'use strict';

var animate = require('./animate');


exports.create = function (doc, text, callback) {
  doc.classList.add('warning');
  var message = doc.querySelector('.message');
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
        doc.classList.remove('warning');
        if (callback) {
          callback();
        }
      });
    }
  };
};
