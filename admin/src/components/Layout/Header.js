// admin/src/components/Layout/Header.js
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { admin, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-64 bg-white px-5 py-4 border-b border-gray-300 flex justify-between items-center z-10">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Xin chào,</span>
          <div className="flex items-center gap-1.5">
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-700">{admin?.username}</span>
          </div>
        </div>
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
