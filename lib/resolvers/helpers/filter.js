'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterHelperArgs = exports.RAW_QUERY_FIELDNAME = exports.OPERATORS_FIELDNAME = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.filterHelper = filterHelper;
exports.getAllFieldNames = getAllFieldNames;
exports.getIndexedFieldNames = getIndexedFieldNames;
exports.addFieldsWithOperator = addFieldsWithOperator;
exports.filterCustomHelper = filterCustomHelper;

var _graphqlCompose = require('graphql-compose');

var _graphql = require('graphql-compose/lib/graphql');

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

var _getIndexesFromModel = require('../../utils/getIndexesFromModel');

var _mongoid = require('../../types/mongoid');

var _mongoid2 = _interopRequireDefault(_mongoid);

var _utils = require('../../utils');

var _typeStorage = require('../../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OPERATORS_FIELDNAME = exports.OPERATORS_FIELDNAME = '_operators';
/* eslint-disable no-use-before-define */

var RAW_QUERY_FIELDNAME = exports.RAW_QUERY_FIELDNAME = '_rawQuery';

var filterHelperArgs = exports.filterHelperArgs = function filterHelperArgs(typeComposer, model, opts) {
  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('First arg for filterHelperArgs() should be instance of TypeComposer.');
  }

  if (!model || !model.modelName || !model.schema) {
    throw new Error('Second arg for filterHelperArgs() should be instance of MongooseModel.');
  }

  if (!opts || !opts.filterTypeName) {
    throw new Error('You should provide non-empty `filterTypeName` in options.');
  }

  var removeFields = [];
  if (opts.removeFields) {
    if (Array.isArray(opts.removeFields)) {
      removeFields.push.apply(removeFields, (0, _toConsumableArray3.default)(opts.removeFields));
    } else {
      removeFields.push(opts.removeFields);
    }
  }

  if (opts.onlyIndexed) {
    var indexedFieldNames = getIndexedFieldNames(model);
    Object.keys(typeComposer.getFields()).forEach(function (fieldName) {
      if (indexedFieldNames.indexOf(fieldName) === -1) {
        removeFields.push(fieldName);
      }
    });
  }

  var filterTypeName = opts.filterTypeName;
  var inputComposer = typeComposer.getInputTypeComposer().clone(filterTypeName);

  inputComposer.addFields({
    _ids: new _graphql.GraphQLList(_mongoid2.default)
  });

  inputComposer.removeField(removeFields);

  if (opts.requiredFields) {
    inputComposer.makeRequired(opts.requiredFields);
  }

  if (!{}.hasOwnProperty.call(opts, 'operators') || opts.operators !== false) {
    addFieldsWithOperator(`Operators${opts.filterTypeName || ''}`, inputComposer, model, opts.operators || {});
  }

  if (inputComposer.getFieldNames().length === 0) {
    return {};
  }

  return {
    filter: {
      name: 'filter',
      type: opts.isRequired ? new _graphql.GraphQLNonNull(inputComposer.getType()) : inputComposer.getType(),
      description: opts.onlyIndexed ? 'Filter only by indexed fields' : 'Filter by fields'
    }
  };
};

