/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document*/
'use strict';

const animate = require('animatify');

exports.create = function (parent, text, level, callback) {
  const message = document.createElement('div');
  message.innerHTML = text;
  message.classList.add('message', level);
  parent.appendChild(message);
  animate(message, 'bounceInDown', () => {
    message.classList.add('animated', 'infinite', 'pulse');
    if (callback) {
      callback();
    }
  });

  return {
    destroy(callback) {
      message.classList.remove('animated', 'infinite', 'pulse');
      animate(message, 'bounceOutUp', () => {
        parent.removeChild(message);
        if (callback) {
          callback();
        }
      });
    }
  };
};
