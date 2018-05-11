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
const screen = require('../lib/screen-input');

describe('screen-input', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('renders markdown and input field', () => {
    screen.create(div, '## Heading\n\nSome text', {
      answer: '42'
    }, () => { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
    assert.equal(div.querySelectorAll('input[name=answer]').length, 1);
  });

  it('renders input field with type="text"', () => {
    screen.create(div, '## Heading\n\nSome text', {
      answer: '42'
    }, () => { return; });

    const input = div.querySelector('input[name=answer]');
    assert.equal(input.type, 'text');
  });

  it('renders input field with type="number"', () => {
    screen.create(div, '## Heading\n\nSome text', {
      answer: 42
    }, () => { return; });

    const input = div.querySelector('input[name=answer]');
    assert.equal(input.type, 'number');
  });

  it('invokes callback on next click with correct answer', () => {
    const spy = sinon.spy();
    screen.create(div, 'Hello', { answer: 'world' }, spy);

    const input = div.querySelector('input[name=answer]');
    input.value = 'world';
    input.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

  it('ignores case and whitespace on answer', () => {
    const spy = sinon.spy();
    screen.create(div, 'Hello', { answer: 'world' }, spy);

    const input = div.querySelector('input[name=answer]');
    input.value = 'World ';
    input.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

  it('does not invoke callback on next click if no selection', () => {
    const spy = sinon.spy();
    screen.create(div, 'hello', { answer: 'world' }, spy);

    div.querySelector('input[name=answer]').onchange();
    div.querySelector('.next').click();

    sinon.assert.notCalled(spy);
  });

  it('does not show footer by default', () => {
    screen.create(div, 'hello', { answer: 'world' }, () => { return; });

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

  it('shows footer on correct input', () => {
    screen.create(div, 'hello', { answer: 'world' }, () => { return; });

    const input = div.querySelector('input[name=answer]');
    input.value = 'world';
    input.onchange();

    assert.equal(div.querySelector('.footer').style.display, 'block');
    assert(input.classList.contains('correct'));
  });

  it('does not show footer on wrong input', () => {
    screen.create(div, 'hello', { answer: 'world' }, () => { return; });

    const input = div.querySelector('input[name=answer]');
    input.value = 'mars';
    input.onchange();

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

});
