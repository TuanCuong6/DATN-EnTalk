//backend/routes/notification.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const {
  saveFcmToken,
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");

router.post("/save-token", verifyToken, saveFcmToken);
router.get("/list", verifyToken, getNotifications);
router.post("/mark-read", verifyToken, markAsRead);

module.exports = router;
