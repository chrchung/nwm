/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);


exports.current= function (req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
    res.json(currentUser).end();
  } else {
    res.status(404).end();
  }
};
