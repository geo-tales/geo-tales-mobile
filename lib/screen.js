/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const animate = require('animatify');

exports.show = function (elements) {
  let delay = 0;
  elements.forEach((element) => {
    animate(element, 'bounceInUp', {
      delay: `${delay  }s`
    });
    delay += 0.2;
  });
};

exports.hide = function (elements, callback) {
  if (!elements.length) {
    callback();
    return;
  }
  let delay = 0;
  elements.reverse().forEach((element, index) => {
    animate(element, 'bounceOutDown', {
      delay: `${delay  }s`
    }, index === elements.length - 1 ? callback : () => {
      element.style.display = 'none';
    });
    delay += 0.2;
  });
};
