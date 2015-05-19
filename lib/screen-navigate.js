/*global document*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var locationTracker = require('./location-tracker');
var animate = require('./animate');
var color = require('./color');
var message = require('./message');

var html = fs.readFileSync(__dirname + '/screen-navigate.html', 'utf8');


exports.create = function (parent, shape, opts, next) {
  var doc = hyperglue(html, {});
  if (opts.compass === false) {
    doc.querySelector('.compass').style.display = 'none';
  }
  if (opts.distance === false) {
    doc.querySelector('.distance').style.display = 'none';
    doc.querySelector('.accuracy').style.display = 'none';
  }
  parent.appendChild(doc);

  var sx = shape.center.latitude;
  var sy = shape.center.longitude;
  var mx, my, deg;
  var lastPos;
  var visible = false;
  var animating = false;
  var arrow = doc.querySelector('.arrow');

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
      hyperglue(doc, {
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
      next();
    }
  }

  var msg;

  tracker.on('position', function (pos) {
    lastPos = pos;
    if (animating) {
      return;
    }
    if (pos.accuracy > 20) {
      if (!msg) {
        visible = false;
        arrow.style.visibility = 'hidden';
        document.documentElement.style.backgroundColor = 'transparent';
        animating = true;
        msg = message.create(doc, 'Signal', function () {
          animating = false;
        });
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
