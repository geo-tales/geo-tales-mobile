/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global navigator*/
'use strict';

var events = require('events');
var message = require('./message');


var POSITION_ERRORS = {
  1: 'Position tracking not allowed',
  2: 'Position tracking unavailable',
  3: 'Position tracking timeout',
  DEFAULT: 'Position tracking error'
};


exports.create = function (parent) {
  var location = new events.EventEmitter();
  var errorMessage;

  function success(event) {
    if (errorMessage) {
      errorMessage.destroy();
      errorMessage = null;
    }
    location.emit('position', {
      latitude: event.coords.latitude,
      longitude: event.coords.longitude,
      accuracy: event.coords.accuracy
    });
  }

  function error(err) {
    if (!errorMessage && parent) {
      var text = POSITION_ERRORS[err.code] || POSITION_ERRORS.DEFAULT;
      errorMessage = message.create(parent, text, 'warning');
    }
    location.emit('error', err);
  }

  var watch = navigator.geolocation.watchPosition(success, error, {
    enableHighAccuracy: true,
    maximumAge: 0
  });

  function orientationChange(event) {
    location.emit('heading', event.hasOwnProperty('webkitCompassHeading')
        ? event.webkitCompassHeading
        : event.alpha);
  }

  global.addEventListener('deviceorientation', orientationChange, false);

  location.destroy = function () {
    global.removeEventListener('deviceorientation', orientationChange);
    location.removeAllListeners();
    navigator.geolocation.clearWatch(watch);
    if (errorMessage) {
      errorMessage.destroy();
      errorMessage = null;
    }
  };

  return location;
};
