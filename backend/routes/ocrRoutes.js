const router = require('express').Router();
const multer = require('multer');
const { extractIncome } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

// Memory storage (correct)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Route
router.post('/extract-income', protect, upload.single('image'), extractIncome);

module.exports = router;