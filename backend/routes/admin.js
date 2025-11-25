// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const uploadTopicImage = require("../middleware/uploadTopicImage");
const feedbackController = require("../controllers/feedbackController");

// Public routes
router.post("/login", adminController.adminLogin);

// Protected routes
router.get("/dashboard", adminAuth, adminController.getDashboardStats);
router.get("/users", adminAuth, adminController.getUsers);
router.put("/users/:id/toggle-active", adminAuth, adminController.toggleUserActive);

// Topics management
router.get("/topics", adminAuth, adminController.getTopics);
// router.post("/topics", adminAuth, adminController.createTopic);
// router.put("/topics/:id", adminAuth, adminController.updateTopic);
router.post(
  "/topics",
  uploadTopicImage.single("image"),
  adminController.createTopic
);
router.put(
  "/topics/:id",
  uploadTopicImage.single("image"),
  adminController.updateTopic
);
router.delete("/topics/:id", adminAuth, adminController.deleteTopic);

// Readings management
router.get("/readings", adminAuth, adminController.getReadings);
router.post("/readings", adminAuth, adminController.createReading);
router.put("/readings/:id", adminAuth, adminController.updateReading);
router.delete("/readings/:id", adminAuth, adminController.deleteReading);

// Records management
router.get("/records", adminAuth, adminController.getRecords);

// Feedback management
router.get("/feedbacks", adminAuth, feedbackController.getFeedbacks);
router.get("/feedbacks/:id", adminAuth, feedbackController.getFeedbackById);
router.put("/feedbacks/:id", adminAuth, feedbackController.updateFeedback);
router.post(
  "/feedbacks/:id/reply",
  adminAuth,
  feedbackController.replyFeedback
);

module.exports = router;
