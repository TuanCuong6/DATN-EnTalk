// backend/routes/emailMarketing.js
const express = require("express");
const router = express.Router();
const emailMarketingController = require("../controllers/emailMarketingController");
const { verifyAdminToken } = require("../middleware/authMiddleware");

// Generate email HTML
router.post("/generate", verifyAdminToken, emailMarketingController.generateEmail);

// Send marketing email to all users
router.post("/send", verifyAdminToken, emailMarketingController.sendMarketingEmail);

// Get campaigns history
router.get("/campaigns", verifyAdminToken, emailMarketingController.getCampaigns);

// Get campaign detail (including HTML content)
router.get("/campaigns/:campaignId", verifyAdminToken, emailMarketingController.getCampaignDetail);

module.exports = router;
