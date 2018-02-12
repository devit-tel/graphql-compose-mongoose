'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.projectionHelper = projectionHelper;
function projectionHelper(resolveParams) {
  // eslint-disable-line
  var projection = resolveParams.projection;
  if (projection) {
    // if projection has '*' key, then omit field projection (fetch all fields from database)
    if (projection['*']) {
      return;
    }
    var flatProjection = {};
    Object.keys(projection).forEach(function (key) {
      var val = projection[key];
      if (val && (val.$meta || val.$slice || val.$elemMatch)) {
        // pass MongoDB projection operators https://docs.mongodb.com/v3.2/reference/operator/projection/meta/
        flatProjection[key] = val;
      } else {
        // if not projection operator, then flatten projection
        flatProjection[key] = !!val;
      }
    });

    if (Object.keys(flatProjection).length > 0) {
      resolveParams.query = resolveParams.query.select(flatProjection); // eslint-disable-line
    }
  }
}