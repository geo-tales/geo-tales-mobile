/*global document*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var locationTracker = require('./location-tracker');
var animate = require('./animate');
var color = require('./color');
var message = require('./message');

var html = fs.readFileSync(__dirname + '/screen-navigate.html', 'utf8');

var POSITION_ERRORS = {
  1: 'Position tracking not allowed',
  2: 'Position tracking unavailable',
  3: 'Position tracking timeout',
  DEFAULT: 'Position tracking error'
};


exports.create = function (parent, shape, opts, next) {
  var screenElement = hyperglue(html, {});
  if (opts.compass === false) {
    screenElement.querySelector('.compass').style.display = 'none';
  }
  parent.appendChild(screenElement);

  var sx = shape.center.latitude;
  var sy = shape.center.longitude;
  var mx, my, deg;
  var lastPos;
  var visible = false;
  var animating = false;
  var arrowElement = screenElement.querySelector('.arrow');

  function updateArrow() {
    // http://www.movable-type.co.uk/scripts/latlong.html
    mx = lastPos.latitude;
    my = lastPos.longitude;
    var wy = sy - my;
    var x = Math.cos(mx) * Math.sin(sx)
      - Math.sin(mx) * Math.cos(sx) * Math.cos(wy);
    var y = Math.sin(wy) * Math.cos(sx);
    var d = Math.atan2(x, y) * 180 / Math.PI;
    var transform = 'rotate(' + Math.round(d - deg + 180) + 'deg)';
    arrowElement.style.transform = transform;
    arrowElement.style.webkitTransform = transform;
    if (!visible) {
      visible = true;
      animating = true;
      arrowElement.style.visibility = 'visible';
      animate(arrowElement, 'zoomIn', function () {
        animating = false;
        updateArrow();
      });
    }
  }

  var tracker = locationTracker.create();
  var makeColor = opts.colorSteps ? color(opts.colorSteps) : null;
  var accuracyElement = screenElement.querySelector('.accuracy');
  var distanceElement = screenElement.querySelector('.distance');

  tracker.on('error', function (err) {
    visible = false;
    arrowElement.style.visibility = 'hidden';
    document.documentElement.style.backgroundColor = 'inherit';
    animating = true;
    var text = POSITION_ERRORS[err.code] || POSITION_ERRORS.DEFAULT;
    message.create(screenElement, text);
  });

  function updateAccuracy() {
    var acc = lastPos.accuracy;
    var pre = acc < 20 ? '' : 'Accuracy: ';
    accuracyElement.innerHTML = pre + Math.round(acc || 10000) + ' m';
  }

  tracker.on('position', function (pos) {
    lastPos = pos;
    if (animating) {
      return;
    }
    var distance = shape.distance(pos);
    if (opts.distance !== false) {
      distanceElement.innerHTML = distance + ' m';
      updateAccuracy();
    }
    if (deg !== undefined) {
      updateArrow();
    }
    var goodAccuracy = pos.accuracy && pos.accuracy < 20;
    if (goodAccuracy) {
      if (accuracyElement.classList.contains('bad')) {
        accuracyElement.classList.remove('bad');
        if (opts.distance === false) {
          accuracyElement.innerHTML = '';
        }
      }
    } else {
      accuracyElement.classList.add('bad');
      if (opts.distance === false) {
        updateAccuracy();
      }
    }
    if (makeColor) {
      document.documentElement.style.backgroundColor = goodAccuracy
        ? makeColor(distance)
        : 'inherit';
    }
    if (shape.within(pos)) {
      tracker.destroy();
      animate(screenElement, 'flash', { iterationCount: 3 }, function () {
        document.documentElement.style.backgroundColor = 'inherit';
        next();
      });
    }
  });

  if (opts.compass !== false) {
    tracker.on('heading', function (heading) {
      if (!heading) {
        return;
      }
      deg = heading;
      if (lastPos && !animating) {
        updateArrow();
      }
    });
  }
};
