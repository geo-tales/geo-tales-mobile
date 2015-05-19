/*global describe, it, beforeEach, afterEach, document, Element*/
'use strict';

require('../lib/animate').disable();

var assert = require('assert');
var sinon = require('sinon');
var navigate = require('../lib/screen-navigate');
var locationModel = require('../lib/location-model');
var fakeLocation = require('./util/fake-location');


describe('screen-navigate', function () {
  var loc;
  var div;
  var circle;
  var screen;
  var next;

  beforeEach(function () {
    loc = fakeLocation.create();
    div = document.createElement('div');
    circle = new locationModel.Circle({
      longitude: 47.05,
      latitude: 9.1
    }, 20);
    next = sinon.spy();
  });

  afterEach(function () {
    if (screen) {
      screen.destroy();
    }
    loc.destroy();
  });

  function render(opts) {
    screen = navigate.create(div, circle, opts || {}, next);
  }

  it('renders compass, arrow and distance fields', function () {
    render();

    assert(div.querySelector('.compass') instanceof Element);
    assert(div.querySelector('.arrow') instanceof Element);
    assert(div.querySelector('.distance') instanceof Element);
  });

  it('displays distance and accuracy', function () {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 5
    });

    assert.equal(div.querySelector('.distance').innerHTML, '110 m');
    assert.equal(div.querySelector('.accuracy').innerHTML, '5 m');
  });

  it('rounds accuracy', function () {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 15.8
    });

    assert.equal(div.querySelector('.accuracy').innerHTML, '16 m');
  });

  it('updates arrow rotation', function () {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1
    });
    loc.updateOrientation({
      alpha: 120
    });

    assert.equal(div.querySelector('.arrow').style.transform, 'rotate(60deg)');
    assert.equal(div.querySelector('.arrow').style.webkitTransform,
        'rotate(60deg)');
  });

  it('shows warning if not accurate enough', function () {
    document.documentElement.style.backgroundColor = '#ff0000';
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 21
    });

    assert(div.querySelector('.screen').classList.contains('warning'));
    assert(div.querySelector('.message').classList.contains('animated'));
    assert.equal(div.querySelector('.arrow').style.visibility, 'hidden');
    assert.equal(document.documentElement.style.backgroundColor,
        'transparent');
  });

  it('hides warning if accuracy gets better', function () {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 21
    });
    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 20
    });
    loc.updateOrientation({
      alpha: 120
    });

    assert.equal(div.querySelector('.screen').classList.contains('warning'),
        false);
    assert.equal(div.querySelector('.arrow').style.visibility, 'visible');
  });

  it('emits complete once inside shape', function () {
    render();

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1
    });

    sinon.assert.calledOnce(next);
  });

  it('does not render compass', function () {
    render({ compass : false });

    assert.equal(div.querySelector('.compass').style.display, 'none');
    assert(div.querySelector('.distance') instanceof Element);
    assert(div.querySelector('.accuracy') instanceof Element);
  });

  it('does not update arrow rotation', function () {
    render({ compass : false });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1
    });
    loc.updateOrientation({
      alpha: 120
    });

    assert.equal(div.querySelector('.arrow').style.transform, undefined);
  });

  it('does not render distance and accuracy', function () {
    render({ distance : false });

    assert.equal(div.querySelector('.distance').style.display, 'none');
    assert.equal(div.querySelector('.accuracy').style.display, 'none');

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 25
    });

    assert.equal(div.querySelector('.distance').innerHTML, '');
    assert.equal(div.querySelector('.accuracy').innerHTML, '');
  });

  it('sets background color', function () {
    render({ colorSteps : 10 });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1
    });
    loc.updatePosition({
      longitude: 47.0511,
      latitude: 9.1
    });

    assert.equal(document.documentElement.style.backgroundColor,
        'rgb(0, 182, 255)');
  });

});
