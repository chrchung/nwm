/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/auths              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);



exports.logout = function(req, res) {
  Parse.User.logOut();
  req.session.user = null;
  res.json(200);
};


exports.login = function (req, res) {


  var username = req.body.username;
  var password = req.body.password;
  Parse.User.logIn(username, password, {
    success: function (user) {
      req.session.user = user;
      res.json(user);
    },
    error: function (user, error) {
      //track analytics
      res.status(400).end();
    }
  });
};
