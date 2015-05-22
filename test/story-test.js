/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var model = require('../lib/location-model');
var textScreen = require('../lib/screen-text');
var choicesScreen = require('../lib/screen-multiple-choice');
var navigateScreen = require('../lib/screen-navigate');
var makeStory = require('../lib/story');


var dummyCircle = {
  type: 'circle',
  center: {
    latitude: 47.01,
    longitude: 9.15
  },
  radius: 3
};

var dummyPolygon = {
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

describe('story', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
  });

  it('creates locations', sinon.test(function () {
    this.spy(model, 'fromJson');

    makeStory.fromJson({
      locations: {
        foo: dummyCircle,
        bar: dummyPolygon
      }
    });

    sinon.assert.calledTwice(model.fromJson);
    sinon.assert.calledWith(model.fromJson, dummyCircle);
    sinon.assert.calledWith(model.fromJson, dummyPolygon);
  }));

  it('throws if start screen does not exist', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {}
    });

    assert.throws(function () {
      story(div);
    }, /Error: Missing "start" screen/);
  });

  it('creates start text screen', sinon.test(function () {
    this.stub(textScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'text',
          text: '## Oh, hi!'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(textScreen.create);
    sinon.assert.calledWith(textScreen.create, div, '## Oh, hi!');
  }));

  it('throws if start screen has no type', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          text: '## Oh, hi!'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has no type/);
  });

  it('throws if text screen has no text', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'text'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has no text/);
  });

  it('creates start multiple choice screen', sinon.test(function () {
    this.stub(choicesScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'choices',
          text: '## Oh, hi!',
          choices: [{ text : 'A' }]
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(choicesScreen.create);
    sinon.assert.calledWith(choicesScreen.create, div, '## Oh, hi!', [{
      text : 'A'
    }]);
  }));

  it('throws if choices screen has no text', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'choices'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has no text/);
  });

  it('throws if choices screen has no choices', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'choices',
          text: '## Oh, hi!'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has no choices/);
  });

  it('throws if screen type is unknown', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'unknown'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has unknown type "unknown"/);
  });

  it('shows next screen on click', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'text',
          text: '## Welcome',
          next: 'end'
        },
        end: {
          type: 'text',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('shows next screen depending on choice', function () {
    var story = makeStory.fromJson({
      locations: {},
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
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('input[name=choice]').click();
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('shows next screen regardless of choice', function () {
    var story = makeStory.fromJson({
      locations: {},
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
          type: 'text',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('input[name=choice]').click();
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye">Goodbye</h2>\n');
  });

  it('creates start navigate screen', sinon.test(function () {
    this.stub(navigateScreen, 'create');

    var story = makeStory.fromJson({
      locations: {
        foo: dummyCircle
      },
      screens: {
        start: {
          type: 'navigate',
          location: 'foo'
        }
      }
    });
    story(div);

    sinon.assert.calledOnce(navigateScreen.create);
    sinon.assert.calledWith(navigateScreen.create, div,
        sinon.match.instanceOf(model.Circle), {});
  }));

  it('throws if navigate screen has no location', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'navigate'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has no location/);
  });

  it('throws if navigate screen is unknown', function () {
    var story = makeStory.fromJson({
      locations: {},
      screens: {
        start: {
          type: 'navigate',
          location: 'unknown'
        }
      }
    });

    assert.throws(function () {
      story(div);
    }, /Error: Screen "start" has unknown location "unknown"/);
  });

});
