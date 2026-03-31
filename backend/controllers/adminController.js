const User    = require('../models/User');
const Policy  = require('../models/Policy');
const Claim   = require('../models/Claim');
const FraudLog= require('../models/FraudLog');
const Payout  = require('../models/Payout');

/* ── helpers ── */
const startOfDay   = () => new Date(new Date().setHours(0,0,0,0));
const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/* GET /admin/dashboard */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalWorkers, activePolicies, totalClaims, claimsToday,
      claimsApproved, claimsRejected, fraudAlerts, payoutsAgg, pendingPayouts,
    ] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      Policy.countDocuments({ status: 'active' }),
      Claim.countDocuments(),
      Claim.countDocuments({ createdAt: { $gte: startOfDay() } }),
      Claim.countDocuments({ status: 'approved' }),
      Claim.countDocuments({ status: 'rejected' }),
      FraudLog.countDocuments({ timestamp: { $gte: startOfDay() } }),
      Payout.aggregate([
        { $match: { paymentStatus: 'success', timestamp: { $gte: startOfMonth() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payout.countDocuments({ paymentStatus: 'pending' }),
    ]);
    res.json({
      totalWorkers, activePolicies, totalClaims, claimsToday,
      claimsApproved, claimsRejected, fraudAlerts,
      totalPayouts: payoutsAgg[0]?.total || 0,
      pendingPayouts,
    });
  } catch (err) { next(err); }
};

/* GET /admin/policies */
const getAllPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find()
      .populate('userId', 'name email city deliveryPlatform phone')
      .sort({ createdAt: -1 });
    res.json(policies);
  } catch (err) { next(err); }
};

/* GET /admin/claims */
const getAllClaims = async (req, res, next) => {
  try {
    const { status, type, city } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (type   && type   !== 'all') filter.disruptionType = type;
    if (city   && city   !== 'all') filter['location.city'] = city;
    const claims = await Claim.find(filter)
      .populate('userId', 'name city phone deliveryPlatform')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { next(err); }
};

/* PATCH /admin/claims/:id */
const updateClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(claim);
  } catch (err) { next(err); }
};

/* GET /admin/fraud-alerts */
const getFraudAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudLog.find()
      .populate('userId', 'name email city')
      .populate('claimId')
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) { next(err); }
};

/* GET /admin/analytics */
const getAnalytics = async (req, res, next) => {
  try {
    const [claimsByType, payoutsByCity, weeklyTrend, planDist] = await Promise.all([
      Claim.aggregate([
        { $group: { _id: '$disruptionType', count: { $sum: 1 }, total: { $sum: '$claimAmount' } } },
      ]),
      Payout.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $lookup: { from: 'claims', localField: 'claimId', foreignField: '_id', as: 'claim' } },
        { $unwind: { path: '$claim', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$claim.location.city', total: { $sum: '$amount' } } },
        { $match: { _id: { $ne: null } } },
        { $sort: { total: -1 } }, { $limit: 8 },
      ]),
      Claim.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: -1 } }, { $limit: 14 },
      ]),
      Policy.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$planType', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({ claimsByType, payoutsByCity, weeklyTrend: weeklyTrend.reverse(), planDist });
  } catch (err) { next(err); }
};

