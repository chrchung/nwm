/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/levels              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
var fs = require('fs');
var async = require('async');
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);
Parse.serverURL = 'https://parseapi.back4app.com'


// Returns a random game for the level specified
exports.getLevelInfo = function(req, res) {
  if (req.session.user) {
    getLevel(req, res);
  } else {
    res.status(400).end();
  };
};

var getLevel = function(req, res) {
  async.waterfall([
    function (callback) {
      var Games = Parse.Object.extend('Games');
      var gamesQuery = new Parse.Query(Games);
      gamesQuery.equalTo('level', parseInt(req.params.id));
      gamesQuery.first({
        success: function(game) {
          //var game = randomize(game, 1)[0];
          callback(null, game);
        },
        error: function(error) {
          res.status(500).end();
        }
      });

    },
    function (game, callback) {
      var models = game.relation('models');
      var modelsQuery = models.query();
      //modelsQuery.ascending("name");
      modelsQuery.find({
        success: function(models) {
          models.sort(function(a, b) {
            return parseInt(a.get("name").split(/a|b/)[1]) - parseInt(b.get("name").split(/a|b/)[1]);
          });
          callback(null, models);
        },
        error: function(error) {
          res.status(500).end();
        }
      });
    },
    function (models, callback) {
      var arr = [];
      async.each(models, function(model, callback) {
        //console.log(model);
        var cur_model = model.get("name");

        var keyExist = _.find(arr, function (element) {
          return element[0] == cur_model;
        });

        if (!keyExist) {
          arr.push([cur_model]);
        }
        var Model = Parse.Object.extend("Model");
        var aliensQuery = new Parse.Query(Model);
        aliensQuery.equalTo("model", model);
        //aliensQuery.ascending("modelsName");
        aliensQuery.find({
          success: function(aliens) {
            aliens.sort(function(a, b) {
              return parseInt(a.get("modelsName").split(/a|b/)[1].split("_")[1]) - parseInt(b.get("modelsName").split(/a|b/)[1].split("_")[1]);
            });

            var mod = _.find(arr, function (element) {
              if (element[0] == cur_model) {
                return element;
              }
            });
            mod.push(aliens);
            callback();
          },
          error: function(error) {
            res.status(500).end();
          }
        });
      }, function(err){
        callback(null, arr);
      });
    }
  ], function (err, results) {
    if (err) {
      res.status(500).end();
    } else {
      res.json(results);
    };
  });

};

var randomize = function (arr, num) {
  for(var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr.slice(0, num);
};

exports.getScoreToBeat = function (req, res) {
  var Games = Parse.Object.extend('Games');
  var gamesQuery = new Parse.Query(Games);
  gamesQuery.equalTo('level', parseInt(req.params.id));
  //gamesQuery.equalTo('name', parseInt(req.params.game));

  gamesQuery.find({
    success: function (scoreToBeat) {
      res.json(scoreToBeat);
    },
    error: function (error) {
      res.status(400).end();
    }
  });
};

exports.lastUnlockedLevels = function (req, res) {
  if (req.session.user) {
    var Scores = Parse.Object.extend('Scores');
    var scoreQuery = new Parse.Query(Scores);
    scoreQuery.equalTo('user', req.session.user.username);
    scoreQuery.descending('level');
    scoreQuery.first({
      success: function (score) {
        if (score == null) {
          res.json('n/a');
        } else {
          res.json(score.attributes.level);
        };
      },
      error: function (error) {
        res.status(400).end();
      }
    });
  } else {
    res.status(400).end();
  };
};
