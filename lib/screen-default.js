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

var html = fs.readFileSync(__dirname + '/screen-default.html', 'utf8');
var markdown = fs.readFileSync(__dirname + '/screen-default.md', 'utf8');


exports.create = function (parent) {
  var screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  parent.appendChild(screenElement);
  screen.show([
    screenElement.querySelector('.text'),
    screenElement.querySelector('form')
  ]);
};
