const router = require('express').Router();
const { getLiveData } = require('../controllers/monitoringController');
const { protect } = require('../middleware/authMiddleware');

router.get('/live', protect, getLiveData);

module.exports = router;
