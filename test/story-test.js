/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var locationModel = require('../lib/location-model');
var locationTracker = require('../lib/location-tracker');
var textScreen = require('../lib/screen-text');
var choicesScreen = require('../lib/screen-multiple-choice');
var navigateScreen = require('../lib/screen-navigate');
var finishScreen = require('../lib/screen-finish');
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
    this.spy(locationModel, 'fromJson');

    makeStory.fromJson({
      locations: {
        foo: dummyCircle,
        bar: dummyPolygon
      },
      screens: {
        start: {
          type: 'finish'
        }
      }
    });

    sinon.assert.calledTwice(locationModel.fromJson);
    sinon.assert.calledWith(locationModel.fromJson, dummyCircle);
    sinon.assert.calledWith(locationModel.fromJson, dummyPolygon);
  }));

  it('throws if start screen does not exist', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {}
      });
    }, /Error: Missing "start" screen/);
  });

  it('creates start text screen', sinon.test(function () {
    this.stub(textScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
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
  }));

  it('throws if start screen has no type', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            text: '## Oh, hi!'
          }
        }
      });
    }, /Error: Screen "start" has no type/);
  });

  it('throws if text screen has no text', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'text'
          }
        }
      });
    }, /Error: Screen "start" has no text/);
  });

  it('throws if text screen has no next', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'text',
            text: '## Hi'
          }
        }
      });
    }, /Error: Screen "start" has no next/);
  });

  it('throws if text screen next does not exist', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

  it('creates start multiple choice screen', sinon.test(function () {
    this.stub(choicesScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
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
  }));

  it('throws if choices screen has no text', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'choices'
          }
        }
      });
    }, /Error: Screen "start" has no text/);
  });

  it('throws if choices screen has no choices', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'choices',
            text: '## Oh, hi!'
          }
        }
      });
    }, /Error: Screen "start" has no choices/);
  });

  it('throws if choice has no text', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

  it('throws if choice has no next', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

  it('throws if choices next does not exists', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

  it('throws if choice next does not exists', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

  it('throws if screen type is unknown', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'unknown'
          }
        }
      });
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
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye" class="animated">Goodbye</h2>\n');
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
          text: '## Goodbye',
          next: 'bla'
        },
        bla: {
          type: 'finish'
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
          type: 'finish',
          text: '## Goodbye'
        }
      }
    });
    story(div);

    div.querySelector('input[name=choice]').click();
    div.querySelector('.next').click();

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye" class="animated">Goodbye</h2>\n');
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
  }));

  it('throws if navigate screen has no location', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'navigate'
          }
        }
      });
    }, /Error: Screen "start" has no location/);
  });

  it('throws if navigate screen is unknown', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
        screens: {
          start: {
            type: 'navigate',
            location: 'unknown'
          }
        }
      });
    }, /Error: Screen "start" has unknown location "unknown"/);
  });

  it('throws if navigate screen has no next', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {
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

  it('throws if navigate screen next does not exist', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {
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

  it('shows next screen when location is reached', sinon.test(function () {
    this.spy(locationTracker, 'create');
    var story = makeStory.fromJson({
      locations: {
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

    locationTracker.create.firstCall.returnValue.emit('position',
        dummyCircle.center);

    assert.equal(div.querySelector('.text').innerHTML,
      '<h2 id="goodbye" class="animated">Goodbye</h2>\n');
  }));

  it('passes points to finish screen', sinon.test(function () {
    this.stub(finishScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
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
    div.querySelector('input[name=choice]').click();
    div.querySelector('.next').click();
    div.querySelector('input[name=choice]').click();
    div.querySelector('.next').click();

    sinon.assert.calledOnce(finishScreen.create);
    sinon.assert.calledWith(finishScreen.create, div, undefined, {
      time: sinon.match.number,
      points: 7
    });
  }));

  it('creates finish screen', sinon.test(function () {
    this.stub(finishScreen, 'create');

    var story = makeStory.fromJson({
      locations: {},
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
  }));

  it('throws if no finish screen exists', function () {
    assert.throws(function () {
      makeStory.fromJson({
        locations: {},
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

});
