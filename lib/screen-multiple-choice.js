/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var marked = require('marked');
var animate = require('./animate');
var screen = require('./screen');

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
  var screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    },
    '.choice': items
  });
  var textElement = screenElement.querySelector('.text');
  var formElement = screenElement.querySelector('form');
  var footerElement = screenElement.querySelector('.footer');
  footerElement.style.display = 'none';
  var elements = [textElement, formElement];

  function onnext() {
    var checkedInput = formElement.querySelector('input[name=choice]:checked');
    if (checkedInput) {
      elements.push(footerElement);
      screen.hide(elements, function () {
        next(choices[checkedInput.value]);
      });
    }
  }

  var footerVisible = false;
  Array.prototype.slice.call(formElement.querySelectorAll('input'))
    .forEach(function (input) {
      input.onchange = function () {
        if (!footerVisible) {
          footerVisible = true;
          footerElement.style.display = 'block';
          animate(footerElement, 'bounceInUp');
          footerElement.querySelector('.next').onclick = onnext;
        }
      };
    });

  parent.appendChild(screenElement);
  screen.show(elements);
};
