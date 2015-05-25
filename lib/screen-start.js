/*global window*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var geolib = require('geolib');
var screen = require('./screen');
var screenNavigate = require('./screen-navigate');
var locationTracker = require('./location-tracker');

var html = fs.readFileSync(__dirname + '/screen-start.html', 'utf8');


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
  var tracker = locationTracker.create();
  tracker.on('position', function (pos) {
    if (shape.within(pos)) {
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
  tracker.on('error', function (err) {
    locationTracker.showErrorMessage(parent, err);
  });
};
