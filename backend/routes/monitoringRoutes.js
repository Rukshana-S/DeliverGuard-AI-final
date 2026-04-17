const router = require('express').Router();
const { getLiveData, testFraud, testRisk } = require('../controllers/monitoringController');
const { protect } = require('../middleware/authMiddleware');

router.get('/live', protect, getLiveData);
router.post('/test-fraud', protect, testFraud);
router.post('/test-risk', protect, testRisk);

module.exports = router;
