// admin/src/pages/Topics/TopicList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { topicsAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

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
      const loadingToast = showToast.loading('Đang xóa...');
      try {
        await topicsAPI.delete(id);
        showToast.dismiss(loadingToast);
        showToast.success('Đã xóa chủ đề thành công!');
        fetchTopics();
      } catch (error) {
        showToast.dismiss(loadingToast);
        showToast.error(error.response?.data?.message || "Lỗi khi xóa chủ đề");
      }
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Quản lý Chủ đề ({topics.length})</h1>
        <Link
          to="/topics/add"
          className="px-4 py-2 bg-blue-500 text-white no-underline rounded hover:bg-blue-600"
        >
          Thêm Chủ đề
        </Link>
      </div>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Tên chủ đề</th>
              <th className="p-3 border border-gray-300 text-left">Ảnh</th>
              <th className="p-3 border border-gray-300 text-left">Mô tả</th>
              <th className="p-3 border border-gray-300 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{topic.id}</td>
                <td className="p-3 border border-gray-300">{topic.name}</td>
                <td className="p-3 border border-gray-300 text-center">
                  {topic.image_url ? (
                    <img
                      src={topic.image_url}
                      alt={topic.name}
                      className="w-16 h-16 object-cover rounded inline-block"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3 border border-gray-300">{topic.description}</td>
                <td className="p-3 border border-gray-300">
                  <Link
                    to={`/topics/edit/${topic.id}`}
                    className="text-blue-500 hover:underline mr-3"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(topic.id, topic.name)}
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

export default TopicList;
