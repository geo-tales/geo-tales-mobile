'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = fs.readFileSync(__dirname + '/screen-text.html', 'utf8');


exports.create = function (parent, markdown, next) {
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'bounceInUp', {
    delay: '.5s'
  }, function () {
    screen.querySelector('.next').onclick = function () {
      animate(screen, 'slideOutLeft', next);
    };
  });
};
