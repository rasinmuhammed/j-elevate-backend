const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  users: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      points: { type: Number, default: 0 }, // Points earned by user
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = Leaderboard;
