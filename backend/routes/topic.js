//backend/routes/topic.js
const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const verifyToken = require("../middleware/verifyTokenMiddleware");

router.get("/", verifyToken, topicController.getAllTopics);

module.exports = router;
