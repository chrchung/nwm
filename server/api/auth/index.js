'use strict';

var express = require('express');
var controller = require('./auth.controller');

var router = express.Router();

router.post('/login', controller.login);
router.post('/activate', controller.activate);
router.get('/logout', controller.logout);
router.get('/user_data', controller.userData);


module.exports = router;
