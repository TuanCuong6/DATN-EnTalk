// admin/src/pages/Records/RecordDetail.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recordsAPI } from "../../services/api";

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecordDetail();
  }, [id]);

  const fetchRecordDetail = async () => {
    try {
      const response = await recordsAPI.getDetail(id);
      setRecord(response.data);
    } catch (error) {
      console.error("Error fetching record detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;
  if (!record) return <div className="p-5">Không tìm thấy bản ghi</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Chi tiết kết quả luyện đọc #{record.id}</h1>
        <button
          onClick={() => navigate("/records")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>

      {/* Thông tin tổng quan */}
      <div className="bg-white rounded shadow p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
          <div>
            <div className="text-sm text-gray-600 mb-1">Người dùng</div>
            <div className="font-semibold">{record.user_name}</div>
            <div className="text-sm text-gray-600">{record.user_email}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Chủ đề</div>
            <div className="font-semibold">
              {record.topic_name || <span className="text-gray-500 italic">Tự nhập</span>}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Ngày luyện</div>
            <div className="font-semibold">
              {new Date(record.created_at).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Điểm số */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Điểm tổng</div>
            <div className="text-2xl font-bold text-blue-600">
              {record.score_overall ? parseFloat(record.score_overall).toFixed(1) : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Phát âm</div>
            <div className="text-2xl font-bold">
              {record.score_pronunciation ? parseFloat(record.score_pronunciation).toFixed(1) : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Lưu loát</div>
            <div className="text-2xl font-bold">
              {record.score_fluency ? parseFloat(record.score_fluency).toFixed(1) : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Ngữ điệu</div>
            <div className="text-2xl font-bold">
              {record.score_intonation ? parseFloat(record.score_intonation).toFixed(1) : 'N/A'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-1">Tốc độ nói</div>
            <div className="text-2xl font-bold">
              {record.score_speed ? parseFloat(record.score_speed).toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Nhận xét AI */}
      {record.comment && (
        <div className="bg-white rounded shadow p-5 mb-4">
          <h2 className="text-lg font-semibold mb-3">Nhận xét từ AI</h2>
          <div className="text-gray-700 whitespace-pre-wrap">{record.comment}</div>
        </div>
      )}

      {/* Nội dung bài đọc */}
      <div className="bg-white rounded shadow p-5 mb-4">
        <h2 className="text-lg font-semibold mb-3">Nội dung bài đọc</h2>
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {record.reading_content || record.custom_text || 'Không có nội dung'}
          </p>
        </div>
      </div>

      {/* Transcript */}
      {record.transcript && (
        <div className="bg-white rounded shadow p-5 mb-4">
          <h2 className="text-lg font-semibold mb-3">Văn bản AI nghe được</h2>
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {record.transcript}
            </p>
          </div>
        </div>
      )}

      {/* Chi tiết feedback */}
      {record.feedbacks && record.feedbacks.length > 0 && (
        <div className="bg-white rounded shadow p-5">
          <h2 className="text-lg font-semibold mb-3">
            Chi tiết phản hồi ({record.feedbacks.length})
          </h2>
          <div className="space-y-3">
            {record.feedbacks.map((feedback, index) => (
              <div key={feedback.id} className="border border-gray-200 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded">
                    #{index + 1}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded">
                    {feedback.error_type}
                  </span>
                </div>
                {feedback.sentence && (
                  <div className="mb-2 text-sm">
                    <span className="text-gray-600">Câu: </span>
                    <span className="italic text-gray-800">"{feedback.sentence}"</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-600">Gợi ý: </span>
                  <span className="text-gray-800">{feedback.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordDetail;
