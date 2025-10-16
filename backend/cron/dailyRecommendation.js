// backend/cron/dailyRecommendation.js
const cron = require("node-cron");
const { recommendOnce } = require("../services/dailyRecommender");

// thông báo lúc 8h sáng, 14h và 20h tối mỗi ngày
cron.schedule("0 8,14,20 * * *", async () => {
  console.log("⏰ Bắt đầu gửi gợi ý luyện tập theo lịch");
  await recommendOnce();
});

// cron.schedule("* * * * *", async () => {
//   console.log("⚡ Gửi gợi ý mỗi phút để test");
//   await recommendOnce();
// });

// cron.schedule("*/5 * * * *", async () => {
//   console.log("🧪 Test gửi notification mỗi 5 phút");
//   await recommendOnce();
// });

// cron.schedule("*/10 * * * *", async () => {
//   console.log("🧪 Test gửi notification mỗi 10 phút");
//   await recommendOnce();
// });
