//'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.get('/current_user', controller.current);
router.get('/seed_aliens/:level', controller.getSeedAliens);
router.post('/seed_aliens/:level', controller.setSeedAliens);
router.post('/', controller.create);
router.post('/tut', controller.seenTut);
router.get('/has_seen_tut', controller.getSeenTut);
module.exports = router;
