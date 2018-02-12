'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = removeMany;

var _graphqlCompose = require('graphql-compose');

var _helpers = require('./helpers');

var _typeStorage = require('../typeStorage');

var _typeStorage2 = _interopRequireDefault(_typeStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeMany(model, typeComposer, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeMany() should be instance of Mongoose Model.');
  }

  if (!typeComposer || typeComposer.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeMany() should be instance of TypeComposer.');
  }

  var outputTypeName = `RemoveMany${typeComposer.getTypeName()}Payload`;
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
    name: 'removeMany',
    kind: 'mutation',
    description: 'Remove many documents without returning them: ' + 'Use Query.remove mongoose method. ' + 'Do not apply mongoose defaults, setters, hooks and validation. ',
    type: outputType,
    args: (0, _extends3.default)({}, (0, _helpers.filterHelperArgs)(typeComposer, model, (0, _extends3.default)({
      filterTypeName: `FilterRemoveMany${typeComposer.getTypeName()}Input`,
      isRequired: true,
      model
    }, opts && opts.filter))),
    resolve: function resolve(resolveParams) {
      var filterData = resolveParams.args && resolveParams.args.filter || {};

      if (!(typeof filterData === 'object') || Object.keys(filterData).length === 0) {
        return Promise.reject(new Error(`${typeComposer.getTypeName()}.removeMany resolver requires ` + 'at least one value in args.filter'));
      }

      resolveParams.query = model.find();
      (0, _helpers.filterHelper)(resolveParams);
      resolveParams.query = resolveParams.query.remove();

      return (
        // `beforeQuery` is experemental feature, if you want to use it
        // please open an issue with your use case, cause I suppose that
        // this option is excessive
        (resolveParams.beforeQuery ? Promise.resolve(resolveParams.beforeQuery(resolveParams.query, resolveParams)) : resolveParams.query.exec()).then(function (res) {
          if (res.ok) {
            // mongoose 5
            return {
              numAffected: res.n
            };
          } else if (res.result && res.result.ok) {
            // mongoose 4
            return {
              numAffected: res.result.n
            };
          }

          return Promise.reject(new Error(JSON.stringify(res)));
        })
      );
    }
  });

  return resolver;
}
/* eslint-disable no-param-reassign */