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
const screen = require('../lib/screen-multiple-choice');

describe('screen-multiple-choice', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('renders markdown and choices', () => {
    screen.create(div, '## Heading\n\nSome text', [{
      text: 'First option'
    }, {
      text: 'Second _option_'
    }], () => { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
    const choices = div.querySelectorAll('.choice');
    assert.equal(choices.length, 2);
    assert.equal(choices[0].querySelector('.label').innerHTML, 'First option');
    assert.equal(choices[1].querySelector('.label').innerHTML,
      'Second <em>option</em>');
  });

  it('invokes callback on next click with selection', () => {
    const spy = sinon.spy();
    screen.create(div, 'Bla', [{
      text: 'A',
      screen: 'abc',
      points: 3
    }, {
      text: 'B',
      screen: 'xyz',
      points: 1
    }], spy);

    const choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, { text: 'A', screen: 'abc', points: 3 });
  });

  it('does not invoke callback on next click if no selection', () => {
    const spy = sinon.spy();
    screen.create(div, 'Bla', [{
      text: 'A',
      screen: 'abc',
      points: 3
    }, {
      text: 'B',
      screen: 'xyz',
      points: 1
    }], spy);

    div.querySelector('.next').click();

    sinon.assert.notCalled(spy);
  });

  it('does not show footer by default', () => {
    screen.create(div, 'Bla', [{
      text: 'A'
    }, {
      text: 'B'
    }], () => { return; });

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

  it('shows footer on choice selection', () => {
    screen.create(div, 'Bla', [{
      text: 'A'
    }, {
      text: 'B'
    }], () => { return; });

    div.querySelectorAll('input[name=choice]')[1].onchange();

    assert.equal(div.querySelector('.footer').style.display, 'block');
  });

});
