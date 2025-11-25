// admin/src/pages/Users/UserAdd.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserAdd = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    level: "A1",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Note: Backend chưa có API tạo user từ admin
    // Cần thêm API trong backend trước
    alert("Chức năng đang phát triển - Cần thêm API tạo user từ admin");

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Thêm User mới</h1>

      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Tên *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Level</label>
          <select
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : "Tạo User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-5 py-2 bg-gray-500 text-white border-none rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAdd;
