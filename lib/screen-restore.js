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
const screen = require('./screen');

const html = fs.readFileSync(`${__dirname  }/screen-restore.html`, 'utf8');

exports.create = function (parent, continueStory, discardStory) {
  const screenElement = hyperglue(html, {});
  parent.appendChild(screenElement);
  const footerElement = screenElement.querySelector('.footer');
  const elements = [
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
