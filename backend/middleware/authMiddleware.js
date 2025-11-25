// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token admin" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token admin không hợp lệ" });
  }
};

module.exports = { verifyAdminToken };
