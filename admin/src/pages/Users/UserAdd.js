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
      <h1>Thêm User mới</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Tên *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Level</label>
          <select
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            style={{ width: "100%", padding: "8px", border: "1px solid #ddd" }}
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            {loading ? "Đang tạo..." : "Tạo User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAdd;
