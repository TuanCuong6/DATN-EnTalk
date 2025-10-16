// admin/src/pages/Topics/TopicList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { topicsAPI } from "../../services/api";

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await topicsAPI.getAll();
      setTopics(response.data);
    } catch (error) {
      setError("Lỗi khi tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa chủ đề "${name}"?`)) {
      try {
        await topicsAPI.delete(id);
        fetchTopics(); // Refresh list
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi khi xóa chủ đề");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Quản lý Chủ đề</h1>
        <Link
          to="/topics/add"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
          }}
        >
          Thêm Chủ đề
        </Link>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Tên chủ đề
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Mô tả</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {topic.id}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {topic.name}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {topic.description}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                <Link
                  to={`/topics/edit/${topic.id}`}
                  style={{ marginRight: "10px" }}
                >
                  Sửa
                </Link>
                <button onClick={() => handleDelete(topic.id, topic.name)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicList;
