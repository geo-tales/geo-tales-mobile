/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const locationModel = require('./location-model');
const screenText = require('./screen-text');
const screenInput = require('./screen-input');
const screenChoices = require('./screen-multiple-choice');
const screenNavigate = require('./screen-navigate');
const screenFinish = require('./screen-finish');
const screenStart = require('./screen-start');
const screenDefault = require('./screen-default');

function throwScreenError(name, what) {
  throw new Error(`Screen "${  name  }" ${  what}`);
}

function assertScreenProperty(name, json, property) {
  if (!json[property]) {
    throwScreenError(name, `has no ${  property}`);
  }
}

function assertScreenExists(screens, name, next) {
  if (!screens[next]) {
    throwScreenError(name, `has unknown next "${  next  }"`);
  }
}

function checkScreens(screens, locations) {
  let hasFinish = false;
  const locationNames = Object.keys(locations);
  const screenNames = Object.keys(screens);
  locationNames.splice(locationNames.indexOf('start'), 1);
  function screenIsUsed(screen) {
    const p = screenNames.indexOf(screen);
    if (p !== -1) {
      screenNames.splice(p, 1);
    }
  }
  screenIsUsed('start');
  Object.keys(screens).filter((name) => {
    const json = screens[name];
    assertScreenProperty(name, json, 'type');
    switch (json.type) {
    case 'text':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      screenIsUsed(json.next);
      break;
    case 'input':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'answer');
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      screenIsUsed(json.next);
      break;
    case 'choices':
      assertScreenProperty(name, json, 'text');
      assertScreenProperty(name, json, 'choices');
      if (json.next) {
        assertScreenExists(screens, name, json.next);
        screenIsUsed(json.next);
      }
      json.choices.forEach((choice) => {
        if (!choice.text) {
          throwScreenError(name, 'has choice without text');
        }
        if (!json.next && !choice.next) {
          throwScreenError(name, 'has choice without next');
        }
        if (choice.next && !screens[choice.next]) {
          throwScreenError(name, `has choice with unknown next "${
            choice.next  }"`);
        }
        if (choice.next) {
          screenIsUsed(choice.next);
        }
      });
      break;
    case 'navigate':
    {
      assertScreenProperty(name, json, 'location');
      const location = locations[json.location];
      if (!location) {
        throwScreenError(name, `has unknown location "${  json.location  }"`);
      }
      const p = locationNames.indexOf(json.location);
      if (p !== -1) {
        locationNames.splice(p, 1);
      }
      assertScreenProperty(name, json, 'next');
      assertScreenExists(screens, name, json.next);
      screenIsUsed(json.next);
      break;
    }
    case 'finish':
      hasFinish = true;
      break;
    default:
      throwScreenError(name, `has unknown type "${  json.type  }"`);
    }
  });
  if (locationNames.length) {
    throw new Error(`Location "${  locationNames[0]  }" is not used`);
  }
  if (screenNames.length) {
    throw new Error(`Screen "${  screenNames[0]  }" is not used`);
  }
  if (!hasFinish) {
    throw new Error('Missing "finish" screen');
  }
}

function createScreen(screens, name, div, locations, context) {
  localStorage.setItem('screen', name);
  const json = screens[name];
  switch (json.type) {
  case 'text':
    screenText.create(div, json.text, () => {
      div.innerHTML = '';
      window.scrollTo(0, 0);
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'input':
    screenInput.create(div, json.text, {
      answer: json.answer
    }, () => {
      div.innerHTML = '';
      window.scrollTo(0, 0);
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  case 'choices':
    screenChoices.create(div, json.text, json.choices, (choice) => {
      div.innerHTML = '';
      window.scrollTo(0, 0);
      if (choice.hasOwnProperty('points')) {
        let points = localStorage.getItem('points');
        points = points ? parseInt(points, 10) : 0;
        localStorage.setItem('points', String(points + choice.points));
      }
      createScreen(screens, choice.next || json.next, div, locations, context);
    });
    break;
  case 'navigate':
  {
    const location = locations[json.location];
    const options = json.options || {};
    if (context.demo) {
      options.demo = true;
    }
    screenNavigate.create(div, location, options, () => {
      div.innerHTML = '';
      window.scrollTo(0, 0);
      createScreen(screens, json.next, div, locations, context);
    });
    break;
  }
  case 'finish':
  {
    const startTime = parseInt(localStorage.getItem('startTime'), 10);
    const results = {
      time: new Date().getTime() - startTime
    };
    const points = localStorage.getItem('points');
    if (points) {
      results.points = parseInt(points, 10);
    }
    screenFinish.create(div, json.text, results, () => {
      div.innerHTML = '';
      window.scrollTo(0, 0);
      screenDefault.create(div);
    });
    localStorage.clear();
    break;
  }
  }
}


exports.fromJson = function (json) {
  if (!json.locations) {
    throw new Error('No locations');
  }
  if (!json.screens) {
    throw new Error('No screens');
  }
  if (!json.locations.start) {
    throw new Error('Missing "start" location');
  }
  if (!json.screens.start) {
    throw new Error('Missing "start" screen');
  }
  const locations = {};
  Object.keys(json.locations).forEach((locationId) => {
    locations[locationId] = locationModel.fromJson(json.locations[locationId]);
  });
  checkScreens(json.screens, locations);

  function story(div, screen) {
    if (!localStorage.getItem('startTime')) {
      localStorage.setItem('startTime', String(new Date().getTime()));
    }
    createScreen(json.screens, screen || 'start', div, locations, {
      demo: json.demo
    });
  }

  return function startStory(div) {
    const savedScreen = localStorage.getItem('screen');
    if (json.demo || savedScreen) {
      story(div, savedScreen);
    } else {
      screenStart.create(div, locations.start, () => {
        div.innerHTML = '';
        window.scrollTo(0, 0);
        story(div);
      });
    }
  };
};
