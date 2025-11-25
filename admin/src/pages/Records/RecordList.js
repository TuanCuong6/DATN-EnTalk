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

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Lịch sử Luyện tập ({records.length})</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">User</th>
              <th className="p-3 border border-gray-300 text-left">Bài đọc</th>
              <th className="p-3 border border-gray-300 text-left">Điểm tổng</th>
              <th className="p-3 border border-gray-300 text-left">Phát âm</th>
              <th className="p-3 border border-gray-300 text-left">Lưu loát</th>
              <th className="p-3 border border-gray-300 text-left">Ngữ điệu</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{record.id}</td>
                <td className="p-3 border border-gray-300">{record.user_name}</td>
                <td className="p-3 border border-gray-300 max-w-xs">
                  {record.reading_content
                    ? record.reading_content.substring(0, 50) + "..."
                    : "Custom Text"}
                </td>
                <td className="p-3 border border-gray-300">{record.score_overall}</td>
                <td className="p-3 border border-gray-300">{record.score_pronunciation}</td>
                <td className="p-3 border border-gray-300">{record.score_fluency}</td>
                <td className="p-3 border border-gray-300">{record.score_intonation}</td>
                <td className="p-3 border border-gray-300">
                  {new Date(record.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordList;
