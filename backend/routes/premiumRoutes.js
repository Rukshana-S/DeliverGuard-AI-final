const router = require('express').Router();
const { payWeeklyPremium, getPaymentHistory, getCoverageStatus } = require('../controllers/premiumController');
const { protect } = require('../middleware/authMiddleware');

router.post('/weekly-premium', protect, payWeeklyPremium);
router.get('/history',         protect, getPaymentHistory);
router.get('/status',          protect, getCoverageStatus);

module.exports = router;
