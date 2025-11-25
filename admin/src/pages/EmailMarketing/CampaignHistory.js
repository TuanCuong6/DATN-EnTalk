// admin/src/pages/EmailMarketing/CampaignHistory.js
import React, { useState, useEffect } from "react";
import { emailMarketingAPI } from "../../services/api";
import { BarChart3, RefreshCw, Loader, Eye, X } from "lucide-react";

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    campaign: null,
    loading: false,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await emailMarketingAPI.getCampaigns();
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      alert("Lỗi khi tải lịch sử campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (campaignId) => {
    console.log("Fetching campaign detail for ID:", campaignId);
    setPreviewModal({ isOpen: true, campaign: null, loading: true });
    try {
      const response = await emailMarketingAPI.getCampaignDetail(campaignId);
      console.log("Campaign detail response:", response.data);
      setPreviewModal({
        isOpen: true,
        campaign: response.data.campaign,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching campaign detail:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
      alert(`Lỗi khi tải chi tiết email: ${errorMsg}`);
      setPreviewModal({ isOpen: false, campaign: null, loading: false });
    }
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, campaign: null, loading: false });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      sending: { text: "Đang gửi", class: "bg-blue-100 text-blue-800" },
      completed: { text: "Hoàn thành", class: "bg-green-100 text-green-800" },
      failed: { text: "Thất bại", class: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.sending;
    return (
      <span className={`px-2 py-1 rounded text-sm ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="p-5 flex items-center gap-2">
        <Loader size={18} className="animate-spin" />
        Đang tải...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={28} />
          Lịch sử Email Marketing ({campaigns.length})
        </h1>
        <button 
          onClick={fetchCampaigns} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white p-10 rounded shadow text-center text-gray-500">
          <p>Chưa có campaign nào được gửi</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border border-gray-300 text-left">ID</th>
                <th className="p-3 border border-gray-300 text-left">Tiêu đề</th>
                <th className="p-3 border border-gray-300 text-left">Subject</th>
                <th className="p-3 border border-gray-300 text-left">Tổng người nhận</th>
                <th className="p-3 border border-gray-300 text-left">Đã gửi</th>
                <th className="p-3 border border-gray-300 text-left">Thất bại</th>
                <th className="p-3 border border-gray-300 text-left">Trạng thái</th>
                <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
                <th className="p-3 border border-gray-300 text-left">Hoàn thành</th>
                <th className="p-3 border border-gray-300 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-300">{campaign.campaign_id}</td>
                  <td className="p-3 border border-gray-300 font-medium">{campaign.title}</td>
                  <td className="p-3 border border-gray-300">{campaign.subject}</td>
                  <td className="p-3 border border-gray-300">{campaign.total_recipients}</td>
                  <td className="p-3 border border-gray-300 text-green-600">{campaign.sent_count}</td>
                  <td className="p-3 border border-gray-300 text-red-600">{campaign.failed_count}</td>
                  <td className="p-3 border border-gray-300">{getStatusBadge(campaign.status)}</td>
                  <td className="p-3 border border-gray-300">{formatDate(campaign.created_at)}</td>
                  <td className="p-3 border border-gray-300">{formatDate(campaign.completed_at)}</td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => handlePreview(campaign.campaign_id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                      title="Xem email"
                    >
                      <Eye size={16} />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  {previewModal.loading ? "Đang tải..." : "Xem lại Email"}
                </h2>
                {previewModal.campaign && (
                  <p className="text-sm text-gray-600 mt-1">
                    {previewModal.campaign.title} - {previewModal.campaign.subject}
                  </p>
                )}
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Đóng"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {previewModal.loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader size={32} className="animate-spin text-blue-500" />
                </div>
              ) : previewModal.campaign ? (
                <div className="border rounded">
                  <iframe
                    srcDoc={previewModal.campaign.html_content}
                    title="Email Preview"
                    className="w-full h-[600px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  Không có nội dung để hiển thị
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
