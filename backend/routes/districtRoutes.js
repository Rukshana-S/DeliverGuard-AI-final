const router = require('express').Router();
const {
  getDistrictsList,
  getAllDistricts,
  getDistrict,
  getAlerts,
  getGroupedByState,
  getSummary,
} = require('../controllers/districtController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDistrictsList);
router.get('/all', protect, getAllDistricts);
router.get('/alerts/active', protect, getAlerts);
router.get('/grouped/state', protect, getGroupedByState);
router.get('/summary', protect, getSummary);
router.get('/:name', protect, getDistrict);

module.exports = router;
