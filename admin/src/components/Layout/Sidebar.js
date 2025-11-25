// admin/src/components/Layout/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Tags,
  Target,
  MessageSquare,
  Mail,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", Icon: LayoutDashboard },
    { path: "/users", label: "Quản lý Users", Icon: Users },
    { path: "/readings", label: "Quản lý Bài đọc", Icon: BookOpen },
    { path: "/topics", label: "Quản lý Chủ đề", Icon: Tags },
    { path: "/records", label: "Lịch sử Luyện tập", Icon: Target },
    { path: "/feedbacks", label: "Quản lý Phản hồi", Icon: MessageSquare },
    { path: "/email-marketing", label: "Email Marketing", Icon: Mail },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-gray-100 h-screen p-5 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">EnTalk Admin</h2>
      <nav>
        <ul className="list-none p-0">
          {menuItems.map((item) => {
            const Icon = item.Icon;
            return (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2.5 rounded no-underline ${
                    isActive(item.path)
                      ? "bg-blue-500 text-white"
                      : "bg-transparent text-black hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
