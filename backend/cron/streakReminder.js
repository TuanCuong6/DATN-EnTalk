// backend/cron/streakReminder.js
const cron = require("node-cron");
const UserStreak = require("../models/UserStreak");
const { sendPushNotification } = require("../services/notification");

// Gửi thông báo nhắc nhở streak lúc 19h hàng ngày
cron.schedule("0 19 * * *", async () => {
  console.log("🔥 Bắt đầu gửi thông báo nhắc nhở streak lúc 19h");
  
  try {
    const now = new Date();
    const vnOffset = 7 * 60;
    const vnTime = new Date(now.getTime() + vnOffset * 60 * 1000);
    const vnDate = vnTime.toISOString().split('T')[0];

    const users = await UserStreak.getUsersNeedReminder(vnDate);
    
    console.log(`📊 Tìm thấy ${users.length} người dùng cần nhắc nhở streak`);

    for (const user of users) {
      if (user.fcm_token) {
        const title = "Đừng để mất streak! 🔥";
        const body = `Đừng để mất streak ${user.current_streak} ngày của bạn, luyện đọc ngay!`;
        
        try {
          await sendPushNotification(user.fcm_token, title, body);
          console.log(`✅ Đã gửi nhắc nhở streak cho user ${user.name} (streak: ${user.current_streak})`);
        } catch (err) {
          console.error(`❌ Lỗi gửi thông báo cho user ${user.user_id}:`, err.message);
        }
      }
    }
    
    console.log("✅ Hoàn thành gửi thông báo nhắc nhở streak");
  } catch (err) {
    console.error("❌ Lỗi trong cron job streak reminder:", err);
  }
});

// Test mỗi phút (comment lại khi production)
// cron.schedule("* * * * *", async () => {
//   console.log("🧪 Test gửi streak reminder mỗi phút");
//   const now = new Date();
//   const vnOffset = 7 * 60;
//   const vnTime = new Date(now.getTime() + vnOffset * 60 * 1000);
//   const vnDate = vnTime.toISOString().split('T')[0];
//   const users = await UserStreak.getUsersNeedReminder(vnDate);
//   console.log(`📊 ${users.length} users cần nhắc nhở`);
// });

console.log("✅ Streak reminder cron job đã được khởi tạo (19h hàng ngày)");
