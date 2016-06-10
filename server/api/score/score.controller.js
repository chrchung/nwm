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
Parse.serverURL = 'https://parseapi.back4app.com'


// Gets a list of Scores
exports.index = function (req, res) {
  res.json([]);
};

exports.saveScore = function (req, res) {
  if (req.session.user) {
    var solution = req.body.solution;
    var score = req.body.score;
   // var game = req.body.game;
    var level = req.body.level;
    var user = req.session.user;
    var Scores = Parse.Object.extend('Scores');
    var newScore = new Scores();
   // newScore.set('game', game);
    newScore.set('level', level);
    newScore.set('user', user.username);
    newScore.set('score', score);

    // get current best solution and replace if higher
    var Solutions = Parse.Object.extend('Solutions');
    var solutionsQuery = new Parse.Query(Solutions);
    solutionsQuery.equalTo('level', parseInt(req.params.id));
    solutionsQuery.equalTo('partial', false);

    solutionsQuery.first({
      success: function (bestSolution) {
        if (bestSolution.attributes.score < score) {
          bestSolution.set('user', user);
          bestSolution.set('solution', solution);
          bestSolution.set('score', score);
          bestSolution.save(null, {
            success: function (gameScore) {

            },
            error: function (gameScore, error) {
              res.status(400).end();
            }
          });
        }
      },
      error: function (error) {
        res.status(400).end();
      }
    });

    newScore.save(null, {
      success: function (gameScore) {
        //updateOverallScore(user, game, level, score, gameScore.id, req, res);
      },
      error: function (gameScore, error) {
        res.status(400).end();
      }
    });
  } else {
    res.status(400).end();
  };
};

exports.saveForLater = function (req, res) {
  if (req.session.user) {
    var solution = req.body.solution;
    //var score = req.body.score;
    var level = req.body.level;
    var user = req.session.user;

    //delete last save if found
    var Solutions = Parse.Object.extend('Solutions');
    var solutionsQuery = new Parse.Query(Solutions);
    solutionsQuery.equalTo('level', parseInt(req.params.id));
    solutionsQuery.equalTo('partial', false);
    solutionsQuery.equalTo('user', user);

    solutionsQuery.first({
      success: function (sol) {
        if (sol) {
          sol.destroy({
            success: function(myObject) {
              // The object was deleted from the Parse Cloud.
            },
            error: function(myObject, error) {
              // The delete failed.
              // error is a Parse.Error with an error code and message.
            }
          });
        }
      },
      error: function (error) {
        res.status(400).end();
      }
    });

    var Solution = Parse.Object.extend('Solution');
    var newSolution = new Solution();
    newSolution.set('solution', solution);
    newSolution.set('level', level);
    newSolution.set('user', user);
    newSolution.set('partial', true);

    newSolution.save(null, {
      success: function (gameScore) {
        res.status(200).end();

      },
      error: function (gameScore, error) {
        res.status(400).end();
      }
    });

  };
};

exports.getBestSolution = function(req, res) {
  if (req.session.user) {
    var Solutions = Parse.Object.extend('Solutions');
    var solutionsQuery = new Parse.Query(Solutions);
    solutionsQuery.equalTo('level', parseInt(req.params.id));
    solutionsQuery.equalTo('partial', false);

    solutionsQuery.first({
      success: function (sol) {
        res.send(sol);
      },
      error: function (error) {
        res.status(400).end();
      }
    });
  }
};

exports.getCurUserSolution = function(req, res) {
  if (req.session.user) {
    var Solutions = Parse.Object.extend('Solutions');
    var solutionsQuery = new Parse.Query(Solutions);
    solutionsQuery.equalTo('level', parseInt(req.params.id));
    solutionsQuery.equalTo('user', req.session.user);
    solutionsQuery.equalTo('partial', true);

    solutionsQuery.first({
      success: function (sol) {
        res.send(sol);
      },
      error: function (error) {
        res.status(400).end();
      }
    });
  }
};



