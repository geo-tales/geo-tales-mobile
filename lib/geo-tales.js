/*global document*/
'use strict';

var textScreen = require('./screen-text');
var navigateScreen = require('./screen-navigate');
var locationModel = require('./location-model');
var animate = require('./animate');

document.addEventListener('DOMContentLoaded', function () {
  var content = document.body.querySelector('#content');
  var circle = new locationModel.Circle({
    latitude: 47.40331,
    longitude: 8.54320
  }, 5);

  textScreen.create(content, [
    '## Test',
    'Some Description with a lot of text that goes on ...',
    ' - one\n - two\n - three',
    'And then some more.'
  ].join('\n\n'), function () {
    var screen = content.querySelector('.screen');
    animate(screen, 'slideOutLeft', function () {
      content.innerHTML = '';
      navigateScreen.create(content, circle, {
        colorSteps : 3
      }, function () {
        content.innerHTML = 'Finish!';
      });
    });
  });

});
