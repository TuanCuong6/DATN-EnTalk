//backend/routes/topic.js
const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");

router.get("/", topicController.getAllTopics);

module.exports = router;
