// backend/routes/uploadImage.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { verifyAdminToken } = require("../middleware/authMiddleware");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB (giảm từ 10MB để tránh timeout)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
  },
});

// Error handler cho multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Ảnh quá lớn! Vui lòng chọn ảnh < 5MB",
        error: "FILE_TOO_LARGE",
      });
    }
  }
  next(err);
};

// Upload image endpoint
router.post("/", verifyAdminToken, upload.single("image"), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file ảnh" });
    }

    console.log(`📤 Uploading image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    // Upload to Cloudinary using buffer with timeout + auto compress
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Upload timeout sau 30 giây"));
      }, 30000); // 30 seconds timeout

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "email_marketing",
          resource_type: "image",
          timeout: 60000,
          // Auto compress & optimize
          transformation: [
            { width: 1200, crop: "limit" }, // Max width 1200px
            { quality: "auto:good" }, // Auto quality optimization
            { fetch_format: "auto" }, // Auto format (WebP if supported)
          ],
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) {
            console.error("❌ Cloudinary error:", error);
            reject(error);
          } else {
            console.log("✅ Upload success:", result.secure_url);
            console.log(`   Original: ${(req.file.size / 1024).toFixed(2)} KB → Optimized: ${(result.bytes / 1024).toFixed(2)} KB`);
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    
    // Better error messages
    let message = "Lỗi khi upload ảnh";
    if (error.code === "ECONNRESET") {
      message = "Kết nối bị ngắt. Ảnh có thể quá lớn hoặc mạng không ổn định. Thử lại với ảnh nhỏ hơn.";
    } else if (error.message.includes("timeout")) {
      message = "Upload timeout. Vui lòng thử lại với ảnh nhỏ hơn.";
    }
    
    res.status(500).json({
      message,
      error: error.message,
      code: error.code,
      suggestion: "Thử nén ảnh hoặc chọn ảnh < 2MB để upload nhanh hơn",
    });
  }
});

module.exports = router;
