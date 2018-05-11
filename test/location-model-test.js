/*eslint-env mocha*/
/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const assert = require('assert');
const model = require('../lib/location-model');

describe('localtion-model Circle', () => {

  const circle = new model.Circle({
    latitude: 47.0,
    longitude: 9.1
  }, 25);

  describe('within', () => {

    it('returns true if within circle', () => {
      const result = circle.within({
        latitude: 47.0002,
        longitude: 9.1
      });

      assert.equal(result, true);
    });

    it('returns false if without circle', () => {
      const result = circle.within({
        latitude: 47.00025,
        longitude: 9.1
      });

      assert.equal(result, false);
    });

  });

  describe('distance', () => {

    it('returns distance in meters', () => {
      const result = circle.distance({
        latitude: 47.0002,
        longitude: 9.1
      });

      assert.equal(result, 22);
    });

  });

});

describe('localtion-model Polygon', () => {

  const polygon = new model.Polygon([{
    latitude: 47.0,
    longitude: 9.1
  }, {
    latitude: 47.0002,
    longitude: 9.1
  }, {
    latitude: 47.00022,
    longitude: 9.1005
  }, {
    latitude: 47.0001,
    longitude: 9.1
  }]);

  describe('within', () => {

    it('returns true if within circle', () => {
      const result = polygon.within({
        latitude: 47.00021,
        longitude: 9.1003
      });

      assert.equal(result, true);
    });

    it('returns false if without circle', () => {
      const result = polygon.within({
        latitude: 47.00023,
        longitude: 9.1002
      });

      assert.equal(result, false);
    });

  });

  describe('distance', () => {

    it('returns distance in meters', () => {
      const result = polygon.distance({
        latitude: 47.0005,
        longitude: 9.1003
      });

      assert.equal(result, 43);
    });

  });

});

describe('localtion-model fromJson', () => {

  it('creates circle', () => {
    const center = {
      latitude: 47.001,
      longitutde: 9.1
    };

    const circle = model.fromJson({
      type: 'circle',
      center,
      radius: 3
    });

    assert(circle instanceof model.Circle);
    assert.deepEqual(circle.center, center);
    assert.equal(circle.radius, 3);
  });

  it('creates polygon', () => {
    const coords = [{
      latitude: 47.0,
      longitude: 9.1
    }, {
      latitude: 47.0002,
      longitude: 9.1
    }, {
      latitude: 47.00022,
      longitude: 9.1005
    }, {
      latitude: 47.0001,
      longitude: 9.1
    }];

    const circle = model.fromJson({
      type: 'polygon',
      coords
    });

    assert(circle instanceof model.Polygon);
    assert.deepEqual(circle.coords, coords);
  });

  it('throws if type is unknown', () => {
    assert.throws(() => {
      model.fromJson({
        type: 'unknown'
      });
    }, /Error: Unkown type: unknown/);
  });

});
