/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document*/
'use strict';

const fs = require('fs');
const events = require('events');
const hyperglue = require('hyperglue');
const animate = require('animatify');
const locatify = require('locatify');
const color = require('./color');
const message = require('./message');
const screen = require('./screen');

const html = fs.readFileSync(`${__dirname  }/screen-navigate.html`, 'utf8');

exports.create = function (parent, shape, opts, next) {
  const screenElement = hyperglue(html, {});
  const compassElement = screenElement.querySelector('.compass');
  const arrowElement = screenElement.querySelector('.arrow');
  const accuracyElement = screenElement.querySelector('.accuracy');
  const distanceElement = screenElement.querySelector('.distance');
  const footerElement = screenElement.querySelector('.footer');
  footerElement.style.display = 'none';
  if (opts.compass === false) {
    compassElement.style.display = 'none';
  }
  parent.appendChild(screenElement);

  const sx = shape.center.latitude;
  const sy = shape.center.longitude;
  let mx, my, deg;
  let lastPos;
  let visible = false;
  let animating = false;
  let errorMessage;

  function destroyErrorMessage() {
    if (errorMessage) {
      errorMessage.destroy();
      errorMessage = null;
    }
  }

  function updateArrow() {
    // http://www.movable-type.co.uk/scripts/latlong.html
    mx = lastPos.latitude;
    my = lastPos.longitude;
    const wy = sy - my;
    const x = Math.cos(mx) * Math.sin(sx)
      - Math.sin(mx) * Math.cos(sx) * Math.cos(wy);
    const y = Math.sin(wy) * Math.cos(sx);
    let d = Math.atan2(x, y) * 180 / Math.PI - deg + 180;
    if (d < 0) {
      d += 360;
    }
    const transform = `rotate(${  Math.round(d)  }deg)`;
    arrowElement.style.transform = transform;
    arrowElement.style.webkitTransform = transform;
    if (!visible) {
      visible = true;
      animating = true;
      arrowElement.style.visibility = 'visible';
      animate(arrowElement, 'zoomIn', () => {
        animating = false;
        updateArrow();
      });
    }
  }

  let tracker;
  let timeout;
  if (opts.demo) {
    tracker = new events.EventEmitter();
    tracker.destroy = function () {
      tracker.removeAllListeners();
    };
  } else {
    tracker = locatify.create();
    timeout = setTimeout(() => {
      if (!errorMessage) {
        destroyErrorMessage();
        errorMessage = message.create(parent, 'Waiting for position data',
          'info');
      }
    }, 3000);
  }
  const makeColor = opts.colorSteps ? color(opts.colorSteps) : null;

  tracker.on('error', (err) => {
    clearTimeout(timeout);
    destroyErrorMessage();
    errorMessage = message.create(parent, err.message, 'warning');
    visible = false;
    arrowElement.style.visibility = 'hidden';
    document.documentElement.style.backgroundColor = 'inherit';
  });

  function updateAccuracy() {
    const acc = lastPos.accuracy;
    const pre = acc < 20 ? '' : 'Accuracy: ';
    accuracyElement.innerHTML = `${pre + Math.round(acc || 10000)  } m`;
  }

  tracker.on('position', (pos) => {
    clearTimeout(timeout);
    destroyErrorMessage();
    lastPos = pos;
    if (animating) {
      return;
    }
    const distance = shape.distance(pos);
    if (opts.distance !== false) {
      distanceElement.innerHTML = `${distance  } m`;
      updateAccuracy();
    }
    if (deg !== undefined) {
      updateArrow();
    }
    const goodAccuracy = pos.accuracy && pos.accuracy < 20;
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
      const elements = [];
      if (opts.compass !== false) {
        elements.push(compassElement);
      }
      if (opts.distance !== false) {
        elements.push(distanceElement, accuracyElement);
      }
      screen.hide(elements, () => {
        compassElement.style.display = 'none';
        distanceElement.style.display = 'none';
        accuracyElement.style.display = 'none';
      });
      footerElement.style.display = 'block';
      screen.show([footerElement]);
      setTimeout(() => {
        const msg = message.create(parent, 'Location reached!', 'info',
          () => {
            footerElement.querySelector('.next').onclick = function () {
              screen.hide([footerElement], () => {
                footerElement.style.display = 'none';
              });
              msg.destroy(() => {
                document.documentElement.style.backgroundColor = 'inherit';
                next();
              });
            };
          });
      }, 500);
    }
  });

  if (opts.compass !== false) {
    tracker.on('heading', (heading) => {
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
    const l = {
      latitude: shape.center.latitude - 0.0005,
      longitude: shape.center.longitude,
      accuracy: 5
    };
    let h = 360;
    tracker.emit('heading', h);
    tracker.emit('position', l);
    const move = function () {
      setTimeout(() => {
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
