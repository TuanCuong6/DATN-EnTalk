// backend/services/emailMarketingService.js
const axios = require("axios");

const GEMINI_API_KEY3 = process.env.GEMINI_API_KEY3;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY3}`;

// Logo EnTalk trên Cloudinary
const ENTALK_LOGO_URL =
  "https://res.cloudinary.com/dy48uivag/image/upload/v1764040680/email_marketing/zfahovhhcijtch1eiyh8.png";

exports.generateEmailHTML = async ({
  title,
  description,
  imageUrls = [],
  ctaLink,
  ctaText,
  primaryColor = "#5E72EB",
  designStyle = "modern",
}) => {
  // Format images list
  const imagesText =
    imageUrls.length > 0
      ? imageUrls.map((url, i) => `  ${i + 1}. ${url}`).join("\n")
      : "Không có ảnh";

  const prompt = `Bạn là chuyên gia thiết kế email marketing hiện đại. Hãy tạo một email HTML/CSS responsive, HIỆN ĐẠI, TRẺ TRUNG, GỌNG GÀNG với các yêu cầu sau:

**Thông tin email:**
- Tiêu đề: ${title}
- Mô tả/Nội dung: ${description}
- Danh sách ảnh (${imageUrls.length} ảnh):\n${imagesText}
- Link CTA: ${ctaLink}
- Text nút CTA: ${ctaText || "Tìm hiểu thêm"}
- Màu chủ đạo: ${primaryColor}
- Phong cách: ${designStyle}

**YÊU CẦU THIẾT KẾ HIỆN ĐẠI:**

1. **Header (Logo):**
   - Logo EnTalk từ URL: ${ENTALK_LOGO_URL}
   - Background gradient hoặc màu ${primaryColor}
   - Padding: 30px, text-align: center
   - Logo max-width: 120px

2. **Layout Content:**
   - Max-width: 600px, margin: 0 auto
   - Background: white với shadow nhẹ
   - Border-radius: 12px (góc bo tròn)
   - Padding: 40px 30px

3. **Typography:**
   - Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
   - Tiêu đề: font-size 28px, font-weight 700, color ${primaryColor}
   - Nội dung: font-size 16px, line-height 1.6, color #333

4. **Images Layout (QUAN TRỌNG):**
   ${
     imageUrls.length > 0
       ? `
   - XEN KẼ ảnh với text, KHÔNG để 2 ảnh dính nhau
   - Mỗi ảnh có margin: 25px 0
   - Border-radius: 12px
   - Box-shadow: 0 4px 12px rgba(0,0,0,0.1)
   - Width: 100%, max-width: 100%
   - Nếu có 2+ ảnh: Ảnh 1 → Text → Ảnh 2 → Text → Ảnh 3...
   - Giữa mỗi ảnh có đoạn text ngắn hoặc spacing 30px
   `
       : "- Không có ảnh"
   }

5. **CTA Button:**
   - Background: gradient (${primaryColor} to darker)
   - Color: white, font-weight: 600
   - Padding: 16px 40px
   - Border-radius: 30px (pill shape)
   - Box-shadow: 0 4px 15px rgba(${primaryColor}, 0.3)
   - Hover effect: transform scale(1.05)
   - Display: inline-block, margin: 30px 0

6. **Footer (BẮT BUỘC - Nội dung cố định, CĂN TRÁI, ĐƠN GIẢN):**
   - Background: #f8f9fa
   - Padding: 30px
   - Text-align: LEFT (căn trái)
   - Font-size: 14px
   - Color: #6c757d (tất cả text cùng màu, không màu mè)
   - Border-radius: 0 0 12px 12px
   - Line-height: 1.6
   
   **HTML Footer CHÍNH XÁC (đơn giản, gọn gàng):**
   
   <div style="line-height: 1.6; color: #6c757d;">
     <div style="margin-bottom: 15px;">
       <strong>EnTalk</strong> – Ứng dụng luyện phát âm tiếng Anh với AI
     </div>
     
     <div style="margin-bottom: 5px;">
       <strong>Liên hệ:</strong>
     </div>
     <div>
       Email: support@entalk.app<br>
       Hotline: 0373971926
     </div>
     
     <div style="margin-top: 15px; font-size: 12px;">
       © 2025 EnTalk. Mọi quyền được bảo lưu.
     </div>
   </div>

7. **Spacing & Whitespace:**
   - Giữa các section: 30-40px
   - Paragraph spacing: 15px
   - Không quá chật, thoáng đãng
   - Mobile-friendly padding

8. **Modern Elements:**
   - Gradient backgrounds
   - Subtle shadows
   - Rounded corners (8-12px)
   - Clean, minimal design
   - Trẻ trung, năng động

9. **Color Scheme:**
   - Primary: ${primaryColor}
   - Text: #333333
   - Secondary text: #6c757d
   - Background: #ffffff
   - Accent: lighter shade of ${primaryColor}

10. **Responsive:**
    - Mobile: padding 20px, font-size nhỏ hơn
    - Desktop: padding 40px, font-size chuẩn
    - Images: width 100%, height auto

**CẤU TRÚC MẪU (nếu có nhiều ảnh):**
\`\`\`
[Header với Logo]
[Tiêu đề chính]
[Đoạn mở đầu]
[Ảnh 1 - full width, rounded, shadow]
[Text giải thích ảnh 1 hoặc nội dung]
[Ảnh 2 - full width, rounded, shadow]
[Text giải thích ảnh 2 hoặc nội dung]
[Ảnh 3 - full width, rounded, shadow]
[Text kết luận]
[CTA Button]
[Footer]
\`\`\`

**LƯU Ý QUAN TRỌNG:**
- KHÔNG để 2 ảnh liền kề nhau
- Ảnh phải xen kẽ với text
- Design phải HIỆN ĐẠI, TRẺ TRUNG, GỌNG GÀNG
- Footer PHẢI dùng CHÍNH XÁC nội dung đã cho ở trên (không thay đổi)
- Chỉ trả về HTML, không giải thích
- CSS inline hoặc trong <style>
- Không dùng JavaScript

Hãy tạo email HTML HIỆN ĐẠI ngay bây giờ:`;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let htmlContent =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("🎨 Gemini Email Response received");

    // Clean up markdown code blocks nếu có
    htmlContent = htmlContent.replace(/```html\n?/g, "").replace(/```\n?/g, "");

    return htmlContent.trim();
  } catch (error) {
    console.error(
      "❌ Lỗi gọi Gemini API:",
      error.response?.data || error.message
    );
    throw new Error(
      "Không thể tạo email HTML với Gemini: " +
        (error.response?.data?.error?.message || error.message)
    );
  }
};
