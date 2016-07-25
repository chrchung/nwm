
var game2 = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('game2', {
        url: '/game2/:id',
        templateUrl: 'app/game2/game2.html',
        controller: 'game2Controller'
      });
  });

game2.directive('ngRightClick', function($parse) {
  return function(scope, element, attrs) {
    var fn = $parse(attrs.ngRightClick);
    element.bind('contextmenu', function(event) {
      scope.$apply(function() {
        event.preventDefault();
        fn(scope, {$event:event});
      });
    });
  };
});

/*******************************************************************
  DB functions / parsing functions
*******************************************************************/
game2.service('database2', function(Restangular, $state, aliens2) {

  /* Returns alien data given model and alien numbers. */
  this.parseData = function(data, i, j) {
    var resAlien = _.find(data[i][1], function (alien) {
      var m = alien.modelsName.split(/a|b/)[1].split("_")[0];
      var a = alien.modelsName.split(/a|b/)[1].split("_")[1];
      return (m == (i + 1)) && (a == j);
    });
    return resAlien;
  };

  /* Shuffle given array and returns the new array. */
  this.getShuffledArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };
});


/*******************************************************************
  Manage arrays of aliens
*******************************************************************/
game2.service('aliens2', function() {

  this.aliensInBucket = []; //ids of aliens in buckets
  this.alienData = [];
  this.properties = {};

});


/*******************************************************************
  Helper functions
*******************************************************************/
game2.service('helper2', function() {

  // Returns alien num given alien ID of the form 0_0
  this.get_model = function(ID){
    var modelNum = ID.split("_")[0];
    return modelNum;
  };

  // Returns model num given alien ID of the form 0_0
  this.get_alien = function(ID){
    var alienNum = ID.split("_")[1];
    return alienNum;
  };

});


