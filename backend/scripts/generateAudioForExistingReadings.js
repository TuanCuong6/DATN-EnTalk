// backend/scripts/generateAudioForExistingReadings.js
// Script để generate audio cho tất cả bài đọc hiện có

// Load .env từ thư mục backend
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const db = require("../config/db");
const { generateAudioForReading } = require("../services/audioGenerationService");

async function main() {
  try {
    console.log("🚀 Bắt đầu generate audio cho các bài đọc hiện có...\n");

    // Lấy tất cả bài đọc chưa có audio
    const [readings] = await db.execute(
      `SELECT id, content, level, audio_file 
       FROM readings 
       WHERE is_community_post = FALSE 
       ORDER BY id ASC`
    );

    console.log(`📊 Tìm thấy ${readings.length} bài đọc\n`);

    const needGenerate = readings.filter((r) => !r.audio_file);
    const alreadyHave = readings.filter((r) => r.audio_file);

    console.log(`✅ Đã có audio: ${alreadyHave.length} bài`);
    console.log(`⏳ Cần generate: ${needGenerate.length} bài\n`);

    if (needGenerate.length === 0) {
      console.log("🎉 Tất cả bài đọc đã có audio!");
      process.exit(0);
    }

    // Generate từng bài
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < needGenerate.length; i++) {
      const reading = needGenerate[i];
      console.log(
        `\n[${i + 1}/${needGenerate.length}] Processing Reading #${reading.id} (${reading.level})`
      );
      console.log(`Content: "${reading.content.substring(0, 60)}..."`);

      try {
        await generateAudioForReading(reading.id);
        successCount++;
        console.log(`✅ Thành công!`);
      } catch (error) {
        failCount++;
        console.error(`❌ Thất bại: ${error.message}`);
      }

      // Delay 1 giây giữa các request để không quá tải server
      if (i < needGenerate.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 KẾT QUẢ:");
    console.log(`✅ Thành công: ${successCount} bài`);
    console.log(`❌ Thất bại: ${failCount} bài`);
    console.log(`📁 Tổng cộng: ${readings.length} bài`);
    console.log("=".repeat(60));

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Lỗi nghiêm trọng:", error);
    process.exit(1);
  }
}

// Chạy script
main();
