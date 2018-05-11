/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document, location*/
'use strict';

const querystring = require('querystring');
const contentManager = require('./content-manager');
const defaultScreen = require('./screen-default');

document.addEventListener('DOMContentLoaded', () => {
  const contentElement = document.body.querySelector('#content');
  const parameters = querystring.parse(location.search.substring(1));
  if (parameters.story) {
    const content = contentManager.create(contentElement);
    content.load(parameters.story);
  } else {
    defaultScreen.create(contentElement);
  }
});