/*******************************************************************
  Functions to update data (i.e. illegal aliens)
*******************************************************************/
game2.service('update2',function(helper2, bucket2, aliens2) {

  /* Returns an array of illegal aliens. */
  this.updateIllegalAlien = function(alienArray, bucketId) {

    bucket2.buckets[bucketId].illegal_alien = [];

    // Array of models that are already in bucket
    var models_in_bucket = [];
    for (var i = 0; i < bucket2.buckets[bucketId].alien.length; i++) {
      var model_num = helper2.get_model(bucket2.buckets[bucketId].alien[i]);
      if (models_in_bucket.indexOf(model_num) == -1) {
        models_in_bucket.push(model_num);
      }
    }

    var ids = Object.keys(alienArray)
    for (var i = 0; i < ids.length; i++) {
      var alien_id = ids[i];
      model_num = helper2.get_model(alien_id);
      if (models_in_bucket.indexOf(model_num) != -1 && bucket2.buckets[bucketId].alien.indexOf(alien_id) == -1) {
        bucket2.buckets[bucketId].illegal_alien.push(alien_id);
        alienArray[alien_id].illegal = "illegal";
      }
      else {
        alienArray[alien_id].illegal = "legal";
      }
    }
    return alienArray;
  };

  /* Return the new score and gives feedback. */
  this.getNewScore = function(maxModels) {
    // Calculate points for each bucket
    var total_score = 0;
    console.log(aliens2.properties);
    for (var i = 0; i < bucket2.buckets.length; i++) {
      total_score += calculateScoreByBucket(bucket2.buckets[i].alien, maxModels);
    }
    return total_score;
  };

  /* Calculate the score of the bucket that contains the
     aliens in alien_list
     alien_list: [{model, alien} ...]  */
  var calculateScoreByBucket = function (alien_list, maxModels) {
    var num_dup  = {};   // a map from j -> number of properties that appear in j aliens in the bucket
    var prop_list = [];  // a list of unique properties in the bucket
    for (var i = 0; i < alien_list.length; i++) {
      // a list of properties of the current alien
      var aid = alien_list[i];
      var cur_properties = aliens2.alienData[helper2.get_model(aid)].alien[helper2.get_alien(aid)].prop;
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
      score += Math.ceil((Math.pow(j, 2) * num_dup[j])/(Math.pow(maxModels, 2)*prop_list.length) * 10000);
    }
    return score;
  };

  /* Returns the number of aliens in the given bucket
     that have the given attribute. */
  var compare = function(prop_id, alien_list) {
    var num_occurrence = 0;
    for (var i = 0; i < alien_list.length; i++) {
      var cur_properties = aliens2.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
      if (cur_properties.indexOf(prop_id) != -1) {
        num_occurrence++;
      }
    }
    return num_occurrence;
  };

  this.showSmallFeedback = function(oldScore, newScore, alien_id) {
    //var element = document.getElementById(alien_id);
    //var coord_x = element.offsetLeft - element.scrollLeft + 20;
    //var coord_y = element.offsetTop - element.scrollTop - 20;

    var coord_x = Math.floor(window.innerWidth/2) - 300;
    var coord_y = Math.floor(window.innerHeight/2) - 100;

    $("#feedback").css({'font-family': 'Lovelo Black',
      'text-shadow': 'none',
      'position': 'absolute',
      'left': coord_x + 170,
      'top': coord_y + 60,
      'font-size': '100px',
      'z-index': '99'});

    // Small feedback
    if (oldScore < newScore) {
      var diff = newScore - oldScore;
      $("#feedback").html(diff);
      $("#small_feedback").removeClass('glyphicon glyphicon-arrow-down');
      $("#small_feedback").addClass('glyphicon glyphicon-arrow-up animated rubberBand');
      $("#small_feedback").css({'color': '#77dd77',
                                'position': 'absolute',
                                'left': coord_x,
                                'top': coord_y,
                                'font-size': '100px',
                                'z-index': '99'});
      $("#feedback").css({'color': '#77dd77'});
      $("#feedback").show().delay(500).fadeOut();
      $("#small_feedback").show().delay(500).fadeOut();
    }
    else if (oldScore > newScore) {
      var diff = oldScore - newScore;
      $("#feedback").html(diff);
      $("#small_feedback").removeClass('glyphicon glyphicon-arrow-up');
      $("#small_feedback").addClass('glyphicon glyphicon-arrow-down animated rubberBand');
      $("#small_feedback").css({'color': '#f63c3a',
                                'position': 'absolute',
                                'left': coord_x,
                                'top': coord_y,
                                'font-size': '100px',
                                'z-index': '99'});
      $("#feedback").css({'color': '#f63c3a'});
      $("#feedback").show().delay(500).fadeOut();
      $("#small_feedback").show().delay(500).fadeOut();
    }
  };

  this.showBigFeedback = function(oldScore, newScore, greedyScore, highestScore) {

    var higher = Math.max(greedyScore, highestScore);

    if (oldScore < newScore) {
      if (newScore >= higher * 5 / 5) {
        this.feedback = "Best!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (newScore >= higher * 4 / 5) {
        this.feedback = "Amazing!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (newScore >= higher * 3 / 5) {
        this.feedback = "Wow!";
        $("#feedback").show().delay(500).fadeOut();
      }
      else if (newScore >= higher * 2 / 5) {
        this.feedback = "Good!";
        $("#feedback").show().delay(500).fadeOut();
      }
    }
  };
});


/*******************************************************************
  Handles highlighting
*******************************************************************/
game2.service('style2', function(aliens2, helper2) {

  /* highlight similar aliesn and returns the array */
  this.highLight = function(alien_id, alienArray, similar_aliens, bucket) {
    var current_prop = aliens2.alienData[helper2.get_model(alien_id)].alien[helper2.get_alien(alien_id)].prop;
    var ids = Object.keys(alienArray);

    for (var j = 0; j < ids.length; j++) {
      var model_num = helper2.get_model(ids[j]);
      var alien_num = helper2.get_alien(ids[j]);

      // if (bucket2.illegal_alien.indexOf(ids[j]) >= 0) {
      //   continue;
      // }

      // a list of properties of the current alien
      var cur_properties = aliens2.alienData[model_num].alien[alien_num].prop;
      for (var k = 0; k < cur_properties.length; k++) {
        if (current_prop.indexOf(cur_properties[k]) != -1) {
          similar_aliens[ids[j]] = alienArray[ids[j]];
          break;
        }
      }
    }
    return similar_aliens;
  };

});


