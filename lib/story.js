'use strict';

var locationModel = require('./location-model');
var screenText = require('./screen-text');
var screenChoices = require('./screen-multiple-choice');
var screenNavigate = require('./screen-navigate');


function throwScreenError(name, what) {
  throw new Error('Screen "' + name + '" ' + what);
}

function assertScreenProperty(name, json, property) {
  if (!json[property]) {
    throwScreenError(name, 'has no ' + property);
  }
}

function createScreen(screens, name, div, locations) {
  var json = screens[name];
  if (!json) {
    throw new Error('Missing "' + name + '" screen');
  }
  assertScreenProperty(name, json, 'type');
  switch (json.type) {
  case 'text':
    assertScreenProperty(name, json, 'text');
    screenText.create(div, json.text, function () {
      div.innerHTML = '';
      createScreen(screens, json.next, div, locations);
    });
    break;
  case 'choices':
    assertScreenProperty(name, json, 'text');
    assertScreenProperty(name, json, 'choices');
    screenChoices.create(div, json.text, json.choices, function (choice) {
      div.innerHTML = '';
      createScreen(screens, choice.next || json.next, div, locations);
    });
    break;
  case 'navigate':
    assertScreenProperty(name, json, 'location');
    var location = locations[json.location];
    if (!location) {
      throwScreenError(name, 'has unknown location "' + json.location + '"');
    }
    screenNavigate.create(div, location, {});
    break;
  default:
    throwScreenError(name, 'has unknown type "' + json.type + '"');
  }
}


exports.fromJson = function (json) {
  var locations = {};
  Object.keys(json.locations).forEach(function (locationId) {
    locations[locationId] = locationModel.fromJson(json.locations[locationId]);
  });
  return function story(div) {
    createScreen(json.screens, 'start', div, locations);
  };
};
