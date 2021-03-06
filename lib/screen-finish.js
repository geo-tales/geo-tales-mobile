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
const screen = require('./screen');

const html = fs.readFileSync(`${__dirname  }/screen-finish.html`, 'utf8');

function two(n) {
  return n < 10 ? `0${  n}` : n;
}
function formatTime(ms) {
  const t = [];
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  t.push(h, two(m), two(s));
  return t.join(':');
}

exports.create = function (parent, markdown, results, next) {
  const items = [];
  if (results.time) {
    items.push({
      '.name': 'Time:',
      '.value': formatTime(results.time)
    });
  }
  if (typeof results.points === 'number') {
    items.push({
      '.name': 'Points:',
      '.value': String(results.points)
    });
  }
  const screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown
        || '## Congratulations!\n\nYou reached the end of this story.')
    },
    '.result': items
  });
  parent.appendChild(screenElement);
  const footerElement = screenElement.querySelector('.footer');
  const elements = [
    screenElement.querySelector('.text'),
    screenElement.querySelector('.results'),
    footerElement
  ];
  footerElement.querySelector('.close').onclick = function () {
    screen.hide(elements, next);
  };
  screen.show(elements);
};
