//backend/routes/reading.js
const express = require("express");
const router = express.Router();
const readingController = require("../controllers/readingController");

router.get("/all", readingController.getAllReadings);
router.get("/topic/:id", readingController.getReadingsByTopic);
router.get("/:id", readingController.getReadingById);

module.exports = router;
