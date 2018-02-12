'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = findMany;

var _graphqlCompose = require('graphql-compose');

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-param-reassign */

function findMany(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findMany() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findMany() should be instance of TypeComposer.');
  }

  return new _graphqlCompose.Resolver({
    type: [typeComposer],
    name: 'findMany',
    kind: 'query',
    args: (0, _extends3.default)({}, (0, _helpers.filterHelperArgs)(typeComposer, model, (0, _extends3.default)({
      filterTypeName: `FilterFindMany${typeComposer.getTypeName()}Input`,
      model
    }, opts && opts.filter)), (0, _helpers.skipHelperArgs)(), (0, _helpers.limitHelperArgs)((0, _extends3.default)({}, opts && opts.limit)), (0, _helpers.sortHelperArgs)(model, (0, _extends3.default)({
      sortTypeName: `SortFindMany${typeComposer.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: function resolve(resolveParams) {
      resolveParams.query = model.find();
      (0, _helpers.filterHelper)(resolveParams);
      (0, _helpers.skipHelper)(resolveParams);
      (0, _helpers.limitHelper)(resolveParams);
      (0, _helpers.sortHelper)(resolveParams);
      (0, _helpers.projectionHelper)(resolveParams);
      return resolveParams.query.exec();
    }
  });
}