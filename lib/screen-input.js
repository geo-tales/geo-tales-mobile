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

var html = fs.readFileSync(__dirname + '/screen-input.html', 'utf8');


exports.create = function (parent, markdown, opts, next) {
  var screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  var textElement = screenElement.querySelector('.text');
  var formElement = screenElement.querySelector('form');
  var footerElement = screenElement.querySelector('.footer');
  var inputElement = formElement.querySelector('input[name=answer]');
  inputElement.type = typeof opts.answer === 'number' ? 'number' : 'text';
  footerElement.style.display = 'none';
  var elements = [textElement, formElement];
  var answer = String(opts.answer).toLowerCase();

  function onnext() {
    elements.push(footerElement);
    screen.hide(elements, next);
  }

  var footerVisible = false;
  inputElement.onchange = function () {
    if (footerVisible) {
      return;
    }
    if (inputElement.value.trim().toLowerCase() === answer) {
      inputElement.blur();
      inputElement.classList.remove('incorrect');
      inputElement.classList.add('correct');
      footerVisible = true;
      footerElement.style.display = 'block';
      animate(inputElement, 'tada', {
        delay: '.5s'
      });
      animate(footerElement, 'bounceInUp', {
        delay: '1s'
      });
      footerElement.querySelector('.next').onclick = onnext;
    } else {
      inputElement.classList.add('incorrect');
      animate(inputElement, 'shake', {
        duration: '.7s'
      });
    }
  };
  inputElement.onkeydown = function () {
    inputElement.classList.remove('incorrect');
  };

  parent.appendChild(screenElement);
  screen.show(elements);
};