/* GET /admin/users */
const getAllUsers = async (req, res, next) => {
  try {
    const { city, platform, search } = req.query;
    const filter = { role: 'worker' };
    if (city     && city     !== 'all') filter.city = city;
    if (platform && platform !== 'all') filter.deliveryPlatform = platform;
    if (search) filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

/* PATCH /admin/users/:id */
const updateUser = async (req, res, next) => {
  try {
    const { action } = req.body; // 'suspend' | 'activate'
    const update = action === 'suspend'
      ? { onboardingComplete: false }
      : { onboardingComplete: true };
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

/* GET /admin/payouts */
const getAllPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find()
      .populate('userId', 'name city bankAccount')
      .populate('claimId', 'disruptionType location claimAmount')
      .sort({ timestamp: -1 });
    res.json(payouts);
  } catch (err) { next(err); }
};

/* GET /admin/disruptions  — derived from recent claims */
const getDisruptions = async (req, res, next) => {
  try {
    const disruptions = await Claim.aggregate([
      { $group: {
          _id: { type: '$disruptionType', city: '$location.city', date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
          affectedWorkers: { $sum: 1 },
          totalLoss: { $sum: '$claimAmount' },
          lastSeen: { $max: '$createdAt' },
      }},
      { $sort: { lastSeen: -1 } },
      { $limit: 50 },
    ]);
    res.json(disruptions);
  } catch (err) { next(err); }
};

/* GET /admin/logs  — mock system logs (no log model yet) */
const getSystemLogs = async (req, res, next) => {
  try {
    const [recentClaims, recentPayouts, recentFraud] = await Promise.all([
      Claim.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name'),
      Payout.find().sort({ timestamp: -1 }).limit(10).populate('userId', 'name'),
      FraudLog.find().sort({ timestamp: -1 }).limit(10).populate('userId', 'name'),
    ]);
    const logs = [
      ...recentClaims.map((c) => ({ ts: c.createdAt, module: 'Claims', event: 'Claim Filed', status: c.status, desc: `${c.userId?.name || 'Worker'} filed ${c.disruptionType?.replace(/_/g,' ')} claim — ₹${c.claimAmount}` })),
      ...recentPayouts.map((p) => ({ ts: p.timestamp, module: 'Payouts', event: 'Payout Processed', status: p.paymentStatus, desc: `₹${p.amount} transferred to ${p.userId?.name || 'Worker'}` })),
      ...recentFraud.map((f) => ({ ts: f.timestamp, module: 'Fraud', event: 'Fraud Alert', status: 'alert', desc: `${f.fraudType?.replace(/_/g,' ')} detected — risk score ${f.riskScore}` })),
    ].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 40);
    res.json(logs);
  } catch (err) { next(err); }
};

/* GET /admin/traffic  — Tamil Nadu mock data */
const getTraffic = async (req, res, next) => {
  const TN_ROADS = [
    { city:'Chennai',        road:'Anna Salai',           congestion:78, density:420, speed:18, level:'High' },
    { city:'Chennai',        road:'OMR (IT Corridor)',     congestion:65, density:380, speed:24, level:'High' },
    { city:'Chennai',        road:'GST Road',              congestion:55, density:310, speed:30, level:'Moderate' },
    { city:'Chennai',        road:'Poonamallee High Road', congestion:82, density:460, speed:14, level:'Severe' },
    { city:'Coimbatore',     road:'Avinashi Road',         congestion:48, density:260, speed:35, level:'Moderate' },
    { city:'Coimbatore',     road:'Trichy Road',           congestion:35, density:190, speed:42, level:'Low' },
    { city:'Madurai',        road:'Bypass Road',           congestion:42, density:220, speed:38, level:'Moderate' },
    { city:'Madurai',        road:'Melur Road',            congestion:28, density:140, speed:50, level:'Low' },
    { city:'Salem',          road:'Omalur Road',           congestion:38, density:200, speed:40, level:'Low' },
    { city:'Salem',          road:'Attur Road',            congestion:52, density:280, speed:32, level:'Moderate' },
    { city:'Tiruchirappalli',road:'Trichy-Chennai NH',     congestion:60, density:340, speed:28, level:'High' },
    { city:'Tirunelveli',    road:'Palayamkottai Road',    congestion:30, density:160, speed:48, level:'Low' },
  ];
  res.json(TN_ROADS);
};

/* POST /admin/approve-claim  &  POST /admin/reject-claim */
const approveClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.body.claimId, { status: 'approved' }, { new: true });
    res.json(claim);
  } catch (err) { next(err); }
};

const rejectClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.body.claimId, { status: 'rejected' }, { new: true });
    res.json(claim);
  } catch (err) { next(err); }
};

/* POST /admin/initiate-payout */
const initiatePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findByIdAndUpdate(
      req.body.payoutId,
      { paymentStatus: 'processing' },
      { new: true }
    );
    res.json(payout);
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard, getAllPolicies, getAllClaims, updateClaim,
  getFraudAlerts, getAnalytics, getAllUsers, updateUser,
  getAllPayouts, getDisruptions, getSystemLogs, getTraffic,
  approveClaim, rejectClaim, initiatePayout,
};
