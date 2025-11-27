// admin/src/pages/Users/UserList.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI, adminAPI } from "../../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Lọc và tìm kiếm
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.is_active) ||
                         (statusFilter === "inactive" && !user.is_active);
    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

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
        <h1 className="text-2xl font-bold">Quản lý Users ({filteredUsers.length})</h1>
        <Link
          to="/users/add"
          className="px-4 py-2 bg-blue-500 text-white no-underline rounded hover:bg-blue-600"
        >
          Thêm User
        </Link>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Avatar</th>
              <th className="p-3 border border-gray-300 text-left">Tên</th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-left">Trạng thái</th>
              <th className="p-3 border border-gray-300 text-left">Streak</th>
              <th className="p-3 border border-gray-300 text-left">Ngày tạo</th>
              <th className="p-3 border border-gray-300 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-300">{user.id}</td>
                <td className="p-3 border border-gray-300">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </td>
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

        {paginatedUsers.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <p>Không tìm thấy user nào</p>
          </div>
        )}
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4">
        <div></div>
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {(() => {
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);
              
              if (currentPage <= 3) {
                endPage = Math.min(5, totalPages);
              }
              if (currentPage > totalPages - 3) {
                startPage = Math.max(1, totalPages - 4);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
        <div className="text-sm">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10/trang</option>
            <option value={20}>20/trang</option>
            <option value={50}>50/trang</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserList;
