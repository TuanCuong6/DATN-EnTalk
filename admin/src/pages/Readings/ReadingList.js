// admin/src/pages/Readings/ReadingList.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { readingsAPI, topicsAPI } from "../../services/api";
import { showToast } from "../../utils/toast";

const ReadingList = () => {
  const [readings, setReadings] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Lọc và tìm kiếm
  const filteredReadings = readings.filter((reading) => {
    const matchesSearch = reading.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = topicFilter === "all" || reading.topic_id === Number(topicFilter);
    return matchesSearch && matchesTopic;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReadings = filteredReadings.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, topicFilter, itemsPerPage]);

  const handleDelete = async (id, content) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa bài đọc?\n\n${content.substring(0, 100)}...`
      )
    ) {
      const loadingToast = showToast.loading('Đang xóa...');
      try {
        await readingsAPI.delete(id);
        showToast.dismiss(loadingToast);
        showToast.success('Đã xóa bài đọc thành công!');
        fetchData();
      } catch (error) {
        showToast.dismiss(loadingToast);
        showToast.error('Lỗi khi xóa bài đọc');
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
        <h1 className="text-2xl font-bold">Quản lý Bài đọc ({filteredReadings.length})</h1>
        <Link
          to="/readings/add"
          className="px-4 py-2 bg-blue-500 text-white no-underline rounded hover:bg-blue-600"
        >
          Thêm Bài đọc
        </Link>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chủ đề</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả chủ đề</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Nội dung</th>
              <th className="p-3 border border-gray-300 text-left">Trình độ</th>
              <th className="p-3 border border-gray-300 text-left">Chủ đề</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReadings.map((reading) => (
              <tr key={reading.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{reading.id}</td>
                <td className="p-3 border border-gray-300 max-w-xs">
                  {reading.content.substring(0, 100)}...
                </td>
                <td className="p-3 border border-gray-300">
                  {reading.level === 'A1' ? 'Dễ' : reading.level === 'B1' ? 'Vừa' : 'Khó'}
                </td>
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

        {paginatedReadings.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <p>Không tìm thấy bài đọc nào</p>
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

export default ReadingList;
