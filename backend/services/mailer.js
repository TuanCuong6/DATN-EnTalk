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

// Hàm gửi email feedback đến admin
exports.sendFeedbackEmail = async ({
  fromUser,
  userId,
  content,
  rating,
  screenshot_url,
  hasImage,
}) => {
  // Tạo rating stars (using HTML entities)
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const ratingColor = [
    "",
    "#dc3545",
    "#fd7e14",
    "#ffc107",
    "#28a745",
    "#20c997",
  ][rating];

  let imageSection = "";
  if (hasImage && screenshot_url) {
    imageSection = `
      <div style="margin: 25px 0;">
        <div style="font-size: 16px; color: #2c3e50; margin-bottom: 12px; font-weight: 600;">📸 Ảnh đính kèm</div>
        <div style="text-align: center; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <img src="${screenshot_url}" alt="Screenshot" style="max-width: 100%; max-height: 350px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="margin-top: 10px;">
            <a href="${screenshot_url}" target="_blank" style="color: #5E72EB; text-decoration: none; font-size: 14px; font-weight: 500;">
              👁 Xem ảnh gốc
            </a>
          </div>
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to: "vubatuancuong2306@gmail.com",
    subject: `📧 Phản hồi mới từ ${fromUser}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3e50;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #5E72EB 0%, #3D50EB 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">EnTalk</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Có phản hồi mới từ người dùng</p>
        </div>

        <!-- Content Container -->
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Rating Card -->
          <div style="background: linear-gradient(135deg, #fff9e6 0%, #ffeaa7 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; border: 2px solid ${ratingColor};">
            <div style="font-size: 48px;">${stars}</div>
          </div>

          <!-- User Info Card -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #5E72EB; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: 600;">👤 Thông tin người gửi</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <div style="font-size: 14px; color: #6c757d; margin-bottom: 4px;">Email</div>
                <div style="font-weight: 500; color: #2c3e50;">${fromUser}</div>
              </div>
              <div>
                <div style="font-size: 14px; color: #6c757d; margin-bottom: 4px;">User ID</div>
                <div style="font-weight: 500; color: #2c3e50;">${userId}</div>
              </div>
            </div>
          </div>

          <!-- Feedback Content -->
          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: 600;">💬 Nội dung phản hồi</h3>
            <div style="background: #fff9e6; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #856404;">${content}</p>
            </div>
          </div>

          <!-- Image Section -->
          ${imageSection}

          <!-- Action Card -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 8px; text-align: center; margin-top: 25px;">
            <p style="margin: 0; color: #1565c0; font-weight: 500;">
              Đăng nhập vào 
              <a href="http://localhost:3001/feedbacks" 
                 style="color: #5E72EB; text-decoration: none; font-weight: 600; background: white; padding: 6px 12px; border-radius: 4px; margin-left: 8px;">
                Admin Panel
              </a> 
              để phản hồi lại
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px;">
          <p style="margin: 0;">EnTalk - Hệ thống luyện nói tiếng Anh thông minh</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email reply đến user
exports.sendReplyEmail = async ({
  to,
  user_name,
  original_content,
  reply_content,
  screenshot_url,
}) => {
  let imageSection = "";
  if (screenshot_url) {
    imageSection = `
      <div style="margin: 25px 0;">
        <div style="font-size: 16px; color: #2c3e50; margin-bottom: 12px; font-weight: 600;">📷 Ảnh bạn đã gửi</div>
        <div style="text-align: center; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <img src="${screenshot_url}" alt="Your screenshot" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to: to,
    subject: "📬 Phản hồi từ EnTalk",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3e50;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #5E72EB 0%, #3D50EB 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">EnTalk</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Phản hồi từ đội ngũ hỗ trợ</p>
        </div>

        <!-- Content Container -->
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Original Feedback -->
          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: 600;">💬 Nội dung góp ý của bạn</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #6c757d;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #495057;">${original_content}</p>
            </div>
          </div>

          <!-- User's Image -->
          ${imageSection}

          <!-- Admin Reply -->
          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: 600;">💌 Phản hồi từ EnTalk</h3>
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #155724;">${reply_content}</p>
            </div>
          </div>

          <!-- Thank You Card -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 25px; border-radius: 8px; text-align: center;">
            <div style="font-size: 20px; color: #2e7d32; margin-bottom: 10px;">🫶💖</div>
            <p style="margin: 0; color: #2e7d32; font-weight: 500; line-height: 1.5;">
              Cảm ơn bạn đã đóng góp ý kiến cho EnTalk<br>
              <span style="font-size: 14px; color: #388e3c;">Chúng tôi luôn lắng nghe để cải thiện sản phẩm</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px;">
          <p style="margin: 0;">EnTalk - Hệ thống luyện nói tiếng Anh thông minh</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email xác nhận cho người dùng sau khi gửi góp ý
exports.sendFeedbackConfirmationEmail = async ({
  to,
  user_name,
  content,
  rating,
  screenshot_url,
}) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  let imageSection = "";
  if (screenshot_url) {
    imageSection = `
      <div style="margin: 25px 0;">
        <div style="font-size: 16px; color: #2c3e50; margin-bottom: 12px; font-weight: 600;">📷 Ảnh bạn đã gửi</div>
        <div style="text-align: center; background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <img src="${screenshot_url}" alt="Your screenshot" style="max-width: 100%; max-height: 300px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        </div>
      </div>
    `;
  }

  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to: to,
    subject: "Đã nhận được góp ý của bạn - EnTalk",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #2c3e50;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #5E72EB 0%, #3D50EB 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; color: white; font-weight: 700;">EnTalk</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Cảm ơn bạn đã góp ý!</p>
        </div>

        <!-- Content Container -->
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Thank You Message -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <div style="font-size: 48px; margin-bottom: 15px;">🫶💖</div>
            <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 24px; font-weight: 700;">Cảm ơn bạn đã góp ý!</h2>
            <p style="margin: 0; color: #388e3c; font-size: 16px; line-height: 1.5;">
              Chúng tôi đã nhận được phản hồi của bạn và sẽ xem xét kỹ lưỡng.<br>
              <strong>Chúng tôi sẽ phản hồi lại bạn trong thời gian sớm nhất.</strong>
            </p>
          </div>

          <!-- Rating -->
          <div style="background: linear-gradient(135deg, #fff9e6 0%, #ffeaa7 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <div style="font-size: 14px; color: #856404; margin-bottom: 8px; font-weight: 600;">Đánh giá của bạn</div>
            <div style="font-size: 36px;">${stars}</div>
          </div>

          <!-- Feedback Content -->
          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2c3e50; font-weight: 600;">💬 Nội dung góp ý của bạn</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #5E72EB;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #495057;">${content}</p>
            </div>
          </div>

          <!-- Image Section -->
          ${imageSection}

          <!-- Info Card -->
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #1565c0; font-size: 14px; line-height: 1.6;">
              <strong>📧 Lưu ý:</strong> Chúng tôi sẽ gửi phản hồi chi tiết đến email này. 
              Vui lòng kiểm tra hộp thư của bạn trong vài ngày tới.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">EnTalk - Hệ thống luyện nói tiếng Anh thông minh</p>
          <p style="margin: 0; font-size: 12px;">Mọi ý kiến đóng góp của bạn đều rất quan trọng với chúng tôi 💙</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Hàm gửi email marketing
exports.sendMarketingEmail = async ({ to, subject, htmlContent, userName }) => {
  const mailOptions = {
    from: `"EnTalk" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
