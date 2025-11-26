// admin/src/pages/Users/UserEdit.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usersAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const UserEdit = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar_url: "",
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await usersAPI.getAll();
      const user = response.data.find((u) => u.id === parseInt(id));
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url || "",
        });
        if (user.avatar_url) {
          setAvatarPreview(user.avatar_url);
        }
      } else {
        setError("Không tìm thấy người dùng");
      }
    } catch (error) {
      setError("Lỗi khi tải thông tin người dùng");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false); // Reset flag xóa khi chọn ảnh mới
    }
  };

  const handleRemoveAvatar = () => {
    if (newAvatar) {
      // Nếu đang chọn ảnh mới, hủy chọn và quay về ảnh cũ
      setNewAvatar(null);
      setAvatarPreview(formData.avatar_url || null);
      setRemoveAvatar(false);
    } else {
      // Nếu đang xem ảnh cũ, đánh dấu xóa
      setNewAvatar(null);
      setAvatarPreview(null);
      setRemoveAvatar(true);
    }
    // Reset input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loadingToast = showToast.loading('Đang cập nhật...');

    try {
      const data = new FormData();
      data.append("name", formData.name);
      
      // Nếu có ảnh mới, upload ảnh mới
      if (newAvatar) {
        data.append("avatar", newAvatar);
      } 
      // Nếu đánh dấu xóa avatar
      else if (removeAvatar) {
        data.append("removeAvatar", "true");
      }

      console.log('📤 Sending data:', {
        name: formData.name,
        hasNewAvatar: !!newAvatar,
        removeAvatar: removeAvatar
      });

      await usersAPI.update(id, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.dismiss(loadingToast);
      showToast.success('Cập nhật người dùng thành công!');
      navigate("/users");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật người dùng";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Sửa User</h1>

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
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Avatar</label>
          
          {avatarPreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                title={newAvatar ? "Hủy chọn ảnh mới" : "Xóa avatar hiện tại"}
              >
                ×
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {newAvatar ? "Ảnh mới đã chọn - Click X để hủy" : avatarPreview ? "Chọn ảnh mới để thay đổi hoặc click X để xóa" : "Chọn ảnh để thêm avatar"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
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

export default UserEdit;
