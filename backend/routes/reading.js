//backend/routes/reading.js
const express = require("express");
const router = express.Router();
const readingController = require("../controllers/readingController");
const verifyToken = require("../middleware/verifyTokenMiddleware");

router.get("/all", readingController.getAllReadings);
router.get("/topic/:id", verifyToken, readingController.getReadingsByTopic);
router.get("/:id", readingController.getReadingById);

//thêm
router.post("/check-modified", readingController.checkReadingModified);

module.exports = router;
