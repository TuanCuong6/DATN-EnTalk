//backend/middleware/uploadFeedbackImage.js
const multer = require("multer");

const storage = multer.memoryStorage(); // ảnh chỉ giữ trong RAM tạm thời

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    if (!isImage) {
      return cb(new Error("Chỉ hỗ trợ file ảnh"));
    }
    cb(null, true);
  },
});

module.exports = upload.single("screenshot");
