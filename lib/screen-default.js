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

const html = fs.readFileSync(`${__dirname}/screen-default.html`, 'utf8');
const markdown = fs.readFileSync(`${__dirname}/screen-default.md`, 'utf8');

exports.create = function (parent) {
  const screenElement = hyperglue(html, {
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
