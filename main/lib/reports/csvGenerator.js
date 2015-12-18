/**
 * Generates a CSV file
 *
 * This module is obsolete, being replaced by a version in the 'common' area.
 *
 * Created by kc on 17.07.15.
 */
'use strict';
var _ = require('lodash');
var moment = require('moment-timezone');
var logger = require('../../../common/lib/logger').getLogger('csvGenerator');

module.exports = {
  create: function(columns, data) {
    logger.info('CALL TO OBSOLETE FUNCTION create in csvGenerator');
    var i = 0;
    var retVal = '';
    var keys = _.keys(columns);
    var values = _.values(columns);

    var header = '';
    for (i = 0; i < values.length; i++) {
      header += values[i] + ';';
    }
    retVal += header + '\n';

    for (i = 0; i < data.length; i++) {
      var row = '';
      _.forEach(keys, function (key) {
        if (data[i] && data[i][key]) {
          row += data[i][key] + ';'
        }
        else {
          row += ';';
        }
      });
      retVal += row + '\n';
    }

    retVal += '\n\nStand:;' + moment.tz(moment(), 'Europe/Zurich').format('D.M.YYYY HH:mm:ss');
    return retVal;
  }
};
