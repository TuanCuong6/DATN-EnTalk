//backend/middleware/uploadFeedbackImage.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "entalk/feedbacks",
    allowed_formats: ["jpg", "jpeg", "png"],
    quality: "auto:good", // Giảm chất lượng tự động nhưng vẫn tốt
    format: "jpg", // Chuyển sang JPG để giảm dung lượng
  },
});

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
