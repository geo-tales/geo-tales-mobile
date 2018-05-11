/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const makeStory = require('./story');
const screenText = require('./screen-text');
const screenRestore = require('./screen-restore');

exports.create = function (contentElement) {

  function load(storyUrl) {
    contentElement.innerHTML = '';
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (this.status === 200) {
        try {
          const story = makeStory.fromJson(JSON.parse(this.responseText));
          story(contentElement);
          if (storyUrl !== 'tour.json') {
            localStorage.setItem('story', storyUrl);
          }
        } catch (e) {
          screenText.create(contentElement, `## Failed to load story!\n\n${
            storyUrl}\n\n\`\`\`${e.toString()}\n\`\`\``);
        }
      } else {
        screenText.create(contentElement, `## ${this.status}\n\n${storyUrl}`);
      }
    };
    xhr.open('get', storyUrl, true);
    xhr.send();
  }

  return {
    load(storyUrl) {

      function discardStory() {
        localStorage.clear();
        load(storyUrl);
      }

      const savedStoryUrl = localStorage.getItem('story');
      if (savedStoryUrl && localStorage.getItem('screen')) {
        screenRestore.create(contentElement, () => {
          load(savedStoryUrl);
        }, discardStory);
      } else {
        discardStory();
      }
    }
  };
};
