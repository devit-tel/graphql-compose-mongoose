'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = removeOne;

var _graphqlCompose = require('graphql-compose');

var _mongoid = require('../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

var _helpers = require('./helpers');

var _findOne = require('./findOne');

var _findOne2 = _interopRequireDefault(_findOne);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeOne(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeOne() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeOne() should be instance of TypeComposer.');
  }

  var findOneResolver = (0, _findOne2.default)(model, typeComposer, opts);

  var outputTypeName = `RemoveOne${typeComposer.getTypeName()}Payload`;
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
    name: 'removeOne',
    kind: 'mutation',
    description: 'Remove one document: ' + '1) Remove with hooks via findOneAndRemove. ' + '2) Return removed document.',
    type: outputType,
    args: (0, _extends3.default)({}, (0, _helpers.filterHelperArgs)(typeComposer, model, (0, _extends3.default)({
      filterTypeName: `FilterRemoveOne${typeComposer.getTypeName()}Input`,
      model
    }, opts && opts.filter)), (0, _helpers.sortHelperArgs)(model, (0, _extends3.default)({
      sortTypeName: `SortRemoveOne${typeComposer.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: function resolve(resolveParams) {
      var filterData = resolveParams.args && resolveParams.args.filter || {};

      if (!(typeof filterData === 'object') || Object.keys(filterData).length === 0) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.removeOne resolver requires ` + 'at least one value in args.filter'));
      }

      // We should get all data for document, cause Mongoose model may have hooks/middlewares
      // which required some fields which not in graphql projection
      // So empty projection returns all fields.
      resolveParams.projection = {};

      return findOneResolver.resolve(resolveParams).then(function (doc) {
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

        return null;
      });
    }
  });

  return resolver;
}
/* eslint-disable no-param-reassign */