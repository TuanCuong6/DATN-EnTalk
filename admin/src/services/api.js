// admin/src/services/api.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/admin";

export const adminAPI = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor để thêm token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và redirect đến login
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      // Chỉ redirect nếu không phải trang login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (data) => adminAPI.post("/login", data),
};

export const dashboardAPI = {
  getStats: () => adminAPI.get("/dashboard"),
};

export const usersAPI = {
  getAll: () => adminAPI.get("/users"),
};

export const topicsAPI = {
  getAll: () => adminAPI.get("/topics"),
  create: (data) => adminAPI.post("/topics", data),
  update: (id, data) => adminAPI.put(`/topics/${id}`, data),
  delete: (id) => adminAPI.delete(`/topics/${id}`),
};

export const readingsAPI = {
  getAll: () => adminAPI.get("/readings"),
  create: (data) => adminAPI.post("/readings", data),
  update: (id, data) => adminAPI.put(`/readings/${id}`, data),
  delete: (id) => adminAPI.delete(`/readings/${id}`),
};

export const recordsAPI = {
  getAll: () => adminAPI.get("/records"),
};

//Thêm feedback APIs:
export const feedbacksAPI = {
  getAll: () => adminAPI.get("/feedbacks"),
  reply: (id, data) => adminAPI.post(`/feedbacks/${id}/reply`, data),
};

// Email Marketing APIs
export const emailMarketingAPI = {
  generate: (data) =>
    axios.post("http://localhost:3000/api/email-marketing/generate", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }),
  send: (data) =>
    axios.post("http://localhost:3000/api/email-marketing/send", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }),
  getCampaigns: () =>
    axios.get("http://localhost:3000/api/email-marketing/campaigns", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }),
};
