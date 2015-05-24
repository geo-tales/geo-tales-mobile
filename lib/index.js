/*global document, location, XMLHttpRequest*/
'use strict';

var querystring = require('querystring');
var makeStory = require('./story');
var screenText = require('./screen-text');


function storyForJson(contentElement, json) {
  try {
    var story = makeStory.fromJson(json);
    story(contentElement);
  } catch (e) {
    screenText.create(contentElement,
        '## Failed to load story!\n\nError: ' + e.message);
  }
}


document.addEventListener('DOMContentLoaded', function () {
  var contentElement = document.body.querySelector('#content');
  var parameters = querystring.parse(location.search.substring(1));
  var storyUrl = parameters.story || 'all-screens.json';
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.status === 200) {
      try {
        storyForJson(contentElement, JSON.parse(this.responseText));
      } catch (e) {
        screenText.create(contentElement, '## Failed to load story\n\n'
          + storyUrl + '\n\n```' + e.toString() + '\n```');
      }
    } else {
      screenText.create(contentElement, '## ' + this.status + '\n\n'
        + storyUrl);
    }
  };
  xhr.open('get', storyUrl, true);
  xhr.send();

});
