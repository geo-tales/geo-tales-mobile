/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global describe, it, beforeEach, afterEach, document, Element*/
'use strict';

var assert = require('assert');
var color = require('../lib/color');


describe('colors', function () {
  var c;

  beforeEach(function () {
    c = color(10);
  });

  it('creates background color to #00ffff initially', function () {
    assert.equal(c(100), '#00ffff');
  });

  it('sets background color to #ff0000 when on shape is reached', function () {
    c(100);

    assert.equal(c(0), '#ff0000');
  });

  it('interpolates background color 1', function () {
    c(100);

    assert.equal(c(33), '#ffe500');
  });

  it('interpolates background color 2', function () {
    c(100);

    assert.equal(c(66), '#2dff00');
  });

  it('interpolates background color 3', function () {
    c(100);

    assert.equal(c(99), '#00ffb7');
  });

  it('sets background to #0000ff when really far away', function () {
    c(100);

    assert.equal(c(200), '#0000ff');
  });

});
