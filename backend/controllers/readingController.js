//backend//controllers/readingController.js
const db = require("../config/db");

exports.getAllReadings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, content, level, created_at, 
              CONCAT('Bài đọc #', id) AS title
       FROM readings 
       WHERE is_community_post = FALSE 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi tải danh sách bài đọc", error: err.message });
  }
};

// GET /api/reading/topic/:id
exports.getReadingsByTopic = async (req, res) => {
  const topicId = req.params.id;
  try {
    const [rows] = await require("../config/db").execute(
      "SELECT id, content, level, created_by, topic_id, is_community_post, created_at FROM readings WHERE topic_id = ?",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy bài đọc theo topic:", err);
    res
      .status(500)
      .json({ message: "Không thể lấy bài đọc", error: err.message });
  }
};

// GET /api/reading/:id
exports.getReadingById = async (req, res) => {
  try {
    const reading = await require("../models/Reading").getReadingById(
      req.params.id
    );

    if (!reading) {
      return res.status(404).json({ message: "Không tìm thấy bài đọc" });
    }

    res.json(reading); // 👈 trả trực tiếp
  } catch (err) {
    console.error("❌ Lỗi khi lấy bài đọc theo ID:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
