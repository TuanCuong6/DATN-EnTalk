const db = require("../config/db");
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

exports.askQuestion = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: "Thiếu câu hỏi" });
  }

  try {
    // Gửi lời chào nếu là lần đầu chat
    const [history] = await db.execute(
      `SELECT COUNT(*) AS total FROM chat_messages WHERE user_id = ?`,
      [userId]
    );
    const isFirstTime = history[0].total === 0;

    if (isFirstTime) {
      const welcomeMessage =
        "👋 Xin chào! Tôi là EnTalk Chatbot. Bạn có thể hỏi tôi bất cứ điều gì liên quan đến việc học tiếng Anh như ngữ pháp, từ vựng, dịch thuật, luyện thi IELTS/TOEIC,...";
      await db.execute(
        `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'assistant', ?)`,
        [userId, welcomeMessage]
      );
    }

    // Lưu câu hỏi
    await db.execute(
      `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'user', ?)`,
      [userId, message]
    );

    // Prompt kiểm tra lẫn trả lời
    const prompt = `
Bạn là trợ lý chuyên môn tiếng Anh. Yêu cầu:

1. Nếu câu hỏi KHÔNG liên quan đến tiếng Anh (ngữ pháp, từ vựng, phát âm, viết, dịch...), trả lời duy nhất:
"Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến học tiếng Anh."

2. Nếu CÓ liên quan, hãy trả lời:
- Ngắn gọn (dưới 12 dòng)
- Dễ hiểu, ngôn ngữ đơn giản
- Có thể kèm ví dụ nếu cần

Câu hỏi của người dùng:
${message}
`;

    const geminiRes = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const reply =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text.trim() ||
      "Xin lỗi, tôi chưa thể phản hồi câu hỏi này.";

    // Lưu phản hồi
    await db.execute(
      `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'assistant', ?)`,
      [userId, reply]
    );

    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err.response?.data || err.message);

    const fallback = "Hiện tại tôi chưa thể phản hồi, vui lòng thử lại sau.";

    await db.execute(
      `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'assistant', ?)`,
      [userId, fallback]
    );

    res.status(500).json({ reply: fallback });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT role, message, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy lịch sử chat", error: err.message });
  }
};
