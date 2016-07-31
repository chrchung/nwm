
var levelOne = angular.module('nwmApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game/:id',
        templateUrl: 'app/level-one/level-one.html',
        controller: 'LevelOneController'
      });
  });

levelOne.directive('ngRightClick', function($parse) {
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

levelOne.filter('toArray', function() { return function(obj) {
  if (!(obj instanceof Object)) return obj;
  return _.map(obj, function(val, key) {
    return Object.defineProperty(val, '$key', {__proto__: null, value: key});
  });
}});

/*******************************************************************
  DB functions / parsing functions
*******************************************************************/
levelOne.service('database', function(Restangular, $state, aliens) {

  /* Returns alien data given model and alien numbers. */
  this.parseData = function(data, i, j){
    var retVal = _.find(data[i][1], function (alien) {
      var m = alien.modelsName.split(/a|b/)[1].split("_")[0];
      var a = alien.modelsName.split(/a|b/)[1].split("_")[1];
      return (m == (i + 1)) && (a == j);
    });
    return retVal;
  };

  /* Shuffle given array and returns the new array. */
  Array.prototype.shuffle = function(){
    for (var i = 0; i < this.length; i++){
      var a = this[i];
      var b = Math.floor(Math.random() * this.length);
      this[i] = this[b];
      this[b] = a;
    }
  }

  this.shuffleProperties = function() {
    var new_obj = {};
    var keys = getKeys(aliens.alienArray);
    keys.shuffle();
    for (var key in keys){
      if (key == "shuffle") continue; // skip our prototype method
      new_obj[keys[key]] = aliens.alienArray[keys[key]];
    }
    aliens.alienArray = new_obj;
  }

  function getKeys(obj){
    var arr = new Array();
    for (var key in obj)
      arr.push(key);
    return arr;
  }
  //this.getShuffledArray = function(array) {
  //  var len = Object.keys(array).length;
  //  for (var i = len - 1; i > 0; i--) {
  //    var j = Math.floor(Math.random() * (i + 1));
  //    var temp = array[i];
  //    array[i] = array[j];
  //    array[j] = temp;
  //  }
  //  return array;
  //};
});


/*******************************************************************
  Manage arrays of aliens
*******************************************************************/
levelOne.service('aliens', function() {

  this.initAliens = function() {
    this.alienData = [];
    this.properties = {};
    this.zoominAliens = [];
    this.alienArray = {};
  }
});


/*******************************************************************
  Helper functions
*******************************************************************/
levelOne.service('helper', function() {

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
levelOne.service('update',function(helper, bucket, aliens, style) {

  /* Returns an array of illegal aliens. */
  this.updateIllegalAlien = function() {

    // Array of models that are already in bucket
    var models_in_bucket = [];
    for (var i = 0; i < bucket.buckets[bucket.current_bucket].alien.length; i++) {
      var model_num = helper.get_model(bucket.buckets[bucket.current_bucket].alien[i]);
      if (models_in_bucket.indexOf(model_num) == -1) {
        models_in_bucket.push(model_num);
      }
    }

    for (var id in aliens.alienArray) {
      model_num = helper.get_model(id);
      if (models_in_bucket.indexOf(model_num) != -1 && bucket.buckets[bucket.current_bucket].alien.indexOf(id) == -1) {
        aliens.alienArray[id].illegal = 'illegal';
      }
      else {
        aliens.alienArray[id].illegal = 'legal';
      }
    }
  };

  /* Return the new score and gives feedback. */
  this.getNewScore = function(maxModels) {
    // Calculate points for each bucket
    var total_score = 0;
    for (var i = 0; i < bucket.buckets.length; i++) {
      total_score += calculateScoreByBucket(bucket.buckets[i].alien, maxModels);
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
      var cur_properties = aliens.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
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
      var cur_properties = aliens.alienData[alien_list[i].split("_")[0]].alien[alien_list[i].split("_")[1]].prop;
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
      'position': 'fixed',
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
                                'position': 'fixed',
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
                                'position': 'fixed',
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
levelOne.service('style', function(aliens, helper) {

  this.lowLightSimilarAliens = function() {
    for (var id in aliens.alienArray) {
      aliens.alienArray[id].similar = "dissimilar";
    }
  }

  this.highLight = function(alien_id, bucket, method_flag) {
    // Get all aliens in current bucket.
    var members = bucket.alien;

    for (var id in aliens.alienArray) {
      // If it is already in current bucket, we don't want it.
      // if (members.indexOf(id) >= 0) {
      //   continue;
      // }
      if (aliens.zoominAliens.indexOf(id) >= 0) {
        continue;
      }

      var model_num = helper.get_model(id);
      var alien_num = helper.get_alien(id);
      // a list of properties of the current alien
      var cur_properties = aliens.alienData[model_num].alien[alien_num].prop;


      var checkAnyFlag = false;
      var checkAllFlag = true;
      var similarCounter = 0;
      // Loop over all aliens in current group and compare with current alien in outer for loop.
      _.each(members, function(member) { // Each memeber here is an alien ID
        var member_model_num = helper.get_model(member);
        var member_alien_num = helper.get_alien(member);
        var member_props = aliens.alienData[member_model_num].alien[member_alien_num].prop;

        if (!_.isEmpty(_.intersection(cur_properties, member_props))) {
          // If the current alien has a common attribute with a member, we want it for method_flag = 1.
          checkAnyFlag = true;
          similarCounter += (_.intersection(cur_properties, member_props)).length;
        }

        else {
          // If the current alien has no common attribute with a member, we don't want it for method_flag = 2.
          checkAllFlag = false;
        }
      });

      if (
          /* highlight only if alien has at least one same attribute with ANY alien in current bucket*/
          (method_flag == 1 && checkAnyFlag) ||
          /* highlight only if alien has at least one same attribute with ALL aliens in current bucket */
          (method_flag == 2 && checkAllFlag) ||
          /* highlight only if alien’s # of similar attributes across all members of
          current bucket >= the # of members in group */
          (method_flag == 3 && similarCounter >= members.length)
      ) {
        aliens.alienArray[id].similar = 'similar';
        aliens.zoominAliens.push(id);
      }
    }
  };

  this.scrollToItem = function(item) {
    var diff=(item.offsetTop - window.scrollY)/8;
    if (Math.abs(diff) > 1) {
      window.scrollTo(0, (window.scrollY + diff));
      clearTimeout(window._TO);
      window._TO=setTimeout(this.scrollToItem, 30, item);
    } else {
      window.scrollTo(0, item.offsetTop)
    }
  }
});


/*******************************************************************
  Handles buckets, colour array, predefined colours
*******************************************************************/
levelOne.service('bucket', function(style, $timeout, aliens, history) {

  this.initColors = function() {
    this.predefinedColors = {
      'rgba(255, 230, 255, 1)': false,
      'rgba(179, 224, 255, 1)': false,
      'rgba(255, 224, 179, 1)': false,
      'rgba(255, 204, 204, 1)': false,
      'rgba(255, 255, 204, 1)': false,
      'rgba(236, 255, 179, 1)': false,
      'rgba(236, 217, 198, 1)': false,
      'rgba(153, 255, 187, 1)': false,
      'rgba(59, 148, 250, 1)': false,
      'rgba(227, 196, 255, 1)': false,
      'rgba(206, 255, 143, 1)': false,
      'rgba(255, 75, 105, 1)': false,
      'rgba(246, 165, 178, 1)': false,
      'rgba(140, 154, 255, 108)': false,
      'rgba(194, 221, 227, 1)': false,
    'rgba(255, 179, 179, 1)': false,
    'rgba(221, 223, 185, 1)': false,
    'rgba(248, 255, 105, 1)': false,
    'rgba(210, 210, 255, 1)': false,
    'rgba(158, 209, 212, 1)': false,
    'rgba(141, 150, 204, 1)': false,
    'rgba(255, 209, 179, 1)': false,
      'rgba(160, 163, 255, 1)': false,
      'rgba(160, 185, 208, 1)': false,
      'rgba(154, 251, 100, 1)': false,
      'rgba(202, 202, 201, 1)': false,
      'rgba(251, 255, 172, 1)': false,
      'rgba(255, 134, 101, 1)': false,
      'rgba(255, 199, 46, 1)': false,
      'rgba(255, 79, 44, 1)': false,
      'rgba(205, 255, 240, 1)': false,
      'rgba(169, 131, 180, 1)': false,
      'rgba(242, 221, 225, 1)': false,
      'rgba(178, 255, 225, 108)': false,
      'rgba(254, 91, 224, 108)': false,
      'rgba(148, 26, 255, 108)': false,
      'rgba(255, 111, 15, 108)': false,
      'rgba(171, 158, 96, 108)': false,
      'rgba(238, 160, 224, 108)': false,
    };
    this.predefinedColorCounter = 0;
    this.buckets = [];
    this.num_buckets = 0;
    this.current_bucket = 0;
    this.colorArray = [];
  }

  /* Returns an array of all highlighted aliens */
  this.currentBucket = function(curBucket, method_flag) {
    this.current_bucket = curBucket;

    // Free similar aliens
    style.lowLightSimilarAliens();
    aliens.zoominAliens = [];

    // Highlight aliens that are similar to aliens in current bucket
    var cur_alien_list = this.buckets[curBucket].alien;
    for (var j = 0; j < cur_alien_list.length; j++) {
      style.highLight(cur_alien_list[j], this.buckets[curBucket], method_flag);
    }
  };

  /* Update the array of colours and returns. */
  this.addBucket = function() {
    var color = this.getRandomColor();
    this.buckets.push({alien:[], color:color});
    this.num_buckets++;
    var bucket_ind  = this.num_buckets - 1;
    this.colorArray.push(color);
    history.userActions.push("Create bucket " + bucket_ind);
    this.currentBucket(bucket_ind);
    this.orderAlienArray();
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

  this.removeBucket = function(bid) {
    history.userActions.push("Remove bucket " + bid);
    this.updatePredefinedColor(bid);
    this.buckets.splice(bid, 1);
    this.colorArray.splice(bid, 1);
    this.num_buckets--;
  }

  /* Returns a bucket ID which alien_id belongs to */
  this.getBucketByAlienId = function(alien_id) {
    for (var i = 0; i < this.buckets.length; i++) {
      if (aliens.alienArray[alien_id].color == this.buckets[i].color) {
        return i;
      }
    }
  };

  this.orderAlienArray = function() {
    this.orderedIds = [];
    // Mapping id of the first alien in the bucket to list of aliens in the bucket
    var families = {};

    for (var i = 0; i < this.buckets.length; i++) {
      families[this.buckets[i].alien[0]] = this.buckets[i].alien;
    }

    for (var id in aliens.alienArray) {
      if (!aliens.alienArray[id].in) {
        this.orderedIds.push(id);
      }
      else if (id in families) {
        this.orderedIds = this.orderedIds.concat(families[id])
      }
    }
  };
});

levelOne.service('history', function(aliens) {

  this.initHistory = function() {
    this.historyBuckets = [];
    this.historyAliensInBucket = [];
    this.historyAlienId = '';
    this.historyBucketId = '';
    this.historySelectFlag = 0; // 0 means previously selected, 1 means previously unselected, 2 means previously swapped
    this.historyColor = '';
    this.historySwappedBucketId = '';
    this.historyColorArray = [];
    this.userActions = [];
    // 0:'add-alien'
    // 1:'illegal-alien'
    // 2:'create-group'
    // 3:'switch-aliens'
    // 4:'removing alien'
    // 5:'highlight'
    this.tutorials = [false, false, false, false, false, false];
  }
});
