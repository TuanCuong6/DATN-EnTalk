//backend/routes/record.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const { scoreWithGemini } = require("../services/gemini");
const verifyToken = require("../middleware/verifyTokenMiddleware");
const ReadingProgress = require("../models/ReadingProgress");
const { updateStreakOnPractice } = require("../controllers/streakController");

const db = require("../models");
const dbConnection = require("../config/db");

const upload = multer({ dest: "uploads/" });

router.post(
  "/record",
  verifyToken,
  upload.single("audio"),
  async (req, res) => {
    try {
      const filePath = req.file?.path;
      const readingId = req.body.readingId;
      const customText = req.body.customText;
      const userId = req.user.id;

      if (!filePath) {
        return res.status(400).json({ message: "Không tìm thấy file audio" });
      }

      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const whisperRes = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        { headers: formData.getHeaders() }
      );
      const transcript = whisperRes.data.transcript;
      console.log("✅ Transcript từ Whisper:", transcript);

      let originalText = null;
      let readingIdToUse = readingId;

      if (readingId) {
        const reading = await db.Reading.findByPk(readingId);
        if (!reading) {
          return res
            .status(404)
            .json({ message: "Không tìm thấy bài đọc mẫu" });
        }
        originalText = reading.content;
      } else if (customText) {
        originalText = customText;
        const [result] = await dbConnection.execute(
          `INSERT INTO readings (content, level, topic_id, created_by, is_community_post)
           VALUES (?, ?, NULL, ?, TRUE)`,
          [customText, "A1", userId]
        );
        readingIdToUse = result.insertId;
      }

      const geminiRes = await scoreWithGemini(transcript, originalText);

      // thêm word_analysis
      await dbConnection.execute(
        `INSERT INTO records (
    user_id, reading_id, original_content, transcript,
    score_pronunciation, score_fluency, score_intonation,
    score_speed, score_overall, comment, word_analysis, custom_text
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          readingIdToUse,
          originalText, // Lưu original_content
          transcript,
          geminiRes.scores.pronunciation,
          geminiRes.scores.fluency,
          geminiRes.scores.intonation,
          geminiRes.scores.speed,
          geminiRes.scores.overall,
          geminiRes.comment,
          JSON.stringify(geminiRes.wordAnalysis || []), // Lưu word analysis
          customText || null, // custom_text
        ]
      );

      // Cập nhật reading progress (chỉ với bài đọc có sẵn, không phải custom)
      if (readingId && geminiRes.scores.overall) {
        try {
          await ReadingProgress.updateProgress(
            userId,
            readingIdToUse,
            geminiRes.scores.overall
          );
          console.log(" Đã cập nhật reading progress");
        } catch (progressErr) {
          console.error("Lỗi cập nhật progress (không ảnh hưởng):", progressErr);
        }
      }

      // Cập nhật streak khi user luyện đọc
      try {
        const streakResult = await updateStreakOnPractice(userId);
        console.log("Đã cập nhật streak:", streakResult);
      } catch (streakErr) {
        console.error("Lỗi cập nhật streak (không ảnh hưởng):", streakErr);
      }

      fs.unlinkSync(filePath);

      return res.json({
        transcript,
        originalText,
        scores: geminiRes.scores,
        comment: geminiRes.comment,
        wordAnalysis: geminiRes.wordAnalysis || [],
      });
    } catch (err) {
      console.error("❌ Lỗi xử lý file ghi âm:", err);
      return res
        .status(500)
        .json({ message: "Lỗi xử lý file ghi âm", error: err.message });
    }
  }
);

module.exports = router;
