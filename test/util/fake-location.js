/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const sinon = require('sinon');

exports.create = function (defaultAccuracy) {
  const watch = sinon.stub(navigator.geolocation, 'watchPosition');
  const clear = sinon.stub(navigator.geolocation, 'clearWatch');

  return {

    updatePosition(pos) {
      pos.accuracy = pos.accuracy || defaultAccuracy || 0;
      watch.lastCall.args[0]({
        coords: pos
      });
    },

    updateOrientation(props) {
      const event = document.createEvent('HTMLEvents');
      if ('ondeviceorientationabsolute' in window) {
        event.initEvent('deviceorientationabsolute', true, true);
      } else {
        event.initEvent('deviceorientation', true, true);
      }
      if (props) {
        Object.keys(props).forEach((key) => {
          event[key] = props[key];
        });
      }
      document.dispatchEvent(event);
    },

    destroy() {
      watch.restore();
      clear.restore();
    }
  };
};
