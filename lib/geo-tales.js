/*global document, alert*/
'use strict';

var makeStory = require('./story');
var screenText = require('./screen-text');
var json = require('../test/all-screens.json');

document.addEventListener('DOMContentLoaded', function () {

  var contentElement = document.body.querySelector('#content');
  try {
    var story = makeStory.fromJson(json);
    story(contentElement);
  } catch (e) {
    screenText.create(contentElement,
        '## Failed to load story!\n\nError: ' + e.message);
  }

});
