// admin/src/pages/Readings/ReadingAdd.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readingsAPI, topicsAPI } from "../../services/api";
import WordCounter from "../../components/WordCounter";
import { showToast } from "../../utils/toast";

// Giới hạn độ dài theo level
const LEVEL_LIMITS = {
  A1: { min: 20, max: 30 },
  B1: { min: 30, max: 50 },
  C1: { min: 50, max: 70 },
};

const ReadingAdd = () => {
  const [formData, setFormData] = useState({
    content: "",
    level: "A1",
    topic_id: "",
  });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isContentValid, setIsContentValid] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await topicsAPI.getAll();
      setTopics(response.data);
      if (response.data.length > 0) {
        setFormData((prev) => ({ ...prev, topic_id: response.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isContentValid) {
      const limits = LEVEL_LIMITS[formData.level];
      const errorMsg = `Nội dung phải có từ ${limits.min} đến ${limits.max} từ cho level ${formData.level}`;
      setError(errorMsg);
      showToast.error(errorMsg);
      return;
    }
    
    setLoading(true);
    setError("");

    const loadingToast = showToast.loading('Đang tạo bài đọc...');

    try {
      await readingsAPI.create({
        ...formData,
        topic_id: parseInt(formData.topic_id),
      });
      showToast.dismiss(loadingToast);
      showToast.success('Tạo bài đọc thành công!');
      navigate("/readings");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi tạo bài đọc";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Thêm Bài đọc mới</h1>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Nội dung *</label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
            rows="6"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          
          {/* Word Counter */}
          <WordCounter
            text={formData.content}
            min={LEVEL_LIMITS[formData.level].min}
            max={LEVEL_LIMITS[formData.level].max}
            onValidationChange={(valid) => setIsContentValid(valid)}
            label={`Level ${formData.level}`}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Trình độ *</label>
          <select
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="A1">Dễ</option>
            <option value="B1">Vừa</option>
            <option value="C1">Khó</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Chủ đề *</label>
          <select
            value={formData.topic_id}
            onChange={(e) =>
              setFormData({ ...formData, topic_id: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !isContentValid}
            className="px-5 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo..." : "Tạo bài đọc"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/readings")}
            className="px-5 py-2 bg-gray-500 text-white border-none rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingAdd;
