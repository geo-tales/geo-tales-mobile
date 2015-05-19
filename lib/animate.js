/*globals document*/
'use strict';

var animationEndEvent = (function () {
  var el = document.createElement('div');
  var animations = {
    'animation'      : 'animationend',
    'OAnimation'     : 'oAnimationEnd',
    'MozAnimation'   : 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd'
  };
  var t;
  for (t in animations) {
    if (animations.hasOwnProperty(t) && el.style[t] !== undefined) {
      return animations[t];
    }
  }
}());

var disabled = false;

function animate(element, animation, callback) {
  if (disabled) {
    callback();
    return;
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
