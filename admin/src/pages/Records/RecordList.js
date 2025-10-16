// admin/src/pages/Records/RecordList.js
import React, { useState, useEffect } from "react";
import { recordsAPI } from "../../services/api";

const RecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await recordsAPI.getAll();
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Lịch sử Luyện tập</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>User</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Bài đọc
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Điểm tổng
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Phát âm
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Lưu loát
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Ngữ điệu
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Ngày tạo
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.id}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.user_name}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  maxWidth: "200px",
                }}
              >
                {record.reading_content
                  ? record.reading_content.substring(0, 50) + "..."
                  : "Custom Text"}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.score_overall}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.score_pronunciation}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.score_fluency}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {record.score_intonation}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(record.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordList;
