const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const { generateRoundRobinFixtures, generateInitialKnockoutFixtures } = require('../utils/fixtures');

exports.createTournament = async (req, res) => {
    try {
        const { name, type } = req.body;
        const tournament = new Tournament({ name, type });
        await tournament.save();
        res.status(201).json(tournament);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const tournament = await Tournament.findById(id);
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

        const team = new Team({ name, tournamentId: id });
        await team.save();

        tournament.teams.push(team._id);
        await tournament.save();

        res.status(201).json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.generateFixtures = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findById(id).populate('teams').populate('matches');
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

        const teamIds = tournament.teams.map(t => t._id);
        let fixtures = [];

        if (tournament.type === 'league') {
            fixtures = generateRoundRobinFixtures(teamIds, id);
        } else {
            // Knockout
            if (tournament.matches.length === 0) {
                // Initial Round
                fixtures = generateInitialKnockoutFixtures(teamIds, id);
            } else {
                // Generate Next Round from winners of current latest round
                const latestRound = Math.max(...tournament.matches.map(m => m.round));
                const latestMatches = tournament.matches.filter(m => m.round === latestRound);

                if (latestMatches.some(m => !m.played)) {
                    return res.status(400).json({ error: 'Finish all matches in current round first' });
                }

                if (latestMatches.length === 1) {
                    return res.status(400).json({ error: 'Tournament already finished' });
                }

                const winners = latestMatches.map(m => m.homeScore > m.awayScore ? m.homeTeam : m.awayTeam);
                fixtures = generateInitialKnockoutFixtures(winners, id);
                fixtures.forEach(f => f.round = latestRound + 1);
            }
        }

        const createdMatches = await Match.insertMany(fixtures);
        // If it's the first time, set tournament.matches, otherwise append
        if (tournament.matches.length === 0 || tournament.type === 'league') {
            tournament.matches = createdMatches.map(m => m._id);
        } else {
            tournament.matches.push(...createdMatches.map(m => m._id));
        }
        await tournament.save();

        res.status(201).json(createdMatches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getStandings = async (req, res) => {
    try {
        const { id } = req.params;
        const teams = await Team.find({ tournamentId: id });

        // Sort by: 1. Points, 2. GD, 3. Goals Scored
        const standings = teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goalsFor - a.goalsAgainst;
            const gdB = b.goalsFor - b.goalsAgainst;
            if (gdB !== gdA) return gdB - gdA;
            return b.goalsFor - a.goalsFor;
        });

        res.json(standings);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('teams')
            .populate({
                path: 'matches',
                populate: ['homeTeam', 'awayTeam']
            });
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        res.json(tournament);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ createdAt: -1 });
        res.json(tournaments);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const tournament = await Tournament.findByIdAndUpdate(id, { name }, { new: true });
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        res.json(tournament);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteTournament = async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findById(id);
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

        // Cascade delete: delete all teams and matches associated with this tournament
        await Team.deleteMany({ tournamentId: id });
        await Match.deleteMany({ tournamentId: id });
        await Tournament.findByIdAndDelete(id);

        res.json({ message: 'Tournament and all associated data deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id, teamId } = req.params;
        await Team.findByIdAndDelete(teamId);
        await Tournament.findByIdAndUpdate(id, { $pull: { teams: teamId } });
        res.json({ message: 'Team deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.clearFixtures = async (req, res) => {
    try {
        const { id } = req.params;
        await Match.deleteMany({ tournamentId: id });
        await Tournament.findByIdAndUpdate(id, { matches: [] });

        // Also reset team stats
        await Team.updateMany(
            { tournamentId: id },
            { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
        );

        res.json({ message: 'Fixtures cleared and standings reset' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
