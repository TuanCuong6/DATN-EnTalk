// backend/controllers/streakController.js
const UserStreak = require("../models/UserStreak");

// Lấy thông tin streak của user
exports.getStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    let streak = await UserStreak.getStreak(userId);

    if (!streak) {
      try {
        await UserStreak.createStreak(userId);
        streak = await UserStreak.getStreak(userId);
      } catch (createErr) {
        // Nếu bị duplicate (user đã có streak), lấy lại
        if (createErr.code === 'ER_DUP_ENTRY') {
          streak = await UserStreak.getStreak(userId);
        } else {
          throw createErr;
        }
      }
    }

    // Tính thời gian còn lại đến hết ngày (theo giờ VN)
    const now = new Date();
    const vnOffset = 7 * 60; // UTC+7
    const vnTime = new Date(now.getTime() + vnOffset * 60 * 1000);
    const endOfDay = new Date(vnTime);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const timeLeft = endOfDay - vnTime;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Kiểm tra đã luyện hôm nay chưa
    const today = vnTime.toISOString().split('T')[0];
    let practicedToday = false;
    
    if (streak.last_practice_date) {
      // Chuyển last_practice_date sang VN timezone để so sánh
      const lastPracticeDate = new Date(streak.last_practice_date);
      const lastPracticeVN = new Date(lastPracticeDate.getTime() + vnOffset * 60 * 1000);
      const lastPractice = lastPracticeVN.toISOString().split('T')[0];
      practicedToday = lastPractice === today;
      
      console.log('🔍 Debug streak:');
      console.log('  - Today (VN):', today);
      console.log('  - Last practice (DB):', streak.last_practice_date);
      console.log('  - Last practice (VN):', lastPractice);
      console.log('  - Practiced today:', practicedToday);
    }

    res.json({
      ...streak,
      practiced_today: practicedToday,
      time_left: {
        hours: hoursLeft,
        minutes: minutesLeft,
        total_minutes: Math.floor(timeLeft / (1000 * 60))
      }
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy streak:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Cập nhật streak khi user luyện đọc (được gọi từ recordController)
exports.updateStreakOnPractice = async (userId) => {
  try {
    const now = new Date();
    const vnOffset = 7 * 60;
    const vnTime = new Date(now.getTime() + vnOffset * 60 * 1000);
    const vnDate = vnTime.toISOString().split('T')[0];

    console.log('🔥 Updating streak for user', userId, 'with VN date:', vnDate);
    const result = await UserStreak.updateStreak(userId, vnDate);
    console.log('✅ Streak updated:', result);
    return result;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật streak:", err);
    throw err;
  }
};
