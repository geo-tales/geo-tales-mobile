/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global describe, it, beforeEach, afterEach*/
'use strict';

var assert = require('assert');
var model = require('../lib/location-model');


describe('localtion-model Circle', function () {

  var circle = new model.Circle({
    latitude: 47.0,
    longitude: 9.1
  }, 25);

  describe('within', function () {

    it('returns true if within circle', function () {
      var result = circle.within({
        latitude: 47.0002,
        longitude: 9.1
      });

      assert.equal(result, true);
    });

    it('returns false if without circle', function () {
      var result = circle.within({
        latitude: 47.00025,
        longitude: 9.1
      });

      assert.equal(result, false);
    });

  });

  describe('distance', function () {

    it('returns distance in meters', function () {
      var result = circle.distance({
        latitude: 47.0002,
        longitude: 9.1
      });

      assert.equal(result, 22);
    });

  });

});


describe('localtion-model Polygon', function () {

  var polygon = new model.Polygon([{
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

  describe('within', function () {

    it('returns true if within circle', function () {
      var result = polygon.within({
        latitude: 47.00021,
        longitude: 9.1003
      });

      assert.equal(result, true);
    });

    it('returns false if without circle', function () {
      var result = polygon.within({
        latitude: 47.00023,
        longitude: 9.1002
      });

      assert.equal(result, false);
    });

  });

  describe('distance', function () {

    it('returns distance in meters', function () {
      var result = polygon.distance({
        latitude: 47.0005,
        longitude: 9.1003
      });

      assert.equal(result, 43);
    });

  });

});


describe('localtion-model fromJson', function () {

  it('creates circle', function () {
    var center = {
      latitude: 47.001,
      longitutde: 9.1
    };

    var circle = model.fromJson({
      type: 'circle',
      center: center,
      radius: 3
    });

    assert(circle instanceof model.Circle);
    assert.deepEqual(circle.center, center);
    assert.equal(circle.radius, 3);
  });

  it('creates polygon', function () {
    var coords = [{
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

    var circle = model.fromJson({
      type: 'polygon',
      coords: coords
    });

    assert(circle instanceof model.Polygon);
    assert.deepEqual(circle.coords, coords);
  });

  it('throws if type is unknown', function () {
    assert.throws(function () {
      model.fromJson({
        type: 'unknown'
      });
    }, /Error: Unkown type: unknown/);
  });

});
