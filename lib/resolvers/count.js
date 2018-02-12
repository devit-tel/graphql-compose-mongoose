'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = count;

var _graphqlCompose = require('graphql-compose');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-param-reassign */

function count(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver count() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver count() should be instance of TypeComposer.');
  }

  return new _graphqlCompose.Resolver({
    type: 'Int',
    name: 'count',
    kind: 'query',
    args: (0, _extends3.default)({}, (0, _helpers.filterHelperArgs)(typeComposer, model, (0, _extends3.default)({
      filterTypeName: `Filter${typeComposer.getTypeName()}Input`,
      model
    }, opts && opts.filter))),
    resolve: function resolve(resolveParams) {
      resolveParams.query = model.find();
      (0, _helpers.filterHelper)(resolveParams);
      return resolveParams.query.count().exec();
    }
  });
}