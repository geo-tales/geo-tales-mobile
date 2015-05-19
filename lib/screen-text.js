'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');

var html = fs.readFileSync(__dirname + '/screen-text.html', 'utf8');


exports.create = function (parent, markdown, next) {
  var doc = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  setTimeout(function () {
    parent.appendChild(doc);
    parent.querySelector('.next').onclick = next;
  }, 500);
};
