/*global document, location, XMLHttpRequest*/
'use strict';

var querystring = require('querystring');
var makeStory = require('./story');
var screenText = require('./screen-text');


function storyForJson(json) {
  var contentElement = document.body.querySelector('#content');
  try {
    var story = makeStory.fromJson(json);
    story(contentElement);
  } catch (e) {
    screenText.create(contentElement,
        '## Failed to load story!\n\nError: ' + e.message);
  }
}


document.addEventListener('DOMContentLoaded', function () {

  var parameters = querystring.parse(location.search.substring(1));
  var storyUrl = parameters.story || 'all-screens.json';
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    storyForJson(JSON.parse(this.responseText));
  };
  xhr.open('get', storyUrl, true);
  xhr.send();

});
