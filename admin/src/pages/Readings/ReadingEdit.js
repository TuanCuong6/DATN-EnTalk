// admin/src/pages/Readings/ReadingEdit.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readingsAPI, topicsAPI } from "../../services/api";
import WordCounter from "../../components/WordCounter";
import { showToast } from "../../utils/toast";

// Giới hạn độ dài theo level
const LEVEL_LIMITS = {
  A1: { min: 20, max: 30 },
  B1: { min: 30, max: 50 },
  C1: { min: 50, max: 70 },
};

const ReadingEdit = () => {
  const [formData, setFormData] = useState({
    content: "",
    level: "A1",
    topic_id: "",
  });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [isContentValid, setIsContentValid] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [readingsRes, topicsRes] = await Promise.all([
        readingsAPI.getAll(),
        topicsAPI.getAll(),
      ]);

      setTopics(topicsRes.data);

      const reading = readingsRes.data.find((r) => r.id === parseInt(id));
      if (reading) {
        setFormData({
          content: reading.content,
          level: reading.level,
          topic_id: reading.topic_id,
        });
      } else {
        setError("Không tìm thấy bài đọc");
      }
    } catch (error) {
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setFetchLoading(false);
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

    const loadingToast = showToast.loading('Đang cập nhật...');

    try {
      await readingsAPI.update(id, {
        ...formData,
        topic_id: parseInt(formData.topic_id),
      });
      showToast.dismiss(loadingToast);
      showToast.success('Cập nhật bài đọc thành công!');
      navigate("/readings");
    } catch (error) {
      showToast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật bài đọc";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Sửa Bài đọc</h1>

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
            {loading ? "Đang cập nhật..." : "Cập nhật"}
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

export default ReadingEdit;
