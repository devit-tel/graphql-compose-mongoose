'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.count = exports.createOne = exports.removeMany = exports.removeOne = exports.removeById = exports.updateMany = exports.updateOne = exports.updateById = exports.findMany = exports.findOne = exports.findByIds = exports.findById = undefined;
exports.getAvailableNames = getAvailableNames;

var _findById = require('./findById');

var _findById2 = _interopRequireDefault(_findById);

var _findByIds = require('./findByIds');

var _findByIds2 = _interopRequireDefault(_findByIds);

var _findOne = require('./findOne');

var _findOne2 = _interopRequireDefault(_findOne);

var _findMany = require('./findMany');

var _findMany2 = _interopRequireDefault(_findMany);

var _updateById = require('./updateById');

var _updateById2 = _interopRequireDefault(_updateById);

var _updateOne = require('./updateOne');

var _updateOne2 = _interopRequireDefault(_updateOne);

var _updateMany = require('./updateMany');

var _updateMany2 = _interopRequireDefault(_updateMany);

var _removeById = require('./removeById');

var _removeById2 = _interopRequireDefault(_removeById);

var _removeOne = require('./removeOne');

var _removeOne2 = _interopRequireDefault(_removeOne);

var _removeMany = require('./removeMany');

var _removeMany2 = _interopRequireDefault(_removeMany);

var _createOne = require('./createOne');

var _createOne2 = _interopRequireDefault(_createOne);

var _count = require('./count');

var _count2 = _interopRequireDefault(_count);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.findById = _findById2.default;
exports.findByIds = _findByIds2.default;
exports.findOne = _findOne2.default;
exports.findMany = _findMany2.default;
exports.updateById = _updateById2.default;
exports.updateOne = _updateOne2.default;
exports.updateMany = _updateMany2.default;
exports.removeById = _removeById2.default;
exports.removeOne = _removeOne2.default;
exports.removeMany = _removeMany2.default;
exports.createOne = _createOne2.default;
exports.count = _count2.default;
function getAvailableNames() {
  return ['findById', 'findByIds', 'findOne', 'findMany', 'updateById', 'updateOne', 'updateMany', 'removeById', 'removeOne', 'removeMany', 'createOne', 'count'];
}