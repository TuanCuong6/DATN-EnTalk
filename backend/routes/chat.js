//backend/routes/chat.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const {
  askQuestion,
  getChatHistory,
} = require("../controllers/chatController");

router.post("/ask", verifyToken, askQuestion);
router.get("/history", verifyToken, getChatHistory);

module.exports = router;
