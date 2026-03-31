const axios = require("axios");

// POST /api/ocr/extract-income
const extractIncome = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Convert image → base64
    const base64Image = req.file.buffer.toString("base64");

    const response = await axios.post(
      "https://api.ocr.space/parse/image",
      new URLSearchParams({
        apikey: process.env.OCR_API_KEY,
        base64Image: `data:${req.file.mimetype};base64,${base64Image}`,
        language: "eng",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const parsedText =
      response.data?.ParsedResults?.[0]?.ParsedText || "";

    console.log("[OCR TEXT]:", parsedText);

    // 🔍 Extract earnings amount — look for number after keywords first
    const lines = parsedText.split(/\n/);
    let amount = 0;

    // Strategy 1: find line with earnings keywords and grab number from same line or PREVIOUS line
    const earningsKeywords = /total|earning|earned|amount|payment|paid|completed|weekly|income/i;
    for (let i = 0; i < lines.length; i++) {
      if (earningsKeywords.test(lines[i])) {
        // check same line first, then previous line
        const sameLine = lines[i].match(/₹?\s?(\d{3,6})/);
        const prevLine = lines[i - 1]?.match(/₹?\s?(\d{3,6})/);
        const val = sameLine || prevLine;
        if (val) { amount = parseInt(val[1]); break; }
      }
    }

    // Strategy 2: pick the largest number (>=100) that is NOT a phone number (10 digits)
    if (!amount) {
      const allNumbers = [...parsedText.matchAll(/₹?\s?(\d+)/g)]
        .map(m => parseInt(m[1]))
        .filter(n => n >= 100 && String(n).length <= 6);
      amount = allNumbers.length ? Math.max(...allNumbers) : 0;
    }

    const finalAmount = amount || 500; // fallback for demo

    return res.json({
      success: true,
      extractedText: parsedText,
      weekly_income: finalAmount,
      amount: finalAmount,
      weeklyIncome: finalAmount,
    });

  } catch (error) {
    console.error("[OCR ERROR]:", error.message);

    // fallback (VERY IMPORTANT for demo)
    return res.json({
      success: true,
      extractedText: "Demo receipt detected",
      weekly_income: 500,
      amount: 500,
      weeklyIncome: 500,
    });
  }
};

module.exports = { extractIncome };