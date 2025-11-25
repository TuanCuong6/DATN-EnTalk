// admin/src/components/Layout/Header.js
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { admin, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-64 bg-white px-5 py-4 border-b border-gray-300 flex justify-between items-center z-10">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <span>Xin chào, {admin?.username}</span>
        <button 
          onClick={logout} 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;
