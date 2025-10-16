// admin/src/components/Layout/Header.js
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { admin, logout } = useAuth();

  return (
    <header
      style={{
        background: "white",
        padding: "15px 20px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>Admin Panel</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span>Xin chào, {admin?.username}</span>
        <button onClick={logout} style={{ padding: "5px 10px" }}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;
