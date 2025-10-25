import React, { useState, useEffect } from "react";
import { feedbacksAPI } from "../../services/api";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbacksAPI.getAll();
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (feedbackId) => {
    if (!replyContent.trim()) {
      alert("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setReplying(true);
    try {
      await feedbacksAPI.reply(feedbackId, { reply_content: replyContent });
      alert("Đã gửi phản hồi thành công!");
      setSelectedFeedback(null);
      setReplyContent("");
      fetchFeedbacks(); // Refresh list
    } catch (error) {
      console.error("Error replying to feedback:", error);
      alert("Lỗi khi gửi phản hồi");
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: "#ffc107", color: "#000" },
      replied: { background: "#28a745", color: "#fff" },
    };
    const style = styles[status] || styles.pending;

    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "bold",
          ...style,
        }}
      >
        {status === "pending" ? "Chờ xử lý" : "Đã phản hồi"}
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Quản lý Phản hồi</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Feedback List */}
        <div>
          <h3>Danh sách phản hồi ({feedbacks.length})</h3>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px",
                  background:
                    feedback.id === selectedFeedback?.id ? "#f8f9fa" : "white",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <strong>{feedback.user_name || feedback.user_email}</strong>
                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      {new Date(feedback.created_at).toLocaleString()}
                    </div>
                  </div>
                  {getStatusBadge(feedback.status)}
                </div>

                <p style={{ margin: "10px 0", color: "#495057" }}>
                  {feedback.content.length > 100
                    ? `${feedback.content.substring(0, 100)}...`
                    : feedback.content}
                </p>

                {feedback.screenshot_url && (
                  <div style={{ fontSize: "12px", color: "#007bff" }}>
                    📎 Có đính kèm ảnh
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Detail & Reply */}
        <div>
          <h3>Chi tiết & Phản hồi</h3>

          {selectedFeedback ? (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h4>Thông tin người gửi</h4>
                <p>
                  <strong>Tên:</strong>{" "}
                  {selectedFeedback.user_name || "Không có"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedFeedback.user_email}
                </p>
                <p>
                  <strong>Ngày gửi:</strong>{" "}
                  {new Date(selectedFeedback.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  {getStatusBadge(selectedFeedback.status)}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4>Nội dung phản hồi</h4>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "5px",
                    borderLeft: "4px solid #007bff",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedFeedback.content}
                </div>
              </div>

              {/* PHẦN HIỂN THỊ ẢNH ĐÃ SỬA */}
              {selectedFeedback.screenshot_url && (
                <div style={{ marginBottom: "20px" }}>
                  <h4>📷 Ảnh đính kèm</h4>
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={selectedFeedback.screenshot_url}
                      alt="Screenshot from user"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        window.open(selectedFeedback.screenshot_url, "_blank")
                      }
                    />
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={selectedFeedback.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#007bff",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                      >
                        🔍 Xem ảnh gốc
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedFeedback.admin_reply && (
                <div style={{ marginBottom: "20px" }}>
                  <h4>Phản hồi của bạn</h4>
                  <div
                    style={{
                      background: "#e7f3ff",
                      padding: "15px",
                      borderRadius: "5px",
                      borderLeft: "4px solid #28a745",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedFeedback.admin_reply}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6c757d",
                        marginTop: "10px",
                      }}
                    >
                      Đã gửi lúc:{" "}
                      {new Date(selectedFeedback.replied_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {selectedFeedback.status === "pending" && (
                <div>
                  <h4>Phản hồi lại</h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows="5"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      marginBottom: "10px",
                      resize: "vertical",
                    }}
                  />
                  <button
                    onClick={() => handleReply(selectedFeedback.id)}
                    disabled={replying}
                    style={{
                      padding: "10px 20px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {replying ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed #ddd",
                borderRadius: "8px",
                padding: "40px",
                textAlign: "center",
                color: "#6c757d",
              }}
            >
              Chọn một phản hồi để xem chi tiết và phản hồi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackList;
