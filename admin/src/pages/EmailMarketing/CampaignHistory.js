// admin/src/pages/EmailMarketing/CampaignHistory.js
import React, { useState, useEffect } from "react";
import { emailMarketingAPI } from "../../services/api";
import { BarChart3, RefreshCw, Loader } from "lucide-react";

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
