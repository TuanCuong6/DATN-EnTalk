// admin/src/pages/Dashboard.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Animation states
  const [animatedUsers, setAnimatedUsers] = useState(0);
  const [animatedReadings, setAnimatedReadings] = useState(0);
  const [animatedRecords, setAnimatedRecords] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedFeedbacks, setAnimatedFeedbacks] = useState(0);
  const [chartVisible, setChartVisible] = useState(true); // Hiển thị ngay
  const [qualityVisible, setQualityVisible] = useState(true); // Hiển thị ngay
  const [activitiesVisible, setActivitiesVisible] = useState(false);

  const chartRef = useRef(null);
  const qualityRef = useRef(null);
  const activitiesRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === chartRef.current && entry.isIntersecting) {
            setChartVisible(true);
          }
          if (entry.target === qualityRef.current && entry.isIntersecting) {
            setQualityVisible(true);
          }
          if (entry.target === activitiesRef.current && entry.isIntersecting) {
            setActivitiesVisible(true);
          }
        });
      },
      { threshold: 0.01 } // Giảm từ 0.1 xuống 0.01 để hiển thị sớm hơn
    );

    if (chartRef.current) observer.observe(chartRef.current);
    if (qualityRef.current) observer.observe(qualityRef.current);
    if (activitiesRef.current) observer.observe(activitiesRef.current);

    return () => observer.disconnect();
  }, [stats]);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);

      // Animate numbers
      animateValue(setAnimatedUsers, 0, response.data.totalUsers, 1000);
      animateValue(setAnimatedReadings, 0, response.data.totalReadings, 1200);
      animateValue(setAnimatedRecords, 0, response.data.totalRecords, 1400);
      animateValue(setAnimatedScore, 0, response.data.avgScore, 1600, true);
      animateValue(
        setAnimatedFeedbacks,
        0,
        response.data.pendingFeedbacks,
        1800
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const animateValue = (setter, start, end, duration, isDecimal = false) => {
    const startTime = Date.now();
    const endValue = parseFloat(end) || 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (endValue - start) * easeOutQuart;

      setter(isDecimal ? current.toFixed(2) : Math.floor(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const getScoreColor = (score) => {
    if (!score || score === 0) return "#9ca3af";
    if (score < 4) return "#ef4444";
    if (score < 6) return "#f97316";
    if (score < 7) return "#eab308";
    if (score < 8) return "#84cc16";
    return "#22c55e";
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  if (loading) return <div className="p-5">Đang tải...</div>;

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="text-red-500 p-5 bg-red-50 rounded">{error}</div>
      </div>
    );
  }

  const maxDailyCount = Math.max(
    ...(stats?.dailyRecords?.map((d) => d.count) || [1])
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* 5 Cards thống kê với animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div
          onClick={() => navigate("/users")}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Users</div>
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {animatedUsers}
          </div>
        </div>

        <div
          onClick={() => navigate("/readings")}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-green-300 animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Bài đọc</div>
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {animatedReadings}
          </div>
        </div>

        <div
          onClick={() => navigate("/records")}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-purple-300 animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Luyện tập</div>
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {animatedRecords}
          </div>
        </div>

        <div
          onClick={() => navigate("/records")}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-yellow-300 animate-fadeIn"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Điểm TB</div>
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {animatedScore}
          </div>
        </div>

        <div
          onClick={() => navigate("/feedbacks")}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-red-300 animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Feedback</div>
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {animatedFeedbacks}
          </div>
          {stats?.pendingFeedbacks > 0 && (
            <div className="text-xs text-red-600 mt-2 font-medium">
              Cần xử lý
            </div>
          )}
        </div>
      </div>

      {/* Biểu đồ luyện tập 7 ngày - Recharts */}
      <div
        ref={chartRef}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">
            Luyện tập 7 ngày qua
          </h2>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={(() => {
              const last7Days = [];
              for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const dayData = stats?.dailyRecords?.find((d) => {
                  const recordDate = new Date(d.date);
                  recordDate.setHours(0, 0, 0, 0);
                  return recordDate.getTime() === date.getTime();
                });

                const dayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
                  date.getDay()
                ];

                last7Days.push({
                  name: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`,
                  count: dayData ? dayData.count : 0,
                });
              }
              return last7Days;
            })()}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value) => [`${value} bài`, 'Số lượng']}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6" 
              radius={[8, 8, 0, 0]}
              animationDuration={300}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Layout 2 cột: Trái (Phân bổ điểm + Top Users) | Phải (Hoạt động gần đây) */}
      <div
        ref={activitiesRef}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* CỘT TRÁI: Phân bổ điểm số + Top Users */}
        <div className="space-y-6">
          {/* Biểu đồ phân bổ điểm số */}
          <div
            ref={qualityRef}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            style={{
              opacity: activitiesVisible ? 1 : 0,
              transform: activitiesVisible
                ? "translateX(0)"
                : "translateX(-20px)",
              transition: "all 0.6s ease-out",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">
                Phân bổ điểm số
              </h2>
            </div>
            
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Tốt",
                        value: stats?.scoreDistribution?.excellent || 0,
                        percent: stats?.scoreDistribution?.excellentPercent || 0,
                      },
                      {
                        name: "Khá",
                        value: stats?.scoreDistribution?.good || 0,
                        percent: stats?.scoreDistribution?.goodPercent || 0,
                      },
                      {
                        name: "Trung bình",
                        value: stats?.scoreDistribution?.average || 0,
                        percent: stats?.scoreDistribution?.averagePercent || 0,
                      },
                      {
                        name: "Kém",
                        value: stats?.scoreDistribution?.poor || 0,
                        percent: stats?.scoreDistribution?.poorPercent || 0,
                      },
                    ].filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={300}
                    animationEasing="ease-out"
                  >
                    {[
                      "#22c55e", // Tốt - xanh lá
                      "#3b82f6", // Khá - xanh dương
                      "#eab308", // TB - vàng
                      "#ef4444", // Kém - đỏ
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{
                      color: "#374151",
                    }}
                    labelStyle={{
                      color: "#111827",
                      fontWeight: "600",
                    }}
                    formatter={(value, name, props) => [
                      `${value} bài (${props.payload.percent}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chú thích 2x2 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "Tốt", range: "8-10 điểm", color: "#22c55e", count: stats?.scoreDistribution?.excellent || 0, percent: stats?.scoreDistribution?.excellentPercent || 0 },
                { label: "Khá", range: "6-8 điểm", color: "#3b82f6", count: stats?.scoreDistribution?.good || 0, percent: stats?.scoreDistribution?.goodPercent || 0 },
                { label: "Trung bình", range: "4-6 điểm", color: "#eab308", count: stats?.scoreDistribution?.average || 0, percent: stats?.scoreDistribution?.averagePercent || 0 },
                { label: "Kém", range: "<4 điểm", color: "#ef4444", count: stats?.scoreDistribution?.poor || 0, percent: stats?.scoreDistribution?.poorPercent || 0 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">{item.label}</span>
                    <span className="text-gray-500">: {item.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Users */}
          <div
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
            style={{
              opacity: activitiesVisible ? 1 : 0,
              transform: activitiesVisible
                ? "translateX(0)"
                : "translateX(-20px)",
              transition: "all 0.6s ease-out 0.2s",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">
                Top 3 Users tích cực nhất
              </h2>
            </div>
            <div className="space-y-4">
              {stats?.topUsers?.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  style={{
                    opacity: activitiesVisible ? 1 : 0,
                    transform: activitiesVisible ? "scale(1)" : "scale(0.9)",
                    transition: `all 0.4s ease-out ${(index + 1) * 150 + 200}ms`,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{
                      backgroundColor:
                        index === 0
                          ? "#fef3c7"
                          : index === 1
                          ? "#e5e7eb"
                          : "#fed7aa",
                      color:
                        index === 0
                          ? "#92400e"
                          : index === 1
                          ? "#374151"
                          : "#9a3412",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.total_records} bài • Điểm TB: {user.avg_score}
                      {user.streak > 0 && <> • Streak: {user.streak}</>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Hoạt động gần đây */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
          style={{
            opacity: activitiesVisible ? 1 : 0,
            transform: activitiesVisible ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.6s ease-out 0.3s",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">
              Hoạt động gần đây
            </h2>
          </div>
          <div className="space-y-3">
            {stats?.recentActivities?.map((activity, idx) => (
              <div
                key={activity.id}
                className="border-b pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors"
                onClick={() => navigate(`/records/${activity.id}`)}
                style={{
                  opacity: activitiesVisible ? 1 : 0,
                  transform: activitiesVisible
                    ? "translateY(0)"
                    : "translateY(10px)",
                  transition: `all 0.4s ease-out ${idx * 100 + 300}ms`,
                }}
              >
                <div className="font-medium text-gray-800">
                  {activity.user_name}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.topic_name || (
                    <span className="italic">Tự nhập</span>
                  )}
                  {" • "}
                  Điểm:{" "}
                  <span className="font-semibold">
                    {activity.score_overall
                      ? parseFloat(activity.score_overall).toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
