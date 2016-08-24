var express = require('express');
var Parse = require('parse/node').Parse;
Parse.initialize('WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm', 'CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt');
Parse.serverURL = 'https://parseapi.back4app.com';

var app = express();


// get user e-mails
app.get('/', function (req, res) {
  // this code executes when you go to http://localhost:9000
  var result = [];
  var Users = Parse.Object.extend('Solutions');
  var query = new Parse.Query(Users);
  query.limit(1000);
  query.ascending('updatedAt');

  query.find({
    success: function (data) {
      var result = [];
      // console.log(data.length);
      var i;
      for (i = 0; i < data.length; i ++) {
          result.push({level: data[i].attributes.level, date: data[i].attributes.updatedAt, user: data[i].attributes.user, score: data[i].attributes.score, init: data[i].attributes.initialScore});
      }

      // var i =0;
      // for (i=0; i < result.length; i ++) {
      //   console.log(result[i] + '\n');
      // }

      res.json(result);
    },
    error: function (error) {
      console.log('err');
      res.status('400').end();
    }
  });


});


app.listen(9000, function () {
  console.log('listening port 9000');
});
