/*global document, location*/
'use strict';

var querystring = require('querystring');
var contentManager = require('./content-manager');


document.addEventListener('DOMContentLoaded', function () {
  var contentElement = document.body.querySelector('#content');
  var content = contentManager.create(contentElement);
  var parameters = querystring.parse(location.search.substring(1));
  content.load(parameters.story || 'default.json');
});
