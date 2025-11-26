// backend/services/audioGenerationService.js
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");
const db = require("../config/db");

const PIPER_SERVER_URL = process.env.PIPER_SERVER_URL || "http://localhost:5001";
const AUDIO_DIR = path.join(__dirname, "../uploads/audio");

// Tạo thư mục audio nếu chưa có
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log("✅ Đã tạo thư mục:", AUDIO_DIR);
}

/**
 * Generate audio file từ text và lưu vào server
 * @param {string} text - Nội dung cần chuyển thành audio
 * @param {number} readingId - ID của bài đọc
 * @returns {Promise<string>} - Đường dẫn file audio (relative path)
 */
async function generateAndSaveAudio(text, readingId) {
  try {
    console.log(`🎯 [Reading ${readingId}] Bắt đầu generate audio...`);

    // Gọi Piper server để tạo WAV
    const response = await axios.post(
      `${PIPER_SERVER_URL}/synthesize`,
      { text },
      {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log(`✅ [Reading ${readingId}] Nhận WAV: ${response.data.length} bytes`);

    // Tạo file tạm
    const tempDir = os.tmpdir();
    const tempWavPath = path.join(tempDir, `reading_${readingId}_${Date.now()}.wav`);
    const tempMp3Path = path.join(tempDir, `reading_${readingId}_${Date.now()}.mp3`);

    // Lưu WAV
    fs.writeFileSync(tempWavPath, Buffer.from(response.data));

    // Chuyển WAV sang MP3
    await new Promise((resolve, reject) => {
      ffmpeg(tempWavPath)
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .audioChannels(1)
        .audioFrequency(22050)
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(tempMp3Path);
    });

    console.log(`✅ [Reading ${readingId}] Đã chuyển sang MP3`);

    // Lưu MP3 vào thư mục uploads/audio
    const finalFileName = `reading_${readingId}_${Date.now()}.mp3`;
    const finalPath = path.join(AUDIO_DIR, finalFileName);
    fs.copyFileSync(tempMp3Path, finalPath);

    // Cleanup temp files
    fs.unlinkSync(tempWavPath);
    fs.unlinkSync(tempMp3Path);

    console.log(`✅ [Reading ${readingId}] Đã lưu audio: ${finalFileName}`);

    // Return relative path để lưu vào DB
    return `uploads/audio/${finalFileName}`;
  } catch (error) {
    console.error(`❌ [Reading ${readingId}] Lỗi generate audio:`, error.message);
    throw error;
  }
}

/**
 * Generate audio và update DB cho 1 bài đọc
 * @param {number} readingId - ID của bài đọc
 */
async function generateAudioForReading(readingId) {
  try {
    // Lấy nội dung bài đọc
    const [rows] = await db.execute(
      "SELECT id, content, audio_file FROM readings WHERE id = ?",
      [readingId]
    );

    if (rows.length === 0) {
      throw new Error(`Không tìm thấy bài đọc ID ${readingId}`);
    }

    const reading = rows[0];

    // Nếu đã có audio, xóa file cũ
    if (reading.audio_file) {
      const oldPath = path.join(__dirname, "..", reading.audio_file);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log(`🗑️  Đã xóa audio cũ: ${reading.audio_file}`);
      }
    }

    // Generate audio mới
    const audioPath = await generateAndSaveAudio(reading.content, reading.id);

    // Update DB
    await db.execute(
      "UPDATE readings SET audio_file = ?, audio_generated_at = NOW() WHERE id = ?",
      [audioPath, reading.id]
    );

    console.log(`✅ [Reading ${readingId}] Hoàn thành! Audio: ${audioPath}`);
    return audioPath;
  } catch (error) {
    console.error(`❌ [Reading ${readingId}] Lỗi:`, error.message);
    throw error;
  }
}

/**
 * Generate audio cho nhiều bài đọc (batch)
 * @param {number[]} readingIds - Mảng ID các bài đọc
 */
async function generateAudioBatch(readingIds) {
  const results = {
    success: [],
    failed: [],
  };

  for (const id of readingIds) {
    try {
      await generateAudioForReading(id);
      results.success.push(id);
    } catch (error) {
      results.failed.push({ id, error: error.message });
    }
  }

  return results;
}

module.exports = {
  generateAndSaveAudio,
  generateAudioForReading,
  generateAudioBatch,
};
