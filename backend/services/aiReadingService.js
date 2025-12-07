// backend/services/aiReadingService.js
const axios = require("axios");
const db = require("../config/db");
const {
  CONTENT_LIMITS,
  validateContentLength,
} = require("../config/contentLimits");

const GEMINI_API_KEY5 = process.env.GEMINI_API_KEY5;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY5}`;

const AI_LIMITS = CONTENT_LIMITS.AI_GENERATED;

const PROMPT_TEMPLATE = `
Bạn là một giáo viên tiếng Anh chuyên nghiệp.

Hãy tạo một bài đọc tiếng Anh ngắn về chủ đề: "{{topic}}"

{{description}}

YÊU CẦU:
- Bài đọc phải HOÀN TOÀN MỚI và KHÁC BIỆT với các bài đã tạo trước đó
- Độ dài: CHÍNH XÁC ${AI_LIMITS.min}-${AI_LIMITS.max} từ (QUAN TRỌNG: đếm từ chính xác)
- Ngôn ngữ: Tiếng Anh đơn giản, dễ hiểu (trình độ A1-B1)
- Nội dung: Thú vị, thực tế, dễ hình dung
- Không sử dụng từ vựng quá khó hoặc cấu trúc phức tạp
- KHÔNG được vượt quá ${AI_LIMITS.max} từ

{{history}}

CHỈ TRẢ VỀ NỘI DUNG BÀI ĐỌC, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
`;

async function generateReadingContent(topic, description = "", userId) {
  try {
    // Lấy lịch sử các bài đọc custom gần đây của user để tránh trùng lặp
    const [recentReadings] = await db.execute(
      `SELECT custom_text 
       FROM records 
       WHERE user_id = ? AND custom_text IS NOT NULL 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    let historyText = "";
    if (recentReadings.length > 0) {
      const previousTexts = recentReadings
        .map((r, i) => `${i + 1}. ${r.custom_text}`)
        .join("\n");
      historyText = `\nCÁC BÀI ĐÃ TẠO TRƯỚC ĐÓ (TRÁNH TRÙNG LẶP):\n${previousTexts}`;
    }

    const descriptionText = description ? `Mô tả chi tiết: ${description}` : "";

    const prompt = PROMPT_TEMPLATE.replace("{{topic}}", topic)
      .replace("{{description}}", descriptionText)
      .replace("{{history}}", historyText);

    console.log("🎯 Gọi Gemini API để tạo bài đọc...");

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const content =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!content.trim()) {
      throw new Error("Gemini không trả về nội dung");
    }

    const trimmedContent = content.trim();

    // Validate độ dài
    const validation = validateContentLength(trimmedContent, "AI_GENERATED");
    console.log(`📊 Validation: ${validation.message}`);

    if (!validation.valid) {
      console.warn(
        `⚠️ Bài đọc AI tạo không đúng độ dài: ${validation.wordCount} từ (yêu cầu: ${validation.min}-${validation.max})`
      );
      // Vẫn trả về nhưng log warning
    }

    console.log(
      `✅ Đã tạo bài đọc: "${trimmedContent.substring(0, 50)}..." (${
        validation.wordCount
      } từ)`
    );

    return trimmedContent;
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini AI:", err.response?.data || err.message);
    throw new Error("Không thể tạo bài đọc với AI");
  }
}

module.exports = { generateReadingContent };
