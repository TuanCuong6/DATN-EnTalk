// admin/src/components/Layout/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: "20px" }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
