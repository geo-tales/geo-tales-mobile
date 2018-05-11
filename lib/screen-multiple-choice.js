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

const html = fs.readFileSync(`${__dirname}/screen-multiple-choice.html`,
  'utf8');

exports.create = function (parent, markdown, choices, next) {
  const items = choices.map((item, index) => {
    return {
      '.label': {
        _html: marked(item.text).trim().replace(/^<p>|<\/p>$/g, '')
      },
      input: {
        value: String(index)
      }
    };
  });
  const screenElement = hyperglue(html, {
    '.text': {
      _html: marked(markdown)
    },
    '.choice': items
  });
  const textElement = screenElement.querySelector('.text');
  const formElement = screenElement.querySelector('form');
  const footerElement = screenElement.querySelector('.footer');
  footerElement.style.display = 'none';
  const elements = [textElement, formElement];

  function onnext() {
    const checkedInput = formElement.querySelector(
      'input[name=choice]:checked');
    if (checkedInput) {
      elements.push(footerElement);
      screen.hide(elements, () => {
        next(choices[checkedInput.value]);
      });
    }
  }

  let footerVisible = false;
  Array.prototype.slice.call(formElement.querySelectorAll('input'))
    .forEach((input) => {
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
