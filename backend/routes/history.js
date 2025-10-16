// backend/routes/history.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyTokenMiddleware");
const historyController = require("../controllers/historyController");

router.get("/chart", verifyToken, historyController.getChartData);
router.get("/list", verifyToken, historyController.getRecordList);
router.get("/by-date", verifyToken, historyController.getRecordsByDate);
router.get("/record/:id", verifyToken, historyController.getRecordDetail);
router.get("/recent", verifyToken, historyController.getRecentRecords);

module.exports = router;
