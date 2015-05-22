/*globals document*/
'use strict';

var animationEndEvent;
var durationStyle;
var delayStyle;
var iterationCountStyle;

(function () {
  var el = document.createElement('div');
  var animations = {
    'animation': [
      'animationend',
      'animationDuration',
      'animationDelay',
      'animationIterationCount'
    ],
    'MozAnimation': [
      'animationend',
      'mozAnimationDuration',
      'mozAnimationDelay',
      'mozAnimationIterationCount'
    ],
    'WebkitAnimation': [
      'webkitAnimationEnd',
      'webkitAnimationDuration',
      'webkitAnimationDelay',
      'webkitAnimationIterationCount'
    ]
  };
  var t, a;
  for (t in animations) {
    if (animations.hasOwnProperty(t) && el.style[t] !== undefined) {
      a = animations[t];
      animationEndEvent = a[0];
      durationStyle = a[1];
      delayStyle = a[2];
      iterationCountStyle = a[3];
      return;
    }
  }
}());

var disabled = false;

function animate(element, animation, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  if (disabled) {
    callback();
    return;
  }
  if (opts.delay) {
    element.style[delayStyle] = opts.delay;
  }
  if (opts.duration) {
    element.style[durationStyle] = opts.duration;
  }
  if (opts.iterationCount) {
    element.style[iterationCountStyle] = opts.iterationCount;
  }
  element.classList.add('animated', animation);
  function animationEnd() {
    element.removeEventListener(animationEndEvent, animationEnd);
    element.classList.remove('animated', animation);
    if (callback) {
      callback();
    }
  }
  element.addEventListener(animationEndEvent, animationEnd);
}

animate.disable = function () {
  disabled = true;
};

module.exports = animate;
