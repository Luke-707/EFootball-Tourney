const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['league', 'knockout'], default: 'league' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
