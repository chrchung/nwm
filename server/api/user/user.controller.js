/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);
Parse.serverURL = 'https://parseapi.back4app.com'


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
            var UserData = Parse.Object.extend('UserData');
            var data = new UserData();
            data.set('overallScore', 0);
            data.set('seenTut', false);
            data.set('user', req.body.username);
            data.save(null, {
              success: function (result) {
                res.status(200).end();
              },
              error: function (result, error) {
                res.status(400).end();
              }
            });
            res.status(200).end();
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


exports.getSeenTut = function(req, res) {
  if (req.session.user) {
    var UserData = Parse.Object.extend('UserData');
    var userDataQuery = new Parse.Query(UserData);
    userDataQuery.equalTo('user', req.session.user.username);
    userDataQuery.first({
      success: function (user) {
        res.send(user);
      },
      error: function (error) {
        res.status(400).end();
      }
    });
  } else {
    res.status(400).end();
  }
  ;

};




exports.seenTut = function(req, res) {
  if (req.session.user) {
    var UserData = Parse.Object.extend('UserData');
    var userDataQuery = new Parse.Query(UserData);
    userDataQuery.equalTo('user', req.session.user.username);
    userDataQuery.first({
      success: function (user) {
        user.set('seenTut', true);
        user.save(null, {
          success: function (result) {
            res.status(200).end();
          },
          error: function (result, error) {
            res.status(400).end();
          }
        });

      },
      error: function (error) {
        res.status(400).end();
      }
    });
  } else {
    res.status(400).end();
  }
  ;

};

