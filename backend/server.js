//backend/server.js
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/record");
const readingRoutes = require("./routes/reading");
const topicRoutes = require("./routes/topic");
const historyRoutes = require("./routes/history");
const notificationRoutes = require("./routes/notification");
const recommendationRoutes = require("./routes/recommendation");
const chatRoutes = require("./routes/chat");
const feedbackRoutes = require("./routes/feedback");

// Thêm vào backend/server.js
const adminRoutes = require("./routes/admin");
const ttsRoutes = require("./routes/tts");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/reading", recordRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/recommend", recommendationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/feedback", feedbackRoutes);

// Thêm sau các route khác
app.use("/api/admin", adminRoutes);
app.use("/api/tts", ttsRoutes);

app.listen(3000, () => {
  console.log("✅ Server is running on port 3000");
});
require("./cron/dailyRecommendation");
