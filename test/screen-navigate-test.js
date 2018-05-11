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
const navigate = require('../lib/screen-navigate');
const locationModel = require('../lib/location-model');
const fakeLocation = require('./util/fake-location');

describe('screen-navigate', () => {
  let loc;
  let div;
  let circle;
  let screen;
  let clock;
  let next;

  beforeEach(() => {
    loc = fakeLocation.create();
    div = document.createElement('div');
    circle = new locationModel.Circle({
      longitude: 47.05,
      latitude: 9.1
    }, 20);
    clock = sinon.useFakeTimers();
    next = sinon.spy();
  });

  afterEach(() => {
    if (screen) {
      screen.destroy();
    }
    loc.destroy();
    sinon.restore();
  });

  function render(opts) {
    screen = navigate.create(div, circle, opts || {}, next);
  }

  it('renders compass, arrow and distance fields', () => {
    render();

    assert(div.querySelector('.compass') instanceof Element);
    assert(div.querySelector('.arrow') instanceof Element);
    assert(div.querySelector('.distance') instanceof Element);
  });

  it('displays distance and accuracy', () => {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 5
    });

    assert.equal(div.querySelector('.distance').innerHTML, '110 m');
    assert.equal(div.querySelector('.accuracy').innerHTML, '5 m');
  });

  it('rounds accuracy', () => {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 15.8
    });

    assert.equal(div.querySelector('.accuracy').innerHTML, '16 m');
  });

  it('updates arrow rotation', () => {
    render();

    loc.updatePosition({
      absolute: true,
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 10
    });
    loc.updateOrientation({
      absolute: true,
      alpha: 120
    });

    assert.equal(div.querySelector('.arrow').style.transform,
      'rotate(300deg)');
    assert.equal(div.querySelector('.arrow').style.webkitTransform,
      'rotate(300deg)');
  });

  it('shows bad accuracy if not accurate enough', () => {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 20
    });

    assert(div.querySelector('.accuracy').classList.contains('bad'));
  });

  it('hides warning if accuracy gets better', () => {
    render();

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 20
    });
    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 19
    });
    loc.updateOrientation({
      absolute: true,
      alpha: 120
    });

    assert.equal(div.querySelector('.accuracy').classList.contains('bad'),
      false);
  });

  it('shows info message and footer once insde shape', () => {
    render();
    assert.equal(div.querySelector('.footer').style.display, 'none');

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1,
      accuracy: 10
    });

    assert.equal(div.querySelector('.footer').style.display, 'block');
  });

  it('invokes next once inside shape and user clicks next', () => {
    render();

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1,
      accuracy: 10
    });
    clock.tick(500);
    div.querySelector('.footer .next').click();

    sinon.assert.calledOnce(next);
  });

  it('does not render compass', () => {
    render({ compass : false });

    assert.equal(div.querySelector('.compass').style.display, 'none');
    assert(div.querySelector('.distance') instanceof Element);
    assert(div.querySelector('.accuracy') instanceof Element);
  });

  it('does not update arrow rotation', () => {
    render({ compass : false });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 10
    });
    loc.updateOrientation({
      absolute: true,
      alpha: 120
    });

    assert.equal(div.querySelector('.arrow').style.transform, '');
  });

  it('does not render distance and accuracy', () => {
    render({ distance : false });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 5
    });

    assert.equal(div.querySelector('.distance').innerHTML, '');
    assert.equal(div.querySelector('.accuracy').innerHTML, '');
  });

  it('renders accuracy anyway if bad', () => {
    render({ distance : false });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 25
    });

    assert.equal(div.querySelector('.distance').innerHTML, '');
    assert.equal(div.querySelector('.accuracy').innerHTML, 'Accuracy: 25 m');
    assert(div.querySelector('.accuracy').classList.contains('bad'));
  });

  it('removes accuracy again if it gets better', () => {
    render({ distance : false });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 25
    });
    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 5
    });

    assert.equal(div.querySelector('.distance').innerHTML, '');
    assert.equal(div.querySelector('.accuracy').innerHTML, '');
    assert.equal(div.querySelector('.accuracy').classList.contains('bad'),
      false);
  });

  it('sets background color', () => {
    render({ colorSteps : 10 });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 5
    });
    loc.updatePosition({
      longitude: 47.0511,
      latitude: 9.1,
      accuracy: 5
    });

    assert.equal(document.documentElement.style.backgroundColor,
      'rgb(0, 182, 255)');
  });

  it('resets background on bad accuracy', () => {
    document.documentElement.style.backgroundColor = '#ff0000';
    render({ colorSteps : 10 });

    loc.updatePosition({
      longitude: 47.051,
      latitude: 9.1,
      accuracy: 30
    });

    assert.equal(document.documentElement.style.backgroundColor, 'inherit');
  });

  it('resets background color once inside shape', () => {
    document.documentElement.style.backgroundColor = '#ff0000';
    render();

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1,
      accuracy: 10
    });
    clock.tick(500);
    div.querySelector('.footer .next').click();

    assert.equal(document.documentElement.style.backgroundColor, 'inherit');
  });

  it('shows footer if screen is opened within shape', () => {
    render();

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1,
      accuracy: 10
    });

    assert.equal(div.querySelector('.footer').style.display, 'block');
  });

  it('does not show footer if accuracy is bad', () => {
    render();

    loc.updatePosition({
      longitude: 47.05,
      latitude: 9.1,
      accuracy: 20
    });

    assert.equal(div.querySelector('.footer').style.display, 'none');
  });

});
