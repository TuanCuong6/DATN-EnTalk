// admin/src/pages/Readings/ReadingList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { readingsAPI, topicsAPI } from "../../services/api";

const ReadingList = () => {
  const [readings, setReadings] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [readingsRes, topicsRes] = await Promise.all([
        readingsAPI.getAll(),
        topicsAPI.getAll(),
      ]);
      setReadings(readingsRes.data);
      setTopics(topicsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, content) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa bài đọc?\n\n${content.substring(0, 100)}...`
      )
    ) {
      try {
        await readingsAPI.delete(id);
        fetchData(); // Refresh list
      } catch (error) {
        alert("Lỗi khi xóa bài đọc");
      }
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.name : "N/A";
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
        <h1>Quản lý Bài đọc</h1>
        <Link
          to="/readings/add"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
          }}
        >
          Thêm Bài đọc
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Nội dung
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Level</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Chủ đề
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Ngày tạo
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {reading.id}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  maxWidth: "300px",
                }}
              >
                {reading.content.substring(0, 100)}...
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {reading.level}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {getTopicName(reading.topic_id)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(reading.created_at).toLocaleDateString()}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                <Link
                  to={`/readings/edit/${reading.id}`}
                  style={{ marginRight: "10px" }}
                >
                  Sửa
                </Link>
                <button
                  onClick={() => handleDelete(reading.id, reading.content)}
                >
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

export default ReadingList;
