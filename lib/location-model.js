'use strict';

var geolib = require('geolib');
var inherits = require('inherits');


function Shape(center) {
  this.center = center;
}

Shape.prototype.distance = function (pos) {
  return geolib.getDistance(this.center, pos);
};

exports.Shape = Shape;



function Circle(center, radius) {
  Shape.call(this, center);
  this.radius = radius;
}

inherits(Circle, Shape);

Circle.prototype.within = function (pos) {
  return this.distance(pos) <= this.radius;
};

exports.Circle = Circle;



function Polygon(coords) {
  Shape.call(this, geolib.getCenter(coords));
  this.coords = coords;
}

inherits(Polygon, Shape);

Polygon.prototype.within = function (pos) {
  return geolib.isPointInside(pos, this.coords);
};

exports.Polygon = Polygon;



exports.fromJson = function (json) {
  if (json.type === 'circle') {
    return new Circle(json.center, json.radius);
  }
  if (json.type === 'polygon') {
    return new Polygon(json.coords);
  }
  throw new Error('Unkown type: ' + json.type);
};
