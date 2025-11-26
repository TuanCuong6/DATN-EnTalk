// backend/controllers/emailMarketingController.js
const db = require("../config/db");
const emailMarketingService = require("../services/emailMarketingService");
const mailer = require("../services/mailer");

// Generate email HTML từ Gemini
exports.generateEmail = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrls,
      ctaLink,
      ctaText,
      primaryColor,
      designStyle,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc mô tả" });
    }

    console.log(`📧 Generating email with ${imageUrls?.length || 0} images`);

    const htmlContent = await emailMarketingService.generateEmailHTML({
      title,
      description,
      imageUrls: imageUrls || [], // Ensure it's an array
      ctaLink,
      ctaText,
      primaryColor,
      designStyle,
    });

    res.json({
      success: true,
      htmlContent,
    });
  } catch (error) {
    console.error("Error generating email:", error);

    // Xử lý lỗi quota Gemini API
    if (error.message && error.message.includes("Resource exhausted")) {
      return res.status(429).json({
        message: "API Gemini đã hết quota. Vui lòng thử lại sau.",
        error: "QUOTA_EXCEEDED",
      });
    }

    res.status(500).json({
      message: "Lỗi khi tạo email",
      error: error.message,
    });
  }
};

// Gửi email marketing đến tất cả users
exports.sendMarketingEmail = async (req, res) => {
  try {
    const { title, htmlContent, subject } = req.body;

    if (!htmlContent || !subject) {
      return res
        .status(400)
        .json({ message: "Thiếu nội dung email hoặc tiêu đề" });
    }

    // Lấy danh sách tất cả users
    const [users] = await db.query(
      "SELECT id, email, name FROM users WHERE email IS NOT NULL"
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Không có người dùng nào" });
    }

    // Lưu campaign vào database
    const [campaignResult] = await db.query(
      `INSERT INTO marketing_campaigns (title, subject, html_content, total_recipients, status) 
       VALUES (?, ?, ?, ?, 'sending')`,
      [title, subject, htmlContent, users.length]
    );

    const campaignId = campaignResult.insertId;

    // Gửi email bất đồng bộ
    sendEmailsInBackground(campaignId, users, subject, htmlContent);

    res.json({
      success: true,
      message: `Đang gửi email đến ${users.length} người dùng`,
      campaignId,
      totalRecipients: users.length,
    });
  } catch (error) {
    console.error("Error sending marketing email:", error);
    res.status(500).json({
      message: "Lỗi khi gửi email",
      error: error.message,
    });
  }
};

// Hàm gửi email trong background
async function sendEmailsInBackground(campaignId, users, subject, htmlContent) {
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      // Delay 1 giây giữa mỗi email để tránh spam
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await mailer.sendMarketingEmail({
        to: user.email,
        subject,
        htmlContent,
        userName: user.name,
      });

      successCount++;
      console.log(`✅ Sent to ${user.email}`);
    } catch (error) {
      failCount++;
      console.error(`❌ Failed to send to ${user.email}:`, error.message);
    }
  }

  // Update campaign status
  await db.query(
    `UPDATE marketing_campaigns 
     SET status = 'completed', sent_count = ?, failed_count = ?, completed_at = NOW() 
     WHERE campaign_id = ?`,
    [successCount, failCount, campaignId]
  );

  console.log(
    `📧 Campaign ${campaignId} completed: ${successCount} sent, ${failCount} failed`
  );
}

// Lấy lịch sử campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const [campaigns] = await db.query(
      `SELECT campaign_id, title, subject, total_recipients, sent_count, failed_count, 
              status, created_at, completed_at 
       FROM marketing_campaigns 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      message: "Lỗi khi lấy lịch sử campaigns",
      error: error.message,
    });
  }
};

// Lấy chi tiết campaign (bao gồm HTML content)
exports.getCampaignDetail = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const [campaigns] = await db.query(
      `SELECT campaign_id, title, subject, html_content, total_recipients, 
              sent_count, failed_count, status, created_at, completed_at 
       FROM marketing_campaigns 
       WHERE campaign_id = ?`,
      [campaignId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy campaign" });
    }

    res.json({ success: true, campaign: campaigns[0] });
  } catch (error) {
    console.error("Error fetching campaign detail:", error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết campaign",
      error: error.message,
    });
  }
};
