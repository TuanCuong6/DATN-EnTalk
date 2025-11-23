// backend/routes/streak.js
const express = require("express");
const router = express.Router();
const streakController = require("../controllers/streakController");
const verifyToken = require("../middleware/verifyTokenMiddleware");

// GET /api/streak - Lấy thông tin streak của user
router.get("/", verifyToken, streakController.getStreak);

module.exports = router;
