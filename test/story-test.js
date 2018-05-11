/*eslint-env mocha*/
/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

require('animatify').disable();

const assert = require('assert');
const sinon = require('sinon');
const locationTracker = require('locatify');
const locationModel = require('../lib/location-model');
const textScreen = require('../lib/screen-text');
const choicesScreen = require('../lib/screen-multiple-choice');
const navigateScreen = require('../lib/screen-navigate');
const finishScreen = require('../lib/screen-finish');
const startScreen = require('../lib/screen-start');
const inputScreen = require('../lib/screen-input');
const defaultScreen = require('../lib/screen-default');
const makeStory = require('../lib/story');

const dummyCircle = {
  type: 'circle',
  center: {
    latitude: 47.01,
    longitude: 9.15
  },
  radius: 3
};

const dummyPolygon = {
  type: 'polygon',
  coords: [{
    latitude: 47.0,
    longitude: 9.1
  }, {
    latitude: 47.0002,
    longitude: 9.1
  }, {
    latitude: 47.00022,
    longitude: 9.1005
  }, {
    latitude: 47.0001,
    longitude: 9.1
  }]
};

describe('story', () => {
  let div;
  let clock;

  beforeEach(() => {
    div = document.createElement('div');
    sinon.spy(locationTracker, 'create');
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    locationTracker.create.restore();
    localStorage.clear();
    sinon.restore();
  });

  it('creates locations', () => {
    sinon.spy(locationModel, 'fromJson');

    makeStory.fromJson({
      locations: {
        start: dummyCircle,
        bar: dummyPolygon
      },
      screens: {
        start: {
          type: 'navigate',
          location: 'bar',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });

    sinon.assert.calledTwice(locationModel.fromJson);
    sinon.assert.calledWith(locationModel.fromJson, dummyCircle);
    sinon.assert.calledWith(locationModel.fromJson, dummyPolygon);
  });

  it('throws if start location does not exist', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'text',
            text: '## Test',
            next: 'finish'
          },
          finish: {
            type: 'finish'
          }
        }
      });
    }, /Error: Missing "start" location/);
  });

  it('throws if start screen does not exist', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {}
      });
    }, /Error: Missing "start" screen/);
  });

  it('creates start text screen', () => {
    sinon.stub(startScreen, 'create').yields();
    sinon.stub(textScreen, 'create');

    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Oh, hi!',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(textScreen.create);
    sinon.assert.calledWith(textScreen.create, div, '## Oh, hi!');
  });

  it('throws if start screen has no type', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            text: '## Oh, hi!'
          }
        }
      });
    }, /Error: Screen "start" has no type/);
  });

  it('throws if text screen has no text', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'text'
          }
        }
      });
    }, /Error: Screen "start" has no text/);
  });

  it('throws if text screen has no next', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## Hi'
          }
        }
      });
    }, /Error: Screen "start" has no next/);
  });

  it('throws if text screen next does not exist', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## Hi',
            next: 'missing'
          }
        }
      });
    }, /Error: Screen "start" has unknown next "missing"/);
  });

  it('creates start input screen', () => {
    sinon.stub(startScreen, 'create').yields();
    sinon.stub(inputScreen, 'create');

    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'input',
          text: '## Hello',
          answer: 'world',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(inputScreen.create);
    sinon.assert.calledWith(inputScreen.create, div, '## Hello', {
      answer: 'world'
    });
  });

  it('throws if input screen has no text', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'input',
            answer: 'world',
            next: 'end'
          },
          end: {
            type: 'finish'
          }
        }
      });
    }, /Error: Screen "start" has no text/);
  });

  it('throws if input screen has no next', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'input',
            text: '## Hello',
            answer: 'world'
          }
        }
      });
    }, /Error: Screen "start" has no next/);
  });

  it('creates start multiple choice screen', () => {
    sinon.stub(startScreen, 'create').yields();
    sinon.stub(choicesScreen, 'create');

    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'choices',
          text: '## Oh, hi!',
          choices: [{
            text : 'A',
            next: 'end'
          }]
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(choicesScreen.create);
    sinon.assert.calledWith(choicesScreen.create, div, '## Oh, hi!', [{
      text: 'A',
      next: 'end'
    }]);
  });

  it('throws if choices screen has no text', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices'
          }
        }
      });
    }, /Error: Screen "start" has no text/);
  });

  it('throws if choices screen has no choices', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices',
            text: '## Oh, hi!'
          }
        }
      });
    }, /Error: Screen "start" has no choices/);
  });

  it('throws if choice has no text', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices',
            text: 'Pick one',
            choices: [{}]
          }
        }
      });
    }, /Error: Screen "start" has choice without text/);
  });

  it('throws if choice has no next', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices',
            text: 'Pick one',
            choices: [{
              text: 'One'
            }]
          }
        }
      });
    }, /Error: Screen "start" has choice without next/);
  });

  it('throws if choices next does not exists', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices',
            text: 'Pick one',
            choices: [],
            next: 'missing'
          }
        }
      });
    }, /Error: Screen "start" has unknown next "missing"/);
  });

  it('throws if choice next does not exists', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'choices',
            text: 'Pick one',
            choices: [{
              text: 'One',
              next: 'missing'
            }]
          }
        }
      });
    }, /Error: Screen "start" has choice with unknown next "missing"/);
  });

  it('throws if screen type is unknown', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'unknown'
          }
        }
      });
    }, /Error: Screen "start" has unknown type "unknown"/);
  });

  it('shows next screen on click', () => {
    sinon.stub(startScreen, 'create').yields();
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('shows next screen depending on choice', () => {
    sinon.stub(startScreen, 'create').yields();
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'choices',
          text: '## Welcome',
          choices: [{
            text: 'Pick me!',
            next: 'end'
          }],
          next: 'bla'
        },
        end: {
          type: 'text',
          text: '## Goodbye',
          next: 'bla'
        },
        bla: {
          type: 'finish'
        }
      }
    });
    story(div);

    const choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('shows next screen regardless of choice', () => {
    sinon.stub(startScreen, 'create').yields();
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'choices',
          text: '## Welcome',
          choices: [{
            text: 'Pick me!',
            points: 5
          }],
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    const choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('creates start navigate screen', () => {
    sinon.stub(startScreen, 'create').yields();
    sinon.stub(navigateScreen, 'create');

    const story = makeStory.fromJson({
      locations: {
        start: dummyPolygon,
        foo: dummyCircle
      },
      screens: {
        start: {
          type: 'navigate',
          location: 'foo',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(navigateScreen.create);
    sinon.assert.calledWith(navigateScreen.create, div,
      sinon.match.instanceOf(locationModel.Circle), {});
  });

  it('throws if navigate screen has no location', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'navigate'
          }
        }
      });
    }, /Error: Screen "start" has no location/);
  });

  it('throws if navigate screen is unknown', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'navigate',
            location: 'unknown'
          }
        }
      });
    }, /Error: Screen "start" has unknown location "unknown"/);
  });

  it('throws if navigate screen has no next', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyPolygon,
          loc: dummyCircle
        },
        screens: {
          start: {
            type: 'navigate',
            location: 'loc'
          }
        }
      });
    }, /Error: Screen "start" has no next/);
  });

  it('throws if navigate screen next does not exist', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyPolygon,
          loc: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## Hi',
            location: 'loc',
            next: 'missing'
          }
        }
      });
    }, /Error: Screen "start" has unknown next "missing"/);
  });

  it('shows next screen when location is reached', () => {
    sinon.stub(startScreen, 'create').yields();

    const story = makeStory.fromJson({
      locations: {
        start: dummyPolygon,
        loc: dummyCircle
      },
      screens: {
        start: {
          type: 'navigate',
          location: 'loc',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    locationTracker.create.firstCall.returnValue.emit('position', {
      latitude: dummyCircle.center.latitude,
      longitude: dummyCircle.center.longitude,
      accuracy: 5
    });
    clock.tick(500);
    div.querySelector('.footer .next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('passes options to navigate screen', () => {
    sinon.stub(startScreen, 'create').yields();
    sinon.spy(navigateScreen, 'create');
    const story = makeStory.fromJson({
      locations: {
        start: dummyPolygon,
        loc: dummyCircle
      },
      screens: {
        start: {
          type: 'navigate',
          location: 'loc',
          options: {
            colorSteps: 3,
            distance: false,
            compass: false
          },
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(navigateScreen.create);
    sinon.assert.calledWith(navigateScreen.create, div, sinon.match.any, {
      colorSteps: 3,
      distance: false,
      compass: false
    });
  });

  it('passes points to finish screen', () => {
    sinon.stub(finishScreen, 'create');

    const story = makeStory.fromJson({
      demo: true,
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'choices',
          text: '## Oh, hi!',
          choices: [{
            text: 'Points!',
            points: 5,
            next: 'two'
          }]
        },
        two: {
          type: 'choices',
          text: '## Oh, hi!',
          choices: [{
            text: 'More points!',
            points: 2,
            next: 'finish'
          }]
        },
        finish: {
          type: 'finish'
        }
      }
    });
    story(div);
    let choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();
    choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(finishScreen.create);
    sinon.assert.calledWith(finishScreen.create, div, undefined, {
      time: sinon.match.number,
      points: 7
    });
  });

  it('creates finish screen', () => {
    sinon.stub(finishScreen, 'create');

    const story = makeStory.fromJson({
      demo: true,
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Oh, hi!',
          next: 'finish'
        },
        finish: {
          type: 'finish'
        }
      }
    });
    story(div);
    div.querySelector('.next').click();

    sinon.assert.calledOnce(finishScreen.create);
    sinon.assert.calledWith(finishScreen.create, div, undefined, {
      time: sinon.match.number
    });
  });

  it('throws if no finish screen exists', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## One',
            next: 'two'
          },
          two: {
            type: 'text',
            text: '## Two',
            next: 'start'
          }
        }
      });
    }, /Error: Missing "finish" screen/);
  });

  it('shows welcome screen if not at start location', () => {
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Test',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    locationTracker.create.firstCall.returnValue.emit('position', {
      latitude: dummyCircle.center.latitude + 0.0001,
      longitude: dummyCircle.center.longitude
    });

    assert.equal(div.querySelector('.text').innerHTML.indexOf(
      '<h2 id="go-to-start-location">Go to start location</h2>'
    ), 0);
  });

  it('shows navigate screen on Go! click', () => {
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Test',
          next: 'end'
        },
        end: {
          type: 'finish'
        }
      }
    });
    story(div);

    locationTracker.create.firstCall.returnValue.emit('position', {
      latitude: dummyCircle.center.latitude + 0.0001,
      longitude: dummyCircle.center.longitude,
      accuracy: 5
    });
    div.querySelector('.footer .next').click();

    assert.notEqual(div.querySelector('.compass'), null);
    assert.notEqual(div.querySelector('.distance'), null);

    locationTracker.create.secondCall.returnValue.emit('position', {
      latitude: dummyCircle.center.latitude,
      longitude: dummyCircle.center.longitude,
      accuracy: 5
    });
    clock.tick(500);
    div.querySelector('.footer .next').click();

    assert.equal(div.querySelector('.compass'), null);
    assert.equal(div.querySelector('.distance'), null);
  });

  it('throws if location is not used', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle,
          foo: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## Test',
            next: 'end'
          },
          end: {
            type: 'finish'
          }
        }
      });
    }, /Error: Location "foo" is not used/);
  });

  it('throws if screen is not used', () => {
    assert.throws(() => {
      makeStory.fromJson({
        locations: {
          start: dummyCircle
        },
        screens: {
          start: {
            type: 'text',
            text: '## Test',
            next: 'end'
          },
          foo: {
            type: 'text',
            text: '## Test',
            next: 'end'
          },
          end: {
            type: 'finish'
          }
        }
      });
    }, /Error: Screen "foo" is not used/);
  });

  it('shows saved screen', () => {
    localStorage.setItem('screen', 'two');

    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'two'
        },
        two: {
          type: 'text',
          text: '## Oh, hi!',
          next: 'finish'
        },
        finish: {
          type: 'finish'
        }
      }
    });
    story(div);

    assert.equal(div.querySelector('h2').innerHTML, 'Oh, hi!');
  });

  it('saves current screen name', () => {
    sinon.stub(startScreen, 'create').yields();
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'two'
        },
        two: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    assert.equal(localStorage.getItem('screen'), 'start');

    div.querySelector('.next').click();

    assert.equal(localStorage.getItem('screen'), 'two');
  });

  it('clears saved screen name on finish screen', () => {
    sinon.stub(startScreen, 'create').yields();
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);
    localStorage.setItem('any-unrelated-key', 'foo');

    div.querySelector('.next').click();

    assert.strictEqual(localStorage.getItem('screen'), null);
    assert.strictEqual(localStorage.getItem('any-unrelated-key'), null);
  });

  it('shows default screen after finish screen', () => {
    sinon.stub(startScreen, 'create');
    sinon.stub(defaultScreen, 'create');
    const story = makeStory.fromJson({
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);
    startScreen.create.firstCall.yield();

    div.querySelector('.next').click();
    div.querySelector('.close').click();

    sinon.assert.calledOnce(defaultScreen.create);
    sinon.assert.calledWith(defaultScreen.create, div);
  });

  it('stores, restores and removes startTime', () => {
    sinon.stub(startScreen, 'create').yields();
    clock.tick(60000);
    const json = {
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    };
    makeStory.fromJson(json)(div);

    assert.equal(localStorage.getItem('startTime'), '60000');

    clock.tick(35000);
    div = document.createElement('div');
    makeStory.fromJson(json)(div);
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.results .value').innerHTML, '0:00:35');
    assert.strictEqual(localStorage.getItem('startTime'), null);
  });

  it('stores, restores and removes points', () => {
    sinon.stub(startScreen, 'create').yields();
    const json = {
      locations: {
        start: dummyCircle
      },
      screens: {
        start: {
          type: 'choices',
          text: '## Welcome',
          choices: [{
            text: 'The one and only',
            points: 42
          }],
          next: 'two'
        },
        two: {
          type: 'text',
          text: '## Great!',
          next: 'end'
        },
        end: {
          type: 'finish',
          text: '## Goodbye'
        }
      }
    };
    makeStory.fromJson(json)(div);
    const choice = div.querySelector('input[name=choice]');
    choice.setAttribute('checked', 'checked');
    choice.onchange();
    div.querySelector('.next').click();

    assert.equal(localStorage.getItem('points'), '42');

    div = document.createElement('div');
    makeStory.fromJson(json)(div);
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.results .value').innerHTML, '42');
    assert.strictEqual(localStorage.getItem('points'), null);
  });

});
