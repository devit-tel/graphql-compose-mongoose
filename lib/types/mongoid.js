'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _graphql = require('graphql-compose/lib/graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ObjectId = _mongoose2.default.Types.ObjectId;

var GraphQLMongoID = new _graphql.GraphQLScalarType({
  name: 'MongoID',
  description: 'The `ID` scalar type represents a unique MongoDB identifier in collection. ' + 'MongoDB by default use 12-byte ObjectId value ' + '(https://docs.mongodb.com/manual/reference/bson-types/#objectid). ' + 'But MongoDB also may accepts string or integer as correct values for _id field.',
  serialize: String,
  parseValue(value) {
    if (!ObjectId.isValid(value) && typeof value !== 'string') {
      throw new TypeError('Field error: value is an invalid ObjectId');
    }
    return value;
  },
  parseLiteral(ast) {
    return ast.kind === _graphql.Kind.STRING || ast.kind === _graphql.Kind.INT ? ast.value : null;
  }
});

exports.default = GraphQLMongoID;