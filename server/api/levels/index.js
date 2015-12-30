'use strict';

var express = require('express');
var controller = require('./level.controller');

var router = express.Router();

//router.get('/', controller.index);
router.get('/level/:id', controller.getLevelInfo);
module.exports = router;
