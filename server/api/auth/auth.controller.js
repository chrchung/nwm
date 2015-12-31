/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/auths              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);


exports.activate = function (req, res) {
  var query = new Parse.Query(Parse.User);
  query.get(req.params.auth_token, {
    success: function (result) {
      Parse.User.logIn(result.get('username'), config.TEMPWD, {
        success: function (user) {
          user.set('password', req.params.pwd);
          user.save(null, {
            error: function (userAgain, error) {
              console.log("An error occurred.", error);
              res.status(404).end();
            }
          });
          res.status(200).end();
        },
        error: function (error) {
          res.status(404).end();
        }
      });
      res.status(200).end();
    },
    error: function (err) {
      console.error("Failed to find user");
      res.status(404).end();
    }
  });
};

exports.currentUser = function (req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
    res.json(currentUser).end();
  } else {
    res.status(404).end();
  }
};

exports.userData = function (req, res) {
  res.json(req.session.user).end();
};

exports.logout = function(req, res) {
  Parse.User.logOut();
  res.json(200);
};


exports.login = function (req, res) {
  var username = req.body.username;
  var password = req.body.pwd;
  Parse.User.logIn(username, password, {
    success: function (user) {
      return res.json(user);
    },
    error: function (user, error) {
      //track analytics
      res.status(404).end();
    }
  });

};
