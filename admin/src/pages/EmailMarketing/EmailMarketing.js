// admin/src/pages/EmailMarketing/EmailMarketing.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { emailMarketingAPI } from "../../services/api";
import { Mail, History, Sparkles, RefreshCw, Send, Loader } from "lucide-react";

const EmailMarketing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    imageUrls: [],
    ctaLink: "",
    ctaText: "Tìm hiểu thêm",
    primaryColor: "#5E72EB",
    designStyle: "modern",
  });

  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.imageUrls.length + files.length > 5) {
      alert("❌ Tối đa 5 ảnh! Bạn đã có " + formData.imageUrls.length + " ảnh.");
      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter((f) => f.size > maxSize);
    if (invalidFiles.length > 0) {
      alert(
        `❌ Có ${invalidFiles.length} ảnh quá lớn (> 10MB):\n` +
          invalidFiles.map((f) => `- ${f.name}: ${(f.size / 1024 / 1024).toFixed(2)} MB`).join("\n")
      );
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    const uploadedUrls = [];

    try {
      const token = localStorage.getItem("adminToken");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataImg = new FormData();
        formDataImg.append("image", file);

        const response = await axios.post(
          "http://localhost:3000/api/upload-image",
          formDataImg,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedUrls.push(response.data.imageUrl);
      }

      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, ...uploadedUrls],
      });

      alert(`✅ Upload thành công ${uploadedUrls.length} ảnh!`);
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("❌ Lỗi khi upload ảnh");
      e.target.value = "";
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, imageUrls: newImages });
  };

  const handleGenerateEmail = async () => {
    if (!formData.title || !formData.description) {
      alert("Vui lòng nhập tiêu đề và mô tả");
      return;
    }

    setLoading(true);
    try {
      const response = await emailMarketingAPI.generate(formData);
      setHtmlContent(response.data.htmlContent);
    } catch (error) {
      console.error("Error generating email:", error);
      alert("❌ Lỗi khi tạo email: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!htmlContent) {
      alert("Vui lòng tạo email trước");
      return;
    }

    if (!formData.subject) {
      alert("Vui lòng nhập tiêu đề email (Subject)");
      return;
    }

    const confirm = window.confirm(
      "Bạn có chắc muốn gửi email này đến TẤT CẢ người dùng?"
    );
    if (!confirm) return;

    setSending(true);
    try {
      const response = await emailMarketingAPI.send({
        title: formData.title,
        subject: formData.subject,
        htmlContent,
      });

      alert(
        `✅ ${response.data.message}\nTổng: ${response.data.totalRecipients} người dùng`
      );
      
      setFormData({
        title: "",
        subject: "",
        description: "",
        imageUrls: [],
        ctaLink: "",
        ctaText: "Tìm hiểu thêm",
        primaryColor: "#5E72EB",
        designStyle: "modern",
      });
      setHtmlContent("");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("❌ Lỗi khi gửi email: " + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail size={28} />
          Email Marketing
        </h1>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
          onClick={() => navigate("/email-marketing/history")}
        >
          <History size={18} />
          Xem lịch sử
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* Left Panel - Form (40%) */}
        <div className="lg:col-span-2 bg-white p-6 rounded shadow h-full">
          <h2 className="text-xl font-bold mb-4">Thông tin Email</h2>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Tiêu đề Campaign *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Khóa học IELTS mới"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Subject Email *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="VD: 🎉 Khóa học IELTS giảm 50%"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Mô tả / Nội dung *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Mô tả chi tiết về chiến dịch, khóa học..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Upload Ảnh (Tối đa 5 ảnh)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage || formData.imageUrls.length >= 5}
              className="w-full"
            />
            {uploadingImage && (
              <p className="text-blue-500 mt-2 flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                Đang upload...
              </p>
            )}
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600"
                      onClick={() => handleRemoveImage(index)}
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {formData.imageUrls.length}/5 ảnh
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Link CTA</label>
            <input
              type="url"
              name="ctaLink"
              value={formData.ctaLink}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Text nút CTA</label>
            <input
              type="text"
              name="ctaText"
              value={formData.ctaText}
              onChange={handleChange}
              placeholder="Tìm hiểu thêm"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Màu chủ đạo</label>
              <input
                type="color"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Phong cách</label>
              <select
                name="designStyle"
                value={formData.designStyle}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="modern">Hiện đại</option>
                <option value="minimal">Tối giản</option>
                <option value="colorful">Nhiều màu sắc</option>
                <option value="professional">Chuyên nghiệp</option>
                <option value="friendly">Thân thiện</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            {!htmlContent ? (
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleGenerateEmail}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Tạo Email
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleGenerateEmail}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Đang tạo lại...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Tạo lại
                    </>
                  )}
                </button>

                <button
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleSendEmail}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Gửi Email
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Preview (60%) */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4">Preview Email</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
              <Loader size={40} className="animate-spin mb-3 text-blue-500" />
              <p className="text-lg">Đang tạo Email Marketing...</p>
            </div>
          ) : !htmlContent ? (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              <p>👈 Nhập thông tin và nhấn "Tạo Email" để xem preview</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded overflow-hidden flex-1">
              <iframe
                srcDoc={htmlContent}
                title="Email Preview"
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailMarketing;
