/*global describe, it, beforeEach, afterEach, document*/
'use strict';

require('../lib/animate').disable();

var assert = require('assert');
var sinon = require('sinon');
var screen = require('../lib/screen-input');


describe('screen-input', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
  });

  it('renders markdown and input field', function () {
    screen.create(div, '## Heading\n\nSome text', {
      answer: '42'
    }, function () { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
    assert.equal(div.querySelectorAll('input[name=answer]').length, 1);
  });

  it('invokes callback on next click with correct answer', function () {
    var spy = sinon.spy();
    screen.create(div, 'Hello', { answer: 'world' }, spy);

    var input = div.querySelector('input[name=answer]');
    input.value = 'world';
    input.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

  it('ignores case and whitespace on answer', function () {
    var spy = sinon.spy();
    screen.create(div, 'Hello', { answer: 'world' }, spy);

    var input = div.querySelector('input[name=answer]');
    input.value = 'World ';
    input.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
  });

  it('does not invoke callback on next click if no selection', function () {
    var spy = sinon.spy();
    screen.create(div, 'hello', { answer: 'world' }, spy);

    div.querySelector('input[name=answer]').onchange();
    div.querySelector('.next').click();

    sinon.assert.notCalled(spy);
  });

  it('does not show footer by default', function () {
    screen.create(div, 'hello', { answer: 'world' }, function () { return; });

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

  it('shows footer on correct input', function () {
    screen.create(div, 'hello', { answer: 'world' }, function () { return; });

    var input = div.querySelector('input[name=answer]');
    input.value = 'world';
    input.onchange();

    assert.equal(div.querySelector('.footer').style.display, 'block');
    assert(input.classList.contains('correct'));
  });

  it('does not show footer on wrong input', function () {
    screen.create(div, 'hello', { answer: 'world' }, function () { return; });

    var input = div.querySelector('input[name=answer]');
    input.value = 'mars';
    input.onchange();

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

});
