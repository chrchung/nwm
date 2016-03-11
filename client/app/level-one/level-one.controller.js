angular.module('nwmApp').controller('LevelOneController', function($scope, Restangular, $stateParams, $state) {
  $scope.alienData = [];
  $scope.buckets = [];
  $scope.num_buckets = 0;  // number of added buckets
  $scope.alienArray = [];
  $scope.aliensInBucket = []; //ids of aliens in buckets
  $scope.score = 0;
  $scope.prev_score = $scope.score;
  $scope.current_bucket = 0;
  $scope.properties = {};
  $scope.selectedAliens = [];
  $scope.colorArray = [];
  $scope.dragged = false;  // Disable click event when start dragging
  $scope.pageslide = false;
  $scope.zoominAliens = [];
  $scope.checked = false;
  $scope.colorCounter;
  $scope.predefinedColors = {
  'rgba(230, 250, 255, 1)': false,
  'rgba(255, 230, 255, 1)': false,
  'rgba(179, 224, 255, 1)': false,
  'rgba(255, 224, 179, 1)': false,
  'rgba(255, 204, 204, 1)': false,
  'rgba(255, 255, 204, 1)': false,
  'rgba(236, 255, 179, 1)': false,
  'rgba(236, 217, 198, 1)': false,
  'rgba(153, 255, 187, 1)': false
};
$scope.predefinedColorCounter = 0;


  var updateIllegalAlien = function(bucket){

    $scope.buckets[bucket].illegal_alien = [];

    // Array of models that are already in bucket
    var models_in_bucket = [];
    for (var i = 0; i < $scope.buckets[bucket].alien.length; i++) {
      var model_num = $scope.get_model($scope.buckets[bucket].alien[i]);
      if (models_in_bucket.indexOf(model_num) == -1) {
        models_in_bucket.push(model_num);
      }
    }

    for (var i = 0; i < $scope.alienArray.length; i++) {
      var alien_id = $scope.alienArray[i].id;
      model_num = $scope.get_model(alien_id);
      if (models_in_bucket.indexOf(model_num) != -1 && $scope.buckets[bucket].alien.indexOf(alien_id) == -1) {

        $("#" + alien_id).attr('class', 'illegal_alien');
        //$("#" + alien_id).click(function() {
        //  $("#" + alien_id).html('ng-click', 'false');
        //});
        $scope.buckets[bucket].illegal_alien.push(alien_id);
        //}
      }

      else {
        $("#" + alien_id).attr('class', "model" + model_num);
      }
    }
  };

  $scope.currentBucket = function(bucket) {
    $scope.current_bucket = bucket;

    // Lowlight all aliens
    $scope.lowLight();

    // Highlight aliens that similar to aliens in current bucket
    var cur_alien_list = $scope.buckets[bucket].alien;
    for (var j = 0; j < cur_alien_list.length; j++) {
      $scope.highLight(cur_alien_list[j]);
    }

    updateIllegalAlien(bucket);
    for (var i = 0; i < $scope.buckets.length; i++) {
      if (i != bucket) {
        $("#color_block_" + i).removeClass("current_bucket");
        $("#color_block_" + i).html("");
      }
      else {
        $("#color_block_" + i).addClass("current_bucket");
        $("#color_block_" + i).html("✓");
      }
    }
  };


  $scope.get_model = function(id){
    var modelNum = id.split("_")[0];
    return modelNum;
  };
  $scope.get_alien = function(id){
    var alienNum = id.split("_")[1];
    return alienNum;
  };


  function getRandomColor() {
    if ($scope.predefinedColorCounter != $scope.predefinedColors.length) {
      for (var color in $scope.predefinedColors) {
        // Colour available
        if (!$scope.predefinedColors[color]) {
          $scope.predefinedColors[color] = true;
          $scope.predefinedColorCounter++;
          return color;
        }
      }
    }
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  $(document).ready(function(){
    // Add the first bucket
    var init_color = getRandomColor();
    $scope.buckets.push({alien:[], illegal_alien:[], color:init_color});
    $scope.colorArray.push({color:init_color});
    $scope.num_buckets++;


    // Current level
    $scope.cur_level = $stateParams.id;

    // Request data from the server
    Restangular.all('api/levels/level/' + $scope.cur_level).getList().then((function (data) {
      $scope.maxModels = data.length;       // number of models
      $scope.maxAliens = data[0].length;       // number of aliens in a model
      var parseData = function(model, alien){
        for (var i = 0; i < $scope.maxModels; i++){
          for (var j = 0; j < $scope.maxAliens; j++){
            // modelsName is a string in the form of 'level4b6_9'
            if((data[i][j].modelsName).indexOf('a') >= 0){
              $scope.cur_game = 1;
            } else{
              $scope.cur_game = 2;
            }

            var split_id = data[i][j].modelsName.split(/a|b/)[1];
            if (split_id.split("_")[0] == model && split_id.split("_")[1] == alien){
              return data[i][j];
            }
            else{
              continue;
            }}}}
      for (var i = 0; i < $scope.maxModels; i++){
        $scope.alienData.push({model: i, alien: []});
        for (var j = 0; j < $scope.maxAliens; j++){
          var parsed_data = parseData(i, j);
          $scope.properties[i + "_" + j] = parsed_data.attributes;
          $scope.alienArray.push({id: i + "_" + j, model: "model" + i, alien: j, url: parsed_data.Alien.url});
          $scope.alienData[i].alien.push({alien:j,
            prop: $scope.properties[i + "_" + j]});
        }
        $scope.get_highest_score();
        $scope.get_greedy();
        //$scope.newGroup();
        shuffleArray($scope.alienArray);
      }

      $scope.getUrl = function(model, alien){
        return parseData(model, alien).Alien.url;
      }

      // Set current bucket to index 0
      $scope.currentBucket(0);
      $('#new_group').attr('disabled', true);

    }), function (err) {
      alert("Unexpected error occured");
    });
  });

  function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while(element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
  }


  // Score calculator
  var calculateScore = function(alien_id) {
    // Calculate points for each bucket
    var total_score = 0;
    for (var i = 0; i < $scope.buckets.length; i++) {
      total_score += calculateScoreByBucket($scope.buckets[i].alien);
    }
    $scope.prev_score = $scope.score;
    var element = document.getElementById(alien_id);
    var coord_x = element.offsetLeft - element.scrollLeft + 20;
    var coord_y = element.offsetTop - element.scrollTop - 20;

        // Small feedback
          if ($scope.score < total_score) {
            $("#small_feedback").removeClass('glyphicon glyphicon-arrow-down');
            $("#small_feedback").addClass('glyphicon glyphicon-arrow-up animated rubberBand');

            $("#small_feedback").css({'color': 'rgb(255,101,101)'});
            $("#small_feedback").css({'position': 'absolute'});
            $("#small_feedback").css({'left': coord_x});
            $("#small_feedback").css({'top': coord_y});
            $("#small_feedback").css({'font-size': '100px'});
            $("#small_feedback").css({'z-index': '99'});
            $("#small_feedback").show().delay(500).fadeOut();

            }
        else if ($scope.score > total_score) {
            $("#small_feedback").removeClass('glyphicon glyphicon-arrow-up');
            $("#small_feedback").addClass('glyphicon glyphicon-arrow-down');
            $("#small_feedback").css({'color': 'rgb(98,133,255)'});
            $("#small_feedback").css({'position': 'absolute'});
            $("#small_feedback").css({'left': coord_x});
            $("#small_feedback").css({'top': coord_y});
            $("#small_feedback").css({'z-index': '99'});
            $("#small_feedback").show().delay(500).fadeOut();
          }

    // Feedback
    var higher = Math.max($scope.beat, $scope.highest_score);

    if ($scope.score < total_score) {
      if (total_score >= higher * 5 / 5) {
        $scope.feedback = "Best!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (total_score >= higher * 4 / 5) {
        $scope.feedback = "Amazing!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (total_score >= higher * 3 / 5) {
        $scope.feedback = "Wow!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (total_score >= higher * 2 / 5) {
        $scope.feedback = "Good!";
        $("#feedback").show().delay(500).fadeOut();
      }
    }

    $scope.score = total_score;
  }

  // Calculate the score of the bucket that contains the
  // aliens in alien_list
  // alien_list: [{model, alien} ...]
  var calculateScoreByBucket = function (alien_list) {
    var num_dup  = {};   // a map from j -> number of properties that appear in j aliens in the bucket
    var prop_list = [];  // a list of unique properties in the bucket
    for (var i = 0; i < alien_list.length; i++) {
      // a list of properties of the current alien
      var cur_properties = $scope.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
      for (var k = 0; k < cur_properties.length; k++) {
        if (prop_list.indexOf(cur_properties[k]) == -1) {
          // the property is not in prop_list yet
          var compare_result = compare(cur_properties[k], alien_list);
          if (compare_result >= 2) {
            // the property appears in more than one alien in the bucket
            if (num_dup[compare_result] == null) {
              // value of 'j' is not in num_dup yet
              num_dup[compare_result] = 1;
            } else {
              num_dup[compare_result]++;
            }
          }
          prop_list.push(cur_properties[k]);
        }
      }
    }

    var score = 0;
    for (var j in num_dup) {
      score += Math.ceil((Math.pow(j, 2) * num_dup[j])/(Math.pow($scope.maxModels, 2)*prop_list.length) * 10000);
    }

    return score;
  };


  // Returns the number of aliens in the given bucket
  // that have the given attribute
  var compare = function(prop_id, alien_list) {
    var num_occurrence = 0;
    for (var i = 0; i < alien_list.length; i++) {
      var cur_properties = $scope.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
      if (cur_properties.indexOf(prop_id) != -1) {
        num_occurrence++;
      }
    }
    return num_occurrence;
  };



  $scope.ifNotLast = function(id){
    if(id == $scope.num_buckets - 1){
      return false;
    } else{
      return true;
    }
  };


  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  $scope.shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    // While there remain elements to shuffle
    while (0 !== currentIndex) {

      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  };

  $scope.selectedAlien = function (alien_id) {
    var url = $scope.getUrl($scope.get_model(alien_id), $scope.get_alien(alien_id));
    $("#img-container").html("<img width='300px' src='" + url + "' />");
  };

  $scope.highLight = function (alien_id) {
    var current_prop = $scope.alienData[alien_id.split("_")[0]].alien[alien_id.split("_")[1]].prop;

      for (var j = 0; j < $scope.alienArray.length; j++) {
        var model_num = $scope.alienArray[j].id.split("_")[0];
        var alien_num = $scope.alienArray[j].id.split("_")[1];

        // a list of properties of the current alien
        var cur_properties = $scope.alienData[model_num].alien[alien_num].prop;
        for (var k = 0; k < cur_properties.length; k++) {
          if (current_prop.indexOf(cur_properties[k]) != -1) {
            $("#" + $scope.alienArray[j].id).css('box-shadow', 'rgb(255, 255, 255) 0 0 10px');
            $("#" + $scope.alienArray[j].id).css('border-radius', '10px');
          }
        }
      }
  }

  $scope.lowLight = function () {
    for (var j = 0; j < $scope.alienArray.length; j++) {
      $("#" + $scope.alienArray[j].id).css('box-shadow', 'none');
    }

  }


  $scope.addBucket = function() {
    if ($scope.buckets.length == 0 || $scope.buckets[$scope.num_buckets - 1].alien.length == 0) {
      $(".colour-error").show().delay(1000).fadeOut();
      // alert("You have not chosen any alien for the last bucket!");
    } else {
      var color = getRandomColor();
      $scope.buckets.push({alien:[], illegal_alien:[], color:color});
      $scope.num_buckets++;
      var bucket_ind  = $scope.num_buckets - 1;
      $scope.colorArray.push({color:$scope.buckets[bucket_ind].color});
    }
  };


  ////Add the droppable bucket id to the alienData of the alien
  //$scope.onDrop = function(event, ui) {
  //  var alienId = ui.draggable.attr('id');
  //  var bucketId = $(event.target).attr('id');
  //  var bucket = bucketId.split("_")[1];
  //
  //  if ($scope.buckets[bucket].illegal_alien.indexOf(alienId) != -1) {
  //    alert("Illegal movement!");
  //    return false;
  //  }
  //
  //  $scope.aliensInBucket.push(alienId);
  //
  //  $scope.buckets[bucket].alien.push(alienId);
  //  if(bucket == $scope.num_buckets - 1){
  //    $scope.addBucket();
  //  }
  //
  //  //// remove the added alien id from alienArray
  //  //for (i in $scope.alienArray) {
  //  //  if ($scope.alienArray[i].id == alienId) {
  //  //    $scope.alienArray.splice(i, 1); // remove it
  //  //  }
  //  //}
  //
  //  updateIllegalAlien(bucket);
  //  $scope.currentBucket(bucket);
  //  calculateScore();
  //};

  //$scope.putBackAlien = function($event, alienId) {
  //
  //  var id = $($event.target).parent().parent().attr('id');
  //  var bucket = id.split("_")[1];
  //  var modelNum = $scope.get_model(alienId);
  //
  //  $scope.aliensInBucket.splice($scope.aliensInBucket.indexOf(alienId), 1);
  //  $scope.buckets[bucket].alien.splice($scope.buckets[bucket].alien.indexOf(alienId), 1);
  //
  //  if($scope.buckets[bucket].alien.length == 0) {
  //    $scope.num_buckets--;
  //    $scope.buckets.splice(bucket, 1);
  //  }
  //
  //  updateIllegalAlien(bucket);
  //  calculateScore();
  //};

  //$scope.deleteBucket = function($event) {
  //  var id = $($event.target).parent().attr('id');
  //  var bucket = id.split("_")[1];
  //
  //  if($scope.buckets[bucket].alien.length>0){
  //    for (var m = 0; m <  $scope.buckets[bucket].alien.length; m++){
  //      var alienId = $scope.buckets[bucket].alien[m];
  //      var modelNum = $scope.get_model(alienId);
  //
  //      $scope.aliensInBucket.splice($scope.aliensInBucket.indexOf(alienId), 1);
  //      //$scope.alienArray.push({id: modelNum + "_" + alienNum, model: "model" + modelNum, alien: alienNum});
  //      $("#" + alienId).attr('class', "model" + modelNum);
  //    }
  //  }
  //  // Remove the bucket
  //  $scope.buckets.splice(id.substring(id.length-1, id.length),1);
  //  $scope.num_buckets--;
  //
  //  calculateScore();
  //};

  // $("#menu").hide();
  // $("#overlay").hide();
  // $scope.toggleMenu = function() {
  //   $("#overlay").toggle();
  //   $("#menu").toggle("200");
  // }

  $scope.buttonReq = '';
  $scope.togglePopup = function(msg, req) {
    $("#overlay").toggle();
    $scope.buttonReq = req;
    $(".alert-msg").html(msg);
    $("#popup").toggle();
  }

  $scope.handleButtonRequest = function() {
    if ($scope.buttonReq == 'submit') {
      $scope.saveScore();
    }
    else if ($scope.buttonReq == 'quit') {
      $scope.quit();
    }
  }

  // Save the score to the database
  $scope.saveScore = function () {
    Restangular.all('/api/scores/').post(
      {score: $scope.score, game: $scope.cur_game, level: parseInt($scope.cur_level)}).then(
      (function (data) {
        $state.go('levelcomplete', {level_id: parseInt($scope.cur_level), game_id: $scope.cur_game, score: $scope.score});
      }), function (err) {
      });
  }

  $scope.logout = function () {
    Restangular.all('api/auths/logout').post(
    ).then((function (data) {
        $state.go('main');
      }), function (err) {

      });
  }

  $scope.quit = function (){
    $state.go('scoreboard');
  }


  $scope.selectAlien = function (alien_id) {
    // Illegal Aliens
    if ($scope.buckets[$scope.current_bucket].illegal_alien.indexOf(alien_id) != -1) {
      return;
    }
    // Aliens that in other buckets, can be switched to current bucket when being clicked
    else if ($scope.aliensInBucket.indexOf(alien_id) != -1 && $scope.buckets[$scope.current_bucket].alien.indexOf(alien_id) == -1) {
      for (var i = 0; i < $scope.buckets.length; i++) {
        for (var j = 0; j < $scope.buckets[i].alien.length; j++) {
          if ($scope.buckets[i].alien[j] == alien_id) {
            var bucket_id = i;
            break;
          }
        }
      }

      $scope.buckets[bucket_id].alien.splice($scope.buckets[bucket_id].alien.indexOf(alien_id), 1);
      $scope.buckets[$scope.current_bucket].alien.push(alien_id);
      $("#" + alien_id).css( "background-color", $scope.buckets[$scope.current_bucket].color);
      // $("#" + alien_id).css( "border", "3px solid" + $scope.buckets[$scope.current_bucket].color);
      // $("#" + alien_id).css( "border-radius", "15px");

      if($scope.buckets[bucket_id].alien.length == 0 && $scope.buckets.length > 1) {
        $scope.buckets.splice(bucket_id, 1);
        $scope.colorArray.splice(bucket_id, 1);
        $scope.num_buckets--;


        //updateIllegalAlien(bucket_id);
        if ($scope.current_bucket > bucket_id) {
          $scope.current_bucket -= 1;
          updateIllegalAlien($scope.current_bucket);
        }
      } else {
        updateIllegalAlien($scope.current_bucket);
      }

      calculateScore(alien_id);

    }

    // Normal aliens
    else {
      //Deselect aliens
      if (!$scope.dragged) {
        var ind = $scope.selectedAliens.indexOf(alien_id);
        if (ind >= 0) {
          $("#" + alien_id).css( "background-color", "rgba(255,255,255,.5)");
          // $("#" + alien_id).css( "border", "0px");

          $scope.selectedAliens.splice(ind, 1);

          // Remove the alien from the bucket
          for (var i = 0; i < $scope.buckets.length; i++) {
            for (var j = 0; j < $scope.buckets[i].alien.length; j++) {
              if ($scope.buckets[i].alien[j] == alien_id) {
                var bucket_id = i;
                break;
              }
            }
          }
          //alert(bucket_id);

          $scope.aliensInBucket.splice($scope.aliensInBucket.indexOf(alien_id), 1);
          $scope.buckets[bucket_id].alien.splice($scope.buckets[bucket_id].alien.indexOf(alien_id), 1);

          if($scope.buckets[bucket_id].alien.length == 0 && $scope.buckets.length > 1) {
            // Check if removing a predefined color
            if (Object.keys($scope.predefinedColors).indexOf($scope.buckets[bucket_id].color) != -1) {
              $scope.predefinedColors[$scope.buckets[bucket_id].color] = false;
              $scope.predefinedColorCounter--;
            }
            $scope.buckets.splice(bucket_id, 1);
            $scope.colorArray.splice(bucket_id, 1);
            $scope.num_buckets--;


            //updateIllegalAlien(bucket_id);
            if ($scope.current_bucket >= bucket_id) {
              $scope.current_bucket -= 1;
              updateIllegalAlien($scope.current_bucket);
            }

          } else {
            updateIllegalAlien($scope.current_bucket);
          }

          calculateScore(alien_id);
          $scope.currentBucket($scope.current_bucket);
        }

        // Select aliens
        else {
          //if ($scope.selectedAliens.length == 8) {
          //  alert("Can only select 8 aliens!");
          //  return 0;
          //}
          $scope.selectedAliens.push(alien_id);
          $scope.aliensInBucket.push(alien_id);
          $scope.buckets[$scope.current_bucket].alien.push(alien_id);
          $("#" + alien_id).css( "background-color", $scope.buckets[$scope.current_bucket].color);
          // $("#" + alien_id).css( "border", "3px solid" + $scope.buckets[$scope.current_bucket].color);
          // $("#" + alien_id).css( "border-radius", "15px");

          updateIllegalAlien($scope.current_bucket);
          calculateScore(alien_id);
          $scope.currentBucket($scope.current_bucket);

        }
      }
      $scope.dragged = false;
    }

    if ($scope.buckets.length == 0 || $scope.buckets[$scope.num_buckets - 1].alien.length == 0) {
      $('#new_group').attr('disabled', true);
    } else {
      $('#new_group').attr('disabled', false);
    }

  }



  $scope.newGroup = function() {
    $scope.addBucket();
    $('#new_group').attr('disabled', true);

  }


  $scope.showGroup = function(alien_id) {
    for (var i = 0;i< $scope.buckets.length; i++) {
      if ($scope.buckets[i].alien.indexOf(alien_id) != -1) {
        $scope.currentBucket(i);
      }
    }
  }



  $scope.get_highest_score = function (){
    Restangular.all('api/scores/game_scoreboard/' + parseInt($scope.cur_level) + '/' + $scope.cur_game)
      .getList().then(function (serverJson) {
        $scope.highest_score = serverJson[0].score;
      });
  }
  $scope.get_greedy = function() {
    Restangular.all('api/levels/getBeat/' + parseInt($scope.cur_level) + '/' + parseInt($scope.cur_game))
      .getList().then(function (serverJson) {
        $scope.beat = serverJson[0].scoreToBeat;
      });
  }

  // ZOOMING

  // TODO: Add zoomin icon
  $scope.onDropZoom = function(event, ui) {
    var alien_id = ui.draggable.attr('id');
    var id = $scope.get_alien(alien_id);
    var model = $scope.get_model(alien_id);

    var ind = $scope.zoominAliens.indexOf(alien_id);

    // Already in the zoom-in list
    if (ind < 0) {
      $scope.zoominAliens.push(alien_id);
      $("#" + alien_id).css('box-shadow', 'rgb(178,34,34) 0 0 10px');
      $("#" + alien_id).css('border-radius', '10px');
      //$("#" + alien_id).css('outline-width', '1px');
      //$("#" + alien_id).css('outline-color', 'red');
      //$("#" + alien_id)overlay;
    }

    $scope.dragged = false;
  };

  $scope.onStart = function(event) {
    $scope.dragged = true;
  };

  $scope.togglePageslide = function() {
    $scope.checked = !$scope.checked
  }

  $scope.unzoomAlien = function(id) {
    var ind = $scope.zoominAliens.indexOf(id);
    $scope.zoominAliens.splice(ind, 1);
    $("#" + id).css('box-shadow', 'none');
    //$("#" + id).removeClass("zoomin-small-alien");
  }


});
