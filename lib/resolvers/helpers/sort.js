'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortHelperArgs = undefined;
exports.sortHelper = sortHelper;
exports.getSortTypeFromModel = getSortTypeFromModel;

var _graphql = require('graphql-compose/lib/graphql');

var _getIndexesFromModel = require('../../utils/getIndexesFromModel');

var _typeStorage = require('../../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-use-before-define */

var sortHelperArgs = exports.sortHelperArgs = function sortHelperArgs(model, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for sortHelperArgs() should be instance of Mongoose Model.');
  }

  if (!opts || !opts.sortTypeName) {
    throw new Error('You should provide non-empty `sortTypeName` in options for sortHelperArgs().');
  }

  var gqSortType = getSortTypeFromModel(opts.sortTypeName, model);

  return {
    sort: {
      name: 'sort',
      type: gqSortType
    }
  };
};

function sortHelper(resolveParams) {
  var sort = resolveParams && resolveParams.args && resolveParams.args.sort;
  if (sort && typeof sort === 'object' && Object.keys(sort).length > 0) {
    resolveParams.query = resolveParams.query.sort(sort); // eslint-disable-line
  }
}

function getSortTypeFromModel(typeName, model) {
  var indexes = (0, _getIndexesFromModel.extendByReversedIndexes)((0, _getIndexesFromModel.getIndexesFromModel)(model));

  var sortEnumValues = {};
  indexes.forEach(function (indexData) {
    var keys = Object.keys(indexData);
    var name = keys.join('__').toUpperCase().replace(/[^_a-zA-Z0-9]/gi, '__');
    if (indexData[keys[0]] === 1) {
      name = `${name}_ASC`;
    } else if (indexData[keys[0]] === -1) {
      name = `${name}_DESC`;
    }
    sortEnumValues[name] = {
      name,
      value: indexData
    };
  });

  return _typeStorage2.default.getOrSet(typeName, new _graphql.GraphQLEnumType({
    name: typeName,
    values: sortEnumValues
  }));
}