// backend/routes/contentValidation.js
const express = require('express');
const router = express.Router();
const { validateContentLength, getLimits, countWords } = require('../config/contentLimits');

/**
 * POST /api/content-validation/validate
 * Validate độ dài nội dung
 */
router.post('/validate', (req, res) => {
  try {
    const { text, type, level } = req.body;

    if (!text || !type) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin text hoặc type'
      });
    }

    const validation = validateContentLength(text, type, level);

    res.json({
      success: true,
      ...validation
    });
  } catch (err) {
    console.error('❌ Lỗi validate:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
});

/**
 * GET /api/content-validation/limits
 * Lấy thông tin giới hạn cho loại nội dung
 */
router.get('/limits', (req, res) => {
  try {
    const { type, level } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin type'
      });
    }

    const limits = getLimits(type, level);

    if (!limits) {
      return res.status(400).json({
        success: false,
        message: 'Loại nội dung hoặc level không hợp lệ'
      });
    }

    res.json({
      success: true,
      limits
    });
  } catch (err) {
    console.error('❌ Lỗi lấy limits:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
});

/**
 * POST /api/content-validation/count-words
 * Đếm số từ trong văn bản
 */
router.post('/count-words', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({
        success: true,
        wordCount: 0
      });
    }

    const wordCount = countWords(text);

    res.json({
      success: true,
      wordCount
    });
  } catch (err) {
    console.error('❌ Lỗi đếm từ:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
});

module.exports = router;
