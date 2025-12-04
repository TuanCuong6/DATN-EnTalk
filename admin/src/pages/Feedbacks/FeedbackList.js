// admin/src/pages/Feedbacks/FeedbackList.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { feedbacksAPI } from "../../services/api";
import { Star } from "lucide-react";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ratingFilter, itemsPerPage]);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbacksAPI.getAll();
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Lỗi khi tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  // Lọc và tìm kiếm
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = feedback.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesRating = ratingFilter === "all" || feedback.rating === Number(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);

  const getStatusText = (status) => {
    if (status === "replied") {
      return <span className="text-green-600">Đã phản hồi</span>;
    }
    return <span className="text-yellow-600">Chờ xử lý</span>;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: rating || 0 }).map((_, i) => (
          <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
        ))}
      </div>
    );
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Quản lý Phản hồi ({filteredFeedbacks.length})</h1>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="replied">Đã phản hồi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số sao</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">User</th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Trạng thái</th>
              <th className="p-3 border border-gray-300 text-left">Đánh giá</th>
              <th className="p-3 border border-gray-300 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFeedbacks.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{feedback.id}</td>
                <td className="p-3 border border-gray-300">{feedback.user_name}</td>
                <td className="p-3 border border-gray-300">{feedback.user_email}</td>
                <td className="p-3 border border-gray-300">
                  {new Date(feedback.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="p-3 border border-gray-300">
                  {getStatusText(feedback.status)}
                </td>
                <td className="p-3 border border-gray-300">
                  {renderStars(feedback.rating)}
                </td>
                <td className="p-3 border border-gray-300">
                  <Link
                    to={`/feedbacks/${feedback.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedFeedbacks.length === 0 && !error && (
          <div className="p-10 text-center text-gray-500">
            <p>Không tìm thấy phản hồi nào</p>
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

export default FeedbackList;
