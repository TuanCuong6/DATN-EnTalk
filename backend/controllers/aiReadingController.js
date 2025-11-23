// backend/controllers/aiReadingController.js
const { generateReadingContent } = require("../services/aiReadingService");

exports.generateReading = async (req, res) => {
  try {
    const { topic, description } = req.body;
    const userId = req.user.id;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "Chủ đề không được để trống" });
    }

    console.log(`🎯 User ${userId} yêu cầu tạo bài đọc - Topic: ${topic}`);

    const content = await generateReadingContent(topic, description, userId);

    res.json({
      success: true,
      content,
      topic,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo bài đọc AI:", err);
    res.status(500).json({
      message: "Không thể tạo bài đọc",
      error: err.message,
    });
  }
};
