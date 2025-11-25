// admin/src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="text-red-500 p-5 bg-red-50 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg mb-2">Tổng Users</h3>
          <p className="text-3xl font-bold">
            {stats?.totalUsers ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg mb-2">Tổng Bài đọc</h3>
          <p className="text-3xl font-bold">
            {stats?.totalReadings ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg mb-2">Tổng Luyện tập</h3>
          <p className="text-3xl font-bold">
            {stats?.totalRecords ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg mb-2">Điểm TB</h3>
          <p className="text-3xl font-bold">
            {stats?.avgScore ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
