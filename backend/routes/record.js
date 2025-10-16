//backend/routes/record.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const { scoreWithGemini } = require("../services/gemini");
const verifyToken = require("../middleware/verifyTokenMiddleware");

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

      await dbConnection.execute(
        `INSERT INTO records (
          user_id, reading_id, transcript,
          score_pronunciation, score_fluency, score_intonation,
          score_speed, score_overall, comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          readingIdToUse,
          transcript,
          geminiRes.scores.pronunciation,
          geminiRes.scores.fluency,
          geminiRes.scores.intonation,
          geminiRes.scores.speed,
          geminiRes.scores.overall,
          geminiRes.comment,
        ]
      );

      fs.unlinkSync(filePath);

      return res.json({
        transcript,
        originalText,
        scores: geminiRes.scores,
        comment: geminiRes.comment,
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
