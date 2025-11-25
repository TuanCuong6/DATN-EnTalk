// admin/src/pages/Users/UserList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI, adminAPI } from "../../services/api";

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

  const handleToggleActive = async (userId, currentStatus) => {
    const action = currentStatus ? "vô hiệu hóa" : "kích hoạt";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) {
      return;
    }

    try {
      await adminAPI.put(`/users/${userId}/toggle-active`);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const getStatusText = (isActive) => {
    if (isActive) {
      return <span className="text-green-600">Hoạt động</span>;
    }
    return <span className="text-red-600">Vô hiệu hóa</span>;
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Quản lý Users ({users.length})</h1>
        <Link
          to="/users/add"
          className="px-4 py-2 bg-blue-500 text-white no-underline rounded hover:bg-blue-600"
        >
          Thêm User
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Tên</th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-left">Trạng thái</th>
              <th className="p-3 border border-gray-300 text-left">Streak</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{user.id}</td>
                <td className="p-3 border border-gray-300">{user.name}</td>
                <td className="p-3 border border-gray-300">{user.email}</td>
                <td className="p-3 border border-gray-300">
                  {getStatusText(user.is_active)}
                </td>
                <td className="p-3 border border-gray-300">
                  {user.current_streak || 0}
                </td>
                <td className="p-3 border border-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 border border-gray-300">
                  <Link
                    to={`/users/edit/${user.id}`}
                    className="text-blue-500 hover:underline mr-3"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`${
                      user.is_active
                        ? "text-red-500 hover:underline"
                        : "text-green-500 hover:underline"
                    }`}
                  >
                    {user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
