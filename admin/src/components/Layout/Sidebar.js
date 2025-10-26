// admin/src/components/Layout/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/users", label: "Quản lý Users", icon: "👥" },
    { path: "/readings", label: "Quản lý Bài đọc", icon: "📖" },
    { path: "/topics", label: "Quản lý Chủ đề", icon: "🏷️" },
    { path: "/records", label: "Lịch sử Luyện tập", icon: "🎯" },
    // THÊM MENU PHẢN HỒI Ở ĐÂY
    { path: "/feedbacks", label: "Quản lý Phản hồi", icon: "💬" },
  ];

  return (
    <div
      style={{
        width: "250px",
        background: "#f8f9fa",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h2>EnTalk Admin</h2>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ marginBottom: "10px" }}>
              <Link
                to={item.path}
                style={{
                  display: "block",
                  padding: "10px",
                  background:
                    location.pathname === item.path ? "#007bff" : "transparent",
                  color: location.pathname === item.path ? "white" : "black",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                <span style={{ marginRight: "10px" }}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
