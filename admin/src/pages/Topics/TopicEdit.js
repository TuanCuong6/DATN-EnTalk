// admin/src/pages/Topics/TopicEdit.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { topicsAPI } from "../../services/api";

const TopicEdit = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
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

    try {
      await topicsAPI.update(id, formData);
      navigate("/topics");
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi cập nhật chủ đề");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Sửa Chủ đề</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Tên chủ đề *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows="4"
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
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
            onClick={() => navigate("/topics")}
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

export default TopicEdit;
