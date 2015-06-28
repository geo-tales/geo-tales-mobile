/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global window*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var locatify = require('locatify');
var message = require('./message');
var screen = require('./screen');
var screenNavigate = require('./screen-navigate');

var html = fs.readFileSync(__dirname + '/screen-start.html', 'utf8');

var errorMessage;

function destroyErrorMessage() {
  if (errorMessage) {
    errorMessage.destroy();
    errorMessage = null;
  }
}

function render(parent, shape, tracker, next) {
  var screenElement = hyperglue(html, {
    '.text': {
      _html: marked('## Go to start location\n\n- Latitude: `'
        + shape.center.latitude + '`\n- Longitude: `' + shape.center.longitude
        + '`')
    }
  });
  var footerElement = screenElement.querySelector('.footer');
  var elements = [screenElement.querySelector('.text'), footerElement];
  footerElement.querySelector('.next').onclick = function () {
    tracker.destroy();
    destroyErrorMessage();
    screen.hide(elements, function () {
      parent.innerHTML = '';
      window.scrollTo(0, 0);
      screenNavigate.create(parent, shape, {}, next);
    });
  };
  parent.appendChild(screenElement);
  screen.show(elements);
}


exports.create = function (parent, shape, next) {
  var rendered = false;
  var tracker = locatify.create(parent);
  tracker.on('error', function (err) {
    if (!errorMessage) {
      errorMessage = message.create(parent, err.message, 'warning');
    }
  });
  tracker.on('position', function (pos) {
    destroyErrorMessage();
    if (pos.accuracy < 20 && shape.within(pos)) {
      tracker.destroy();
      if (rendered) {
        parent.innerHTML = '';
        window.scrollTo(0, 0);
      }
      next();
    } else if (!rendered) {
      rendered = true;
      render(parent, shape, tracker, next);
    }
  });
};
