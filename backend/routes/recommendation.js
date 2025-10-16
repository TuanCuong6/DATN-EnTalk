//backend/routes/recommendation.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const { recommendOnce } = require("../services/dailyRecommender");

// Route test thủ công (không bắt buộc dùng token)
router.post("/run", async (req, res) => {
  try {
    await recommendOnce();
    res.json({ message: "Đã chạy gợi ý và gửi thông báo" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi chạy gợi ý", error: err.message });
  }
});

module.exports = router;