/*******************************************************************
  Handles buckets, colour array, predefined colours
*******************************************************************/
game2.service('bucket2', function(style2, $timeout, aliens2) {

  this.initColors = function() {
    this.predefinedColors = {
    'rgba(230, 250, 255, 0.8)': false,
    'rgba(255, 230, 255, 0.8)': false,
    'rgba(179, 224, 255, 0.8)': false,
    'rgba(255, 224, 179, 0.8)': false,
    'rgba(255, 204, 204, 0.8)': false,
    'rgba(255, 255, 204, 0.8)': false,
    'rgba(236, 255, 179, 0.8)': false,
    'rgba(236, 217, 198, 0.8)': false,
    'rgba(153, 255, 187, 0.8)': false
    };
    this.predefinedColorCounter = 0;
    this.buckets = [];
    this.num_buckets = 0;
    this.current_bucket = 0;
  }

  this.updateBucket = function() {
    $("#current-group-color").css("background-color", this.buckets[this.current_bucket].color);
    for (var i = 0; i < this.buckets.length; i++) {
      if (i != this.current_bucket) {
        $("#color_block_" + i).removeClass("current_bucket");
        $("#color_block_" + i).html("");
      }
      else {
        $("#color_block_" + i).addClass("current_bucket");
        $("#color_block_" + i).html(" ✓");
      }
    }
  };

  /* Returns an array of all highlighted aliens */
  this.currentBucket = function(curBucket, alienArray) {
    this.current_bucket = curBucket;

    // Highlight aliens that are similar to aliens in current bucket
    var cur_alien_list = this.buckets[curBucket].alien;
    var similar_aliens = {};
    for (var j = 0; j < cur_alien_list.length; j++) {
      similar_aliens = style2.highLight(cur_alien_list[j], alienArray, similar_aliens, this.buckets[curBucket]);
    }

    this.updateBucket();

    return similar_aliens;
  };

  /* Update the array of colours and returns. */
  this.addBucket = function(colorArray, alienArray) {
    // Cannot add a new bucket
    if (this.num_buckets > 0 && this.buckets[this.num_buckets - 1].alien.length == 0) {
      $(".colour-error").css("top", $(".add-colour").position().top - 20);
      $(".colour-error").css("left", $(".add-colour").position().left - 100);
      $(".colour-error").show().delay(1000).fadeOut();
    } else {
      var color = this.getRandomColor();
      this.buckets.push({alien:[], illegal_alien:[], color:color});
      this.num_buckets++;

      // TODO: fix this to have a unique id, might cause a bug
      var bucket_ind  = this.num_buckets - 1;
      colorArray.push(this.buckets[bucket_ind].color);

      this.currentBucket(bucket_ind, alienArray);

      $timeout(function() {
        angular.element('#color_block_' + bucket_ind).triggerHandler('click');
      }, 0);
    }

    return colorArray;
  };

  this.getRandomColor = function() {
    if (this.predefinedColorCounter != this.predefinedColors.length) {
      for (var color in this.predefinedColors) {
        // Colour available
        if (!this.predefinedColors[color]) {
          this.predefinedColors[color] = true;
          this.predefinedColorCounter++;
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
  };

  /* Update predefined colours when bucket_id is removed */
  this.updatePredefinedColor = function(bucket_id) {
    if (this.predefinedColors[this.buckets[bucket_id].color] == true) {
      this.predefinedColors[this.buckets[bucket_id].color] = false;
      this.predefinedColorCounter--;
    }
  };

  /* Returns a bucket ID which alien_id belongs to */
  this.getBucketByAlienId = function(alien_id) {
    for (var i = 0; i < this.buckets.length; i++) {
      for (var j = 0; j < this.buckets[i].alien.length; j++) {
        if (this.buckets[i].alien[j] == alien_id) {
          return i;
        }
      }
    }
  };

});

game2.service('history2', function(bucket, aliens) {
  this.historyBuckets = [];
  this.historyAliensInBucket = [];
  this.historyAlienId = '';
  this.historyBucketId = '';
  this.historySelectFlag = 0; // 0 means previously selected, 1 means previously unselected, 2 means previously swapped
  this.historyColor = '';
  this.historySwappedBucketId = '';
  this.historyColorArray = [];
});
