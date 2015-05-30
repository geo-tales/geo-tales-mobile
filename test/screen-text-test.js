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
var screen = require('../lib/screen-text');


describe('screen-text', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
  });

  it('renders markdown', function () {
    screen.create(div, '## Heading\n\nSome text', function () { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
  });

  it('invokes callback on next click', function () {
    var spy = sinon.spy();
    screen.create(div, 'Bla', spy);

    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

});
