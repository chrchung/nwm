'use strict';


var Parse = require('parse/node').Parse;
var APP_ID = "WEe1kGJydUpoiLzaWE0MAx4q2DAUXqDSZDOFqgHm";
var JavaScriptKey = "CkEhBsgLQdlWHMQBijVUcSYKqsNABCMuygTqP8vt";
Parse.initialize(APP_ID, JavaScriptKey);
// Get list of levels
exports.index = function(req, res) {
  //res.json([]);
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
                  //res.json(levelInfo);
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
                     console.log(alienList);
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




exports.getLevelInfo3 = function(req, res)
{
  var Levels = Parse.Object.extend("Levels");
  var levelQuery = new Parse.Query(Levels);
  levelQuery.equalTo("name", 1);
  var alienList = [];

  levelQuery.first().then(function(results)
  {
      var level = results;
      var modelsRelation = level.relation("model");
      var modelsQuery = modelsRelation.query();
      //console.log(modelQuery);
      return modelsQuery.find().then(function(results)
      {
        var promises = [];

        for (var i = 0; i < results.length; i++) {
          var model = results[i];
          var Model = Parse.Object.extend("Model");
          var Modelquery = new Parse.Query(Model);
          var ModelPointer = {
            __type: "Pointer",
            className: "Models",
            objectId: model.id,
            modelName: model.get("name")

          };
          Modelquery.equalTo("model", ModelPointer);

          promises.push(
            Modelquery.find().then(function (results)
            {
              var attributes = [];
                for (var i = 0; i < results.length; i++)
                {
                  var alien = results[i];
                  attributes[i] = { "Alien": alien.get("Alien"),
                                    "attributes": alien.get("attributes")
                                  };
                }
             alienList.push(attributes);

            }).then(function(){
                    return alienList;},
                    function(error)
                    {alert("Error: " + error.code + " " + error.message)}))
        }
        return Parse.Promise.when(promises);

      }, function(error)
          {alert("Error: " + error.code + " " + error.message)})

  }).then(function(){},
          function(error)
          {alert("Error: " + error.code + " " + error.message)})
};
var o = exports.getLevelInfo3();


