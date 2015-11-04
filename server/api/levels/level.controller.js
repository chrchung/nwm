'use strict';


var Parse = require('parse/node').Parse;
var APP_ID = "WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm";
var JavaScriptKey = "CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt";
Parse.initialize(APP_ID, JavaScriptKey);
// Get list of levels
exports.index = function(req, res) {
  res.json([]);
};

console.log("server initialized");

exports.getLevelInfo = function(req, res)
{
// suppose we have a book object
  var book = ...

// create a relation based on the authors key
  var relation = book.relation("authors");

// generate a query based on that relation
  var query = relation.query();

// now execute the query


  var Level = Parse.Object.extend("Levels");
  var levelPointer = new Level();






  var relation = Level.relation("model");

  var query = relation.query();

  query.equalTo("name", 1);



  //var Level = Parse.Object.extend("Levels");
  //var query = new Parse.Query(Level);
  //
  //query.equalTo("name", 1);
  //
  //query.find({
  //    success: function(level)
  //    {
  //
  //      var models =  level[0].get("model");
  //      var listOfAliens = [];
  //      models.query().find(
  //        {
  //          success: function (model) {
  //            for (var i = 0; i < model.length; i++) {
  //              var reqParam =  {body :{
  //                __type: "Pointer",
  //                className: "Models",
  //                objectId: model[i].id,
  //                modelName: model[i].get("name")
  //              }};
  //
  //              var Model = Parse.Object.extend("Model");
  //              var query = new Parse.Query(Model);
  //              query.equalTo("model", reqParam.body);
  //
  //              query.find({
  //                success: function(models) {
  //                  var attributes = [];
  //                  attributes.length = models.length- 1;
  //
  //                  for (var i = 0; i < models.length; ++i) {
  //                    attributes[i] = {"Alien" : models[i].Alien,"attributes" :(models[i].get("attributes"))};
  //                  }
  //
  //                  listOfAliens.push(attributes);
  //                  console.log(listOfAliens);
  //                  //res.json(listOfAliens);
  //                },
  //                error: function (object, error) {
  //                  // The object was not retrieved successfully.
  //                  // error is a Parse.Error with an error code and message.
  //                }
  //              });
  //            }
  //            //console.log(modelList);
  //          }
  //        })
  //    }
  //  }
  //);
};


