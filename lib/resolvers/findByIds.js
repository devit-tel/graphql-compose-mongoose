'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = findByIds;

var _graphqlCompose = require('graphql-compose');

var _graphql = require('graphql-compose/lib/graphql');

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findByIds(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findByIds() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findByIds() should be instance of TypeComposer.');
  }

  return new _graphqlCompose.Resolver({
    type: [typeComposer],
    name: 'findByIds',
    kind: 'query',
    args: (0, _extends3.default)({
      _ids: {
        name: '_ids',
        type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(_mongoid2.default))
      }
    }, (0, _helpers.limitHelperArgs)((0, _extends3.default)({}, opts && opts.limit)), (0, _helpers.sortHelperArgs)(model, (0, _extends3.default)({
      sortTypeName: `SortFindByIds${typeComposer.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: function resolve(resolveParams) {
      var args = resolveParams.args || {};

      if (!Array.isArray(args._ids) || args._ids.length === 0) {
        return Promise.resolve([]);
      }

      var selector = {
        _id: { $in: args._ids }
      };

      resolveParams.query = model.find(selector); // eslint-disable-line
      (0, _helpers.projectionHelper)(resolveParams);
      (0, _helpers.limitHelper)(resolveParams);
      (0, _helpers.sortHelper)(resolveParams);
      return resolveParams.query.exec();
    }
  });
}