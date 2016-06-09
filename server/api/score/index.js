'use strict';

var express = require('express');
var controller = require('./score.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.saveScore);
router.post('/save_for_later', controller.saveForLater);
router.get('/all_overall', controller.getAllOverall);
router.get('/cur_user_game_score/:level/:game', controller.getCurUserGameScore);
router.get('/game_scoreboard/:level/:game', controller.getGameScoreboard);
router.get('/cur_user_recent', controller.getCurUserRecentScores);
router.get('/best_solution/:level', controller.getBestSolution);
router.get('/cur_user_solution/:level', controller.getCurUserSolution);

module.exports = router;
