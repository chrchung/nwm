/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);


exports.create = function(req, res) {
  var User = Parse.Object.extend('User');
  var userQuery = new Parse.Query(User);
  userQuery.equalTo('username', req.body.username);
  userQuery.find({
    success: function(user) {
      if (user.length > 0) {
        res.send('taken');
      } else {
        var user = new Parse.User();
        user.set('username', req.body.username);
        user.set('password', req.body.password);

        user.signUp(null, {
          success: function(user) {
            req.session.user = user;
            var OverallScores = Parse.Object.extend('OverallScores');
            var newScore = new OverallScores();
            newScore.set('overallScore', 0);
            newScore.set('user', req.body.username);
            newScore.save(null, {
              success: function (gameScore) {
                res.status(200).end();
              },
              error: function (gameScore, error) {
                res.status(400).end();
              }
            });
          },
          error: function(user, error) {
            res.sendStatus(400);
          }
        });
      }
    },
    error: function(error) {
      res.status(500).end();
    }
  });
};

exports.current = function (req, res) {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(400).end();
  };
};


