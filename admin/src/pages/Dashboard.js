// admin/src/pages/Dashboard.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";

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
  const [chartVisible, setChartVisible] = useState(false);
  const [qualityVisible, setQualityVisible] = useState(false);
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
      { threshold: 0.1 }
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
      animateValue(setAnimatedFeedbacks, 0, response.data.pendingFeedbacks, 1800);
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
    if (!score || score === 0) return '#9ca3af'; // gray
    if (score < 4) return '#ef4444'; // red
    if (score < 6) return '#f97316'; // orange
    if (score < 7) return '#eab308'; // yellow
    if (score < 8) return '#84cc16'; // lime
    return '#22c55e'; // green
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
        <div className="text-red-500 p-5 bg-red-50 rounded">
          {error}
        </div>
      </div>
    );
  }

  const maxDailyCount = Math.max(...(stats?.dailyRecords?.map(d => d.count) || [1]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* 5 Cards thống kê với animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div 
          onClick={() => navigate('/users')}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Users</div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">{animatedUsers}</div>
        </div>

        <div 
          onClick={() => navigate('/readings')}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-green-300 animate-fadeIn"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Bài đọc</div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">{animatedReadings}</div>
        </div>

        <div 
          onClick={() => navigate('/records')}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-purple-300 animate-fadeIn"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Luyện tập</div>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">{animatedRecords}</div>
        </div>

        <div 
          onClick={() => navigate('/records')}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-yellow-300 animate-fadeIn"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Điểm TB</div>
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">{animatedScore}</div>
        </div>

        <div 
          onClick={() => navigate('/feedbacks')}
          className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-red-300 animate-fadeIn"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Feedback</div>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-800">{animatedFeedbacks}</div>
          {stats?.pendingFeedbacks > 0 && (
            <div className="text-xs text-red-600 mt-2 font-medium">Cần xử lý</div>
          )}
        </div>
      </div>

      {/* Biểu đồ luyện tập 7 ngày với animation */}
      <div ref={chartRef} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Luyện tập 7 ngày qua</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-3 border-r" style={{ height: '192px' }}>
            <div>{maxDailyCount}</div>
            <div>{Math.round(maxDailyCount * 0.75)}</div>
            <div>{Math.round(maxDailyCount * 0.5)}</div>
            <div>{Math.round(maxDailyCount * 0.25)}</div>
            <div>0</div>
          </div>
          
          <div className="flex-1">
            <div className="relative border-b border-gray-300" style={{ height: '192px' }}>
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3" style={{ height: '100%' }}>
                {(() => {
                  const last7Days = [];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const dayData = stats?.dailyRecords?.find(d => {
                      const recordDate = new Date(d.date);
                      recordDate.setHours(0, 0, 0, 0);
                      return recordDate.getTime() === date.getTime();
                    });
                    
                    last7Days.push({
                      date: date,
                      count: dayData ? dayData.count : 0
                    });
                  }
                  
                  return last7Days.map((day, index) => {
                    const heightPx = maxDailyCount > 0 && day.count > 0 
                      ? Math.max((day.count / maxDailyCount) * 192, 10) 
                      : 3;
                    
                    return (
                      <div key={index} className="flex-1 relative group">
                        <div 
                          className="w-full rounded-t transition-all duration-1000 ease-out" 
                          style={{ 
                            height: chartVisible ? `${heightPx}px` : '0px',
                            backgroundColor: day.count > 0 ? '#3b82f6' : '#e5e7eb',
                            transitionDelay: `${index * 100}ms`
                          }}
                        >
                          {day.count > 0 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {day.count} bài
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            
            <div className="flex justify-between gap-3 mt-3">
              {(() => {
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  last7Days.push(date);
                }
                
                return last7Days.map((date, index) => {
                  const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
                  return (
                    <div key={index} className="flex-1 text-center">
                      <div className="text-xs text-gray-600 font-medium">{dayName}</div>
                      <div className="text-xs text-gray-400">{date.getDate()}/{date.getMonth() + 1}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê chất lượng với màu động */}
      <div ref={qualityRef} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Chất lượng luyện tập trung bình</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Phát âm', value: stats?.qualityStats?.pronunciation, delay: 0 },
            { label: 'Lưu loát', value: stats?.qualityStats?.fluency, delay: 200 },
            { label: 'Ngữ điệu', value: stats?.qualityStats?.intonation, delay: 400 },
            { label: 'Tốc độ nói', value: stats?.qualityStats?.speed, delay: 600 }
          ].map((item, idx) => {
            const score = parseFloat(item.value) || 0;
            const color = getScoreColor(score);
            const progress = qualityVisible ? (score / 10) : 0;
            
            return (
              <div key={idx} className="flex flex-col items-center" style={{ 
                opacity: qualityVisible ? 1 : 0,
                transform: qualityVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ease-out ${item.delay}ms`
              }}>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle
                      cx="48" cy="48" r="40" stroke={color} strokeWidth="8" fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
                      strokeLinecap="round"
                      style={{ 
                        transition: `stroke-dashoffset 1s ease-out ${item.delay}ms, stroke 0.3s ease-out`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">
                      {qualityVisible ? score : 0}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hai cột: Hoạt động gần đây & Top Users với fade in */}
      <div ref={activitiesRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
             style={{
               opacity: activitiesVisible ? 1 : 0,
               transform: activitiesVisible ? 'translateX(0)' : 'translateX(-20px)',
               transition: 'all 0.6s ease-out'
             }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Hoạt động gần đây</h2>
          </div>
          <div className="space-y-3">
            {stats?.recentActivities?.map((activity, idx) => (
              <div 
                key={activity.id} 
                className="border-b pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors"
                onClick={() => navigate(`/records/${activity.id}`)}
                style={{
                  opacity: activitiesVisible ? 1 : 0,
                  transform: activitiesVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.4s ease-out ${idx * 100}ms`
                }}
              >
                <div className="font-medium text-gray-800">{activity.user_name}</div>
                <div className="text-sm text-gray-600">
                  {activity.topic_name || <span className="italic">Tự nhập</span>}
                  {' • '}
                  Điểm: <span className="font-semibold">{activity.score_overall ? parseFloat(activity.score_overall).toFixed(1) : 'N/A'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
             style={{
               opacity: activitiesVisible ? 1 : 0,
               transform: activitiesVisible ? 'translateX(0)' : 'translateX(20px)',
               transition: 'all 0.6s ease-out 0.2s'
             }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Top 3 Users tích cực nhất</h2>
          </div>
          <div className="space-y-4">
            {stats?.topUsers?.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                   style={{
                     opacity: activitiesVisible ? 1 : 0,
                     transform: activitiesVisible ? 'scale(1)' : 'scale(0.9)',
                     transition: `all 0.4s ease-out ${(index + 1) * 150}ms`
                   }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                     style={{
                       backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#e5e7eb' : '#fed7aa',
                       color: index === 0 ? '#92400e' : index === 1 ? '#374151' : '#9a3412'
                     }}>
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
