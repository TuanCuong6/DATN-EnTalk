//backend/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../services/token");
const {
  sendVerificationCode,
  sendNewPasswordEmail,
} = require("../services/mailer");

const generateRandomCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check nếu email đã tồn tại
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email đã tồn tại" });

    // Xoá mã cũ và tạo mới
    await db.execute("DELETE FROM email_verifications WHERE email = ?", [
      email,
    ]);
    const code = generateRandomCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await db.execute(
      "INSERT INTO email_verifications (email, verification_code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt]
    );
    await sendVerificationCode(email, code);
    res.status(200).json({ message: "Mã xác nhận đã gửi về email" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, code, name, password } = req.body;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM email_verifications WHERE email = ? AND verification_code = ?",
      [email, code]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: "Mã xác nhận không đúng" });

    const expiresAt = new Date(rows[0].expires_at);
    if (expiresAt < new Date())
      return res.status(400).json({ message: "Mã đã hết hạn" });

    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, ?)",
      [name, email, hash, true]
    );
    await db.execute("DELETE FROM email_verifications WHERE email = ?", [
      email,
    ]);
    res.status(201).json({ message: "Xác minh thành công. Mời đăng nhập." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Email không tồn tại" });

    const user = rows[0];
    if (!user.is_verified)
      return res.status(403).json({ message: "Tài khoản chưa xác minh" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, level: user.level },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Email không tồn tại" });

    const newPassword = generateRandomCode(); // dùng lại hàm sinh 6 số
    const hash = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password_hash = ? WHERE email = ?", [
      hash,
      email,
    ]);
    await sendNewPasswordEmail(email, newPassword);

    res.json({ message: "Mật khẩu mới đã gửi về email" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 1. Lấy thông tin người dùng
exports.getProfile = async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, name, email, avatar_url FROM users WHERE id = ?",
    [req.user.id]
  );
  res.json(rows[0]);
};

// 2. Cập nhật tên và avatar_url
exports.updateProfile = async (req, res) => {
  const { name, avatar_url } = req.body;
  await db.execute("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?", [
    name,
    avatar_url,
    req.user.id,
  ]);
  res.json({ message: "Cập nhật thành công" });
};

// 3. Đổi mật khẩu
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Mật khẩu mới không khớp" });

  const [rows] = await db.execute(
    "SELECT password_hash FROM users WHERE id = ?",
    [req.user.id]
  );
  const match = await bcrypt.compare(oldPassword, rows[0].password_hash);
  if (!match) return res.status(400).json({ message: "Sai mật khẩu cũ" });

  const hash = await bcrypt.hash(newPassword, 10);
  await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
    hash,
    req.user.id,
  ]);
  res.json({ message: "Đổi mật khẩu thành công" });
};

// 4. Upload avatar → đã dùng cloudinary
exports.uploadAvatar = async (req, res) => {
  const avatarUrl = req.file.path;
  await db.execute("UPDATE users SET avatar_url = ? WHERE id = ?", [
    avatarUrl,
    req.user.id,
  ]);
  res.json({ message: "Upload thành công", avatar_url: avatarUrl });
};
