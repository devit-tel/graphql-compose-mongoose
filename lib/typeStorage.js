'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _graphqlCompose = require('graphql-compose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeStorage = function (_Map) {
  (0, _inherits3.default)(TypeStorage, _Map);

  function TypeStorage() {
    (0, _classCallCheck3.default)(this, TypeStorage);
    return (0, _possibleConstructorReturn3.default)(this, (TypeStorage.__proto__ || Object.getPrototypeOf(TypeStorage)).apply(this, arguments));
  }

  (0, _createClass3.default)(TypeStorage, [{
    key: 'getOrSet',
    value: function getOrSet(typeName, typeOrThunk) {
      if (this.has(typeName)) {
        return this.get(typeName);
      }

      var gqType = (0, _graphqlCompose.isFunction)(typeOrThunk) ? typeOrThunk() : typeOrThunk;
      if (gqType) {
        this.set(typeName, gqType);
      }

      return gqType;
    }
  }], [{
    key: 'create',

    // this `create` hack due TypeError:
    // Constructor Map requires 'new' at TypeStorage.Map (native)
    value: function create(array) {
      var inst = new Map(array);
      // $FlowFixMe
      inst.__proto__ = TypeStorage.prototype; // eslint-disable-line
      return inst;
    }
  }]);
  return TypeStorage;
}(Map);

var typeStorage = TypeStorage.create();
exports.default = typeStorage;