// var updateOverallScore = function (user, game, level, score, thisScoreId, req, res) {
//   var Scores = Parse.Object.extend('Scores');
//   var scoreQuery = new Parse.Query(Scores);
//   scoreQuery.equalTo('game', game);
//   scoreQuery.equalTo('level', level);
//   scoreQuery.equalTo('user', user.username);
//   scoreQuery.descending('score');
//   scoreQuery.notEqualTo('objectId', thisScoreId);
//
//   scoreQuery.first({
//     success: function (curHighest) {
//       if (curHighest == null) {
//         changeOverall(0, score, user, req, res);
//       } else if (curHighest.attributes.score < score) {
//         changeOverall(curHighest.attributes.score, score, user, req, res);
//       } else {
//         res.status(200).end();
//       };
//     },
//     error: function (error) {
//       res.status(400).end();
//     }
//   });
// };

var changeOverall = function (oldVal, newVal, user, req, res) {
  var OverallScores = Parse.Object.extend('OverallScores');
  var scoreQuery = new Parse.Query(OverallScores);
  scoreQuery.equalTo('user', user.username);
  scoreQuery.first({
    success: function (overallScore) {
      overallScore.set('overallScore', overallScore.attributes.overallScore - oldVal + newVal);
      overallScore.save(null, {
        success: function (gameScore) {
          res.status(200).end();
        },
        error: function (gameScore, error) {
          res.status(400).end();
        }
      });
    },
    error: function (error) {
      res.status(400).end();
    }
  });
};

exports.getAllOverall = function (req, res) {
  var OverallScores = Parse.Object.extend('OverallScores');
  var scoreQuery = new Parse.Query(OverallScores);
  scoreQuery.descending('overallScore');
  scoreQuery.limit(10);
  scoreQuery.find({
    success: function (users) {
      res.json(users);
    },
    error: function (error) {
      res.status(400).end();
    }
  });
};

exports.getGameScoreboard = function (req, res) {
  var Scores = Parse.Object.extend('Scores');
  var scoreQuery = new Parse.Query(Scores);
  scoreQuery.equalTo('level', parseInt(req.params.level));
  scoreQuery.descending('score');
  scoreQuery.limit(10);

  scoreQuery.find({
    success: function (scores) {
      res.json(scores);
    },
    error: function (error) {
      res.status(400).end();
    }
  });
};

exports.getCurUserGameScore = function (req, res) {
  if (req.session.user) {
    var Scores = Parse.Object.extend('Scores');
    var scoreQuery = new Parse.Query(Scores);
    var user = req.session.user.username;
    scoreQuery.equalTo('user', user);
    scoreQuery.equalTo('game', parseInt(req.params.game));
    scoreQuery.equalTo('level', parseInt(req.params.level));
    scoreQuery.limit(10);
    scoreQuery.find({
      success: function (scores) {
        res.json(scores);
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


exports.getCurUserGameScoreBest = function (req, res) {
  if (req.session.user) {
    var Scores = Parse.Object.extend('Scores');
    var scoreQuery = new Parse.Query(Scores);
    var user = req.session.user;
    scoreQuery.equalTo('user', req.session.user.username);
    scoreQuery.equalTo('game', parseInt(req.params.game));
    scoreQuery.equalTo('level', parseInt(req.params.level));
    scoreQuery.descending('score');
    scoreQuery.limit(1);

    scoreQuery.find({
      success: function (scores) {
        res.json(scores);
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

exports.getCurUserRecentScores = function (req, res) {
  if (req.session.user) {
    var User = Parse.Object.extend('User');
    var userQuery = new Parse.Query(User);
    userQuery.equalTo('username', req.session.user.username);
    userQuery.find({
      success: function (user) {
        var Scores = Parse.Object.extend('Scores');
        var scoreQuery = new Parse.Query(Scores);
        scoreQuery.equalTo('user', req.session.user.username);
        scoreQuery.limit(10);

        scoreQuery.find({
          success: function (scores) {
            res.json(scores);
          },
          error: function (error) {
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
