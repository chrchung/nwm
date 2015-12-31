/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
var fs = require('fs');
var async = require('async');
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);


exports.create = function(req, res) {
  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);

  user.signUp(null, {
    success: function(user) {
      res.send(200);
    },
    error: function(user, error) {

    }
  });
};

exports.current = function (req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
    res.json(currentUser).end();
  } else {
    res.status(404).end();
  }
};


