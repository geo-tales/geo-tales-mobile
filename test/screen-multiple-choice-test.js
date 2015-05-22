/*global describe, it, beforeEach, afterEach, document*/
'use strict';

require('../lib/animate').disable();

var assert = require('assert');
var sinon = require('sinon');
var screen = require('../lib/screen-multiple-choice');


describe('screen-text', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
  });

  it('renders markdown and choices', function () {
    screen.create(div, '## Heading\n\nSome text', [{
      text: 'First option'
    }, {
      text: 'Second _option_'
    }], function () { return; });

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="heading">Heading</h2>\n<p>Some text</p>\n');
    var choices = div.querySelectorAll('.choice');
    assert.equal(choices.length, 2);
    assert.equal(choices[0].querySelector('.label').innerHTML, 'First option');
    assert.equal(choices[1].querySelector('.label').innerHTML,
      'Second <em>option</em>');
  });

  it('invokes callback on next click with selection', function () {
    var spy = sinon.spy();
    screen.create(div, 'Bla', [{
      text: 'A',
      screen: 'abc',
      points: 3
    }, {
      text: 'B',
      screen: 'xyz',
      points: 1
    }], spy);

    div.querySelectorAll('input[name=choice]')[0].click();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, { text: 'A', screen: 'abc', points: 3 });
  });

  it('does not invoke callback on next click if no selection', function () {
    var spy = sinon.spy();
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

  it('does not show footer by default', function () {
    screen.create(div, 'Bla', [{
      text: 'A'
    }, {
      text: 'B'
    }], function () { return; });

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

  it('shows footer on choice selection', function () {
    screen.create(div, 'Bla', [{
      text: 'A'
    }, {
      text: 'B'
    }], function () { return; });

    div.querySelectorAll('input[name=choice]')[1].onchange();

    assert.equal(div.querySelector('.footer').style.display, 'block');
  });

});
