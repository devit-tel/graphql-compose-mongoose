'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = exports.toMongoDottedObject = undefined;
exports.upperFirst = upperFirst;

var _graphqlCompose = require('graphql-compose');

var _toMongoDottedObject = require('./toMongoDottedObject');

var _toMongoDottedObject2 = _interopRequireDefault(_toMongoDottedObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.toMongoDottedObject = _toMongoDottedObject2.default;
exports.isObject = _graphqlCompose.isObject;
function upperFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}