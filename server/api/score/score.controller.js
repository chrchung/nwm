/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/scores              ->  index
 */

'use strict';
var _ = require('lodash');
var config = require('../../config/environment');
var Parse = require('parse/node').Parse;
var fs = require('fs');
var async = require('async');
Parse.initialize(config.PARSE_APPID, config.PARSE_JSKEY);


// Gets a list of Scores
exports.index = function(req, res) {
  res.json([]);
};

exports.saveScore = function(req, res) {
  var score = req.params.score;
  var game = req.params.game;
  var level = req.params.level;
  var user = Parse.User.current();

  var Scores = Parse.Object.extend('Scores');
  var newScore = new Scores();
  newScore.set('game', game);
  newScore.set('level', level);
  newScore.set('user', user);
  newScore.set('score', score);

  newScore.save(null, {
    success: function(gameScore) {
      updateOverallScore(user, game, level, score);
    },
    error: function(gameScore, error) {
      res.setStatus(400);
    }
  });
};

var updateOverallScore = function (user, game, level, score) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  var user = Parse.User.current();
  scoreQuery.equalTo('game', game);
  scoreQuery.equalTo('level', level);
  scoreQuery.equalTo('user', user);
  scoreQuery.descending('score');

  scoreQuery.first({
    success: function (curHighest) {
      if (curHighest.attributes.score > score) {
        Parse.User.current().set('overallScore', Parse.User.current().attributes.overallScore -
          curHighest.attributes.score + score);
        res.setStatus(200);
      } else {
        res.setStatus(200);
      }
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};

exports.getAllOverall = function(req, res) {
  var User = Parse.Object.extend('User');
  var userQuery = new Parse.Query(User);
  userQuery.descending('overallScore');
  userQuery.limit(10);
  userQuery.find({
    success: function (users) {
      res.json(users);
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};

exports.getGameScoreboard = function(req, res) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  scoreQuery.equalTo('game', req.params.game);
  scoreQuery.equalTo('level', req.params.level);
  scoreQuery.descending('score');
  scoreQuery.limit(10);

  scoreQuery.find({
    success: function (scores) {
      res.json(scores);
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};

exports.getCurUserGameScore = function(req, res) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  var user = Parse.User.current();
  scoreQuery.equalTo('user', user);
  scoreQuery.equalTo('game', req.params.game);
  scoreQuery.equalTo('level', req.params.level);
  scoreQuery.limit(10);
  scoreQuery.find({
    success: function (scores) {
      res.json(scores);
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};


exports.getCurUserGameScoreBest = function(req, res) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  var user = Parse.User.current();
  scoreQuery.equalTo('user', user);
  scoreQuery.equalTo('game', req.params.game);
  scoreQuery.equalTo('level', req.params.level);
  scoreQuery.descending('score');
  scoreQuery.limit(1);

  scoreQuery.find({
    success: function (scores) {
      res.json(scores);
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};

exports.getCurUserRecentScores = function(req, res) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  var user = Parse.User.current();
  scoreQuery.equalTo('user', user);
  scoreQuery.limit(10);

  scoreQuery.find({
    success: function (scores) {
      res.json(scores);
    },
    error: function (error) {
      res.setStatus(400);
    }
  });
};
