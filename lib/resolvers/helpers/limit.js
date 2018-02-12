'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limitHelper = limitHelper;
var limitHelperArgs = exports.limitHelperArgs = function limitHelperArgs(opts) {
  return {
    limit: {
      name: 'limit',
      type: 'Int',
      defaultValue: opts && opts.defaultValue || 1000
    }
  };
};

function limitHelper(resolveParams) {
  var limit = parseInt(resolveParams.args && resolveParams.args.limit, 10) || 0;
  if (limit > 0) {
    resolveParams.query = resolveParams.query.limit(limit); // eslint-disable-line
  }
}