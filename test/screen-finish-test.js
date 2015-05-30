/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global describe, it, beforeEach, afterEach, document*/
'use strict';

require('../lib/animate').disable();

var assert = require('assert');
var sinon = require('sinon');
var screen = require('../lib/screen-finish');


describe('screen-finish', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
  });

  it('renders markdown', function () {
    screen.create(div, '## Heading\n\nSome text', {});

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
  });

  it('defaults text', function () {
    screen.create(div, null, {});

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="congratulations-">Congratulations!</h2>\n'
      + '<p>You reached the end of this story.</p>\n');
  });

  it('shows points', function () {
    screen.create(div, 'Bla', {
      points: 42
    });

    assert.equal(div.querySelector('.results .name').innerHTML, 'Points:');
    assert.equal(div.querySelector('.results .value').innerHTML, '42');
  });

  it('shows 0 points', function () {
    screen.create(div, 'Bla', {
      points: 0
    });

    assert.equal(div.querySelector('.results .name').innerHTML, 'Points:');
    assert.equal(div.querySelector('.results .value').innerHTML, '0');
  });

  it('does not show undefined points', function () {
    screen.create(div, 'Bla', {
      points: undefined
    });

    assert.equal(div.querySelector('.results .name'), null);
  });

  it('shows time', function () {
    screen.create(div, 'Bla', {
      time: 3600000 + 4 * 60000 + 35000
    });

    assert.equal(div.querySelector('.results .name').innerHTML, 'Time:');
    assert.equal(div.querySelector('.results .value').innerHTML, '1:04:35');
  });

});
