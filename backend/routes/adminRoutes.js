const router = require('express').Router();
const {
  getDashboard, getAllPolicies, getAllClaims, updateClaim,
  getFraudAlerts, getAnalytics, getAllUsers, updateUser,
  getAllPayouts, getDisruptions, getSystemLogs, getTraffic,
  approveClaim, rejectClaim, initiatePayout,
  blockUser, unblockUser,
} = require('../controllers/adminController');
const { protect }    = require('../middleware/authMiddleware');
const { adminOnly }  = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard',         getDashboard);
router.get('/users',             getAllUsers);
router.patch('/users/:id',       updateUser);
router.put('/block-user/:id',    blockUser);
router.put('/unblock-user/:id',  unblockUser);
router.get('/policies',          getAllPolicies);
router.get('/claims',            getAllClaims);
router.patch('/claims/:id',      updateClaim);
router.post('/approve-claim',    approveClaim);
router.post('/reject-claim',     rejectClaim);
router.get('/payouts',           getAllPayouts);
router.post('/initiate-payout',  initiatePayout);
router.get('/disruptions',       getDisruptions);
router.get('/fraud-alerts',      getFraudAlerts);
router.get('/analytics',         getAnalytics);
router.get('/traffic',           getTraffic);
router.get('/logs',              getSystemLogs);

module.exports = router;
