/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

function hexColorOf(n) {
  // n := [0, 0.33]
  const c = Math.min(Math.floor(n * 3 * 255), 255).toString(16);
  return c.length === 1 ? `0${c}` : c;
}

module.exports = function (steps) {
  let initialDistance;
  return function (distance) {
    if (!initialDistance) {
      initialDistance = distance;
    }
    const n = (distance - (distance % steps)) / initialDistance;
    let c;
    if (n > 1) {
      if (n > 1.33) {
        c = '0000ff';
      } else {
        c = `00${hexColorOf(1.33 - n)}ff`;
      }
    } else if (n <= 0.33) {
      c = `ff${hexColorOf(n)}00`;
    } else if (n <= 0.66) {
      c = `${hexColorOf(0.66 - n)}ff00`;
    } else {
      c = `00ff${hexColorOf(n - 0.66)}`;
    }
    return `#${c}`;
  };
};
