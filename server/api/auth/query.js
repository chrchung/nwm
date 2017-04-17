var express = require('express');
var Parse = require('parse/node').Parse;
Parse.initialize('WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm', 'CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt');
Parse.serverURL = 'https://parseapi.back4app.com';

var app = express();


// get user e-mails
app.get('/', function (req, res) {
  var nwm = 45952 + 136286 + 9582 + 9940;
  var levels = [10, 12, 13, 15];
  var result = {player: 0, hsim: 8360 - 13247 + 9940, allP: -nwm};

  var UserData = Parse.Object.extend('UserData');
  var userDataQuery = new Parse.Query(UserData);
  userDataQuery.equalTo('user', 'coco');

  userDataQuery.first({
    success: function (user) {
      result.player = user.attributes.overallScore;

      async.each(levels, function(level, callback) {

        res.json(result);

        var Solutions = Parse.Object.extend('Solutions');
        var solutionsQuery = new Parse.Query(Solutions);
        solutionsQuery.equalTo('level', level);
        solutionsQuery.descending('score');

        solutionsQuery.first({
          success: function (sol) {
            res.json(result);
            result.allP = result.allP + sol.attributes.score;
            callback();
          },
          error: function (error) {
            res.status(400).end();
          }
        });

      }, function(err) {
        // if any of the file processing produced an error, err would equal that error
        if( err ) {
          res.status(400).end();

        } else {
          res.json(result);
        }
      });
    },
    error: function (error) {
      res.status(400).end();
    }
  });

});


app.listen(9000, function () {
  console.log('listening port 9000');
});
