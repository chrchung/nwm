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
  var levelInfo = [];
  var levelQuery = Parse.Query("Levels");
  levelQuery.equalTo(name, 1);

  levelQuery.find({
    success: function(results) {
      var level = results;
      var modelRelation = level.relation("model");
      var modelQuery = modelRelation.query();

      modelQuery.find({
        success: function(results) {
          var models = results;

          var i;
          for (i = 0; i < results.length; i++) {
            var alienQuery = Parse.Query("Model");
            alienQuery.equalTo(model, models[i]);
            alienQuery.find({
              success: function(results) {
                levelInfo.push(results)

                if (i == results.length - 1) {
                  res.json(levelInfo);
                };

              },
              error: function(error) {
                alert("Error: " + error.code + " " + error.message);
              }
            });
          };
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });




    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });

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


exports.getLevelInfo2 = function(req, res)
{
  var levelInfo = [];
  var Levels = Parse.Object.extend("Levels");
  var levelQuery = new Parse.Query(Levels);
  levelQuery.equalTo("name", 1);
  var alienList = [];

  levelQuery.find({
    success: function(results)
    {
      var level = results;
      var modelsRelation = level[0].relation("model");
      var modelsQuery = modelsRelation.query();
      //console.log(modelQuery);

      modelsQuery.find(
        {
          success:function(results)
          {
            for (var i =0; i < results.length; i++)
            {
              var model = results[i];
              var Model = Parse.Object.extend("Model");
              var Modelquery = new Parse.Query(Model);
              var ModelPointer = { __type: "Pointer",
                                         className: "Models",
                                         objectId: model.id,
                                         modelName: model.get("name")

                                  };
               Modelquery.equalTo("model", ModelPointer);
               Modelquery.find(
                 {
                   success: function(results)
                   {
                     var attributes = [];
                     for (var i = 0; i < results.length; i++)
                     {
                       var alien = results[i];
                       attributes[i] = {"Alien" : alien.get("Alien"),
                                        "attributes" : alien.get("attributes")};
                     }
                     alienList.push(attributes);
                     console.log(attributes);
                   },
                 error: function(error)
                 {alert("Error: " + error.code + " " + error.message)}})
            }
          },
        error: function(error){alert("Error: " + error.code + " " + error.message)}});
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  })
};

var o = exports.getLevelInfo2();
