/*eslint-env mocha*/
/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

require('animatify').disable();

const assert = require('assert');
const sinon = require('sinon');
const screen = require('../lib/screen-text');

describe('screen-text', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('renders markdown', () => {
    screen.create(div, '## Heading\n\nSome text', () => { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
  });

  it('invokes callback on next click', () => {
    const spy = sinon.spy();
    screen.create(div, 'Bla', spy);

    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

});