function filterHelper(resolveParams) {
  var filter = resolveParams.args && resolveParams.args.filter;
  if (filter && typeof filter === 'object' && Object.keys(filter).length > 0) {
    var modelFields = Object.keys(resolveParams.query.schema.paths);

    var _ids = filter._ids,
        filterFields = (0, _objectWithoutProperties3.default)(filter, ['_ids']);

    if (_ids && Array.isArray(_ids)) {
      // eslint-disable-next-line
      resolveParams.query = resolveParams.query.where({ _id: { $in: _ids } });
    }

    var clearedFilter = {};
    var objToDotNotation = function objToDotNotation(field) {
      var res = {};
      (function recurse(obj, current) {
        for (var key in obj) {
          var value = obj[key];
          var newKey = current ? current + "." + key : key; // joined key with dot
          if (value && typeof value === "object") {
            recurse(value, newKey); // it's a nested object, so do it again
          } else {
            res[newKey] = value; // it's not an object, so set the property
          }
        }
      })(field);
      return res;
    };
    var filterFieldsWithDotNotation = objToDotNotation(filterFields);
    Object.keys(filterFieldsWithDotNotation).forEach(function (key) {
      if (modelFields.indexOf(key) !== -1) {
        clearedFilter[key] = filterFieldsWithDotNotation[key];
      }
    });
    // Object.keys(filterFields).forEach(key => {
    //   if (modelFields[key]) {
    //     clearedFilter[key] = filterFields[key];
    //   }
    // });
    if (Object.keys(clearedFilter).length > 0) {
      // eslint-disable-next-line
      resolveParams.query = resolveParams.query.where((0, _utils.toMongoDottedObject)(clearedFilter));
    }

    if (filter[OPERATORS_FIELDNAME]) {
      var operatorFields = filter[OPERATORS_FIELDNAME];
      Object.keys(operatorFields).forEach(function (fieldName) {
        var fieldOperators = (0, _extends3.default)({}, operatorFields[fieldName]);
        // const criteria = {};
        var newFieldName = {};
        Object.keys(fieldOperators).forEach(function (operatorName) {
          if (typeof fieldOperators[operatorName] === 'object') {
            Object.keys(fieldOperators[operatorName]).forEach(function (key) {
              newFieldName[`${fieldName}.${key}`] = {
                [`$${operatorName}`]: fieldOperators[operatorName][key]
              };
            });
          } else {
            newFieldName[`${fieldName}`] = { [`$${operatorName}`]: fieldOperators[operatorName] };
          }
        });
        if (Object.keys(newFieldName).length > 0) {
          // eslint-disable-next-line
          Object.keys(newFieldName).forEach(function (keyName) {
            resolveParams.query = resolveParams.query.where({
              [keyName]: newFieldName[keyName]
            });
          });
        }
        // Object.keys(fieldOperators).forEach(operatorName => {
        //   criteria[`$${operatorName}`] = fieldOperators[operatorName];
        // });
        // if (Object.keys(criteria).length > 0) {
        //   // eslint-disable-next-line
        //   resolveParams.query = resolveParams.query.where({
        //     [fieldName]: criteria,
        //   });
        // }
      });
    }
  }

  if ((0, _graphqlCompose.isObject)(resolveParams.rawQuery)) {
    // eslint-disable-next-line
    resolveParams.query = resolveParams.query.where(resolveParams.rawQuery);
  }
}

function getAllFieldNames(model) {
  var fieldNames = Object.keys(model.schema.paths);
  var result = [];
  for (var i in fieldNames) {
    var field = fieldNames[i].split(".")[0].replace(/[^_a-zA-Z0-9]/i, '__');
    // var clearedName = keys[0]
    if (result.indexOf(field) == -1) {
      result.push(field);
    }
  }
  return result;
}

function getIndexedFieldNames(model) {
  var indexes = (0, _getIndexesFromModel.getIndexesFromModel)(model);

  var fieldNames = [];
  indexes.forEach(function (indexData) {
    var keys = Object.keys(indexData);
    var clearedName = keys[0].replace(/[^_a-zA-Z0-9]/i, '__');
    fieldNames.push(clearedName);
  });

  // filter duplicates
  var uniqueNames = [];
  var result = fieldNames.filter(function (val) {
    if (uniqueNames.indexOf(val) > -1) return false;
    uniqueNames.push(val);
    return true;
  });

  return result;
}

