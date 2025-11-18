// backend/routes/tts.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PIPER_SERVER_URL = process.env.PIPER_SERVER_URL || "http://localhost:5001";

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(`${PIPER_SERVER_URL}/health`, {
      timeout: 5000,
    });
    res.json({ status: "ok", piper: response.data });
  } catch (error) {
    console.error("❌ Piper server không phản hồi:", error.message);
    res.status(503).json({
      status: "error",
      message: "Piper TTS server không khả dụng",
    });
  }
});

// Text-to-Speech endpoint
router.post("/synthesize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Không có nội dung để chuyển đổi" });
    }

    console.log(`🎯 Đang tạo audio cho: "${text.substring(0, 50)}..."`);

    // Gọi Piper server
    const response = await axios.post(
      `${PIPER_SERVER_URL}/synthesize`,
      { text },
      {
        responseType: "arraybuffer",
        timeout: 60000, // 60 seconds - tăng timeout cho văn bản dài
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Đã nhận WAV từ Piper: ${response.data.length} bytes`);
    console.log(`🔄 Đang chuyển WAV sang MP3...`);

    // Tạo file tạm cho WAV và MP3
    const tempDir = os.tmpdir();
    const tempWavPath = path.join(tempDir, `tts_${Date.now()}.wav`);
    const tempMp3Path = path.join(tempDir, `tts_${Date.now()}.mp3`);

    try {
      // Lưu WAV vào file tạm
      fs.writeFileSync(tempWavPath, Buffer.from(response.data));
      console.log(`📁 Đã lưu WAV tạm: ${tempWavPath}`);

      // Chuyển đổi WAV sang MP3
      await new Promise((resolve, reject) => {
        ffmpeg(tempWavPath)
          .audioCodec('libmp3lame')
          .audioBitrate(128)
          .audioChannels(1)
          .audioFrequency(22050)
          .format('mp3')
          .on('start', (commandLine) => {
            console.log('🎵 FFmpeg command:', commandLine);
          })
          .on('end', () => {
            console.log('✅ Đã chuyển đổi sang MP3 thành công');
            resolve();
          })
          .on('error', (err) => {
            console.error('❌ Lỗi FFmpeg:', err.message);
            reject(err);
          })
          .save(tempMp3Path);
      });

      // Đọc MP3 và gửi về client
      const mp3Buffer = fs.readFileSync(tempMp3Path);
      console.log(`✅ Đã tạo MP3: ${mp3Buffer.length} bytes`);

      // Set headers cho MP3
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": mp3Buffer.length,
      });
      res.send(mp3Buffer);

      // Cleanup files tạm
      fs.unlinkSync(tempWavPath);
      fs.unlinkSync(tempMp3Path);
      console.log('🗑️  Đã xóa files tạm');

    } catch (conversionError) {
      console.error('❌ Lỗi chuyển đổi:', conversionError.message);
      
      // Cleanup nếu có lỗi
      if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath);
      if (fs.existsSync(tempMp3Path)) fs.unlinkSync(tempMp3Path);

      return res.status(500).json({
        message: "Không thể chuyển đổi audio sang MP3",
        error: conversionError.message,
      });
    }
  } catch (error) {
    console.error("❌ Lỗi TTS:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response?.status);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "Piper TTS server chưa khởi động. Vui lòng khởi động server trước.",
      });
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return res.status(504).json({
        message: "Yêu cầu quá lâu. Văn bản có thể quá dài hoặc server đang bận.",
      });
    }

    res.status(500).json({
      message: "Không thể tạo audio",
      error: error.message,
    });
  }
});

module.exports = router;
