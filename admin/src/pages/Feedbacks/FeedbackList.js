// admin/src/pages/Feedbacks/FeedbackList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { feedbacksAPI } from "../../services/api";
import { Star } from "lucide-react";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

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
      <h1 className="text-2xl font-bold mb-5">Quản lý Phản hồi ({feedbacks.length})</h1>

      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded">{error}</div>
      )}

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
            {feedbacks.map((feedback) => (
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

        {feedbacks.length === 0 && !error && (
          <div className="p-10 text-center text-gray-500">
            <p>Chưa có phản hồi nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
