const router = require('express').Router();
const { initiatePayout, getPayoutStatus, getPayoutHistory } = require('../controllers/payoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiatePayout);
router.get('/status/:claimId', protect, getPayoutStatus);
router.get('/history', protect, getPayoutHistory);

module.exports = router;
