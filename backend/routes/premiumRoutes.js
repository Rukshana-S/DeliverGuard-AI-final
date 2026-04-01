const router = require('express').Router();
const { payWeeklyPremium, getPaymentHistory, getCoverageStatus, verifyPassword } = require('../controllers/premiumController');
const { protect } = require('../middleware/authMiddleware');

router.post('/weekly-premium',   protect, payWeeklyPremium);
router.get('/history',           protect, getPaymentHistory);
router.get('/status',            protect, getCoverageStatus);
router.post('/verify-password',  protect, verifyPassword);

module.exports = router;
