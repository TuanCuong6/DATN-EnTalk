// admin/src/pages/Topics/TopicEdit.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { topicsAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const TopicEdit = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      const response = await topicsAPI.getAll();
      const topic = response.data.find((t) => t.id === parseInt(id));
      if (topic) {
        setFormData({
          name: topic.name,
          description: topic.description || "",
          image_url: topic.image_url || "",
        });
      } else {
        setError("Không tìm thấy chủ đề");
      }
    } catch (error) {
      setError("Lỗi khi tải thông tin chủ đề");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loadingToast = showToast.loading('Đang cập nhật...');

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      if (newImage) data.append("image", newImage);

      await topicsAPI.update(id, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.dismiss(loadingToast);
      showToast.success('Cập nhật chủ đề thành công!');
      navigate("/topics");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật chủ đề";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Sửa Chủ đề</h1>

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
          {formData.image_url && (
            <div className="mb-3">
              <img
                src={formData.image_url}
                alt="topic"
                className="w-24 rounded"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewImage(e.target.files[0])}
            className="w-full"
          />
          {newImage && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(newImage)}
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
            {loading ? "Đang cập nhật..." : "Cập nhật"}
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

export default TopicEdit;
