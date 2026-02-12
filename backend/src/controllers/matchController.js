const Match = require('../models/Match');
const Team = require('../models/Team');

exports.recordResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { homeScore, awayScore } = req.body;

        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ error: 'Match not found' });

        const homeTeam = await Team.findById(match.homeTeam);
        const awayTeam = await Team.findById(match.awayTeam);

        // If match was already played, reverse the previous stats first
        if (match.played) {
            homeTeam.played -= 1;
            homeTeam.goalsFor -= match.homeScore;
            homeTeam.goalsAgainst -= match.awayScore;
            if (match.homeScore > match.awayScore) {
                homeTeam.won -= 1;
                homeTeam.points -= 3;
            } else if (match.homeScore === match.awayScore) {
                homeTeam.drawn -= 1;
                homeTeam.points -= 1;
            } else {
                homeTeam.lost -= 1;
            }

            awayTeam.played -= 1;
            awayTeam.goalsFor -= match.awayScore;
            awayTeam.goalsAgainst -= match.homeScore;
            if (match.awayScore > match.homeScore) {
                awayTeam.won -= 1;
                awayTeam.points -= 3;
            } else if (match.homeScore === match.awayScore) {
                awayTeam.drawn -= 1;
                awayTeam.points -= 1;
            } else {
                awayTeam.lost -= 1;
            }
        }

        // Apply new results
        match.homeScore = homeScore;
        match.awayScore = awayScore;
        match.played = true;
        await match.save();

        // Update Home Team with new stats
        homeTeam.played += 1;
        homeTeam.goalsFor += homeScore;
        homeTeam.goalsAgainst += awayScore;
        if (homeScore > awayScore) {
            homeTeam.won += 1;
            homeTeam.points += 3;
        } else if (homeScore === awayScore) {
            homeTeam.drawn += 1;
            homeTeam.points += 1;
        } else {
            homeTeam.lost += 1;
        }
        await homeTeam.save();

        // Update Away Team with new stats
        awayTeam.played += 1;
        awayTeam.goalsFor += awayScore;
        awayTeam.goalsAgainst += homeScore;
        if (awayScore > homeScore) {
            awayTeam.won += 1;
            awayTeam.points += 3;
        } else if (homeScore === awayScore) {
            awayTeam.drawn += 1;
            awayTeam.points += 1;
        } else {
            awayTeam.lost += 1;
        }
        await awayTeam.save();

        res.json(match);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
