const router = require('express').Router();
const { getClaims, getClaimById, createClaim } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getClaims);
router.get('/:id', protect, getClaimById);
router.post('/create', protect, createClaim);

module.exports = router;
