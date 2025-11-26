// admin/src/pages/Users/UserAdd.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const UserAdd = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ. Vui lòng nhập đúng định dạng email");
      showToast.error("Email không hợp lệ");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      showToast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    setError("");

    const loadingToast = showToast.loading('Đang tạo người dùng...');

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (avatarFile) data.append("avatar", avatarFile);

      await usersAPI.create(data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.dismiss(loadingToast);
      showToast.success('Tạo người dùng thành công!');
      navigate("/users");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi tạo người dùng";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Thêm User mới</h1>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Tên *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            autoComplete="off"
            placeholder="Nhập tên người dùng"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Email *</label>
          <input
            type="text"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            autoComplete="off"
            placeholder="example@email.com"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
            <p className="text-red-500 text-sm mt-1">
              Email không hợp lệ (phải có dạng: example@email.com)
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength="6"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          {formData.password && formData.password.length < 6 && (
            <p className="text-red-500 text-sm mt-1">
              Mật khẩu phải có ít nhất 6 ký tự
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Avatar (tùy chọn)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          {avatarPreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Tạo User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-5 py-2 bg-gray-500 text-white border-none rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAdd;
