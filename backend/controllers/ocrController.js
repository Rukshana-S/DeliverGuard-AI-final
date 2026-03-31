const { execFile } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const RUNNER = path.join(__dirname, '../ocr_service/ocr_runner.py');

// POST /api/ocr/extract-income
const extractIncome = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  // Write buffer to a temp file — Python needs a file path
  const tmp = path.join(os.tmpdir(), `ocr_${Date.now()}.png`);
  fs.writeFileSync(tmp, req.file.buffer);

  execFile('python', [RUNNER, tmp], { timeout: 60000 }, (err, stdout, stderr) => {
    fs.unlink(tmp, () => {});   // always clean up

    if (err) {
      console.error('[OCR] Runner error:', stderr || err.message);
      return res.status(500).json({ message: 'OCR processing failed. Please enter the amount manually.' });
    }

    if (stderr) console.log('[OCR] Debug:', stderr.trim());

    try {
      const { amount } = JSON.parse(stdout.trim());
      console.log('[OCR] Extracted amount:', amount);

      if (!amount || amount <= 0) {
        return res.status(422).json({ message: 'Could not detect a credited amount. Please enter manually.' });
      }

      return res.json({ weekly_income: amount, amount, weeklyIncome: amount });
    } catch {
      return res.status(500).json({ message: 'OCR result parse failed. Please enter the amount manually.' });
    }
  });
};

module.exports = { extractIncome };
