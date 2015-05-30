/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global document, location*/
'use strict';

var querystring = require('querystring');
var contentManager = require('./content-manager');
var defaultScreen = require('./screen-default');


document.addEventListener('DOMContentLoaded', function () {
  var contentElement = document.body.querySelector('#content');
  var parameters = querystring.parse(location.search.substring(1));
  if (parameters.story) {
    var content = contentManager.create(contentElement);
    content.load(parameters.story);
  } else {
    defaultScreen.create(contentElement);
  }
});
