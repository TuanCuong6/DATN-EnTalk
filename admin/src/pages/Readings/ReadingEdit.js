// admin/src/pages/Readings/ReadingEdit.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readingsAPI, topicsAPI } from "../../services/api";

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
    setLoading(true);
    setError("");

    try {
      await readingsAPI.update(id, {
        ...formData,
        topic_id: parseInt(formData.topic_id),
      });
      navigate("/readings");
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi cập nhật bài đọc");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Sửa Bài đọc</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Nội dung *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
            rows="6"
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Level *
          </label>
          <select
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Chủ đề *
          </label>
          <select
            value={formData.topic_id}
            onChange={(e) =>
              setFormData({ ...formData, topic_id: e.target.value })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/readings")}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingEdit;
