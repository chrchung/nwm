'use strict';

var Parse = require('parse/node').Parse;
var APP_ID = "WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm";
var JavaScriptKey = "CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt";
Parse.initialize(APP_ID, JavaScriptKey);
// Get list of levels
exports.index = function(req, res) {
  res.json([]);
};

exports.getLevelInfo = function(req, res) {
  var Level = Parse.Object.extend("Levels");
  var query = new Parse.Query(Level);
  query.equalTo("name", 1);

  query.find({
      success: function(level)
      {//returns the models associated to this level
        res.toJSON(level[0].get("model"));
      }
    }
  );
}
