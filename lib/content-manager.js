/*global XMLHttpRequest, localStorage*/
'use strict';

var makeStory = require('./story');
var screenText = require('./screen-text');
var screenRestore = require('./screen-restore');


exports.create = function (contentElement) {

  function load(storyUrl) {
    contentElement.innerHTML = '';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (this.status === 200) {
        try {
          var story = makeStory.fromJson(JSON.parse(this.responseText));
          story(contentElement);
          if (storyUrl !== 'tour.json') {
            localStorage.setItem('story', storyUrl);
          }
        } catch (e) {
          screenText.create(contentElement, '## Failed to load story!\n\n'
            + storyUrl + '\n\n```' + e.toString() + '\n```');
        }
      } else {
        screenText.create(contentElement, '## ' + this.status + '\n\n'
          + storyUrl);
      }
    };
    xhr.open('get', storyUrl, true);
    xhr.send();
  }

  return {
    load: function (storyUrl) {
      var savedStoryUrl = localStorage.getItem('story');
      if (savedStoryUrl) {
        screenRestore.create(contentElement,
          function continueStory() {
            load(savedStoryUrl);
          }, function discardStory() {
            localStorage.clear();
            load(storyUrl);
          });
      } else {
        load(storyUrl);
      }
    }
  };
};
