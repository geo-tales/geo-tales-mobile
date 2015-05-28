/*global describe, it, beforeEach, afterEach, document, localStorage*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var story = require('../lib/story');
var restoreScreen = require('../lib/screen-restore');
var contentManager = require('../lib/content-manager');


describe('content-manager', function () {
  var server;
  var div;
  var content;

  beforeEach(function () {
    sinon.stub(story, 'fromJson');
    sinon.stub(restoreScreen, 'create');
    server = sinon.fakeServer.create();
    div = document.createElement();
    content = contentManager.create(div);
  });

  afterEach(function () {
    story.fromJson.restore();
    restoreScreen.create.restore();
    server.restore();
    localStorage.clear();
  });

  function loadAjax(json) {
    server.respondWith('GET', 'some/story.json', [200, {
      'ContentType': 'application/json'
    }, json]);

    content.load('some/story.json');
    server.respond();
  }

  it('creates story for JSON from AJAX response', function () {
    var json = {
      locations: {},
      screens: {}
    };

    loadAjax(JSON.stringify(json));

    sinon.assert.calledOnce(story.fromJson);
    sinon.assert.calledWith(story.fromJson, json);
  });

  it('creates text screen with error message if not valid JSON', function () {
    loadAjax('<html>');

    assert.equal(div.querySelector('h2').innerHTML, 'Failed to load story!');
    var p = div.querySelectorAll('p');
    assert.equal(p[0].innerHTML, 'some/story.json');
    assert.equal(p[1].innerHTML,
        '<code>SyntaxError: Unable to parse JSON string</code>');
  });

  it('creates text screen with error message if story throws', function () {
    story.fromJson.throws(new Error('valar morghulis'));

    loadAjax(JSON.stringify({}));

    assert.equal(div.querySelector('h2').innerHTML, 'Failed to load story!');
    assert.equal(div.querySelector('p').innerHTML,
        '<code>Error: valar morghulis</code>');
  });

  it('creates text screen with error message if request fails', function () {
    server.respondWith('GET', 'some/story.json', [404, {}, '']);

    content.load('some/story.json');
    server.respond();

    assert.equal(div.querySelector('h2').innerHTML, '404');
    assert.equal(div.querySelector('p').innerHTML, 'some/story.json');
    sinon.assert.notCalled(story.fromJson);
  });

  it('asks what to do if story state is found in local storage', function () {
    localStorage.setItem('story', 'some/story.json');

    content.load('other/story.json');

    sinon.assert.calledOnce(restoreScreen.create);
    sinon.assert.calledWith(restoreScreen.create, div, sinon.match.func,
        sinon.match.func);
    sinon.assert.notCalled(story.fromJson);
    assert.equal(server.requests.length, 0);
  });

  it('loads previous story and restores saved story state');

  it('discard existing story state and loads new story');

});
