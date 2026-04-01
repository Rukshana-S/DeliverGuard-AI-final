const User = require('../models/User');
const Claim = require('../models/Claim');

const getTier = (points) => {
  if (points >= 500) return 'Diamond';
  if (points >= 200) return 'Gold';
  return 'Silver';
};

const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'worker' })
      .select('name city loyaltyPoints riskScore')
      .lean();

    // count claims per user
    const claimCounts = await Claim.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const claimMap = {};
    claimCounts.forEach((c) => { claimMap[c._id.toString()] = c.count; });

    const ranked = users
      .map((u) => ({
        ...u,
        loyaltyPoints: u.loyaltyPoints || 0,
        riskScore:     u.riskScore     || 0,
        tier:          getTier(u.loyaltyPoints || 0),
        claimsCount:   claimMap[u._id.toString()] || 0,
      }))
      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints || b.claimsCount - a.claimsCount)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    // find current user rank — also return fresh loyaltyPoints
    const myRank = ranked.find((u) => u._id.toString() === req.user._id.toString());

    res.json({ leaderboard: ranked, myRank });
  } catch (err) { next(err); }
};

module.exports = { getLeaderboard };
