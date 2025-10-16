//backend/controllers/feedbackController.js
const { sendFeedbackEmail } = require("../services/mailer");

exports.sendFeedback = async (req, res) => {
  const { content } = req.body;
  const user = req.user;
  const file = req.file;

  if (!content || content.trim().length < 3) {
    return res.status(400).json({ message: "Nội dung góp ý quá ngắn" });
  }

  try {
    await sendFeedbackEmail({
      fromUser: user.email,
      userId: user.id,
      content,
      file,
    });

    res.json({ message: "Đã gửi góp ý thành công!" });
  } catch (err) {
    console.error("❌ Lỗi gửi góp ý:", err);
    res.status(500).json({ message: "Gửi góp ý thất bại" });
  }
};
