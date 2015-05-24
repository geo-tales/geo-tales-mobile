/*global window*/
'use strict';

var locationModel = require('./location-model');
var screenText = require('./screen-text');
var screenChoices = require('./screen-multiple-choice');
var screenNavigate = require('./screen-navigate');
var screenFinish = require('./screen-finish');


function throwScreenError(name, what) {
  throw new Error('Screen "' + name + '" ' + what);
}

function assertScreenProperty(name, json, property) {
  if (!json[property]) {
    throwScreenError(name, 'has no ' + property);
  }
}

function assertScreenExists(screens, name, next) {
  if (!screens[next]) {
    throwScreenError(name, 'has unknown next "' + next + '"');
  }
}

function checkScreens(screens, locations) {
  var hasFinish = false;
  Object.keys(screens).forEach(function (name) {
    var json = screens[name];
    assertScreenProperty(name, json, 'type');
    switch (json.type) {
    case 'text':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      break;
    case 'choices':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'choices');
      if (json.next) {
        assertScreenExists(screens, name, json.next);
      }
      json.choices.forEach(function (choice) {
        if (!choice.text) {
          throwScreenError(name, 'has choice without text');
        }
        if (!json.next && !choice.next) {
          throwScreenError(name, 'has choice without next');
        }
        if (choice.next && !screens[choice.next]) {
          throwScreenError(name, 'has choice with unknown next "'
            + choice.next + '"');
        }
      });
      break;
    case 'navigate':
      assertScreenProperty(name, json, 'location');
      var location = locations[json.location];
      if (!location) {
        throwScreenError(name, 'has unknown location "' + json.location + '"');
      }
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      break;
    case 'finish':
      hasFinish = true;
      break;
    default:
      throwScreenError(name, 'has unknown type "' + json.type + '"');
    }
  });
  if (!hasFinish) {
    throw new Error('Missing "finish" screen');
  }
}

function createScreen(screens, name, div, locations, context) {
  var json = screens[name];
  switch (json.type) {
  case 'text':
    screenText.create(div, json.text, function () {
      div.innerHTML = '';
      window.scrollTo(0);
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'choices':
    screenChoices.create(div, json.text, json.choices, function (choice) {
      div.innerHTML = '';
      window.scrollTo(0);
      if (choice.hasOwnProperty('points')) {
        context.points = (context.points || 0) + choice.points;
      }
      createScreen(screens, choice.next || json.next, div, locations, context);
    });
    break;
  case 'navigate':
    var location = locations[json.location];
    screenNavigate.create(div, location, json.options || {}, function () {
      div.innerHTML = '';
      window.scrollTo(0);
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'finish':
    var results = {
      time: Date.now() - context.startTime
    };
    if (context.hasOwnProperty('points')) {
      results.points = context.points;
    }
    screenFinish.create(div, json.text, results, function () {
      div.innerHTML = '';
      window.scrollTo(0);
      if (json.next) {
        createScreen(screens, json.next, div, locations, context);
      } else {
        location.reload();
      }
    });
    break;
  }
}


exports.fromJson = function (json) {
  if (!json.locations) {
    throw new Error('No locations');
  }
  if (!json.screens) {
    throw new Error('No screens');
  }
  var locations = {};
  Object.keys(json.locations).forEach(function (locationId) {
    locations[locationId] = locationModel.fromJson(json.locations[locationId]);
  });
  if (!json.screens.start) {
    throw new Error('Missing "start" screen');
  }
  checkScreens(json.screens, locations);
  return function story(div) {
    createScreen(json.screens, 'start', div, locations, {
      startTime: Date.now()
    });
  };
};
