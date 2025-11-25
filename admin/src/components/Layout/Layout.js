// admin/src/components/Layout/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="mt-16 p-5 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
