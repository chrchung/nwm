'use strict';

var express = require('express');
var controller = require('./score.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.saveScore);
router.post('/save_for_later', controller.saveForLater);
router.get('/all_overall', controller.getAllOverall);
router.get('/fake_level/:level/:seed', controller.isFake);
router.get('/cur_user_game_score/:level/:game', controller.getCurUserGameScore);
router.get('/in_game_scoreboard/:array_size/:score', controller.getInGameScoreboard);
router.get('/game_scoreboard/:array_size', controller.getGameScoreboard);
router.get('/cur_user_recent', controller.getCurUserRecentScores);
router.get('/cur_user_overall', controller.getCurUserOverall);
router.get('/best_solution/:level', controller.getBestSolution);
router.get('/cur_user_solution/:level', controller.getCurUserSolution);
router.get('/cur_user_recent_game4', controller.getCurUserGame4Solution);
router.post('/save_overall_only', controller.saveOverallOnly);


module.exports = router;
