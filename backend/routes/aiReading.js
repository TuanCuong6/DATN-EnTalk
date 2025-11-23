// backend/routes/aiReading.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const aiReadingController = require("../controllers/aiReadingController");

router.post("/generate", verifyToken, aiReadingController.generateReading);

module.exports = router;
