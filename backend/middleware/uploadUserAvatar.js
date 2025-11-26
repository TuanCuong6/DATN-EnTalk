//backend/middleware/uploadUserAvatar.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "entalk/users",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 200, height: 200, crop: "fill" }],
  },
});

module.exports = multer({ storage });
