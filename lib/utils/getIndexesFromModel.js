'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.getIndexesFromModel = getIndexesFromModel;
exports.getUniqueIndexes = getUniqueIndexes;
exports.extendByReversedIndexes = extendByReversedIndexes;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isSpecificIndex(idx) {
  var hasSpecialIndex = false;
  Object.keys(idx).forEach(function (k) {
    if (typeof idx[k] !== 'number' && typeof idx[k] !== 'boolean') {
      hasSpecialIndex = true;
    }
  });
  return hasSpecialIndex;
}

/*
* Get mongoose model, and return array of fields with indexes.
*  MongooseModel  ->  [ { _id: 1 }, { name: 1, surname: -1 } ]
*/


function getIndexesFromModel(mongooseModel) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var extractCompound = opts.extractCompound === undefined ? true : Boolean(opts.extractCompound);
  var skipSpecificIndexes = opts.skipSpecificIndexes === undefined ? true : Boolean(opts.skipSpecificIndexes);

  var indexedFields = [];

  // add _id field if existed
  if (mongooseModel.schema.paths._id) {
    indexedFields.push({ _id: 1 });
  }

  // scan all fields on index presence [MONGOOSE FIELDS LEVEL INDEX]
  Object.keys(mongooseModel.schema.paths).forEach(function (name) {
    if (mongooseModel.schema.paths[name]._index) {
      indexedFields.push({ [name]: 1 }); // ASC by default
    }
  });

  // scan compound and special indexes [MONGOOSE SCHEMA LEVEL INDEXES]
  if (Array.isArray(mongooseModel.schema._indexes)) {
    mongooseModel.schema._indexes.forEach(function (idxData) {
      var partialIndexes = {};
      var idxFields = idxData[0];

      if (!skipSpecificIndexes || !isSpecificIndex(idxFields)) {
        if (!extractCompound) {
          indexedFields.push(idxFields);
        } else {
          // extract partial indexes from compound index
          // { name: 1, age: 1, salary: 1} -> [{name:1}, {name:1, age:1}, {name:1, age:1, salary:1}]
          Object.keys(idxFields).forEach(function (fieldName) {
            partialIndexes[fieldName] = idxFields[fieldName];
            indexedFields.push((0, _extends3.default)({}, partialIndexes));
          });
        }
      }
    });
  }

  // filter duplicates
  var tmp = [];
  var result = indexedFields.filter(function (val) {
    var asString = JSON.stringify(val);
    if (tmp.indexOf(asString) > -1) return false;
    tmp.push(asString);
    return true;
  });

  return result;
}

function getUniqueIndexes(mongooseModel) {
  var indexedFields = [];

  // add _id field if existed
  if (mongooseModel.schema.paths._id) {
    indexedFields.push({ _id: 1 });
  }

  // scan all fields on index presence [MONGOOSE FIELDS LEVEL INDEX]
  Object.keys(mongooseModel.schema.paths).forEach(function (name) {
    if (mongooseModel.schema.paths[name]._index && mongooseModel.schema.paths[name]._index.unique) {
      indexedFields.push({ [name]: 1 }); // ASC by default
    }
  });

  // scan compound and special indexes [MONGOOSE SCHEMA LEVEL INDEXES]
  if (Array.isArray(mongooseModel.schema._indexes)) {
    mongooseModel.schema._indexes.forEach(function (idxData) {
      var idxFields = idxData[0];
      var idxCfg = idxData[1];
      if (idxCfg.unique && !isSpecificIndex(idxFields)) {
        indexedFields.push(idxFields);
      }
    });
  }

  return indexedFields;
}

function extendByReversedIndexes(indexes) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var reversedFirst = opts.reversedFirst === undefined ? false : Boolean(opts.reversedFirst);

  var result = [];

  indexes.forEach(function (indexObj) {
    var hasSpecificIndex = false;
    // https://docs.mongodb.org/manual/tutorial/sort-results-with-indexes/#sort-on-multiple-fields
    var reversedIndexObj = (0, _extends3.default)({}, indexObj);
    Object.keys(reversedIndexObj).forEach(function (f) {
      if (reversedIndexObj[f] === 1) reversedIndexObj[f] = -1;else if (reversedIndexObj[f] === -1) reversedIndexObj[f] = 1;else hasSpecificIndex = true;
    });

    if (reversedFirst) {
      if (!hasSpecificIndex) {
        result.push(reversedIndexObj);
      }
      result.push(indexObj);
    } else {
      result.push(indexObj);
      if (!hasSpecificIndex) {
        result.push(reversedIndexObj);
      }
    }
  });

  return result;
}