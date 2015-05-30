/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global location*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var screen = require('./screen');

var html = fs.readFileSync(__dirname + '/screen-restore.html', 'utf8');


exports.create = function (parent, continueStory, discardStory) {
  var screenElement = hyperglue(html, {});
  parent.appendChild(screenElement);
  var footerElement = screenElement.querySelector('.footer');
  var elements = [
    screenElement.querySelector('.text'),
    footerElement
  ];
  footerElement.querySelector('.continue').onclick = function () {
    screen.hide(elements, continueStory);
  };
  footerElement.querySelector('.discard').onclick = function () {
    screen.hide(elements, discardStory);
  };
  screen.show(elements);
};
