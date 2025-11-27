// admin/src/pages/Topics/TopicList.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { topicsAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Lọc và tìm kiếm
  const filteredTopics = topics.filter((topic) => {
    return topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Phân trang
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTopics = filteredTopics.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

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
        <h1 className="text-2xl font-bold">Quản lý Chủ đề ({filteredTopics.length})</h1>
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

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

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
            {paginatedTopics.map((topic) => (
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

        {paginatedTopics.length === 0 && !error && (
          <div className="p-10 text-center text-gray-500">
            <p>Không tìm thấy chủ đề nào</p>
          </div>
        )}
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4">
        <div></div>
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {(() => {
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);
              
              if (currentPage <= 3) {
                endPage = Math.min(5, totalPages);
              }
              if (currentPage > totalPages - 3) {
                startPage = Math.max(1, totalPages - 4);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
        <div className="text-sm">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10/trang</option>
            <option value={20}>20/trang</option>
            <option value={50}>50/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TopicList;
