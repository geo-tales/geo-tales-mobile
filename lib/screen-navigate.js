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
  '1': 'Permission Denied',
  '2': 'Position Unavailable',
  '3': 'Position Timeout'
};


exports.create = function (parent, shape, opts, next) {
  var screen = hyperglue(html, {});
  if (opts.compass === false) {
    screen.querySelector('.compass').style.display = 'none';
  }
  if (opts.distance === false) {
    screen.querySelector('.distance').style.display = 'none';
    screen.querySelector('.accuracy').style.display = 'none';
  }
  parent.appendChild(screen);

  var sx = shape.center.latitude;
  var sy = shape.center.longitude;
  var mx, my, deg;
  var lastPos;
  var visible = false;
  var animating = false;
  var arrow = screen.querySelector('.arrow');

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
    arrow.style.transform = transform;
    arrow.style.webkitTransform = transform;
    if (!visible) {
      visible = true;
      animating = true;
      arrow.style.visibility = 'visible';
      animate(arrow, 'zoomIn', function () {
        animating = false;
        updateArrow();
      });
    }
  }

  var tracker = locationTracker.create();
  var makeColor = opts.colorSteps ? color(opts.colorSteps) : null;

  function updatePosition() {
    var distance = shape.distance(lastPos);
    if (opts.distance !== false) {
      hyperglue(screen, {
        '.distance': distance + ' m',
        '.accuracy': Math.round(lastPos.accuracy) + ' m'
      });
    }
    if (deg !== undefined) {
      updateArrow();
    }
    if (makeColor) {
      document.documentElement.style.backgroundColor = makeColor(distance);
    }
    if (shape.within(lastPos)) {
      tracker.destroy();
      animate(screen, 'flash', { iterationCount: 3 }, next);
    }
  }

  var msg;

  function showMessage(text) {
    visible = false;
    arrow.style.visibility = 'hidden';
    document.documentElement.style.backgroundColor = 'transparent';
    animating = true;
    msg = message.create(screen, text, function () {
      animating = false;
    });
  }

  tracker.on('error', function (err) {
    var text = POSITION_ERRORS[err.code] || 'Position Error';
    animating = true;
    if (msg) {
      msg.destroy(function () {
        showMessage(text);
      });
    } else {
      showMessage(text);
    }
  });

  tracker.on('position', function (pos) {
    lastPos = pos;
    if (animating) {
      return;
    }
    if (pos.accuracy > 20) {
      if (!msg) {
        showMessage('Signal');
      }
      return;
    }
    if (msg) {
      animating = true;
      msg.destroy(function () {
        animating = false;
        msg = null;
        updatePosition();
      });
    } else {
      updatePosition();
    }
  });

  if (opts.compass !== false) {
    tracker.on('heading', function (heading) {
      if (!heading) {
        return;
      }
      deg = heading;
      if (lastPos && !msg && !animating) {
        updateArrow();
      }
    });
  }
};
