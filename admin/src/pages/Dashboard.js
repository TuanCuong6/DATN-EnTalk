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

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <div
          style={{
            color: "red",
            padding: "20px",
            background: "#ffeaea",
            borderRadius: "5px",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Tổng Users</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stats?.totalUsers ?? 0}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Tổng Bài đọc</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stats?.totalReadings ?? 0}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Tổng Luyện tập</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stats?.totalRecords ?? 0}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Điểm TB</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {stats?.avgScore ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
