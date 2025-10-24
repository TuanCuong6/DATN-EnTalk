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
// exports.getReadingById = async (req, res) => {
//   try {
//     const reading = await require("../models/Reading").getReadingById(
//       req.params.id
//     );

//     if (!reading) {
//       return res.status(404).json({ message: "Không tìm thấy bài đọc" });
//     }

//     res.json(reading); // 👈 trả trực tiếp
//   } catch (err) {
//     console.error("❌ Lỗi khi lấy bài đọc theo ID:", err);
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };

exports.getReadingById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM readings WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Reading not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Kiểm tra bài đọc có bị sửa so với bản ghi
exports.checkReadingModified = async (req, res) => {
  try {
    const { readingId, originalContent } = req.body;

    const reading = await require("../models/Reading").getReadingById(
      readingId
    );

    if (!reading) {
      return res.json({
        exists: false,
        modified: true,
        message: "Bài đọc đã bị xóa",
      });
    }

    // So sánh nội dung hiện tại với nội dung gốc từ record
    const isModified = reading.content !== originalContent;

    res.json({
      exists: true,
      modified: isModified,
      currentContent: reading.content,
      originalContent: originalContent,
    });
  } catch (err) {
    console.error("❌ Lỗi kiểm tra bài đọc:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
