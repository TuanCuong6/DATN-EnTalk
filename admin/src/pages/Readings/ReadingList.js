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
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa bài đọc");
      }
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.name : "N/A";
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Quản lý Bài đọc ({readings.length})</h1>
        <Link
          to="/readings/add"
          className="px-4 py-2 bg-blue-500 text-white no-underline rounded hover:bg-blue-600"
        >
          Thêm Bài đọc
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Nội dung</th>
              <th className="p-3 border border-gray-300 text-left">Level</th>
              <th className="p-3 border border-gray-300 text-left">Chủ đề</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{reading.id}</td>
                <td className="p-3 border border-gray-300 max-w-xs">
                  {reading.content.substring(0, 100)}...
                </td>
                <td className="p-3 border border-gray-300">{reading.level}</td>
                <td className="p-3 border border-gray-300">
                  {getTopicName(reading.topic_id)}
                </td>
                <td className="p-3 border border-gray-300">
                  {new Date(reading.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 border border-gray-300">
                  <Link
                    to={`/readings/edit/${reading.id}`}
                    className="text-blue-500 hover:underline mr-3"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(reading.id, reading.content)}
                    className="text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReadingList;
