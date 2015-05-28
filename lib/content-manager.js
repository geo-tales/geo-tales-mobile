/*global XMLHttpRequest, localStorage*/
'use strict';

var makeStory = require('./story');
var screenText = require('./screen-text');
var screenRestore = require('./screen-restore');


exports.create = function (contentElement) {

  function storyForJson(json) {
    try {
      var story = makeStory.fromJson(json);
      story(contentElement);
    } catch (e) {
      screenText.create(contentElement,
          '## Failed to load story!\n\n```Error: ' + e.message + '```');
    }
  }

  return {
    load: function (storyUrl) {
      var savedStoryUrl = localStorage.getItem('story');
      if (savedStoryUrl) {
        screenRestore.create(contentElement,
          function continueStory() {
            return;
          }, function discardStory() {
            return;
          });
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (this.status === 200) {
          try {
            storyForJson(JSON.parse(this.responseText));
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
  };
};
