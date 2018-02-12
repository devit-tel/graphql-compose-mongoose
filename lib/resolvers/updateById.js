'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = updateById;

var _graphqlCompose = require('graphql-compose');

var _record = require('./helpers/record');

var _findById = require('./findById');

var _findById2 = _interopRequireDefault(_findById);

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateById(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver updateById() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver updateById() should be instance of TypeComposer.');
  }

  var findByIdResolver = (0, _findById2.default)(model, typeComposer);

  var outputTypeName = `UpdateById${typeComposer.getTypeName()}Payload`;
  var outputType = _typeStorage2.default.getOrSet(outputTypeName, _graphqlCompose.TypeComposer.create({
    name: outputTypeName,
    fields: {
      recordId: {
        type: _mongoid2.default,
        description: 'Updated document ID'
      },
      record: {
        type: typeComposer.getType(),
        description: 'Updated document'
      }
    }
  }));

  var resolver = new _graphqlCompose.Resolver({
    name: 'updateById',
    kind: 'mutation',
    description: 'Update one document: ' + '1) Retrieve one document by findById. ' + '2) Apply updates to mongoose document. ' + '3) Mongoose applies defaults, setters, hooks and validation. ' + '4) And save it.',
    type: outputType,
    args: (0, _extends3.default)({}, (0, _record.recordHelperArgs)(typeComposer, (0, _extends3.default)({
      recordTypeName: `UpdateById${typeComposer.getTypeName()}Input`,
      requiredFields: ['_id'],
      isRequired: true
    }, opts && opts.record))),
    resolve: function resolve(resolveParams) {
      var recordData = resolveParams.args && resolveParams.args.record || {};

      if (!(typeof recordData === 'object')) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.updateById resolver requires args.record value`));
      }

      if (!recordData._id) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.updateById resolver requires args.record._id value`));
      }

      resolveParams.args._id = recordData._id;
      delete recordData._id;

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
      // save changes to DB
      .then(function (doc) {
        if (!doc) {
          return Promise.reject(new Error('Document not found'));
        }
        if (recordData) {
          doc.set(recordData);
          return doc.save();
        }
        return doc;
      })
      // prepare output payload
      .then(function (record) {
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
/* eslint-disable no-param-reassign */