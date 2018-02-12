'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeById;

var _graphqlCompose = require('graphql-compose');

var _graphql = require('graphql-compose/lib/graphql');

var _findById = require('./findById');

var _findById2 = _interopRequireDefault(_findById);

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeById(model, typeComposer, opts // eslint-disable-line no-unused-vars
) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeById() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeById() should be instance of TypeComposer.');
  }

  var findByIdResolver = (0, _findById2.default)(model, typeComposer);

  var outputTypeName = `RemoveById${typeComposer.getTypeName()}Payload`;
  var outputType = _typeStorage2.default.getOrSet(outputTypeName, _graphqlCompose.TypeComposer.create({
    name: outputTypeName,
    fields: {
      recordId: {
        type: _mongoid2.default,
        description: 'Removed document ID'
      },
      record: {
        type: typeComposer.getType(),
        description: 'Removed document'
      }
    }
  }));

  var resolver = new _graphqlCompose.Resolver({
    name: 'removeById',
    kind: 'mutation',
    description: 'Remove one document: ' + '1) Retrieve one document and remove with hooks via findByIdAndRemove. ' + '2) Return removed document.',
    type: outputType,
    args: {
      _id: {
        name: '_id',
        type: new _graphql.GraphQLNonNull(_mongoid2.default)
      }
    },
    resolve: function resolve(resolveParams) {
      var args = resolveParams.args || {};

      if (!args._id) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.removeById resolver requires args._id value`));
      }

      // We should get all data for document, cause Mongoose model may have hooks/middlewares
      // which required some fields which not in graphql projection
      // So empty projection returns all fields.
      resolveParams.projection = {};

      return findByIdResolver.resolve(resolveParams).then(function (doc) {
        if (resolveParams.beforeRecordMutate) {
          return resolveParams.beforeRecordMutate(doc, resolveParams);
        }
        return doc;
      })
      // remove record from DB
      .then(function (doc) {
        if (!doc) {
          return Promise.reject(new Error('Document not found'));
        }
        return doc.remove();
      })
      // prepare output payload
      .then(function (record) {
        if (record) {
          return {
            record,
            recordId: typeComposer.getRecordIdFn()(record)
          };
        }

        return {
          recordId: args._id
        };
      });
    }
  });

  return resolver;
}
/* eslint-disable no-param-reassign */