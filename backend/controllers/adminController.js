// backend/controllers/adminController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/uploadTopicImage");
const { generateAudioForReading } = require("../services/audioGenerationService");

// Admin Login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM admins WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Tài khoản admin không tồn tại" });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.execute(
      "SELECT COUNT(*) as totalUsers FROM users"
    );
    const [[{ totalReadings }]] = await db.execute(
      "SELECT COUNT(*) as totalReadings FROM readings"
    );
    const [[{ totalRecords }]] = await db.execute(
      "SELECT COUNT(*) as totalRecords FROM records"
    );
    const [[{ totalAdmins }]] = await db.execute(
      "SELECT COUNT(*) as totalAdmins FROM admins"
    );
    const [[{ avgScore }]] = await db.execute(
      "SELECT AVG(score_overall) as avgScore FROM records WHERE score_overall IS NOT NULL"
    );

    res.json({
      totalUsers,
      totalReadings,
      totalRecords,
      totalAdmins,
      avgScore: avgScore ? parseFloat(avgScore).toFixed(2) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.level, 
        u.avatar_url, 
        u.created_at, 
        u.is_verified,
        u.is_active,
        COALESCE(us.current_streak, 0) as current_streak
      FROM users u
      LEFT JOIN user_streaks us ON u.id = us.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Toggle User Active Status
exports.toggleUserActive = async (req, res) => {
  const { id } = req.params;
  try {
    // Lấy trạng thái hiện tại
    const [users] = await db.execute("SELECT is_active FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    const currentStatus = users[0].is_active;
    const newStatus = !currentStatus;
    
    // Cập nhật trạng thái
    await db.execute("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, id]);
    
    res.json({ 
      message: newStatus ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hóa tài khoản",
      is_active: newStatus
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get All Topics
exports.getTopics = async (req, res) => {
  try {
    const [topics] = await db.execute("SELECT * FROM topics ORDER BY id DESC");
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Create Topic
exports.createTopic = async (req, res) => {
  const { name, description } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  try {
    await db.execute(
      "INSERT INTO topics (name, description, image_url) VALUES (?, ?, ?)",
      [name, description, imageUrl]
    );
    res.status(201).json({ message: "Tạo chủ đề thành công" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Tên chủ đề đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update Topic
exports.updateTopic = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  try {
    if (imageUrl) {
      await db.execute(
        "UPDATE topics SET name = ?, description = ?, image_url = ? WHERE id = ?",
        [name, description, imageUrl, id]
      );
    } else {
      await db.execute(
        "UPDATE topics SET name = ?, description = ? WHERE id = ?",
        [name, description, id]
      );
    }
    res.json({ message: "Cập nhật chủ đề thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete Topic - SỬA: xóa readings nhưng GIỮ LẠI records
exports.deleteTopic = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Đặt reading_id = NULL cho tất cả records liên quan trước khi xóa readings
    await db.execute(
      `
      UPDATE records 
      SET reading_id = NULL 
      WHERE reading_id IN (SELECT id FROM readings WHERE topic_id = ?)
    `,
      [id]
    );

    // 2. Sau đó xóa readings thuộc topic này
    await db.execute("DELETE FROM readings WHERE topic_id = ?", [id]);

    // 3. Cuối cùng xóa topic
    await db.execute("DELETE FROM topics WHERE id = ?", [id]);

    res.json({
      message: "Xóa chủ đề và bài đọc thành công, đã giữ lại lịch sử",
    });
  } catch (err) {
    console.error("❌ Lỗi xóa topic:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get All Readings với thông tin topic
exports.getReadings = async (req, res) => {
  try {
    const [readings] = await db.execute(`
      SELECT r.*, t.name as topic_name 
      FROM readings r 
      LEFT JOIN topics t ON r.topic_id = t.id 
      ORDER BY r.created_at DESC
    `);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Create Reading
exports.createReading = async (req, res) => {
  const { content, level, topic_id } = req.body;
  try {
    // Tạo bài đọc
    const [result] = await db.execute(
      "INSERT INTO readings (content, level, topic_id) VALUES (?, ?, ?)",
      [content, level, topic_id]
    );
    
    const readingId = result.insertId;
    console.log(`✅ Đã tạo bài đọc #${readingId}`);

    // Tự động generate audio (chạy background, không chờ)
    generateAudioForReading(readingId)
      .then(() => console.log(`✅ Audio cho bài đọc #${readingId} đã sẵn sàng`))
      .catch((err) => console.error(`❌ Lỗi generate audio cho bài #${readingId}:`, err.message));

    res.status(201).json({ 
      message: "Tạo bài đọc thành công. Audio đang được tạo...",
      readingId 
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update Reading
exports.updateReading = async (req, res) => {
  const { id } = req.params;
  const { content, level, topic_id } = req.body;
  try {
    // Lấy nội dung cũ để so sánh
    const [oldReading] = await db.execute(
      "SELECT content FROM readings WHERE id = ?",
      [id]
    );

    // Update bài đọc
    await db.execute(
      "UPDATE readings SET content = ?, level = ?, topic_id = ? WHERE id = ?",
      [content, level, topic_id, id]
    );

    // Nếu nội dung thay đổi, regenerate audio
    if (oldReading.length > 0 && oldReading[0].content !== content) {
      console.log(`🔄 Nội dung bài đọc #${id} đã thay đổi, regenerate audio...`);
      generateAudioForReading(id)
        .then(() => console.log(`✅ Audio mới cho bài đọc #${id} đã sẵn sàng`))
        .catch((err) => console.error(`❌ Lỗi regenerate audio cho bài #${id}:`, err.message));
    }

    res.json({ message: "Cập nhật bài đọc thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete Reading - SỬA: GIỮ LẠI records
exports.deleteReading = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Đặt reading_id = NULL cho tất cả records liên quan trước khi xóa reading
    await db.execute(
      "UPDATE records SET reading_id = NULL WHERE reading_id = ?",
      [id]
    );

    // 2. Sau đó xóa reading
    await db.execute("DELETE FROM readings WHERE id = ?", [id]);

    res.json({ message: "Xóa bài đọc thành công, đã giữ lại lịch sử" });
  } catch (err) {
    console.error("❌ Lỗi xóa reading:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get Records với thông tin user - SỬA
exports.getRecords = async (req, res) => {
  try {
    const [records] = await db.execute(`
      SELECT rec.*, u.name as user_name, 
             COALESCE(r.content, rec.original_content) as reading_content
      FROM records rec
      LEFT JOIN users u ON rec.user_id = u.id
      LEFT JOIN readings r ON rec.reading_id = r.id
      ORDER BY rec.created_at DESC
    `);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
