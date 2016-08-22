var express = require('express');
var Parse = require('parse/node').Parse;
Parse.initialize('WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm', 'CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt');
Parse.serverURL = 'https://parseapi.back4app.com';

var app = express();


// get user e-mails
app.get('/', function (req, res) {
  // this code executes when you go to http://localhost:9000
  var result = [];
  var Users = Parse.Object.extend('User');
  var query = new Parse.Query(query);
  // query.equalTo('email', 'hi@hmail.com');
  query.limit(1000);

  query.find({
    success: function (data) {
      console.log(data.length);
      var i;
      for (i = 0; i < data.length; i ++) {
        if (data[i].attributes.email) {
          result.push(data[i].attributes.email);
        }
      }
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
