const db = require("../config/db");
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
        "Xin chào! Tôi là trợ lý tiếng Anh của EnTalk. Bạn có thể hỏi tôi về ngữ pháp, từ vựng, phát âm, dịch thuật, luyện thi IELTS/TOEIC, và mọi thứ liên quan đến tiếng Anh.";
      await db.execute(
        `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'assistant', ?)`,
        [userId, welcomeMessage]
      );
    }

    // Lấy 10 tin nhắn gần nhất để có ngữ cảnh
    const [recentMessages] = await db.execute(
      `SELECT role, message FROM chat_messages 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    // Đảo ngược để có thứ tự đúng (cũ -> mới)
    const contextMessages = recentMessages.reverse();

    // Tạo lịch sử hội thoại cho Gemini
    const conversationHistory = contextMessages
      .map((msg) => `${msg.role === "user" ? "Người dùng" : "Trợ lý"}: ${msg.message}`)
      .join("\n");

    // Lưu câu hỏi mới
    await db.execute(
      `INSERT INTO chat_messages (user_id, role, message) VALUES (?, 'user', ?)`,
      [userId, message]
    );

    // Prompt với ngữ cảnh
    const prompt = `Bạn là trợ lý tiếng Anh của EnTalk.

QUY TẮC TUYỆT ĐỐI:

1. NGÔN NGỮ - QUAN TRỌNG NHẤT:
   - PHÁT HIỆN ngôn ngữ người dùng đang dùng (Việt, Nhật, Anh, Hàn, Trung...)
   - TRẢ LỜI bằng CHÍNH NGÔN NGỮ ĐÓ xuyên suốt cuộc hội thoại
   - KHÔNG BAO GIỜ được chuyển sang ngôn ngữ khác giữa chừng
   - CHỈ dùng tiếng Anh cho: từ vựng, cụm từ, câu ví dụ cần dạy
   - LUÔN giữ nguyên ngôn ngữ kể cả khi câu hỏi ngắn hoặc câu tiếp theo
   
   VD với tiếng Việt:
   - User: "Chào buổi sáng" → Trả lời: "Chào buổi sáng trong tiếng Anh: Good morning..."
   - User: "Buổi chiều thì sao?" → Trả lời: "Buổi chiều dùng: Good afternoon..."
   
   VD với tiếng Nhật:
   - User: "おはようございます" → Trả lời: "朝の挨拶は Good morning..."
   - User: "午後は？" → Trả lời: "午後は Good afternoon..."
   
   VD SAI (TUYỆT ĐỐI KHÔNG ĐƯỢC):
   - "Okay, I understand. You're asking about..."
   - "Sure! Here are some ways..."

2. CÁCH TRẢ LỜI:
   - Đi THẲNG vào câu trả lời
   - KHÔNG lặp lại câu hỏi
   - KHÔNG nói: "Tôi hiểu...", "Okay...", "I understand...", "Dựa vào..."
   - Tự nhiên, không cứng nhắc
   - KHÔNG dùng emoji

3. FORMAT:
   - Dùng dấu đầu dòng (-) hoặc số (1., 2.)
   - Xuống dòng rõ ràng
   - NGẮN GỌN: 7-8 dòng (không dài dòng)
   
   VD:
   "Một số cách chào phổ biến:
   - Good morning (Chào buổi sáng)
   - Good afternoon (Chào buổi chiều)
   - Good evening (Chào buổi tối)"

4. HIỂU NGỮ CẢNH:
   - Đọc lịch sử để hiểu câu hỏi ngắn
   - "tiếp 5 con" → 5 con vật nữa
   - "buổi chiều?" → cách chào buổi chiều
   - Trả lời trực tiếp, không giải thích

5. TỰ HIỂU LÀ TIẾNG ANH:
   - "Cách chào hỏi" → trả lời tiếng Anh
   - "Từ vựng thời tiết" → từ tiếng Anh

6. TỪ CHỐI:
   - Không về tiếng Anh → "Xin lỗi, tôi chỉ hỗ trợ câu hỏi về tiếng Anh."

LỊCH SỬ HỘI THOẠI:
${conversationHistory}

CÂU HỎI:
${message}

Trả lời ngay (7-8 dòng, bằng ngôn ngữ người dùng đang dùng):`;

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
