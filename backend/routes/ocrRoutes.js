const router  = require('express').Router();
const multer  = require('multer');
const { extractIncome } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

// Store image in memory — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/extract-income', protect, upload.single('image'), extractIncome);

module.exports = router;
