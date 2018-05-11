/*eslint-env mocha*/
/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const story = require('../lib/story');
const restoreScreen = require('../lib/screen-restore');
const contentManager = require('../lib/content-manager');


describe('content-manager', () => {
  let server;
  let div;
  let content;

  beforeEach(() => {
    sinon.stub(story, 'fromJson');
    sinon.stub(restoreScreen, 'create');
    server = sinon.fakeServer.create();
    div = document.createElement('div');
    content = contentManager.create(div);
  });

  afterEach(() => {
    story.fromJson.restore();
    restoreScreen.create.restore();
    server.restore();
    localStorage.clear();
  });

  function loadAjax(json) {
    server.respondWith('GET', 'some/story.json', [200, {
      ContentType: 'application/json'
    }, json]);

    content.load('some/story.json');
    server.respond();
  }

  it('creates story for JSON from AJAX response', () => {
    const json = {
      locations: {},
      screens: {}
    };

    loadAjax(JSON.stringify(json));

    sinon.assert.calledOnce(story.fromJson);
    sinon.assert.calledWith(story.fromJson, json);
  });

  it('creates text screen with error message if not valid JSON', () => {
    loadAjax('<html>');

    assert.equal(div.querySelector('h2').innerHTML, 'Failed to load story!');
    const p = div.querySelectorAll('p');
    assert.equal(p[0].innerHTML, 'some/story.json');
    assert.equal(p[1].innerHTML, '<code>SyntaxError: Unexpected token &lt; '
      + 'in JSON at position 0</code>');
  });

  it('creates text screen with error message if story throws', () => {
    story.fromJson.throws(new Error('valar morghulis'));

    loadAjax(JSON.stringify({}));

    assert.equal(div.querySelector('h2').innerHTML, 'Failed to load story!');
    const p = div.querySelectorAll('p');
    assert.equal(p[0].innerHTML, 'some/story.json');
    assert.equal(p[1].innerHTML, '<code>Error: valar morghulis</code>');
  });

  it('creates text screen with error message if request fails', () => {
    server.respondWith('GET', 'some/story.json', [404, {}, '']);

    content.load('some/story.json');
    server.respond();

    assert.equal(div.querySelector('h2').innerHTML, '404');
    assert.equal(div.querySelector('p').innerHTML, 'some/story.json');
    sinon.assert.notCalled(story.fromJson);
  });

  it('asks what to do if story state is found in local storage', () => {
    localStorage.setItem('story', 'some/story.json');
    localStorage.setItem('screen', '0');

    content.load('other/story.json');

    sinon.assert.calledOnce(restoreScreen.create);
    sinon.assert.calledWith(restoreScreen.create, div, sinon.match.func,
      sinon.match.func);
    sinon.assert.notCalled(story.fromJson);
    assert.equal(server.requests.length, 0);
  });

  it('loads previous story and restores saved story state', () => {
    localStorage.setItem('story', 'some/story.json');
    localStorage.setItem('screen', '0');
    content.load('other/story.json');

    restoreScreen.create.firstCall.args[1]();

    assert.equal(server.requests.length, 1);
    assert.equal(server.requests[0].url, 'some/story.json');
    assert.equal(localStorage.getItem('story'), 'some/story.json');
  });

  it('does not restore previous state if no screen was saved', () => {
    localStorage.setItem('story', 'some/story.json');
    content.load('other/story.json');

    sinon.assert.notCalled(restoreScreen.create);
    sinon.assert.notCalled(story.fromJson);
    assert.equal(server.requests.length, 1);
    assert.equal(server.requests[0].url, 'other/story.json');
    assert.strictEqual(localStorage.getItem('story'), null);
  });

  it('discard existing story state and loads new story', () => {
    localStorage.setItem('story', 'some/story.json');
    localStorage.setItem('screen', 'foo');
    localStorage.setItem('any-key-really', 'bar');
    content.load('other/story.json');

    restoreScreen.create.firstCall.args[2]();

    assert.equal(server.requests.length, 1);
    assert.equal(server.requests[0].url, 'other/story.json');
    assert.strictEqual(localStorage.getItem('story'), null);
    assert.strictEqual(localStorage.getItem('screen'), null);
    assert.strictEqual(localStorage.getItem('any-key-really'), null);
  });

  it('stores story url in local storage', () => {
    server.respondWith('GET', 'that/story.json', [200, {}, '{}']);
    story.fromJson.returns(() => { return; });

    content.load('that/story.json');
    server.respond();

    assert.equal(localStorage.getItem('story'), 'that/story.json');
  });

  it('does not store default story url in local storage', () => {
    server.respondWith('GET', 'tour.json', [200, {}, '{}']);
    story.fromJson.returns(() => { return; });

    content.load('tour.json');
    server.respond();

    assert.strictEqual(localStorage.getItem('story'), null);
  });

});
