/*
 * geo-tales-mobile
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

const fs = require('fs');
const hyperglue = require('hyperglue');
const marked = require('marked');
const animate = require('animatify');
const screen = require('./screen');

const html = fs.readFileSync(`${__dirname  }/screen-input.html`, 'utf8');

exports.create = function (parent, markdown, opts, next) {
  const screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    }
  });
  const textElement = screenElement.querySelector('.text');
  const formElement = screenElement.querySelector('form');
  const footerElement = screenElement.querySelector('.footer');
  const inputElement = formElement.querySelector('input[name=answer]');
  inputElement.type = typeof opts.answer === 'number' ? 'number' : 'text';
  footerElement.style.display = 'none';
  const elements = [textElement, formElement];
  const answer = String(opts.answer).toLowerCase();

  function onnext() {
    elements.push(footerElement);
    screen.hide(elements, next);
  }

  let footerVisible = false;
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
