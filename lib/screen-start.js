/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const fs = require('fs');
const hyperglue = require('hyperglue');
const marked = require('marked');
const locatify = require('locatify');
const message = require('./message');
const screen = require('./screen');
const screenNavigate = require('./screen-navigate');

const html = fs.readFileSync(`${__dirname  }/screen-start.html`, 'utf8');

let errorMessage;

function destroyErrorMessage() {
  if (errorMessage) {
    errorMessage.destroy();
    errorMessage = null;
  }
}

function render(parent, shape, tracker, next) {
  const screenElement = hyperglue(html, {
    '.text': {
      _html: marked(`## Go to start location\n\n- Latitude: \`${
        shape.center.latitude  }\`\n- Longitude: \`${  shape.center.longitude
      }\``)
    }
  });
  const footerElement = screenElement.querySelector('.footer');
  const elements = [screenElement.querySelector('.text'), footerElement];
  footerElement.querySelector('.next').onclick = function () {
    tracker.destroy();
    destroyErrorMessage();
    screen.hide(elements, () => {
      parent.innerHTML = '';
      window.scrollTo(0, 0);
      screenNavigate.create(parent, shape, {}, next);
    });
  };
  parent.appendChild(screenElement);
  screen.show(elements);
}

exports.create = function (parent, shape, next) {
  let rendered = false;
  const tracker = locatify.create(parent);
  const timeout = setTimeout(() => {
    if (!errorMessage) {
      destroyErrorMessage();
      errorMessage = message.create(parent, 'Waiting for position data',
        'info');
    }
  }, 3000);
  tracker.on('error', (err) => {
    clearTimeout(timeout);
    destroyErrorMessage();
    errorMessage = message.create(parent, err.message, 'warning');
  });
  tracker.on('position', (pos) => {
    clearTimeout(timeout);
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
