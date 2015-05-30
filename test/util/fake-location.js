/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document, navigator*/
'use strict';

var sinon = require('sinon');

if (!navigator.geolocation) {
  // PhantomJS doesn't support geolocation.
  navigator.geolocation = {
    watchPosition: function () { return; },
    clearWatch: function () { return; }
  };
}

exports.create = function (defaultAccuracy) {
  var watch = sinon.stub(navigator.geolocation, 'watchPosition');
  var clear = sinon.stub(navigator.geolocation, 'clearWatch');

  return {

    updatePosition: function (pos) {
      pos.accuracy = pos.accuracy || defaultAccuracy || 0;
      watch.lastCall.args[0]({
        coords: pos
      });
    },

    updateOrientation: function (props) {
      var event = document.createEvent('HTMLEvents');
      event.initEvent('deviceorientation', true, true);
      if (props) {
        Object.keys(props).forEach(function (key) {
          event[key] = props[key];
        });
      }
      document.dispatchEvent(event);
    },

    destroy: function () {
      watch.restore();
      clear.restore();
    }
  };
};
