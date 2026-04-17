const axios = require("axios");
const FormData = require("form-data");

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:5001";

// POST /api/ocr/extract-income
const extractIncome = async (req, res) => {
  console.log("[OCR] Request received");

  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  console.log("[OCR FILE]:", req.file.originalname, req.file.mimetype, req.file.size);

  try {
    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype || "image/jpeg",
    });

    console.log("[OCR] Calling local EasyOCR service...");

    const response = await axios.post(`${OCR_SERVICE_URL}/extract`, form, {
      headers: form.getHeaders(),
      timeout: 120000,
    });

    const amount = response.data?.amount;
    console.log("[OCR AMOUNT]:", amount);

    if (amount) {
      return res.json({ success: true, amount, weeklyIncome: amount });
    }

    return res.json({ success: false, amount: null, weeklyIncome: null, message: "Amount not detected" });

  } catch (error) {
    console.error("[OCR ERROR]:", error.message);
    // Python OCR service not running (common on cloud deployments) — tell frontend to use manual input
    return res.json({
      success: false,
      amount: null,
      weeklyIncome: null,
      message: 'Could not detect amount. Please enter your weekly income manually.',
    });
  }
};

module.exports = { extractIncome };
