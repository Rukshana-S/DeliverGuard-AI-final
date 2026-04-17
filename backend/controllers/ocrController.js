const axios = require('axios');
const FormData = require('form-data');

// Parse the extracted amount from OCR text
const parseAmount = (text) => {
  if (!text) return null;

  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Find the amount between a phone number line and 'Completed' line
  // OCR often reads ₹ as ₴, $, S, or other symbols
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase() === 'completed' && i > 0) {
      // Go backwards from 'Completed' to find the amount line
      for (let j = i - 1; j >= 0; j--) {
        const line = lines[j].trim();
        // Strip any leading non-digit character (misread ₹ symbol) and parse
        const cleaned = line.replace(/^[^\d]+/, '').replace(/,/g, '');
        const m = cleaned.match(/^(\d+(?:\.\d{1,2})?)/);
        if (m) {
          const val = Math.round(parseFloat(m[1]));
          if (val >= 10 && val <= 99999) return val;
        }
      }
    }
  }

  // 2. Look for ₹ or INR or misread symbols followed by a number
  for (const line of lines) {
    const m = line.match(/(?:[₹₨₴$€£]|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (m) {
      const val = Math.round(parseFloat(m[1].replace(/,/g, '')));
      if (val >= 10 && val <= 99999) return val;
    }
  }

  // 3. Look for 'credited' pattern
  for (const line of lines) {
    const m = line.match(/(\d[\d,]+)\s*credited|credited\s*([\d,]+)/i);
    if (m) {
      const val = Math.round(parseFloat((m[1] || m[2]).replace(/,/g, '')));
      if (val >= 10 && val <= 99999) return val;
    }
  }

  // 4. Find all standalone numbers, return largest valid amount
  const candidates = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[^\d]+/, '').replace(/,/g, '');
    const m = cleaned.match(/^(\d+(?:\.\d{1,2})?)$/);
    if (m) {
      const val = Math.round(parseFloat(m[1]));
      if (val >= 10 && val <= 99999) candidates.push(val);
    }
  }
  if (candidates.length) return Math.max(...candidates);

  return null;
};

// POST /api/ocr/extract-income
const extractIncome = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
    });
    form.append('apikey', process.env.OCR_API_KEY || 'K81237640688957');
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('scale', 'true');
    form.append('OCREngine', '2'); // Engine 2 is more accurate for numbers

    const { data } = await axios.post(
      'https://api.ocr.space/parse/image',
      form,
      { headers: form.getHeaders(), timeout: 30000 }
    );

    const parsedText = data?.ParsedResults?.[0]?.ParsedText || '';
    console.log('[OCR TEXT]:', parsedText);

    const amount = parseAmount(parsedText);
    console.log('[OCR AMOUNT]:', amount);

    if (amount) {
      return res.json({ success: true, amount, weeklyIncome: amount });
    }

    return res.json({ success: false, amount: null, weeklyIncome: null, message: 'Amount not detected' });

  } catch (error) {
    console.error('[OCR ERROR]:', error.message);
    return res.json({ success: false, amount: null, weeklyIncome: null, message: 'Amount not detected' });
  }
};

module.exports = { extractIncome };
