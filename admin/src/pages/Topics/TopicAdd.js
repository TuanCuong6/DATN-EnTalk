// admin/src/pages/Topics/TopicAdd.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { topicsAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const TopicAdd = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loadingToast = showToast.loading('Đang tạo chủ đề...');

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      if (imageFile) data.append("image", imageFile);

      await topicsAPI.create(data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.dismiss(loadingToast);
      showToast.success('Tạo chủ đề thành công!');
      navigate("/topics");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi tạo chủ đề";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Thêm Chủ đề mới</h1>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Tên chủ đề *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows="4"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Ảnh chủ đề</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full"
          />
          {imageFile && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="w-24 rounded"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Tạo chủ đề"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/topics")}
            className="px-5 py-2 bg-gray-500 text-white border-none rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicAdd;
