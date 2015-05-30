/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var screen = require('./screen');

var html = fs.readFileSync(__dirname + '/screen-text.html', 'utf8');


exports.create = function (parent, markdown, next) {
  var screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  var footerElement = screenElement.querySelector('.footer');
  var elements = [screenElement.querySelector('.text')];
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
