// backend/services/youtubeReadingService.js
const axios = require("axios");
const {
  CONTENT_LIMITS,
  validateContentLength,
} = require("../config/contentLimits");

const GEMINI_API_KEY5 = process.env.GEMINI_API_KEY5;
const VCYON_API_KEY = process.env.VCYON_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY5}`;
const VCYON_API_URL = "https://api.vcyon.com/v1/youtube/transcript";

const YTB_LIMITS = CONTENT_LIMITS.YOUTUBE_READING;

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([^&\n?#]+)/, // Normal video
    /youtube\.com\/shorts\/([^&\n?#]+)/, // YouTube Shorts
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error("URL YouTube không hợp lệ");
}

// Get subtitle from YouTube using vcyon API
async function getYoutubeSubtitle(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    console.log(`📺 Đang tải subtitle từ video: ${videoId}`);
    console.log(
      `🔑 API Key: ${
        VCYON_API_KEY ? VCYON_API_KEY.substring(0, 20) + "..." : "NOT SET"
      }`
    );
    console.log(`🌐 Request URL: ${VCYON_API_URL}?videoId=${videoId}`);

    const response = await axios.get(`${VCYON_API_URL}?videoId=${videoId}`, {
      headers: {
        Authorization: `Bearer ${VCYON_API_KEY}`,
      },
    });

    console.log(`✅ Response status: ${response.status}`);
    console.log(`📦 Response data:`, JSON.stringify(response.data, null, 2));

    const data = response.data;

    if (!data.success) {
      throw new Error("Không thể lấy thông tin video");
    }

    if (!data.data.hasTranscript) {
      throw new Error("Video này không có phụ đề");
    }

    const fullText = data.data.text;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Phụ đề trống");
    }

    console.log(`✅ Đã tải subtitle (${fullText.length} ký tự)`);
    console.log(`📝 Ngôn ngữ phụ đề: ${data.data.language}`);

    return fullText;
  } catch (err) {
    console.error("❌ Lỗi tải subtitle:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Response status:", err.response?.status);
    console.error(
      "❌ Response data:",
      JSON.stringify(err.response?.data, null, 2)
    );
    console.error("❌ Full error:", err);

    if (err.response?.status === 401) {
      throw new Error(
        "⚠️ Lỗi cấu hình: API key vcyon chưa được thiết lập hoặc không hợp lệ. Vui lòng liên hệ quản trị viên."
      );
    }

    if (err.response?.status === 403) {
      throw new Error("⚠️ API key đã hết hạn hoặc không có quyền truy cập.");
    }

    if (err.message.includes("không có phụ đề")) {
      throw new Error(
        "❌ Video này không có phụ đề. Vui lòng chọn video khác có phụ đề."
      );
    }

    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      throw new Error(
        "⚠️ Không thể kết nối đến dịch vụ vcyon. Vui lòng kiểm tra kết nối mạng."
      );
    }

    throw new Error(
      "❌ Không thể tải phụ đề từ video này. Vui lòng kiểm tra:\n• Video có phụ đề\n• Link YouTube hợp lệ\n• Video không bị giới hạn vùng"
    );
  }
}

// Generate summary from subtitle
async function generateSummary(subtitle) {
  try {
    const prompt = `
Bạn là một giáo viên tiếng Anh. Hãy tóm tắt nội dung video sau thành 1-2 câu ngắn gọn bằng tiếng Việt:

PHỤ ĐỀ (có thể là tiếng Anh hoặc ngôn ngữ khác):
"${subtitle.substring(0, 1500)}"

YÊU CẦU:
- Tóm tắt bằng TIẾNG VIỆT
- 1-2 câu ngắn gọn
- Nêu nội dung chính của video

CHỈ TRẢ VỀ TÓM TẮT, KHÔNG GIẢI THÍCH THÊM.
`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const summary =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return summary.trim();
  } catch (err) {
    console.error("❌ Lỗi tạo summary:", err.message);
    return "Video có nội dung tiếng Anh phù hợp để luyện đọc.";
  }
}

// Generate reading lesson from subtitle
async function generateReadingFromSubtitle(subtitle) {
  try {
    const prompt = `
Bạn là một giáo viên tiếng Anh chuyên nghiệp.

Từ phụ đề video sau (có thể là tiếng Anh hoặc ngôn ngữ khác), hãy tạo một bài đọc TIẾNG ANH ngắn để học sinh luyện đọc:

PHỤ ĐỀ:
"${subtitle.substring(0, 2500)}"

YÊU CẦU:
- Nếu phụ đề là tiếng Anh: Chọn ra các câu HAY NHẤT, THÚ VỊ NHẤT
- Nếu phụ đề là ngôn ngữ khác: Dịch nội dung chính sang tiếng Anh
- Bài đọc PHẢI HOÀN TOÀN BẰNG TIẾNG ANH
- Độ dài: CHÍNH XÁC ${YTB_LIMITS.min}-${
      YTB_LIMITS.max
    } từ (QUAN TRỌNG: đếm từ chính xác)
- KHÔNG được vượt quá ${YTB_LIMITS.max} từ
- Ưu tiên câu có từ vựng hữu ích, cấu trúc rõ ràng
- Sắp xếp lại cho mạch lạc, dễ hiểu
- Loại bỏ các ký tự đặc biệt, chỉ giữ lại văn bản thuần túy
- Nội dung phải tự nhiên, phù hợp để luyện phát âm

CHỈ TRẢ VỀ BÀI ĐỌC TIẾNG ANH, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
`;

    console.log("🎯 Gọi Gemini để tạo bài đọc từ subtitle...");

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const content =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new Error("Gemini không trả về nội dung");
    }

    // Validate độ dài
    const validation = validateContentLength(trimmedContent, "YOUTUBE_READING");
    console.log(`📊 Validation: ${validation.message}`);

    if (!validation.valid) {
      console.warn(
        `⚠️ Bài đọc YouTube không đúng độ dài: ${validation.wordCount} từ (yêu cầu: ${validation.min}-${validation.max})`
      );
    }

    console.log(`✅ Đã tạo bài đọc từ YouTube (${validation.wordCount} từ)`);
    return trimmedContent;
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini AI:", err.response?.data || err.message);
    throw new Error("Không thể tạo bài đọc từ video này");
  }
}

module.exports = {
  getYoutubeSubtitle,
  generateSummary,
  generateReadingFromSubtitle,
  extractVideoId,
};
