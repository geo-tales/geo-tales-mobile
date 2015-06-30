/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document*/
'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var animate = require('animatify');
var locatify = require('locatify');
var color = require('./color');
var message = require('./message');
var screen = require('./screen');

var html = fs.readFileSync(__dirname + '/screen-navigate.html', 'utf8');


exports.create = function (parent, shape, opts, next) {
  var screenElement = hyperglue(html, {});
  var compassElement = screenElement.querySelector('.compass');
  var arrowElement = screenElement.querySelector('.arrow');
  var accuracyElement = screenElement.querySelector('.accuracy');
  var distanceElement = screenElement.querySelector('.distance');
  var footerElement = screenElement.querySelector('.footer');
  footerElement.style.display = 'none';
  if (opts.compass === false) {
    compassElement.style.display = 'none';
  }
  parent.appendChild(screenElement);

  var sx = shape.center.latitude;
  var sy = shape.center.longitude;
  var mx, my, deg;
  var lastPos;
  var visible = false;
  var animating = false;
  var errorMessage;

  function updateArrow() {
    // http://www.movable-type.co.uk/scripts/latlong.html
    mx = lastPos.latitude;
    my = lastPos.longitude;
    var wy = sy - my;
    var x = Math.cos(mx) * Math.sin(sx)
      - Math.sin(mx) * Math.cos(sx) * Math.cos(wy);
    var y = Math.sin(wy) * Math.cos(sx);
    var d = Math.atan2(x, y) * 180 / Math.PI - deg + 180;
    if (d < 0) {
      d += 360;
    }
    var transform = 'rotate(' + Math.round(d) + 'deg)';
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

  var tracker;
  if (opts.demo) {
    tracker = new events.EventEmitter();
    tracker.destroy = function () {
      tracker.removeAllListeners();
    };
  } else {
    tracker = locatify.create(parent);
  }
  var makeColor = opts.colorSteps ? color(opts.colorSteps) : null;

  tracker.on('error', function (err) {
    if (!errorMessage) {
      errorMessage = message.create(parent, err.message, 'warning');
    }
    visible = false;
    arrowElement.style.visibility = 'hidden';
    document.documentElement.style.backgroundColor = 'inherit';
  });

  function updateAccuracy() {
    var acc = lastPos.accuracy;
    var pre = acc < 20 ? '' : 'Accuracy: ';
    accuracyElement.innerHTML = pre + Math.round(acc || 10000) + ' m';
  }

  tracker.on('position', function (pos) {
    if (errorMessage) {
      errorMessage.destroy();
      errorMessage = null;
    }
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
    if (goodAccuracy && shape.within(pos)) {
      if (errorMessage) {
        errorMessage.destroy();
        errorMessage = null;
      }
      tracker.destroy();
      var elements = [];
      if (opts.compass !== false) {
        elements.push(compassElement);
      }
      if (opts.distance !== false) {
        elements.push(distanceElement, accuracyElement);
      }
      screen.hide(elements, function () {
        compassElement.style.display = 'none';
        distanceElement.style.display = 'none';
        accuracyElement.style.display = 'none';
      });
      footerElement.style.display = 'block';
      screen.show([footerElement]);
      setTimeout(function () {
        var msg = message.create(parent, 'Location reached!', 'info',
          function () {
            footerElement.querySelector('.next').onclick = function () {
              screen.hide([footerElement], function () {
                footerElement.style.display = 'none';
              });
              msg.destroy(function () {
                document.documentElement.style.backgroundColor = 'inherit';
                next();
              });
            };
          });
      }, 500);
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

  if (opts.demo) {
    var l = {
      latitude: shape.center.latitude - 0.0005,
      longitude: shape.center.longitude,
      accuracy: 5
    };
    var h = 360;
    tracker.emit('heading', h);
    tracker.emit('position', l);
    var move = function () {
      setTimeout(function () {
        tracker.emit('heading', h);
        h -= 3;
        tracker.emit('position', l);
        l.latitude += 0.00002;
        if (l.latitude < shape.center.latitude) {
          move();
        }
      }, 50);
    };
    setTimeout(move, 1000);
  }
};
