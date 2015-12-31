'use strict';

var express = require('express');
var controller = require('./score.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.saveScore);


module.exports = router;
