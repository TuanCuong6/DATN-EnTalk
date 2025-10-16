//backend/services/notification.js
const admin = require("./firebase");

async function sendPushNotification(fcmToken, title, body, data = {}) {
  const message = {
    notification: { title, body },
    token: fcmToken,
    data: Object.entries(data).reduce((acc, [k, v]) => {
      acc[k] = String(v);
      return acc;
    }, {}),
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Gửi thông báo thành công:", response);
  } catch (err) {
    console.error("❌ Lỗi gửi FCM:", err.message);
  }
}

module.exports = { sendPushNotification };
