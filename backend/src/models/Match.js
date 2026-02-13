const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    played: { type: Boolean, default: false },
    isBye: { type: Boolean, default: false },
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    round: { type: Number }
});

module.exports = mongoose.model('Match', MatchSchema);
