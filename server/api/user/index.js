'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.get('/current', controller.current);
router.post('/', controller.create);
router.get('/all_overall', controller.getAllOverall);

module.exports = router;
