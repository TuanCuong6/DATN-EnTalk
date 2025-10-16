//backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyTokenMiddleware");
const upload = require("../middleware/uploadAvatar");

router.post("/register", authController.register);
router.post("/verify", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

// Account APIs
router.get("/me", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, authController.updateProfile);
router.put("/change-password", verifyToken, authController.changePassword);
router.post(
  "/upload-avatar",
  verifyToken,
  upload.single("avatar"),
  authController.uploadAvatar
);

module.exports = router;
