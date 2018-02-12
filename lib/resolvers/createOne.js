'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = createOne;

var _graphqlCompose = require('graphql-compose');

var _helpers = require('./helpers');

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-param-reassign, new-cap */

function createOne(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver createOne() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver createOne() should be instance of TypeComposer.');
  }

  var outputTypeName = `CreateOne${typeComposer.getTypeName()}Payload`;
  var outputType = _typeStorage2.default.getOrSet(outputTypeName, _graphqlCompose.TypeComposer.create({
    name: outputTypeName,
    fields: {
      recordId: {
        type: _mongoid2.default,
        description: 'Created document ID'
      },
      record: {
        type: typeComposer.getType(),
        description: 'Created document'
      }
    }
  }));

  var resolver = new _graphqlCompose.Resolver({
    name: 'createOne',
    kind: 'mutation',
    description: 'Create one document with mongoose defaults, setters, hooks and validation',
    type: outputType,
    args: (0, _extends3.default)({}, (0, _helpers.recordHelperArgs)(typeComposer, (0, _extends3.default)({
      recordTypeName: `CreateOne${typeComposer.getTypeName()}Input`,
      removeFields: ['id', '_id'],
      isRequired: true
    }, opts && opts.record))),
    resolve: function resolve(resolveParams) {
      var recordData = resolveParams.args && resolveParams.args.record || {};

      if (!(typeof recordData === 'object') || Object.keys(recordData).length === 0) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.createOne resolver requires ` + 'at least one value in args.record'));
      }

      return Promise.resolve(new model(recordData)).then(function (doc) {
        if (resolveParams.beforeRecordMutate) {
          return resolveParams.beforeRecordMutate(doc, resolveParams);
        }
        return doc;
      }).then(function (doc) {
        return doc.save();
      }).then(function (record) {
        if (record) {
          return {
            record,
            recordId: typeComposer.getRecordIdFn()(record)
          };
        }

        return null;
      });
    }
  });

  return resolver;
}