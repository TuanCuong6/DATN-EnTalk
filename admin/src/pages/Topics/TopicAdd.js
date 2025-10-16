// admin/src/pages/Topics/TopicAdd.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { topicsAPI } from "../../services/api";

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

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      if (imageFile) data.append("image", imageFile);

      await topicsAPI.create(data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/topics");
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi tạo chủ đề");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Thêm Chủ đề mới</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        {/* Name */}
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

        {/* Description */}
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

        {/* Image */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Ảnh chủ đề
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {imageFile && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                style={{ width: "100px", borderRadius: "5px" }}
              />
            </div>
          )}
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
            {loading ? "Đang tạo..." : "Tạo chủ đề"}
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

export default TopicAdd;
