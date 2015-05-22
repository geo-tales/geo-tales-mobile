'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');

var html = fs.readFileSync(__dirname + '/screen-multiple-choice.html', 'utf8');


exports.create = function (parent, markdown, choices, next) {
  var items = choices.map(function (item, index) {
    return {
      '.label': {
        _html: marked(item.text).trim().replace(/^<p>|<\/p>$/g, '')
      },
      'input': {
        'value': String(index)
      }
    };
  });
  var screen = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    },
    '.choice': items
  });
  var footer = screen.querySelector('.footer');
  footer.style.display = 'none';
  parent.appendChild(screen);
  var text = screen.querySelector('.text');
  animate(text, 'bounceInUp', {
    delay: '.5s'
  });
  var footerVisible = false;
  var form = screen.querySelector('form');
  Array.prototype.slice.call(form.querySelectorAll('input'))
    .forEach(function (input) {
      input.onchange = function () {
        if (!footerVisible) {
          footerVisible = true;
          footer.style.display = 'block';
          animate(footer, 'bounceInUp', {
            delay: '.1s'
          });
        }
      };
    });
  animate(form, 'bounceInUp', {
    delay: '.58s'
  }, function () {
    screen.querySelector('.next').onclick = function () {
      var checkedInput = form.querySelector('input[name=choice]:checked');
      if (!checkedInput) {
        return;
      }
      var choice = choices[checkedInput.value];
      animate(screen, 'slideOutLeft', function () {
        next(choice);
      });
    };
  });
};
