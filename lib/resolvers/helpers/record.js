'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recordHelperArgs = undefined;

var _graphqlCompose = require('graphql-compose');

var _graphql = require('graphql-compose/lib/graphql');

var _typeStorage = require('../../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var recordHelperArgs = exports.recordHelperArgs = function recordHelperArgs(typeComposer, opts) {
  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('First arg for recordHelperArgs() should be instance of TypeComposer.');
  }

  if (!opts || !opts.recordTypeName) {
    throw new Error('You should provide non-empty `recordTypeName` in options.');
  }

  var recordTypeName = opts.recordTypeName;

  var recordComposer = new _graphqlCompose.InputTypeComposer(_typeStorage2.default.getOrSet(recordTypeName, typeComposer.getInputTypeComposer().clone(recordTypeName).getType()));
  if (opts && opts.removeFields) {
    recordComposer.removeField(opts.removeFields);
  }

  if (opts && opts.requiredFields) {
    recordComposer.makeRequired(opts.requiredFields);
  }

  return {
    record: {
      name: 'record',
      type: opts.isRequired ? new _graphql.GraphQLNonNull(recordComposer.getType()) : recordComposer.getType()
    }
  };
};