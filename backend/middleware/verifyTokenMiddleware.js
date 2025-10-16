//backend/middleware/verifyTokenMiddleware.js
const { verifyToken } = require("../services/token");

const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Không có token" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

module.exports = verifyTokenMiddleware;
