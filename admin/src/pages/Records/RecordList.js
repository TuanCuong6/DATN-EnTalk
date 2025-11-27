// admin/src/pages/Records/RecordList.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recordsAPI } from "../../services/api";

const RecordList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

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

  // Lọc và tìm kiếm
  const filteredRecords = records.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return record.user_name.toLowerCase().includes(searchLower) ||
           (record.reading_content && record.reading_content.toLowerCase().includes(searchLower)) ||
           (record.topic_name && record.topic_name.toLowerCase().includes(searchLower));
  });

  // Phân trang
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Lịch sử Luyện tập ({filteredRecords.length})</h1>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo tên user hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">User</th>
              <th className="p-3 border border-gray-300 text-left">Chủ đề</th>
              <th className="p-3 border border-gray-300 text-left">Bài đọc</th>
              <th className="p-3 border border-gray-300 text-left">Điểm tổng</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{record.id}</td>
                <td className="p-3 border border-gray-300">{record.user_name}</td>
                <td className="p-3 border border-gray-300">
                  {record.topic_name || (
                    <span className="text-gray-500 italic">Tự nhập</span>
                  )}
                </td>
                <td className="p-3 border border-gray-300 max-w-xs">
                  {record.reading_content
                    ? record.reading_content.substring(0, 50) + "..."
                    : "Custom Text"}
                </td>
                <td className="p-3 border border-gray-300">{record.score_overall}</td>
                <td className="p-3 border border-gray-300">
                  {new Date(record.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 border border-gray-300">
                  <button
                    onClick={() => navigate(`/records/${record.id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedRecords.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <p>Không tìm thấy lịch sử luyện tập nào</p>
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

export default RecordList;
