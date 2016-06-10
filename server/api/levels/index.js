'use strict';

var express = require('express');
var controller = require('./level.controller');

var router = express.Router();

//router.get('/', controller.index);
router.get('/level/:id', controller.getLevelInfo);
router.get('/last_unlocked_level', controller.lastUnlockedLevels);
router.get('/getBeat/:id', controller.getScoreToBeat);
module.exports = router;
