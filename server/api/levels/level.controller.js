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


/**
 * returns the models of this level
 * @param levelname the level to search
 * @param res
 */
function findLevels(req)
{
  var Level = Parse.Object.extend("Levels");
  var query = new Parse.Query(Level);

  query.equalTo("name", req.body.name);

  query.find({
    success: function(level)
    {
      console.log(level[0].get("model"));
      var models =  level[0].get("model");
      return getmodels(models);
    }
    }
  );
}

/**
 * returns an array of models.
 * @param models ParseRelation containing the models.
 */
function getmodels(models)
{
  var modelList = [];
  models.query().find(
    {
      success: function (model) {
        for (var i = 0; i < model.length; i++) {

          modelList.push(model[i].id);
          var req =  {body :{
            __type: "Pointer",
            className: "Models",
            objectId: model[i].id,
            modelName: model[i].get("name")
          }};

          getModelsAttribute(req);

        }
        //console.log(modelList);
        return {"model": modelList};
      }
    })
}
var req = {body: {"name": 1}};
var p = findLevels(req);

/**
 * returns the attributes of the given model.
 * @param modelname the model that requires to retivie its attribute
 * @param res
 */
function getModelsAttribute(req, res)
{
  var Model = Parse.Object.extend("Model");
  var query = new Parse.Query(Model);
  query.equalTo("model", req.body);
  var attributes = [];
  query.find({
    success: function(models) {
      for (var i = 0; i < models.length; ++i) {
        attributes.push(models[i].get("attributes"));

       }
      console.log(attributes);

    },
    error: function (object, error) {
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and message.

    }
  });
}

var req =  {body :{
            __type: "Pointer",
            className: "Models",
            objectId: "AbveglA6l9"
          }};
//var m = getModelsAttribute(req);


exports.getLevelInfo = function(req, res) {
  var level = Parse.Object.extend("Levels");
  var query = Parse.Query(level);
}
