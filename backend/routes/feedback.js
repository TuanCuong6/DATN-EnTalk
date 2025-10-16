//backend/routes/feedback.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const upload = require("../middleware/uploadFeedbackImage");
const { sendFeedback } = require("../controllers/feedbackController");

router.post("/send", verifyToken, upload, sendFeedback);

module.exports = router;
