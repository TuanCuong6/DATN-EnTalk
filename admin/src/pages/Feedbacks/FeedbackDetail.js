// admin/src/pages/Feedbacks/FeedbackDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI, feedbacksAPI } from "../../services/api";
import { ArrowLeft, Star, Send, Loader } from "lucide-react";

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      const response = await adminAPI.get(`/feedbacks/${id}`);
      setFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Lỗi khi tải thông tin phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      alert("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setReplying(true);
    try {
      await feedbacksAPI.reply(id, { reply_content: replyContent });
      alert("Đã gửi phản hồi thành công!");
      navigate("/feedbacks");
    } catch (error) {
      console.error("Error replying:", error);
      alert("Lỗi khi gửi phản hồi");
    } finally {
      setReplying(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: rating || 0 }).map((_, i) => (
      <Star key={i} size={20} fill="#fbbf24" color="#fbbf24" />
    ));
  };

  if (loading) return <div className="p-5">Loading...</div>;
  if (error) return <div className="text-red-500 p-5">{error}</div>;
  if (!feedback) return <div className="p-5">Không tìm thấy phản hồi</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Chi tiết Phản hồi #{feedback.id}</h1>
        <button
          onClick={() => navigate("/feedbacks")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">User:</p>
            <p className="font-medium">{feedback.user_name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{feedback.user_email}</p>
          </div>
          <div>
            <p className="text-gray-600">Đánh giá:</p>
            <div className="flex gap-1">{renderStars(feedback.rating)}</div>
          </div>
          <div>
            <p className="text-gray-600">Ngày tạo:</p>
            <p className="font-medium">
              {new Date(feedback.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">Nội dung phản hồi:</p>
          <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{feedback.content}</p>
        </div>

        {feedback.screenshot_url && (
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Screenshot:</p>
            <img
              src={feedback.screenshot_url}
              alt="Screenshot"
              className="max-w-2xl rounded border border-gray-300"
            />
          </div>
        )}

        {feedback.status === "replied" && feedback.admin_reply && (
          <div className="bg-blue-50 p-4 rounded">
            <p className="font-medium text-blue-800 mb-2">Phản hồi của Admin:</p>
            <p className="text-gray-700 mb-2">{feedback.admin_reply}</p>
            <p className="text-sm text-gray-500">
              Đã phản hồi lúc: {new Date(feedback.replied_at).toLocaleString("vi-VN")}
            </p>
          </div>
        )}
      </div>

      {feedback.status === "pending" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Gửi phản hồi</h2>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Nội dung phản hồi</label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows="6"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Nhập nội dung phản hồi cho người dùng..."
            />
          </div>

          <button
            onClick={handleReply}
            disabled={replying}
            className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {replying ? (
              <>
                <Loader size={18} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={18} />
                Gửi phản hồi
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackDetail;
