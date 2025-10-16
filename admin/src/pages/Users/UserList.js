// admin/src/pages/Users/UserList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI } from "../../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Quản lý Users</h1>
        <Link
          to="/users/add"
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
          }}
        >
          Thêm User
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tên</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Level</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Ngày tạo
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.id}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.name}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.email}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {user.level}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                <Link
                  to={`/users/edit/${user.id}`}
                  style={{ marginRight: "10px" }}
                >
                  Sửa
                </Link>
                <button>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
