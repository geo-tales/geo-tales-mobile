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

const html = fs.readFileSync(`${__dirname  }/screen-text.html`, 'utf8');

exports.create = function (parent, markdown, next) {
  const screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  const footerElement = screenElement.querySelector('.footer');
  const elements = [screenElement.querySelector('.text')];
  if (next) {
    elements.push(footerElement);
    footerElement.querySelector('.next').onclick = function () {
      screen.hide(elements, next);
    };
  } else {
    footerElement.style.display = 'none';
  }
  parent.appendChild(screenElement);
  screen.show(elements);
};
