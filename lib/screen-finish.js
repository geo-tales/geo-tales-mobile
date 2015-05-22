/*global location*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = fs.readFileSync(__dirname + '/screen-finish.html', 'utf8');

function two(n) {
  return n < 10 ? '0' + n : n;
}
function formatTime(ms) {
  var t = [];
  var h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  var m = Math.floor(ms / 60000);
  ms -= m * 60000;
  var s = Math.floor(ms / 1000);
  t.push(h, two(m), two(s));
  return t.join(':');
}

exports.create = function (parent, markdown, results) {
  var items = [];
  if (results.time) {
    items.push({
      '.name': 'Time:',
      '.value': formatTime(results.time)
    });
  }
  if (typeof results.points === 'number') {
    items.push({
      '.name': 'Points:',
      '.value': String(results.points)
    });
  }
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown
        || '## Congratulations!\n\nYou reached the end of this story.')
    },
    '.result': items
  });
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'zoomIn', {
    delay: '.5s',
    duration: '2s'
  }, function () {
    screen.querySelector('.close').onclick = function () {
      animate(screen, 'zoomOut', {
        duration: '2s'
      }, function () {
        location.reload();
      });
    };
    var headings = screen.querySelectorAll('h2');
    if (headings.length) {
      headings[0].classList.add('animated', 'infinite', 'pulse');
    }
  });
};
