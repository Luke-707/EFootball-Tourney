const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const matchController = require('../controllers/matchController');

// Tournament Routes
router.get('/tournaments', tournamentController.getAllTournaments);
router.post('/tournaments', tournamentController.createTournament);
router.get('/tournaments/:id', tournamentController.getTournament);
router.post('/tournaments/:id/teams', tournamentController.addTeam);
router.post('/tournaments/:id/generate-fixtures', tournamentController.generateFixtures);
router.get('/tournaments/:id/standings', tournamentController.getStandings);
router.patch('/tournaments/:id', tournamentController.updateTournament);
router.delete('/tournaments/:id', tournamentController.deleteTournament);
router.delete('/tournaments/:id/teams/:teamId', tournamentController.deleteTeam);
router.post('/tournaments/:id/clear-fixtures', tournamentController.clearFixtures);

// Match Routes
router.post('/matches/:id/result', matchController.recordResult);

module.exports = router;
