'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.skipHelper = skipHelper;
var skipHelperArgs = exports.skipHelperArgs = function skipHelperArgs() {
  return {
    skip: {
      name: 'skip',
      type: 'Int'
    }
  };
};

function skipHelper(resolveParams) {
  var skip = parseInt(resolveParams && resolveParams.args && resolveParams.args.skip, 10);
  if (skip > 0) {
    resolveParams.query = resolveParams.query.skip(skip); // eslint-disable-line
  }
}