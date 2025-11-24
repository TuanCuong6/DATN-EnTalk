// backend/routes/youtubeReading.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyTokenMiddleware');
const youtubeReadingController = require('../controllers/youtubeReadingController');

// Analyze video and get summary
router.post('/analyze', (req, res, next) => {
  console.log('🔴 [Route] POST /analyze hit!');
  next();
}, verifyToken, youtubeReadingController.analyzeVideo);

// Generate reading lesson
router.post('/generate', (req, res, next) => {
  console.log('🔴 [Route] POST /generate hit!');
  next();
}, verifyToken, youtubeReadingController.generateReading);

module.exports = router;
