'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = toMongoDottedObject;

var _mongoose = require('mongoose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose.Types.ObjectId;

/**
 * Convert object to dotted-key/value pair
 * { a: { b: { c: 1 }}} ->  { 'a.b.c': 1 }
 * { a: { $in: [ 1, 2, 3] }} ->  { 'a': { $in: [ 1, 2, 3] } }
 * { a: { b: { $in: [ 1, 2, 3] }}} ->  { 'a.b': { $in: [ 1, 2, 3] } }
 * Usage:
 *   var dotObject(obj)
 *   or
 *   var target = {}; dotObject(obj, target)
 *
 * @param {Object} obj source object
 * @param {Object} target target object
 * @param {Array} path path array (internal)
 */


function toMongoDottedObject(obj) {
  var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  var objKeys = Object.keys(obj);

  /* eslint-disable */
  objKeys.forEach(function (key) {
    if (key.startsWith('$')) {
      target[path.join('.')] = (0, _extends3.default)({}, target[path.join('.')], {
        [key]: obj[key]
      });
    } else if (Object(obj[key]) === obj[key] && !(obj[key] instanceof ObjectId)) {
      toMongoDottedObject(obj[key], target, path.concat(key));
    } else {
      target[path.concat(key).join('.')] = obj[key];
    }
  });

  if (objKeys.length === 0) {
    target[path.join('.')] = obj;
  }

  return target;
  /* eslint-enable */
}