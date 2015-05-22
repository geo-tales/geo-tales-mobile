/*global document, alert*/
'use strict';

var makeStory = require('./story');

document.addEventListener('DOMContentLoaded', function () {

  try {
    var story = makeStory.fromJson({
      locations: {
        'A': {
          type: 'circle',
          center: {
            latitude: 47.40331,
            longitude: 8.54320
          },
          radius: 5
        },
        'B': {
          type: 'circle',
          center: {
            latitude: 47.40307,
            longitude: 8.54317
          },
          radius: 5
        }
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome\n\nThis is the first story!',
          next: '1'
        },
        '1': {
          type: 'navigate',
          location: 'A',
          next: '2'
        },
        '2': {
          type: 'choices',
          text: '## Pick one\n\nIt doesn\'t matter really...',
          choices: [{
            text: 'Continue',
            points: 3,
            next: '3'
          }, {
            text: 'Done',
            points: 0,
            next: 'finish'
          }]
        },
        '3': {
          type: 'navigate',
          location: 'B',
          options: {
            colorSteps: 3,
            compass: false,
            distance: false
          },
          next: 'finish'
        },
        'finish': {
          type: 'finish'
        }
      }
    });

    story(document.body.querySelector('#content'));

  } catch (e) {
    alert(e.message);
  }

});
