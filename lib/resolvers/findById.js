'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findById;

var _graphqlCompose = require('graphql-compose');

var _graphql = require('graphql-compose/lib/graphql');

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findById(model, typeComposer, opts // eslint-disable-line no-unused-vars
) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findById() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findById() should be instance of TypeComposer.');
  }

  return new _graphqlCompose.Resolver({
    type: typeComposer.getType(),
    name: 'findById',
    kind: 'query',
    args: {
      _id: {
        name: '_id',
        type: new _graphql.GraphQLNonNull(_mongoid2.default)
      }
    },
    resolve: function resolve(resolveParams) {
      var args = resolveParams.args || {};

      if (args._id) {
        resolveParams.query = model.findById(args._id); // eslint-disable-line
        (0, _helpers.projectionHelper)(resolveParams);
        return resolveParams.query.exec();
      }
      return Promise.resolve(null);
    }
  });
}