function addFieldsWithOperator(typeName, inputComposer, model, operatorsOpts) {
  var operatorsComposer = new _graphqlCompose.InputTypeComposer(_typeStorage2.default.getOrSet(typeName, new _graphql.GraphQLInputObjectType({
    name: typeName,
    fields: {},
    description: 'For performance reason this type contains only *indexed* fields.'
  })));

  var availableOperators = ['gt', 'gte', 'lt', 'lte', 'ne', 'in[]', 'nin[]', 'regex', 'options'];

  // if `opts.resolvers.[resolverName].filter.operators` is empty and not disabled via `false`
  // then fill it up with indexed fields
  // const indexedFields = getIndexedFieldNames(model);
  var allFields = getAllFieldNames(model);
  if (operatorsOpts !== false && Object.keys(operatorsOpts).length === 0) {
    allFields.forEach(function (fieldName) {
      operatorsOpts[fieldName] = availableOperators; // eslint-disable-line
    });
    // indexedFields.forEach(fieldName => {
    //   operatorsOpts[fieldName] = availableOperators; // eslint-disable-line
    // });
  }

  var existedFields = inputComposer.getFields();
  Object.keys(existedFields).forEach(function (fieldName) {
    if (operatorsOpts[fieldName] && operatorsOpts[fieldName] !== false) {
      var fields = {};
      var _operators = void 0;
      if (operatorsOpts[fieldName] && Array.isArray(operatorsOpts[fieldName])) {
        _operators = operatorsOpts[fieldName];
      } else {
        _operators = availableOperators;
      }
      _operators.forEach(function (operatorName) {
        // unwrap from GraphQLNonNull and GraphQLList, if present
        var namedType = (0, _graphql.getNamedType)(existedFields[fieldName].type);
        if (namedType) {
          if (operatorName.slice(-2) === '[]') {
            // wrap with GraphQLList, if operator required this with `[]`
            var newName = operatorName.slice(0, -2);
            fields[newName] = (0, _extends3.default)({}, existedFields[fieldName], {
              type: new _graphql.GraphQLList(namedType)
            });
          } else {
            fields[operatorName] = (0, _extends3.default)({}, existedFields[fieldName], {
              type: namedType
            });
          }
        }
      });
      if (Object.keys(fields).length > 0) {
        var operatorTypeName = `${(0, _utils.upperFirst)(fieldName)}${typeName}`;
        operatorsComposer.setField(fieldName, {
          type: _typeStorage2.default.getOrSet(operatorTypeName, new _graphql.GraphQLInputObjectType({
            name: operatorTypeName,
            fields
          })),
          description: 'Filter value by operator(s)'
        });
      }
    }
  });
  inputComposer.setField(RAW_QUERY_FIELDNAME, {
    type: _graphqlTypeJson2.default,
    description: 'Filter everything'
  });

  if (Object.keys(operatorsComposer.getFields()).length > 0) {
    inputComposer.setField(OPERATORS_FIELDNAME, {
      type: operatorsComposer.getType(),
      description: 'List of *indexed* fields that can be filtered via operators.'
    });
  }

  return operatorsComposer;
}

function filterCustomHelper(resolveParams) {
  var filter = resolveParams.args && resolveParams.args.filter;
  if (filter && typeof filter === 'object' && Object.keys(filter).length > 0) {
    if (filter[RAW_QUERY_FIELDNAME]) {
      var objToDotNotation = function objToDotNotation(field) {
        var res = {};
        (function recurse(obj, current) {
          for (var key in obj) {
            var value = obj[key];
            var newKey = current ? current + "." + key : key; // joined key with dot
            if (value && typeof value === "object") {
              recurse(value, newKey); // it's a nested object, so do it again
            } else {
              res[newKey] = value; // it's not an object, so set the property
            }
          }
        })(field);
        return res;
      };
      var rawQuery = filter._rawQuery;
      // const filterFieldsWithDotNotation = objToDotNotation(filterFields)
      if ((0, _graphqlCompose.isObject)(rawQuery)) {
        // eslint-disable-next-line
        resolveParams.query = resolveParams.query.where(rawQuery);
      }
    }
  }
}