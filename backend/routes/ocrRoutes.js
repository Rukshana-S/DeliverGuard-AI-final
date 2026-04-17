const router = require('express').Router();
const multer = require('multer');
const { extractIncome } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No image uploaded. Make sure field name is "image".' });
    next();
  });
};

router.post('/extract-income', protect, handleUpload, extractIncome);

module.exports = router;