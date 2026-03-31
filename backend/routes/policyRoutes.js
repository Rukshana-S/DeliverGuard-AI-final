const router = require('express').Router();
const { getPlans, selectPlan, getActivePolicy, cancelPolicy } = require('../controllers/policyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/plans', getPlans);
router.post('/policy/select', protect, selectPlan);
router.get('/policy/active', protect, getActivePolicy);
router.post('/policy/cancel', protect, cancelPolicy);

module.exports = router;
