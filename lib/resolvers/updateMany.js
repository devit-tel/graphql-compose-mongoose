'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = updateMany;

var _graphqlCompose = require('graphql-compose');

var _helpers = require('./helpers');

var _toMongoDottedObject = require('../utils/toMongoDottedObject');

var _toMongoDottedObject2 = _interopRequireDefault(_toMongoDottedObject);

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-param-reassign */

function updateMany(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver updateMany() should be instance of Mongoose Model.');
  }
  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver updateMany() should be instance of TypeComposer.');
  }

  var outputTypeName = `UpdateMany${typeComposer.getTypeName()}Payload`;
  var outputType = _typeStorage2.default.getOrSet(outputTypeName, _graphqlCompose.TypeComposer.create({
    name: outputTypeName,
    fields: {
      numAffected: {
        type: 'Int',
        description: 'Affected documents number'
      }
    }
  }));

  var resolver = new _graphqlCompose.Resolver({
    name: 'updateMany',
    kind: 'mutation',
    description: 'Update many documents without returning them: ' + 'Use Query.update mongoose method. ' + 'Do not apply mongoose defaults, setters, hooks and validation. ',
    type: outputType,
    args: (0, _extends3.default)({}, (0, _helpers.recordHelperArgs)(typeComposer, (0, _extends3.default)({
      recordTypeName: `UpdateMany${typeComposer.getTypeName()}Input`,
      removeFields: ['id', '_id'],
      isRequired: true
    }, opts && opts.record)), (0, _helpers.filterHelperArgs)(typeComposer, model, (0, _extends3.default)({
      filterTypeName: `FilterUpdateMany${typeComposer.getTypeName()}Input`,
      model
    }, opts && opts.filter)), (0, _helpers.sortHelperArgs)(model, (0, _extends3.default)({
      sortTypeName: `SortUpdateMany${typeComposer.getTypeName()}Input`
    }, opts && opts.sort)), (0, _helpers.skipHelperArgs)(), (0, _helpers.limitHelperArgs)((0, _extends3.default)({}, opts && opts.limit))),
    resolve: function resolve(resolveParams) {
      var recordData = resolveParams.args && resolveParams.args.record || {};

      if (!(typeof recordData === 'object') || Object.keys(recordData).length === 0) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.updateMany resolver requires ` + 'at least one value in args.record'));
      }

      resolveParams.query = model.find();
      (0, _helpers.filterHelper)(resolveParams);
      (0, _helpers.skipHelper)(resolveParams);
      (0, _helpers.sortHelper)(resolveParams);
      (0, _helpers.limitHelper)(resolveParams);

      resolveParams.query = resolveParams.query.setOptions({ multi: true }); // eslint-disable-line
      resolveParams.query.update({ $set: (0, _toMongoDottedObject2.default)(recordData) });

      // `beforeQuery` is experemental feature, if you want to use it
      // please open an issue with your use case, cause I suppose that
      // this option is excessive
      return (resolveParams.beforeQuery ? Promise.resolve(resolveParams.beforeQuery(resolveParams.query, resolveParams)) : resolveParams.query.exec()).then(function (res) {
        if (res.ok) {
          return {
            numAffected: res.nModified
          };
        }

        return Promise.reject(res);
      });
    }
  });

  return resolver;
}