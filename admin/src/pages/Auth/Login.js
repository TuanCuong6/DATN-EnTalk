// admin/src/pages/Auth/Login.js
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import logoEntalk from "../../assets/img/logo_entalk.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { token, admin } = response.data;

      login(token, admin);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex w-4/5 max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Logo & Branding */}
        <div className="w-1/2 flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-12">
          <img
            src={logoEntalk}
            alt="EnTalk Logo"
            className="w-48 h-48 object-contain mb-6"
          />
          <h1 className="text-3xl font-bold mb-3">EnTalk</h1>
          <p className="text-lg text-blue-100 text-center">
            Học tiếng Anh thông minh
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 flex flex-col justify-center p-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập Admin</h2>
            <p className="text-gray-600 text-sm">Quản lý hệ thống</p>
          </div>

          {error && (
            <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            © 2025 EnTalk. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
