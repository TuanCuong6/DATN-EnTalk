//backend/services/mailer.js
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendVerificationCode = async (to, code) => {
  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to,
    subject: "Mã xác nhận đăng ký EnTalk",
    text: `Mã xác nhận của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendNewPasswordEmail = async (to, newPassword) => {
  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to,
    subject: "Mật khẩu mới - EnTalk",
    text: `Mật khẩu mới của bạn là: ${newPassword}. Hãy đăng nhập và đổi mật khẩu nếu cần.`,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendFeedbackEmail = async ({ fromUser, userId, content, file }) => {
  const mailOptions = {
    from: `"EnTalk Feedback" <${process.env.MAIL_USER}>`,
    to: "vubatuancuong2306@gmail.com", //thay bằng email các bạn muốn nhận được thông báo
    subject: `🧪 Góp ý từ người dùng EnTalk`,
    text: `Người dùng: ${fromUser} (ID: ${userId})\n\nNội dung góp ý:\n${content}`,
    attachments: [],
  };

  if (file) {
    mailOptions.attachments.push({
      filename: file.originalname || "screenshot.jpg",
      content: file.buffer,
      contentType: file.mimetype,
    });
  }

  await transporter.sendMail(mailOptions);
};
