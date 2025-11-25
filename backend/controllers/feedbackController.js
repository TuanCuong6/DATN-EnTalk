//backend/controllers/feedbackController.js
const db = require("../config/db");
const { sendFeedbackEmail, sendReplyEmail } = require("../services/mailer");

exports.sendFeedback = async (req, res) => {
  const { content, rating } = req.body;
  const user = req.user;
  const file = req.file;

  if (!content || content.trim().length < 3) {
    return res.status(400).json({ message: "Nội dung góp ý quá ngắn" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Vui lòng đánh giá từ 1-5 sao" });
  }

  try {
    // Lưu vào database - file.path đã là Cloudinary URL
    const screenshot_url = file ? file.path : null;

    console.log("📸 Screenshot URL:", screenshot_url);
    console.log("⭐ Rating:", rating);

    await db.execute(
      "INSERT INTO feedbacks (user_id, user_email, content, rating, screenshot_url) VALUES (?, ?, ?, ?, ?)",
      [user.id, user.email, content, parseInt(rating), screenshot_url]
    );

    // Gửi email thông báo với ảnh và rating
    await sendFeedbackEmail({
      fromUser: user.email,
      userId: user.id,
      content,
      rating: parseInt(rating),
      screenshot_url,
      hasImage: !!screenshot_url,
    });

    res.json({ message: "Đã gửi góp ý thành công!" });
  } catch (err) {
    console.error("❌ Lỗi gửi góp ý:", err);
    res.status(500).json({ message: "Gửi góp ý thất bại" });
  }
};

// ADMIN: Lấy danh sách phản hồi
exports.getFeedbacks = async (req, res) => {
  try {
    const [feedbacks] = await db.execute(`
      SELECT f.*, u.name as user_name 
      FROM feedbacks f 
      LEFT JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
    `);
    res.json(feedbacks);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách feedback:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ADMIN: Reply phản hồi
exports.replyFeedback = async (req, res) => {
  const { id } = req.params;
  const { reply_content } = req.body;

  if (!reply_content || reply_content.trim().length < 3) {
    return res.status(400).json({ message: "Nội dung reply quá ngắn" });
  }

  try {
    // Lấy thông tin feedback
    const [feedbacks] = await db.execute(
      "SELECT * FROM feedbacks WHERE id = ?",
      [id]
    );

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phản hồi" });
    }

    const feedback = feedbacks[0];

    // Cập nhật database
    await db.execute(
      "UPDATE feedbacks SET status = 'replied', admin_reply = ?, replied_at = NOW() WHERE id = ?",
      [reply_content, id]
    );

    // Gửi email reply cho user (CÓ ẢNH)
    await sendReplyEmail({
      to: feedback.user_email,
      user_name: feedback.user_name || "Người dùng",
      original_content: feedback.content,
      reply_content: reply_content,
      screenshot_url: feedback.screenshot_url, // THÊM ẢNH VÀO EMAIL REPLY
    });

    res.json({ message: "Đã gửi phản hồi thành công!" });
  } catch (err) {
    console.error("❌ Lỗi reply feedback:", err);
    res
      .status(500)
      .json({ message: "Gửi phản hồi thất bại", error: err.message });
  }
};
